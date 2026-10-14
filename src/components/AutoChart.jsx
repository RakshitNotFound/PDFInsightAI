import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const PALETTE = ['#0d9488', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'];

function buildData(chart, isDark) {
  const grid = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(148, 163, 184, 0.28)';
  const tick = isDark ? '#cbd5e1' : '#475569';

  return {
    data: {
      labels: chart.labels,
      datasets: chart.datasets.map((dataset, index) => {
        const color = PALETTE[index % PALETTE.length];
        const isFill = chart.type === 'line' || chart.type === 'doughnut';
        return {
          ...dataset,
          backgroundColor:
            chart.type === 'doughnut'
              ? chart.labels.map((_, i) => PALETTE[i % PALETTE.length])
              : chart.type === 'line'
                ? `${color}33`
                : color,
          borderColor: color,
          borderWidth: chart.type === 'line' ? 2 : 0,
          fill: isFill && chart.type === 'line',
          tension: 0.35,
          borderRadius: 8,
          maxBarThickness: 42,
        };
      }),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chart.datasets.length > 1 || chart.type === 'doughnut',
          labels: { color: tick, boxWidth: 12, usePointStyle: true },
        },
        tooltip: {
          backgroundColor: isDark ? '#0f172a' : '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
        },
      },
      scales:
        chart.type === 'doughnut'
          ? {}
          : {
              x: {
                ticks: { color: tick, maxRotation: 45, minRotation: 0 },
                grid: { display: false },
              },
              y: {
                ticks: { color: tick },
                grid: { color: grid },
              },
            },
    },
  };
}

function ChartBody({ chart, isDark }) {
  const { data, options } = buildData(chart, isDark);
  if (chart.type === 'line') return <Line data={data} options={options} />;
  if (chart.type === 'doughnut') return <Doughnut data={data} options={options} />;
  return <Bar data={data} options={options} />;
}

export default function AutoChart({ charts, isDark }) {
  if (!charts?.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No chartable metrics were found. Try a report with labeled numbers such as
        {' '}
        <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">Revenue: 12000</code>
        {' '}
        or a simple table.
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {charts.map((chart) => (
        <section
          key={chart.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{chart.title}</h3>
          <div className="h-72">
            <ChartBody chart={chart} isDark={isDark} />
          </div>
        </section>
      ))}
    </div>
  );
}
