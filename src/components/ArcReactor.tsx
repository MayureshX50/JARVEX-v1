import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, ShieldAlert, Sparkles } from "lucide-react";
import { ReactorConfig } from "../types";

interface ArcReactorProps {
  config: ReactorConfig;
  onPulse: () => void;
  onToggleOverload: () => void;
}

export default function ArcReactor({ config, onPulse, onToggleOverload }: ArcReactorProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine glow color based on status
  const isDanger = config.stability < 60 || config.overloaded;
  const isWarning = config.temperature > 85 && !isDanger;
  
  const glowColor = isDanger 
    ? "rgba(239, 68, 68, 0.85)" // red
    : isWarning 
      ? "rgba(245, 158, 11, 0.85)" // orange
      : "rgba(6, 182, 212, 0.85)"; // cyan

  const ringStroke = isDanger ? "stroke-red-500" : isWarning ? "stroke-amber-500" : "stroke-cyan-500";
  const coreFill = isDanger ? "fill-red-500" : isWarning ? "fill-amber-500" : "fill-cyan-500";
  const textGlow = isDanger ? "shadow-red-500/50" : isWarning ? "shadow-amber-500/50" : "shadow-cyan-500/50";

  return (
    <div id="arc-reactor-widget" className="relative flex flex-col items-center justify-center p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden group">
      {/* Visual Tech grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Corner Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/40" />

      {/* Title */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-cyan-900/30 pb-2 z-10">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${isDanger ? "text-red-500 animate-pulse" : "text-cyan-400"}`} />
          <span className="text-xs font-mono tracking-widest text-slate-300 font-semibold uppercase">
            ARC REACTOR CORE
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
          isDanger 
            ? "text-red-400 bg-red-950/30 border-red-500/40 animate-pulse" 
            : "text-cyan-400 bg-cyan-950/30 border-cyan-500/40"
        }`}>
          {isDanger ? "WARNING: STABILITY LOW" : "SYSTEM STABLE"}
        </span>
      </div>

      {/* Main Reactor Body */}
      <div 
        className="relative w-64 h-64 flex items-center justify-center cursor-pointer select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onPulse}
      >
        {/* Glow behind reactor */}
        <motion.div 
          className="absolute w-44 h-44 rounded-full filter blur-xl opacity-35"
          style={{ backgroundColor: isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#06b6d4" }}
          animate={{
            scale: config.overloaded ? [1, 1.25, 1] : isHovered ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: config.overloaded ? [0.4, 0.7, 0.4] : [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: config.overloaded ? 0.4 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Circular SVG layers */}
        <svg className="w-full h-full p-2" viewBox="0 0 200 200">
          <defs>
            {/* Soft cyan gradient for reactor glass */}
            <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="30%" stopColor={isDanger ? "#f87171" : isWarning ? "#fbbf24" : "#22d3ee"} stopOpacity="0.6" />
              <stop offset="70%" stopColor={isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#06b6d4"} stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Outer Grid Ring */}
          <circle cx="100" cy="100" r="92" className="stroke-slate-800" strokeWidth="0.75" strokeDasharray="3 3" fill="none" />
          
          {/* Static Tech Accents (Compass ticks) */}
          <g className="opacity-40">
            <line x1="100" y1="5" x2="100" y2="12" className={ringStroke} strokeWidth="1.5" />
            <line x1="100" y1="188" x2="100" y2="195" className={ringStroke} strokeWidth="1.5" />
            <line x1="5" y1="100" x2="12" y2="100" className={ringStroke} strokeWidth="1.5" />
            <line x1="188" y1="100" x2="195" y2="100" className={ringStroke} strokeWidth="1.5" />
          </g>

          {/* LAYER 1: Slow spinning Outer Dial with thick marks */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{
              duration: config.overloaded ? 4 : 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <circle cx="100" cy="100" r="82" className="stroke-slate-800" strokeWidth="1.5" fill="none" />
            {/* Tick Marks around the outer dial */}
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={`outer-${i}`}
                x1="100"
                y1="18"
                x2="100"
                y2="24"
                className={`${ringStroke} opacity-40`}
                strokeWidth="1"
                transform={`rotate(${i * 30} 100 100)`}
              />
            ))}
          </motion.g>

          {/* LAYER 2: Fast spinning Inner Dial (Counter-Clockwise) */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{
              duration: config.overloaded ? 1.5 : 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformOrigin: "100px 100px" }}
          >
            <circle cx="100" cy="100" r="70" className={`${ringStroke} opacity-20`} strokeWidth="1" strokeDasharray="5 15" fill="none" />
            <circle cx="100" cy="100" r="66" className="stroke-slate-800" strokeWidth="1" strokeDasharray="30 10" fill="none" />
            {/* Ticks on inner dial */}
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={`inner-${i}`}
                x1="100"
                y1="34"
                x2="100"
                y2="38"
                className={`${ringStroke} opacity-60`}
                strokeWidth="1.5"
                transform={`rotate(${i * 15} 100 100)`}
              />
            ))}
          </motion.g>

          {/* LAYER 3: Interactive Middle Segments (The Power Coils / Triangles) */}
          <g className="opacity-85">
            {Array.from({ length: 10 }).map((_, i) => (
              <g key={`coil-${i}`} transform={`rotate(${i * 36} 100 100)`}>
                {/* Visual copper coils */}
                <path
                  d="M93,42 L107,42 L104,56 L96,56 Z"
                  className={`${coreFill} opacity-70`}
                />
                <rect
                  x="95"
                  y="44"
                  width="10"
                  height="2"
                  className="fill-slate-900"
                />
                <rect
                  x="95"
                  y="48"
                  width="10"
                  height="2"
                  className="fill-slate-900"
                />
                <rect
                  x="96"
                  y="52"
                  width="8"
                  height="2"
                  className="fill-slate-900"
                />
              </g>
            ))}
          </g>

          {/* LAYER 4: Power Ring Core boundary */}
          <circle cx="100" cy="100" r="32" className={`${ringStroke} opacity-55`} strokeWidth="2" strokeDasharray="15 3" fill="none" />
          
          {/* LAYER 5: Core Pulsing Glass */}
          <circle cx="100" cy="100" r="28" fill="url(#reactorGlow)" />

          {/* LAYER 6: Central Tri-Core element */}
          <g transform="translate(100, 100) scale(0.95)" className="z-10">
            <motion.path
              d="M0,-24 L20,12 L-20,12 Z"
              className={isDanger ? "fill-red-500/20 stroke-red-400" : isWarning ? "fill-amber-500/20 stroke-amber-400" : "fill-cyan-500/20 stroke-cyan-400"}
              strokeWidth="2"
              animate={{
                scale: config.overloaded ? [1, 1.15, 1] : [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: config.overloaded ? 0.3 : 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Center light point */}
            <circle cx="0" cy="0" r="8" className={isDanger ? "fill-red-100" : isWarning ? "fill-amber-100" : "fill-cyan-100"} />
            <circle cx="0" cy="0" r="5" className={isDanger ? "fill-white" : isWarning ? "fill-white" : "fill-white"} />
          </g>
        </svg>

        {/* Floating status parameters in reactor overlay */}
        <div className="absolute top-[78%] flex flex-col items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">OUTPUT</span>
          <span className={`text-sm font-mono font-bold tracking-tight ${isDanger ? "text-red-400" : isWarning ? "text-amber-400" : "text-cyan-400"}`}>
            {config.powerOutput.toFixed(2)} GW
          </span>
        </div>
      </div>

      {/* Control buttons below Arc Reactor */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4 z-10">
        <button
          onClick={onPulse}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-mono text-xs transition-all duration-300 active:scale-95 ${
            isDanger
              ? "bg-red-950/40 hover:bg-red-900/40 border-red-500/40 text-red-300"
              : "bg-cyan-950/20 hover:bg-cyan-900/40 border-cyan-900/60 text-cyan-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          CALIBRATE CORES
        </button>
        <button
          onClick={onToggleOverload}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border font-mono text-xs transition-all duration-300 active:scale-95 ${
            config.overloaded
              ? "bg-red-500 text-white border-red-600 font-bold shadow-[0_0_12px_rgba(239,68,68,0.4)]"
              : "bg-cyan-950/20 hover:bg-red-950/30 border-cyan-900/60 text-cyan-400 hover:text-red-400"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          {config.overloaded ? "DISCHARGE CORE" : "OVERLOAD CORE"}
        </button>
      </div>
    </div>
  );
}
