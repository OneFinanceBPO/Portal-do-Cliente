-- CreateEnum
CREATE TYPE "GrupoDre" AS ENUM ('RECEITA_BRUTA', 'DEDUCAO_RECEITA', 'CUSTO_SERVICO', 'DESPESA_PESSOAL', 'DESPESA_ADMINISTRATIVA', 'DESPESA_JURIDICA', 'IMPOSTO', 'DESPESA_FINANCEIRA', 'OUTRAS_RECEITAS');

-- CreateTable
CREATE TABLE "plano_contas_dre" (
    "id" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "grupo" "GrupoDre" NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plano_contas_dre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plano_contas_dre_categoria_key" ON "plano_contas_dre"("categoria");
