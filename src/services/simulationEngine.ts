import type {
  Zone,
  Corridor,
  SimulationState,
  VenuePreset,
} from '../types/crowdflow';

export function initializeSimulationState(preset: VenuePreset): SimulationState {
  const zoneMap: Record<string, Zone> = {};
  const corridorMap: Record<string, Corridor> = {};

  preset.zones.forEach((z) => {
    const initialOccupants = Math.round(z.area_m2 * 1.8);
    zoneMap[z.zone_id] = {
      ...z,
      occupants: initialOccupants,
      density: Number((initialOccupants / z.area_m2).toFixed(2)),
      inflow_per_min: Math.round(z.capacity_per_min * 0.4),
      outflow_per_min: Math.round(z.capacity_per_min * 0.38),
      queue: 0,
      risk_score: 25,
      incident_factor: 1.0,
    };
  });

  preset.corridors.forEach((c) => {
    corridorMap[c.edge_id] = {
      ...c,
      current_flow_per_min: Math.round(c.capacity_per_min * 0.45),
      congestion_level: 0.25,
    };
  });

  return {
    presetId: preset.id,
    currentTime: '19:45',
    eventPhase: 'Ingress',
    totalCrowdMultiplier: 1.0,
    zones: zoneMap,
    corridors: corridorMap,
    activeIncidents: [...preset.sampleIncidents],
    activeActions: [],
    overallVenueRisk: 38,
    forecastBreachTimeMins: null,
    criticalZoneId: null,
    strategies: [...preset.defaultStrategies],
    selectedStrategyId: null,
    isSimulating: true,
    simulationSpeed: 1,
    layers: {
      showDensity: true,
      showFlow: true,
      showForecast: true,
      showIncidents: true,
      showRoutes: true,
      showExits: true,
    },
    selectedTimeOffsetMins: 0,
  };
}

export async function updateSimulationStepAsync(state: SimulationState): Promise<SimulationState> {
  try {
    const activeIncident = state.activeIncidents.find(i => i.status !== 'mitigated');
    const incidentLabel = activeIncident ? (activeIncident.classified_label || activeIncident.expected_label) : undefined;
    
    const activeAction = state.activeActions.find(a => a.status === 'active');
    const activeRoute = activeAction ? activeAction.strategy_id : undefined;

    const res = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: state.presetId,
        crowdSize: state.totalCrowdMultiplier,
        phase: state.eventPhase,
        incidentLabel,
        activeRoute
      })
    });

    if (!res.ok) throw new Error('API Simulation failed');
    const data = await res.json();

    return {
      ...state,
      overallVenueRisk: data.riskScore,
      forecastBreachTimeMins: data.predictedBreachIn || data.forecast,
      zones: data.zones || state.zones,
      corridors: data.routes || state.corridors,
      criticalZoneId: data.riskScore > 70 ? (activeIncident?.zone || 'gate_c') : null,
    };
  } catch (err) {
    console.warn("Backend unavailable, returning current state.", err);
    return state; // Safe fallback
  }
}

export function evaluateStrategyRisk(
  state: SimulationState,
  strategyId: string
): { beforeRisk: number; afterRisk: number; riskDrop: number } {
  const strategy = state.strategies.find((s) => s.id === strategyId);
  if (!strategy) {
    return { beforeRisk: state.overallVenueRisk, afterRisk: state.overallVenueRisk, riskDrop: 0 };
  }

  const beforeRisk = state.overallVenueRisk;
  const afterRisk = Math.max(25, Math.round(beforeRisk * (1 - strategy.risk_reduction_pct / 100)));
  const riskDrop = beforeRisk - afterRisk;

  return { beforeRisk, afterRisk, riskDrop };
}
