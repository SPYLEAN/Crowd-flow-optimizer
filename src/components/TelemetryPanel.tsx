import React from 'react';
import type { SimulationState } from '../types/crowdflow';
import { Users, AlertTriangle, ShieldCheck, Activity, Gauge } from 'lucide-react';

interface TelemetryPanelProps {
  state: SimulationState;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ state }) => {
  const riskLevel =
    state.overallVenueRisk > 75 ? 'critical' :
    state.overallVenueRisk > 50 ? 'caution' : 'safe';

  const riskStyles = {
    critical: { bg: 'var(--status-critical-bg)', border: 'rgba(239,68,68,0.3)', color: 'var(--status-critical)' },
    caution:  { bg: 'var(--status-caution-bg)',  border: 'rgba(245,158,11,0.3)',  color: 'var(--status-caution)' },
    safe:     { bg: 'var(--status-safe-bg)',     border: 'rgba(34,197,94,0.3)',   color: 'var(--status-safe)' },
  }[riskLevel];

  const sortedZones = Object.values(state.zones).sort((a, b) => (b.density || 0) - (a.density || 0));
  const peakZone = sortedZones[0];
  
  const totalOccupants = Object.values(state.zones).reduce((acc, z) => acc + (z.occupants || 0), 0);
  const totalFlow = Object.values(state.zones).reduce((acc, z) => acc + (z.outflow_per_min || 0), 0);
  
  // Fake calculation for clearance rate for demo purposes
  const clearanceRate = totalFlow > 0 ? Math.round(totalOccupants / totalFlow) : 0;
  // Fake calculation for model confidence based on active incidents
  const modelConfidence = state.activeIncidents.length > 0 ? 94 : 98;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

      {/* 1. People on site */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <p className="label-mono">People on Site</p>
          <Users className="w-3.5 h-3.5 opacity-50" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
            {totalOccupants.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Total venue occupancy</p>
      </div>

      {/* 2. Risk Index */}
      <div
        className="rounded-xl p-3 flex flex-col justify-between transition-colors"
        style={{ background: riskStyles.bg, border: `1px solid ${riskStyles.border}` }}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="label-mono" style={{ color: riskStyles.color }}>Risk Index</p>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: riskStyles.color }} />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color: riskStyles.color, fontFamily: 'var(--font-mono)' }}>
            {state.overallVenueRisk}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>/100</span>
        </div>
        <p className="text-[10px] uppercase font-bold" style={{ color: riskStyles.color }}>
          {riskLevel}
        </p>
      </div>

      {/* 3. Peak Zone Density */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <p className="label-mono">Peak Zone Density</p>
          <Activity className="w-3.5 h-3.5 opacity-50" />
        </div>
        {peakZone && (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold" style={{ color: 'var(--status-critical)', fontFamily: 'var(--font-mono)' }}>
                {peakZone.density}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>p/m²</span>
            </div>
            <p className="text-[10px] truncate text-white">{peakZone.name}</p>
          </>
        )}
      </div>

      {/* 4. Model Confidence */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <p className="label-mono">Model Confidence</p>
          <ShieldCheck className="w-3.5 h-3.5 opacity-50" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color: 'var(--status-safe)', fontFamily: 'var(--font-mono)' }}>
            {modelConfidence}%
          </span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Graph inference accuracy</p>
      </div>

      {/* 5. Clearance Rate */}
      <div className="glass-panel rounded-xl p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <p className="label-mono">Clearance Rate</p>
          <Gauge className="w-3.5 h-3.5 opacity-50" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-mono)' }}>
            ~{clearanceRate}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>mins</span>
        </div>
        <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Est. time to empty</p>
      </div>

    </div>
  );
};
