import React from 'react';
import { Activity, Sliders } from 'lucide-react';
import type { SimulationState, EventPhase } from '../types/crowdflow';

interface SimulationControlsPanelProps {
  state: SimulationState;
  onUpdatePhase: (phase: EventPhase) => void;
  onUpdateCrowdMultiplier: (mult: number) => void;
  onToggleSimulation: () => void;
  onRunForecast: () => void;
}

export const SimulationControlsPanel: React.FC<SimulationControlsPanelProps> = ({
  state,
  onUpdatePhase,
  onUpdateCrowdMultiplier,
  onToggleSimulation,
  onRunForecast,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Simulation Controls */}
      <div className="glass-panel rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Scenario Controls</h3>
          <Sliders className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
        </div>

        {/* Phase Selector */}
        <div className="space-y-1.5">
          <label className="label-mono">Event Phase</label>
          <select
            value={state.eventPhase}
            onChange={(e) => onUpdatePhase(e.target.value as EventPhase)}
            className="w-full text-xs font-medium rounded-md px-2.5 py-2 focus:outline-none cursor-pointer transition-colors"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            <option value="Ingress">Ingress — Arrival Peak</option>
            <option value="Live event">Live Event — Mid-Match</option>
            <option value="Interval">Interval — Concession Spike</option>
            <option value="Egress">Egress — Post-Event Exit</option>
          </select>
        </div>

        {/* Crowd Multiplier */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="label-mono">Crowd Volume Slider</label>
            <span className="text-xs font-semibold" style={{ color: 'var(--teal-base)', fontFamily: 'var(--font-mono)' }}>{state.totalCrowdMultiplier}×</span>
          </div>
          <input
            type="range" min="0.5" max="1.5" step="0.1"
            value={state.totalCrowdMultiplier}
            onChange={(e) => onUpdateCrowdMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-full cursor-pointer"
            style={{ background: 'var(--surface-3)' }}
          />
        </div>

        {/* Run Forecast Action */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={onRunForecast}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            style={{ background: 'var(--teal-dim)', color: 'white' }}
          >
            <Activity className="w-3.5 h-3.5" />
            Run Forecast
          </button>
          <button
            onClick={onToggleSimulation}
            title={state.isSimulating ? 'Pause simulation' : 'Resume simulation'}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: state.isSimulating ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.1)', color: state.isSimulating ? 'var(--status-caution)' : 'var(--status-safe)', border: `1px solid ${state.isSimulating ? 'rgba(245,158,11,0.25)' : 'rgba(34,197,94,0.25)'}` }}
          >
            {state.isSimulating ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* Model Pipeline List */}
      <div className="glass-panel rounded-xl p-4 flex-1">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider pb-2 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          Active Model Pipeline
        </h3>
        
        <div className="space-y-3">
          {[
            { name: 'Graph Inflow Engine', status: 'Running', type: 'Deterministic' },
            { name: 'Density Risk Scorer', status: 'Running', type: 'Heuristic' },
            { name: 'Incident NLP Classifier', status: 'Active', type: 'HuggingFace Zero-Shot' },
            { name: 'Bottleneck Predictor', status: 'Active', type: '30-min Lookahead' },
          ].map((model, idx) => (
            <div key={idx} className="flex flex-col gap-1">
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
