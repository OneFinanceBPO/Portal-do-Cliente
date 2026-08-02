'use client';

import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import KpiRow from '@/components/financeiro/kpi-row';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const formatoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const CORES = ['#3b82f6', '#f43f5e', '#fb923c', '#22c55e', '#8b5cf6', '#4a6080'];

export default function ContasPagarClient({ clienteId }: { clienteId: string }) {
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

  const { kpisPag, meses, categoriasPag, pendentesPag } = dados;
  const rotuloPeriodo = mes ? `${MESES[mes - 1]}/${ano}` : `${ano}`;

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

      <KpiRow kpis={[
        { label: 'Transações Pagos', valor: kpisPag.pagas, cor: 'green' },
        { label: 'Transações A Pagar', valor: kpisPag.aVencer, cor: 'blue' },
        { label: 'Transações Atrasadas', valor: kpisPag.vencidas, cor: 'red' },
        { label: 'Total do Período', valor: kpisPag.total },
      ]} />

      <div className="charts-2">
        <div className="chart-card">
          <div className="chart-title">Pagos por Mês ({rotuloPeriodo})</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Bar
              data={{ labels: MESES, datasets: [{ label: 'Pago', data: meses.map((m: any) => m.pagTotal), backgroundColor: '#f43f5e' }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Pagos por Categoria</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Pie
              data={{
                labels: categoriasPag.map((c: any) => c.nome),
                datasets: [{ data: categoriasPag.map((c: any) => c.valor), backgroundColor: CORES }],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      <div className="chart-card">
        <div className="sec-header">
          <div className="sec-title">Contas a Pagar — Próximos Vencimentos</div>
          <span style={{ fontSize: '11px', color: 'var(--text2)' }}>{pendentesPag.length} contas pendentes</span>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr><th>Descrição</th><th>Categoria</th><th>Vencimento</th><th>Valor</th><th>Status</th></tr>
            </thead>
            <tbody>
              {pendentesPag.map((p: any, i: number) => (
                <tr key={i}>
                  <td>{p.descricao}</td>
                  <td>{p.categoria}</td>
                  <td>{p.vencimento}</td>
                  <td>{formatoBRL.format(p.valor)}</td>
                  <td>
                    <span className={`badge ${p.status === 'atrasado' ? 'down' : 'neutral'}`}>
                      {p.status === 'atrasado' ? 'Atrasado' : 'A vencer'}
                    </span>
                  </td>
                </tr>
              ))}
              {pendentesPag.length === 0 && <tr><td colSpan={5}>Nenhuma conta pendente.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}