import React, { useState } from 'react';
import { PRESETS } from '../data/presets';
import { Download, Activity, CheckCircle } from 'lucide-react';

interface DataReadinessViewProps {
  selectedPresetId: string;
}

type CsvKey =
  | 'venue_zones'
  | 'corridors'
  | 'event_schedule'
  | 'arrival_forecast'
  | 'live_sensor_readings'
  | 'incident_reports'
  | 'operator_actions';

export const DataReadinessView: React.FC<DataReadinessViewProps> = ({ selectedPresetId }) => {
  const preset = PRESETS[selectedPresetId] || PRESETS.ipl_stadium;
  const [activeCsvKey, setActiveCsvKey] = useState<CsvKey>('venue_zones');

  const csvContent = preset.rawCsvs[activeCsvKey] || '';

  // Parse CSV string into table rows
  const lines = csvContent.trim().split('\n').filter((l) => l.trim().length > 0);
  const headers = lines[0] ? lines[0].split(',') : [];
  const rows = lines.slice(1).map((line) => line.split(','));

  const handleDownloadCsv = () => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedPresetId}_${activeCsvKey}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 py-6 max-w-screen-xl mx-auto px-5 fade-in">
      {/* Top Banner: Data Readiness Score Meter */}
      <div className="glass-panel rounded-xl p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative" style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)' }}>
            {/* Subtle progress ring effect */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
              <circle cx="32" cy="32" r="28" fill="none" stroke="var(--teal-base)" strokeWidth="4" strokeDasharray="175.9" strokeDashoffset={175.9 * (1 - 0.94)} strokeLinecap="round" />
            </svg>
            <span className="font-semibold text-lg text-white" style={{ fontFamily: 'var(--font-mono)' }}>94%</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-white">Data Readiness Index</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider flex items-center gap-1" style={{ background: 'var(--status-safe-bg)', color: 'var(--status-safe)', border: '1px solid rgba(34,197,94,0.15)', textTransform: 'uppercase' }}>
                <CheckCircle className="w-3 h-3" /> Benchmark Passed
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              7/7 Core Schema Files Validated • Digital Twin Graph Topology Verified • Simulated Data Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--text-secondary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)')}
          >
            <Download className="w-3.5 h-3.5" style={{ color: 'var(--teal-base)' }} />
            Download {activeCsvKey}.csv
          </button>
        </div>
      </div>

      {/* Pipeline Architecture Diagram */}
      <div className="glass-panel rounded-xl p-5 flex flex-col">
        <div className="flex items-center gap-2 pb-3 mb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <Activity className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
          <h3 className="font-semibold text-white text-sm">CrowdFlow Data Pipeline Architecture</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '1. Live Sensors', desc: 'CCTV counts, Wi-Fi pings, turnstile logs' },
            { step: '2. Graph Twin', desc: 'Zones & corridors movement network' },
            { step: '3. NLP Classification', desc: 'Zero-shot incident text report intake' },
            { step: '4. Reroute Engine', desc: 'Strategy comparison & bottleneck prediction' },
            { step: '5. Operator Approval', desc: 'Human-in-the-loop safest move activation', isFinal: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg"
              style={{
                background: item.isFinal ? 'var(--status-safe-bg)' : 'var(--surface-3)',
                border: `1px solid ${item.isFinal ? 'rgba(34,197,94,0.15)' : 'var(--border-subtle)'}`
              }}
            >
              <div className="text-xs font-semibold mb-1.5" style={{ color: item.isFinal ? 'var(--status-safe)' : 'var(--teal-base)' }}>{item.step}</div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset File Selector Tabs & Table Viewer */}
      <div className="glass-panel rounded-xl overflow-hidden">
        
        {/* Dataset Tabs */}
        <div className="flex items-center overflow-x-auto" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-2)' }}>
          {(
            [
              { key: 'venue_zones', label: 'venue_zones.csv', desc: 'Base Map' },
              { key: 'corridors', label: 'corridors.csv', desc: 'Movement Network' },
              { key: 'event_schedule', label: 'event_schedule.csv', desc: 'Crowd Pulses' },
              { key: 'arrival_forecast', label: 'arrival_forecast.csv', desc: 'Demand Input' },
              { key: 'live_sensor_readings', label: 'live_sensor_readings.csv', desc: 'Real-time Updates' },
              { key: 'incident_reports', label: 'incident_reports.csv', desc: 'NLP Input' },
              { key: 'operator_actions', label: 'operator_actions.csv', desc: 'Audit Log' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCsvKey(tab.key)}
              className="px-4 py-3 text-left transition-colors whitespace-nowrap min-w-[160px]"
              style={{
                borderBottom: activeCsvKey === tab.key ? '2px solid var(--teal-base)' : '2px solid transparent',
                background: activeCsvKey === tab.key ? 'rgba(14, 165, 165, 0.05)' : 'transparent',
              }}
            >
              <div className="text-xs font-semibold" style={{ color: activeCsvKey === tab.key ? 'white' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{tab.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{tab.desc}</div>
            </button>
          ))}
        </div>

        {/* Tabular Data Inspector */}
        <div className="overflow-x-auto max-h-[500px] custom-scrollbar bg-transparent">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)' }}>
            <thead className="sticky top-0 z-10" style={{ background: 'var(--surface-3)', borderBottom: '1px solid var(--border-default)' }}>
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold" style={{ color: 'var(--teal-base)' }}>
                    {h.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-secondary)' }}>
              {rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }} className="hover:bg-white/[0.02]">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-2.5">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
