import { Download, Eraser, FlaskConical } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useDocumentParser } from './hooks/useDocumentParser';
import { exportMetricsToExcel } from './utils/exportExcel';
import DashboardLayout from './components/DashboardLayout.jsx';
import FileUploader from './components/FileUploader.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import AutoChart from './components/AutoChart.jsx';
import DataTable from './components/DataTable.jsx';
import PrivacyBanner from './components/PrivacyBanner.jsx';

export default function App() {
  const { isDark, toggleTheme } = useTheme();
  const { status, progress, error, parsed, metrics, analyze, loadSample, reset } = useDocumentParser();

  return (
    <DashboardLayout isDark={isDark} onToggleTheme={toggleTheme}>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-700 dark:text-teal-400">Document intelligence</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Turn PDFs into charts and spreadsheets</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Drop a PDF or text file. PDFInsightsAI extracts numbers locally with PDF.js, auto-builds Chart.js graphs,
            and lets you download Excel workbooks with SheetJS. No backend, no API keys.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <FlaskConical className="h-4 w-4" />
            Load sample report
          </button>
          <button
            type="button"
            disabled={!metrics}
            onClick={() => exportMetricsToExcel(metrics, parsed)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-600 dark:hover:bg-teal-500"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === 'idle'}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
          >
            <Eraser className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      <FileUploader onFile={analyze} disabled={status === 'parsing'} progress={progress} status={status} />

      <PrivacyBanner />

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300">
          {error}
        </p>
      )}

      {metrics && (
        <div className="mt-8 space-y-8">
          <SummaryCards summary={metrics.summary} />
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Auto charts</h2>
              <p className="text-xs text-slate-400">{metrics.charts.length} generated</p>
            </div>
            <AutoChart charts={metrics.charts} isDark={isDark} />
          </section>
          <section className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <h2 className="mb-4 text-lg font-semibold">Extracted table</h2>
              <DataTable rows={metrics.tableExport} />
            </div>
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Text preview</h2>
              <pre className="max-h-[420px] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-600 shadow-card scrollbar-thin dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                {metrics.preview || 'No extractable text.'}
              </pre>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
