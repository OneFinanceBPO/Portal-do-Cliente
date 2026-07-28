const formatoBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export type Kpi = { label: string; valor: number; cor?: 'red' | 'green' | 'blue' };

export default function KpiRow({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="kpi-row">
      {kpis.map((k) => (
        <div key={k.label} className="kpi">
          <div className="kpi-label">{k.label}</div>
          <div className={`kpi-val ${k.cor ?? ''}`}>{formatoBRL.format(k.valor)}</div>
        </div>
      ))}
    </div>
  );
}