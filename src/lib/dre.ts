import { db } from '@/lib/db';
import { withCache } from '@/lib/redis';
import type { GrupoDre } from '@prisma/client';

const SITUACOES_REALIZADAS = ['Conciliado', 'Quitado'];

const somaArr = (a: number[], b: number[]) => a.map((v, i) => v + b[i]);

function arrayZerado(): number[] {
  return new Array(12).fill(0);
}

export async function getDadosDre(empresaId: string, ano: number) {
  const cacheKey = `dre:v1:${empresaId}:${ano}`;

  return withCache(cacheKey, 300, async () => {
    const inicio = new Date(`${ano}-01-01`);
    const fim = new Date(`${ano + 1}-01-01`);

    const [movimentacoes, planoContas] = await Promise.all([
      db.extratoMovimentacao.findMany({
        where: {
          empresa_id: empresaId,
          dataLancamento: { gte: inicio, lt: fim },
          situacao: { in: SITUACOES_REALIZADAS },
        },
        select: { dataLancamento: true, valor: true, categoria: true },
      }),
      db.planoContasDre.findMany({ orderBy: { ordem: 'asc' } }),
    ]);

    const grupoPorCategoria = new Map<string, GrupoDre>(planoContas.map((p) => [p.categoria, p.grupo]));


    const valoresPorCategoria: Record<string, number[]> = {};
    const categoriasSemMapeamento = new Set<string>();
    const mesesComMovimento = new Set<number>();

    for (const mv of movimentacoes) {
      if (!mv.dataLancamento || mv.valor === null) continue;
      const cat = mv.categoria?.trim() || 'Outros';
      const m = mv.dataLancamento.getMonth() + 1;
      mesesComMovimento.add(m);

      if (!grupoPorCategoria.has(cat)) {
        categoriasSemMapeamento.add(cat);
        continue; 
      }
      if (!valoresPorCategoria[cat]) valoresPorCategoria[cat] = arrayZerado();
      valoresPorCategoria[cat][m - 1] += Number(mv.valor);
    }

    const ultimoMesComDado = mesesComMovimento.size ? Math.max(...mesesComMovimento) : 0;

   
    const linhas = planoContas
      .filter((p) => valoresPorCategoria[p.categoria])
      .map((p) => ({
        categoria: p.categoria,
        grupo: p.grupo,
        valoresPorMes: valoresPorCategoria[p.categoria].map((v) => Math.round(v * 100) / 100),
      }));

    function totalGrupo(grupo: GrupoDre): number[] {
      return linhas.filter((l) => l.grupo === grupo).reduce((acc, l) => somaArr(acc, l.valoresPorMes), arrayZerado());
    }

    const receitaBruta = totalGrupo('RECEITA_BRUTA');
    const deducaoReceita = totalGrupo('DEDUCAO_RECEITA');
    const receitaLiquida = somaArr(receitaBruta, deducaoReceita);

    const custoServico = totalGrupo('CUSTO_SERVICO'); 
    const lucroBruto = somaArr(receitaLiquida, custoServico);

    const despesaPessoal = totalGrupo('DESPESA_PESSOAL');
    const despesaAdministrativa = totalGrupo('DESPESA_ADMINISTRATIVA');
    const despesaJuridica = totalGrupo('DESPESA_JURIDICA');
    const imposto = totalGrupo('IMPOSTO');
    const despesasOperacionais = [despesaPessoal, despesaAdministrativa, despesaJuridica, imposto].reduce(somaArr, arrayZerado());
    const resultadoOperacional = somaArr(lucroBruto, despesasOperacionais);

    const despesaFinanceira = totalGrupo('DESPESA_FINANCEIRA');
    const outrasReceitas = totalGrupo('OUTRAS_RECEITAS');
    const resultadoNaoOperacional = somaArr(despesaFinanceira, outrasReceitas);
    const resultadoLiquido = somaArr(resultadoOperacional, resultadoNaoOperacional);

    return {
      ano,
      ultimoMesComDado, 
      linhas,
      totais: {
        receitaBruta,
        deducaoReceita,
        receitaLiquida,
        custoServico,
        lucroBruto,
        despesaPessoal,
        despesaAdministrativa,
        despesaJuridica,
        imposto,
        despesasOperacionais,
        resultadoOperacional,
        despesaFinanceira,
        outrasReceitas,
        resultadoNaoOperacional,
        resultadoLiquido,
      },
   
      categoriasSemMapeamento: Array.from(categoriasSemMapeamento),
    };
  });
}

export type DadosDre = Awaited<ReturnType<typeof getDadosDre>>;