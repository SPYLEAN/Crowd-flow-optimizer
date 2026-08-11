import React, { useEffect, useRef, useState } from 'react';
import type { SimulationState, Zone } from '../types/crowdflow';
import { Layers, Info } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number;
  speed: number;
  edgeId: string;
}

interface VenueMapCanvasProps {
  state: SimulationState;
  onSelectZone?: (zoneId: string) => void;
  highlightZoneId?: string | null;
}

export const VenueMapCanvas: React.FC<VenueMapCanvasProps> = ({
  state,
  onSelectZone,
  highlightZoneId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Animation particles state
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Initialize particles for corridors
    if (particlesRef.current.length === 0) {
      const initialParticles: Particle[] = [];
      Object.values(state.corridors).forEach((corridor) => {
        const fromZ = state.zones[corridor.from_zone];
        const toZ = state.zones[corridor.to_zone];
        if (fromZ && toZ) {
          // Reduce number of particles for a cleaner look
          for (let i = 0; i < 4; i++) {
            initialParticles.push({
              x: fromZ.x,
              y: fromZ.y,
              fromX: fromZ.x,
              fromY: fromZ.y,
              toX: toZ.x,
              toY: toZ.y,
              progress: Math.random(),
              speed: 0.002 + Math.random() * 0.002,
              edgeId: corridor.edge_id,
            });
          }
        }
      });
      particlesRef.current = initialParticles;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid / Radar background - very subtle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Heatmap layer if toggled - muted colors
      if (showHeatmap) {
        Object.values(state.zones).forEach((zone) => {
          const density = zone.density || 1.5;
          const radius = Math.min(160, Math.sqrt(zone.area_m2) * 3.5);
          const gradient = ctx.createRadialGradient(zone.x, zone.y, 10, zone.x, zone.y, radius);

          if (density >= zone.critical_density) {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.20)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          } else if (density >= zone.safe_density) {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(14, 165, 165, 0.08)');
            gradient.addColorStop(1, 'rgba(14, 165, 165, 0)');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 1. Draw Corridors (Edges)
      Object.values(state.corridors).forEach((corridor) => {
        const fromZ = state.zones[corridor.from_zone];
        const toZ = state.zones[corridor.to_zone];
        if (!fromZ || !toZ) return;

        ctx.beginPath();
        ctx.moveTo(fromZ.x, fromZ.y);
        ctx.lineTo(toZ.x, toZ.y);

        if (corridor.status === 'open') {
          ctx.strokeStyle = 'rgba(14, 165, 165, 0.25)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.6);
          ctx.setLineDash([]);
        } else if (corridor.status === 'rerouted') {
          ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
          ctx.lineWidth = Math.max(2, corridor.width_m * 0.8);
          ctx.setLineDash([6, 3]);
        } else if (corridor.status === 'restricted') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.5);
          ctx.setLineDash([4, 4]);
        } else if (corridor.status === 'emergency_only') {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([2, 4]);
        } else {
          // Closed
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Corridor Label
        const midX = (fromZ.x + toZ.x) / 2;
        const midY = (fromZ.y + toZ.y) / 2;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillText(`${corridor.edge_id}`, midX - 12, midY - 6);
      });

      // 2. Animate Flow Particles
      particlesRef.current.forEach((p) => {
        const corridor = state.corridors[p.edgeId];
        if (corridor && corridor.status !== 'closed') {
          p.progress += p.speed * (corridor.status === 'rerouted' ? 1.2 : 0.8);
          if (p.progress >= 1) p.progress = 0;

          p.x = p.fromX + (p.toX - p.fromX) * p.progress;
          p.y = p.fromY + (p.toY - p.fromY) * p.progress;

          ctx.beginPath();
          ctx.arc(p.x, p.y, corridor.status === 'rerouted' ? 2 : 1.5, 0, Math.PI * 2);
          ctx.fillStyle = corridor.status === 'rerouted' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(14, 165, 165, 0.6)';
          ctx.fill();
        }
      });

      // 3. Draw Zone Nodes
      Object.values(state.zones).forEach((zone) => {
        const density = zone.density || 1.5;
        const isCritical = density >= zone.critical_density;
        const isHigh = density >= zone.safe_density;
        const isHighlighted = highlightZoneId === zone.zone_id;

        // Outer Aura Ring for Critical / Highlighted Zones
        if (isCritical || isHighlighted) {
          const pulse = (Date.now() % 2000) / 2000;
          const ringRadius = 24 + pulse * 12;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isCritical ? `rgba(239, 68, 68, ${0.4 * (1 - pulse)})` : `rgba(14, 165, 165, ${0.4 * (1 - pulse)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Zone Node Body
        ctx.beginPath();
        const nodeRadius = Math.max(16, Math.min(28, Math.sqrt(zone.area_m2) * 0.9));
        ctx.arc(zone.x, zone.y, nodeRadius, 0, Math.PI * 2);

        let fillColor = 'rgba(14, 165, 165, 0.15)';
        let strokeColor = 'rgba(14, 165, 165, 0.4)';
        
        if (isCritical) {
          fillColor = 'rgba(239, 68, 68, 0.2)';
          strokeColor = 'rgba(239, 68, 68, 0.5)';
        } else if (isHigh) {
          fillColor = 'rgba(245, 158, 11, 0.15)';
          strokeColor = 'rgba(245, 158, 11, 0.4)';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.strokeStyle = isHighlighted ? 'rgba(14, 165, 165, 0.8)' : strokeColor;
        ctx.stroke();

        // Icon / Type Indicator
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.name.substring(0, 10), zone.x, zone.y - 4);

        // Density Text Badge
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillText(`${density} p/m²`, zone.x, zone.y + 8);

        // Active Incident Alert Marker
        const hasIncident = state.activeIncidents.some(
          (i) => i.zone === zone.zone_id && i.status !== 'mitigated'
        );
        if (hasIncident) {
          ctx.beginPath();
          ctx.arc(zone.x + nodeRadius - 2, zone.y - nodeRadius + 2, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'var(--status-critical)';
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('!', zone.x + nodeRadius - 2, zone.y - nodeRadius + 2);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, showHeatmap, highlightZoneId]);

  // Mouse interaction handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let found: Zone | null = null;
    Object.values(state.zones).forEach((z) => {
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= 30) {
        found = z;
      }
    });
    setHoveredZone(found);
  };

  const handleClick = () => {
    if (hoveredZone) {
      setSelectedZone(hoveredZone);
      if (onSelectZone) onSelectZone(hoveredZone.zone_id);
    }
  };

  return (
    <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl h-full min-h-[500px]">
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-2 rounded-lg flex items-center gap-2 pointer-events-auto" style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: 'var(--teal-base)' }} />
          <span className="text-[10px] font-semibold text-white tracking-widest uppercase">
            Live Venue Graph
          </span>
          <span className="label-mono ml-2 border-l pl-2" style={{ borderColor: 'var(--border-default)' }}>
            {Object.keys(state.zones).length} Zones · {Object.keys(state.corridors).length} Corridors
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            style={{
              background: showHeatmap ? 'var(--teal-soft)' : 'var(--surface-2)',
              border: `1px solid ${showHeatmap ? 'rgba(14,165,165,0.2)' : 'var(--border-subtle)'}`,
              color: showHeatmap ? 'var(--teal-base)' : 'var(--text-secondary)'
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            Heatmap {showHeatmap ? 'Active' : 'Hidden'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={950}
        height={620}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="w-full h-full object-cover cursor-crosshair block"
      />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-2 rounded-lg flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider" style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--teal-base)' }} />
          <span>Nominal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--status-caution)' }} />
          <span>Elevated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full pulse-dot" style={{ background: 'var(--status-critical)' }} />
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Critical</span>
        </div>
        <div className="flex items-center gap-1.5 border-l pl-3" style={{ borderColor: 'var(--border-default)' }}>
          <span className="w-4 h-0.5 border-t border-dashed" style={{ borderColor: 'var(--status-safe)' }} />
          <span style={{ color: 'var(--status-safe)' }}>Reroute Live</span>
        </div>
      </div>

      {/* Zone Detail Modal / Card on Click */}
      {selectedZone && (
        <div className="absolute bottom-3 right-3 z-20 glass-panel rounded-xl p-4 max-w-[280px] w-full shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
              <Info className="w-4 h-4" style={{ color: 'var(--teal-base)' }} />
              {selectedZone.name}
            </h4>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            <div style={{ color: 'var(--text-tertiary)' }}>Type: <span className="uppercase" style={{ color: 'var(--teal-base)' }}>{selectedZone.type}</span></div>
            <div style={{ color: 'var(--text-tertiary)' }}>Area: <span className="text-white">{selectedZone.area_m2} m²</span></div>
            <div style={{ color: 'var(--text-tertiary)' }}>Count: <span className="text-white font-semibold">{selectedZone.occupants || 0}</span></div>
            <div style={{ color: 'var(--text-tertiary)' }}>Density: <span className="font-semibold" style={{ color: (selectedZone.density || 0) >= selectedZone.critical_density ? 'var(--status-critical)' : 'var(--text-primary)' }}>{selectedZone.density} p/m²</span></div>
            <div style={{ color: 'var(--text-tertiary)' }}>Inflow: <span className="text-white">{selectedZone.capacity_per_min}/m</span></div>
            <div style={{ color: 'var(--text-tertiary)' }}>Queue: <span className="font-semibold" style={{ color: (selectedZone.queue || 0) > 0 ? 'var(--status-caution)' : 'var(--text-primary)' }}>{selectedZone.queue || 0}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
