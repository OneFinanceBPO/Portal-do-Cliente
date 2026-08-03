import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessaoOuNull, podeAcessarCliente } from '@/lib/rbac';
import { withCache } from '@/lib/redis';
import type { GrupoDre } from '@prisma/client';

const SITUACOES_REALIZADAS = ['Conciliado', 'Quitado'];

const somaArr = (a: number[], b: number[]) => a.map((v, i) => v + b[i]);

function arrayZerado(): number[] {
  return new Array(12).fill(0);
}

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

  const cacheKey = `dre:v1:${empresaId}:${ano}`;

  const dados = await withCache(cacheKey, 300, async () => {
    const inicio = new Date(`${ano}-01-01`);
    const fim = new Date(`${ano + 1}-01-01`);

    const [movimentacoes, planoContas] = await Promise.all([
      db.extratoMovimentacao.findMany({
        where: {
          empresa_id: empresaId,
          dataLancamento: { gte: inicio, lt: fim },
          situacao: { in: SITUACOES_REALIZADAS },
        },
      }),
      db.planoContasDre.findMany({ orderBy: { ordem: 'asc' } }),
    ]);

    const grupoPorCategoria = new Map<string, GrupoDre>(planoContas.map((p) => [p.categoria, p.grupo]));

    // valoresPorCategoria[categoria] = array de 12 posições (1 por mês)
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
        continue; // categoria sem entrada no plano de contas — não entra no DRE
      }
      if (!valoresPorCategoria[cat]) valoresPorCategoria[cat] = arrayZerado();
      valoresPorCategoria[cat][m - 1] += Number(mv.valor);
    }

    const ultimoMesComDado = mesesComMovimento.size ? Math.max(...mesesComMovimento) : 0;

    // Uma linha por categoria usada, na ordem do plano de contas
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
    const deducaoReceita = totalGrupo('DEDUCAO_RECEITA'); // já vem negativo
    const receitaLiquida = somaArr(receitaBruta, deducaoReceita);

    const custoServico = totalGrupo('CUSTO_SERVICO'); // já vem negativo
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
      ultimoMesComDado, // 5 = "Jan a Mai", igual ao print original
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
      // Se isso vier não-vazio, tem categoria no extrato que não foi cadastrada
      // no plano_contas_dre ainda — fica de fora do DRE silenciosamente hoje.
      categoriasSemMapeamento: Array.from(categoriasSemMapeamento),
    };
  });

  return NextResponse.json(dados);
}