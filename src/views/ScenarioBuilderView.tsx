import React, { useState } from 'react';
import type { SimulationState } from '../types/crowdflow';
import { PRESETS } from '../data/presets';
import { Sliders, Building2, Layers } from 'lucide-react';

interface ScenarioBuilderViewProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onSelectPreset: (presetId: string) => void;
}

export const ScenarioBuilderView: React.FC<ScenarioBuilderViewProps> = ({
  simulationState,
  setSimulationState,
  onSelectPreset,
}) => {
  const [selectedZoneKey, setSelectedZoneKey] = useState<string>(
    Object.keys(simulationState.zones)[0] || 'gate_c'
  );

  const handleZoneCapacityChange = (zoneId: string, cap: number) => {
    setSimulationState((prev) => ({
      ...prev,
      zones: {
        ...prev.zones,
        [zoneId]: {
          ...prev.zones[zoneId],
          capacity_per_min: cap,
        },
      },
    }));
  };

  const handleCorridorWidthChange = (edgeId: string, width: number) => {
    setSimulationState((prev) => ({
      ...prev,
      corridors: {
        ...prev.corridors,
        [edgeId]: {
          ...prev.corridors[edgeId],
          width_m: width,
          capacity_per_min: Math.round(width * 130),
        },
      },
    }));
  };

  return (
    <div className="space-y-6 py-6 max-w-screen-xl mx-auto px-5 fade-in">
      {/* Header */}
      <div className="glass-panel rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)' }}>
            <Sliders className="w-5 h-5" style={{ color: 'var(--teal-base)' }} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Digital Twin Parameters</h2>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Configure venue geometry, zone capacities, and corridor thresholds for scenario testing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="label-mono">Venue Preset</span>
          <select
            value={simulationState.presetId}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          >
            {Object.values(PRESETS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Zone Capacity Parameter Tweaker */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 pb-3 mb-3 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Layers className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
            <h3 className="font-semibold text-white text-sm">Zone Capacity Limits</h3>
            <span className="label-mono ml-auto">{Object.keys(simulationState.zones).length} Zones</span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {Object.values(simulationState.zones).map((z) => (
              <div
                key={z.zone_id}
                onClick={() => setSelectedZoneKey(z.zone_id)}
                className="p-3.5 rounded-xl transition-all cursor-pointer"
                style={{
                  background: selectedZoneKey === z.zone_id ? 'rgba(255,255,255,0.03)' : 'var(--surface-2)',
                  border: `1px solid ${selectedZoneKey === z.zone_id ? 'var(--border-emphasis)' : 'var(--border-subtle)'}`
                }}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-semibold text-white">{z.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase" style={{ background: 'var(--surface-3)', color: 'var(--teal-base)', border: '1px solid var(--border-subtle)' }}>
                    {z.type}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-mono mb-1 block">Area</label>
                    <span className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{z.area_m2} m²</span>
                  </div>
                  <div>
                    <label className="label-mono mb-1 block">Throughput (p/min)</label>
                    <input
                      type="number"
                      value={z.capacity_per_min}
                      onChange={(e) => handleZoneCapacityChange(z.zone_id, parseInt(e.target.value) || 100)}
                      className="w-full rounded px-2 py-1 text-xs font-semibold focus:outline-none transition-colors"
                      style={{ background: 'var(--surface-3)', color: 'var(--status-caution)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(245, 158, 11, 0.4)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    />
                  </div>
                  <div>
                    <label className="label-mono mb-1 block">Critical Density</label>
                    <span className="text-xs font-semibold" style={{ color: 'var(--status-critical)', fontFamily: 'var(--font-mono)' }}>{z.critical_density} p/m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Corridor Network Editor */}
        <div className="glass-panel rounded-xl p-5 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 pb-3 mb-3 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Building2 className="w-4 h-4" style={{ color: 'var(--status-safe)' }} />
            <h3 className="font-semibold text-white text-sm">Corridor Network Thresholds</h3>
            <span className="label-mono ml-auto">{Object.keys(simulationState.corridors).length} Edges</span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {Object.values(simulationState.corridors).map((c) => (
              <div
                key={c.edge_id}
                className="p-3.5 rounded-xl"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-sm font-semibold text-white">
                    {c.from_zone} <span style={{ color: 'var(--text-tertiary)' }}>→</span> {c.to_zone}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase"
                    style={{
                      background: c.status === 'open' ? 'var(--status-safe-bg)' : c.status === 'emergency_only' ? 'var(--status-critical-bg)' : 'var(--status-caution-bg)',
                      color: c.status === 'open' ? 'var(--status-safe)' : c.status === 'emergency_only' ? 'var(--status-critical)' : 'var(--status-caution)',
                      border: `1px solid ${c.status === 'open' ? 'rgba(34,197,94,0.2)' : c.status === 'emergency_only' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                    }}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-mono mb-1 block">Width (m)</label>
                    <input
                      type="number"
                      value={c.width_m}
                      onChange={(e) => handleCorridorWidthChange(c.edge_id, parseFloat(e.target.value) || 1)}
                      className="w-full rounded px-2 py-1 text-xs font-semibold focus:outline-none transition-colors"
                      style={{ background: 'var(--surface-3)', color: 'var(--teal-base)', border: '1px solid var(--border-default)', fontFamily: 'var(--font-mono)' }}
                      onFocus={(e) => e.target.style.borderColor = 'rgba(14, 165, 165, 0.4)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
                    />
                  </div>
                  <div>
                    <label className="label-mono mb-1 block">Length (m)</label>
                    <span className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{c.length_m} m</span>
                  </div>
                  <div>
                    <label className="label-mono mb-1 block">Max Flow</label>
                    <span className="text-xs font-semibold" style={{ color: 'var(--status-safe)', fontFamily: 'var(--font-mono)' }}>{c.capacity_per_min} p/min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
