import { PasswordMetrics } from '../types';
import { CheckCircle2, XCircle, Info, ShieldAlert, Zap, Orbit, Layers } from 'lucide-react';

interface MetricsMeterProps {
  metrics: PasswordMetrics;
  isReused: boolean;
}

export default function MetricsMeter({ metrics, isReused }: MetricsMeterProps) {
  const {
    length,
    hasUppercase,
    hasLowercase,
    hasDigits,
    hasSpecial,
    entropy,
    entropyLabel,
    score,
    strength,
    suggestions,
    warnings,
    poolSize
  } = metrics;

  // Visual helper styles for scores
  const getProgressColorClass = (val: number) => {
    if (val >= 7) return 'bg-emerald-500';
    if (val >= 4) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getTextColorClass = (val: number) => {
    if (val >= 7) return 'text-emerald-500 dark:text-emerald-400';
    if (val >= 4) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getBorderColorClass = (val: number) => {
    if (val >= 7) return 'border-emerald-100 dark:border-emerald-900/30';
    if (val >= 4) return 'border-amber-100 dark:border-amber-900/30';
    return 'border-rose-100 dark:border-rose-900/30';
  };

  const getBgColorClass = (val: number) => {
    if (val >= 7) return 'bg-emerald-500/10';
    if (val >= 4) return 'bg-amber-500/10';
    return 'bg-rose-500/10';
  };

  // Checkbox helper rendering
  const CheckItem = ({ checked, label, desc }: { checked: boolean; label: string; desc: string }) => (
    <div className="flex items-start gap-2.5 p-2 bg-slate-550/40 dark:bg-slate-950/20 rounded-lg border border-slate-100 dark:border-slate-800/40">
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-650 shrink-0 mt-0.5" />
      )}
      <div>
        <span className={`text-xs font-semibold block ${checked ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400'}`}>
          {label}
        </span>
        <span className="text-[10px] text-slate-400 block">{desc}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Visual Level Card */}
      <div className={`border p-6 rounded-2xl transition-all ${getBorderColorClass(score)} ${getBgColorClass(score)}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Security Score</span>
            <div className="text-3xl font-bold font-sans flex items-baseline gap-1.5 mt-0.5">
              <span className={getTextColorClass(score)}>{score}</span>
              <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">/ 10</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest font-bold text-slate-500">Verdict</span>
            <div className={`text-2xl font-bold font-sans uppercase mt-0.5 ${getTextColorClass(score)}`}>
              {strength}
            </div>
          </div>
        </div>

        {/* Level Indicator Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-1 p-0.5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-full flex-1 rounded-sm transition-all duration-300 ${
                idx < score ? getProgressColorClass(score) : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between mt-2.5 text-[10px] text-slate-400 font-mono">
          <span>0 (Critical)</span>
          <span>5 (Moderate)</span>
          <span>10 (Military-Grade)</span>
        </div>
      </div>

      {/* Warnings panel, if any */}
      {(warnings.length > 0 || isReused) && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>CRITICAL WARNINGS:</span>
          </div>
          <ul className="space-y-1.5 pl-5 text-rose-700 dark:text-rose-400 text-xs list-disc">
            {isReused && <li>Password reuse flag activated: Identified in saved databases.</li>}
            {warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Character Parameters Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans mb-3">
          Requirement Parameters
        </h4>
        <div className="grid grid-cols-2 gap-2.5">
          <CheckItem checked={length >= 12} label="Length &ge; 12" desc={`${length} chars provided`} />
          <CheckItem checked={hasUppercase} label="Uppercase (A-Z)" desc="Capital letters included" />
          <CheckItem checked={hasLowercase} label="Lowercase (a-z)" desc="Small letters included" />
          <CheckItem checked={hasDigits} label="Numbers (0-9)" desc="Numeric values used" />
          <CheckItem checked={hasSpecial} label="Symbols (!@#)" desc="Special characters included" />
        </div>
      </div>

      {/* Thermodynamic Entropy stats */}
      <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans mb-4 flex items-center gap-1.5">
          <Orbit className="w-4 h-4 text-teal-500" />
          Shannon Entropy Evaluation
        </h4>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Shannon Entropy
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 block">
              {entropy.toFixed(1)} <span className="text-xs text-slate-500">bits</span>
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              Character Pool (R)
            </span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 block">
              {poolSize} <span className="text-xs text-slate-500">keys</span>
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-sans flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Guessing Guesswork Label:
            </span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[10px] font-sans ${
              entropyLabel === 'Very High' || entropyLabel === 'High'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                : entropyLabel === 'Moderate'
                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
            }`}>
              {entropyLabel}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans bg-white dark:bg-slate-950/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
            {entropy < 35 ? (
              <span>🔴 <strong>Weak:</strong> Can be cracked instantly. Add uppercase, symbols, and extend the length above 12 characters.</span>
            ) : entropy < 60 ? (
              <span>🟡 <strong>Moderate:</strong> Defends against basic dictionary attacks but remains prone to distributed custom pattern matching.</span>
            ) : (
              <span>🟢 <strong>Cryptographically Safe:</strong> Possesses over 10^18 permutations. Immune to standard offline bruteforce arrays.</span>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Actions panel */}
      <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 p-4 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-550 uppercase tracking-widest font-sans flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-500" />
          Aesthetic Improvements Suggestions
        </h4>
        <ul className="space-y-2 text-slate-650 dark:text-slate-350 text-xs">
          {suggestions.map((suggestion, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-teal-500 shrink-0 select-none">•</span>
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
