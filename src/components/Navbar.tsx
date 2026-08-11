import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  Database,
  Play,
  Key,
  Building2,
  Radio,
} from 'lucide-react';
import { PRESETS } from '../data/presets';

interface NavbarProps {
  activeTab: 'landing' | 'control_room' | 'scenario_builder' | 'data_readiness';
  setActiveTab: (tab: 'landing' | 'control_room' | 'scenario_builder' | 'data_readiness') => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onStartJudgeDemo: () => void;
  nlpStatus: 'connected' | 'fallback' | 'unknown';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedPresetId,
  onSelectPreset,
  onStartJudgeDemo,
  nlpStatus,
}) => {
  const [showHfModal, setShowHfModal] = useState(false);

  const tabs = [
    { id: 'landing' as const, label: 'Overview', icon: Radio },
    { id: 'control_room' as const, label: 'Operations Control', icon: Activity },
    { id: 'scenario_builder' as const, label: 'Scenario Builder', icon: Sliders },
    { id: 'data_readiness' as const, label: 'Data Readiness', icon: Database },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(5,8,16,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between gap-6">

          {/* Brand */}
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--teal-soft)', border: '1px solid rgba(14,165,165,0.2)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" className="w-4 h-4">
                <path d="M32 4C17.64 4 6 15.64 6 30C6 48.2 32 60 32 60C32 60 58 48.2 58 30C58 15.64 46.36 4 32 4Z" fill="url(#navGrad1)"/>
                <path d="M16 28 L24 28 L28 18 L36 42 L40 28 L48 28" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="navGrad1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0f766e" />
                    <stop offset="1" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">VenuePulse</span>
              <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--teal-base)' }}>GeoOps</span>
              <span className="hidden sm:block text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--teal-soft)', color: 'var(--teal-base)', border: '1px solid rgba(14,165,165,0.15)', fontFamily: 'var(--font-mono)' }}>
                Console
              </span>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                style={activeTab === id ? { background: 'rgba(255,255,255,0.07)', color: 'var(--text-primary)' } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2.5 shrink-0">

            {/* Venue Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-default)' }}>
              <Building2 className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--teal-base)' }} />
              <select
                value={selectedPresetId}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1 max-w-[180px]"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {Object.values(PRESETS).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* HF API Status */}
            <button
              onClick={() => setShowHfModal(true)}
              title="NLP Configuration Info"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: nlpStatus === 'fallback' ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.06)',
                border: nlpStatus === 'fallback' ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(34,197,94,0.15)',
                color: nlpStatus === 'fallback' ? 'var(--status-caution)' : 'var(--status-safe)',
              }}
            >
              <Key className="w-3 h-3" />
              <span className="hidden sm:block">
                {nlpStatus === 'fallback' ? 'Local NLP Fallback Active' : 'HF Connected'}
              </span>
            </button>

            {/* Demo Mode */}
            <button
              onClick={onStartJudgeDemo}
              className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'var(--teal-base)',
                color: '#050810',
                letterSpacing: '0.02em',
              }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Control-Room Simulation
            </button>
          </div>
        </div>
      </header>

      {/* HF Token Modal */}
      {showHfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel rounded-xl p-6 w-full max-w-md shadow-2xl slide-up space-y-5">
            <div className="flex items-center justify-between pb-4 divider">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--teal-soft)', border: '1px solid rgba(14,165,165,0.15)' }}>
                  <Key className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">NLP Classification Engine</h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Hugging Face API Configuration</p>
                </div>
              </div>
              <button onClick={() => setShowHfModal(false)} className="text-slate-500 hover:text-slate-300 text-lg leading-none">×</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                VenuePulse AI uses <code className="px-1 py-0.5 rounded text-xs" style={{ fontFamily: 'var(--font-mono)', background: 'var(--surface-3)', color: 'var(--teal-base)' }}>facebook/bart-large-mnli</code> for zero-shot classification of ground staff incident reports.
              </p>
              <p className="text-xs leading-relaxed font-semibold" style={{ color: 'var(--status-safe)' }}>
                The Hugging Face API token is now securely managed by the Node.js backend via environment variables. It is no longer exposed to the frontend.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 divider" style={{ paddingTop: '1rem', marginTop: '0.25rem' }}>
              <button
                onClick={() => setShowHfModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                style={{ background: 'var(--teal-dim)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
