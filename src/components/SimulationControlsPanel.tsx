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
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      
      {/* ── 1. KEPLER.GL LAYER CONTROLS ── */}
      <div className="glass-panel rounded-xl p-3.5 space-y-3" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5" style={{ color: 'var(--teal-base)' }} />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Kepler Layer Controls</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">6 Active</span>
        </div>

        <div className="space-y-1.5">
          {layers.map(({ key, label, icon: Icon, color }) => {
            const isVisible = currentLayers[key];
            return (
              <button
                key={key}
                onClick={() => onToggleLayer && onToggleLayer(key)}
                className="w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-all cursor-pointer group"
                style={{
                  background: isVisible ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: `1px solid ${isVisible ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: isVisible ? color : '#475569' }} />
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isVisible ? 'text-slate-200' : 'text-slate-500'}`} />
                  <span className={`text-[11px] ${isVisible ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}`}>{label}</span>
                </div>
                {isVisible ? (
                  <Eye className="w-3.5 h-3.5 text-teal-400 opacity-80 group-hover:opacity-100" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate-600 opacity-60 group-hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SCENARIO & REAL HEADCOUNT CONTROLS ── */}
      <div className="glass-panel rounded-xl p-3.5 space-y-3" style={{ border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--teal-base)' }} />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Scenario Controls</h3>
          </div>
        </div>

        {/* Phase Selector */}
        <div className="space-y-1">
          <label className="label-mono">Event Phase</label>
          <select
            value={state.eventPhase}
            onChange={(e) => onUpdatePhase(e.target.value as EventPhase)}
            className="w-full text-xs font-medium rounded-md px-2.5 py-1.5 focus:outline-none cursor-pointer transition-colors"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            <option value="Ingress">Ingress — Arrival Peak</option>
            <option value="Live event">Live Event — Mid-Match</option>
            <option value="Interval">Interval — Concession Spike</option>
            <option value="Egress">Egress — Post-Event Exit</option>
          </select>
        </div>

        {/* REAL HEADCOUNT SLIDER (REPLACES 0.5x - 1.5x) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-teal-400" />
              <label className="label-mono">On-Site Headcount</label>
            </div>
            <span className="text-xs font-bold text-teal-300 font-mono">
              {currentHeadcount.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {baseCapacity.toLocaleString()}</span>
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
            className="w-full h-1.5 rounded-full cursor-pointer accent-teal-400"
            style={{ background: 'var(--surface-3)' }}
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>50% ({minHeadcount.toLocaleString()})</span>
            <span>150% ({maxHeadcount.toLocaleString()})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex gap-2">
          <button
            onClick={onRunForecast}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            style={{ background: 'var(--teal-dim)', color: 'white' }}
          >
            <Activity className="w-3.5 h-3.5" />
            Run Forecast
          </button>
          <button
            onClick={onToggleSimulation}
            title={state.isSimulating ? 'Pause simulation' : 'Resume simulation'}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: state.isSimulating ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)', color: state.isSimulating ? 'var(--status-caution)' : 'var(--status-safe)', border: `1px solid ${state.isSimulating ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}` }}
          >
            {state.isSimulating ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* ── 3. ACTIVE MODEL PIPELINE ── */}
      <div className="glass-panel rounded-xl p-3.5 flex-1" style={{ border: '1px solid var(--border-subtle)' }}>
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider pb-1.5 mb-2.5 font-mono border-b border-white/5">
          Active GeoOps Pipeline
        </h3>
        
        <div className="space-y-2.5">
          {[
            { name: 'Geospatial Simulation Engine', status: 'Active', type: 'GPU Rendered' },
            { name: 'Density Risk Scorer', status: 'Running', type: 'Heuristic p/m²' },
            { name: 'Zero-Shot NLP Classifier', status: 'Active', type: 'BART-Large-MNLI' },
            { name: '30-Min Bottleneck Predictor', status: 'Active', type: '30-min Lookahead' },
          ].map((model, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{model.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />
              </div>
              <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                <span>{model.type}</span>
                <span style={{ color: 'var(--status-safe)' }}>{model.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
