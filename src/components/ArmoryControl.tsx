import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Sparkles, AlertTriangle, Play, RefreshCw, Eye, Compass, RotateCw } from "lucide-react";
import { ArmorModel } from "../types";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

const VERTICES: Point3D[] = [
  // Helmet (0 to 7)
  { x: 0, y: 52, z: 0 },       // 0: Head top
  { x: -5, y: 47, z: 6 },      // 1: Head front-left
  { x: 5, y: 47, z: 6 },       // 2: Head front-right
  { x: -7, y: 45, z: -2 },     // 3: Head side-left
  { x: 7, y: 45, z: -2 },      // 4: Head side-right
  { x: 0, y: 39, z: 8 },       // 5: Face mask bottom / chin
  { x: 0, y: 47, z: -7 },      // 6: Head back
  { x: 0, y: 34, z: 2 },       // 7: Neck

  // Torso / Chest (8 to 15)
  { x: -16, y: 26, z: 5 },     // 8: Left shoulder front
  { x: 16, y: 26, z: 5 },      // 9: Right shoulder front
  { x: -18, y: 24, z: -5 },    // 10: Left shoulder back
  { x: 18, y: 24, z: -5 },     // 11: Right shoulder back
  { x: 0, y: 16, z: 8 },       // 12: Chest Arc Reactor (Triangular for Mark VI!)
  { x: -10, y: 10, z: 6 },     // 13: Left ribcage front
  { x: 10, y: 10, z: 6 },      // 14: Right ribcage front
  { x: 0, y: 8, z: -8 },       // 15: Spine mid

  // Waist / Hips (16 to 21)
  { x: 0, y: -2, z: 5 },       // 16: Abdomen low
  { x: 0, y: -4, z: -7 },      // 17: Lower spine
  { x: -10, y: -12, z: 4 },    // 18: Left hip front
  { x: 10, y: -12, z: 4 },     // 19: Right hip front
  { x: -12, y: -14, z: -4 },   // 20: Left hip back
  { x: 12, y: -14, z: -4 },    // 21: Right hip back

  // Left Arm (22 to 25)
  { x: -22, y: 12, z: 1 },     // 22: Left bicep mid
  { x: -25, y: 0, z: -2 },     // 23: Left elbow
  { x: -23, y: -12, z: 2 },    // 24: Left forearm mid
  { x: -22, y: -22, z: 4 },    // 25: Left hand (Repulsor)

  // Right Arm (26 to 29)
  { x: 22, y: 12, z: 1 },      // 26: Right bicep mid
  { x: 25, y: 0, z: -2 },      // 27: Right elbow
  { x: 23, y: -12, z: 2 },     // 28: Right forearm mid
  { x: 22, y: -22, z: 4 },     // 29: Right hand (Repulsor)

  // Left Leg (30 to 34)
  { x: -11, y: -28, z: 2 },    // 30: Left thigh upper
  { x: -12, y: -44, z: 3 },    // 31: Left knee
  { x: -11, y: -62, z: 1 },    // 32: Left shin mid
  { x: -10, y: -78, z: -2 },   // 33: Left ankle
  { x: -12, y: -82, z: 6 },    // 34: Left foot toe

  // Right Leg (35 to 39)
  { x: 11, y: -28, z: 2 },     // 35: Right thigh upper
  { x: 12, y: -44, z: 3 },     // 36: Right knee
  { x: 11, y: -62, z: 1 },     // 37: Right shin mid
  { x: 10, y: -78, z: -2 },    // 38: Right ankle
  { x: 12, y: -82, z: 6 },     // 39: Right foot toe
];

