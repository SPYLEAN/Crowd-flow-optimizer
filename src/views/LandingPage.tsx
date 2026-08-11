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
    <div className="min-h-screen bg-[#02040A] text-slate-300 font-sans selection:bg-teal-500/30 overflow-hidden relative op-grid-bg">
      <div className="relative max-w-screen-xl mx-auto px-6 py-20 md:py-28 space-y-32 fade-in">
        
        {/* ── HERO ── */}
        <section className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-teal-500/30 bg-teal-500/10 backdrop-blur-md">
            <Radio className="w-4 h-4 text-teal-400" />
            <span className="text-xs font-bold text-teal-300 tracking-widest uppercase font-mono">Operations Command Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            Operations Control for <br />
            <span className="text-teal-400">Crowd Safety.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl font-light">
            VenuePulse AI predicts bottlenecks, explains risk, and recommends operator-approved reroutes before crowd pressure becomes dangerous.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <button
              onClick={onGoToControlRoom}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded text-sm font-bold text-[#02040A] bg-teal-400 hover:bg-teal-300 transition-colors uppercase tracking-wide font-mono"
            >
              Live Control Room
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onStartJudgeDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded text-sm font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors uppercase tracking-wide font-mono"
            >
              <Play className="w-4 h-4" />
              Start Guided Demo
            </button>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 w-full max-w-3xl border-t border-white/10">
            {[
              { value: '30 min', label: 'Forecast Horizon', icon: Clock },
              { value: '−28 pts', label: 'Avg. Risk Reduction', icon: BarChart3 },
              { value: 'Zero-shot', label: 'NLP Classification', icon: GitBranch },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center space-y-2">
                <Icon className="w-5 h-5 text-teal-400 mb-1" />
                <span className="text-2xl font-bold text-white tracking-tight font-mono">{value}</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase font-mono">{label}</span>
              </div>
            ))}
          </div>
        </section>


        {/* ── PROBLEM VS SOLUTION (Why Different) ── */}
        <section className="space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-tight">Not just another heatmap.</h2>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Dynamic Flow Graph vs Static Mapping</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional */}
            <div className="p-8 rounded bg-white/[0.02] border border-white/[0.05] space-y-6">
              <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase mb-2 block font-mono">The Status Quo</span>
              <h3 className="text-xl font-bold text-white mb-6">Static Heatmaps</h3>
              <ul className="space-y-4">
                {[
                  'Congestion is detected only after it becomes dangerous.',
                  'No route comparison or mathematical strategy options.',
                  'Venue treated as a static image, not a dynamic flow graph.',
                  'Operators must guess the impact of opening a gate.'
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-red-400 font-bold">&times;</span>
                    </div>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* VenuePulse AI */}
            <div className="p-8 rounded bg-teal-900/10 border border-teal-500/20 space-y-6">
              <span className="text-[10px] font-bold text-teal-400 tracking-widest uppercase mb-2 block font-mono">Our Approach</span>
              <h3 className="text-xl font-bold text-white mb-6">Live Operations Graph</h3>
              <ul className="space-y-4">
                {[
                  'Predicts bottlenecks up to 30 minutes before critical density.',
                  'Compares multiple rerouting strategies with simulated risk scores.',
                  'Classifies raw ground staff reports via NLP in real-time.',
                  'Operator-approved interventions — the AI proposes, you decide.'
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-teal-400" />
                    </div>
                    <span className="leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="space-y-12 max-w-5xl mx-auto border-t border-white/5 pt-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Deterministic Pipeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: '1. Digital Twin Graph', icon: MapIcon, desc: 'Your venue is mapped as a directed graph of zones (nodes) and corridors (edges) with defined capacities and flow rates.' },
              { title: '2. NLP Classification', icon: Zap, desc: 'Ground staff reports are processed via Hugging Face Zero-Shot models to instantly classify incidents and update graph weights.' },
              { title: '3. Strategy Engine', icon: Activity, desc: 'The engine simulates the next 30 minutes and surfaces the safest reroute options for the operator to approve.' }
            ].map(({ title, icon: Icon, desc }) => (
              <div key={title} className="p-6 rounded border border-white/10 bg-[#050810] flex flex-col items-start space-y-4">
                <Icon className="w-5 h-5 text-teal-400" />
                <h4 className="text-sm font-bold text-white font-mono">{title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VENUE PRESETS ── */}
        <section className="space-y-8 border-t border-white/5 pt-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">Active Venue Configurations</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(PRESETS).map((preset) => (
              <button
                key={preset.id}
                onClick={() => { onSelectPreset(preset.id); onGoToControlRoom(); }}
                className="group p-5 rounded border border-white/10 bg-[#050810] hover:border-teal-500/50 text-left space-y-4 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 text-[10px] font-bold tracking-widest uppercase font-mono">
                    {preset.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{preset.capacity.toLocaleString()} CAP</span>
                </div>
                
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">{preset.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{preset.subtitle}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono">
                    {preset.zones.length} ZONES / {preset.corridors.length} EDGES
                  </span>
                  <ArrowRight className="w-3 h-3 text-teal-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── SAFETY DISCLAIMER ── */}
        <section className="max-w-3xl mx-auto pt-10">
          <div className="p-4 rounded border border-amber-500/20 bg-[#050810] flex gap-4 items-start">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-amber-500 tracking-wide uppercase font-mono">Decision-Support Notice</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                VenuePulse AI is a decision-support platform designed to assist trained venue operations personnel. All sensor readings, crowd counts, and risk scores shown are derived from simulated demo data. This system does not replace professional crowd safety assessment or the authority of qualified safety officers.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
