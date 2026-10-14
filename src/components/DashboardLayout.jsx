import { BarChart3, FileSpreadsheet, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

export default function DashboardLayout({ isDark, onToggleTheme, children }) {
  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.16),transparent_32%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_28%)]" />
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">PDFInsightsAI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Local PDF analytics</p>
            </div>
          </div>
          <div className="hidden items-center gap-4 text-xs text-slate-500 md:flex">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              100% client-side
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-teal-600" />
              Excel export
            </span>
          </div>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
