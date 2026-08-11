import React, { useState, useEffect } from 'react';
import type { SimulationState, OperatorAction } from '../types/crowdflow';
import { classifyIncidentReport } from '../services/huggingfaceService';
import { Volume2, X, Play, Pause, Activity, Eye, Cpu, Radio, CheckCircle } from 'lucide-react';

interface JudgeDemoOverlayProps {
  simulationState: SimulationState;
  setSimulationState: React.Dispatch<React.SetStateAction<SimulationState>>;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const JudgeDemoOverlay: React.FC<JudgeDemoOverlayProps> = ({
  simulationState,
  setSimulationState,
  onClose,
  onSelectPreset,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const STEPS = [
    {
      step: 1,
      title: 'Initialize IPL Stadium Scenario',
      eventDescription: 'Simulation loads venue layout and event schedule.',
      systemCalculation: 'Graph nodes generated. Ingress capacities modeled.',
      script: 'Imagine an IPL stadium 30 minutes before gates close. Gates are open and 42,000+ fans are arriving.',
      judgeNotice: 'The venue is treated as a live digital twin, not just a static map.',
      action: () => {
        onSelectPreset('ipl_stadium');
      },
    },
    {
      step: 2,
      title: 'Gate C Pressure Escalation',
      eventDescription: 'Gate C turnstile density spikes to 5.4 p/m².',
      systemCalculation: 'Density threshold exceeded. Risk index raised to 78.',
      script: 'The dashboard shows Gate C becoming dense. Instead of waiting for panic, our digital twin monitors the live inflow.',
      judgeNotice: 'Risk index instantly reflects localized density spikes.',
      action: () => {
        setSimulationState((prev) => ({
          ...prev,
          criticalZoneId: 'gate_c',
          overallVenueRisk: 78,
          zones: {
            ...prev.zones,
            gate_c: {
              ...prev.zones.gate_c,
              occupants: 2538,
              density: 5.4,
              risk_score: 84,
              queue: 480,
            },
          },
        }));
      },
    },
    {
      step: 3,
      title: 'NLP Incident Classification',
      eventDescription: 'Ground staff text: "QR scanning is slow at Gate C"',
      systemCalculation: 'Hugging Face API classifies as "ticketing obstruction".',
      script: 'A ground staff member reports: "QR scanning is slow at Gate C". Using NLP, our system classifies this as a ticketing obstruction. That updates the graph because Gate C\'s throughput dropped.',
      judgeNotice: 'Unstructured text is instantly converted into structured simulation data.',
      action: async () => {
        const res = await classifyIncidentReport('QR scanning is slow at Gate C');
        setSimulationState((prev) => ({
          ...prev,
          activeIncidents: [
            {
              id: 'inc-demo-1',
              time: '19:48',
              zone: 'gate_c',
              report_text: 'QR scanning is slow at Gate C',
              classified_label: res.label,
              confidence: res.confidence,
              short_reason: res.short_reason,
              simulation_impact: res.simulation_impact,
              status: 'pending',
            },
            ...prev.activeIncidents,
          ],
        }));
      },
    },
    {
      step: 4,
      title: 'Predictive Bottleneck Forecast',
      eventDescription: 'Throughput degradation applied to simulation model.',
      systemCalculation: 'Forecast calculation: 8 minutes until critical breach.',
      script: 'CrowdFlow AI forecasts that Gate C will breach safe density in 8 minutes before critical overcrowding occurs.',
      judgeNotice: 'The system is predictive, moving beyond reactive heatmaps.',
      action: () => {
        setSimulationState((prev) => ({
          ...prev,
          forecastBreachTimeMins: 8,
          overallVenueRisk: 81,
        }));
      },
    },
    {
      step: 5,
      title: 'Generate Reroute Strategies',
      eventDescription: 'System computes alternative pathing to relieve Gate C.',
      systemCalculation: '3 valid strategies generated with projected risk reductions.',
      script: 'Now the system compares multiple reroute strategies to mitigate risk: Option A: Open Gate B Relief Loop, Option B: Priority Family Bypass, Option C: Full Ingress Hold.',
      judgeNotice: 'The platform provides actionable options, not just warnings.',
      action: () => {},
    },
    {
      step: 6,
      title: 'Operator Authorization',
      eventDescription: 'Operator selects Strategy 1 for deployment.',
      systemCalculation: 'Strategy parameters queued for graph update.',
      script: 'The operator approves Strategy A: Open Gate B Relief Loop.',
      judgeNotice: 'Human-in-the-loop ensures all actions are operator-approved.',
      action: () => {
        const strat = simulationState.strategies[0];
        if (strat) {
          const newAction: OperatorAction = {
            id: `act-demo-${Date.now()}`,
            time: '19:52',
            action: strat.title,
            zone: 'gate_c',
            strategy_id: strat.id,
            expected_effect: strat.explanation,
            approved_by: 'Chief Control Officer (Staff #409)',
            status: 'active',
            risk_before: 81,
            risk_after: 56,
          };
          setSimulationState((prev) => ({
            ...prev,
            overallVenueRisk: 56,
            criticalZoneId: null,
            forecastBreachTimeMins: null,
            corridors: {
              ...prev.corridors,
              e7: { ...prev.corridors.e7, status: 'rerouted', capacity_per_min: 1100 },
              e4: { ...prev.corridors.e4, status: 'rerouted', capacity_per_min: 1200 },
            },
            zones: {
              ...prev.zones,
              gate_c: { ...prev.zones.gate_c, density: 3.4, risk_score: 52, queue: 120 },
            },
            activeActions: [newAction, ...prev.activeActions],
          }));
        }
      },
    },
    {
      step: 7,
      title: 'Intervention Execution',
      eventDescription: 'Route line becomes active; Action logged to audit trail.',
      systemCalculation: 'Risk index smoothly recalculates from 81 to 56.',
      script: 'The model recalculates and shows risk dropping from 81 to 56 as crowd inflow is safely vented into the North Plaza.',
      judgeNotice: 'Notice the audit log update, the route line activating on the map, and the immediate risk drop.',
      action: () => {}, // Confetti explicitly removed; handled by state updates in step 6
    },
    {
      step: 8,
      title: 'Resolution Verified',
      eventDescription: 'Bottleneck mitigated before critical density.',
      systemCalculation: 'Simulation returns to nominal operations.',
      script: 'So the core value is simple: we help venue operators act before crowd pressure becomes dangerous. We are not only detecting congestion; we are simulating interventions.',
      judgeNotice: 'The system serves as a complete command, control, and strategy platform.',
      action: () => {},
    },
  ];

  const currentStepData = STEPS[currentStep - 1];

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;

    let isCancelled = false;

    const run = async () => {
      if (currentStepData?.action) {
        await currentStepData.action();
      }
      if (isCancelled) return;
      
      const timer = setTimeout(() => {
        if (currentStep < STEPS.length) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setIsAutoPlaying(false);
        }
      }, 5500);

      return () => clearTimeout(timer);
    };

    const cleanup = run();

    return () => {
      isCancelled = true;
      cleanup.then((fn) => fn?.());
    };
  }, [currentStep, isAutoPlaying]);

  const handleManualStep = (stepNum: number) => {
    setIsAutoPlaying(false);
    setCurrentStep(stepNum);
    const stepObj = STEPS[stepNum - 1];
    if (stepObj?.action) stepObj.action();
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 max-w-5xl mx-auto px-4 fade-in">
      <div className="glass-panel rounded-xl p-6 shadow-2xl relative overflow-hidden" style={{ border: '1px solid var(--border-emphasis)' }}>
        {/* Subtle Success Pulse overlay if step 7 or 8 */}
        {(currentStep === 7 || currentStep === 8) && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(34,197,94,0.05), transparent 70%)' }} />
        )}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full transition-all duration-700 ease-in-out relative"
            style={{ width: `${(currentStep / STEPS.length) * 100}%`, background: 'var(--teal-base)' }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white opacity-30" />
          </div>
        </div>

        {/* Top Overlay Header */}
        <div className="flex items-center justify-between pb-4 pt-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-4">
            <div className="px-2.5 py-1 rounded text-[10px] uppercase font-bold flex items-center gap-2 tracking-widest" style={{ background: 'var(--teal-soft)', color: 'var(--teal-base)', border: '1px solid rgba(14,165,165,0.2)', fontFamily: 'var(--font-mono)' }}>
              <Activity className="w-3.5 h-3.5" /> BRIEFING SCRIPT MODE
            </div>
            <span className="text-sm font-semibold text-white tracking-wide">
              Sequence {currentStep} / {STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 uppercase tracking-wide"
              style={{
                fontFamily: 'var(--font-mono)',
                background: isAutoPlaying ? 'var(--surface-3)' : 'var(--teal-dim)',
                color: isAutoPlaying ? 'var(--text-secondary)' : 'white',
                border: isAutoPlaying ? '1px solid var(--border-default)' : '1px solid var(--teal-base)',
              }}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isAutoPlaying ? 'Pause Briefing' : 'Resume Briefing'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-5 relative z-10">
          
          {/* Left Column: System Status & Briefing Script */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Title & Status Row */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--surface-3)', border: '1px solid var(--teal-base)' }}>
                {currentStep >= 7 ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--status-safe)' }} /> : <span className="text-sm font-bold" style={{ color: 'var(--teal-base)', fontFamily: 'var(--font-mono)' }}>{currentStep}</span>}
              </div>
              <div className="space-y-1 mt-0.5">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {currentStepData.title}
                </h3>
                <div className="flex items-center gap-4 text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> {currentStepData.eventDescription}</span>
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> {currentStepData.systemCalculation}</span>
                </div>
              </div>
            </div>

            {/* Presenter Script Block */}
            <div className="rounded-xl p-4 text-sm leading-relaxed relative" style={{ background: 'rgba(5,8,16,0.6)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid var(--teal-base)', color: 'var(--text-primary)' }}>
              <div className="absolute -top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--teal-dim)', color: 'white', fontFamily: 'var(--font-mono)' }}>
                <div className="flex items-center gap-1.5"><Volume2 className="w-3 h-3" /> Voiceover Script</div>
              </div>
              <span className="italic mt-1 block">"{currentStepData.script}"</span>
            </div>
            
            {/* Judge Notice Block */}
            <div className="rounded-xl p-3 text-xs leading-relaxed" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--text-secondary)' }}>
               <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--status-caution)', fontFamily: 'var(--font-mono)' }}>
                  <Eye className="w-3.5 h-3.5" /> What judges should notice
               </div>
               {currentStepData.judgeNotice}
            </div>

          </div>

          {/* Right Column: Sequence Navigation */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="label-mono flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <span>Sequence Control</span>
              <span>8 Steps</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {STEPS.map((s) => {
                const isPast = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                
                return (
                  <button
                    key={s.step}
                    onClick={() => handleManualStep(s.step)}
                    className="px-3 py-2 rounded flex items-center justify-between text-[10px] font-semibold transition-all font-mono uppercase"
                    style={{
                      background: isCurrent ? 'var(--teal-dim)' : isPast ? 'rgba(255,255,255,0.03)' : 'var(--surface-2)',
                      color: isCurrent ? 'white' : isPast ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      border: `1px solid ${isCurrent ? 'var(--teal-base)' : 'var(--border-subtle)'}`
                    }}
                  >
                    <span>Step {s.step}</span>
                    {isPast && <CheckCircle className="w-3 h-3 opacity-50" />}
                    {isCurrent && <Activity className="w-3 h-3 pulse-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
