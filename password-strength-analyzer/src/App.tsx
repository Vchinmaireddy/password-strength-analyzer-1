import { useState, useEffect } from 'react';
import { analyzePassword } from './utils/passwordAnalyzer';
import Header from './components/Header';
import PasswordInputArea from './components/PasswordInputArea';
import MetricsMeter from './components/MetricsMeter';
import SecureGenerator from './components/SecureGenerator';
import HistoryVault from './components/HistoryVault';
import { ShieldCheck, Sparkles, Database, Shield, Sun, Moon } from 'lucide-react';

export default function App() {
  const [password, setPassword] = useState('');
  const [isReused, setIsReused] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'vault'>('generator');
  const [darkMode, setDarkMode] = useState(false);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle password transfer from generator
  const handleUseGeneratedPassword = (newPasswd: string) => {
    setPassword(newPasswd);
    // Smooth scroll to analyzer area on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const metrics = analyzePassword(password);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Upper Theme Control Strip */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 px-4 md:px-8 py-2.5 flex justify-end">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-all font-sans text-xs flex items-center gap-2 cursor-pointer"
          title="Toggle dark mode theme"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-teal-600" />
              <span>Dark Theme</span>
            </>
          )}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <Header />

        {/* Dynamic Grid Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Core Analysis Hub (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            <PasswordInputArea
              value={password}
              onChange={setPassword}
              onClear={() => setPassword('')}
              strengthLabel={metrics.strength}
              score={metrics.score}
            />

            <MetricsMeter
              metrics={metrics}
              isReused={isReused}
            />
          </div>

          {/* Auxiliary Tools Hub (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tab Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-1.5 rounded-xl flex">
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Password Generator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('vault')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'vault'
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <Database className="w-4 h-4" />
                History &amp; Reuse
              </button>
            </div>

            {/* Conditionally rendered utility tools with layout wrapping */}
            <div className="transition-all duration-300">
              {activeTab === 'generator' ? (
                <SecureGenerator onUseGeneratedPassword={handleUseGeneratedPassword} />
              ) : (
                <HistoryVault
                  currentPasswordText={password}
                  onReuseCheckResult={setIsReused}
                />
              )}
            </div>

            {/* Quick Educational Notice */}
            <div className="bg-teal-50/40 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-900/30 p-5 rounded-2xl flex gap-3">
              <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
                  Uncompromising Protection Standards
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-1 leading-relaxed">
                  Calculations run entirely client-side. Characters represent standard thermodynamic resistance values and are never broadcasted or logged remotely.
                </p>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
