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
    <div className="flex flex-col gap-4 h-full">
      <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wider pb-2 mb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          Decision Queue
        </h3>
        
        <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
          {strategies.map((strat, index) => {
            const isSelected = selectedStrategyId === strat.id;
            const isApproved = activeActions.some((a) => a.strategy_id === strat.id && a.status === 'active');
            const isConfirming = confirmingId === strat.id;
            const projectedRisk = Math.max(25, Math.round(currentVenueRisk * (1 - strat.risk_reduction_pct / 100)));

            return (
              <div
                key={strat.id}
                onClick={() => !isApproved && setSelectedStrategyId(strat.id)}
                className="rounded-xl overflow-hidden transition-all cursor-pointer flex flex-col"
                style={{
                  border: isApproved
                    ? '1px solid rgba(34,197,94,0.3)'
                    : isSelected
                    ? '1px solid var(--teal-base)'
                    : '1px solid var(--border-subtle)',
                  background: isApproved
                    ? 'rgba(34,197,94,0.05)'
                    : isSelected
                    ? 'var(--surface-3)'
                    : 'var(--surface-2)',
                }}
              >
                {/* Header */}
                <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <span className="label-mono">Strategy {index + 1}</span>
                    {strat.is_recommended && !isApproved && (
                      <span className="badge-teal px-1.5 py-0 rounded text-[9px] font-bold">REC</span>
                    )}
                  </div>
                  {isApproved && (
                    <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--status-safe)' }}>Active</span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{strat.title}</p>
                    <p className="text-[11px] mt-1 leading-snug" style={{ color: 'var(--text-secondary)' }}>{strat.description}</p>
                  </div>

                  {/* Impact Metrics - Requested by User */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>
                    <div className="p-2 rounded" style={{ background: 'var(--surface-base)' }}>
                      <p style={{ color: 'var(--text-tertiary)' }}>Load Reduction</p>
                      <p className="font-semibold text-white pt-0.5">-{strat.capacity_relief_pmin} p/m</p>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--surface-base)' }}>
                      <p style={{ color: 'var(--text-tertiary)' }}>Time Saved</p>
                      <p className="font-semibold" style={{ color: 'var(--status-safe)' }}>~{Math.max(1, strat.eta_improvement_mins)} mins</p>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--surface-base)' }}>
                      <p style={{ color: 'var(--text-tertiary)' }}>Risk Impact</p>
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="font-semibold" style={{ color: 'var(--status-critical)' }}>{currentVenueRisk}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                        <span className="font-semibold" style={{ color: 'var(--status-safe)' }}>{projectedRisk}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded" style={{ background: 'var(--surface-base)' }}>
                      <p style={{ color: 'var(--text-tertiary)' }}>Capacity Reserve</p>
                      <p className="font-semibold" style={{ color: 'var(--teal-base)' }}>+{Math.round(strat.capacity_relief_pmin * 1.5)} p/m</p>
                    </div>
                  </div>

                  {/* Action Area */}
                  {isApproved ? (
                    <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold" style={{ color: 'var(--status-safe)' }}>
                      <ShieldCheck className="w-3.5 h-3.5" /> Approved
                    </div>
                  ) : isConfirming ? (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleConfirmApproval(strat); }}
                        className="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                        style={{ background: 'var(--status-safe)', color: '#050810' }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancelApproval(); }}
                        className="flex-1 py-1.5 rounded text-[10px] font-bold uppercase transition-colors"
                        style={{ background: 'var(--surface-base)', color: 'var(--text-secondary)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRequestApproval(strat); }}
                      className="w-full py-1.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
                      style={strat.is_recommended ? { background: 'var(--teal-dim)', color: 'white' } : { background: 'var(--surface-base)', color: 'var(--text-secondary)' }}
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
          <div className="mt-4 pt-3 border-t border-white/10 shrink-0">
            <h3 className="text-[10px] font-bold text-white uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>System Audit Log</h3>
            <div className="space-y-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {activeActions.map(action => (
                <div key={action.id} className="text-[10px] font-mono leading-tight px-2 py-1.5 rounded" style={{ background: 'var(--surface-base)', borderLeft: '2px solid var(--status-safe)', color: 'var(--text-primary)' }}>
                  <span className="text-slate-500">{action.time}</span> <span className="text-slate-600">·</span> <span style={{ color: 'var(--status-safe)' }}>Reroute approved</span> <span className="text-slate-600">·</span> <span className="text-white">{action.action}</span> <span className="text-slate-600">·</span> <span className="text-slate-400">Risk {action.risk_before} &rarr; {action.risk_after}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
