'use client';

import { Fragment, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import KpiRow, { Kpi } from '@/components/financeiro/kpi-row';
import { CORES, opcoesLinha, datasetLinha } from '@/components/financeiro/chart-theme';
import '@/components/financeiro/chart-setup';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const GRUPO_LABEL: Record<string, string> = {
  RECEITA_BRUTA: '(+) Receita Bruta',
  DEDUCAO_RECEITA: '(-) Impostos sobre Receita',
  CUSTO_SERVICO: '(-) Custo dos Serviços',
  DESPESA_PESSOAL: '(-) Despesas com Pessoal',
  DESPESA_ADMINISTRATIVA: '(-) Despesas Administrativas',
  DESPESA_JURIDICA: '(-) Despesas Jurídicas',
  IMPOSTO: '(-) Impostos e Tributos',
  DESPESA_FINANCEIRA: '(-) Despesas Financeiras',
  OUTRAS_RECEITAS: '(+) Outras Receitas',
};

// Seções da tabela: quais grupos entram em cada bloco e qual é o subtotal
// exibido no fim do bloco (vem pronto de `totais`, calculado no back-end).
const SECOES: { titulo: string; grupos: string[]; totalLabel: string; totalKey: keyof Totais }[] = [
  { titulo: 'Receitas Operacionais', grupos: ['RECEITA_BRUTA', 'DEDUCAO_RECEITA'], totalLabel: '(=) Receita Líquida de Serviços', totalKey: 'receitaLiquida' },
  { titulo: 'Custo dos Serviços', grupos: ['CUSTO_SERVICO'], totalLabel: '(=) Lucro Bruto', totalKey: 'lucroBruto' },
  { titulo: 'Despesas Operacionais', grupos: ['DESPESA_PESSOAL', 'DESPESA_ADMINISTRATIVA', 'DESPESA_JURIDICA', 'IMPOSTO'], totalLabel: '(=) Resultado Operacional', totalKey: 'resultadoOperacional' },
  { titulo: 'Resultado Não Operacional', grupos: ['DESPESA_FINANCEIRA', 'OUTRAS_RECEITAS'], totalLabel: '(=) Resultado Líquido', totalKey: 'resultadoLiquido' },
];

type Totais = {
  receitaBruta: number[]; deducaoReceita: number[]; receitaLiquida: number[];
  custoServico: number[]; lucroBruto: number[];
  despesaPessoal: number[]; despesaAdministrativa: number[]; despesaJuridica: number[]; imposto: number[];
  despesasOperacionais: number[]; resultadoOperacional: number[];
  despesaFinanceira: number[]; outrasReceitas: number[]; resultadoNaoOperacional: number[]; resultadoLiquido: number[];
};
type Linha = { categoria: string; grupo: string; valoresPorMes: number[] };
type DreApi = { ano: number; ultimoMesComDado: number; linhas: Linha[]; totais: Totais; categoriasSemMapeamento: string[] };

const C = (n: number) => 'R$ ' + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt = (n: number) => (n < 0 ? `(${C(n)})` : C(n));
const somaPeriodo = (arr: number[], inicio: number, fimInclusive: number) =>
  arr.slice(inicio, fimInclusive).reduce((s, v) => s + v, 0);

export default function DreClient({
  clienteId,
  anoInicial,
  dadosIniciais,
}: {
  clienteId: string;
  anoInicial: number;
  dadosIniciais: DreApi;
}) {
  const [ano, setAno] = useState(anoInicial);
  const [mes, setMes] = useState<number | ''>(''); // '' = "Todos" (acumulado até o último mês com dado)
  const [dados, setDados] = useState<DreApi>(dadosIniciais);
  // Já chega com dado (veio do servidor) — só mostra "carregando" quando o
  // usuário troca o ano e um novo fetch client-side está em andamento.
  const [carregando, setCarregando] = useState(false);
  const [gruposFechados, setGruposFechados] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Evita refazer o fetch do ano inicial que já veio pronto do servidor.
    if (ano === anoInicial) return;
    setCarregando(true);
    fetch(`/api/v1/financeiro/dre?clienteId=${clienteId}&ano=${ano}`)
      .then((r) => r.json())
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [clienteId, ano, anoInicial]);

  if (carregando || !dados) return <div className="page"><p>Carregando…</p></div>;

  const { ultimoMesComDado, linhas, totais, categoriasSemMapeamento } = dados;
  const isAll = mes === '';
  const mesesExibidos = isAll ? Array.from({ length: ultimoMesComDado }, (_, i) => i + 1) : [mes as number];
  const inicioIdx = 0;
  const fimIdx = isAll ? ultimoMesComDado : (mes as number);

  const somaKpi = (arr: number[]) => somaPeriodo(arr, inicioIdx, fimIdx);
  const acumuladoAte = (arr: number[]) => somaPeriodo(arr, 0, fimIdx);

  const kpiRecBruta = somaKpi(totais.receitaBruta);
  const kpiRecLiq = somaKpi(totais.receitaLiquida);
  const kpiLucroBruto = somaKpi(totais.lucroBruto);
  const kpiResOp = somaKpi(totais.resultadoOperacional);
  const kpiResLiq = somaKpi(totais.resultadoLiquido);
  const kpiAcum = acumuladoAte(totais.resultadoLiquido);

  const acumLabel = isAll
    ? `Acumulado Jan–${MESES_ABREV[ultimoMesComDado - 1] ?? '—'}`
    : mes === 1
    ? 'Resultado Janeiro'
    : `Acum. Jan–${MESES_ABREV[(mes as number) - 1]}`;

  const kpis: Kpi[] = [
    { label: 'Receita Bruta de Serviços', valor: kpiRecBruta, cor: 'blue', badge: { variant: 'dash' } },
    { label: 'Receita Líquida de Serviços', valor: kpiRecLiq, cor: 'blue', badge: { variant: 'dash' } },
    { label: 'Lucro Bruto', valor: kpiLucroBruto, cor: 'green', badge: { variant: 'dash' } },
    { label: 'Resultado Operacional', valor: kpiResOp, cor: 'red', badge: { variant: 'dash' } },
    { label: 'Resultado Líquido', valor: kpiResLiq, cor: 'red', badge: { variant: 'dash' } },
    { label: acumLabel, valor: kpiAcum, cor: 'red', badge: { variant: 'neutral', texto: kpiAcum < 0 ? 'Prejuízo acum.' : 'Lucro acum.' } },
  ];

  function toggleGrupo(i: number) {
    setGruposFechados((atual) => {
      const novo = new Set(atual);
      if (novo.has(i)) novo.delete(i); else novo.add(i);
      return novo;
    });
  }
  function expandirTudo() { setGruposFechados(new Set()); }
  function recolherTudo() { setGruposFechados(new Set(SECOES.map((_, i) => i))); }

  const colunas = isAll ? MESES_ABREV.slice(0, ultimoMesComDado) : [MESES_ABREV[(mes as number) - 1]];

  return (
    <div className="page">
      {categoriasSemMapeamento.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#fbbf24', marginBottom: 16 }}>
          ⚠️ {categoriasSemMapeamento.length} categoria(s) do extrato sem mapeamento no plano de contas do DRE (ficaram de fora do cálculo): {categoriasSemMapeamento.join(', ')}
        </div>
      )}

      <div className="filter-row">
        <span className="filter-lbl">Ano</span>
        <select className="filter-sel" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
          {[ano - 1, ano, ano + 1].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="filter-lbl">Mês</span>
        <select className="filter-sel" value={mes} onChange={(e) => setMes(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Todos</option>
          {MESES_ABREV.slice(0, ultimoMesComDado || 12).map((l, i) => <option key={l} value={i + 1}>{l}</option>)}
        </select>
      </div>

      <KpiRow variant="six" kpis={kpis} />

      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-title">Evolução Mensal — Receita vs Lucro Bruto vs Lucro Líquido</div>
        <div className="chart-wrap" style={{ height: 200 }}>
          <Line
            data={{
              labels: MESES_ABREV.slice(0, ultimoMesComDado || 1),
              datasets: [
                datasetLinha('Receita Bruta', totais.receitaBruta.slice(0, ultimoMesComDado || 1), CORES.azul),
                datasetLinha('Lucro Bruto', totais.lucroBruto.slice(0, ultimoMesComDado || 1), CORES.verde),
                datasetLinha('Lucro Líquido', totais.resultadoLiquido.slice(0, ultimoMesComDado || 1), CORES.amarelo),
              ],
            }}
            options={opcoesLinha}
          />
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--border)' }}>
        <div className="sec-header" style={{ marginBottom: 16 }}>
          <div className="sec-title">
            DRE Gerencial — {isAll ? `Janeiro a ${MESES_ABREV[ultimoMesComDado - 1] ?? '—'} ${ano}` : `${MESES_ABREV[(mes as number) - 1]} ${ano}`}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={expandirTudo}>Expandir Tudo</button>
            <button className="btn btn-ghost btn-sm" onClick={recolherTudo}>Recolher Tudo</button>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Conta</th>
                {colunas.map((c) => <th key={c}>{c}</th>)}
                {isAll && <th style={{ borderLeft: '2px solid var(--border)' }}>Total</th>}
              </tr>
            </thead>
            <tbody>
              {SECOES.map((secao, si) => {
                const aberto = !gruposFechados.has(si);
                const linhasSecao = linhas.filter((l) => secao.grupos.includes(l.grupo));
                const totalArr = totais[secao.totalKey];
                const valoresTotal = isAll ? colunas.map((_, i) => totalArr[i]) : [totalArr[(mes as number) - 1]];
                const totalPeriodo = somaPeriodo(totalArr, inicioIdx, fimIdx);

                return (
                  <Fragment key={`sec-${si}`}>
                    <tr>
                      <td colSpan={colunas.length + 2} style={{ fontWeight: 700, color: 'var(--text2)', paddingTop: 10 }}>
                        <button
                          onClick={() => toggleGrupo(si)}
                          className="exp-btn"
                          style={{ marginRight: 6, display: 'inline-block', transform: aberto ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
                        >
                          ▶
                        </button>
                        {secao.titulo}
                      </td>
                    </tr>
                    {aberto && linhasSecao.map((l, li) => {
                      const valores = isAll ? colunas.map((_, i) => l.valoresPorMes[i]) : [l.valoresPorMes[(mes as number) - 1]];
                      const totalLinha = somaPeriodo(l.valoresPorMes, inicioIdx, fimIdx);
                      return (
                        <tr key={`sec-${si}-l-${li}`}>
                          <td style={{ paddingLeft: 24, fontSize: 12 }}>{l.categoria}</td>
                          {valores.map((v, vi) => (
                            <td key={vi} className={v < 0 ? 'td-neg' : v > 0 ? 'td-pos' : ''}>{fmt(v)}</td>
                          ))}
                          {isAll && (
                            <td className={totalLinha < 0 ? 'td-neg' : totalLinha > 0 ? 'td-pos' : ''} style={{ borderLeft: '2px solid var(--border)', fontWeight: 600 }}>
                              {fmt(totalLinha)}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {aberto && (
                      <tr key={`sec-${si}-total`} style={{ borderTop: '1px solid var(--border)', fontWeight: 700 }}>
                        <td style={{ paddingLeft: 12 }}>{secao.totalLabel}</td>
                        {valoresTotal.map((v, vi) => (
                          <td key={vi} className={v < 0 ? 'td-neg' : 'td-pos'}>{fmt(v)}</td>
                        ))}
                        {isAll && (
                          <td className={totalPeriodo < 0 ? 'td-neg' : 'td-pos'} style={{ borderLeft: '2px solid var(--border)' }}>
                            {fmt(totalPeriodo)}
                          </td>
                        )}
                      </tr>
                    )}
                    <tr key={`sec-${si}-sep`}><td colSpan={colunas.length + 2} style={{ height: 10 }} /></tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}