const EDGES: [number, number][] = [
  // Helmet outline
  [0, 1], [0, 2], [1, 2],
  [1, 3], [2, 4], [3, 4],
  [1, 5], [2, 5], [3, 5], [4, 5],
  [0, 6], [3, 6], [4, 6],
  [5, 7], [6, 7],

  // Neck connections
  [7, 8], [7, 9], [7, 10], [7, 11],

  // Shoulders and Chest Plate
  [8, 9], [10, 11],
  [8, 10], [9, 11],
  [8, 12], [9, 12],
  [10, 15], [11, 15],
  [12, 13], [12, 14],
  [8, 13], [9, 14],
  [13, 14], [13, 15], [14, 15],

  // Abdomen, Lower Back & Waist
  [13, 16], [14, 16], [15, 17],
  [16, 17],
  [16, 18], [16, 19],
  [17, 20], [17, 21],
  [18, 19], [20, 21],
  [18, 20], [19, 21],

  // Left Arm
  [8, 22], [10, 22],
  [22, 23],
  [23, 24],
  [24, 25],

  // Right Arm
  [9, 26], [11, 26],
  [26, 27],
  [27, 28],
  [28, 29],

  // Left Leg
  [18, 30], [20, 30],
  [30, 31],
  [31, 32],
  [32, 33],
  [33, 34],
  [31, 33],

  // Right Leg
  [19, 35], [21, 35],
  [35, 36],
  [36, 37],
  [37, 38],
  [38, 39],
  [36, 38],
];

const ARMOR_MODELS: ArmorModel[] = [
  {
    id: "mark-3",
    name: "MARK III",
    designation: "Classic Gold & Red",
    description: "The first armor featuring fully integrated flight control surfaces, gold-titanium alloy plating, and dual arm-mounted micro-missiles.",
    thrusters: 85,
    repulsors: 90,
    weapons: 80,
    integrity: 95,
    status: "active"
  },
  {
    id: "mark-6",
    name: "MARK VI",
    designation: "Vibranium-Powered Core",
    description: "Equipped with the iconic triangular Chest Arc Reactor powered by a newly synthesized vibranium core element. Highly resilient to high-voltage energy discharges with light-weight tactical configurations.",
    thrusters: 90,
    repulsors: 92,
    weapons: 94,
    integrity: 92,
    status: "active"
  },
  {
    id: "mark-7",
    name: "MARK VII",
    designation: "Heavy Combat Suit",
    description: "Designed for rapid deployment via tracking bracelets. Equipped with back thruster pods, knee micro-missiles, and a chest-mounted laser array.",
    thrusters: 95,
    repulsors: 95,
    weapons: 98,
    integrity: 88,
    status: "standby"
  },
  {
    id: "mark-85",
    name: "MARK LXXXV",
    designation: "Nanotechnology Marvel",
    description: "Constructed with smart liquid nanoparticles, capable of morphing into energy shields, repulsor cannons, and a lightning refocuser.",
    thrusters: 100,
    repulsors: 100,
    weapons: 100,
    integrity: 100,
    status: "active"
  }
];

interface ArmoryControlProps {
  onAddLog: (text: string, category: "ARMORY" | "SYSTEM" | "ALERT", status: "info" | "success" | "warning") => void;
}

