"""
Módulo de persistência no Neon (PostgreSQL).
"""

import os
import logging
from datetime import datetime

import psycopg2
import psycopg2.extras

log = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")
LOTE = 500


def conectar():
    """Retorna uma conexão com o banco Neon."""
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    log.info("Conectado ao banco Neon")
    return conn


def criar_tabelas(conn):
    """Cria as tabelas se ainda não existirem."""
    sql = """
    CREATE TABLE IF NOT EXISTS empresas (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        nome TEXT NOT NULL,
        cnpj TEXT UNIQUE,
        ativo BOOLEAN DEFAULT true,
        criado_em TIMESTAMPTZ DEFAULT now(),
        atualizado_em TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS extrato_movimentacoes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        empresa_id UUID REFERENCES empresas(id),
        empresa_cnpj TEXT NOT NULL,
        data_lancamento DATE,
        resumo TEXT,
        situacao TEXT,
        valor NUMERIC(15,2),
        saldo NUMERIC(15,2),
        categoria TEXT,
        conta TEXT,
        periodo TEXT DEFAULT 'todo_periodo',
        data_extracao TIMESTAMPTZ DEFAULT now(),
        UNIQUE(empresa_cnpj, data_lancamento, resumo, valor)
    );

    CREATE TABLE IF NOT EXISTS log_execucoes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        iniciado_em TIMESTAMPTZ DEFAULT now(),
        finalizado_em TIMESTAMPTZ,
        total_hub INTEGER,
        total_portal INTEGER,
        clientes_ok INTEGER DEFAULT 0,
        clientes_erro INTEGER DEFAULT 0,
        clientes_pulados INTEGER DEFAULT 0,
        status TEXT DEFAULT 'em_andamento'
    );

    CREATE TABLE IF NOT EXISTS log_clientes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        execucao_id UUID REFERENCES log_execucoes(id),
        empresa_nome TEXT,
        empresa_cnpj TEXT,
        status TEXT,
        motivo TEXT,
        registros_salvos INTEGER DEFAULT 0,
        executado_em TIMESTAMPTZ DEFAULT now()
    );
    """
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()
    log.info("Tabelas verificadas/criadas com sucesso")


def listar_empresas_do_portal(conn):
    """Retorna lista de CNPJs de empresas ativas."""
    with conn.cursor() as cur:
        cur.execute("SELECT cnpj FROM empresas WHERE ativo = true AND cnpj IS NOT NULL")
        cnpjs = [row[0] for row in cur.fetchall()]
    log.info(f"Portal: {len(cnpjs)} empresas ativas cadastradas")
    return cnpjs


def verificar_empresa_no_portal(conn, cnpj):
    """Consulta a tabela empresas pelo CNPJ."""
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("SELECT id, ativo FROM empresas WHERE cnpj = %s", (cnpj,))
        row = cur.fetchone()
    if not row:
        return {"encontrado": False, "empresa_id": None, "ativo": False}
    return {"encontrado": True, "empresa_id": row["id"], "ativo": row["ativo"]}


def salvar_extrato(conn, df):
    """
    Salva o DataFrame no banco em lotes de 500 usando execute_values.
    Um único INSERT por lote → muito mais rápido que registro a registro.
    Ignora duplicatas via ON CONFLICT DO NOTHING.
    Retorna quantidade de registros novos salvos.
    """
    if df is None or df.empty:
        return 0

    df = df.rename(columns={"data": "data_lancamento"})
    colunas = ["empresa_id", "empresa_cnpj", "data_lancamento", "resumo",
               "situacao", "valor", "saldo", "categoria", "conta", "periodo", "data_extracao"]

    # Converte para lista de tuplas (None no lugar de NaN)
    registros = df.where(df.notna(), None).to_dict(orient="records")
    lotes_valores = [tuple(rec.get(c) for c in colunas) for rec in registros]

    # DO UPDATE SET situacao: atualiza o status quando o mesmo registro muda de
    # "Em aberto" para "Conciliado" mantendo o mesmo valor (ex: pagamento confirmado)
    sql = f"""
        INSERT INTO extrato_movimentacoes ({', '.join(colunas)})
        VALUES %s
        ON CONFLICT (empresa_cnpj, data_lancamento, resumo, valor)
        DO UPDATE SET
            situacao      = EXCLUDED.situacao,
            saldo         = EXCLUDED.saldo,
            data_extracao = EXCLUDED.data_extracao
        WHERE extrato_movimentacoes.situacao IS DISTINCT FROM EXCLUDED.situacao
    """

    total_salvos = 0
    n_lotes = (len(lotes_valores) + LOTE - 1) // LOTE

    with conn.cursor() as cur:
        for i in range(0, len(lotes_valores), LOTE):
            lote = lotes_valores[i: i + LOTE]
            n_lote_atual = i // LOTE + 1
            psycopg2.extras.execute_values(cur, sql, lote, page_size=LOTE)
            inseridos = cur.rowcount if cur.rowcount >= 0 else 0
            total_salvos += inseridos
            log.info(f"  Lote {n_lote_atual}/{n_lotes}: {inseridos} novos de {len(lote)}")

    conn.commit()
    return total_salvos


def iniciar_log_execucao(conn, total_hub, total_portal):
    """Cria um registro em log_execucoes e retorna o id."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO log_execucoes (total_hub, total_portal, status)
                VALUES (%s, %s, 'em_andamento') RETURNING id
            """, (total_hub, total_portal))
            execucao_id = cur.fetchone()[0]
        conn.commit()
        return execucao_id
    except Exception as e:
        log.error(f"Erro ao iniciar log de execução: {e}")
        return None


def registrar_log_cliente(conn, execucao_id, nome, cnpj, status, motivo, registros):
    """Insere um registro em log_clientes."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO log_clientes (execucao_id, empresa_nome, empresa_cnpj, status, motivo, registros_salvos)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (execucao_id, nome, cnpj, status, motivo, registros))
        conn.commit()
    except Exception as e:
        log.error(f"Erro ao registrar log do cliente '{nome}': {e}")


def finalizar_log_execucao(conn, execucao_id, ok, erro, pulados, status="concluido"):
    """Atualiza log_execucoes com os totais finais."""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE log_execucoes
                SET finalizado_em = %s, clientes_ok = %s, clientes_erro = %s,
                    clientes_pulados = %s, status = %s
                WHERE id = %s
            """, (datetime.now(), ok, erro, pulados, status, execucao_id))
        conn.commit()
    except Exception as e:
        log.error(f"Erro ao finalizar log de execução: {e}")
