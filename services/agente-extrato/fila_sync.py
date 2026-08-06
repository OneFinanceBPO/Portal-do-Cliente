
import logging
import psycopg2.extras

log = logging.getLogger(__name__)


def criar_tabela_sync(conn):
    sql = """
    CREATE TABLE IF NOT EXISTS sync_solicitacoes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        solicitado_por TEXT,
        status TEXT NOT NULL DEFAULT 'pendente',
        mensagem TEXT,
        registros_salvos INTEGER,
        solicitado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
        iniciado_em TIMESTAMPTZ,
        finalizado_em TIMESTAMPTZ
    );
    CREATE INDEX IF NOT EXISTS sync_solicitacoes_empresa_id_status_idx
      ON sync_solicitacoes (empresa_id, status);
    """
    with conn.cursor() as cur:
        cur.execute(sql)
    conn.commit()


def proxima_pendente(conn):
 
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute("""
            SELECT sq.id, sq.empresa_id, e.nome, e.cnpj
            FROM sync_solicitacoes sq
            JOIN empresas e ON e.id = sq.empresa_id
            WHERE sq.status = 'pendente'
            ORDER BY sq.solicitado_em ASC
            LIMIT 1
            FOR UPDATE OF sq SKIP LOCKED
        """)
        row = cur.fetchone()
        if not row:
            conn.commit()
            return None
        cur.execute(
            "UPDATE sync_solicitacoes SET status = 'em_andamento', iniciado_em = now() WHERE id = %s",
            (row["id"],),
        )
    conn.commit()
    return row


def devolver_para_pendente(conn, solicitacao_id):
    
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE sync_solicitacoes SET status = 'pendente', iniciado_em = NULL WHERE id = %s",
            (solicitacao_id,),
        )
    conn.commit()


def marcar_concluida(conn, solicitacao_id, registros_salvos):
    with conn.cursor() as cur:
        cur.execute(
            """UPDATE sync_solicitacoes
               SET status = 'concluido', finalizado_em = now(), registros_salvos = %s
               WHERE id = %s""",
            (registros_salvos, solicitacao_id),
        )
    conn.commit()


def marcar_erro(conn, solicitacao_id, mensagem):
    with conn.cursor() as cur:
        cur.execute(
            """UPDATE sync_solicitacoes
               SET status = 'erro', finalizado_em = now(), mensagem = %s
               WHERE id = %s""",
            (str(mensagem)[:500], solicitacao_id),
        )
    conn.commit()