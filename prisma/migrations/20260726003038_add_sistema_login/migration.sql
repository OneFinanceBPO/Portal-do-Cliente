-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LIMITADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'LIMITADO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_acesso" (
    "usuario_id" TEXT NOT NULL,
    "empresa_id" UUID NOT NULL,

    CONSTRAINT "usuario_acesso_pkey" PRIMARY KEY ("usuario_id","empresa_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "revogado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_atividades" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "categoria" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "detalhe" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_atividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "ativo" BOOLEAN DEFAULT true,
    "criado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extrato_movimentacoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID,
    "empresa_cnpj" TEXT NOT NULL,
    "data_lancamento" DATE,
    "resumo" TEXT,
    "situacao" TEXT,
    "valor" DECIMAL(15,2),
    "saldo" DECIMAL(15,2),
    "categoria" TEXT,
    "conta" TEXT,
    "periodo" TEXT DEFAULT 'todo_periodo',
    "data_extracao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "data_vencimento" DATE,

    CONSTRAINT "extrato_movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "execucao_id" UUID,
    "empresa_nome" TEXT,
    "empresa_cnpj" TEXT,
    "status" TEXT,
    "motivo" TEXT,
    "registros_salvos" INTEGER DEFAULT 0,
    "executado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_execucoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "iniciado_em" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "finalizado_em" TIMESTAMPTZ(6),
    "total_hub" INTEGER,
    "total_portal" INTEGER,
    "clientes_ok" INTEGER DEFAULT 0,
    "clientes_erro" INTEGER DEFAULT 0,
    "clientes_pulados" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'em_andamento',

    CONSTRAINT "log_execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "tokens_recuperacao_usuario_id_idx" ON "tokens_recuperacao"("usuario_id");

-- CreateIndex
CREATE INDEX "log_atividades_categoria_criado_em_idx" ON "log_atividades"("categoria", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "extrato_movimentacoes_empresa_cnpj_data_lancamento_resumo_v_key" ON "extrato_movimentacoes"("empresa_cnpj", "data_lancamento", "resumo", "valor");

-- AddForeignKey
ALTER TABLE "usuario_acesso" ADD CONSTRAINT "usuario_acesso_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_acesso" ADD CONSTRAINT "usuario_acesso_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacao" ADD CONSTRAINT "tokens_recuperacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_atividades" ADD CONSTRAINT "log_atividades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extrato_movimentacoes" ADD CONSTRAINT "extrato_movimentacoes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "log_clientes" ADD CONSTRAINT "log_clientes_execucao_id_fkey" FOREIGN KEY ("execucao_id") REFERENCES "log_execucoes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
