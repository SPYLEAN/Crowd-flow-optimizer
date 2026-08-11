import React from 'react';
import type { SimulationState } from '../types/crowdflow';
import { Play, Pause, AlertTriangle, ShieldCheck, Clock, TrendingUp } from 'lucide-react';

interface ForecastTimelinePanelProps {
  state: SimulationState;
  onTimeOffsetChange: (offsetMins: number) => void;
  onRunForecast: () => void;
}

export const ForecastTimelinePanel: React.FC<ForecastTimelinePanelProps> = ({
  state,
  onTimeOffsetChange,
  onRunForecast,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const currentOffset = state.selectedTimeOffsetMins || 0;

  const timePoints = [
    { label: 'Now', mins: 0, text: '19:45' },
    { label: '+5m', mins: 5, text: '19:50' },
    { label: '+10m', mins: 10, text: '19:55' },
    { label: '+20m', mins: 20, text: '20:05' },
    { label: '+30m', mins: 30, text: '20:15' },
  ];

  // Auto-play timeline step
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const currentIdx = timePoints.findIndex(t => t.mins === (state.selectedTimeOffsetMins || 0));
      const nextIdx = (currentIdx + 1) % timePoints.length;
      onTimeOffsetChange(timePoints[nextIdx].mins);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, state.selectedTimeOffsetMins, onTimeOffsetChange]);

  const activeIncident = state.activeIncidents.find(i => i.status !== 'mitigated');
  const activeAction = state.activeActions.find(a => a.status === 'active');

  return (
    <div className="glass-panel rounded p-3 h-full flex flex-col justify-between">
      {/* Top Controls: Playback & Horizon info */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">30-Min Forecast Playback</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 font-mono font-bold tracking-widest uppercase">
            {timePoints.find(t => t.mins === currentOffset)?.label} / {timePoints.find(t => t.mins === currentOffset)?.text}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors uppercase border ${isPlaying ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? 'PAUSE SCRUB' : 'PLAY FORECAST'}
          </button>

          <button
            onClick={onRunForecast}
            className="px-2.5 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors uppercase border bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20"
          >
            <TrendingUp className="w-3 h-3" />
            RECALCULATE
          </button>
        </div>
      </div>

      {/* Timeline Scrub Track */}
      <div className="py-2 space-y-2">
        <div className="relative flex items-center justify-between px-2">
          {/* Track Line */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800" />
          
          {/* Dynamic Fill Line */}
          <div
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-teal-500 transition-all duration-300"
            style={{
              width: `${(currentOffset / 30) * 85}%`,
            }}
          />

          {timePoints.map((tp) => {
            const isActive = currentOffset === tp.mins;
            const isPassed = currentOffset > tp.mins;
            
            return (
              <button
                key={tp.mins}
                onClick={() => { setIsPlaying(false); onTimeOffsetChange(tp.mins); }}
                className="relative z-10 flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div
                  className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-teal-500 border-teal-500 scale-125'
                      : isPassed
                      ? 'bg-teal-900 border-teal-500'
                      : 'bg-[#050810] border-slate-700 hover:border-slate-500'
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold tracking-widest ${isActive ? 'text-teal-400' : 'text-slate-500'}`}>
                  {tp.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Insights Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-white/5 text-[10px] font-mono font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2 text-slate-400 bg-[#020308] px-2 py-1.5 rounded border border-white/5">
          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">
            {state.forecastBreachTimeMins
              ? `Gate C breach in ~${state.forecastBreachTimeMins} mins`
              : activeAction 
                ? `Breach avoided — ${activeAction.action}`
                : 'Nominal Flow'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 bg-[#020308] px-2 py-1.5 rounded border border-white/5">
          <Clock className="w-3 h-3 text-teal-500 shrink-0" />
          <span className="truncate">
            {activeIncident
              ? `INC: ${activeIncident.classified_label || 'Congestion'}`
              : 'Zero active incident warnings'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 bg-[#020308] px-2 py-1.5 rounded border border-white/5">
          <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="truncate">
            {activeAction
              ? `Active: ${activeAction.action}`
              : 'No active reroute interventions'}
          </span>
        </div>
      </div>
    </div>
  );
};
