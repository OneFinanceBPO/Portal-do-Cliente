"""
Módulo de navegação no Conta Azul Mais via Playwright.
"""

import os
import re
import logging
from datetime import datetime
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

log = logging.getLogger(__name__)

CA_EMAIL = os.getenv("CA_EMAIL")
CA_SENHA = os.getenv("CA_SENHA")
DOWNLOADS_DIR = os.path.join(os.getcwd(), "downloads")
SESSION_FILE  = "session.json"


def _sessao_salva_existe():
    return os.path.exists(SESSION_FILE) and os.path.getsize(SESSION_FILE) > 0


def iniciar_navegador(headless=True):
    """
    Inicia o Playwright e abre o Chromium.
    Se session.json existir, carrega a sessão salva (sem precisar de login/2FA).
    Retorna (playwright, browser, page).
    """
    os.makedirs(DOWNLOADS_DIR, exist_ok=True)
    log.info("Passo 1: iniciando sync_playwright...")
    playwright = sync_playwright().start()
    log.info("Passo 2: lançando Chromium...")
    browser = playwright.chromium.launch(headless=headless)
    log.info("Passo 3: Chromium lançado, criando contexto...")

    kwargs = dict(accept_downloads=True)
    if _sessao_salva_existe():
        kwargs["storage_state"] = SESSION_FILE
        log.info("Sessão salva encontrada — carregando sem necessidade de login")
    else:
        log.info("Nenhuma sessão salva — será necessário fazer login")

    log.info("Passo 4: criando contexto do browser...")
    context = browser.new_context(**kwargs)
    log.info("Passo 5: abrindo nova página...")
    page = context.new_page()
    page.set_default_timeout(30_000)
    log.info("Passo 6: navegador pronto!")
    return playwright, browser, page


def fazer_login(page):
    """
    Acessa o Conta Azul Mais.
    Se a sessão salva ainda for válida, entra direto no hub.
    Caso contrário, faz login com e-mail e senha.
    Se o 2FA for solicitado, o agente para e orienta a rodar setup_sessao.py.
    """
    log.info("Acessando Conta Azul Mais...")
    try:
        page.goto("https://mais.contaazul.com/", wait_until="commit", timeout=20_000)
    except Exception:
        pass  # Ignora timeout do goto — o SPA pode continuar carregando
    log.info("Página iniciada, aguardando SPA...")
    page.wait_for_timeout(5000)  # Aguarda SPA resolver rota

    url_atual = page.url
    log.info(f"URL atual: {url_atual}")

    try:
        titulo = page.title()
        log.info(f"Título da página: {titulo}")
    except Exception as e:
        log.info(f"Não conseguiu ler título: {e}")

    try:
        hash_atual = page.evaluate("window.location.hash")
    except Exception as e:
        log.info(f"Não conseguiu ler hash: {e}")
        hash_atual = ""
    log.info(f"Hash atual: '{hash_atual}'")

    if "login" not in hash_atual.lower() and "mais.contaazul.com" in url_atual:
        log.info(f"Sessão válida — já no hub às {datetime.now().strftime('%H:%M')}")
        return

    # Verifica se o 2FA está sendo pedido
    if _pagina_pede_2fa(page):
        raise Exception(
            "O Conta Azul está pedindo autenticação em duas etapas.\n"
            "Execute: python3 setup_sessao.py\n"
            "Faça login manualmente com o código do Authenticator e a sessão será salva."
        )

    # Sessão expirou — tenta login com e-mail e senha
    log.info("Sessão expirada — fazendo login com e-mail e senha...")
    try:
        page.wait_for_selector('input[type="email"], input[name="username"], input[placeholder*="mail"]', timeout=10_000)
    except PlaywrightTimeout:
        raise Exception("Não encontrou o campo de e-mail. Execute setup_sessao.py novamente.")

    page.fill('input[type="email"], input[name="username"], input[placeholder*="mail"]', CA_EMAIL)
    page.fill('input[type="password"]', CA_SENHA)
    page.click('button[type="submit"], button:has-text("Entrar"), input[type="submit"]')
    page.wait_for_timeout(5000)

    # Verifica 2FA após submit
    if _pagina_pede_2fa(page):
        raise Exception(
            "O Conta Azul solicitou o código do Authenticator.\n"
            "Execute: python3 setup_sessao.py\n"
            "Faça login manualmente (incluindo o 2FA) e a sessão será salva para uso automático."
        )

    hash_pos_login = page.evaluate("window.location.hash")
    if "login" in hash_pos_login.lower():
        raise Exception("Login falhou. Verifique CA_EMAIL e CA_SENHA no .env")

    log.info(f"Login realizado com sucesso às {datetime.now().strftime('%H:%M')}")


