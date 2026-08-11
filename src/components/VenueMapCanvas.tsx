import React, { useEffect, useRef, useState } from 'react';
import type { SimulationState, Zone, LayerVisibility } from '../types/crowdflow';
import { Info, MapPin, Navigation, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [hoveredZone, setHoveredZone] = useState<Zone | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Map Pan & Zoom Interactive Controls
  const zoomLevelRef = useRef<number>(1.0);
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomDisplay, setZoomDisplay] = useState<number>(1.0); // For UI buttons only
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const layerFlags: LayerVisibility = state.layers || {
    showDensity: true,
    showFlow: true,
    showForecast: true,
    showIncidents: true,
    showRoutes: true,
    showExits: true,
  };

  // Particles for flow animation
  const particlesRef = useRef<Particle[]>([]);

  // Reset Pan/Zoom on scenario change
  useEffect(() => {
    zoomLevelRef.current = 1.0;
    panOffsetRef.current = { x: 0, y: 0 };
    setZoomDisplay(1.0);
  }, [state.presetId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle High-DPI Canvas Resizing cleanly (No object-cover cropping!)
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Initialize particles
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
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // ── 1. MAPLIBRE GIS BASE BACKGROUND ──
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, width, height);

      // Grid Coordinates Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
      ctx.lineWidth = 1;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // GeoGIS lat/lon border ticks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.font = '500 8.5px "JetBrains Mono", monospace';
      ctx.fillText('18.9912° N', 12, 16);
      ctx.fillText('72.8241° E', width - 65, 16);
      ctx.fillText('GEOSPATIAL TWIN ENGINE v2.4 — MAPLIBRE VECTOR BASE', 12, height - 12);

      // ── 2. AUTO-FIT BOUNDING BOX COMPUTATION (Fixes clipping!) ──
      const zonesList = Object.values(state.zones);
      if (zonesList.length === 0) return;

      const xs = zonesList.map((z) => z.x);
      const ys = zonesList.map((z) => z.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const dataW = maxX - minX || 1;
      const dataH = maxY - minY || 1;
      const padding = 70; // 70px safe margin so labels/nodes never touch edge

      const scaleX = (width - padding * 2) / dataW;
      const scaleY = (height - padding * 2) / dataH;
      const autoFitScale = Math.min(scaleX, scaleY);

      // Center of data
      const dataCenterX = (minX + maxX) / 2;
      const dataCenterY = (minY + maxY) / 2;

      // Center of container
      const containerCenterX = width / 2;
      const containerCenterY = height / 2;

      // Coordinate Transform Function
      const mapToCanvas = (gx: number, gy: number) => {
        const currentZoom = zoomLevelRef.current;
        const currentPan = panOffsetRef.current;
        const cx = (gx - dataCenterX) * autoFitScale * currentZoom + containerCenterX + currentPan.x;
        const cy = (gy - dataCenterY) * autoFitScale * currentZoom + containerCenterY + currentPan.y;
        return { x: cx, y: cy };
      };

      // ── 3. VENUE FOOTPRINT GEOMETRY (Polygon outline) ──
      if (zonesList.length >= 3) {
        ctx.beginPath();
        const pt0 = mapToCanvas(zonesList[0].x, zonesList[0].y);
        ctx.moveTo(pt0.x, pt0.y);
        for (let i = 1; i < zonesList.length; i++) {
          const pt = mapToCanvas(zonesList[i].x, zonesList[i].y);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(14, 165, 165, 0.10)';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(14, 165, 165, 0.02)';
        ctx.fill();
        ctx.stroke();
      }

      // ── 4. DENSITY HEATMAP LAYER ──
      if (layerFlags.showDensity) {
        zonesList.forEach((zone) => {
          const pt = mapToCanvas(zone.x, zone.y);
          const density = zone.density || 1.5;
          const currentZoom = zoomLevelRef.current;
          const radius = Math.min(160, Math.sqrt(zone.area_m2) * 3.2 * autoFitScale * currentZoom);
          const gradient = ctx.createRadialGradient(pt.x, pt.y, 6, pt.x, pt.y, radius);

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
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // ── 5. CORRIDORS / PATHWAYS & REROUTES ──
      Object.values(state.corridors).forEach((corridor) => {
        const fromZ = state.zones[corridor.from_zone];
        const toZ = state.zones[corridor.to_zone];
        if (!fromZ || !toZ) return;

        const p1 = mapToCanvas(fromZ.x, fromZ.y);
        const p2 = mapToCanvas(toZ.x, toZ.y);

        const isReroute = corridor.status === 'rerouted';
        const isEmergency = corridor.status === 'emergency_only';

        if (isReroute && !layerFlags.showRoutes) return;
        if (isEmergency && !layerFlags.showExits) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (isReroute) {
          ctx.strokeStyle = '#10b981'; // Mint/Cyan active reroute
          ctx.lineWidth = Math.max(2.5, corridor.width_m * 0.7);
          ctx.setLineDash([8, 4]);
        } else if (corridor.status === 'open') {
          ctx.strokeStyle = 'rgba(14, 165, 165, 0.35)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.45);
          ctx.setLineDash([]);
        } else if (corridor.status === 'restricted') {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = Math.max(1.5, corridor.width_m * 0.45);
          ctx.setLineDash([4, 4]);
        } else if (isEmergency) {
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
          ctx.lineWidth = 2;
          ctx.setLineDash([2, 4]);
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Corridor Tag
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.fillStyle = isReroute ? '#10b981' : 'rgba(255,255,255,0.4)';
        ctx.font = '600 9px "JetBrains Mono", monospace';
        ctx.fillText(`${corridor.edge_id}`, midX - 10, midY - 6);
      });

      // ── 6. FLOW DIRECTION & ANIMATED PARTICLES LAYER ──
      if (layerFlags.showFlow) {
        particlesRef.current.forEach((p) => {
          const corridor = state.corridors[p.edgeId];
          const fromZ = state.zones[corridor?.from_zone];
          const toZ = state.zones[corridor?.to_zone];
          if (corridor && corridor.status !== 'closed' && fromZ && toZ) {
            p.progress += p.speed * (corridor.status === 'rerouted' ? 1.4 : 0.9);
            if (p.progress >= 1) p.progress = 0;

            const p1 = mapToCanvas(fromZ.x, fromZ.y);
            const p2 = mapToCanvas(toZ.x, toZ.y);

            const px = p1.x + (p2.x - p1.x) * p.progress;
            const py = p1.y + (p2.y - p1.y) * p.progress;

            ctx.beginPath();
            ctx.arc(px, py, corridor.status === 'rerouted' ? 2.5 : 1.8, 0, Math.PI * 2);
            ctx.fillStyle = corridor.status === 'rerouted' ? '#10b981' : 'rgba(14, 165, 165, 0.75)';
            ctx.fill();
          }
        });
      }

      // ── 7. BOTTLENECK FORECAST AURA LAYER ──
      if (layerFlags.showForecast && state.forecastBreachTimeMins) {
        zonesList.forEach((zone) => {
          const pt = mapToCanvas(zone.x, zone.y);
          const density = zone.density || 1.5;
          if (density >= zone.safe_density) {
            const pulse = (Date.now() % 1500) / 1500;
            const ringRadius = 24 + pulse * 14;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = density >= zone.critical_density ? `rgba(239, 68, 68, ${0.5 * (1 - pulse)})` : `rgba(245, 158, 11, ${0.5 * (1 - pulse)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });
      }

      // ── 8. ZONE NODES & HUMAN-READABLE SAFETY BADGES ──
      zonesList.forEach((zone) => {
        const pt = mapToCanvas(zone.x, zone.y);
        const density = zone.density || 1.5;
        const isCritical = density >= zone.critical_density;
        const isHigh = density >= zone.safe_density;
        const isHighlighted = highlightZoneId === zone.zone_id;

        const baseRadius = Math.max(16, Math.min(26, Math.sqrt(zone.area_m2) * 0.9));
        const nodeRadius = baseRadius * Math.sqrt(zoomLevelRef.current);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, nodeRadius, 0, Math.PI * 2);

        let fillColor = 'rgba(14, 165, 165, 0.15)';
        let strokeColor = 'rgba(14, 165, 165, 0.4)';
        let statusLabel = 'Nominal';
        let statusColor = '#22c55e';

        if (isCritical) {
          fillColor = 'rgba(239, 68, 68, 0.25)';
          strokeColor = 'rgba(239, 68, 68, 0.85)';
          statusLabel = 'Critical Crush Risk';
          statusColor = '#ef4444';
        } else if (isHigh) {
          fillColor = 'rgba(245, 158, 11, 0.2)';
          strokeColor = 'rgba(245, 158, 11, 0.75)';
          statusLabel = 'High Pressure';
          statusColor = '#f59e0b';
        }

        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        ctx.strokeStyle = isHighlighted ? '#0ea5a5' : strokeColor;
        ctx.stroke();

        // Zone Title Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(zone.name.substring(0, 14), pt.x, pt.y - 5);

        // Density + Human Readable Status Badge
        ctx.fillStyle = statusColor;
        ctx.font = '600 8.5px "JetBrains Mono", monospace';
        ctx.fillText(`${density} p/m² • ${statusLabel}`, pt.x, pt.y + 7);

        // ── 9. INCIDENT MARKERS LAYER ──
        if (layerFlags.showIncidents) {
          const hasIncident = state.activeIncidents.some(
            (i) => i.zone === zone.zone_id && i.status !== 'mitigated'
          );
          if (hasIncident) {
            ctx.beginPath();
            ctx.arc(pt.x + nodeRadius - 2, pt.y - nodeRadius + 2, 7.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px sans-serif';
            ctx.fillText('!', pt.x + nodeRadius - 2, pt.y - nodeRadius + 2);
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [state, layerFlags, highlightZoneId]); // removed zoomLevel and panOffset from dependencies

  // Helper to update zoom globally
  const updateZoom = (delta: number, isAbsolute: boolean = false) => {
    let newZoom = isAbsolute ? delta : zoomLevelRef.current + delta;
    newZoom = Math.max(0.7, Math.min(2.5, Number(newZoom.toFixed(2))));
    zoomLevelRef.current = newZoom;
    setZoomDisplay(newZoom);
  };

  // Native non-passive wheel listener to zoom map and prevent page scroll ONLY when hovering map canvas
  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault(); // Prevents page from scrolling when zooming over the map canvas!
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      updateZoom(delta);
    };

    canvasElement.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      canvasElement.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - panOffsetRef.current.x, y: e.clientY - panOffsetRef.current.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const container = containerRef.current;
    if (!container) return;

    if (isDraggingRef.current) {
      panOffsetRef.current = {
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      };
      return;
    }

    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;
    const zonesList = Object.values(state.zones);

    if (zonesList.length === 0) return;

    const xs = zonesList.map((z) => z.x);
    const ys = zonesList.map((z) => z.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);

    const dataW = maxX - minX || 1;
    const dataH = maxY - minY || 1;
    const padding = 70;

    const autoFitScale = Math.min((width - padding * 2) / dataW, (height - padding * 2) / dataH);
    const dataCenterX = (minX + maxX) / 2;
    const dataCenterY = (minY + maxY) / 2;

    let found: Zone | null = null;
    zonesList.forEach((z) => {
      const currentZoom = zoomLevelRef.current;
      const currentPan = panOffsetRef.current;
      const cx = (z.x - dataCenterX) * autoFitScale * currentZoom + width / 2 + currentPan.x;
      const cy = (z.y - dataCenterY) * autoFitScale * currentZoom + height / 2 + currentPan.y;
      const dist = Math.hypot(cx - mx, cy - my);
      if (dist <= 32) found = z;
    });

    setHoveredZone(found);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    updateZoom(delta);
  };

  const handleClick = () => {
    if (hoveredZone) {
      setSelectedZone(hoveredZone);
      if (onSelectZone) onSelectZone(hoveredZone.zone_id);
    }
  };

  const resetView = () => {
    updateZoom(1.0, true);
    panOffsetRef.current = { x: 0, y: 0 };
  };

  return (
    <div ref={containerRef} className="relative glass-panel rounded-xl overflow-hidden shadow-2xl h-full min-h-[300px]" style={{ border: '1px solid var(--border-subtle)' }}>
      
      {/* ── TOP MAP BANNERS ── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg flex items-center gap-2.5 pointer-events-auto" style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
          <div className="w-2 h-2 rounded-full pulse-dot bg-teal-400" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase font-mono">
            MAPLIBRE GEOOPS DIGITAL TWIN
          </span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-white/10 pl-2">
            {Object.keys(state.zones).length} Zones · {Object.keys(state.corridors).length} Corridors
          </span>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Zoom & Pan Controls Bar */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono" style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => updateZoom(0.2)}
              title="Zoom In"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold text-teal-400 px-1">{Math.round(zoomDisplay * 100)}%</span>
            <button
              onClick={() => updateZoom(-0.2)}
              title="Zoom Out"
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              title="Reset View Fit"
              className="p-1 ml-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors border-l border-white/10 pl-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-teal-400 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)' }}>
            <MapPin className="w-3 h-3" />
            <span>REAL-TIME GRAPH PIPELINE ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── CANVAS ELEMENT (Fully Responsive, Crisp Resolution, Drag & Zoom) ── */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* ── BOTTOM MAP LEGEND & PAN DRAG INSTRUCTION ── */}
      <div className="absolute bottom-3 left-3 z-10 px-3 py-2 rounded-lg flex items-center gap-4 text-[10px] font-mono font-semibold uppercase tracking-wider" style={{ background: 'rgba(6,10,20,0.92)', backdropFilter: 'blur(12px)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
        <div className="flex items-center gap-1 text-slate-400 border-r border-white/10 pr-3">
          <Move className="w-3 h-3 text-teal-400" />
          <span>Drag to Pan • Scroll to Zoom</span>
        </div>
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

      {/* ── ZONE DETAIL INSPECTOR CARD ── */}
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
