import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react';

interface PasswordInputAreaProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  strengthLabel: 'Weak' | 'Medium' | 'Strong';
  score: number;
}

export default function PasswordInputArea({ value, onChange, onClear, strengthLabel, score }: PasswordInputAreaProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const getIntensityBorderColor = () => {
    if (!value) return 'border-slate-200 dark:border-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500/25';
    if (score >= 7) return 'border-emerald-500/80 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/20';
    if (score >= 4) return 'border-amber-500/80 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/20';
    return 'border-rose-400/80 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/20';
  };

  const getIntensityBadgeColor = () => {
    if (score >= 7) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200';
    if (score >= 4) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-250';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <label htmlFor="main-password-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
          Analyze Password
        </label>
        {value && (
          <span className={`text-[10px] font-bold uppercase font-sans px-2.5 py-0.5 rounded-full border ${getIntensityBadgeColor()}`}>
            {strengthLabel} ({value.length} Chars)
          </span>
        )}
      </div>

      <div className={`relative flex items-center bg-slate-50/40 dark:bg-slate-950/10 border rounded-xl overflow-hidden transition-all duration-200 ${getIntensityBorderColor()}`}>
        <input
          id="main-password-input"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter a password to analyze..."
          className="w-full pl-4 pr-32 py-4 bg-transparent outline-none text-slate-900 dark:text-slate-100 font-mono text-base placeholder-slate-400"
          autoFocus
        />

        {/* Floating Action Bar */}
        <div className="absolute right-2 flex items-center gap-1.5">
          {value && (
            <button
              onClick={onClear}
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              title="Clear entry"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowPassword(!showPassword)}
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopyToClipboard}
            type="button"
            disabled={!value}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-40"
            title="Copy password"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Immediate Visual Feedback Strip */}
      <div className="mt-3 flex gap-1 h-1 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-850">
        <div
          className={`h-full transition-all duration-300 ${
            score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: value ? `${(score || 1) * 10}%` : '0%' }}
        />
      </div>

      {!value && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans mt-3.5 leading-relaxed">
          💡 <strong>Security tip:</strong> Use a long phrase with random, disconnected words rather than single dictionary letters to achieve high natural entropy.
        </p>
      )}

      {value && value.length < 8 && (
        <div className="mt-3.5 flex items-center gap-2 text-rose-600 text-[11px] font-sans bg-rose-50/50 dark:bg-rose-950/10 p-2.5 rounded-lg border border-rose-100/40">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Critical Warning: Passwords below 8 characters are vulnerable to instant computing hash crack lists.</span>
        </div>
      )}
    </div>
  );
}
