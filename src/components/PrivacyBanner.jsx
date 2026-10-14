import { CreditCard, Lock, ShieldCheck, Zap } from 'lucide-react';

const BENEFITS = [
  {
    icon: Lock,
    title: '100% Local & Private',
    body: 'Your PDFs never leave your browser. Zero cloud uploads, zero data tracking.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    body: 'Parsed locally in milliseconds—no waiting for server response times or queue delays.',
  },
  {
    icon: CreditCard,
    title: 'No Hidden Fees',
    body: 'Free to parse documents offline without hidden API limits or server timeouts.',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Data Security',
    body: 'Ideal for sensitive financial reports, legal paperwork, and private spreadsheets.',
  },
];

export default function PrivacyBanner() {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-card dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          Privacy first
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Why choose PDFInsightsAI</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Built for people who cannot send confidential documents to someone else’s server.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <article
              key={benefit.title}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{benefit.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
