import { Chart, ChartOptions } from 'chart.js';

export const CORES = {
  verde: '#22c55e',
  vermelho: '#f43f5e',
  azul: '#3b82f6',
  azulEscuro: '#2563eb',
  amarelo: '#facc15', // linha de Saldo/Lucro Líquido (fluxo-caixa e dre)
  laranja: '#fb923c',
  roxo: '#8b5cf6',
  cinza: '#4a6080',      // texto/eixos mutados
  cinzaMedio: '#6b7280', // categoria neutra em donut (ex: "Perda")
};

// Paleta pra gráficos com muitas categorias (ex: Pagos por Categoria)
export const PALETA_CATEGORIAS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#a78bfa', '#c084fc', '#e879f9', '#fb923c', '#facc15', '#4ade80'];

export function gradiente(ctx: CanvasRenderingContext2D, corHex: string, altura = 240) {
  const g = ctx.createLinearGradient(0, 0, 0, altura);
  g.addColorStop(0, corHex);
  g.addColorStop(1, `${corHex}22`);
  return g;
}

const formatoBRL = (v: number) => 'R$ ' + Number(v).toLocaleString('pt-BR');
const formatoCompacto = (v: number) => 'R$ ' + (Number(v) / 1000).toFixed(0) + 'k';

// Tooltip universal: funciona pra bar vertical (usa .y), bar horizontal
// (usa .x), doughnut/pie (usa .parsed direto) e combo bar+line.
function labelMoeda(ctx: any) {
  const v = ctx.parsed?.x ?? ctx.parsed?.y ?? ctx.parsed ?? ctx.raw;
  const prefixo = ctx.dataset?.label ? `${ctx.dataset.label}: ` : '';
  return `${prefixo}${formatoBRL(v)}`;
}

const legendaBase = {
  labels: {
    usePointStyle: true,
    pointStyle: 'circle' as const,
    boxWidth: 8,
    padding: 16,
    color: '#8ba0c4',
    font: { size: 11 },
  },
};

const tooltipBase = {
  backgroundColor: '#0f1840',
  borderColor: 'rgba(59,130,246,.25)',
  borderWidth: 1,
  titleColor: '#f0f4ff',
  bodyColor: '#8ba0c4',
  padding: 10,
  cornerRadius: 8,
  titleFont: { size: 12, weight: 'bold' as const },
  bodyFont: { size: 12 },
};

/** Bar vertical / line vertical — eixo Y tem os valores (Pagos por Mês, Recebidos por Mês, Em Aberto, DRE evolução). */
export const opcoesBase: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false, ...legendaBase },
    tooltip: { ...tooltipBase, callbacks: { label: labelMoeda } },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#4a6080', font: { size: 10 } },
    },
    y: {
      grid: { color: 'rgba(59,130,246,0.07)' },
      border: { display: false },
      ticks: { color: '#4a6080', font: { size: 10 }, callback: (v: any) => formatoCompacto(v) },
    },
  },
};

/** Bar horizontal (indexAxis:'y') — eixo X tem os valores. Usado em "Pagos por Categoria". */
export const opcoesBarraHorizontal: ChartOptions<any> = {
  ...opcoesBase,
  indexAxis: 'y',
  scales: {
    x: {
      grid: { color: 'rgba(59,130,246,0.07)' },
      ticks: { color: '#4a6080', font: { size: 10 }, callback: (v: any) => formatoCompacto(v) },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#4a6080', font: { size: 10 } },
    },
  },
};

/** Line multi-série com legenda (ex: evolução DRE, combo do fluxo de caixa). */
export const opcoesLinha: ChartOptions<any> = {
  ...opcoesBase,
  plugins: {
    ...opcoesBase.plugins,
    legend: { display: true, ...legendaBase },
  },
};

/** Doughnut com legenda embaixo e tooltip em % (ex: "% Status a Receber"). */
export const opcoesDonut: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { position: 'bottom', ...legendaBase, labels: { ...legendaBase.labels, pointStyleWidth: 8 } as any },
    tooltip: { ...tooltipBase, callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw}%` } },
  },
};

/** Monta um dataset de barra rápido, cor sólida. */
export function datasetBarra(data: number[], cor: string | string[], extra: Record<string, any> = {}) {
  return { data, backgroundColor: cor, borderRadius: 5, borderSkipped: false, ...extra };
}

/** Mesma coisa, mas com preenchimento em degradê (mais vivo que cor chapada) — usar em barras verticais. */
export function datasetBarraGradiente(data: number[], corHex: string, extra: Record<string, any> = {}) {
  return {
    data,
    backgroundColor: (ctx: any) => {
      const chart = ctx.chart;
      if (!chart.chartArea) return corHex; // primeira passada de layout, ainda sem área calculada
      return gradiente(chart.ctx, corHex, chart.chartArea.bottom);
    },
    borderRadius: 6,
    borderSkipped: false,
    maxBarThickness: 34,
    ...extra,
  };
}

/** Monta um dataset de linha rápido, com preenchimento em degradê por padrão (ex: séries do DRE, Saldo do fluxo de caixa). */
export function datasetLinha(
  label: string,
  data: number[],
  corHex: string,
  opts: { preencher?: boolean; tension?: number; extra?: Record<string, any> } = {}
) {
  const { preencher = true, tension = 0.4, extra = {} } = opts;
  return {
    label,
    data,
    borderColor: corHex,
    backgroundColor: preencher ? `${corHex}0f` : 'transparent',
    borderWidth: 2,
    pointRadius: 4,
    pointBackgroundColor: corHex,
    fill: preencher,
    tension,
    ...extra,
  };
}

export const pluginCentroDonut = {
  id: 'centroDonut',
  afterDraw(chart: Chart) {
    if (chart.config.type !== 'doughnut') return;
    const meta: any = (chart.config as any)._centroTexto;
    if (!meta) return;

    const { ctx, chartArea } = chart;
    const x = (chartArea.left + chartArea.right) / 2;
    const y = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f0f4ff';
    ctx.font = '700 16px Inter, sans-serif';
    ctx.fillText(meta.valor, x, y - 8);
    ctx.fillStyle = '#8ba0c4';
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillText(meta.label, x, y + 12);
    ctx.restore();
  },
};