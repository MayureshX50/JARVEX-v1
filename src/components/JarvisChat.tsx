import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Mic, MicOff, Volume2, VolumeX, 
  Sparkles, Terminal, ShieldAlert 
} from "lucide-react";
import { Message } from "../types";

interface JarvisChatProps {
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  onAddLog: (text: string, category: "SYSTEM" | "SECURITY" | "ALERT", status: "info" | "success" | "warning") => void;
  audioMuted: boolean;
  onToggleMute: () => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
}

export default function JarvisChat({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  onAddLog,
  audioMuted,
  onToggleMute,
  isSpeaking,
  setIsSpeaking
}: JarvisChatProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Suggested high-tech quick commands
  const PRESETS = [
    "J.A.R.V.I.S., check system integrity.",
    "Power up weapons and prep flight thrusters.",
    "Is Stark Tower secure?",
    "Run a diagnostics scan."
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Handle Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (audioMuted) {
      setIsSpeaking(false);
      return;
    }

    // Stop current speech first
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    // Clean up markdown/HTML artifacts for cleaner TTS reading
    const cleanText = text
      .replace(/[*_#`~]/g, "")
      .replace(/Sir/gi, "sir")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Attempt to locate a high-quality British male voice to mimic Jarvis
    const voices = window.speechSynthesis.getVoices();
    const jarvisVoice = voices.find(
      (v) =>
        (v.name.includes("Google UK English") || v.name.includes("Great Britain") || v.lang === "en-GB") &&
        v.name.toLowerCase().includes("male")
    ) || voices.find((v) => v.lang.startsWith("en-GB")) || voices[0];

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }
    
    // Jarvis specs: calm, moderate pitch, elegant pace
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    // Set active speaking status as fallback
    setIsSpeaking(true);
  };

  // Trigger TTS when new assistant messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        speakText(lastMsg.content);
      }
    }
  }, [messages]);

  // Voice Speech Recognition (STT) setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        onAddLog("J.A.R.V.I.S. voice subroutines activated. Listening...", "SYSTEM", "info");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          onSendMessage(transcript);
        }
      };

      rec.onerror = (err: any) => {
        console.error("STT Error:", err);
        setIsListening(false);
        if (err.error !== "no-speech") {
          onAddLog(`Voice capture error: ${err.error}`, "ALERT", "warning");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    // Clean up voice synthesis on unmount
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, []);

  // Monitor audioMuted changes to stop current speaking if muted
  useEffect(() => {
    if (audioMuted) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [audioMuted]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const text = input;
    setInput("");
    await onSendMessage(text);
  };

  // Canvas wave visualization loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 40;

    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Determine wave metrics based on status
      let lines = 3;
      let amplitude = 4;
      let speed = 0.05;

      if (isProcessing) {
        // Think wave: glowing orange, hyperactive
        lines = 5;
        amplitude = 12;
        speed = 0.15;
      } else if (isListening) {
        // Microphone wave: green/cyan, moderate
        lines = 4;
        amplitude = 14;
        speed = 0.08;
      } else if (isSpeaking || window.speechSynthesis.speaking) {
        // Jarvis speaking wave: bright blue, tall waves
        lines = 4;
        amplitude = 16;
        speed = 0.12;
      } else {
        // Idle heartbeat wave: soft cybernetic line
        lines = 2;
        amplitude = 2;
        speed = 0.02;
      }

      phase += speed;

      for (let i = 0; i < lines; i++) {
        ctx.beginPath();
        ctx.lineWidth = i === 0 ? 2 : 0.75;
        
        // Define color gradient
        if (isProcessing) {
          ctx.strokeStyle = `rgba(245, 158, 11, ${1 - i * 0.2})`; // orange
        } else if (isListening) {
          ctx.strokeStyle = `rgba(16, 185, 129, ${1 - i * 0.2})`; // emerald
        } else if (isSpeaking || window.speechSynthesis.speaking) {
          ctx.strokeStyle = `rgba(6, 182, 212, ${1 - i * 0.2})`; // cyan/blue
        } else {
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 - i * 0.1})`; // dim cyan
        }

        for (let x = 0; x < canvas.width; x++) {
          // Beautiful sine-wave equations combining multiple frequencies
          const angle = (x / canvas.width) * Math.PI * 4 + phase + (i * Math.PI / 4);
          const y = (canvas.height / 2) + Math.sin(angle) * amplitude * Math.sin(x / canvas.width * Math.PI);
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isProcessing, isListening, audioMuted, isSpeaking]);

  return (
    <div id="jarvis-chat-widget" className="relative flex flex-col p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden h-full">
      {/* Visual Tech grid lines in background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

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
            J.A.R.V.I.S. MAIN TERMINAL
          </span>
        </div>
        
        {/* Audio Output Mute Controller */}
        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-lg border transition-all duration-300 ${
            audioMuted 
              ? "bg-red-950/20 border-red-500/30 text-red-400" 
              : "bg-cyan-950/20 border-cyan-900/50 text-cyan-400 hover:text-white hover:border-cyan-500/30"
          }`}
          title={audioMuted ? "Unmute vocal responses" : "Mute vocal responses"}
        >
          {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Conversational Screen */}
      <div className="flex-1 overflow-y-auto pr-1 mb-4 flex flex-col gap-4 min-h-0 bg-black/40 rounded-xl p-3 border border-cyan-950/50 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="my-auto flex flex-col items-center text-center p-6 text-slate-500">
            <div className="relative w-16 h-16 flex items-center justify-center mb-4">
              <motion.div 
                className="absolute inset-0 rounded-full border border-cyan-500/20"
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Terminal className="w-8 h-8 text-cyan-500/60" />
            </div>
            <h3 className="text-sm font-mono text-cyan-500/80 font-semibold uppercase tracking-widest">Awaiting Command Link</h3>
            <p className="text-xs font-mono text-cyan-600/50 mt-2 max-w-sm leading-relaxed">
              Vocal matrices loaded, Sir. Speak into the console or transmit queries using the terminal input below.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div 
              key={m.id}
              className={`flex flex-col max-w-[85%] ${m.role === "user" ? "self-end items-end" : "self-start items-start"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-mono text-cyan-500/50 uppercase tracking-widest">
                  {m.role === "user" ? "USER ACCESS" : "J.A.R.V.I.S."}
                </span>
                <span className="text-[8px] font-mono text-cyan-700">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
              <div className={`p-3 rounded-2xl font-mono text-xs leading-normal border ${
                m.role === "user"
                  ? "bg-cyan-950/20 border-cyan-900/40 text-cyan-200 rounded-tr-none"
                  : "bg-cyan-950/30 border-cyan-500/30 text-white rounded-tl-none shadow-[0_0_12px_rgba(6,182,212,0.03)]"
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="flex flex-col max-w-[85%] self-start items-start">
            <span className="text-[9px] font-mono text-cyan-500/50 uppercase tracking-widest">J.A.R.V.I.S.</span>
            <div className="flex items-center gap-2 p-3 bg-amber-950/10 border border-amber-500/20 text-amber-300 rounded-2xl rounded-tl-none mt-1">
              <motion.div 
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              />
              <motion.div 
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div 
                className="w-2 h-2 rounded-full bg-amber-400"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              />
              <span className="text-[10px] font-mono text-amber-500 italic ml-1">PROCESSING ALGORITHMS...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Preset Suggestions Quick Actions */}
      {messages.length === 0 && (
        <div className="flex flex-col gap-1.5 mb-3 z-10">
          <span className="text-[8px] font-mono text-cyan-700 tracking-wider">RECOMMENDED DIRECTIVES</span>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(preset);
                  onSendMessage(preset);
                }}
                className="text-left py-1.5 px-3 bg-cyan-950/15 hover:bg-cyan-950/30 border border-cyan-900/50 hover:border-cyan-500/50 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono rounded-lg transition-all duration-300 truncate"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Oscilloscope Waveform Visualizer */}
      <div className="mb-4 bg-cyan-950/5 border border-cyan-950/50 rounded-xl overflow-hidden py-1 px-3 flex items-center gap-3">
        <canvas ref={canvasRef} className="flex-1 opacity-90" />
        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest ${
          isProcessing 
            ? "text-amber-400 animate-pulse" 
            : isListening 
              ? "text-emerald-400 animate-pulse" 
              : "text-cyan-500/60"
        }`}>
          {isProcessing ? "THINK" : isListening ? "REC" : "VOX"}
        </span>
      </div>

      {/* Input controls form */}
      <form onSubmit={handleSend} className="relative flex items-center gap-2.5 z-10">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-3 rounded-xl border flex items-center justify-center transition-all duration-300 active:scale-95 shrink-0 ${
            isListening
              ? "bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-slate-950 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold"
              : "bg-cyan-950/20 hover:bg-cyan-900/30 border-cyan-900/50 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30"
          }`}
          title={isListening ? "Listening... Click to stop" : "Use microphone"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening, Sir..." : "Transmitting command node..."}
          disabled={isProcessing}
          className="flex-1 bg-cyan-950/10 border border-cyan-900/50 focus:border-cyan-500/50 rounded-xl py-3 px-4 text-xs text-white font-mono outline-none placeholder:text-cyan-900 transition"
        />

        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 shrink-0 ${
            !input.trim() || isProcessing
              ? "bg-cyan-950/5 border-cyan-950/20 text-cyan-900 cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
