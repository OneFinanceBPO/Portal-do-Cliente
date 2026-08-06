-- Fila de sincronização sob demanda (botão "Sincronizar" no header).
-- O agente Python (services/agente-extrato/sync_worker.py) também sabe criar
-- essa tabela sozinho caso rode antes desta migration ser aplicada — os dois
-- lados precisam concordar no formato, então mantenha as colunas em sincronia
-- se algum dos dois for alterado.

CREATE TABLE IF NOT EXISTS "sync_solicitacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "solicitado_por" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "mensagem" TEXT,
    "registros_salvos" INTEGER,
    "solicitado_em" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "iniciado_em" TIMESTAMPTZ,
    "finalizado_em" TIMESTAMPTZ,

    CONSTRAINT "sync_solicitacoes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "sync_solicitacoes_empresa_id_status_idx"
  ON "sync_solicitacoes" ("empresa_id", "status");

ALTER TABLE "sync_solicitacoes"
  ADD CONSTRAINT "sync_solicitacoes_empresa_id_fkey"
  FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
