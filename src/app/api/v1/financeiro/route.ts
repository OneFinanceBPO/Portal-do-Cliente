import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { withCache } from '@/lib/redis';
import { numKeys } from 'node_modules/zod/v4/core/util.cjs';

const CATEGORIAS_EXCLUIDAS = ['Transferencia de entrada', 'Transferencia de saida'];

export async function GET(req: NextRequest) {
    const sessao = await getSessaoOuNull();
    if (!sessao) return NextResponse.json({ error: 'Nao autenticao' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get('clienteId');
    const ano = parseInt(searchParams.get('ano') || `${new Date().getFullYear()}`, 10);

    if (!empresaId) {
        return NextResponse.json({ error: 'Parametro clienteId obrigatorio' }, { status: 400 });
    }

    if (!podeAcessarCliente(sessao, empresaId)) {
        return NextResponse.json({ error: 'Sem acesso a este cliente' }, { status: 403 });
    }

    const cacheKey = `financeiro:${empresaId}: ${ano}`;

    const dados = await withCache(cacheKey, 300, async () => {
        const movimentacoes = await db.extratoMovimentacao.findMany({
            where: {
                empresa_id: empresaId,
                dataLancamento: {
                    gte: new Date(`${ano}-01-01`),
                    lt: new Date(`${ano + 1}-01-01`),
                },
                situacao: { in: ['Conciliado', 'Quitado'] },
                categoria: { notIn: CATEGORIAS_EXCLUIDAS },
            },
            orderBy: { dataLancamento: 'asc' },
        });

        const meses: Record<number, { mes: number; recTotal: number; pagTotal: number; qtdRec: number; qtdPag: number }> = {};

        for (const m of movimentacoes) {
            if (!m.dataLancamento || m.valor === null) continue;
            const mes = m.dataLancamento.getMonth() + 1;
            const valor = Number(m.valor);
            if (!meses[mes]) meses[mes] = { mes, recTotal: 0, pagTotal: 0, qtdRec: 0, qtdPag: 0 };
            if (valor > 0) { meses[mes].recTotal += valor; meses[mes].qtdRec++; }
            else { meses[mes].pagTotal += Math.abs(valor); meses[mes].qtdPag++; }
        }

        const pendentes = await db.extratoMovimentacao.findMany({
            where: { empresa_id: empresaId, situacao: { in: ['Em aberto', 'Agendado'] } },
            orderBy: { dataLancamento: 'asc' },
        });

        return { ano, meses: Object.values(meses), pendentes }
    });

    return NextResponse.json(dados);
}