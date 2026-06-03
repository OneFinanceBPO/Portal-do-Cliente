"""
Módulo de validação das 3 condições antes de processar cada cliente.
"""

import re
import unicodedata
import logging

log = logging.getLogger(__name__)

PALAVRAS_REMOVER = {"LTDA", "S/A", "SA", "EIRELI", "ME", "EPP", "UNIPESSOAL", "LIMITADA", "SOCIEDADE", "EMPRESARIAL"}


def normalizar_texto(texto):
    """Remove acentos, converte para maiúsculas, remove sufixos jurídicos e espaços extras."""
    if not texto:
        return ""
    # Remove acentos
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join(c for c in nfkd if not unicodedata.combining(c))
    # Maiúsculas e remove caracteres especiais (mantém letras, números e espaços)
    limpo = re.sub(r"[^A-Z0-9 ]", " ", sem_acento.upper())
    # Remove palavras jurídicas
    palavras = [p for p in limpo.split() if p not in PALAVRAS_REMOVER]
    return " ".join(palavras).strip()


def normalizar_cnpj(cnpj):
    """Remove pontos, barras e hífens do CNPJ."""
    if not cnpj:
        return ""
    return re.sub(r"[^\d]", "", cnpj)


def obter_dados_empresa_no_ca_pro(page):
    """
    Dentro do CA Pro, abre 'Dados da empresa' e extrai nome e CNPJ.
    Retorna: {nome_completo, cnpj} ou None em caso de falha.
    """
    try:
        # Clica no avatar / menu do usuário no canto superior direito
        page.locator(
            '[data-testid="user-menu"], [aria-label*="usuário"], [aria-label*="empresa"], '
            '.user-avatar, .company-name, header button:last-child'
        ).first.click()
        page.wait_for_timeout(800)

        # Clica em "Dados da empresa"
        page.locator('text="Dados da empresa", text="Empresa", [href*="empresa"]').first.click()
        page.wait_for_load_state("networkidle", timeout=15_000)

        # Extrai nome da empresa
        nome = ""
        for seletor in ['input[name*="nome"], input[placeholder*="nome"], h1, [data-testid*="company-name"]']:
            el = page.locator(seletor).first
            if el.count() > 0:
                nome = el.get_attribute("value") or el.inner_text()
                if nome:
                    break

        # Extrai CNPJ
        cnpj = ""
        for seletor in ['input[name*="cnpj"], input[placeholder*="CNPJ"], [data-testid*="cnpj"]']:
            el = page.locator(seletor).first
            if el.count() > 0:
                cnpj = el.get_attribute("value") or el.inner_text()
                if cnpj:
                    break

        page.go_back()
        page.wait_for_load_state("networkidle", timeout=10_000)

        return {"nome_completo": nome.strip(), "cnpj": cnpj.strip()}

    except Exception as e:
        log.error(f"Erro ao obter dados da empresa no CA Pro: {e}")
        return None


def validar_identidade(nome_hub, cnpj_hub, dados_ca_pro):
    """
    Condição 2: verifica se nome e CNPJ do hub batem com os do CA Pro.
    Retorna: {valido, motivo, cnpj_confirmado}
    """
    nome_hub_norm = normalizar_texto(nome_hub)
    nome_ca_norm = normalizar_texto(dados_ca_pro.get("nome_completo", ""))
    cnpj_hub_norm = normalizar_cnpj(cnpj_hub)
    cnpj_ca_norm = normalizar_cnpj(dados_ca_pro.get("cnpj", ""))

    # Prioridade: CNPJ bate
    if cnpj_hub_norm and cnpj_ca_norm:
        if cnpj_hub_norm == cnpj_ca_norm:
            return {"valido": True, "motivo": "OK: CNPJ confirmado", "cnpj_confirmado": cnpj_ca_norm}
        else:
            return {
                "valido": False,
                "motivo": f"PULADO: CNPJ não confere (hub: {cnpj_hub_norm} | CA Pro: {cnpj_ca_norm})",
                "cnpj_confirmado": "",
            }

    # Fallback: valida pelo nome se CNPJ do hub é "--"
    if nome_hub_norm and nome_ca_norm:
        if nome_hub_norm in nome_ca_norm or nome_ca_norm in nome_hub_norm:
            return {"valido": True, "motivo": "OK: nome confirmado", "cnpj_confirmado": cnpj_ca_norm}

    return {
        "valido": False,
        "motivo": f"PULADO: nome não confere (hub: {nome_hub_norm} | CA Pro: {nome_ca_norm})",
        "cnpj_confirmado": "",
    }


def validar_cadastro_no_portal(supabase, cnpj):
    """
    Condição 3: verifica se o cliente está cadastrado e ativo no Supabase.
    Retorna: {cadastrado, empresa_id, motivo}
    """
    try:
        cnpj_norm = normalizar_cnpj(cnpj)
        resp = supabase.table("empresas").select("id, ativo").eq("cnpj", cnpj_norm).execute()
        dados = resp.data

        if not dados:
            return {"cadastrado": False, "empresa_id": None, "motivo": "PULADO: não cadastrado no portal do cliente"}

        empresa = dados[0]
        if not empresa.get("ativo", False):
            return {"cadastrado": False, "empresa_id": None, "motivo": "PULADO: empresa inativa no portal do cliente"}

        return {"cadastrado": True, "empresa_id": empresa["id"], "motivo": "OK"}

    except Exception as e:
        log.error(f"Erro ao consultar Supabase: {e}")
        return {"cadastrado": False, "empresa_id": None, "motivo": f"PULADO: erro ao consultar portal ({e})"}


def validar_cliente_completo(page, supabase, nome_hub, cnpj_hub):
    """
    Executa Condições 2 e 3 em sequência.
    Retorna dict com {valido, empresa_id, cnpj_confirmado, nome_confirmado, motivo}.
    """
    # Condição 2: identidade
    dados_ca = obter_dados_empresa_no_ca_pro(page)
    if not dados_ca:
        return {"valido": False, "motivo": "PULADO: não foi possível obter dados da empresa no CA Pro"}

    id_result = validar_identidade(nome_hub, cnpj_hub, dados_ca)
    if not id_result["valido"]:
        return {"valido": False, "motivo": id_result["motivo"]}

    cnpj_confirmado = id_result["cnpj_confirmado"]
    nome_confirmado = dados_ca["nome_completo"] or nome_hub

    # Condição 3: cadastro no portal
    portal_result = validar_cadastro_no_portal(supabase, cnpj_confirmado)
    if not portal_result["cadastrado"]:
        return {"valido": False, "motivo": portal_result["motivo"]}

    return {
        "valido": True,
        "empresa_id": portal_result["empresa_id"],
        "cnpj_confirmado": cnpj_confirmado,
        "nome_confirmado": nome_confirmado,
        "motivo": "OK: identidade e cadastro confirmados",
    }