def _pagina_pede_2fa(page):
    """Detecta se a página atual está pedindo código de autenticação."""
    indicadores = [
        'text="Autenticação em duas etapas"',
        'text="Two-factor"',
        'text="Código de verificação"',
        'text="Authenticator"',
        'input[placeholder*="código"]',
        'input[placeholder*="code"]',
        'input[autocomplete="one-time-code"]',
    ]
    for seletor in indicadores:
        if page.locator(seletor).count() > 0:
            return True
    return False


def _fechar_popup(page):
    """Fecha qualquer popup/modal que esteja bloqueando a tela."""
    for seletor in [
        'button:has-text("Gostei")',
        'button:has-text("Entendi")',
        'button:has-text("Fechar")',
        'button:has-text("OK")',
        '[aria-label="Fechar"]',
        'button[class*="close"]',
        'button[class*="modal"] >> nth=0',
    ]:
        try:
            el = page.locator(seletor).first
            if el.is_visible():
                el.click()
                log.info(f"Popup fechado: {seletor}")
                page.wait_for_timeout(1000)
                break
        except Exception:
            continue


def _buscar_cnpj_na_pagina(page, cnpj):
    """Usa a barra de pesquisa do Conta Azul para encontrar um cliente pelo CNPJ."""
    try:
        campo = page.locator(
            'input[placeholder*="esquisar"], input[placeholder*="earch"], input[type="search"], input[ng-model*="search"], input[ng-model*="pesquisa"]'
        ).first
        campo.click()
        campo.fill("")
        campo.type(cnpj, delay=50)
        page.wait_for_timeout(2500)

        texto = page.evaluate("document.body.innerText")
        m = re.search(
            r'([A-ZÁÉÍÓÚÀÃÕÂÊÎÔÛÇ][^\t\n]{2,})\t(' + re.escape(cnpj) + r')\t(CA Pro[^\t]*|—|-)',
            texto
        )
        if m:
            return {
                "nome": m.group(1).strip(),
                "cnpj": m.group(2).strip(),
                "tem_ca_pro": m.group(3).startswith("CA Pro"),
            }
        return None
    except Exception as e:
        log.warning(f"Erro ao buscar CNPJ {cnpj} via pesquisa: {e}")
        return None


def listar_clientes_do_hub(page, cnpjs_portal=None):
    """
    Navega para a seção de clientes do hub.

    Se cnpjs_portal for informado (lista de strings de CNPJ),
    busca cada um diretamente pela barra de pesquisa — sem paginar tudo.
    Retorna apenas os que têm CA Pro.

    Retorna: [{nome, cnpj, tem_ca_pro}, ...]
    """
    log.info("Navegando para a lista de clientes...")
    try:
        page.goto("https://mais.contaazul.com/#/clientes", wait_until="commit", timeout=20_000)
    except Exception:
        pass
    page.wait_for_timeout(5000)

    _fechar_popup(page)
    page.wait_for_timeout(1000)

    # ── Modo focado: busca só os clientes cadastrados no portal ──
    if cnpjs_portal:
        log.info(f"Buscando {len(cnpjs_portal)} cliente(s) do portal no Conta Azul (via pesquisa)...")
        clientes = []
        for cnpj in cnpjs_portal:
            log.info(f"  Pesquisando CNPJ {cnpj}...")
            resultado = _buscar_cnpj_na_pagina(page, cnpj)
            if resultado:
                status = "CA Pro ✓" if resultado["tem_ca_pro"] else "sem CA Pro"
                log.info(f"    → {resultado['nome']} ({status})")
                clientes.append(resultado)
            else:
                log.info(f"    → não encontrado no Conta Azul")
            # Limpa o campo de pesquisa antes da próxima busca
            try:
                campo = page.locator(
                    'input[placeholder*="esquisar"], input[placeholder*="earch"], input[type="search"], input[ng-model*="search"]'
                ).first
                campo.fill("")
                page.wait_for_timeout(800)
            except Exception:
                pass

        com_ca_pro = [c for c in clientes if c["tem_ca_pro"]]
        log.info(f"Resultado: {len(clientes)} encontrado(s) | {len(com_ca_pro)} com CA Pro")
        return com_ca_pro

    # ── Modo fallback: lê só a primeira página (sem paginação) ──
    log.info("Nenhum CNPJ do portal informado — lendo primeira página da lista...")
    page.wait_for_timeout(2000)
    texto = page.evaluate("document.body.innerText")
    clientes = []
    for m in re.finditer(
        r'([A-ZÁÉÍÓÚÀÃÕÂÊÎÔÛÇ][^\t\n]{2,})\t(\d{14})\t(CA Pro[^\t]*|—|-)',
        texto
    ):
        nome = m.group(1).strip()
        cnpj = m.group(2).strip()
        tem_ca_pro = m.group(3).startswith("CA Pro")
        if nome and cnpj:
            clientes.append({"nome": nome, "cnpj": cnpj, "tem_ca_pro": tem_ca_pro})

    com_ca_pro = [c for c in clientes if c["tem_ca_pro"]]
    log.info(f"{len(clientes)} clientes na página ({len(com_ca_pro)} com CA Pro)")
    return com_ca_pro


