import React, { useEffect, useRef, useState } from 'react';
import { LabSceneManager, CameraPreset } from './LabSceneManager';
import { LabTool, AdulterantType } from '../../../types/lab';
import { Eye, RotateCcw, Flame, Sparkles, Compass, ZoomIn } from 'lucide-react';

interface LabCanvasProps {
  testTubeMilkVolume: number;
  testTubeReagentVolume: number;
  liquidColor: string;
  controlLiquidColor: string;
  foamHeight: number;
  isHotPlateActive: boolean;
  isMixing: boolean;
  measuringCylinderMilkVolume: number;
  pipetteLiquidVolume: number;
  isControlMode: boolean;
  onObjectClick: (tool: LabTool, meta?: { reagentType?: AdulterantType }) => void;
}

export const LabCanvas: React.FC<LabCanvasProps> = ({
  testTubeMilkVolume,
  testTubeReagentVolume,
  liquidColor,
  controlLiquidColor,
  foamHeight,
  isHotPlateActive,
  isMixing,
  measuringCylinderMilkVolume,
  pipetteLiquidVolume,
  isControlMode,
  onObjectClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<LabSceneManager | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<CameraPreset>('overview');

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new LabSceneManager(containerRef.current, {
      onObjectClick,
      onObjectHover: (tool, name) => {
        setHoveredName(name);
      },
    });
    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [onObjectClick]);

  // Sync state to 3D scene
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.updateState({
        testTubeMilkVolume,
        testTubeReagentVolume,
        liquidColor,
        controlLiquidColor,
        foamHeight,
        isHotPlateActive,
        isMixing,
        measuringCylinderMilkVolume,
        pipetteLiquidVolume,
        isControlMode,
      });
    }
  }, [
    testTubeMilkVolume,
    testTubeReagentVolume,
    liquidColor,
    controlLiquidColor,
    foamHeight,
    isHotPlateActive,
    isMixing,
    measuringCylinderMilkVolume,
    pipetteLiquidVolume,
    isControlMode,
  ]);

  const handlePresetChange = (preset: CameraPreset) => {
    setActivePreset(preset);
    if (managerRef.current) {
      managerRef.current.setCameraPreset(preset);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas Mounting Point */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Interactive Object Hover Badge */}
      {hoveredName && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none px-4 py-1.5 rounded-md bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md shadow-lg shadow-cyan-950/40 text-xs font-medium text-cyan-300 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Click to interact: <strong className="text-white">{hoveredName}</strong></span>
        </div>
      )}

      {/* Camera Viewport Controls (Top Right HUD) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/80 border border-slate-800 backdrop-blur-md z-10">
        <button
          onClick={() => handlePresetChange('overview')}
          title="Overview Bench Angle"
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            activePreset === 'overview'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Bench</span>
        </button>

        <button
          onClick={() => handlePresetChange('test_tube')}
          title="Zoom to Test Tube"
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            activePreset === 'test_tube'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Test Tube</span>
        </button>

        <button
          onClick={() => handlePresetChange('reagents')}
          title="View Reagents Shelf"
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            activePreset === 'reagents'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reagents</span>
        </button>

        <button
          onClick={() => handlePresetChange('hot_plate')}
          title="View Hot Plate"
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
            activePreset === 'hot_plate'
              ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hot Plate</span>
        </button>
      </div>

      {/* Orbit Helper hint */}
      <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] text-slate-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
        <span>Click & drag to orbit 360° · Scroll to zoom · Click apparatus to operate</span>
      </div>

      {/* Hot Plate Status Overlay if Active */}
      {isHotPlateActive && (
        <div className="absolute bottom-3 right-4 px-3 py-1.5 rounded-md bg-rose-950/80 border border-rose-500/50 backdrop-blur-md text-xs font-mono text-rose-300 flex items-center gap-2 animate-pulse">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>HEATING COIL ACTIVE: ~90°C</span>
        </div>
      )}
    </div>
  );
};
