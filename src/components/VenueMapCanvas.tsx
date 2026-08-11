import React, { useEffect, useRef, useState } from 'react';
import type { SimulationState, Zone, LayerVisibility } from '../types/crowdflow';
import { Info, MapPin, Navigation } from 'lucide-react';

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
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const layerFlags: LayerVisibility = state.layers || {
    showDensity: true,
    showFlow: true,
    showForecast: true,
    showIncidents: true,
    showRoutes: true,
    showExits: true,
  };

  // Flow animation particles state
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Initialize particles for flow animation
    if (particlesRef.current.length === 0) {
      const initialParticles: Particle[] = [];
      Object.values(state.corridors).forEach((corridor) => {
        const fromZ = state.zones[corridor.from_zone];
        const toZ = state.zones[corridor.to_zone];
        if (fromZ && toZ) {
          for (let i = 0; i < 5; i++) {
            initialParticles.push({
              x: fromZ.x,
              y: fromZ.y,
              fromX: fromZ.x,
              fromY: fromZ.y,
              toX: toZ.x,
              toY: toZ.y,
              progress: Math.random(),
              speed: 0.002 + Math.random() * 0.003,
              edgeId: corridor.edge_id,
            });
          }
        }
      });
      particlesRef.current = initialParticles;
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── 1. MAPLIBRE GIS BASE MAP & VECTOR GRID ──
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Coordinates Grid (Lat/Lon styling)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
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

      // GeoGIS lat/lon border ticks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.fillText('18.9912° N', 10, 15);
      ctx.fillText('72.8241° E', canvas.width - 60, 15);
      ctx.fillText('GEOSPATIAL TWIN ENGINE v2.4 — MAPLIBRE VECTOR BASE', 10, canvas.height - 10);

      // ── 2. VENUE FOOTPRINT GEOMETRY (Polygon outlines) ──
      const zonesList = Object.values(state.zones);
      if (zonesList.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(zonesList[0].x, zonesList[0].y);
        for (let i = 1; i < zonesList.length; i++) {
          ctx.lineTo(zonesList[i].x, zonesList[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(14, 165, 165, 0.08)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(14, 165, 165, 0.02)';
        ctx.fill();
        ctx.stroke();
      }

      // ── 3. DENSITY HEATMAP LAYER ──
      if (layerFlags.showDensity) {
        Object.values(state.zones).forEach((zone) => {
          const density = zone.density || 1.5;
          const radius = Math.min(170, Math.sqrt(zone.area_m2) * 3.8);
          const gradient = ctx.createRadialGradient(zone.x, zone.y, 8, zone.x, zone.y, radius);

          if (density >= zone.critical_density) {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.12)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          } else if (density >= zone.safe_density) {
            gradient.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
            gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.08)');
            gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(14, 165, 165, 0.12)');
            gradient.addColorStop(1, 'rgba(14, 165, 165, 0)');
          }

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(zone.x, zone.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ── 4. CORRIDORS / PATHWAYS & REROUTES ──
      Object.values(state.corridors).forEach((corridor) => {
        const fromZ = state.zones[corridor.from_zone];
        const toZ = state.zones[corridor.to_zone];
        if (!fromZ || !toZ) return;

        const isReroute = corridor.status === 'rerouted';
        const isEmergency = corridor.status === 'emergency_only';

        if (isReroute && !layerFlags.showRoutes) return;
        if (isEmergency && !layerFlags.showExits) return;

        ctx.beginPath();
        ctx.moveTo(fromZ.x, fromZ.y);
        ctx.lineTo(toZ.x, toZ.y);

        if (isReroute) {
          ctx.strokeStyle = '#10b981'; // Mint/Cyan active safe reroute
          ctx.lineWidth = Math.max(2.5, corridor.width_m * 0.8);
          ctx.setLineDash([8, 4]);
        } else if (corridor.status === 'open') {
          ctx.strokeStyle = 'rgba(14, 165, 165, 0.3)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.5);
          ctx.setLineDash([]);
        } else if (corridor.status === 'restricted') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.5);
          ctx.setLineDash([4, 4]);
        } else if (isEmergency) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 4]);
        } else {
          // Closed
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Corridor Edge Tag
        const midX = (fromZ.x + toZ.x) / 2;
        const midY = (fromZ.y + toZ.y) / 2;
        ctx.fillStyle = isReroute ? '#10b981' : 'rgba(255,255,255,0.35)';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(`${corridor.edge_id}`, midX - 10, midY - 6);
      });

      // ── 5. FLOW DIRECTION & ANIMATED PARTICLES LAYER ──
      if (layerFlags.showFlow) {
        particlesRef.current.forEach((p) => {
          const corridor = state.corridors[p.edgeId];
          if (corridor && corridor.status !== 'closed') {
            p.progress += p.speed * (corridor.status === 'rerouted' ? 1.4 : 0.9);
            if (p.progress >= 1) p.progress = 0;

            p.x = p.fromX + (p.toX - p.fromX) * p.progress;
            p.y = p.fromY + (p.toY - p.fromY) * p.progress;

            ctx.beginPath();
            ctx.arc(p.x, p.y, corridor.status === 'rerouted' ? 2.5 : 1.8, 0, Math.PI * 2);
            ctx.fillStyle = corridor.status === 'rerouted' ? '#10b981' : 'rgba(14, 165, 165, 0.7)';
            ctx.fill();
          }
        });
      }

      // ── 6. BOTTLENECK FORECAST AURA LAYER ──
      if (layerFlags.showForecast && state.forecastBreachTimeMins) {
        Object.values(state.zones).forEach((zone) => {
          const density = zone.density || 1.5;
          if (density >= zone.safe_density) {
            const pulse = (Date.now() % 1500) / 1500;
            const ringRadius = 26 + pulse * 14;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = density >= zone.critical_density ? `rgba(239, 68, 68, ${0.5 * (1 - pulse)})` : `rgba(245, 158, 11, ${0.5 * (1 - pulse)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });
      }

      // ── 7. ZONE NODES & HUMAN-READABLE SAFETY BADGES ──
      Object.values(state.zones).forEach((zone) => {
        const density = zone.density || 1.5;
        const isCritical = density >= zone.critical_density;
        const isHigh = density >= zone.safe_density;
        const isHighlighted = highlightZoneId === zone.zone_id;

        // Zone Node Body
        ctx.beginPath();
        const nodeRadius = Math.max(18, Math.min(28, Math.sqrt(zone.area_m2) * 0.95));
        ctx.arc(zone.x, zone.y, nodeRadius, 0, Math.PI * 2);

        let fillColor = 'rgba(14, 165, 165, 0.15)';
        let strokeColor = 'rgba(14, 165, 165, 0.4)';
        let statusLabel = 'Nominal';
        let statusColor = '#22c55e';

        if (isCritical) {
          fillColor = 'rgba(239, 68, 68, 0.25)';
          strokeColor = 'rgba(239, 68, 68, 0.8)';
          statusLabel = 'Critical Crush Risk';
          statusColor = '#ef4444';
        } else if (isHigh) {
          fillColor = 'rgba(245, 158, 11, 0.2)';
          strokeColor = 'rgba(245, 158, 11, 0.7)';
          statusLabel = 'High Pressure';
          statusColor = '#f59e0b';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.strokeStyle = isHighlighted ? '#0ea5a5' : strokeColor;
        ctx.stroke();

        // Zone Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.name.substring(0, 12), zone.x, zone.y - 5);

        // Density + Human Readable Status Badge
        ctx.fillStyle = statusColor;
        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillText(`${density} p/m² • ${statusLabel}`, zone.x, zone.y + 7);

        // ── 8. INCIDENT MARKERS LAYER ──
        if (layerFlags.showIncidents) {
          const hasIncident = state.activeIncidents.some(
            (i) => i.zone === zone.zone_id && i.status !== 'mitigated'
          );
          if (hasIncident) {
            ctx.beginPath();
            ctx.arc(zone.x + nodeRadius - 2, zone.y - nodeRadius + 2, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('!', zone.x + nodeRadius - 2, zone.y - nodeRadius + 2);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, layerFlags, highlightZoneId]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    let found: Zone | null = null;
    Object.values(state.zones).forEach((z) => {
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= 32) found = z;
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
    <div className="relative glass-panel rounded-xl overflow-hidden shadow-2xl h-full min-h-[480px]" style={{ border: '1px solid var(--border-subtle)' }}>
      {/* Top Map Geospatial Banner */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg flex items-center gap-2.5 pointer-events-auto" style={{ background: 'rgba(6,10,20,0.90)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-2 h-2 rounded-full pulse-dot bg-teal-400" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase font-mono">
            MAPLIBRE GEOOPS DIGITAL TWIN
          </span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-white/10 pl-2">
            {Object.keys(state.zones).length} Zones · {Object.keys(state.corridors).length} Corridors
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto text-[10px] font-mono text-teal-400 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,10,20,0.90)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <MapPin className="w-3 h-3" />
          <span>REAL-TIME GRAPH PIPELINE ACTIVE</span>
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
      <div className="absolute bottom-3 left-3 z-10 px-3 py-2 rounded-lg flex items-center gap-4 text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ background: 'rgba(6,10,20,0.90)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Nominal (&lt;2 p/m²)</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>High Pressure (2–4 p/m²)</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full pulse-dot bg-red-500" />
          <span>Critical Crush (&gt;4 p/m²)</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 text-emerald-400">
          <Navigation className="w-3 h-3" />
          <span>Safe Reroute</span>
        </div>
      </div>

      {/* Zone Detail Modal / Card on Click */}
      {selectedZone && (
        <div className="absolute bottom-3 right-3 z-20 glass-panel rounded-xl p-4 max-w-[290px] w-full shadow-2xl space-y-3" style={{ border: '1px solid var(--teal-base)' }}>
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h4 className="font-semibold text-white text-sm flex items-center gap-1.5 font-mono">
              <Info className="w-4 h-4 text-teal-400" />
              {selectedZone.name}
            </h4>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs font-mono">
            <div className="text-slate-400">Type: <span className="uppercase text-teal-300">{selectedZone.type}</span></div>
            <div className="text-slate-400">Area: <span className="text-white">{selectedZone.area_m2} m²</span></div>
            <div className="text-slate-400">Count: <span className="text-white font-bold">{selectedZone.occupants || 0}</span></div>
            <div className="text-slate-400">Density: <span className="font-bold text-amber-400">{selectedZone.density} p/m²</span></div>
            <div className="text-slate-400">Inflow: <span className="text-white">{selectedZone.capacity_per_min}/m</span></div>
            <div className="text-slate-400">Queue: <span className={`font-bold ${(selectedZone.queue || 0) > 0 ? 'text-red-400' : 'text-slate-200'}`}>{selectedZone.queue || 0}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};
