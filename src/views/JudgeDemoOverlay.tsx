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
          overallVenueRisk: 81,
          zones: {
            ...prev.zones,
            gate_c: {
              ...prev.zones.gate_c,
              occupants: 2538,
              density: 5.4,
              risk_score: 81,
              queue: 480,
            },
          },
        }));
      },
    },
    {
      step: 3,
      title: 'NLP Incident Classification',
      eventDescription: 'Ground staff text: "Large spill at Gate C, the floor is slick and crowds are backing up fast."',
      systemCalculation: 'Hugging Face API classifies as "safety hazard".',
      script: 'A ground staff member reports: "Large spill at Gate C...". Using NLP, our system classifies this as a safety hazard. That updates the graph because Gate C\'s throughput dropped.',
      judgeNotice: 'Unstructured text is instantly converted into structured simulation data.',
      action: async () => {
        const res = await classifyIncidentReport('Large spill at Gate C, the floor is slick and crowds are backing up fast.');
        setSimulationState((prev) => ({
          ...prev,
          activeIncidents: [
            {
              id: 'inc-demo-1',
              time: '19:48',
              zone: 'gate_c',
              report_text: 'Large spill at Gate C, the floor is slick and crowds are backing up fast.',
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
      script: 'VenuePulse AI forecasts that Gate C will breach safe density in 8 minutes before critical overcrowding occurs.',
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
            time: '19:53',
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
              gate_c: { ...prev.zones.gate_c, density: 3.4, risk_score: 56, queue: 120 },
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
    <div className="fixed right-4 top-20 bottom-4 w-[420px] z-50 fade-in flex flex-col">
      <div className="bg-[#020308] rounded p-4 shadow-2xl relative overflow-hidden flex-1 flex flex-col border border-teal-500/20">
        {/* Subtle Success Pulse overlay if step 7 or 8 */}
        {(currentStep === 7 || currentStep === 8) && (
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at top, rgba(34,197,94,0.03), transparent 70%)' }} />
        )}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-black">
          <div
            className="h-full transition-all duration-700 ease-in-out relative bg-teal-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Top Overlay Header */}
        <div className="flex items-center justify-between pb-3 pt-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded text-[9px] uppercase font-bold flex items-center gap-1.5 tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono">
              <Activity className="w-3 h-3" /> BRIEFING SCRIPT
            </div>
            <span className="text-xs font-bold text-white tracking-wide font-mono">
              Seq {currentStep}/{STEPS.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors flex items-center gap-1.5 uppercase tracking-wide font-mono border ${isAutoPlaying ? 'bg-black text-slate-400 border-white/10 hover:bg-white/5' : 'bg-teal-500/20 text-teal-400 border-teal-500/30 hover:bg-teal-500/30'}`}
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {isAutoPlaying ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col gap-4 items-stretch mt-4 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Top Block: System Status & Briefing Script */}
          <div className="space-y-4">
            
            {/* Title & Status Row */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-teal-500/10 border border-teal-500/30">
                {currentStep >= 7 ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <span className="text-xs font-bold text-teal-400 font-mono">{currentStep}</span>}
              </div>
              <div className="space-y-1.5 mt-0.5">
                <h3 className="text-base font-bold text-white tracking-tight leading-tight">
                  {currentStepData.title}
                </h3>
                <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-slate-500" /> {currentStepData.eventDescription}</span>
                  <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-slate-500" /> {currentStepData.systemCalculation}</span>
                </div>
              </div>
            </div>

            {/* Presenter Script Block */}
            <div className="rounded p-3 text-sm leading-relaxed relative bg-black/40 border border-white/5 border-l-2 border-l-teal-500">
              <div className="absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-teal-500/20 text-teal-400 border border-teal-500/30 font-mono flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5" /> Script
              </div>
              <span className="italic mt-1 block text-slate-300">"{currentStepData.script}"</span>
            </div>
            
            {/* Judge Notice Block */}
            <div className="rounded p-2.5 text-xs leading-relaxed bg-amber-500/5 border border-amber-500/10 text-slate-400">
               <div className="flex items-center gap-1.5 mb-1 text-[9px] uppercase font-bold tracking-wider text-amber-500 font-mono">
                  <Eye className="w-3 h-3" /> Focus Area
               </div>
               {currentStepData.judgeNotice}
            </div>

          </div>

          {/* Bottom Block: Sequence Navigation */}
          <div className="flex flex-col gap-2 shrink-0 pt-3 border-t border-white/10 mt-auto">
            <div className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest pb-1 border-b border-white/5">
              Sequence Navigator
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STEPS.map((s) => {
                const isPast = currentStep > s.step;
                const isCurrent = currentStep === s.step;
                
                return (
                  <button
                    key={s.step}
                    onClick={() => handleManualStep(s.step)}
                    className={`px-2 py-1.5 rounded flex items-center justify-between text-[9px] font-bold transition-all font-mono uppercase border ${isCurrent ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : isPast ? 'bg-white/5 text-slate-400 border-transparent hover:bg-white/10' : 'bg-transparent text-slate-600 border-transparent hover:bg-white/5'}`}
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