export default function ArmoryControl({ onAddLog }: ArmoryControlProps) {
  const [selectedMark, setSelectedMark] = useState<ArmorModel>(ARMOR_MODELS[1]); // Default to MARK VI!
  const [activeNode, setActiveNode] = useState<string>("chest");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(100);
  const [sysOverwrites, setSysOverwrites] = useState({
    thrusters: selectedMark.thrusters,
    repulsors: selectedMark.repulsors,
  });

  // Sync state when armor model changes
  useEffect(() => {
    setSysOverwrites({
      thrusters: selectedMark.thrusters,
      repulsors: selectedMark.repulsors
    });
  }, [selectedMark]);

  // 3D Canvas states and refs
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [projectedNodes, setProjectedNodes] = useState<Record<string, { x: number; y: number }>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const yawRef = useRef<number>(0.6);
  const pitchRef = useRef<number>(-0.15);
  const autoRotateRef = useRef<boolean>(true);
  const targetAngleRef = useRef<{ tYaw: number; tPitch: number } | null>(null);
  const activeNodeRef = useRef<string>(activeNode);
  const selectedMarkIdRef = useRef<string>(selectedMark.id);

  // Sync refs to prevent stale closures in requestAnimationFrame loop
  useEffect(() => {
    activeNodeRef.current = activeNode;
  }, [activeNode]);

  useEffect(() => {
    selectedMarkIdRef.current = selectedMark.id;
  }, [selectedMark.id]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const draw3DRing = (
    ctx: CanvasRenderingContext2D,
    y: number,
    r: number,
    yaw: number,
    pitch: number,
    width: number,
    height: number
  ) => {
    ctx.beginPath();
    const numSegments = 36;
    const scale = 1.35;
    for (let i = 0; i <= numSegments; i++) {
      const theta = (i / numSegments) * Math.PI * 2;
      const rx = r * Math.cos(theta);
      const rz = r * Math.sin(theta);

      // Rotate around X-axis (pitch)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      let ry1 = y * cosP - rz * sinP;
      let rz1 = y * sinP + rz * cosP;

      // Rotate around Y-axis (yaw)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      let rx2 = rx * cosY + rz1 * sinY;

      const projX = rx2 * scale + width / 2;
      const projY = -ry1 * scale + height / 2 + 10;

      if (i === 0) {
        ctx.moveTo(projX, projY);
      } else {
        ctx.lineTo(projX, projY);
      }
    }
    ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 240;
    const height = 260;
    canvas.width = width;
    canvas.height = height;

    let animationId: number;

    const render = () => {
      if (autoRotateRef.current) {
        yawRef.current += 0.012; // slowly rotate
      }

      if (targetAngleRef.current) {
        const { tYaw, tPitch } = targetAngleRef.current;
        yawRef.current += (tYaw - yawRef.current) * 0.12;
        pitchRef.current += (tPitch - pitchRef.current) * 0.12;

        if (Math.abs(tYaw - yawRef.current) < 0.01 && Math.abs(tPitch - pitchRef.current) < 0.01) {
          targetAngleRef.current = null;
        }
      }

      const localYaw = yawRef.current;
      const localPitch = pitchRef.current;

      ctx.clearRect(0, 0, width, height);

      // Draw perspective tech base grids
      draw3DRing(ctx, -85, 20, localYaw, localPitch, width, height);
      draw3DRing(ctx, -85, 30, localYaw, localPitch, width, height);
      draw3DRing(ctx, -85, 40, localYaw, localPitch, width, height);

      // Project vertices
      const projected: { x: number; y: number; originalZ: number }[] = [];
      const scale = 1.35;

      for (const v of VERTICES) {
        // Rotate X (pitch)
        const cosP = Math.cos(localPitch);
        const sinP = Math.sin(localPitch);
        let y1 = v.y * cosP - v.z * sinP;
        let z1 = v.y * sinP + v.z * cosP;

        // Rotate Y (yaw)
        const cosY = Math.cos(localYaw);
        const sinY = Math.sin(localYaw);
        let x2 = v.x * cosY + z1 * sinY;
        let z2 = -v.x * sinY + z1 * cosY;

        // Projection
        const projX = x2 * scale + width / 2;
        const projY = -y1 * scale + height / 2 + 10;

        projected.push({ x: projX, y: projY, originalZ: z2 });
      }

      // Draw grid outlines & mechanical edges
      ctx.lineWidth = 1.0;
      for (const edge of EDGES) {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];

        const avgZ = (p1.originalZ + p2.originalZ) / 2;
        const alpha = Math.max(0.12, Math.min(0.85, (avgZ + 35) / 70));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        if (isScanning) {
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        } else {
          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha * 0.55})`;
        }
        ctx.stroke();
      }

      // Sync locations to projectedNodes
      const nodesMap: Record<string, { x: number; y: number }> = {};
      const hotspots = [
        { id: "helmet", idx: 0 },
        { id: "chest", idx: 12 },
        { id: "left-hand", idx: 25 },
        { id: "right-hand", idx: 29 },
        { id: "boots", idx: 33 }, // Left boot connection
      ];

      for (const hs of hotspots) {
        const p = projected[hs.idx];
        nodesMap[hs.id] = { x: p.x, y: p.y };

        const isAct = activeNodeRef.current === hs.id;

        // Draw ring around hotspot on canvas
        ctx.beginPath();
        ctx.arc(p.x, p.y, isAct ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = isAct ? "rgba(34, 211, 238, 0.25)" : "rgba(34, 211, 238, 0.08)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, isAct ? 7 : 4, 0, Math.PI * 2);
        ctx.strokeStyle = isAct ? "rgba(34, 211, 238, 0.9)" : "rgba(34, 211, 238, 0.5)";
        ctx.lineWidth = isAct ? 1.5 : 1.0;
        ctx.stroke();

        // Specific shape for chest core: circular or triangular depending on MARK VI!
        if (hs.id === "chest") {
          if (selectedMarkIdRef.current === "mark-6") {
            // Triangular Reactor Core! (Iconic Mark VI as shown in reference)
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - 4);
            ctx.lineTo(p.x + 4, p.y + 3);
            ctx.lineTo(p.x - 4, p.y + 3);
            ctx.closePath();
            ctx.fillStyle = "rgba(34, 211, 238, 0.9)";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          } else {
            // Circle reactor
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(34, 211, 238, 0.95)";
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        } else {
          // Normal center dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
      }

      setProjectedNodes(nodesMap);
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [isScanning, selectedMark.id]);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    yawRef.current += dx * 0.01;
    pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchRef.current + dy * 0.01));
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setAutoRotate(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    yawRef.current += dx * 0.01;
    pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchRef.current + dy * 0.01));
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const applyPresetView = (view: "front" | "side" | "perspective" | "rear") => {
    setAutoRotate(false);
    let targetYaw = 0;
    let targetPitch = 0;

    switch (view) {
      case "front":
        targetYaw = 0;
        targetPitch = 0;
        break;
      case "perspective":
        targetYaw = 0.6;
        targetPitch = -0.15;
        break;
      case "side":
        targetYaw = Math.PI / 2;
        targetPitch = 0;
        break;
      case "rear":
        targetYaw = Math.PI;
        targetPitch = 0;
        break;
    }

    const currentYaw = yawRef.current;
    const diff = targetYaw - (currentYaw % (Math.PI * 2));
    targetAngleRef.current = {
      tYaw: currentYaw + diff,
      tPitch: targetPitch,
    };
    onAddLog(`Aligning hologram sensor matrix: ${view.toUpperCase()} PROJECTION.`, "ARMORY", "info");
  };

  const runDiagnostic = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    onAddLog(`Initializing multi-spectral scan for ${selectedMark.name} armor...`, "ARMORY", "info");

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          onAddLog(`${selectedMark.name} diagnostic complete. Integrity at ${selectedMark.integrity}%. All systems nominal.`, "ARMORY", "success");
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleNodeClick = (node: string, label: string) => {
    setActiveNode(node);
    onAddLog(`Telemetry synced with ${selectedMark.name} node: ${label.toUpperCase()}.`, "ARMORY", "info");
  };

  const getNodeData = () => {
    switch (activeNode) {
      case "helmet":
        return {
          title: "NEURAL LINK & HUD",
          status: "100% SECURE",
          desc: "Retinal projection, target locking matrix, and tactical environmental overlays. Connected directly to J.A.R.V.I.S. neural pathways.",
          charge: "100%"
        };
      case "chest":
        return {
          title: "ARC PLUG INTERFACE",
          status: "STABLE POWER FLOW",
          desc: "Universal power coupling channeling zero-point energy to core repulsors, secondary flight reserves, and shield generators.",
          charge: "98.4%"
        };
      case "right-hand":
      case "left-hand":
        return {
          title: "REPULSOR EMITTERS",
          status: `INTENSITY: ${sysOverwrites.repulsors}%`,
          desc: "Concentrated muon-particle energy projection. Dual function: directional stabilization flight pathing and high-impact tactical defense.",
          charge: `${sysOverwrites.repulsors}%`
        };
      case "boots":
        return {
          title: "FLIGHT THRUSTERS",
          status: `CALIBRATED: ${sysOverwrites.thrusters}%`,
          desc: "Boot-mounted thrust nozzles with vectored attitude rings, providing hypersonic vertical lift and supersonic low-altitude cruise.",
          charge: `${sysOverwrites.thrusters}%`
        };
      default:
        return {
          title: "SYSTEM OVERVIEW",
          status: "NOMINAL",
          desc: "Select any system node on the wireframe diagram to run diagnostics and check telemetry links.",
          charge: "100%"
        };
    }
  };

  const activeNodeData = getNodeData();

  return (
    <div id="armory-widget" className="relative flex flex-col p-6 bg-cyan-950/10 border border-cyan-900/60 rounded-2xl backdrop-blur-md overflow-hidden h-full">
      {/* Corner Tech Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-500/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-500/40" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-500/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-500/40" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-cyan-900/30 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono tracking-widest text-slate-300 font-semibold uppercase">
            ARMORY CONTROLLER
          </span>
        </div>
        
        {/* Model Tabs */}
        <div className="flex gap-1.5">
          {ARMOR_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMark(m);
                onAddLog(`System focus swapped to ${m.name}.`, "ARMORY", "info");
              }}
              className={`px-2 py-0.5 rounded text-[9px] font-mono border transition-all duration-300 ${
                selectedMark.id === m.id
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold"
                  : "bg-cyan-950/20 text-cyan-500/50 border-cyan-900/50 hover:text-cyan-300"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of suit blueprint & controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-auto">
        
        {/* Holographic blueprint Column */}
        <div 
          className="col-span-1 md:col-span-6 relative flex flex-col items-center justify-center h-80 border border-cyan-900/40 rounded-xl bg-black/60 p-4 overflow-hidden group select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          {/* Tech crosshairs */}
          <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-cyan-500/15" />
          <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-cyan-500/15" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/[0.04] pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/[0.04] pointer-events-none" />

          {/* Hologram Light Ray effect behind model */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none blur-xl rounded-full" />

          {/* Sweeping scanline */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                className="absolute inset-x-0 h-0.5 bg-cyan-400/60 shadow-[0_0_10px_#22d3ee] z-20 pointer-events-none"
                initial={{ top: "0%" }}
                animate={{ top: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
          </AnimatePresence>

          {/* 3D Holographic Canvas */}
          <canvas 
            ref={canvasRef} 
            className="w-[240px] h-[260px] filter drop-shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-grab active:cursor-grabbing"
          />

          {/* Hotspots clickable overlays */}
          {Object.entries(projectedNodes).map(([nodeId, unknownCoords]) => {
            const coords = unknownCoords as { x: number; y: number };
            const nodeLabel = nodeId === "left-hand" ? "Left Repulsor" :
                              nodeId === "right-hand" ? "Right Repulsor" :
                              nodeId === "helmet" ? "Helmet HUD" :
                              nodeId === "chest" ? "Arc Reactor" : "Flight Thrusters";
            const isActive = activeNode === nodeId;
            return (
              <button
                key={nodeId}
                onClick={() => handleNodeClick(nodeId, nodeLabel)}
                style={{
                  position: "absolute",
                  left: coords.x,
                  top: coords.y,
                  transform: "translate(-50%, -50%)",
                }}
                className={`w-6 h-6 rounded-full flex items-center justify-center z-30 group cursor-pointer focus:outline-none`}
                title={nodeLabel}
              >
                {/* Visual pulsating core of hotspot */}
                <span className={`absolute w-1.5 h-1.5 rounded-full bg-cyan-400 transition-transform duration-300 ${isActive ? 'scale-125 shadow-[0_0_8px_#22d3ee]' : 'group-hover:scale-110'}`} />
                {/* Outward rings */}
                <span className={`absolute w-4 h-4 rounded-full border border-cyan-400/0 group-hover:border-cyan-400/40 group-hover:scale-110 transition-all duration-300 ${isActive ? 'border-cyan-400/70 scale-125 animate-pulse' : ''}`} />
              </button>
            );
          })}

          {/* Hologram View Controls Overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 bg-black/65 border border-cyan-900/50 p-1.5 rounded-lg z-20">
            <span className="text-[7px] font-mono text-cyan-500/50 uppercase tracking-widest text-center">CAM VIEWS</span>
            <div className="grid grid-cols-2 gap-1">
              <button 
                onClick={() => applyPresetView("perspective")} 
                className="px-1.5 py-0.5 rounded text-[8px] font-mono border border-cyan-950 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/20"
                title="3/4 perspective projection"
              >
                3/4
              </button>
              <button 
                onClick={() => applyPresetView("front")} 
                className="px-1.5 py-0.5 rounded text-[8px] font-mono border border-cyan-950 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/20"
                title="Front ortho projection"
              >
                FRNT
              </button>
              <button 
                onClick={() => applyPresetView("side")} 
                className="px-1.5 py-0.5 rounded text-[8px] font-mono border border-cyan-950 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/20"
                title="Profile side projection"
              >
                SIDE
              </button>
              <button 
                onClick={() => applyPresetView("rear")} 
                className="px-1.5 py-0.5 rounded text-[8px] font-mono border border-cyan-950 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-500/20"
                title="Rear ortho projection"
              >
                REAR
              </button>
            </div>
            
            <button
              onClick={() => {
                const newVal = !autoRotate;
                setAutoRotate(newVal);
                onAddLog(`Hologram auto-rotation ${newVal ? 'ENABLED' : 'DISABLED'}.`, "ARMORY", "info");
              }}
              className={`mt-1 py-0.5 px-1 rounded text-[7px] font-mono font-bold flex items-center justify-center gap-1 transition-colors ${autoRotate ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-cyan-950/40 text-cyan-600 border border-cyan-900/40 hover:text-cyan-400'}`}
            >
              <RotateCw className={`w-2 h-2 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              {autoRotate ? "ROTATING" : "ORBIT OFF"}
            </button>
          </div>

          {/* Micro scan progress / rotation degrees overlay */}
          <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/80 border border-cyan-900/60 px-2 py-0.5 rounded font-mono text-[8px] text-cyan-400 pointer-events-none">
            <span>GRID: OK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>DRAG TO ORBIT</span>
          </div>

          {isScanning && (
            <div className="absolute bottom-2 right-2 bg-black/90 border border-cyan-900/60 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400 pointer-events-none">
              SCANNING: {scanProgress}%
            </div>
          )}
        </div>

        {/* Node stats and telemetry details Column */}
        <div className="col-span-1 md:col-span-6 flex flex-col gap-4">
          
          {/* Armor meta */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block tracking-wider">
              {selectedMark.name} // {selectedMark.designation}
            </span>
            <p className="text-[10px] font-mono text-slate-300 mt-1 leading-normal">
              {selectedMark.description}
            </p>
          </div>

          {/* Active node detail card */}
          <div className="p-3.5 bg-cyan-950/15 border border-cyan-900/30 rounded-xl border-l-2 border-l-cyan-500">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest">SELECTED MODULE</span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/30 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                LINK: {activeNodeData.charge}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-white block">{activeNodeData.title}</span>
            <span className="text-[9px] font-mono text-emerald-400 font-semibold block mt-0.5">{activeNodeData.status}</span>
            <p className="text-[10px] font-mono text-slate-300 mt-1.5 leading-normal">
              {activeNodeData.desc}
            </p>
          </div>

          {/* Interactive calibrations if hands or feet are selected */}
          {activeNode === "boots" && (
            <div className="flex flex-col gap-1 px-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-cyan-600">THRUSTER VELOCITY OUTPUT:</span>
                <span className="text-cyan-400 font-semibold">{sysOverwrites.thrusters}%</span>
              </div>
              <input 
                type="range" min="20" max="120" value={sysOverwrites.thrusters}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSysOverwrites(prev => ({ ...prev, thrusters: val }));
                  if (val % 20 === 0) {
                    onAddLog(`Thruster flight output calibrated to ${val}%.`, "ARMORY", "info");
                  }
                }}
                className="h-1 bg-cyan-950/50 rounded accent-cyan-500"
              />
            </div>
          )}

          {(activeNode === "right-hand" || activeNode === "left-hand") && (
            <div className="flex flex-col gap-1 px-1">
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-cyan-600">REPULSOR DISCHARGE CHARGE:</span>
                <span className="text-cyan-400 font-semibold">{sysOverwrites.repulsors}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={sysOverwrites.repulsors}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setSysOverwrites(prev => ({ ...prev, repulsors: val }));
                  if (val % 25 === 0) {
                    onAddLog(`Repulsor emitter charging capped at ${val}%.`, "ARMORY", "info");
                  }
                }}
                className="h-1 bg-cyan-950/50 rounded accent-cyan-500"
              />
            </div>
          )}

          {/* Diagnostic actions */}
          <div className="flex gap-2.5 mt-1">
            <button
              onClick={runDiagnostic}
              disabled={isScanning}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl font-mono text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${
                isScanning
                  ? "bg-cyan-950/5 border-cyan-950/20 text-cyan-900 cursor-not-allowed"
                  : "bg-cyan-500 hover:bg-cyan-400 border-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.3)] hover:scale-[1.02] active:scale-95"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "DIAGNOSING..." : "RUN FULL DIAGNOSTIC"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
