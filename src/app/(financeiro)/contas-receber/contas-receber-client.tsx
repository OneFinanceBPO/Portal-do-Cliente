'use client';

import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import KpiRow from '@/components/financeiro/kpi-row';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function ContasReceberClient({ clienteId }: { clienteId: string }) {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState<number | ''>(''); // '' = todos os meses
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

  const { kpisRec, meses, abertoRecPorMes } = dados;
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
        { label: 'Transações Vencidas', valor: kpisRec.vencidas, cor: 'red' },
        { label: 'Transações A Vencer', valor: kpisRec.aVencer, cor: 'blue' },
        { label: 'Transações Recebidas', valor: kpisRec.recebidas, cor: 'green' },
        { label: 'Total do Período', valor: kpisRec.total },
      ]} />

      <div className="charts-21">
        <div className="chart-card">
          <div className="chart-title">Recebidos por Mês</div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Bar
              data={{
                labels: MESES,
                datasets: [{ label: 'Recebido', data: meses.map((m: any) => m.recTotal), backgroundColor: '#22c55e' }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">% Status a Receber</div>
          <div className="chart-wrap" style={{ height: '220px' }}>
            <Doughnut
              data={{
                labels: ['Vencidas', 'A Vencer', 'Recebidas'],
                datasets: [{ data: [kpisRec.vencidas, kpisRec.aVencer, kpisRec.recebidas], backgroundColor: ['#f43f5e', '#3b82f6', '#22c55e'] }],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      </div>

      <div className="charts-1">
        <div className="chart-card">
          <div className="chart-title">Em Aberto — A Vencer vs Vencidos ({rotuloPeriodo})</div>
          <div className="chart-wrap" style={{ height: '200px' }}>
            <Bar
              data={{
                labels: MESES,
                datasets: [
                  { label: 'A Vencer', data: abertoRecPorMes.map((m: any) => m.aVencer), backgroundColor: '#3b82f6', stack: 's' },
                  { label: 'Vencidos', data: abertoRecPorMes.map((m: any) => m.vencidos), backgroundColor: '#f43f5e', stack: 's' },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}