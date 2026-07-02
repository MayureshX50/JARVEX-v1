import React, { useEffect, useRef, useState } from "react";
import { Compass, Crosshair, MapPin } from "lucide-react";

interface Target {
  id: string;
  name: string;
  distance: number; // radius from center
  angle: number; // in radians
  type: "friendly" | "threat" | "satellite";
  strength: number; // fade state
}

export default function RadarScanner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  
  const [targets, setTargets] = useState<Target[]>([
    { id: "1", name: "STARK SATELLITE IV", distance: 65, angle: 1.2, type: "satellite", strength: 0.8 },
    { id: "2", name: "MARK LXXXV RECON TRACER", distance: 35, angle: 4.5, type: "friendly", strength: 1.0 },
    { id: "3", name: "UNIDENTIFIED DRONE COUPLING", distance: 80, angle: 2.8, type: "threat", strength: 0.5 },
  ]);

  const [coords, setCoords] = useState({ lat: "40.7128° N", lng: "74.0060° W", alt: "1,248m" });

  // Update alt and slight coordinates variations for high-tech realism
  useEffect(() => {
    const interval = setInterval(() => {
      setCoords((prev) => ({
        ...prev,
        alt: `${(1248 + Math.random() * 4 - 2).toFixed(1)}m`,
      }));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.parentElement?.clientWidth || 250;
    let height = canvas.parentElement?.clientHeight || 250;
    
    // Force square aspect ratio
    const size = Math.min(width, height, 220);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = (size / 2) - 10;

    let sweepAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // 1. Draw Radar Concentric Circles
      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
      ctx.lineWidth = 0.75;
      
      for (let r = 0.25; r <= 1; r += 0.25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Draw Grid Reference Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.stroke();

      // Draw outer angle tick notches
      ctx.strokeStyle = "rgba(6, 182, 212, 0.2)";
      for (let d = 0; d < 360; d += 30) {
        const rad = (d * Math.PI) / 180;
        const x1 = centerX + Math.cos(rad) * maxRadius;
        const y1 = centerY + Math.sin(rad) * maxRadius;
        const x2 = centerX + Math.cos(rad) * (maxRadius - 4);
        const y2 = centerY + Math.sin(rad) * (maxRadius - 4);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 3. Draw Radar Sweep Vector Line
      const sweepX = centerX + Math.cos(sweepAngle) * maxRadius;
      const sweepY = centerY + Math.sin(sweepAngle) * maxRadius;

      // Draw sweeping gradient fan using slices
      const slices = 30;
      for (let s = 0; s < slices; s++) {
        const sliceAngle = sweepAngle - (s * 0.015);
        const alpha = (1 - s / slices) * 0.18;
        const sliceX = centerX + Math.cos(sliceAngle) * maxRadius;
        const sliceY = centerY + Math.sin(sliceAngle) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(sliceX, sliceY);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Main sweep sweepline front
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = "rgba(6, 182, 212, 0.65)";
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 4. Draw Targets and evaluate if sweep is passing over them
      targets.forEach((t) => {
        const targetX = centerX + Math.cos(t.angle) * (maxRadius * (t.distance / 100));
        const targetY = centerY + Math.sin(t.angle) * (maxRadius * (t.distance / 100));

        // Calculate angular distance between sweep and target
        let angleDiff = sweepAngle - t.angle;
        // Normalize angleDiff to -PI to PI
        angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

        // If sweep line passed recently, boost strength, then decay
        if (Math.abs(angleDiff) < 0.1) {
          t.strength = 1.0;
        } else {
          t.strength = Math.max(0.12, t.strength - 0.005);
        }

        // Draw blip dot
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);

        let blipColor = `rgba(6, 182, 212, ${t.strength})`; // friendly cyan
        if (t.type === "threat") {
          blipColor = `rgba(239, 68, 68, ${t.strength})`; // threat red
        } else if (t.type === "satellite") {
          blipColor = `rgba(245, 158, 11, ${t.strength})`; // satellite amber
        }

        ctx.fillStyle = blipColor;
        ctx.fill();

        // Draw pulsing indicator ring
        ctx.beginPath();
        ctx.arc(targetX, targetY, 8 + (1 - t.strength) * 6, 0, Math.PI * 2);
        ctx.strokeStyle = blipColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Draw text label next to selected or bright target
        if (t.strength > 0.6) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
          ctx.font = "8px monospace";
          ctx.fillText(t.name.substring(0, 10), targetX + 8, targetY - 4);
        }
      });

      // Advance sweep rotation
      sweepAngle = (sweepAngle + 0.015) % (Math.PI * 2);

      requestAnimationFrame(render);
    };

    render();
  }, [targets]);

  return (
    <div id="radar-scanner-widget" className="relative flex flex-col p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden h-full">
      {/* Corner Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-cyan-900/30 pb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-slate-300 font-semibold uppercase">
            GEOLOCATION SWEETLINE
          </span>
        </div>
        <Compass className="w-4 h-4 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
      </div>

      {/* Main Radar Screen Layout */}
      <div className="flex flex-col sm:flex-row items-center gap-5 justify-between my-auto">
        
        {/* Canvas container */}
        <div className="relative flex items-center justify-center p-2 border border-cyan-950/60 bg-black/40 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.05)] shrink-0">
          <canvas ref={canvasRef} className="rounded-full" />
        </div>

        {/* Info Feed Column */}
        <div className="flex-1 w-full flex flex-col gap-2.5">
          <div className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-xl">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-500 mb-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>LINK COORDINATES:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-cyan-600 block">LATITUDE:</span>
                <span className="text-white font-bold">{coords.lat}</span>
              </div>
              <div>
                <span className="text-cyan-600 block">LONGITUDE:</span>
                <span className="text-white font-bold">{coords.lng}</span>
              </div>
              <div className="col-span-2">
                <span className="text-cyan-600 block">ALTITUDE (SEA LEVEL):</span>
                <span className="text-cyan-400 font-bold">{coords.alt}</span>
              </div>
            </div>
          </div>

          {/* Connected Tracers list */}
          <div className="flex flex-col gap-1.5 text-[9px] font-mono">
            <span className="text-cyan-500/50 tracking-wider">RESOLVED SATELLITES:</span>
            <div className="flex flex-col gap-1">
              {targets.map((t) => (
                <div key={t.id} className="flex justify-between items-center py-1 px-2 bg-cyan-950/10 border border-cyan-950/50 rounded-lg">
                  <span className="text-slate-300 truncate max-w-[120px]">{t.name}</span>
                  <span className={`px-1 rounded font-semibold shrink-0 text-[8px] ${
                    t.type === "threat" 
                      ? "text-red-400 bg-red-950/20" 
                      : t.type === "satellite"
                        ? "text-amber-400 bg-amber-950/20"
                        : "text-cyan-400 bg-cyan-950/20"
                  }`}>
                    {t.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
