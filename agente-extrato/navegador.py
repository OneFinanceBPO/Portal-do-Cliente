"""
Módulo de navegação no Conta Azul Mais via Playwright.
"""

import os
import logging
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

log = logging.getLogger(__name__)

CA_EMAIL = os.getenv("CA_EMAIL")
CA_SENHA = os.getenv("CA_SENHA")
DOWNLOADS_DIR = os.path.join(os.getcwd(), "downloads")


def iniciar_navegador(headless=True):
    """Inicia o Playwright e abre o Chromium. Retorna (playwright, browser, page)."""
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=headless)
    context = browser.new_context(
        accept_downloads=True,
        downloads_path=DOWNLOADS_DIR,
    )
    page = context.new_page()
    page.set_default_timeout(30_000)
    return playwright, browser, page


def fazer_login(page):
    """Acessa o Conta Azul Mais e realiza o login."""
    log.info("Acessando Conta Azul Mais...")
    page.goto("https://app.contaazul.com/")
    page.wait_for_load_state("networkidle")

    # Preenche e-mail
    page.wait_for_selector('input[type="email"], input[name="email"], input[placeholder*="mail"]')
    page.fill('input[type="email"], input[name="email"], input[placeholder*="mail"]', CA_EMAIL)

    # Preenche senha
    page.fill('input[type="password"]', CA_SENHA)

    # Clica em Entrar
    page.click('button[type="submit"], button:has-text("Entrar"), input[type="submit"]')

    # Aguarda redirecionamento para o hub
    try:
        page.wait_for_url(lambda url: "/hub" in url or "/parceiro" in url or "/dashboard" in url, timeout=20_000)
    except PlaywrightTimeout:
        # Verifica se apareceu mensagem de erro
        if page.locator('text="Usuário ou senha inválidos"').count() > 0 or \
           page.locator('text="Credenciais inválidas"').count() > 0:
            raise Exception("Login falhou: credenciais inválidas. Verifique CA_EMAIL e CA_SENHA no .env")
        # Se não tem erro explícito mas URL não mudou, lança exceção genérica
        if "contaazul.com" in page.url and "/hub" not in page.url:
            raise Exception(f"Login falhou: URL inesperada após login — {page.url}")

    log.info(f"Login realizado com sucesso às {datetime.now().strftime('%H:%M')}")


def listar_clientes_do_hub(page):
    """
    Lê a tabela do hub e retorna lista de clientes com CA Pro Full.
    Retorna: [{nome, cnpj, tem_ca_pro}, ...]
    """
    log.info("Listando clientes do hub...")

    # Garante que está no hub
    if "/hub" not in page.url and "/parceiro" not in page.url:
        page.goto("https://app.contaazul.com/hub")
        page.wait_for_load_state("networkidle")

    # Aguarda tabela carregar
    page.wait_for_selector("table tbody tr, [data-testid='client-row'], .client-row", timeout=20_000)
    page.wait_for_timeout(2000)  # Aguarda renderização completa

    clientes = []

    # Estratégia 1: tabela HTML padrão
    linhas = page.locator("table tbody tr").all()

    for linha in linhas:
        try:
            celulas = linha.locator("td").all()
            if len(celulas) < 3:
                continue

            nome = celulas[0].inner_text().strip()
            cnpj = celulas[1].inner_text().strip() if len(celulas) > 1 else "--"
            licenca_texto = linha.inner_text()

            tem_ca_pro = "CA Pro Full" in licenca_texto or "Pro Full" in licenca_texto

            if nome and nome != "Nome":  # ignora cabeçalho
                clientes.append({"nome": nome, "cnpj": cnpj, "tem_ca_pro": tem_ca_pro})
        except Exception:
            continue

    com_ca_pro = [c for c in clientes if c["tem_ca_pro"]]
    log.info(f"{len(clientes)} clientes encontrados no hub ({len(com_ca_pro)} com CA Pro Full)")
    return com_ca_pro


def entrar_no_cliente(page, nome_hub):
    """
    Clica em Ações → Entrar no CA Pro para o cliente especificado.
    Retorna o objeto page da nova aba, ou None em caso de falha.
    """
    try:
        # Localiza a linha do cliente pelo nome
        linha = page.locator(f"tr:has-text('{nome_hub}')").first
        if not linha.is_visible():
            log.warning(f"Linha do cliente '{nome_hub}' não encontrada no hub")
            return None

        # Clica no botão Ações
        linha.locator('button:has-text("Ações"), button[aria-label*="Ações"], [data-testid*="action"]').click()
        page.wait_for_timeout(800)

        # Clica em Entrar no CA Pro
        with page.expect_popup() as popup_info:
            page.locator('text="Entrar no CA Pro", [role="menuitem"]:has-text("Entrar")').first.click()

        page_ca = popup_info.value
        page_ca.wait_for_load_state("networkidle", timeout=30_000)
        page_ca.set_default_timeout(30_000)
        return page_ca

    except Exception as e:
        log.error(f"Erro ao entrar no cliente '{nome_hub}': {e}")
        return None


def voltar_para_hub(page_ca, page_hub):
    """Fecha a aba do CA Pro e volta para o hub."""
    try:
        page_ca.close()
    except Exception:
        pass
    try:
        page_hub.bring_to_front()
        page_hub.wait_for_timeout(1000)
    except Exception:
        pass
