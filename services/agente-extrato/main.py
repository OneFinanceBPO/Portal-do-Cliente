"""
Agente de Extrato de Movimentações — One Finance BPO Financeiro
Extrai extratos do Conta Azul Mais e salva no Supabase.
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuração de logging
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler("logs/execucoes.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

from navegador import iniciar_navegador, fazer_login, listar_clientes_do_hub, entrar_no_cliente, voltar_para_hub
from exportador import extrair_extrato_cliente
from banco import conectar, listar_empresas_do_portal, verificar_empresa_no_portal, salvar_extrato, iniciar_log_execucao, registrar_log_cliente, finalizar_log_execucao
from notificador import enviar_relatorio


def run_agente(debug=False, modo_teste=False, filtro_cliente=None, sem_email=False):
    inicio = datetime.now()
    log.info("─" * 45)
    log.info(f"Agente iniciado: {inicio.strftime('%H:%M:%S')}")
    log.info("─" * 45)

    conn = conectar()
    empresas_portal = listar_empresas_do_portal(conn)

    resultado = {
        "total_hub": 0,
        "total_portal": len(empresas_portal),
        "ok": 0,
        "erros": 0,
        "pulados": 0,
        "tempo_total": "",
        "detalhes": [],
    }

    execucao_id = None
    playwright = None
    browser = None

    try:
        log.info("Iniciando navegador...")
        playwright, browser, page = iniciar_navegador(headless=not debug)
        log.info("Navegador iniciado com sucesso")
        fazer_login(page)
        # Passa os CNPJs do portal → busca diretamente por cada cliente, sem paginar tudo
        clientes_hub = listar_clientes_do_hub(page, cnpjs_portal=empresas_portal)

        # Aplica filtro de cliente específico (--cliente) por nome, sobre o resultado
        if filtro_cliente:
            clientes_hub = [c for c in clientes_hub if filtro_cliente.upper() in c["nome"].upper()]
            log.info(f"Filtro ativo: rodando apenas clientes que contenham '{filtro_cliente}'")

        # Aplica limite de teste (--teste)
        if modo_teste and clientes_hub:
            clientes_hub = clientes_hub[:1]
            log.info("Modo teste: processando apenas 1 cliente")

        resultado["total_hub"] = len(clientes_hub)
        execucao_id = iniciar_log_execucao(conn, len(clientes_hub), len(empresas_portal))

        log.info(f"Hub: {len(clientes_hub)} clientes com CA Pro Full")
        log.info("─" * 45)

        for i, cliente in enumerate(clientes_hub, 1):
            nome = cliente["nome"]
            cnpj_hub = cliente.get("cnpj", "--")
            log.info(f"─── Cliente {i}/{len(clientes_hub)}: {nome} ───")

            page_ca = entrar_no_cliente(page, nome)
            if page_ca is None:
                motivo = "ERRO: não foi possível entrar no CA Pro"
                log.info(motivo)
                registrar_log_cliente(conn, execucao_id, nome, cnpj_hub, "erro", motivo, 0)
                resultado["erros"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_hub, "status": "erro", "motivo": motivo, "registros": 0})
                continue

            # Condições 1, 2 e 3 já garantidas pela nova busca por CNPJ do portal:
            # - Condição 1 (CA Pro): verificado em listar_clientes_do_hub
            # - Condição 2 (identidade): buscamos por CNPJ exato do portal
            # - Condição 3 (cadastro): só processamos CNPJs vindos do portal
            resultado_portal = verificar_empresa_no_portal(conn, cnpj_hub)
            if not resultado_portal["encontrado"] or not resultado_portal["ativo"]:
                motivo = f"PULADO: CNPJ {cnpj_hub} não ativo no portal"
                log.info(motivo)
                registrar_log_cliente(conn, execucao_id, nome, cnpj_hub, "pulado", motivo, 0)
                resultado["pulados"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_hub, "status": "pulado", "motivo": motivo, "registros": 0})
                voltar_para_hub(page_ca, page)
                continue

            log.info("✓ CA Pro ativo | ✓ CNPJ confirmado | ✓ Cadastrado no portal")
            cnpj_confirmado = cnpj_hub
            empresa_id = resultado_portal["empresa_id"]
            nome_confirmado = nome

            df = extrair_extrato_cliente(page_ca, nome_confirmado, cnpj_confirmado, empresa_id)

            if df is None:
                motivo = "ERRO: falha na extração do extrato"
                log.info(motivo)
                registrar_log_cliente(conn, execucao_id, nome, cnpj_confirmado, "erro", motivo, 0)
                resultado["erros"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_confirmado, "status": "erro", "motivo": motivo, "registros": 0})
                voltar_para_hub(page_ca, page)
                continue

            registros_salvos = salvar_extrato(conn, df)
            log.info(f"✓ {registros_salvos} registros salvos")
            registrar_log_cliente(conn, execucao_id, nome, cnpj_confirmado, "ok", "OK", registros_salvos)
            resultado["ok"] += 1
            resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_confirmado, "status": "ok", "motivo": "OK", "registros": registros_salvos})

            import time
            time.sleep(5)
            voltar_para_hub(page_ca, page)

    except Exception as e:
        log.error(f"ERRO CRÍTICO: {e}", exc_info=True)
    finally:
        fim = datetime.now()
        tempo = fim - inicio
        minutos = int(tempo.total_seconds() // 60)
        segundos = int(tempo.total_seconds() % 60)
        resultado["tempo_total"] = f"{minutos} minutos e {segundos} segundos"

        if execucao_id:
            status_final = "concluido_com_erros" if resultado["erros"] > 0 else "concluido"
            finalizar_log_execucao(conn, execucao_id, resultado["ok"], resultado["erros"], resultado["pulados"], status_final)

        log.info("─" * 45)
        log.info(f"Concluído: {fim.strftime('%H:%M:%S')} | OK: {resultado['ok']} | Pulados: {resultado['pulados']} | Erros: {resultado['erros']}")
        log.info("─" * 45)

        if not sem_email:
            enviar_relatorio(resultado)

        if browser:
            browser.close()
        if playwright:
            playwright.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agente de Extrato — One Finance")
    parser.add_argument("--debug", action="store_true", help="Abre o navegador visível")
    parser.add_argument("--teste", action="store_true", help="Roda apenas 1 cliente")
    parser.add_argument("--cliente", type=str, default=None, help="Nome do cliente específico")
    parser.add_argument("--sem-email", action="store_true", help="Não envia e-mail ao final")
    args = parser.parse_args()

    run_agente(
        debug=args.debug,
        modo_teste=args.teste,
        filtro_cliente=args.cliente,
        sem_email=args.sem_email,
    )
