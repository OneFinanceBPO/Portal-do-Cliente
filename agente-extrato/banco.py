"""
Módulo de persistência no Supabase.
"""

import os
import logging
from datetime import datetime

log = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
LOTE = 500


def conectar():
    """Inicializa e retorna o cliente Supabase."""
    from supabase import create_client
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    log.info("Conectado ao Supabase")
    return client


def listar_empresas_do_portal(supabase):
    """Retorna lista de CNPJs de empresas ativas no portal."""
    resp = supabase.table("empresas").select("cnpj").eq("ativo", True).execute()
    cnpjs = [r["cnpj"] for r in resp.data if r.get("cnpj")]
    log.info(f"Portal: {len(cnpjs)} empresas ativas cadastradas")
    return cnpjs


def verificar_empresa_no_portal(supabase, cnpj):
    """Consulta a tabela empresas pelo CNPJ. Retorna {encontrado, empresa_id, ativo}."""
    resp = supabase.table("empresas").select("id, ativo").eq("cnpj", cnpj).execute()
    if not resp.data:
        return {"encontrado": False, "empresa_id": None, "ativo": False}
    empresa = resp.data[0]
    return {"encontrado": True, "empresa_id": empresa["id"], "ativo": empresa.get("ativo", False)}


def salvar_extrato(supabase, df):
    """
    Salva o DataFrame no Supabase em lotes de 500.
    Usa upsert com on_conflict='ignore' para não duplicar.
    Retorna quantidade de registros novos salvos.
    """
    if df is None or df.empty:
        return 0

    # Renomeia colunas para bater com o schema do banco
    rename_map = {"data": "data_lancamento", "resumo": "resumo"}
    df = df.rename(columns=rename_map)

    registros = df.where(df.notna(), None).to_dict(orient="records")
    total_salvos = 0

    for i in range(0, len(registros), LOTE):
        lote = registros[i : i + LOTE]
        try:
            resp = supabase.table("extrato_movimentacoes").upsert(
                lote, on_conflict="empresa_cnpj,data_lancamento,resumo,valor", ignore_duplicates=True
            ).execute()
            salvos = len(resp.data) if resp.data else 0
            total_salvos += salvos
        except Exception as e:
            log.error(f"Erro ao salvar lote {i//LOTE + 1}: {e}")

    return total_salvos


def iniciar_log_execucao(supabase, total_hub, total_portal):
    """Cria um registro em log_execucoes e retorna o id."""
    try:
        resp = supabase.table("log_execucoes").insert({
            "total_hub": total_hub,
            "total_portal": total_portal,
            "status": "em_andamento",
        }).execute()
        return resp.data[0]["id"]
    except Exception as e:
        log.error(f"Erro ao iniciar log de execução: {e}")
        return None


def registrar_log_cliente(supabase, execucao_id, nome, cnpj, status, motivo, registros):
    """Insere um registro em log_clientes."""
    try:
        supabase.table("log_clientes").insert({
            "execucao_id": execucao_id,
            "empresa_nome": nome,
            "empresa_cnpj": cnpj,
            "status": status,
            "motivo": motivo,
            "registros_salvos": registros,
        }).execute()
    except Exception as e:
        log.error(f"Erro ao registrar log do cliente '{nome}': {e}")


def finalizar_log_execucao(supabase, execucao_id, ok, erro, pulados, status="concluido"):
    """Atualiza log_execucoes com os totais finais."""
    try:
        supabase.table("log_execucoes").update({
            "finalizado_em": datetime.now().isoformat(),
            "clientes_ok": ok,
            "clientes_erro": erro,
            "clientes_pulados": pulados,
            "status": status,
        }).eq("id", execucao_id).execute()
    except Exception as e:
        log.error(f"Erro ao finalizar log de execução: {e}")
