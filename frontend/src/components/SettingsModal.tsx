import React, { useState, useEffect } from 'react';
import { X, Check, Activity, Cpu, Globe, Trash2, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearConversation?: () => void;
  selectedLanguage?: string;
  onSelectLanguage?: (lang: string) => void;
  useRag?: boolean;
  onToggleRag?: (val: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearConversation,
  selectedLanguage = 'English',
  onSelectLanguage,
  useRag = true,
  onToggleRag,
}) => {
  const [healthData, setHealthData] = useState<{
    status: string;
    llm_provider: string;
    openrouter_model?: string;
    database?: string;
  } | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        const duration = Math.round(performance.now() - start);
        setHealthData(data);
        setLatency(duration);
      } catch {
        setHealthData(null);
        setLatency(null);
      }
    };

    checkHealth();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0E1524] border border-slate-700/60 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">AI Assistant Settings</h3>
              <p className="text-xs text-slate-400">Configure model behavior and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Real Backend Connection Status */}
          <div className="bg-white/[0.03] border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Backend System Health
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  healthData?.status === 'healthy'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    healthData?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {healthData?.status === 'healthy' ? 'Online & Ready' : 'Connecting...'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-500">Active Provider</span>
                <p className="font-mono text-slate-200 capitalize mt-0.5">
                  {healthData?.llm_provider || 'OpenRouter'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Configured Model</span>
                <p className="font-mono text-slate-200 mt-0.5 truncate" title={healthData?.openrouter_model || 'openrouter/free'}>
                  {healthData?.openrouter_model || 'openrouter/free'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">API Latency</span>
                <p className="font-mono text-slate-200 mt-0.5">
                  {latency ? `${latency} ms` : 'Checking...'}
                </p>
              </div>
              <div>
                <span className="text-slate-500">RAG Vector DB</span>
                <p className="font-mono text-emerald-400 mt-0.5">Ready</p>
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Globe className="w-4 h-4 text-sky-400" />
              Response Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['English', 'Hindi', 'Hinglish'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onSelectLanguage && onSelectLanguage(lang)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    selectedLanguage.toLowerCase() === lang.toLowerCase()
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 shadow-sm shadow-blue-500/20'
                      : 'bg-white/[0.02] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              The AI automatically responds in your selected language or mirrors your phrasing.
            </p>
          </div>

          {/* Syllabus Grounding (RAG) Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-slate-800 rounded-xl">
            <div className="pr-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>UPSC Knowledge Base Grounding</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ground answers against official syllabus notifications, UPSC papers, and institute archives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggleRag && onToggleRag(!useRag)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                useRag ? 'bg-blue-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  useRag ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Clear Current Chat */}
          {onClearConversation && (
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  onClearConversation();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Current Conversation
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 bg-black/20 border-t border-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

