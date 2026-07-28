import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);
ChartJS.defaults.color = '#8ba0c4';
ChartJS.defaults.borderColor = 'rgba(59,130,246,0.1)';
ChartJS.defaults.font.family = 'Inter, system-ui, sans-serif';
ChartJS.defaults.font.size = 11;