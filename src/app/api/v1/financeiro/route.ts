import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { withCache } from '@/lib/redis';

const CATEGORIAS_EXCLUIDAS = ['Transferência de Entrada', 'Transferência de Saída'];

export async function GET(req: NextRequest) {
  const sessao = await getSessaoOuNull();
  if (!sessao) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const empresaId = searchParams.get('clienteId');
  const ano = parseInt(searchParams.get('ano') || `${new Date().getFullYear()}`, 10);

  if (!empresaId) {
    return NextResponse.json({ error: 'Parâmetro clienteId obrigatório' }, { status: 400 });
  }
  if (!podeAcessarCliente(sessao, empresaId)) {
    return NextResponse.json({ error: 'Sem acesso a este cliente' }, { status: 403 });
  }

  const cacheKey = `financeiro:v2:${empresaId}:${ano}`;

  const dados = await withCache(cacheKey, 300, async () => {

    const movimentacoes = await db.extratoMovimentacao.findMany({
      where: {
        empresa_id: empresaId,
        dataLancamento: { gte: new Date(`${ano}-01-01`), lt: new Date(`${ano + 1}-01-01`) },
        situacao: { in: ['Conciliado', 'Quitado'] },
        categoria: { notIn: CATEGORIAS_EXCLUIDAS },
      },
      orderBy: { dataLancamento: 'asc' },
    });

    const meses: Record<number, { mes: number; recTotal: number; pagTotal: number }> = {};
    for (let m = 1; m <= 12; m++) meses[m] = { mes: m, recTotal: 0, pagTotal: 0 };

    for (const mv of movimentacoes) {
      if (!mv.dataLancamento || mv.valor === null) continue;
      const mes = mv.dataLancamento.getMonth() + 1;
      const valor = Number(mv.valor);
      if (valor > 0) meses[mes].recTotal += valor;
      else meses[mes].pagTotal += Math.abs(valor);
    }


    const pendentesRaw = await db.extratoMovimentacao.findMany({
      where: {
        empresa_id: empresaId,
        situacao: { in: ['Em aberto', 'Agendado'] },
        categoria: { notIn: CATEGORIAS_EXCLUIDAS },
      },
    });

    const hoje = new Date();
    const kpisRec = { vencidas: 0, aVencer: 0, recebidas: 0, total: 0 };
    const kpisPag = { vencidas: 0, aVencer: 0, pagas: 0, total: 0 };
    const abertoRecPorMes = Array(12).fill(0).map(() => ({ aVencer: 0, vencidos: 0 }));
    const abertoPagPorMes = Array(12).fill(0).map(() => ({ aVencer: 0, vencidos: 0 }));

    for (const p of pendentesRaw) {
      if (!p.dataLancamento || p.valor === null) continue;
      const valor = Math.abs(Number(p.valor));
      const mes = p.dataLancamento.getMonth() + 1;
      const atrasado = p.dataLancamento < hoje;
      const ehReceber = Number(p.valor) >= 0;

      if (ehReceber) {
        if (atrasado) { kpisRec.vencidas += valor; abertoRecPorMes[mes - 1].vencidos += valor; }
        else { kpisRec.aVencer += valor; abertoRecPorMes[mes - 1].aVencer += valor; }
      } else {
        if (atrasado) { kpisPag.vencidas += valor; abertoPagPorMes[mes - 1].vencidos += valor; }
        else { kpisPag.aVencer += valor; abertoPagPorMes[mes - 1].aVencer += valor; }
      }
    }

    kpisRec.recebidas = Object.values(meses).reduce((s, m) => s + m.recTotal, 0);
    kpisRec.total = kpisRec.vencidas + kpisRec.aVencer + kpisRec.recebidas;

    kpisPag.pagas = Object.values(meses).reduce((s, m) => s + m.pagTotal, 0);
    kpisPag.total = kpisPag.vencidas + kpisPag.aVencer + kpisPag.pagas;

    const saldoMensal = Object.values(meses).map((m) => m.recTotal - m.pagTotal);

    const categoriasPagMap: Record<string, number> = {};
    for (const mv of movimentacoes) {
      if (mv.valor === null || Number(mv.valor) >= 0) continue;
      const cat = mv.categoria?.trim() || 'Outros';
      categoriasPagMap[cat] = (categoriasPagMap[cat] || 0) + Math.abs(Number(mv.valor));
    }
    const categoriasPag = Object.entries(categoriasPagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nome, valor]) => ({ nome, valor }));


    const pendentesPag = pendentesRaw
      .filter((p) => p.valor !== null && Number(p.valor) < 0)
      .sort((a, b) => (a.dataLancamento?.getTime() ?? 0) - (b.dataLancamento?.getTime() ?? 0))
      .slice(0, 20)
      .map((p) => ({
        descricao: p.resumo ?? '—',
        categoria: p.categoria?.trim() || 'Outros',
        vencimento: p.dataLancamento?.toLocaleDateString('pt-BR') ?? '—',
        valor: Math.abs(Number(p.valor)),
        status: p.dataLancamento && p.dataLancamento < hoje ? 'atrasado' : 'a vencer',
      }));

    return {
      ano,
      meses: Object.values(meses),
      kpisRec,
      kpisPag,
      abertoRecPorMes,
      abertoPagPorMes,
      saldoMensal,
      categoriasPag,
      pendentesPag,
    };
  });

  return NextResponse.json(dados);
}