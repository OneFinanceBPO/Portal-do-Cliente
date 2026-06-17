"""
Módulo de extração do extrato de movimentações no CA Pro.
"""

import os
import logging
import glob
from datetime import datetime

import pandas as pd

log = logging.getLogger(__name__)
DOWNLOADS_DIR = os.path.join(os.getcwd(), "downloads")

COLUNAS_ESPERADAS = {
    # Nomes reais exportados pelo CA Pro (em lowercase) → fallbacks genéricos
    "data":     ["data movimento", "data", "date", "data lançamento", "data lancamento"],
    "resumo":   ["descrição", "descricao", "resumo", "historico", "histórico", "lançamento", "lancamento"],
    "situacao": ["situação", "situacao", "status"],
    "valor":    ["valor (r$)", "valor", "value", "amount"],
    "saldo":    ["saldo conta (r$)", "saldo", "balance"],
    "categoria":["categoria 1", "categoria", "category"],
    "conta":    ["conta bancária", "conta bancaria", "conta", "account", "banco"],
    "tipo":     ["tipo"],
}


def navegar_para_extrato(page):
    """Navega diretamente para a URL do Extrato de movimentações."""
    # Navega direto para a rota correta do CA Pro
    page.goto("https://pro.contaazul.com/#/ca/financeiro/extrato", wait_until="commit", timeout=20_000)
    page.wait_for_timeout(4000)

    # Confirma que chegou na página correta
    hash_atual = page.evaluate("window.location.hash")
    if "financeiro/extrato" not in hash_atual:
        raise Exception(f"Não navegou para o extrato. Hash: {hash_atual}")

    # Espera o conteúdo carregar (titulo ou tabela)
    try:
        page.wait_for_selector('h1, [class*="extrato"], [class*="movimentacao"], table, [class*="table"]', timeout=15_000)
    except Exception:
        pass  # Continua mesmo se não encontrar o seletor

    log.info(f"Navegou para o Extrato de movimentações ({hash_atual})")


def configurar_periodo_todo(page):
    """Configura o filtro de período para 'Todo o período'."""
    try:
        page.screenshot(path="logs/debug_extrato_carregado.png")
    except Exception:
        pass

    # O botão de período no extrato tem class ds-date-filter__main ou texto com "de 20XX"
    # Exemplos: "Junho de 2026", "Janeiro de 2025", etc.
    seletores_periodo = [
        '[class*="ds-date-filter__main"] button',
        '[class*="ds-date-period-dropdown"] button',
        'button:has-text("de 20")',       # ex: "Junho de 2026"
        'button:has-text("Este mês")',
        'button:has-text("Este ano")',
    ]
    clicou = False
    for sel in seletores_periodo:
        try:
            loc = page.locator(sel).first
            if loc.count() and loc.is_visible():
                loc.click()
                page.wait_for_timeout(1000)
                clicou = True
                log.info(f"Abriu seletor de período via: {sel}")
                break
        except Exception:
            pass

    if not clicou:
        log.warning("Não encontrou seletor de período — continuando com período atual")
        return

    # Clica em "Todo o período" no dropdown que se abriu
    opcoes_todo = [
        '.ds-dropdown-item-label:has-text("Todo o período")',
        '.ds-dropdown-item:has-text("Todo o período")',
        'li:has-text("Todo o período")',
        ':text-is("Todo o período")',
        ':text("Todo o período")',
    ]
    for sel in opcoes_todo:
        try:
            loc = page.locator(sel).first
            if loc.count() and loc.is_visible():
                loc.click()
                page.wait_for_timeout(3000)
                log.info("Período configurado: Todo o período")
                return
        except Exception:
            pass

    log.warning("Não encontrou opção 'Todo o período' — continuando com período atual")


def configurar_filtro_categorias(page):
    """Tenta configurar filtro de categorias (todas selecionadas). Não fatal se falhar."""
    try:
        filtros_btn = page.locator('button:has-text("Mais filtros"), button:has-text("Filtros")').first
        if filtros_btn.count() and filtros_btn.is_visible():
            filtros_btn.click()
            page.wait_for_timeout(800)

            cat = page.locator('text="Categoria", text="Categorias"').first
            if cat.count() and cat.is_visible():
                cat.click()
                page.wait_for_timeout(400)

                sel_todas = page.locator('text="Selecionar todas", text="Marcar todas"').first
                if sel_todas.count() and sel_todas.is_visible():
                    sel_todas.click()
                    page.wait_for_timeout(300)

                aplicar = page.locator('button:has-text("Aplicar"), button:has-text("Confirmar")').first
                if aplicar.count() and aplicar.is_visible():
                    aplicar.click()
                    page.wait_for_timeout(2000)
                    log.info("Filtro de categorias: todas selecionadas")
                    return

        log.info("Filtro de categorias não aplicado (continuando sem ele)")
    except Exception as e:
        log.info(f"Filtro de categorias ignorado: {e}")


