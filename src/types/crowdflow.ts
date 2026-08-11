export type ZoneType = 'entry_gate' | 'holding_area' | 'concourse' | 'concession' | 'emergency_exit' | 'transit_exit' | 'seating';

export interface Zone {
  zone_id: string;
  name: string;
  type: ZoneType;
  x: number; // grid position or map coordinate (0-1000 scale)
  y: number;
  area_m2: number;
  capacity_per_min: number;
  safe_density: number; // people / m2
  critical_density: number; // people / m2
  
  // Dynamic runtime metrics
  occupants?: number;
  density?: number; // occupants / area_m2
  inflow_per_min?: number;
  outflow_per_min?: number;
  queue?: number;
  risk_score?: number; // 0-100
  incident_factor?: number; // multiplier e.g. 0.5 when obstructed
}

export interface Corridor {
  edge_id: string;
  from_zone: string;
  to_zone: string;
  width_m: number;
  length_m: number;
  capacity_per_min: number;
  bidirectional: boolean;
  status: 'open' | 'restricted' | 'closed' | 'emergency_only' | 'rerouted';
  
  // Dynamic metrics
  current_flow_per_min?: number;
  congestion_level?: number; // 0-1
}

export interface ScheduleEvent {
  time: string;
  event: string;
  expected_behavior: string;
}

export interface ArrivalForecast {
  time: string;
  crowd_expected: number;
  phase: 'Ingress' | 'Live event' | 'Interval' | 'Egress';
}

export interface LiveSensorReading {
  zone_id: string;
  timestamp: string;
  cctv_count: number;
  wifi_count: number;
  turnstile_count: number;
  flow_rate_in: number;
  flow_rate_out: number;
}

export interface IncidentReport {
  id: string;
  time: string;
  zone: string;
  report_text: string;
  expected_label?: IncidentLabel;
  classified_label?: IncidentLabel;
  confidence?: number;
  short_reason?: string;
  simulation_impact?: string;
  status: 'pending' | 'analyzed' | 'mitigated';
}

export type IncidentLabel = 
  | 'ticketing obstruction'
  | 'crowd congestion'
  | 'medical incident'
  | 'security concern'
  | 'wayfinding issue';

export interface RerouteStrategy {
  id: string;
  title: string;
  description: string;
  target_zone: string;
  modified_corridors: { edge_id: string; new_status: Corridor['status']; new_capacity?: number }[];
  risk_reduction_pct: number;
  before_risk: number;
  after_risk: number;
  eta_improvement_mins: number;
  capacity_relief_pmin: number;
  stewards_required: number;
  explanation: string;
  is_recommended?: boolean;
}

export interface OperatorAction {
  id: string;
  time: string;
  action: string;
  zone: string;
  strategy_id?: string;
  expected_effect: string;
  approved_by: string;
  status: 'active' | 'completed' | 'reverted';
  risk_before: number;
  risk_after: number;
}

export interface VenuePreset {
  id: string;
  name: string;
  subtitle: string;
  category: 'Stadium' | 'Pilgrimage' | 'Transit' | 'Airport';
  location: string;
  capacity: number;
  zones: Zone[];
  corridors: Corridor[];
  schedule: ScheduleEvent[];
  forecast: ArrivalForecast[];
  sampleIncidents: IncidentReport[];
  defaultStrategies: RerouteStrategy[];
  rawCsvs: {
    venue_zones: string;
    corridors: string;
    event_schedule: string;
    arrival_forecast: string;
    live_sensor_readings: string;
    incident_reports: string;
    operator_actions: string;
  };
}

export type EventPhase = 'Ingress' | 'Live event' | 'Interval' | 'Egress';

export interface LayerVisibility {
  showDensity: boolean;
  showFlow: boolean;
  showForecast: boolean;
  showIncidents: boolean;
  showRoutes: boolean;
  showExits: boolean;
}

export interface SimulationState {
  presetId: string;
  currentTime: string;
  eventPhase: EventPhase;
  totalCrowdMultiplier: number; // 0.5 to 1.5
  zones: Record<string, Zone>;
  corridors: Record<string, Corridor>;
  activeIncidents: IncidentReport[];
  activeActions: OperatorAction[];
  overallVenueRisk: number; // 0-100
  forecastBreachTimeMins: number | null; // e.g. 8 mins until critical
  criticalZoneId: string | null;
  strategies: RerouteStrategy[];
  selectedStrategyId: string | null;
  isSimulating: boolean;
  simulationSpeed: number; // 1x, 2x, 5x
  layers?: LayerVisibility;
  selectedTimeOffsetMins?: number; // 0, 5, 10, 20, 30 min forecast playback
}

export interface JudgeStep {
  step: number;
  title: string;
  subtitle: string;
  script: string;
  actionType: 
    | 'LOAD_IPL'
    | 'SIMULATE_PRESSURE'
    | 'CLASSIFY_INCIDENT'
    | 'PREDICT_BREACH'
    | 'SHOW_STRATEGIES'
    | 'APPROVE_STRATEGY'
    | 'SHOW_RISK_DROP'
    | 'SHOW_EXPLANATION';
}
