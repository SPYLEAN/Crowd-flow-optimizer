import React, { useState, useEffect } from 'react';
import type { SimulationState, RerouteStrategy, OperatorAction, IncidentReport, EventPhase } from '../types/crowdflow';
import { updateSimulationStepAsync, evaluateStrategyRisk } from '../services/simulationEngine';
import { VenueMapCanvas } from '../components/VenueMapCanvas';
import { TelemetryPanel } from '../components/TelemetryPanel';
import { IncidentClassifierPanel } from '../components/IncidentClassifierPanel';
import { StrategyCards } from '../components/StrategyCards';
import { SimulationControlsPanel } from '../components/SimulationControlsPanel';
import { PRESETS } from '../data/presets';
import { Radio } from 'lucide-react';

interface ControlRoomViewProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onResetSimulation: () => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  simulationState,
  setSimulationState,
}) => {
  const [highlightZoneId, setHighlightZoneId] = useState<string | null>(null);
  
  // Use a ref to hold latest state so the interval doesn't become stale
  const stateRef = React.useRef(simulationState);
  useEffect(() => { stateRef.current = simulationState; }, [simulationState]);

  // Stable simulation step interval — does not re-register every tick
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
  // Only re-register if the sim on/off toggle or speed changes — NOT on every state update
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
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] max-h-[1080px] bg-[var(--surface-base)] fade-in pb-2">
      
      {/* 1. Hero / Command Strip */}
      <div className="px-5 py-3 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
            <h1 className="text-sm font-semibold text-white tracking-wide uppercase">Operations Control</h1>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-baseline gap-2">
            <h2 className="text-xs font-semibold text-white" style={{ fontFamily: 'var(--font-mono)' }}>{venueName}</h2>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>• Forecast crowd pressure. Approve safe movement.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="label-mono">{currentTime}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
        
        {/* 2. Metrics Row */}
        <div className="shrink-0">
          <TelemetryPanel state={simulationState} />
        </div>

        {/* 3. Main Grid (Left, Center Map, Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Left Panel: Scenario Controls */}
          <div className="lg:col-span-3 min-h-0">
            <SimulationControlsPanel
              state={simulationState}
              onUpdatePhase={handleUpdatePhase}
              onUpdateCrowdMultiplier={handleUpdateMultiplier}
              onToggleSimulation={() => setSimulationState((prev) => ({ ...prev, isSimulating: !prev.isSimulating }))}
              onRunForecast={handleRunForecast}
            />
          </div>

          {/* Center Panel: Map Area */}
          <div className="lg:col-span-6 min-h-0 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <VenueMapCanvas
              state={simulationState}
              onSelectZone={(zId) => setHighlightZoneId(zId)}
              highlightZoneId={highlightZoneId}
            />
          </div>

          {/* Right Panel: Decision Queue & Strategies */}
          <div className="lg:col-span-3 min-h-0">
            <StrategyCards
              strategies={simulationState.strategies}
              currentVenueRisk={simulationState.overallVenueRisk}
              onApproveStrategy={handleApproveStrategy}
              activeActions={simulationState.activeActions}
            />
          </div>
        </div>

        {/* 4. Bottom Dock: Incident Classifier & Signals */}
        <div className="shrink-0 h-[140px]">
          <IncidentClassifierPanel
            onAddIncident={handleAddIncident}
            selectedZoneId={highlightZoneId || 'gate_c'}
            dataReadinessScore={94}
          />
        </div>
        
      </div>
    </div>
  );
};
