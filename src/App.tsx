import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Zap, Shield, Terminal, Cpu, Clock, Calendar, 
  Activity, AlertTriangle, Eye 
} from "lucide-react";

import { Message, SystemLog, ReactorConfig } from "./types";
import ArcReactor from "./components/ArcReactor";
import SystemDiagnostics from "./components/SystemDiagnostics";
import ArmoryControl from "./components/ArmoryControl";
import SystemLogs from "./components/SystemLogs";
import JarvisChat from "./components/JarvisChat";
import RadarScanner from "./components/RadarScanner";

// Initial logs seed
const INITIAL_LOGS: SystemLog[] = [
  { id: "log-1", timestamp: "05:58:42", category: "SYSTEM", text: "COGNITIVE CORE BOOTED SUCCESSFULLY. INITIALIZING J.A.R.V.I.S.", status: "success" },
  { id: "log-2", timestamp: "05:58:43", category: "CORE", text: "ARC REACTOR DETECTED. Nominal frequency output mapped.", status: "info" },
  { id: "log-3", timestamp: "05:58:44", category: "ARMORY", text: "Link established with Armory. Mark LXXXV nano-assemblers active.", status: "info" },
  { id: "log-4", timestamp: "05:58:45", category: "SECURITY", text: "Stark secure telemetry pipeline encrypted via SHA-256.", status: "success" }
];

