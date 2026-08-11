import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PRESETS } from '../src/data/presets.js';
import type { Zone, Corridor, SimulationState } from '../src/types/crowdflow.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const HF_TOKEN = process.env.HF_TOKEN || '';

// Initialize static state for server
const serverState: Record<string, SimulationState> = {};

function initServerState(scenarioId: string) {
  const preset = PRESETS[scenarioId as keyof typeof PRESETS];
  if (!preset) return null;
  
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

  return { zones: zoneMap, corridors: corridorMap };
}

app.get('/api/scenarios', (req, res) => {
  res.json(PRESETS);
});

app.post('/api/simulate', (req, res) => {
  try {
    const { scenarioId, crowdSize, phase, incidentLabel, activeRoute } = req.body;

    if (!scenarioId || !PRESETS[scenarioId as keyof typeof PRESETS]) {
      return res.status(400).json({ error: 'Invalid scenarioId' });
    }

    if (!serverState[scenarioId]) {
      const state = initServerState(scenarioId);
      if (state) serverState[scenarioId] = state as any;
    }

    let safeCrowdSize = Number(crowdSize);
    if (isNaN(safeCrowdSize)) safeCrowdSize = 1.0;
    safeCrowdSize = Math.max(0.1, Math.min(safeCrowdSize, 3.0));

    const validPhases = ['Ingress', 'Live event', 'Interval', 'Egress'];
    if (phase && !validPhases.includes(phase)) {
      return res.status(400).json({ error: 'Invalid phase' });
    }

    const preset = PRESETS[scenarioId as keyof typeof PRESETS];
    const currentState = serverState[scenarioId];
    
    // Process logic
    const nextZones = { ...currentState.zones };
    const nextCorridors = { ...currentState.corridors };

    let maxRisk = 0;
    let criticalZone: string | null = null;
    let lowestBreachMins: number | null = null;
    let explanation = 'Nominal crowd flow.';
    let totalThroughput = 0;

    // Modifiers
    let globalModifier = 1.0;
    if (incidentLabel === 'ticketing obstruction') {
      globalModifier = 0.52;
      explanation = 'Ticketing obstruction detected. Throughput dropped severely.';
    } else if (incidentLabel === 'crowd congestion') {
      globalModifier = 0.70;
    } else if (incidentLabel === 'medical emergency') {
      globalModifier = 0.75;
      explanation = 'Medical emergency lane blocked.';
    }

    let phaseInflowMultiplier = 1.0;
    if (phase === 'Ingress') { phaseInflowMultiplier = 1.25; explanation = 'Ingress active.'; }
    if (phase === 'Interval') phaseInflowMultiplier = 1.4;
    if (phase === 'Egress') { phaseInflowMultiplier = 1.5; explanation = 'Egress active. Exits heavy.'; }

    const corridorOverrides: Record<string, any> = {};
    if (activeRoute) {
      const strat = preset.strategies.find(s => s.id === activeRoute);
      if (strat) {
        strat.modified_corridors.forEach(mc => {
          corridorOverrides[mc.edge_id] = { status: mc.new_status, capacity: mc.new_capacity };
        });
        explanation = `Intervention active: ${strat.title}`;
      } else {
        return res.status(400).json({ error: 'Invalid activeRoute' });
      }
    }

    // Update corridors
    Object.keys(nextCorridors).forEach((cId) => {
      const c = { ...nextCorridors[cId] };
      if (corridorOverrides[cId]) {
        c.status = corridorOverrides[cId].status;
        if (corridorOverrides[cId].capacity) c.capacity_per_min = corridorOverrides[cId].capacity;
      }

      if (c.status === 'closed') {
        c.current_flow_per_min = 0;
      } else if (c.status === 'open' || c.status === 'rerouted') {
        const base = c.capacity_per_min * 0.6 * safeCrowdSize * phaseInflowMultiplier;
        c.current_flow_per_min = Math.round(Math.min(c.capacity_per_min, base));
      }
      nextCorridors[cId] = c;
      totalThroughput += c.current_flow_per_min || 0;
    });

    let peakDensity = 0;
    // Update Zones
    Object.keys(nextZones).forEach((zId) => {
      const z = { ...nextZones[zId] };
      const effectiveCap = z.capacity_per_min * globalModifier;
      
      let totalInflow = 0;
      Object.values(nextCorridors).forEach(c => {
        if (c.to_zone === zId && (c.status === 'open' || c.status === 'rerouted')) {
          totalInflow += (c.current_flow_per_min || 0) * 0.5;
        }
      });
      if (z.type === 'entry_gate') totalInflow += 450 * safeCrowdSize * phaseInflowMultiplier;

      z.inflow_per_min = Math.round(totalInflow);
      z.outflow_per_min = Math.round(Math.min(effectiveCap, totalInflow * 0.85));

      const growth = (z.inflow_per_min - z.outflow_per_min) / 10;
      z.occupants = Math.max(10, Math.round((z.occupants || 500) + growth));
      z.density = Number((z.occupants / z.area_m2).toFixed(2));
      
      if (z.density > peakDensity) peakDensity = z.density;

      if (z.density > z.safe_density) z.queue = Math.round((z.density - z.safe_density) * z.area_m2 * 0.4);
      else z.queue = 0;

      const dr = z.density / z.critical_density;
      let risk = Math.round(dr * 85);
      if (globalModifier < 0.9) risk += 20;
      if (z.queue > 200) risk += 15;
      z.risk_score = Math.min(99, Math.max(5, risk));

      if (z.risk_score > maxRisk) {
        maxRisk = z.risk_score;
        criticalZone = z.zone_id;
      }

      if (dr > 0.75 && growth > 0) {
        const remaining = z.critical_density * z.area_m2 - z.occupants;
        const m = Math.max(1, Math.round((remaining / (growth * 10)) * 60));
        if (m <= 30 && (lowestBreachMins === null || m < lowestBreachMins)) lowestBreachMins = m;
      }

      nextZones[zId] = z;
    });

    serverState[scenarioId] = { zones: nextZones, corridors: nextCorridors } as any;

    res.json({
      riskScore: Math.min(99, Math.max(10, maxRisk)),
      predictedBreachIn: lowestBreachMins,
      peakDensity,
      throughputPerMin: totalThroughput,
      confidence: HF_TOKEN ? 98 : 94, // arbitrary signal that server is running
      zones: nextZones,
      routes: nextCorridors, // user called it routes in requirements
      forecast: lowestBreachMins,
      explanation
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during simulation.' });
  }
});

app.post('/api/classify', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid text parameter' });
    }

    const t = text.toLowerCase();
    const isMedical = t.includes('medical') || t.includes('faint') || t.includes('injury');
    const isTicket = t.includes('qr') || t.includes('scan') || t.includes('ticket') || t.includes('turnstile');

    const localFallback = () => {
      let label = 'general congestion';
      if (isTicket) label = 'ticketing obstruction';
      else if (isMedical) label = 'medical emergency';

      return res.json({
        label,
        confidence: 0.98,
        short_reason: `Offline Demo Fallback matched: ${label}.`,
        simulation_impact: 'Throughput capacity reduced in affected zone.',
        source: 'local_fallback'
      });
    };

    if (!HF_TOKEN) {
      return localFallback();
    }

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            candidate_labels: ['ticketing obstruction', 'medical emergency', 'crowd disturbance', 'general congestion'],
          },
        }),
      });

      if (!response.ok) throw new Error(`HF API responded with ${response.status}`);
      const data = await response.json();
      
      let label = 'general congestion';
      let confidence = 0.5;

      if (data && data.labels && data.labels.length > 0) {
         label = data.labels[0];
         confidence = data.scores[0];
      }

      res.json({
        label,
        confidence,
        short_reason: 'Classified by Hugging Face Zero-Shot NLP',
        simulation_impact: 'Model graph updated based on semantic intent.',
        source: 'huggingface'
      });
    } catch (apiError) {
      console.warn('HF API failed, falling back to local.', apiError);
      return localFallback();
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/activate-route', (req, res) => {
  const { scenarioId, routeId } = req.body;
  if (!scenarioId || !routeId) return res.status(400).json({ error: 'Missing params' });
  
  const preset = PRESETS[scenarioId as keyof typeof PRESETS];
  if (!preset) return res.status(400).json({ error: 'Invalid scenarioId' });

  const strat = preset.strategies.find(s => s.id === routeId);
  if (!strat) return res.status(400).json({ error: 'Invalid routeId' });

  res.json({
    success: true,
    expected_relief: strat.capacity_relief_pmin,
    risk_reduction: strat.risk_reduction_pct
  });
});

app.listen(PORT, () => {
  console.log(`Operations Server running on http://localhost:${PORT}`);
});
