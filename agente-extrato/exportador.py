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
    "data": ["data", "date", "data lançamento", "data lancamento"],
    "resumo": ["resumo", "descrição", "descricao", "historico", "histórico", "lançamento", "lancamento"],
    "situacao": ["situação", "situacao", "status"],
    "valor": ["valor", "value", "amount"],
    "saldo": ["saldo", "balance"],
    "categoria": ["categoria", "category", "tipo"],
    "conta": ["conta", "account", "banco"],
}


def navegar_para_extrato(page):
    """Navega até o Extrato de movimentações no menu Financeiro."""
    page.locator('nav a:has-text("Financeiro"), [data-testid*="financeiro"], a[href*="financeiro"]').first.click()
    page.wait_for_timeout(800)

    page.locator(
        'a:has-text("Extrato de movimentações"), a:has-text("Extrato"), [href*="extrato"]'
    ).first.click()
    page.wait_for_load_state("networkidle", timeout=20_000)

    # Confirma que o título da página está visível
    page.wait_for_selector('h1:has-text("Extrato"), [data-testid*="extrato-title"]', timeout=15_000)
    log.info("Navegou para o Extrato de movimentações")


def configurar_periodo_todo(page):
    """Configura o filtro de período para 'Todo o período'."""
    # Abre o seletor de período
    page.locator(
        '[data-testid*="periodo"], button:has-text("período"), button:has-text("Período"), '
        'button:has-text("Este mês"), button:has-text("mês")'
    ).first.click()
    page.wait_for_timeout(600)

    # Clica em "Todo o período"
    page.locator('text="Todo o período", text="Todos os períodos", [data-value="all"]').first.click()
    page.wait_for_load_state("networkidle", timeout=15_000)
    log.info("Período configurado: Todo o período")


def configurar_filtro_categorias(page):
    """Abre 'Mais filtros' → Categoria → Selecionar todas → Aplicar."""
    page.locator(
        'button:has-text("Mais filtros"), button:has-text("Filtros"), [data-testid*="mais-filtros"]'
    ).first.click()
    page.wait_for_timeout(600)

    page.locator('text="Categoria", [data-testid*="categoria-filter"]').first.click()
    page.wait_for_timeout(400)

    # Selecionar todas
    page.locator(
        'text="Selecionar todas", text="Marcar todas", input[type="checkbox"]:first-child'
    ).first.click()
    page.wait_for_timeout(300)

    # Aplicar
    page.locator('button:has-text("Aplicar"), button:has-text("Confirmar")').first.click()
    page.wait_for_load_state("networkidle", timeout=10_000)
    log.info("Filtro de categorias aplicado (todas selecionadas)")


def exportar_csv(page, cnpj):
    """Clica em Exportar, aguarda o download e renomeia o arquivo."""
    # Verifica se há registros
    sem_dados = page.locator('text="0 registros", text="Nenhum lançamento", text="Nenhum resultado"').count()
    if sem_dados > 0:
        log.warning(f"Nenhum lançamento encontrado para CNPJ {cnpj}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome_destino = os.path.join(DOWNLOADS_DIR, f"extrato_{cnpj}_{timestamp}.csv")

    with page.expect_download(timeout=30_000) as download_info:
        page.locator(
            'button:has-text("Exportar"), button:has-text("Export"), [data-testid*="exportar"]'
        ).first.click()

    download = download_info.value
    download.save_as(nome_destino)
    log.info(f"CSV baixado: {os.path.basename(nome_destino)}")
    return nome_destino


def _mapear_coluna(df, opcoes):
    """Encontra a primeira coluna que bate com alguma das opções."""
    cols_lower = {c.lower().strip(): c for c in df.columns}
    for op in opcoes:
        if op in cols_lower:
            return cols_lower[op]
    return None


def processar_csv(caminho_csv, nome_empresa, cnpj, empresa_id):
    """Lê o CSV, normaliza e retorna um DataFrame limpo."""
    try:
        # Tenta UTF-8-BOM primeiro, depois latin-1
        for enc in ["utf-8-sig", "latin-1", "utf-8"]:
            try:
                df = pd.read_csv(caminho_csv, encoding=enc, sep=None, engine="python")
                break
            except Exception:
                continue
        else:
            raise ValueError("Não foi possível ler o CSV com nenhuma codificação conhecida")

        # Normaliza nomes de colunas
        df.columns = [str(c).lower().strip() for c in df.columns]

        # Mapeia colunas para nomes padronizados
        mapa = {}
        for padrao, opcoes in COLUNAS_ESPERADAS.items():
            col = _mapear_coluna(df, opcoes)
            if col:
                mapa[col] = padrao

        df = df.rename(columns=mapa)

        # Garante que as colunas esperadas existam (com None se ausente)
        for col in COLUNAS_ESPERADAS:
            if col not in df.columns:
                df[col] = None

        # Converte valor para float
        if "valor" in df.columns:
            df["valor"] = (
                df["valor"]
                .astype(str)
                .str.replace("R$", "", regex=False)
                .str.replace(".", "", regex=False)
                .str.replace(",", ".", regex=False)
                .str.strip()
            )
            df["valor"] = pd.to_numeric(df["valor"], errors="coerce")

        if "saldo" in df.columns:
            df["saldo"] = (
                df["saldo"]
                .astype(str)
                .str.replace("R$", "", regex=False)
                .str.replace(".", "", regex=False)
                .str.replace(",", ".", regex=False)
                .str.strip()
            )
            df["saldo"] = pd.to_numeric(df["saldo"], errors="coerce")

        # Converte data
        if "data" in df.columns:
            df["data"] = pd.to_datetime(df["data"], dayfirst=True, errors="coerce").dt.date

        # Adiciona colunas de controle
        df["empresa_id"] = str(empresa_id)
        df["empresa_nome"] = nome_empresa
        df["empresa_cnpj"] = cnpj
        df["data_extracao"] = datetime.now().isoformat()
        df["periodo"] = "todo_periodo"

        # Seleciona apenas as colunas que vão para o banco
        colunas_banco = [
            "empresa_id", "empresa_cnpj", "data", "resumo",
            "situacao", "valor", "saldo", "categoria", "conta",
            "periodo", "data_extracao",
        ]
        df = df[[c for c in colunas_banco if c in df.columns]]

        log.info(f"CSV processado: {len(df)} registros")
        return df

    except Exception as e:
        log.error(f"Erro ao processar CSV '{caminho_csv}': {e}")
        return None
    finally:
        # Remove o CSV temporário
        try:
            os.remove(caminho_csv)
        except Exception:
            pass


def extrair_extrato_cliente(page, nome_empresa, cnpj, empresa_id):
    """Função principal: navega, configura, exporta e processa o extrato."""
    try:
        navegar_para_extrato(page)
        configurar_periodo_todo(page)
        configurar_filtro_categorias(page)
        caminho_csv = exportar_csv(page, cnpj)
        df = processar_csv(caminho_csv, nome_empresa, cnpj, empresa_id)
        return df
    except Exception as e:
        log.error(f"Erro na extração do extrato de '{nome_empresa}': {e}")
        return None
