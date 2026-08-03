const formatoBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const formatoNumero = new Intl.NumberFormat('pt-BR');

export type KpiBadgeVariant = 'up' | 'down' | 'neutral' | 'dash';

export type KpiBadge = {
  /** Texto do badge. Não usado quando variant='dash' (mostra só "—"). */
  texto?: string;
  variant: KpiBadgeVariant;
};

export type Kpi = {
  label: string;
  valor: number;
  /** Cor do valor principal — precisa bater com .kpi-val.green/.red/.blue no CSS */
  cor?: 'red' | 'green' | 'blue';
  /** 'moeda' (padrão, R$) ou 'numero' (para o toggle "Qtde") */
  formato?: 'moeda' | 'numero';
  /** Se definido, mostra esse texto no lugar do valor formatado (ex: "35 / 203", "N/D") — `valor` continua obrigatório mas é ignorado nesse caso. */
  valorTexto?: string;
  badge?: KpiBadge;
  /** Texto secundário do rodapé, ex: "vs. mês anterior" ou "Mai/2026" */
  sub?: string;
};

const seta: Record<'up' | 'down', string> = { up: '▲', down: '▼' };

function formatarValor(k: Kpi) {
  if (k.formato === 'numero') return formatoNumero.format(k.valor);
  const abs = formatoBRL.format(Math.abs(k.valor));
  // negativo vira "(R$ 687.032,00)", igual ao padrão contábil do DRE
  return k.valor < 0 ? `(${abs})` : abs;
}

function renderBadge(b: KpiBadge) {
  if (b.variant === 'dash') return '—';
  if (b.variant === 'neutral') return b.texto ?? '';
  return `${seta[b.variant]} ${b.texto ?? ''}`;
}

export default function KpiRow({
  kpis,
  variant = 'row',
}: {
  kpis: Kpi[];
  /** 'row' = 4 colunas (.kpi-row) | 'six' = 6 colunas (.kpi-row-6, usado no DRE) */
  variant?: 'row' | 'six';
}) {
  return (
    <div className={variant === 'six' ? 'kpi-row-6' : 'kpi-row'}>
      {kpis.map((k) => (
        <div key={k.label} className="kpi">
          <div className="kpi-label">{k.label}</div>
          <div className={`kpi-val ${k.cor ?? ''}`}>{k.valorTexto ?? formatarValor(k)}</div>

          {(k.badge || k.sub) && (
            <div className="kpi-footer">
              {k.badge && (
                <span className={`badge ${k.badge.variant === 'dash' ? '' : k.badge.variant}`}>
                  {renderBadge(k.badge)}
                </span>
              )}
              {k.sub && <span className="kpi-sub">{k.sub}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}