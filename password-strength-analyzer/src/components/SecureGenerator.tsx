import { useState, useEffect } from 'react';
import { generatePassword } from '../utils/passwordAnalyzer';
import { GeneratorSettings } from '../types';
import { Shuffle, Copy, Check, Info } from 'lucide-react';

interface SecureGeneratorProps {
  onUseGeneratedPassword: (passwd: string) => void;
}

export default function SecureGenerator({ onUseGeneratedPassword }: SecureGeneratorProps) {
  const [settings, setSettings] = useState<GeneratorSettings>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
  });

  const [generated, setGenerated] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-generate on first load
  useEffect(() => {
    handleGenerate();
  }, []);

  const handleGenerate = () => {
    const passwd = generatePassword(settings);
    setGenerated(passwd);
    setCopied(false);
  };

  const handleCopyToClipboard = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleToggle = (key: keyof Omit<GeneratorSettings, 'length'>) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      // Keep at least one format checked to prevent empty pools
      if (!updated.includeUppercase && !updated.includeLowercase && !updated.includeNumbers && !updated.includeSymbols) {
        return prev;
      }
      return updated;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-sans">
          Secure Password Generator
        </h3>
        <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider font-sans border border-teal-100/40 dark:border-teal-900/10">
          Recommended
        </span>
      </div>

      {/* Password Output Area */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-6">
        <div className="flex-1 min-w-0 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 rounded-xl px-4 py-3 font-mono text-base break-all select-all flex items-center text-slate-800 dark:text-slate-200 min-h-[50px]">
          {generated || <span className="text-slate-400">Settings invalid</span>}
        </div>
        <div className="flex self-stretch gap-2">
          <button
            onClick={handleCopyToClipboard}
            type="button"
            className="flex-1 sm:flex-initial p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center min-w-[48px]"
            title="Copy password"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
          <button
            onClick={handleGenerate}
            type="button"
            className="flex-1 sm:flex-initial p-3 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-400 border border-teal-100/40 dark:border-teal-900/20 rounded-xl transition-all flex items-center justify-center min-w-[48px]"
            title="Regenerate"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        {/* Length Control */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-sans uppercase tracking-wider">
              Length: {settings.length}
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {settings.length < 12 ? '⚠️ Needs length' : settings.length < 16 ? '👍 Satisfactory' : '🔒 Excellent'}
            </span>
          </div>
          <input
            type="range"
            min="6"
            max="64"
            value={settings.length}
            onChange={e => {
              setSettings(prev => ({ ...prev, length: parseInt(e.target.value) }));
            }}
            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        {/* Binary Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={settings.includeUppercase}
              onChange={() => handleToggle('includeUppercase')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 rounded-md accent-teal-600"
            />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Uppercase Letters</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">A-Z characters</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={settings.includeLowercase}
              onChange={() => handleToggle('includeLowercase')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 rounded-md accent-teal-600"
            />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Lowercase Letters</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">a-z characters</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={settings.includeNumbers}
              onChange={() => handleToggle('includeNumbers')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 rounded-md accent-teal-600"
            />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Numeric Digits</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">0-9 numbers</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer select-none transition-all">
            <input
              type="checkbox"
              checked={settings.includeSymbols}
              onChange={() => handleToggle('includeSymbols')}
              className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 rounded-md accent-teal-600"
            />
            <div>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">Special Symbols</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">!@#$%^&amp;*() etc.</p>
            </div>
          </label>
        </div>

        {/* Exclusion helper */}
        <label className="flex items-center gap-3 p-3 rounded-xl border border-dotted border-slate-200 dark:border-slate-700/80 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 cursor-pointer select-none transition-all">
          <input
            type="checkbox"
            checked={settings.excludeSimilar}
            onChange={() => handleToggle('excludeSimilar')}
            className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500 rounded-md accent-teal-600"
          />
          <div className="flex-1">
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              Avoid similar/homoglyph characters
              <Info className="w-3.5 h-3.5 text-slate-400" title="Excludes: l, 1, I, o, 0, O, etc." />
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Avoids reader confusion during direct entry</p>
          </div>
        </label>

        {/* Use Action Button */}
        <button
          onClick={() => onUseGeneratedPassword(generated)}
          type="button"
          disabled={!generated}
          className="w-full mt-2 py-3 bg-teal-600 text-white font-semibold text-sm rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Check This Generated Password
        </button>
      </div>
    </div>
  );
}
