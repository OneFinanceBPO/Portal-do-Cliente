-- Índices pras 2 formas de consulta que o sistema faz o tempo todo em
-- extrato_movimentacoes: (1) movimentações realizadas por empresa+data+situação,
-- (2) pendentes por empresa+situação+vencimento. Sem isso o Postgres tende a
-- fazer sequential scan conforme a tabela cresce.

CREATE INDEX IF NOT EXISTS "extrato_movimentacoes_empresa_data_situacao_idx"
  ON "extrato_movimentacoes" ("empresa_id", "data_lancamento", "situacao");

CREATE INDEX IF NOT EXISTS "extrato_movimentacoes_empresa_situacao_vencimento_idx"
  ON "extrato_movimentacoes" ("empresa_id", "situacao", "data_vencimento");
