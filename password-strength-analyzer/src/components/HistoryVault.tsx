import { useState, useEffect } from 'react';
import { PasswordHistoryItem } from '../types';
import { hashPasswordSHA256 } from '../utils/passwordAnalyzer';
import { ShieldAlert, Database, Trash2, Calendar, Lock } from 'lucide-react';

interface HistoryVaultProps {
  currentPasswordText: string;
  onReuseCheckResult: (isReused: boolean) => void;
}

export default function HistoryVault({ currentPasswordText, onReuseCheckResult }: HistoryVaultProps) {
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);
  const [label, setLabel] = useState('Google Workspace');
  const [isSaved, setIsSaved] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  // Initialize and load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('password_hash_vault');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse history vault', err);
      }
    }
  }, []);

  // Check in real-time if the current text matches any in the history vault
  useEffect(() => {
    const runCheck = async () => {
      if (!currentPasswordText) {
        setIsMatch(false);
        onReuseCheckResult(false);
        return;
      }
      const hashed = await hashPasswordSHA256(currentPasswordText);
      const matched = history.some(item => item.hashedValue === hashed);
      setIsMatch(matched);
      onReuseCheckResult(matched);
    };

    runCheck();
  }, [currentPasswordText, history]);

  const saveToHistory = async () => {
    if (!currentPasswordText) return;
    const hashed = await hashPasswordSHA256(currentPasswordText);
    
    // Check if simple duplication
    if (history.some(item => item.hashedValue === hashed)) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
      return;
    }

    const newItem: PasswordHistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      hashedValue: hashed,
      timestamp: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      label: label.trim() || 'General Vault',
    };

    const updated = [newItem, ...history];
    setHistory(updated);
    localStorage.setItem('password_hash_vault', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearHistory = () => {
    if (window.confirm('Wipe history? This permanently flushes simulated SHA-256 hashes.')) {
      setHistory([]);
      localStorage.removeItem('password_hash_vault');
      onReuseCheckResult(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-sans flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          Reuse Prevention Vault
        </h3>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs hover:text-rose-600 text-slate-400 dark:text-slate-500 font-sans flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Data
          </button>
        )}
      </div>

      {isMatch && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 rounded-xl border border-rose-100 dark:border-rose-900/30 text-xs mb-5 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block font-sans">⚠️ Alert: Password Reuse Detected!</span>
            This exact password matches an entry already registered in your vault. Reusing identical passwords exposes all configured portals to credential stuffing attacks!
          </div>
        </div>
      )}

      {/* Simulator Actions */}
      <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100/60 dark:border-slate-800/60 mb-6">
        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans mb-3.5 leading-relaxed">
          Simulate secure backend storage. Registering a password saves a <strong>one-way SHA-256 cryptographic hash</strong> in local storage. Plaintext credentials are never saved.
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans mb-1">
              Credential Vault Label
            </label>
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="e.g. Google Workspace, Amazon"
              className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 font-sans"
            />
          </div>

          <button
            type="button"
            disabled={!currentPasswordText}
            onClick={saveToHistory}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-850 dark:hover:bg-slate-750 text-white font-medium text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            {isSaved ? 'Hashed & Saved!' : 'Register Hashed Password'}
          </button>
        </div>
      </div>

      {/* Registered hashes view */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans mb-3 flex items-center gap-1.5">
          Saved Credentials Vault ({history.length})
        </h4>

        {history.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-sans bg-slate-50/40 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80">
            No hashed historical records. Register a password above.
          </div>
        ) : (
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {history.map(item => {
              const currentHashedToCheck = currentPasswordText ? true : false;
              // Check if current matches
              return (
                <div
                  key={item.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-4 transition-all ${
                    currentPasswordText && isMatch && history.some(sh => sh.hashedValue === item.hashedValue && sh.id === item.id)
                      ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40'
                      : 'bg-white dark:bg-slate-950/30 border-slate-100 dark:border-slate-800/80'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate font-sans">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[170px]" title={item.hashedValue}>
                      SHA-256: {item.hashedValue.substring(0, 16)}...
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
