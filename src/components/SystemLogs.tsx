import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, ShieldAlert, Trash2, Filter } from "lucide-react";
import { SystemLog } from "../types";

interface SystemLogsProps {
  logs: SystemLog[];
  onClear: () => void;
  onAddSimulatedAlert: () => void;
}

export default function SystemLogs({ logs, onClear, onAddSimulatedAlert }: SystemLogsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<string>("ALL");

  // Scroll to bottom whenever logs change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    return log.category === filter;
  });

  return (
    <div id="system-logs-widget" className="relative flex flex-col p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden h-64 md:h-full min-h-[250px]">
      {/* Corner Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-cyan-900/30 pb-2 z-10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-slate-300 font-semibold uppercase">
            TELEMETRY & LOG FEED
          </span>
        </div>

        {/* Console Filters & Tools */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-cyan-950/20 border border-cyan-900 px-1.5 py-0.5 rounded text-[9px] font-mono">
            <Filter className="w-2.5 h-2.5 text-cyan-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent text-cyan-400 outline-none cursor-pointer text-[9px]"
            >
              <option value="ALL" className="bg-black text-cyan-400">ALL</option>
              <option value="SYSTEM" className="bg-black text-cyan-400">SYSTEM</option>
              <option value="CORE" className="bg-black text-cyan-400">CORE</option>
              <option value="ARMORY" className="bg-black text-cyan-400">ARMORY</option>
              <option value="SECURITY" className="bg-black text-cyan-400">SECURITY</option>
              <option value="ALERT" className="bg-black text-cyan-400">ALERT</option>
            </select>
          </div>

          <button
            onClick={onAddSimulatedAlert}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/30 border border-red-500/30 hover:border-red-400 hover:bg-red-950/55 text-red-400 font-mono text-[9px] font-semibold transition"
          >
            <ShieldAlert className="w-3 h-3" />
            SIM TARGET
          </button>

          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-cyan-950/20 text-cyan-600 hover:text-cyan-400 transition"
            title="Clear Feed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logging Display Screen */}
      <div 
        ref={containerRef}
        className="flex-1 bg-black/40 border border-cyan-950/60 rounded-xl p-3.5 font-mono text-[10px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent flex flex-col gap-1.5 min-h-0"
      >
        <AnimatePresence initial={false}>
          {filteredLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center py-6">
              <span>[ TELEMETRY SECURE ]</span>
              <span className="text-[9px] mt-1 text-slate-700">NO TELEMETRY INCIDENTS RECORDED</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              // Status Styling
              let statusColor = "text-slate-400";
              if (log.status === "success") statusColor = "text-emerald-400";
              if (log.status === "warning") statusColor = "text-amber-400";
              if (log.status === "danger") statusColor = "text-red-400 animate-pulse font-bold";

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-start gap-1.5 border-b border-slate-950/50 pb-1"
                >
                  <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`px-1 rounded text-[8px] font-black shrink-0 ${
                    log.category === "ALERT" 
                      ? "bg-red-950/50 text-red-400 border border-red-500/20"
                      : log.category === "CORE"
                        ? "bg-amber-950/30 text-amber-400 border border-amber-500/10"
                        : "bg-cyan-950/30 text-cyan-400 border border-cyan-500/10"
                  }`}>
                    {log.category}
                  </span>
                  <span className={`${statusColor} leading-tight`}>{log.text}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
