import React, { useState } from 'react';
import type { IncidentReport } from '../types/crowdflow';
import { classifyIncidentReport } from '../services/huggingfaceService';
import type { ClassificationResult } from '../services/huggingfaceService';
import { Cpu, Send, AlertCircle, Database } from 'lucide-react';

interface IncidentClassifierPanelProps {
  onAddIncident: (incident: IncidentReport) => void;
  selectedZoneId?: string;
  dataReadinessScore: number;
}

const SAMPLE_REPORTS = [
  { text: 'QR scanning is slow at Gate C', zone: 'gate_c' },
  { text: 'Medical team needs clear lane near south exit', zone: 'south_exit' },
];

export const IncidentClassifierPanel: React.FC<IncidentClassifierPanelProps> = ({
  onAddIncident,
  dataReadinessScore = 94,
}) => {
  const [reportText, setReportText] = useState('QR scanning is slow at Gate C');
  const [targetZone, setTargetZone] = useState('gate_c');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);

  const handleAnalyze = async (overrideText?: string) => {
    const text = overrideText ?? reportText;
    if (!text.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await classifyIncidentReport(text);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInject = () => {
    if (!result) return;
    onAddIncident({
      id: `inc-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      zone: targetZone,
      report_text: reportText,
      classified_label: result.label,
      confidence: result.confidence,
      short_reason: result.short_reason,
      simulation_impact: result.simulation_impact,
      status: 'pending',
    });
    setResult(null);
  };

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x overflow-hidden" style={{ borderColor: 'var(--border-subtle)' }}>
      
      {/* Left: Input & Trigger */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Live NLP Classification</span>
          </div>
          {result && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: result.source === 'huggingface' || result.source === 'huggingface_api' ? 'var(--status-safe-bg)' : 'var(--surface-3)', color: result.source === 'huggingface' || result.source === 'huggingface_api' ? 'var(--status-safe)' : 'var(--text-tertiary)' }}>
              {result.source === 'huggingface' || result.source === 'huggingface_api' ? 'HF Inference' : 'Offline Fallback'}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="Ground staff report..."
            className="flex-1 text-xs rounded-lg px-3 py-1.5 focus:outline-none transition-colors"
            style={{ background: 'var(--surface-3)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing}
            className="px-4 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--teal-dim)', color: 'white', opacity: isAnalyzing ? 0.6 : 1 }}
          >
            {isAnalyzing ? 'Processing...' : 'Classify'}
          </button>
        </div>
      </div>

      {/* Middle: Classification Result */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        {result ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" style={{ color: 'var(--status-caution)' }} />
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--status-caution)' }}>{result.label}</span>
              </div>
              <span className="label-mono">{Math.round(result.confidence * 100)}% Conf</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <span className="text-white font-medium">Impact:</span> {result.simulation_impact}
            </p>
            <button
              onClick={handleInject}
              className="w-full mt-1 py-1.5 rounded text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-1.5"
              style={{ background: 'var(--surface-3)', color: 'white', border: '1px solid var(--border-subtle)' }}
            >
              <Send className="w-3 h-3" /> Apply to Graph
            </button>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
            <span className="label-mono">Awaiting Input</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {SAMPLE_REPORTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setReportText(s.text); setTargetZone(s.zone); }}
                  className="px-2 py-0.5 rounded text-[10px] transition-colors"
                  style={{ background: 'var(--surface-3)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  Load: "{s.text.substring(0, 15)}..."
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Data Readiness / Live Signals */}
      <div className="flex-1 p-4 flex flex-col justify-center">
        <div className="flex items-center justify-between mb-2 pb-1" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="text-xs font-semibold text-white uppercase tracking-wider">Data Readiness</span>
          <Database className="w-3.5 h-3.5 opacity-50" />
        </div>
        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
          <div>
            <p style={{ color: 'var(--text-tertiary)' }}>Integrity Score</p>
            <p className="text-sm font-bold text-white mt-0.5">{dataReadinessScore}%</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-tertiary)' }}>Live Sensors</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--status-safe)' }}>Active</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};
