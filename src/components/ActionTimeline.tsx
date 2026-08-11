import React from 'react';
import type { OperatorAction } from '../types/crowdflow';
import { Clock, CheckCircle, AlertCircle, Radio, ShieldCheck } from 'lucide-react';

interface ActionTimelineProps {
  actions: OperatorAction[];
}

export const ActionTimeline: React.FC<ActionTimelineProps> = ({ actions }) => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <ShieldCheck className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
        <div>
          <p className="text-sm font-semibold text-white">Operator Action Log</p>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Approved interventions in chronological order</p>
        </div>
      </div>

      <div className="p-4">
        {actions.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Radio className="w-6 h-6 mx-auto opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No operator actions recorded</p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Approve an intervention route above to log it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex gap-3 p-3 rounded-lg"
                style={{
                  background: action.status === 'active' ? 'rgba(34,197,94,0.04)' : 'var(--surface-3)',
                  border: `1px solid ${action.status === 'active' ? 'rgba(34,197,94,0.15)' : 'var(--border-subtle)'}`,
                }}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  {action.status === 'active' ? (
                    <CheckCircle className="w-4 h-4" style={{ color: 'var(--status-safe)' }} />
                  ) : action.status === 'reverted' ? (
                    <AlertCircle className="w-4 h-4" style={{ color: 'var(--status-caution)' }} />
                  ) : (
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-white truncate">{action.action}</p>
                    <span
                      className="shrink-0 text-xs px-1.5 py-0.5 rounded"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        background: action.status === 'active' ? 'var(--status-safe-bg)' : 'var(--surface-2)',
                        color: action.status === 'active' ? 'var(--status-safe)' : 'var(--text-tertiary)',
                        border: `1px solid ${action.status === 'active' ? 'rgba(34,197,94,0.15)' : 'var(--border-subtle)'}`,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '10px',
                      }}
                    >
                      {action.status}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{action.expected_effect}</p>
                  <p className="label-mono">{action.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
