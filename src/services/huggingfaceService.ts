import type { IncidentLabel } from '../types/crowdflow';

export interface ClassificationResult {
  label: IncidentLabel;
  confidence: number;
  short_reason: string;
  simulation_impact: string;
  source?: 'huggingface_api' | 'deterministic_fallback' | 'local_fallback' | 'huggingface';
}

export async function classifyIncidentReport(text: string): Promise<ClassificationResult> {
  // We no longer use the client-side hfToken. The backend manages it.
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error('Backend classification failed');
    const data = await res.json();
    
    return {
      label: data.label,
      confidence: data.confidence,
      short_reason: data.short_reason,
      simulation_impact: data.simulation_impact,
      source: data.source || 'local_fallback'
    };
  } catch (error) {
    console.error('Classification error:', error);
    // Ultimate fallback if backend is completely down
    return {
      label: 'crowd congestion',
      confidence: 0.5,
      short_reason: 'Backend offline',
      simulation_impact: 'Offline fallback.',
      source: 'local_fallback'
    }
  }
}
