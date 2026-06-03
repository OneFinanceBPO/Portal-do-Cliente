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
from validador import validar_cliente_completo
from exportador import extrair_extrato_cliente
from banco import conectar, listar_empresas_do_portal, salvar_extrato, iniciar_log_execucao, registrar_log_cliente, finalizar_log_execucao
from notificador import enviar_relatorio


def run_agente(debug=False, modo_teste=False, filtro_cliente=None, sem_email=False):
    inicio = datetime.now()
    log.info("─" * 45)
    log.info(f"Agente iniciado: {inicio.strftime('%H:%M:%S')}")
    log.info("─" * 45)

    supabase = conectar()
    empresas_portal = listar_empresas_do_portal(supabase)

    playwright, browser, page = iniciar_navegador(headless=not debug)

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

    try:
        fazer_login(page)
        clientes_hub = listar_clientes_do_hub(page)

        # Aplica filtro de cliente específico (--cliente)
        if filtro_cliente:
            clientes_hub = [c for c in clientes_hub if filtro_cliente.upper() in c["nome"].upper()]
            log.info(f"Filtro ativo: rodando apenas clientes que contenham '{filtro_cliente}'")

        # Aplica limite de teste (--teste)
        if modo_teste and clientes_hub:
            clientes_hub = clientes_hub[:1]
            log.info("Modo teste: processando apenas 1 cliente")

        resultado["total_hub"] = len(clientes_hub)
        execucao_id = iniciar_log_execucao(supabase, len(clientes_hub), len(empresas_portal))

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
                registrar_log_cliente(supabase, execucao_id, nome, cnpj_hub, "erro", motivo, 0)
                resultado["erros"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_hub, "status": "erro", "motivo": motivo, "registros": 0})
                continue

            validacao = validar_cliente_completo(page_ca, supabase, nome, cnpj_hub)

            if not validacao["valido"]:
                log.info(validacao["motivo"])
                registrar_log_cliente(supabase, execucao_id, nome, cnpj_hub, "pulado", validacao["motivo"], 0)
                resultado["pulados"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_hub, "status": "pulado", "motivo": validacao["motivo"], "registros": 0})
                voltar_para_hub(page_ca, page)
                continue

            log.info("✓ Identidade confirmada | ✓ Cadastrado no portal")
            cnpj_confirmado = validacao["cnpj_confirmado"]
            empresa_id = validacao["empresa_id"]
            nome_confirmado = validacao["nome_confirmado"]

            df = extrair_extrato_cliente(page_ca, nome_confirmado, cnpj_confirmado, empresa_id)

            if df is None:
                motivo = "ERRO: falha na extração do extrato"
                log.info(motivo)
                registrar_log_cliente(supabase, execucao_id, nome, cnpj_confirmado, "erro", motivo, 0)
                resultado["erros"] += 1
                resultado["detalhes"].append({"nome": nome, "cnpj": cnpj_confirmado, "status": "erro", "motivo": motivo, "registros": 0})
                voltar_para_hub(page_ca, page)
                continue

            registros_salvos = salvar_extrato(supabase, df)
            log.info(f"✓ {registros_salvos} registros salvos")
            registrar_log_cliente(supabase, execucao_id, nome, cnpj_confirmado, "ok", "OK", registros_salvos)
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
            finalizar_log_execucao(supabase, execucao_id, resultado["ok"], resultado["erros"], resultado["pulados"], status_final)

        log.info("─" * 45)
        log.info(f"Concluído: {fim.strftime('%H:%M:%S')} | OK: {resultado['ok']} | Pulados: {resultado['pulados']} | Erros: {resultado['erros']}")
        log.info("─" * 45)

        if not sem_email:
            enviar_relatorio(resultado)

        browser.close()
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