def entrar_no_cliente(page, nome_hub):
    """
    Novo fluxo:
    1. Encontra a TR do cliente e clica nela → vai para #/dashboard-do-cliente
    2. Clica em "Acessar CA Pro" → abre nova aba com o CA Pro
    Retorna o objeto page da nova aba, ou None em caso de falha.
    """
    try:
        nome_curto = nome_hub[:20]
        log.info(f"Clicando na linha de '{nome_curto}' para abrir o dashboard...")

        # Garante que estamos na tela de clientes
        hash_atual = page.evaluate("window.location.hash")
        if "clientes" not in hash_atual:
            page.goto("https://mais.contaazul.com/#/clientes", wait_until="commit", timeout=20_000)
            page.wait_for_timeout(3000)
            _fechar_popup(page)

        # Localiza a TR do cliente pelo nome
        linha = page.locator(f'tr.ds-data-grid-tr:has-text("{nome_curto}")').first
        if linha.count() == 0:
            raise Exception(f"Linha do cliente '{nome_hub}' não encontrada na lista")

        linha.scroll_into_view_if_needed()
        page.wait_for_timeout(400)

        # Clica na linha para ir ao dashboard do cliente
        linha.click()
        page.wait_for_timeout(3000)

        hash_pos = page.evaluate("window.location.hash")
        log.info(f"Hash após clique na linha: {hash_pos}")

        if "dashboard" not in hash_pos:
            raise Exception(f"Não navegou para o dashboard do cliente. Hash atual: {hash_pos}")

        # Fecha popup de integração se aparecer
        _fechar_popup(page)
        page.wait_for_timeout(500)

        # Clica em "Acessar CA Pro"
        acessar_btn = page.locator('button:has-text("Acessar CA Pro"), a:has-text("Acessar CA Pro")').first
        if acessar_btn.count() == 0:
            # Fallback: qualquer link com texto de acesso ao CA Pro
            acessar_btn = page.locator(':text("Acessar CA Pro"), :text("Acessar o CA Pro")').first

        if acessar_btn.count() == 0:
            try:
                page.screenshot(path="logs/debug_dashboard.png")
                log.info("Screenshot do dashboard: logs/debug_dashboard.png")
            except Exception:
                pass
            raise Exception("Botão 'Acessar CA Pro' não encontrado no dashboard do cliente")

        log.info("Clicando em 'Acessar CA Pro'...")
        try:
            with page.expect_popup(timeout=15_000) as popup_info:
                acessar_btn.click()
            page_ca = popup_info.value
        except Exception:
            # Pode abrir na mesma aba ou mudar de contexto
            acessar_btn.click()
            page.wait_for_timeout(4000)
            # Verifica se mudou para o CA Pro
            if "app.contaazul.com" in page.url or "contaazul.com" in page.url:
                page_ca = page
            else:
                raise Exception("'Acessar CA Pro' clicado mas não abriu o CA Pro")

        page_ca.wait_for_load_state("domcontentloaded", timeout=30_000)
        page_ca.wait_for_timeout(4000)
        page_ca.set_default_timeout(30_000)
        log.info(f"Acessando CA Pro de '{nome_hub}' — URL: {page_ca.url[:60]}")
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
