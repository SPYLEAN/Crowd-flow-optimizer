import React from 'react';
import { 
  ArrowRight,
  Play,
  Clock,
  BarChart3,
  GitBranch,
  Check,
  ShieldCheck,
  Radio,
  Activity,
  Map as MapIcon,
  Zap,
} from 'lucide-react';
import { PRESETS } from '../data/presets';

interface LandingPageProps {
  onGoToControlRoom: () => void;
  onSelectPreset: (presetId: string) => void;
  onStartJudgeDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToControlRoom,
  onSelectPreset,
  onStartJudgeDemo,
}) => {
  return (
    <div className="min-h-screen bg-[#02040A] text-slate-300 font-sans selection:bg-teal-500/30 overflow-hidden relative">
      {/* Background cinematic gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] bg-teal-900/20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[160px] bg-slate-900/40 pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto px-6 py-20 md:py-28 space-y-32 fade-in">
        
        {/* ── HERO ── */}
        <section className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 backdrop-blur-md">
            <Radio className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-medium text-teal-300 tracking-widest uppercase">Crowd Operations Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-2xl">
            Race Control for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-100 to-teal-500">Human Movement.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl font-light">
            CrowdFlow AI predicts bottlenecks, explains risk, and recommends operator-approved reroutes before crowd pressure becomes dangerous.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={onGoToControlRoom}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#02040A] bg-teal-400 hover:bg-teal-300 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)]"
            >
              Open Live Control Room
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartJudgeDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
            >
              <Play className="w-4 h-4" />
              Run Judge Demo
            </button>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 w-full max-w-3xl border-t border-white/5">
            {[
              { value: '30 min', label: 'Forecast Horizon', icon: Clock },
              { value: '−28 pts', label: 'Avg. Risk Reduction', icon: BarChart3 },
              { value: 'Zero-shot', label: 'NLP Classification', icon: GitBranch },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center space-y-2">
                <Icon className="w-5 h-5 text-teal-400 mb-1 opacity-80" />
                <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
                <span className="text-xs text-slate-500 tracking-wider uppercase">{label}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ── PROBLEM VS SOLUTION (Why Different) ── */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">Not just another heatmap.</h2>
            <p className="text-slate-400">Why CrowdFlow AI is different from generic "map + red zones" solutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-xs font-semibold text-red-400 tracking-widest uppercase mb-2 block">The Status Quo</span>
                <h3 className="text-xl font-bold text-white mb-6">Static Heatmaps</h3>
                <ul className="space-y-4">
                  {[
                    'Congestion is detected only after it becomes dangerous.',
                    'No route comparison or mathematical strategy options.',
                    'Venue treated as a static image, not a dynamic flow graph.',
                    'Operators must guess the impact of opening a gate.'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-red-400 text-xs leading-none">&times;</span>
                      </div>
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CrowdFlow AI */}
            <div className="p-8 rounded-2xl bg-teal-900/10 border border-teal-500/20 space-y-6 relative overflow-hidden group shadow-[0_0_30px_rgba(45,212,191,0.03)]">
              <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-xs font-semibold text-teal-400 tracking-widest uppercase mb-2 block">Our Approach</span>
                <h3 className="text-xl font-bold text-white mb-6">Live Operations Graph</h3>
                <ul className="space-y-4">
                  {[
                    'Predicts bottlenecks up to 30 minutes before critical density.',
                    'Compares multiple rerouting strategies with simulated risk scores.',
                    'Classifies raw ground staff reports via NLP in real-time.',
                    'Operator-approved interventions — the AI proposes, you decide.'
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-teal-400" />
                      </div>
                      <span className="leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">How it works</h2>
            <p className="text-slate-400">A deterministic pipeline built for mission-critical operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '1. Digital Twin Graph', icon: MapIcon, desc: 'Your venue is mapped as a directed graph of zones (nodes) and corridors (edges) with defined capacities and flow rates.' },
              { title: '2. NLP Classification', icon: Zap, desc: 'Ground staff reports are processed via Hugging Face Zero-Shot models to instantly classify incidents and update graph weights.' },
              { title: '3. Strategy Engine', icon: Activity, desc: 'The engine simulates the next 30 minutes and surfaces the safest reroute options for the operator to approve.' }
            ].map(({ title, icon: Icon, desc }) => (
              <div key={title} className="p-6 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <h4 className="text-base font-semibold text-white">{title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VENUE PRESETS ── */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">India Venue Presets</h2>
              <p className="text-slate-400">Pre-configured operational twins for high-density venues.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(PRESETS).map((preset) => (
              <button
                key={preset.id}
                onClick={() => { onSelectPreset(preset.id); onGoToControlRoom(); }}
                className="group p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-teal-900/20 hover:border-teal-500/30 text-left space-y-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-1 rounded bg-teal-500/10 text-teal-400 text-[10px] font-bold tracking-widest uppercase">
                    {preset.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{preset.capacity.toLocaleString()} cap</span>
                </div>
                
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">{preset.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{preset.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500 font-mono">
                    {preset.zones.length} Zones / {preset.corridors.length} Edges
                  </span>
                  <ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── SAFETY DISCLAIMER ── */}
        <section className="max-w-3xl mx-auto pt-10">
          <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-4 items-start">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-500 tracking-wide uppercase">Decision-Support Notice</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                CrowdFlow AI is a decision-support platform designed to assist trained venue operations personnel. All sensor readings, crowd counts, and risk scores shown are derived from simulated demo data. This system does not replace professional crowd safety assessment or the authority of qualified safety officers.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
