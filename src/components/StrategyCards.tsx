import React, { useState } from 'react';
import type { RerouteStrategy, OperatorAction } from '../types/crowdflow';
import { ShieldCheck, ArrowRight, Target } from 'lucide-react';

interface StrategyCardsProps {
  strategies: RerouteStrategy[];
  currentVenueRisk: number;
  onApproveStrategy: (strategy: RerouteStrategy) => void;
  activeActions: OperatorAction[];
}

export const StrategyCards: React.FC<StrategyCardsProps> = ({
  strategies,
  currentVenueRisk,
  onApproveStrategy,
  activeActions,
}) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[0]?.id ?? '');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleRequestApproval = (strat: RerouteStrategy) => {
    setConfirmingId(strat.id);
  };

  const handleConfirmApproval = (strat: RerouteStrategy) => {
    onApproveStrategy(strat);
    setConfirmingId(null);
  };

  const handleCancelApproval = () => {
    setConfirmingId(null);
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="glass-panel rounded p-3 flex flex-col h-full min-h-0">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 mb-2 font-mono border-b border-white/5">
          Decision Queue
        </h3>
        
        <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {strategies.map((strat, index) => {
            const isSelected = selectedStrategyId === strat.id;
            const isApproved = activeActions.some((a) => a.strategy_id === strat.id && a.status === 'active');
            const isConfirming = confirmingId === strat.id;
            const projectedRisk = Math.max(25, Math.round(currentVenueRisk * (1 - strat.risk_reduction_pct / 100)));

            return (
              <div
                key={strat.id}
                onClick={() => !isApproved && setSelectedStrategyId(strat.id)}
                className="rounded border transition-all cursor-pointer flex flex-col"
                style={{
                  borderColor: isApproved
                    ? 'rgba(34,197,94,0.3)'
                    : isSelected
                    ? 'rgba(45,212,191,0.5)'
                    : 'rgba(255,255,255,0.05)',
                  background: isApproved
                    ? 'rgba(34,197,94,0.05)'
                    : isSelected
                    ? 'rgba(255,255,255,0.02)'
                    : 'transparent',
                }}
              >
                {/* Header */}
                <div className="px-2 py-1.5 flex items-center justify-between bg-black/20 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-slate-400">STRAT_{index + 1}</span>
                    {strat.is_recommended && !isApproved && (
                      <span className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-1 py-0.5 rounded text-[8px] font-bold font-mono uppercase">Recommended</span>
                    )}
                  </div>
                  {isApproved && (
                    <span className="text-[9px] font-bold uppercase font-mono text-emerald-400">Active</span>
                  )}
                </div>

                {/* Body */}
                <div className="p-2 space-y-2">
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">{strat.title}</p>
                    <p className="text-[10px] mt-0.5 text-slate-400 leading-snug">{strat.description}</p>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                    <div className="p-1.5 rounded bg-black/40 border border-white/5">
                      <p className="text-slate-500">Load Relief</p>
                      <p className="font-bold text-white">-{strat.capacity_relief_pmin} p/m</p>
                    </div>
                    <div className="p-1.5 rounded bg-black/40 border border-white/5">
                      <p className="text-slate-500">ETA Impact</p>
                      <p className="font-bold text-emerald-400">~{Math.max(1, strat.eta_improvement_mins)} mins</p>
                    </div>
                    <div className="p-1.5 rounded bg-black/40 border border-white/5">
                      <p className="text-slate-500">Risk Delta</p>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-red-400">{currentVenueRisk}</span>
                        <ArrowRight className="w-2 h-2 opacity-50 text-slate-400" />
                        <span className="font-bold text-emerald-400">{projectedRisk}</span>
                      </div>
                    </div>
                    <div className="p-1.5 rounded bg-black/40 border border-white/5">
                      <p className="text-slate-500">Reserve</p>
                      <p className="font-bold text-teal-400">+{Math.round(strat.capacity_relief_pmin * 1.5)} p/m</p>
                    </div>
                  </div>

                  {/* Action Area */}
                  {isApproved ? (
                    <div className="flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold text-emerald-400 font-mono uppercase bg-emerald-500/10 rounded">
                      <ShieldCheck className="w-3 h-3" /> Approved
                    </div>
                  ) : isConfirming ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConfirmApproval(strat); }}
                        className="flex-1 py-1 rounded text-[9px] font-bold uppercase transition-colors bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelApproval(); }}
                        className="flex-1 py-1 rounded text-[9px] font-bold uppercase transition-colors bg-white/5 text-slate-400 hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRequestApproval(strat); }}
                      className={`w-full py-1.5 rounded text-[9px] font-bold font-mono uppercase transition-colors flex items-center justify-center gap-1.5 border ${strat.is_recommended ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                    >
                      <Target className="w-3 h-3" />
                      Approve Reroute
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Audit Log */}
        {activeActions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 shrink-0">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">System Audit Log</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {activeActions.map(action => (
                <div key={action.id} className="text-[9px] font-mono leading-tight px-1.5 py-1 rounded bg-[#020308] border border-white/5 flex gap-2">
                  <span className="text-slate-600">[{action.time}]</span>
                  <span className="text-emerald-500 font-bold">SYS_ACK</span>
                  <span className="text-slate-300 truncate">{action.action}</span>
                  <span className="text-slate-500 ml-auto shrink-0">R:{action.risk_before}&gt;{action.risk_after}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
