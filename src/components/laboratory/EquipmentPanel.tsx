import React, { useState } from 'react';
import { LabTool, AdulterantType, ExperimentState } from '../../types/lab';
import { ADULTERANT_DATA } from '../../lib/adulterationData';
import { 
  Pipette, 
  Beaker, 
  FlaskRound, 
  Flame, 
  Clock, 
  Trash2, 
  Plus, 
  Minus, 
  Check, 
  AlertTriangle,
  Droplets,
  Layers
} from 'lucide-react';

interface EquipmentPanelProps {
  state: ExperimentState;
  selectedTool: LabTool;
  onSelectTool: (tool: LabTool) => void;
  onMeasureSample: (volume: number) => void;
  onTransferSample: () => void;
  onDispenseReagent: (reagentType: AdulterantType, volume: number) => void;
  onAgitate: (seconds: number) => void;
  onHeat: (seconds: number) => void;
  onWashTube: () => void;
  isControlMode: boolean;
  onToggleControlMode: () => void;
}

export const EquipmentPanel: React.FC<EquipmentPanelProps> = ({
  state,
  selectedTool,
  onSelectTool,
  onMeasureSample,
  onTransferSample,
  onDispenseReagent,
  onAgitate,
  onHeat,
  onWashTube,
  isControlMode,
  onToggleControlMode,
}) => {
  const currentTestInfo = ADULTERANT_DATA[state.currentTest];
  const [sampleVolumeInput, setSampleVolumeInput] = useState<number>(currentTestInfo.milkSampleVolume);
  const [reagentVolumeInput, setReagentVolumeInput] = useState<number>(currentTestInfo.reagentVolumeRequired);
  const [selectedReagent, setSelectedReagent] = useState<AdulterantType>(state.currentTest);
  const [heatingTimer, setHeatingTimer] = useState<number>(currentTestInfo.heatingDurationSeconds || 10);
  const [mixingSeconds, setMixingSeconds] = useState<number>(currentTestInfo.mixingDurationSeconds || 5);

  const equipmentList: { id: LabTool; label: string; icon: React.ReactNode; description: string }[] = [
    { id: 'milk_container', label: 'Milk Sample Flask', icon: <FlaskRound className="w-4 h-4" />, description: 'Stock unknown milk sample' },
    { id: 'measuring_cylinder', label: 'Graduated Cylinder', icon: <Beaker className="w-4 h-4" />, description: '10 mL volumetric measurement' },
    { id: 'test_tube', label: 'Reaction Test Tube', icon: <Layers className="w-4 h-4" />, description: 'Borosilicate reaction vessel' },
    { id: 'pipette', label: 'Precision Pipette', icon: <Pipette className="w-4 h-4" />, description: 'Micro-volume reagent dispensing' },
    { id: 'reagent_bottle', label: 'Reagent Bottles', icon: <Droplets className="w-4 h-4" />, description: '5 specific testing indicators' },
    { id: 'hot_plate', label: 'Digital Hot Plate', icon: <Flame className="w-4 h-4" />, description: 'Controlled heating & water bath' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900/60 border-l border-slate-800 text-slate-100 overflow-hidden select-none">
      {/* Control vs Test Comparison Switch */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">Dual Control Stand</span>
        </div>
        <button
          onClick={onToggleControlMode}
          className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
            isControlMode
              ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {isControlMode ? 'Control: ACTIVE' : 'Show Pure Control'}
        </button>
      </div>

      {/* Equipment Inventory Grid */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Apparatus & Inventory
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {equipmentList.map((eq) => {
            const isSelected = selectedTool === eq.id;
            return (
              <button
                key={eq.id}
                onClick={() => onSelectTool(eq.id)}
                className={`p-2 rounded-lg border text-left transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-sm shadow-cyan-950/50 text-white'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={isSelected ? 'text-cyan-400' : 'text-slate-500'}>
                    {eq.icon}
                  </span>
                  <span className="text-xs font-semibold truncate">{eq.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate">{eq.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Interaction & Measurement Deck */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Module 1: Milk Sample Measurement */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FlaskRound className="w-3.5 h-3.5 text-cyan-400" />
              1. Sample Volumetric Dispensing
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              In Cylinder: {state.measuringCylinderMilkVolume.toFixed(1)} mL
            </span>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-xs text-slate-400">Volume (mL):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSampleVolumeInput(Math.max(1, Math.round((sampleVolumeInput - 0.5) * 10) / 10))}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm font-semibold text-white w-12 text-center">
                {sampleVolumeInput.toFixed(1)}
              </span>
              <button
                onClick={() => setSampleVolumeInput(Math.min(10, Math.round((sampleVolumeInput + 0.5) * 10) / 10))}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onMeasureSample(sampleVolumeInput)}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
            >
              Measure to Cylinder
            </button>
            <button
              onClick={onTransferSample}
              disabled={state.measuringCylinderMilkVolume <= 0}
              className={`py-1.5 px-3 rounded text-xs font-medium transition-colors ${
                state.measuringCylinderMilkVolume > 0
                  ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
              }`}
            >
              Pour into Test Tube
            </button>
          </div>
        </div>

        {/* Module 2: Reagent Selection & Dispensing */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              2. Chemical Reagent Dispenser
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Tube Vol: {(state.testTubeMilkVolume + state.testTubeReagentVolume).toFixed(1)} mL
            </span>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 mb-1 block">Selected Reagent:</label>
            <select
              value={selectedReagent}
              onChange={(e) => setSelectedReagent(e.target.value as AdulterantType)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {Object.values(ADULTERANT_DATA).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.reagentName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded border border-slate-800">
            <span className="text-xs text-slate-400">Dose (mL):</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setReagentVolumeInput(Math.max(0.2, Math.round((reagentVolumeInput - 0.2) * 10) / 10))}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-sm font-semibold text-white w-12 text-center">
                {reagentVolumeInput.toFixed(1)}
              </span>
              <button
                onClick={() => setReagentVolumeInput(Math.min(5, Math.round((reagentVolumeInput + 0.2) * 10) / 10))}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <button
            onClick={() => onDispenseReagent(selectedReagent, reagentVolumeInput)}
            className="w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Pipette className="w-3.5 h-3.5" />
            <span>Dispense with Pipette</span>
          </button>
        </div>

        {/* Module 3: Agitation & Heating Physical Operations */}
        <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 space-y-3">
          <span className="text-xs font-semibold text-white block">
            3. Physical Manipulation (Agitation & Thermal)
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Agitate / Mix */}
            <button
              onClick={() => onAgitate(mixingSeconds)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mix / Agitate ({mixingSeconds}s)</span>
            </button>

            {/* Heat on Hot Plate */}
            <button
              onClick={() => onHeat(heatingTimer)}
              className={`py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                currentTestInfo.requiresHeating
                  ? 'bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border border-rose-700/60 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Heat Hot Plate ({heatingTimer}s)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Flush / Wash Action */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Empty & Clean Tube:</span>
        <button
          onClick={onWashTube}
          className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800/60 border border-slate-800 rounded text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Flush to Waste</span>
        </button>
      </div>
    </div>
  );
};