export default function App() {
  const [reactorConfig, setReactorConfig] = useState<ReactorConfig>({
    coreFrequency: 100,
    temperature: 60,
    stability: 98,
    powerOutput: 1.21,
    coolingValvesOpen: false,
    overloaded: false
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [time, setTime] = useState(new Date());
  const [audioMuted, setAudioMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Dynamic Dynamic clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Vocal welcome greeting on first load
  useEffect(() => {
    const welcomeText = "Welcome back, Sir. All Jarvis subroutines are loaded and fully operational. System diagnostics are looking nominal. How can I assist you today?";
    const initialMsg: Message = {
      id: "welcome-msg",
      role: "assistant",
      content: welcomeText,
      timestamp: new Date()
    };
    
    // Tiny delay to ensure synthesis voices are loaded by the browser
    const welcomeTimer = setTimeout(() => {
      setMessages([initialMsg]);
      addLog("Greetings verbalized. Interface sync achieved.", "SYSTEM", "success");
    }, 800);

    return () => clearTimeout(welcomeTimer);
  }, []);

  // Helper to append a telemetry log
  const addLog = (text: string, category: SystemLog["category"], status: SystemLog["status"]) => {
    const now = new Date();
    const timestampStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const newLog: SystemLog = {
      id: `log-${now.getTime()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timestampStr,
      category,
      text,
      status
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Handles sending commands to server-side Gemini chat API
  const handleSendMessage = async (text: string) => {
    if (isProcessing) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    addLog(`TRANSMITTING VOCAL MATRIX: "${text}"`, "SYSTEM", "info");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send history up to 8 messages to keep prompt size optimized
        body: JSON.stringify({ 
          messages: [...messages, userMsg].slice(-8).map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMsg: Message = {
          id: `msg-jarvis-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, assistantMsg]);
        addLog("DECRYPTED SECURE FEEDBACK RESPONSE FROM J.A.R.V.I.S.", "SYSTEM", "success");
      } else {
        throw new Error(data.message || "Cognitive subroutine returned a status error.");
      }
    } catch (err: any) {
      console.error(err);
      const errorReply = "I apologize, Sir. My server connection seems to have experienced a disruption. Please verify that the GEMINI_API_KEY is configured in the secrets panel.";
      
      const assistantMsg: Message = {
        id: `msg-jarvis-err-${Date.now()}`,
        role: "assistant",
        content: errorReply,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, assistantMsg]);
      addLog("COGNITIVE ROUTING TRANSCRIPTION ERROR DETECTED.", "ALERT", "danger");
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger calibration of the Arc Reactor core
  const handleCalibrateReactor = () => {
    setReactorConfig({
      coreFrequency: 100,
      temperature: 60,
      stability: 100,
      powerOutput: 1.21,
      coolingValvesOpen: false,
      overloaded: false
    });
    addLog("Reactor calibration initialized. Standard frequency stabilized at 100 Hz. Output reset to 1.21 GW.", "CORE", "success");
  };

  // Trigger overload anomaly of the core
  const handleToggleOverload = () => {
    setReactorConfig((prev) => {
      if (prev.overloaded) {
        // Return to normal
        addLog("Discharging core overload. Stabilizing magnetic couplers.", "CORE", "info");
        return {
          coreFrequency: 100,
          temperature: 65,
          stability: 95,
          powerOutput: 1.21,
          coolingValvesOpen: false,
          overloaded: false
        };
      } else {
        // Overload
        addLog("CRITICAL DETONATION ALERT: Initiating Core Overload override protocol!", "ALERT", "danger");
        return {
          coreFrequency: 145,
          temperature: 138,
          stability: 34,
          powerOutput: 4.82,
          coolingValvesOpen: false,
          overloaded: true
        };
      }
    });
  };

  // Clear log screen
  const handleClearLogs = () => {
    setLogs([]);
  };

  // Injects simulated hostile target telemetry
  const handleAddSimulatedAlert = () => {
    const alerts = [
      "CRITICAL: Thermal vent backup in reactor containment chamber.",
      "INTRUSION DETECTED: Outer perimeter firewall scanned from unidentified node.",
      "ARMORY: Micro-thruster fuel feed is currently operating at 112% flow-rate.",
      "SATELLITE WARNING: Solar flare ionization interference affecting telemetry orbit."
    ];
    const index = Math.floor(Math.random() * alerts.length);
    addLog(alerts[index], "ALERT", "warning");
  };

  // Determine global background alert style
  const isReactorOverloaded = reactorConfig.overloaded;

  return (
    <div className="min-h-screen bg-black text-cyan-500 flex flex-col font-mono select-none overflow-x-hidden relative">
      {/* Background Atmosphere & Grid from Artistic Flair Theme */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_#1e40af_0%,_transparent_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

      {isReactorOverloaded && (
        <div className="absolute inset-0 bg-red-950/20 animate-pulse pointer-events-none z-10" />
      )}

      {/* STARK HEADBOARD CONTROL PANEL */}
      <header className="relative w-full border-b border-cyan-950/60 bg-black/90 py-5 px-8 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tech lines in bg */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-cyan-500/0 via-cyan-500/40 to-cyan-500/0" />

        {/* Brand logo & status */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-12 h-12 border-2 border-cyan-500/30 bg-cyan-950/20 rounded-lg shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            <Activity className={`w-6 h-6 ${isReactorOverloaded ? "text-red-500 animate-pulse" : "text-cyan-400"}`} />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black animate-ping" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl font-black tracking-tighter text-white">J.A.R.V.I.S.</h1>
              <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30 uppercase">
                COGNITIVE CORE
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-cyan-500/60 font-semibold">
              Just A Rather Very Intelligent System
            </p>
          </div>
        </div>

        {/* Live system parameters readout */}
        <div className="flex flex-wrap items-center gap-6 text-[10px] font-mono text-slate-400">
          <div className="flex flex-col">
            <span className="text-cyan-500/50 text-[9px] uppercase tracking-wider">SYSTEM STATUS</span>
            <span className={`font-bold text-xs ${isReactorOverloaded ? "text-red-400" : "text-white animate-pulse"}`}>
              {isReactorOverloaded ? "CRITICAL MALFUNCTION" : "OPTIMAL LEVEL"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-cyan-500/50 text-[9px] uppercase tracking-wider">SECURE LINK</span>
            <span className="text-cyan-400 font-bold">STARK_T_001</span>
          </div>

          {/* VOICE FEEDBACK CONTROL */}
          <div className="flex items-center gap-3 bg-cyan-950/10 border border-cyan-900/40 rounded-xl py-1 px-3.5 h-11">
            <div className="flex flex-col">
              <span className="text-cyan-500/50 text-[9px] uppercase tracking-wider">VOICE FEEDBACK</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`font-mono text-[9px] font-bold ${!audioMuted ? "text-cyan-400" : "text-red-400/80"}`}>
                  {!audioMuted ? "ACTIVE" : "MUTED"}
                </span>
                
                {/* Micro Soundwave Waveform Visualizer */}
                <div className="flex items-end gap-[2px] h-3 w-6 px-1">
                  <motion.div
                    animate={isSpeaking ? { height: ["20%", "80%", "20%"] } : { height: "20%" }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={isSpeaking ? { height: ["20%", "100%", "20%"] } : { height: "20%" }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut", delay: 0.15 }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={isSpeaking ? { height: ["20%", "60%", "20%"] } : { height: "20%" }}
                    transition={{ repeat: Infinity, duration: 0.7, ease: "easeInOut", delay: 0.3 }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={isSpeaking ? { height: ["20%", "90%", "20%"] } : { height: "20%" }}
                    transition={{ repeat: Infinity, duration: 0.55, ease: "easeInOut", delay: 0.05 }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                  <motion.div
                    animate={isSpeaking ? { height: ["20%", "50%", "20%"] } : { height: "20%" }}
                    transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut", delay: 0.2 }}
                    className="w-[2px] bg-cyan-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* HIGH-TECH TOGGLE SWITCH */}
            <button
              onClick={() => {
                setAudioMuted(prev => !prev);
                addLog(
                  `VOICE FEEDBACK SYSTEM ${!audioMuted ? "DEACTIVATED // MUTED" : "ACTIVATED // UNMUTED"}`,
                  "SYSTEM",
                  !audioMuted ? "warning" : "success"
                );
              }}
              className="relative w-9 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none border border-cyan-500/30 bg-cyan-950/40 cursor-pointer"
              title={!audioMuted ? "Disable audio speech feedback" : "Enable audio speech feedback"}
            >
              {/* Sliding notch */}
              <motion.div
                className={`w-3.5 h-3.5 rounded-full ${!audioMuted ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "bg-cyan-900"}`}
                animate={{ x: !audioMuted ? 14 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Dynamic Clock */}
          <div className="flex items-center gap-2 bg-cyan-950/20 border border-cyan-900/60 py-1.5 px-3.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold tracking-widest text-white">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
            </span>
            <span className="text-[9px] text-cyan-700 border-l border-cyan-950 pl-2">MALIBU_RES</span>
          </div>
        </div>
      </header>

      {/* MAIN SYSTEM DASHBOARD PANEL BENTO LAYOUT */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 max-w-7xl w-full mx-auto">
        
        {/* COLUMN 1: REACTOR CONTROL CORE & DIAGNOSTICS (Left Sidebar - Width 4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          {/* Arc Reactor Core widget */}
          <ArcReactor 
            config={reactorConfig}
            onPulse={handleCalibrateReactor}
            onToggleOverload={handleToggleOverload}
          />

          {/* Interactive Dials & Frequency Slider widget */}
          <SystemDiagnostics 
            config={reactorConfig}
            onConfigChange={setReactorConfig}
          />
        </div>

        {/* COLUMN 2: DISCUSSION TERMINAL (Center - Width 4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col">
          <JarvisChat 
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onAddLog={(txt, cat, stat) => addLog(txt, cat, stat)}
            audioMuted={audioMuted}
            onToggleMute={() => {
              const nextVal = !audioMuted;
              setAudioMuted(nextVal);
              addLog(
                `VOICE FEEDBACK SYSTEM ${nextVal ? "DEACTIVATED // MUTED" : "ACTIVATED // UNMUTED"}`,
                "SYSTEM",
                nextVal ? "warning" : "success"
              );
            }}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
          />
        </div>

        {/* COLUMN 3: HUD BLUEPRINTS, GEOLOCATION SCANNER, LOG TELEMETRY (Right - Width 4 cols) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          {/* Geolocation map/radar */}
          <RadarScanner />

          {/* Telemetry scrolling text feed */}
          <SystemLogs 
            logs={logs}
            onClear={handleClearLogs}
            onAddSimulatedAlert={handleAddSimulatedAlert}
          />
        </div>

        {/* COLUMN 4 / FOOTER HERO AREA: ARMORY BLUEPRINT (Full horizontal width - 12 cols) */}
        <div className="col-span-1 lg:col-span-12">
          <ArmoryControl onAddLog={(txt, cat, stat) => addLog(txt, cat, stat)} />
        </div>

      </main>

      {/* Cybernetic Grid footer frame */}
      <footer className="py-5 border-t border-cyan-950/60 bg-black/80 backdrop-blur-sm z-10 flex flex-col sm:flex-row items-center justify-between px-8 text-[10px] font-mono text-cyan-600/50 gap-4">
        <div>
          <span>AUTHORIZATION: </span>
          <span className="text-white font-semibold">STARK_T_001</span>
          <span className="mx-3 border-l border-cyan-950 h-3 inline-block align-middle" />
          <span>LOCATION: </span>
          <span className="text-white font-semibold">MALIBU_RES_LEVEL_4</span>
        </div>
        
        <div className="flex gap-2">
          <div className="w-12 h-1 bg-cyan-950"></div>
          <div className="w-12 h-1 bg-cyan-500/50"></div>
          <div className="w-12 h-1 bg-cyan-950"></div>
        </div>

        <div className="max-w-[320px] text-center sm:text-right opacity-80 italic text-[9px] text-cyan-400">
          "Welcome home, sir. All systems are operational and the coffee is currently brewing at your preferred 195 degrees."
        </div>
      </footer>
    </div>
  );
}
