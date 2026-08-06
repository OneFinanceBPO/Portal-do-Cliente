import { db } from '@/lib/db';
import { withCache } from '@/lib/redis';

const CATEGORIAS_EXCLUIDAS = ['Transferência de Entrada', 'Transferência de Saída'];
const SITUACOES_REALIZADAS = ['Conciliado', 'Quitado'];
const SITUACOES_PENDENTES = ['Em aberto', 'Agendado'];

export async function getDadosFinanceiro(empresaId: string, ano: number, mes: number | null) {
  const cacheKey = `financeiro:v5:${empresaId}:${ano}:${mes ?? 'todos'}`;

  return withCache(cacheKey, 300, async () => {
    const inicioPeriodo = mes ? new Date(`${ano}-${String(mes).padStart(2, '0')}-01`) : new Date(`${ano}-01-01`);
    const fimPeriodo = mes
      ? new Date(mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`)
      : new Date(`${ano + 1}-01-01`);
    const inicioAno = new Date(`${ano}-01-01`);
    const fimAno = new Date(`${ano + 1}-01-01`);


    const movimentacoesAnoInteiro = await db.extratoMovimentacao.findMany({
      where: {
        empresa_id: empresaId,
        dataLancamento: { gte: inicioAno, lt: fimAno },
        situacao: { in: SITUACOES_REALIZADAS },
        categoria: { notIn: CATEGORIAS_EXCLUIDAS },
      },
      select: { dataLancamento: true, valor: true, categoria: true },
      orderBy: { dataLancamento: 'asc' },
    });

    const movimentacoes = mes
      ? movimentacoesAnoInteiro.filter((mv) => mv.dataLancamento && mv.dataLancamento >= inicioPeriodo && mv.dataLancamento < fimPeriodo)
      : movimentacoesAnoInteiro;

    const meses: Record<number, { mes: number; recTotal: number; pagTotal: number }> = {};
    for (let m = 1; m <= 12; m++) meses[m] = { mes: m, recTotal: 0, pagTotal: 0 };

    for (const mv of movimentacoesAnoInteiro) {
      if (!mv.dataLancamento || mv.valor === null) continue;
      const mesLancamento = mv.dataLancamento.getMonth() + 1;
      const valor = Number(mv.valor);
      if (valor > 0) meses[mesLancamento].recTotal += valor;
      else meses[mesLancamento].pagTotal += Math.abs(valor);
    }

    const recebidasPeriodo = movimentacoes.filter((mv) => mv.valor !== null && Number(mv.valor) > 0)
      .reduce((s, mv) => s + Number(mv.valor), 0);
    const pagasPeriodo = movimentacoes.filter((mv) => mv.valor !== null && Number(mv.valor) < 0)
      .reduce((s, mv) => s + Math.abs(Number(mv.valor)), 0);
    const qtdRecebidos = movimentacoes.filter((mv) => mv.valor !== null && Number(mv.valor) > 0).length;
    const qtdPagos = movimentacoes.filter((mv) => mv.valor !== null && Number(mv.valor) < 0).length;

    // Pendentes usam data_vencimento (não dataLancamento)
    const pendentesRaw = await db.extratoMovimentacao.findMany({
      where: {
        empresa_id: empresaId,
        situacao: { in: SITUACOES_PENDENTES },
        categoria: { notIn: CATEGORIAS_EXCLUIDAS },
        ...(mes ? { data_vencimento: { gte: inicioPeriodo, lt: fimPeriodo } } : {}),
      },
      select: { data_vencimento: true, dataLancamento: true, valor: true, resumo: true, categoria: true },
    });

    const hoje = new Date();
    const kpisRec = { vencidas: 0, aVencer: 0, recebidas: 0, total: 0, qtd: 0 };
    const kpisPag = { vencidas: 0, aVencer: 0, pagas: 0, total: 0, qtd: 0 };
    const abertoRecPorMes = Array(12).fill(0).map(() => ({ aVencer: 0, vencidos: 0 }));
    const abertoPagPorMes = Array(12).fill(0).map(() => ({ aVencer: 0, vencidos: 0 }));

    for (const p of pendentesRaw) {
      const dataRef = p.data_vencimento ?? p.dataLancamento;
      if (!dataRef || p.valor === null) continue;
      const valor = Math.abs(Number(p.valor));
      const mesRef = dataRef.getMonth() + 1;
      const atrasado = dataRef < hoje;
      const ehReceber = Number(p.valor) >= 0;

      if (ehReceber) {
        if (atrasado) { kpisRec.vencidas += valor; abertoRecPorMes[mesRef - 1].vencidos += valor; }
        else { kpisRec.aVencer += valor; abertoRecPorMes[mesRef - 1].aVencer += valor; }
      } else {
        if (atrasado) { kpisPag.vencidas += valor; abertoPagPorMes[mesRef - 1].vencidos += valor; }
        else { kpisPag.aVencer += valor; abertoPagPorMes[mesRef - 1].aVencer += valor; }
      }
    }

    kpisRec.recebidas = recebidasPeriodo;
    kpisRec.total = kpisRec.vencidas + kpisRec.aVencer + kpisRec.recebidas;
    kpisRec.qtd = qtdRecebidos;

    kpisPag.pagas = pagasPeriodo;
    kpisPag.total = kpisPag.vencidas + kpisPag.aVencer + kpisPag.pagas;
    kpisPag.qtd = qtdPagos;

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
      .sort((a, b) => ((a.data_vencimento ?? a.dataLancamento)?.getTime() ?? 0) - ((b.data_vencimento ?? b.dataLancamento)?.getTime() ?? 0))
      .slice(0, 20)
      .map((p) => {
        const dataRef = p.data_vencimento ?? p.dataLancamento;
        return {
          descricao: p.resumo ?? '—',
          categoria: p.categoria?.trim() || 'Outros',
          vencimento: dataRef?.toLocaleDateString('pt-BR') ?? '—',
          valor: Math.abs(Number(p.valor)),
          status: dataRef && dataRef < hoje ? 'atrasado' : 'a vencer',
        };
      });

    let detalhamentoDiario: { data: string; recebidos: number; representRec: number; pagos: number; representPag: number }[] | null = null;
    if (mes) {
      const diasMap: Record<string, { recebidos: number; pagos: number }> = {};
      for (const mv of movimentacoes) {
        if (!mv.dataLancamento || mv.valor === null) continue;
        const diaKey = mv.dataLancamento.toISOString().slice(0, 10);
        if (!diasMap[diaKey]) diasMap[diaKey] = { recebidos: 0, pagos: 0 };
        const v = Number(mv.valor);
        if (v > 0) diasMap[diaKey].recebidos += v;
        else diasMap[diaKey].pagos += Math.abs(v);
      }
      detalhamentoDiario = Object.entries(diasMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([data, v]) => ({
          data: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR'),
          recebidos: Math.round(v.recebidos * 100) / 100,
          representRec: recebidasPeriodo > 0 ? Math.round((v.recebidos / recebidasPeriodo) * 1000) / 10 : 0,
          pagos: Math.round(v.pagos * 100) / 100,
          representPag: pagasPeriodo > 0 ? Math.round((v.pagos / pagasPeriodo) * 1000) / 10 : 0,
        }));
    }

    return {
      ano,
      mes,
      meses: Object.values(meses),
      kpisRec,
      kpisPag,
      abertoRecPorMes,
      abertoPagPorMes,
      saldoMensal,
      categoriasPag,
      pendentesPag,
      detalhamentoDiario,
    };
  });
}

export type DadosFinanceiro = Awaited<ReturnType<typeof getDadosFinanceiro>>;