import React, { useState, useEffect } from 'react';
import type { SimulationState, RerouteStrategy, OperatorAction, IncidentReport, EventPhase, LayerVisibility } from '../types/crowdflow';
import { updateSimulationStepAsync, evaluateStrategyRisk } from '../services/simulationEngine';
import { VenueMapCanvas } from '../components/VenueMapCanvas';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { IncidentClassifierPanel } from '../components/IncidentClassifierPanel';
import { StrategyCards } from '../components/StrategyCards';
import { SimulationControlsPanel } from '../components/SimulationControlsPanel';
import { ForecastTimelinePanel } from '../components/ForecastTimelinePanel';
import { PRESETS } from '../data/presets';
import { Radio, Cpu } from 'lucide-react';

interface ControlRoomViewProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onResetSimulation: () => void;
  onNlpStatusChange: (status: 'connected' | 'fallback' | 'unknown') => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  simulationState,
  setSimulationState,
  onResetSimulation,
  onNlpStatusChange,
}) => {
  const [highlightZoneId, setHighlightZoneId] = useState<string | null>(null);
  const [realTime, setRealTime] = useState(new Date());

  // Live updating clock
  useEffect(() => {
    const timer = setInterval(() => setRealTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Use a ref to hold latest state so the interval doesn't become stale
  const stateRef = React.useRef(simulationState);
  useEffect(() => { stateRef.current = simulationState; }, [simulationState]);

  // Stable simulation step interval
  useEffect(() => {
    if (!simulationState.isSimulating) return;

    let isMounted = true;
    const runStep = async () => {
      const nextState = await updateSimulationStepAsync(stateRef.current);
      if (isMounted) {
        setSimulationState(nextState);
      }
    };

    const interval = setInterval(runStep, 2000 / simulationState.simulationSpeed);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [simulationState.isSimulating, simulationState.simulationSpeed, setSimulationState]);

  const handleUpdatePhase = (phase: EventPhase) => {
    setSimulationState((prev) => ({
      ...prev,
      eventPhase: phase,
    }));
  };

  const handleUpdateMultiplier = (mult: number) => {
    setSimulationState((prev) => ({
      ...prev,
      totalCrowdMultiplier: mult,
    }));
  };

  const handleToggleLayer = (layerKey: keyof LayerVisibility) => {
    setSimulationState((prev) => ({
      ...prev,
      layers: {
        showDensity: true,
        showFlow: true,
        showForecast: true,
        showIncidents: true,
        showRoutes: true,
        showExits: true,
        ...prev.layers,
        [layerKey]: !((prev.layers || {})[layerKey] ?? true),
      },
    }));
  };

  const handleTimeOffsetChange = (offsetMins: number) => {
    setSimulationState((prev) => ({
      ...prev,
      selectedTimeOffsetMins: offsetMins,
    }));
  };

  const handleAddIncident = (incident: IncidentReport) => {
    setSimulationState((prev) => {
      const nextIncidents = [incident, ...prev.activeIncidents];
      return {
        ...prev,
        activeIncidents: nextIncidents,
        criticalZoneId: incident.zone,
      };
    });
    setHighlightZoneId(incident.zone);
  };

  const handleApproveStrategy = (strategy: RerouteStrategy) => {
    const { beforeRisk, afterRisk } = evaluateStrategyRisk(simulationState, strategy.id);

    const newAction: OperatorAction = {
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: strategy.title,
      zone: strategy.target_zone,
      strategy_id: strategy.id,
      expected_effect: strategy.explanation,
      approved_by: 'Operator #409',
      status: 'active',
      risk_before: beforeRisk,
      risk_after: afterRisk,
    };

    setSimulationState((prev) => {
      const nextCorridors = { ...prev.corridors };
      strategy.modified_corridors.forEach((mc) => {
        if (nextCorridors[mc.edge_id]) {
          nextCorridors[mc.edge_id] = {
            ...nextCorridors[mc.edge_id],
            status: mc.new_status,
            capacity_per_min: mc.new_capacity || nextCorridors[mc.edge_id].capacity_per_min,
          };
        }
      });

      return {
        ...prev,
        corridors: nextCorridors,
        overallVenueRisk: afterRisk,
        activeActions: [newAction, ...prev.activeActions],
        selectedStrategyId: strategy.id,
      };
    });
  };

  const handleRunForecast = () => {
    setSimulationState((prev) => ({
      ...prev,
      forecastBreachTimeMins: 8,
      overallVenueRisk: Math.min(100, prev.overallVenueRisk + 12),
    }));
  };

  const venueName = PRESETS[simulationState.presetId]?.name || 'Venue Setup';
  const currentTime = realTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-[var(--surface-base)] fade-in pb-4 overflow-hidden">
      
      {/* ── 1. COMMAND BAR HEADER ── */}
      <div className="px-5 py-2.5 flex items-center justify-between shrink-0 bg-[#060a14] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-teal-400" />
            <h1 className="text-xs font-bold text-white tracking-widest uppercase font-mono">GeoOps Control Console</h1>
          </div>
          <div className="h-3.5 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-300 font-mono">{venueName}</span>
            <span className="text-[10px] text-slate-500 font-mono">• Real-Time Geospatial Twin</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            <span>DATA FRESHNESS: 100%</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-bold">
            <Cpu className="w-3 h-3 text-teal-400" />
            <span>NLP INFERENCE: ACTIVE</span>
          </div>

          <span className="text-slate-300 font-bold">{currentTime}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden max-w-[1800px] w-full mx-auto">
        
        {/* ── 2. METRICS ROW (5 KPIs) ── */}
        <div className="shrink-0">
          <TelemetryPanel state={simulationState} />
        </div>

        {/* ── 3. MAIN GEOSPATIAL GRID (Left Kepler, Center MapLibre, Right Decision Queue) ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Left Panel: Kepler Layer & Scenario Controls */}
          <div className="lg:col-span-3 min-h-0 overflow-y-auto rounded-xl">
            <SimulationControlsPanel
              state={simulationState}
              onUpdatePhase={handleUpdatePhase}
              onUpdateCrowdMultiplier={handleUpdateMultiplier}
              onToggleSimulation={() => setSimulationState((prev) => ({ ...prev, isSimulating: !prev.isSimulating }))}
              onRunForecast={handleRunForecast}
              onToggleLayer={handleToggleLayer}
            />
          </div>

          {/* Center Panel: MapLibre GeoOps Canvas */}
          <div className="lg:col-span-6 min-h-0">
            <VenueMapCanvas
              state={simulationState}
              onSelectZone={(zId) => setHighlightZoneId(zId)}
              highlightZoneId={highlightZoneId}
            />
          </div>

          {/* Right Panel: Decision Queue & Reroute Strategies */}
          <div className="lg:col-span-3 min-h-0 overflow-y-auto rounded-xl">
            <StrategyCards
              strategies={simulationState.strategies}
              currentVenueRisk={simulationState.overallVenueRisk}
              onApproveStrategy={handleApproveStrategy}
              activeActions={simulationState.activeActions}
            />
          </div>
        </div>

        {/* ── 4. BOTTOM DRAWER: 30-MIN TIMELINE & INCIDENT DOCK ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 shrink-0">
          {/* 30-Min Forecast Playback Timeline (Kepler style) */}
          <div className="lg:col-span-6 h-[140px]">
            <ForecastTimelinePanel
              state={simulationState}
              onTimeOffsetChange={handleTimeOffsetChange}
              onRunForecast={handleRunForecast}
            />
          </div>

          {/* Incident Classifier NLP Docker */}
          <div className="lg:col-span-6 h-[140px]">
            <IncidentClassifierPanel
              onAddIncident={handleAddIncident}
              selectedZoneId={highlightZoneId || 'gate_c'}
              dataReadinessScore={94}
              onNlpStatusChange={onNlpStatusChange}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};
