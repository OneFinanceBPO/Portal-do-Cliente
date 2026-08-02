'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import KpiRow from '@/components/financeiro/kpi-row';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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

  const { kpisRec, kpisPag, meses, saldoMensal } = dados;
  const geracaoCaixa = kpisRec.recebidas - kpisPag.pagas;
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
        { label: 'Total Recebidos', valor: kpisRec.recebidas, cor: 'green' },
        { label: 'Total Pagos', valor: kpisPag.pagas, cor: 'red' },
        { label: 'Geração de Caixa', valor: geracaoCaixa, cor: geracaoCaixa >= 0 ? 'green' : 'red' },
        { label: 'Total do Período', valor: kpisRec.recebidas + kpisPag.pagas, cor: 'blue' },
      ]} />

      <div className="chart-card">
        <div className="chart-title">Evolução do Fluxo de Caixa — {rotuloPeriodo}</div>
        <div className="chart-wrap" style={{ height: '260px' }}>
          <Line
            data={{
              labels: MESES,
              datasets: [
                { label: 'Recebido', data: meses.map((m: any) => m.recTotal), borderColor: '#22c55e', backgroundColor: 'transparent' },
                { label: 'Pago', data: meses.map((m: any) => m.pagTotal), borderColor: '#f43f5e', backgroundColor: 'transparent' },
                { label: 'Saldo', data: saldoMensal, borderColor: '#3b82f6', backgroundColor: 'transparent' },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
    </div>
  );
}