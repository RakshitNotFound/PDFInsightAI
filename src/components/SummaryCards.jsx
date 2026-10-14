import { FileStack, Hash, Sigma, Type } from 'lucide-react';
import { formatBytes } from '../utils/exportExcel';

function formatNumber(value) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Pages',
      value: formatNumber(summary.pageCount),
      hint: `${formatBytes(summary.fileSize)} · ${summary.kind.toUpperCase()}`,
      icon: FileStack,
    },
    {
      label: 'Words',
      value: formatNumber(summary.wordCount),
      hint: summary.fileName,
      icon: Type,
    },
    {
      label: 'Numbers found',
      value: formatNumber(summary.numberCount),
      hint: `${formatNumber(summary.uniqueNumberCount)} unique`,
      icon: Hash,
    },
    {
      label: 'Numeric range',
      value: `${formatNumber(summary.min)} – ${formatNumber(summary.max)}`,
      hint: `Avg ${formatNumber(summary.avg)}`,
      icon: Sigma,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 truncate text-2xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-1 truncate text-xs text-slate-400">{card.hint}</p>
          </article>
        );
      })}
    </div>
  );
}
