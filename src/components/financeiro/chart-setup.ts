import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
} from 'chart.js';
import { pluginCentroDonut } from './chart-theme';

// Registra elementos + escalas + CONTROLLERS. Sem os *Controller o Chart.js
// quebra com "X is not a registered controller" ao criar o gráfico —
// faltavam aqui, cobrindo só parte dos tipos usados nas 4 telas
// (bar, bar horizontal, line, doughnut, combo bar+line).
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  PointElement,
  LineElement,
  LineController,
  ArcElement,
  DoughnutController,
  Tooltip,
  Legend,
  pluginCentroDonut
);

ChartJS.defaults.color = '#8ba0c4';
ChartJS.defaults.borderColor = 'rgba(59,130,246,0.1)';
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 11;