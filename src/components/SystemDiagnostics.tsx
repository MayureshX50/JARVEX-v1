import React from "react";
import { motion } from "motion/react";
import { 
  Cpu, Thermometer, Flame, Zap, CheckCircle, 
  Settings, Database, Fan, Wind 
} from "lucide-react";
import { ReactorConfig } from "../types";

interface SystemDiagnosticsProps {
  config: ReactorConfig;
  onConfigChange: (updater: (prev: ReactorConfig) => ReactorConfig) => void;
}

export default function SystemDiagnostics({ config, onConfigChange }: SystemDiagnosticsProps) {
  const isDanger = config.stability < 60 || config.overloaded;
  const isWarning = config.temperature > 85 && !isDanger;

  const toggleCooling = () => {
    onConfigChange((prev) => {
      const nextCooling = !prev.coolingValvesOpen;
      // If cooling is turned on, stability improves and temp drops
      return {
        ...prev,
        coolingValvesOpen: nextCooling,
        temperature: nextCooling ? Math.max(35, prev.temperature - 20) : prev.temperature,
        stability: nextCooling ? Math.min(100, prev.stability + 15) : prev.stability,
      };
    });
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const freq = parseFloat(e.target.value);
    onConfigChange((prev) => {
      const tempFactor = freq > 100 ? (freq - 100) * 0.4 : 0;
      const nextTemp = Math.min(150, Math.max(30, 60 + tempFactor + (prev.coolingValvesOpen ? -20 : 0)));
      const nextPower = (freq / 60) * 1.21;
      const nextStability = Math.max(20, Math.min(100, 100 - (freq > 110 ? (freq - 110) * 1.5 : 0)));

      return {
        ...prev,
        coreFrequency: freq,
        temperature: nextTemp,
        powerOutput: nextPower,
        stability: nextStability,
      };
    });
  };

  return (
    <div id="diagnostics-widget" className="relative flex flex-col p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden h-full">
      {/* Corner Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-cyan-900/30 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-slate-300 font-semibold uppercase">
            SYSTEM DIAGNOSTICS
          </span>
        </div>
        <Settings className="w-4 h-4 text-slate-500 hover:text-cyan-400 cursor-pointer transition-colors" />
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Core Temperature */}
        <div className="p-3 bg-cyan-950/15 border border-cyan-900/30 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase">TEMPERATURE</span>
            <Thermometer className={`w-3.5 h-3.5 ${isDanger ? "text-red-500 animate-bounce" : isWarning ? "text-amber-500" : "text-cyan-400"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-mono font-bold ${isDanger ? "text-red-400" : isWarning ? "text-amber-400" : "text-white"}`}>
              {config.temperature.toFixed(0)}
            </span>
            <span className="text-[10px] font-mono text-cyan-500/50">°C</span>
          </div>
          {/* Temperature Bar */}
          <div className="w-full bg-cyan-950/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-cyan-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (config.temperature / 150) * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Reactor Stability */}
        <div className="p-3 bg-cyan-950/15 border border-cyan-900/30 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-500/60 uppercase">STABILITY</span>
            <CheckCircle className={`w-3.5 h-3.5 ${isDanger ? "text-red-500 animate-pulse" : "text-cyan-400"}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-mono font-bold ${isDanger ? "text-red-400" : "text-white"}`}>
              {config.stability.toFixed(0)}
            </span>
            <span className="text-[10px] font-mono text-cyan-500/50">%</span>
          </div>
          {/* Stability Bar */}
          <div className="w-full bg-cyan-950/50 h-1.5 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className={`h-full rounded-full ${isDanger ? "bg-red-500" : "bg-cyan-500"}`}
              initial={{ width: 0 }}
              animate={{ width: `${config.stability}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Core Frequency Control (Slider) */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CORE FREQUENCY</span>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">{config.coreFrequency.toFixed(1)} Hz</span>
        </div>
        <input 
          type="range" 
          min="40" 
          max="150" 
          step="0.5"
          value={config.coreFrequency}
          onChange={handleFrequencyChange}
          className="w-full h-1 bg-cyan-950/40 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
        />
        <div className="flex justify-between text-[8px] font-mono text-cyan-700 mt-1">
          <span>40.0 Hz (IDLE)</span>
          <span>100.0 Hz (NOMINAL)</span>
          <span>150.0 Hz (OVERDRIVE)</span>
        </div>
      </div>

      {/* Cooling Valve Controller (Interactive Valve) */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-900/30 rounded-xl mb-auto">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <Fan className={`w-4 h-4 ${config.coolingValvesOpen ? "text-cyan-400 animate-spin" : "text-slate-500"}`} style={{ animationDuration: "1s" }} />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">COOLING VALVE</span>
            </div>
            <p className="text-[9px] font-mono text-cyan-500/60 leading-tight">
              {config.coolingValvesOpen 
                ? "Discharging cooling fluid. Core thermals dropping." 
                : "Valves sealed. Conserving fuel cells."}
            </p>
          </div>
          
          <button
            onClick={toggleCooling}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 active:scale-95 ${
              config.coolingValvesOpen
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                : "bg-cyan-950/30 text-cyan-400 border-cyan-900/40 hover:bg-cyan-900/30 hover:text-white"
            }`}
          >
            <Wind className="w-3 h-3" />
            {config.coolingValvesOpen ? "ACTIVE" : "SEALED"}
          </button>
        </div>
      </div>

      {/* Grid of secondary micro readings */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-cyan-900/30 text-[9px] font-mono text-cyan-500/60">
        <div className="flex flex-col">
          <span>COGNITIVE:</span>
          <span className="text-white font-bold">100% ONLINE</span>
        </div>
        <div className="flex flex-col">
          <span>MATRIX PATH:</span>
          <span className="text-white font-bold">SECURE (SHA)</span>
        </div>
        <div className="flex flex-col">
          <span>THREAT LEVEL:</span>
          <span className={isDanger ? "text-red-400 font-bold animate-pulse" : "text-cyan-400 font-bold"}>
            {isDanger ? "ELEVATED" : "ZERO"}
          </span>
        </div>
      </div>
    </div>
  );
}
