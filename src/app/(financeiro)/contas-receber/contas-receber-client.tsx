'use client';

import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import KpiRow, { Kpi } from '@/components/financeiro/kpi-row';
import { CORES, opcoesBase, opcoesDonut, datasetBarraGradiente } from '@/components/financeiro/chart-theme';
import type { DadosFinanceiro } from '@/lib/financeiro';
import '@/components/financeiro/chart-setup';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const formatoCompacto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' });

export default function ContasReceberClient({
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
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (ano === anoInicial && mes === '') return;
    setCarregando(true);
    const query = `/api/v1/financeiro?clienteId=${clienteId}&ano=${ano}${mes ? `&mes=${mes}` : ''}`;
    fetch(query)
      .then((r) => r.json())
      .then(setDados)
      .finally(() => setCarregando(false));
  }, [clienteId, ano, mes, anoInicial]);

  const { kpisRec, meses, abertoRecPorMes } = dados;
  const rotuloPeriodo = mes ? `${MESES[mes - 1]}/${ano}` : `${ano}`;
  const totalDonut = kpisRec.vencidas + kpisRec.aVencer + kpisRec.recebidas;

  const kpis: Kpi[] = [
    { label: 'Transações Vencidas', valor: kpisRec.vencidas, cor: 'red' },
    { label: 'Transações A Vencer', valor: kpisRec.aVencer, cor: 'blue', badge: { variant: 'neutral', texto: '— novo' } },
    { label: 'Transações Recebidas', valor: kpisRec.recebidas, cor: 'green' },
    { label: 'Total do Período', valor: kpisRec.total },
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

      <div className="charts-21">
        <div className="chart-card">
          <div className="chart-title">Recebidos por Mês</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Bar
              data={{
                labels: MESES,
                datasets: [datasetBarraGradiente(meses.map((m: any) => m.recTotal), CORES.verde)],
              }}
              options={opcoesBase}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">% Status a Receber</div>
          <div className="chart-wrap" style={{ height: '230px' }}>
            <Doughnut
              data={{
                labels: ['Vencidas', 'A Vencer', 'Recebidas'],
                datasets: [{
                  data: [kpisRec.vencidas, kpisRec.aVencer, kpisRec.recebidas],
                  backgroundColor: [CORES.vermelho, CORES.azul, CORES.verde],
                  borderWidth: 0,
                  hoverOffset: 8,
                }],
              }}
              options={{
                ...opcoesDonut,
                cutout: '74%',
                _centroTexto: { valor: formatoCompacto.format(totalDonut), label: 'Total' },
              } as any}
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
                  { ...datasetBarraGradiente(abertoRecPorMes.map((m: any) => m.aVencer), CORES.azulEscuro), label: 'A Vencer', stack: 's', maxBarThickness: 28 },
                  { ...datasetBarraGradiente(abertoRecPorMes.map((m: any) => m.vencidos), CORES.vermelho), label: 'Vencidos', stack: 's', maxBarThickness: 28 },
                ],
              }}
              options={{
                ...opcoesBase,
                plugins: { ...opcoesBase.plugins, legend: { display: true } },
                scales: {
                  x: { ...(opcoesBase.scales as any).x, stacked: true },
                  y: { ...(opcoesBase.scales as any).y, stacked: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}