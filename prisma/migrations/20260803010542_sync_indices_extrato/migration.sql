CREATE INDEX IF NOT EXISTS "extrato_movimentacoes_empresa_data_situacao_idx"
  ON "extrato_movimentacoes" ("empresa_id", "data_lancamento", "situacao");

CREATE INDEX IF NOT EXISTS "extrato_movimentacoes_empresa_situacao_vencimento_idx"
  ON "extrato_movimentacoes" ("empresa_id", "situacao", "data_vencimento");
