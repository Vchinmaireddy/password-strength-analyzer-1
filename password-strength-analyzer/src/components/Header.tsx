import { ShieldCheck, ShieldAlert, KeyRound } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full max-w-5xl mx-auto mb-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-900 dark:text-slate-550">
              Password Strength Analyzer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans mt-0.5">
              Check cryptographic resilience, calculate entropy, and manage reuse history securely in your browser.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800/80">
          <ShieldCheck className="w-4 h-4 text-teal-500" />
          <span>Local Hashing Active (SHA-256)</span>
        </div>
      </div>
    </header>
  );
}
