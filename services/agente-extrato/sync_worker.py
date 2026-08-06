import os
import sys
import logging
from dotenv import load_dotenv

load_dotenv()

os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [sync] %(message)s",
    datefmt="%H:%M:%S",
    handlers=[
        logging.FileHandler("logs/execucoes.log", encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

from lock import adquirir_lock, liberar_lock
from banco import conectar, salvar_extrato
from fila_sync import criar_tabela_sync, proxima_pendente, devolver_para_pendente, marcar_concluida, marcar_erro
from navegador import iniciar_navegador, fazer_login, listar_clientes_do_hub, entrar_no_cliente, voltar_para_hub
from exportador import extrair_extrato_cliente


def main():
    conn = conectar()
    criar_tabela_sync(conn)

    solicitacao = proxima_pendente(conn)
    if not solicitacao:
        conn.close()
        return  # nada pendente — sai rápido, sem tocar no navegador

    log.info(f"Sincronização sob demanda: {solicitacao['nome']} (CNPJ {solicitacao['cnpj']})")

    if not adquirir_lock():
        log.warning("Já existe uma execução do agente em andamento (main.py ou outro sync) — devolvendo à fila")
        devolver_para_pendente(conn, solicitacao["id"])
        conn.close()
        return

    playwright = browser = None
    try:
        playwright, browser, page = iniciar_navegador(headless=True)
        fazer_login(page)

        clientes = listar_clientes_do_hub(page, cnpjs_portal=[solicitacao["cnpj"]])
        if not clientes:
            raise Exception(f"Cliente com CNPJ {solicitacao['cnpj']} não encontrado no hub (ou sem CA Pro)")

        nome_hub = clientes[0]["nome"]
        page_ca = entrar_no_cliente(page, nome_hub)
        if page_ca is None:
            raise Exception("Não foi possível entrar no CA Pro do cliente")

        df = extrair_extrato_cliente(page_ca, nome_hub, solicitacao["cnpj"], solicitacao["empresa_id"])
        if df is None:
            raise Exception("Falha na extração do extrato")

        registros = salvar_extrato(conn, df)
        marcar_concluida(conn, solicitacao["id"], registros)
        log.info(f"Sincronização concluída: {registros} registro(s) salvos")

        voltar_para_hub(page_ca, page)

    except Exception as e:
        log.error(f"Erro na sincronização sob demanda: {e}", exc_info=True)
        marcar_erro(conn, solicitacao["id"], str(e))
    finally:
        if browser:
            browser.close()
        if playwright:
            playwright.stop()
        liberar_lock()
        conn.close()


if __name__ == "__main__":
    main()