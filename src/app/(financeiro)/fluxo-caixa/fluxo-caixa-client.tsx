'use client';

import { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import KpiRow, { Kpi } from '@/components/financeiro/kpi-row';
import { CORES, opcoesBase, datasetBarra, datasetLinha } from '@/components/financeiro/chart-theme';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const brl = (v: number) => 'R$ ' + Number(v).toLocaleString('pt-BR');

export default function FluxoCaixaClient({ clienteId }: { clienteId: string }) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState<number | ''>('');
  const [dados, setDados] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    const query = `/api/v1/financeiro?clienteId=${clienteId}&ano=${ano}${mes ? `&mes=${mes}` : ''}`;
    fetch(query)
      .then((r) => r.json())
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [clienteId, ano, mes]);

  if (carregando || !dados) return <div className="page"><p>Carregando…</p></div>;

  const { kpisRec, kpisPag, meses, saldoMensal, detalhamentoDiario } = dados;
  const rotuloPeriodo = mes ? `${MESES[mes - 1]}/${ano}` : `${ano}`;

  const totalRecebidos = kpisRec.recebidas;
  const totalPagos = kpisPag.pagas;
  const geracaoCaixa = totalRecebidos - totalPagos;
  const saldoPeriodo = geracaoCaixa;

  const pctDiferenca = totalPagos > 0 ? (Math.abs(geracaoCaixa) / totalPagos) * 100 : 0;
  const fraseSaldo =
    totalPagos === 0 && totalRecebidos === 0
      ? 'Sem dados no período'
      : geracaoCaixa >= 0
      ? `Recebidos superam Pagos em ${pctDiferenca.toFixed(1)}%`
      : `Pagos superam Recebidos em ${pctDiferenca.toFixed(1)}%`;

  const kpis: Kpi[] = [
    { label: 'Total Recebidos', valor: totalRecebidos, cor: 'green' },
    { label: 'Total Pagos', valor: totalPagos, cor: 'red' },
    { label: 'Geração de Caixa', valor: geracaoCaixa, cor: geracaoCaixa >= 0 ? 'green' : 'red' },
    {
      label: 'Transações Rec. / Pag.',
      valor: 0,
      valorTexto: `${kpisRec.qtd} / ${kpisPag.qtd}`,
      sub: 'qtde no período',
    },
  ];

  return (
    <div className="page">
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

      {/* Banner de saldo do período */}
      <div
        className="chart-card"
        style={{
          marginBottom: 20,
          background: geracaoCaixa >= 0 ? 'rgba(34,197,94,0.06)' : 'rgba(244,63,94,0.06)',
          borderColor: geracaoCaixa >= 0 ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="kpi-label">Saldo do Período ({rotuloPeriodo})</div>
          <div className={`kpi-val ${geracaoCaixa >= 0 ? 'green' : 'red'}`} style={{ fontSize: 26 }}>
            {brl(saldoPeriodo)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${geracaoCaixa >= 0 ? 'up' : 'down'}`} style={{ display: 'inline-block', marginBottom: 4 }}>
            {fraseSaldo}
          </span>
        </div>
      </div>

      {/* Entradas / Saídas do período — agora com contagem real */}
      <div className="charts-2" style={{ marginBottom: 20 }}>
        <div className="chart-card" style={{ borderColor: 'rgba(34,197,94,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CORES.verde, display: 'inline-block' }} />
            <span className="chart-title" style={{ margin: 0 }}>Entradas — {rotuloPeriodo}</span>
          </div>
          <div className="kpi-val green">{brl(totalRecebidos)}</div>
          <div className="kpi-sub">{kpisRec.qtd} recebimento{kpisRec.qtd !== 1 ? 's' : ''}</div>
        </div>
        <div className="chart-card" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: CORES.vermelho, display: 'inline-block' }} />
            <span className="chart-title" style={{ margin: 0 }}>Saídas — {rotuloPeriodo}</span>
          </div>
          <div className="kpi-val red">{brl(totalPagos)}</div>
          <div className="kpi-sub">{kpisPag.qtd} pagamento{kpisPag.qtd !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-title">Evolução do Fluxo de Caixa — Jan a Dez {ano}</div>
        <div className="chart-wrap" style={{ height: 260 }}>
          <Chart
            type="bar"
            data={{
              labels: MESES,
              datasets: [
                { ...datasetBarra(meses.map((m: any) => m.recTotal), 'rgba(34,197,94,0.25)'), label: 'Recebidos', order: 2 },
                { ...datasetBarra(meses.map((m: any) => m.pagTotal), 'rgba(244,63,94,0.25)'), label: 'Pagos', order: 2 },
                { ...datasetLinha('Saldo', saldoMensal, CORES.amarelo), type: 'line' as const, order: 1 },
              ],
            }}
            options={{ ...opcoesBase, plugins: { ...opcoesBase.plugins, legend: { display: true } } }}
          />
        </div>
      </div>

      {/* Detalhamento por dia — só existe quando um mês específico é selecionado */}
      <div className="chart-card">
        <div className="sec-header">
          <div className="sec-title">Detalhamento por Data de Transação — {rotuloPeriodo}</div>
        </div>
        {!mes ? (
          <p style={{ color: 'var(--text2)', fontSize: 12, padding: '12px 0' }}>
            Selecione um mês específico no filtro acima pra ver o detalhamento dia a dia.
          </p>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Data</th><th>Recebidos</th><th>Represent. %</th><th>Pagos</th><th>Represent. %</th></tr>
              </thead>
              <tbody>
                {(!detalhamentoDiario || detalhamentoDiario.length === 0) ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text2)', padding: 24 }}>Nenhuma transação neste período</td></tr>
                ) : (
                  detalhamentoDiario.map((d: any, i: number) => (
                    <tr key={i}>
                      <td>{d.data}</td>
                      <td className="td-pos">{d.recebidos > 0 ? brl(d.recebidos) : '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{d.recebidos > 0 ? `${d.representRec}%` : '—'}</td>
                      <td className="td-neg">{d.pagos > 0 ? brl(d.pagos) : '—'}</td>
                      <td style={{ color: 'var(--text2)' }}>{d.pagos > 0 ? `${d.representPag}%` : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}