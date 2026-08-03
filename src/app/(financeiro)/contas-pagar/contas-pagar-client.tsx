'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import KpiRow, { Kpi } from '@/components/financeiro/kpi-row';
import { CORES, PALETA_CATEGORIAS, opcoesBase, opcoesBarraHorizontal, datasetBarraGradiente, datasetBarra } from '@/components/financeiro/chart-theme';
import type { DadosFinanceiro } from '@/lib/financeiro';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const brl = (v: number) => 'R$ ' + Number(v).toLocaleString('pt-BR');

export default function ContasPagarClient({
  clienteId,
  anoInicial,
  dadosIniciais,
}: {
  clienteId: string;
  anoInicial: number;
  dadosIniciais: DadosFinanceiro;
}) {
  const [ano, setAno] = useState(anoInicial);
  const [mes, setMes] = useState<number | ''>('');
  const [dados, setDados] = useState<DadosFinanceiro>(dadosIniciais);
  // Já chega com dado (veio do servidor) — só mostra "carregando" quando o
  // usuário troca o filtro e um novo fetch client-side está em andamento.
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Evita refazer o fetch do ano/mês inicial que já veio pronto do servidor.
    if (ano === anoInicial && mes === '') return;
    setCarregando(true);
    const query = `/api/v1/financeiro?clienteId=${clienteId}&ano=${ano}${mes ? `&mes=${mes}` : ''}`;
    fetch(query)
      .then((r) => r.json())
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [clienteId, ano, mes, anoInicial]);

  const { kpisPag, meses, categoriasPag, pendentesPag } = dados;
  const rotuloPeriodo = mes ? `${MESES[mes - 1]}/${ano}` : `${ano}`;

  const kpis: Kpi[] = [
    { label: 'Transações Pagos', valor: kpisPag.pagas, cor: 'green' },
    { label: 'Transações A Pagar', valor: kpisPag.aVencer, cor: 'blue', badge: { variant: 'neutral', texto: '— em aberto' }, sub: rotuloPeriodo },
    { label: 'Transações Atrasadas', valor: kpisPag.vencidas, cor: 'red' },
    { label: 'Total do Período', valor: kpisPag.total },
  ];

  return (
    <div className="page" style={{ opacity: carregando ? 0.6 : 1, transition: 'opacity .15s' }}>
      <div className="filter-row">
        <span className="filter-lbl">Ano</span>
        <select className="filter-sel" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
          {[ano - 1, ano, ano + 1].map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="filter-lbl">Mês</span>
        <select className="filter-sel" value={mes} onChange={(e) => setMes(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Todos os meses</option>
          {MESES.map((nomeMes, i) => <option key={nomeMes} value={i + 1}>{nomeMes}</option>)}
        </select>
      </div>

      <KpiRow kpis={kpis} />

      <div className="charts-2">
        <div className="chart-card">
          <div className="chart-title">Pagos por Mês ({ano})</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Bar
              data={{
                labels: MESES,
                datasets: [datasetBarraGradiente(meses.map((m: any) => m.pagTotal), CORES.vermelho)],
              }}
              options={opcoesBase}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Pagos por Categoria</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Bar
              data={{
                labels: categoriasPag.map((c: any) => c.nome),
                datasets: [datasetBarra(categoriasPag.map((c: any) => c.valor), PALETA_CATEGORIAS)],
              }}
              options={opcoesBarraHorizontal}
            />
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="sec-header">
          <div className="sec-title">Contas a Pagar — Próximos Vencimentos</div>
          <span style={{ fontSize: 11, color: 'var(--text2)' }}>
            {pendentesPag.length} conta{pendentesPag.length !== 1 ? 's' : ''} pendente{pendentesPag.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Descrição</th><th>Categoria</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pendentesPag.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text2)', padding: 24 }}>
                    Todos os pagamentos foram realizados neste período
                  </td>
                </tr>
              ) : (
                pendentesPag.map((c: any, i: number) => (
                  <tr key={i}>
                    <td>{c.descricao}</td>
                    <td>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: 'var(--accent2)' }}>
                        {c.categoria}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{c.vencimento}</td>
                    <td className="td-neg">{brl(c.valor)}</td>
                    <td>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: c.status === 'atrasado' ? 'rgba(244,63,94,0.12)' : 'rgba(251,146,60,0.12)',
                          color: c.status === 'atrasado' ? '#f43f5e' : '#fb923c',
                        }}
                      >
                        {c.status === 'atrasado' ? 'Atrasado' : 'A Vencer'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}