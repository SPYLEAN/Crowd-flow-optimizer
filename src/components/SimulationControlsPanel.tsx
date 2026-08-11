import React from 'react';
import { Activity, Sliders, Layers, Eye, EyeOff, Users, Compass, AlertOctagon, Navigation, DoorOpen, ShieldAlert } from 'lucide-react';
import type { SimulationState, EventPhase, LayerVisibility } from '../types/crowdflow';
import { PRESETS } from '../data/presets';

interface SimulationControlsPanelProps {
  state: SimulationState;
  onUpdatePhase: (phase: EventPhase) => void;
  onUpdateCrowdMultiplier: (mult: number) => void;
  onToggleSimulation: () => void;
  onRunForecast: () => void;
  onToggleLayer?: (layerKey: keyof LayerVisibility) => void;
}

export const SimulationControlsPanel: React.FC<SimulationControlsPanelProps> = ({
  state,
  onUpdatePhase,
  onUpdateCrowdMultiplier,
  onToggleSimulation,
  onRunForecast,
  onToggleLayer,
}) => {
  const currentPreset = PRESETS[state.presetId] || PRESETS.ipl_stadium;
  const baseCapacity = currentPreset.capacity || 42000;
  
  // Real Headcount calculation
  const currentHeadcount = Math.round(baseCapacity * state.totalCrowdMultiplier);
  const minHeadcount = Math.round(baseCapacity * 0.5);
  const maxHeadcount = Math.round(baseCapacity * 1.5);

  const layers: { key: keyof LayerVisibility; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { key: 'showDensity', label: 'Crowd Density Heatmap', icon: Layers, color: '#ef4444' },
    { key: 'showFlow', label: 'Flow Directions & Paths', icon: Compass, color: '#0ea5a5' },
    { key: 'showForecast', label: 'Bottleneck Risk Forecast', icon: AlertOctagon, color: '#f59e0b' },
    { key: 'showIncidents', label: 'Incident Staff Reports', icon: ShieldAlert, color: '#ec4899' },
    { key: 'showRoutes', label: 'Recommended Reroutes', icon: Navigation, color: '#10b981' },
    { key: 'showExits', label: 'Emergency Exits & Barriers', icon: DoorOpen, color: '#6366f1' },
  ];

  const currentLayers: LayerVisibility = state.layers || {
    showDensity: true,
    showFlow: true,
    showForecast: true,
    showIncidents: true,
    showRoutes: true,
    showExits: true,
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
      
      {/* ── 1. KEPLER.GL LAYER CONTROLS ── */}
      <div className="glass-panel rounded p-2.5 space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Map Layers</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">6 Active</span>
        </div>

        <div className="space-y-1">
          {layers.map(({ key, label, icon: Icon, color }) => {
            const isVisible = currentLayers[key];
            return (
              <button
                key={key}
                onClick={() => onToggleLayer && onToggleLayer(key)}
                className="w-full px-2 py-1.5 rounded flex items-center justify-between text-xs transition-all cursor-pointer group hover:bg-white/[0.02]"
                style={{
                  background: isVisible ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: `1px solid ${isVisible ? 'rgba(255,255,255,0.05)' : 'transparent'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: isVisible ? color : '#334155' }} />
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isVisible ? 'text-slate-300' : 'text-slate-600'}`} />
                  <span className={`text-[10px] uppercase tracking-wide font-mono ${isVisible ? 'text-slate-300 font-bold' : 'text-slate-500 line-through'}`}>{label}</span>
                </div>
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 text-teal-500/70 group-hover:text-teal-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SCENARIO & REAL HEADCOUNT CONTROLS ── */}
      <div className="glass-panel rounded p-2.5 space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Parameters</h3>
          </div>
        </div>

        {/* Phase Selector */}
        <div className="space-y-1">
          <label className="label-mono">Event Phase</label>
          <select
            value={state.eventPhase}
            onChange={(e) => onUpdatePhase(e.target.value as EventPhase)}
            className="w-full text-xs font-mono font-bold rounded px-2 py-1.5 focus:outline-none cursor-pointer transition-colors bg-[#080c12] border border-white/10 text-white"
          >
            <option value="Ingress">Ingress — Arrival Peak</option>
            <option value="Live event">Live Event — Mid-Match</option>
            <option value="Interval">Interval — Concession Spike</option>
            <option value="Egress">Egress — Post-Event Exit</option>
          </select>
        </div>

        {/* REAL HEADCOUNT SLIDER */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-slate-400" />
              <label className="label-mono">Live Headcount</label>
            </div>
            <span className="text-[10px] font-bold text-teal-400 font-mono">
              {currentHeadcount.toLocaleString()} <span className="text-slate-500">/ {baseCapacity.toLocaleString()}</span>
            </span>
          </div>
          <input
            type="range"
            min={minHeadcount}
            max={maxHeadcount}
            step={500}
            value={currentHeadcount}
            onChange={(e) => {
              const count = parseFloat(e.target.value);
              const mult = Number((count / baseCapacity).toFixed(2));
              onUpdateCrowdMultiplier(mult);
            }}
            className="w-full h-1 rounded-full cursor-pointer bg-slate-800 accent-teal-500"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-600 font-bold">
            <span>{minHeadcount.toLocaleString()} MIN</span>
            <span>{maxHeadcount.toLocaleString()} MAX</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2 border-t border-white/5 mt-2">
          <button
            onClick={onRunForecast}
            className="flex-1 py-1.5 rounded text-xs font-bold font-mono transition-colors flex items-center justify-center gap-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20"
          >
            <Activity className="w-3 h-3" />
            SIMULATE FUTURE
          </button>
          <button
            onClick={onToggleSimulation}
            title={state.isSimulating ? 'Pause simulation' : 'Resume simulation'}
            className={`px-3 py-1.5 rounded text-[10px] font-bold font-mono transition-colors border ${state.isSimulating ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
          >
            {state.isSimulating ? 'PAUSE' : 'START'}
          </button>
        </div>
      </div>

      {/* ── 3. ACTIVE MODEL PIPELINE ── */}
      <div className="glass-panel rounded p-2.5 flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 mb-2 font-mono border-b border-white/5">
          Active Services
        </h3>
        
        <div className="space-y-2 overflow-y-auto">
          {[
            { name: 'Geospatial Engine', status: 'Running', type: 'GPU Rendered' },
            { name: 'Density Scorer', status: 'Running', type: 'Heuristic p/m²' },
            { name: 'NLP Classifier', status: 'Running', type: 'Zero-Shot' },
            { name: 'Lookahead Predictor', status: 'Running', type: 'Time-Series' },
          ].map((model, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300 font-mono uppercase tracking-wide">{model.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 border border-emerald-500 pulse-dot" />
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 font-bold uppercase">
                <span>{model.type}</span>
                <span className="text-emerald-500/70">{model.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