def exportar_csv(page, cnpj):
    """Clica em Exportar, descarta o aviso 'Você sabia?' e aguarda o download."""
    # Verifica se há registros
    sem_dados = page.locator(':text("Nenhum lançamento"), :text("Nenhum resultado")').count()
    if sem_dados > 0:
        log.warning(f"Nenhum lançamento encontrado para CNPJ {cnpj}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # O CA Pro exporta OOXML (xlsx) com extensão .xls — salvamos com a extensão original
    nome_destino = os.path.join(DOWNLOADS_DIR, f"extrato_{cnpj}_{timestamp}.xls")

    # Clica em Exportar
    exportar_btn = page.locator('button:has-text("Exportar")').first
    exportar_btn.click()
    page.wait_for_timeout(1500)

    # Descarta popup "Você sabia?" se aparecer
    for sel in [
        'button:has-text("Ok, entendi")',
        'button:has-text("Entendi")',
        'button:has-text("OK")',
        'button:has-text("Continuar")',
    ]:
        try:
            btn = page.locator(sel).first
            if btn.count() and btn.is_visible():
                log.info(f"Descartando aviso: clicando em '{sel}'")
                btn.click()
                page.wait_for_timeout(1000)
                break
        except Exception:
            pass

    # Agora aguarda o download (pode aparecer novo modal ou direto)
    # Primeiro tenta capturar o download diretamente
    try:
        with page.expect_download(timeout=30_000) as download_info:
            # Se o export não começou ainda, tenta clicar em Exportar de novo
            # (caso o popup tenha fechado mas o download não iniciou)
            exportar_btn2 = page.locator('button:has-text("Exportar"), button:has-text("Baixar")').first
            if exportar_btn2.count() and exportar_btn2.is_visible():
                log.info("Clicando em Exportar novamente para iniciar download...")
                exportar_btn2.click()
            else:
                log.info("Aguardando download iniciado...")
        download = download_info.value
    except Exception:
        # Pode ser que o download já tenha iniciado antes do expect_download
        log.info("Tentando capturar download com expect_download reordenado...")
        with page.expect_download(timeout=30_000) as download_info:
            page.locator('button:has-text("Exportar")').first.click()
        download = download_info.value

    download.save_as(nome_destino)
    log.info(f"Extrato baixado: {os.path.basename(nome_destino)} ({os.path.getsize(nome_destino):,} bytes)")
    return nome_destino


def _mapear_coluna(df, opcoes):
    """Encontra a primeira coluna que bate com alguma das opções."""
    cols_lower = {c.lower().strip(): c for c in df.columns}
    for op in opcoes:
        if op in cols_lower:
            return cols_lower[op]
    return None


def processar_extrato(caminho_arquivo, nome_empresa, cnpj, empresa_id):
    """
    Lê o arquivo OOXML (.xls/.xlsx) exportado pelo CA Pro,
    normaliza colunas e retorna um DataFrame pronto para o banco.
    """
    try:
        # O CA Pro exporta OOXML mesmo com extensão .xls — openpyxl lê corretamente
        df = pd.read_excel(caminho_arquivo, engine="openpyxl", dtype=str)
        log.info(f"Extrato lido: {len(df)} linhas, {len(df.columns)} colunas")

        # Normaliza nomes de colunas (lowercase + strip)
        df.columns = [str(c).lower().strip() for c in df.columns]

        # Mapeia colunas reais → nomes padronizados
        mapa = {}
        for padrao, opcoes in COLUNAS_ESPERADAS.items():
            col = _mapear_coluna(df, opcoes)
            if col:
                mapa[col] = padrao

        df = df.rename(columns=mapa)

        # Garante que todas as colunas esperadas existam
        for col in COLUNAS_ESPERADAS:
            if col not in df.columns:
                df[col] = None

        # Converte data (formato "dd/mm/yyyy" no CA Pro)
        if "data" in df.columns:
            df["data"] = pd.to_datetime(df["data"], dayfirst=True, errors="coerce").dt.date

        # Converte valor e saldo para float.
        # O CA Pro exporta como número decimal com ponto (ex: "918.44"),
        # mas pode vir como string com formato BR (ex: "35.918,44") em alguns casos.
        for col_num in ("valor", "saldo"):
            if col_num in df.columns:
                s = df[col_num].astype(str).str.strip()
                # Se contém vírgula: formato BR → remove ponto de milhar, troca vírgula por ponto
                mascara_br = s.str.contains(",", na=False)
                s_br = s.where(~mascara_br, s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False))
                # Remove R$ e espaços residuais antes de converter
                s_br = s_br.str.replace(r"[R$\s]", "", regex=True)
                df[col_num] = pd.to_numeric(s_br, errors="coerce")

        # Remove linhas sem data (rodapé / células vazias)
        if "data" in df.columns:
            df = df[df["data"].notna()].copy()

        # Adiciona colunas de controle
        df["empresa_id"]    = str(empresa_id)
        df["empresa_nome"]  = nome_empresa
        df["empresa_cnpj"]  = cnpj
        df["data_extracao"] = datetime.now().isoformat()
        df["periodo"]       = "todo_periodo"

        # Seleciona somente colunas que vão para o banco
        colunas_banco = [
            "empresa_id", "empresa_cnpj", "data", "resumo",
            "situacao", "valor", "saldo", "categoria", "conta",
            "tipo", "periodo", "data_extracao",
        ]
        df = df[[c for c in colunas_banco if c in df.columns]]

        log.info(f"Extrato processado: {len(df)} registros válidos")
        return df

    except Exception as e:
        log.error(f"Erro ao processar extrato '{caminho_arquivo}': {e}")
        return None
    finally:
        try:
            os.remove(caminho_arquivo)
        except Exception:
            pass


# Alias para compatibilidade com chamadas existentes
def processar_csv(caminho_csv, nome_empresa, cnpj, empresa_id):
    return processar_extrato(caminho_csv, nome_empresa, cnpj, empresa_id)


def extrair_extrato_cliente(page, nome_empresa, cnpj, empresa_id):
    """Função principal: navega, configura, exporta e processa o extrato."""
    try:
        navegar_para_extrato(page)
        configurar_periodo_todo(page)
        configurar_filtro_categorias(page)
        caminho_arquivo = exportar_csv(page, cnpj)
        df = processar_extrato(caminho_arquivo, nome_empresa, cnpj, empresa_id)
        return df
    except Exception as e:
        log.error(f"Erro na extração do extrato de '{nome_empresa}': {e}")
        return None
