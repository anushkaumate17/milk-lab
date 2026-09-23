import React from 'react';
import { AdulterantType, ExperimentState } from '../../types/lab';
import { ADULTERANT_DATA, STEP_DEFINITIONS } from '../../lib/adulterationData';
import { CheckCircle2, Circle, AlertCircle, Sparkles, Scale, Info, ArrowRight } from 'lucide-react';

interface ProcedurePanelProps {
  state: ExperimentState;
  onSelectTest: (test: AdulterantType) => void;
  onOpenObservationModal: () => void;
}

export const ProcedurePanel: React.FC<ProcedurePanelProps> = ({
  state,
  onSelectTest,
  onOpenObservationModal,
}) => {
  const currentTestInfo = ADULTERANT_DATA[state.currentTest];
  const steps = STEP_DEFINITIONS(state.currentTest);
  const currentStep = steps[state.currentStepIndex] || steps[steps.length - 1];

  const tests: { id: AdulterantType; label: string }[] = [
    { id: 'starch', label: 'Starch' },
    { id: 'urea', label: 'Urea' },
    { id: 'detergent', label: 'Detergent' },
    { id: 'cane_sugar', label: 'Cane Sugar' },
    { id: 'hydrogen_peroxide', label: 'H₂O₂' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900/60 border-r border-slate-800 text-slate-100 overflow-hidden select-none">
      {/* Test Selector Tabs */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/40">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Target Adulterant Assay</span>
          <span className="text-cyan-400 font-mono text-[10px]">5 Standard Assays</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {tests.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTest(t.id)}
              className={`px-2 py-1.5 text-xs font-medium rounded transition-all text-left truncate ${
                state.currentTest === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-950/50 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header Info for Active Test */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-cyan-400 font-semibold">
            {currentTestInfo.testName}
          </span>
          <span className="text-[11px] text-slate-400">
            Step {state.currentStepIndex + 1} of {steps.length}
          </span>
        </div>
        <h2 className="text-sm font-semibold text-white">
          Detecting: {currentTestInfo.name} ({currentTestInfo.chemicalFormula})
        </h2>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {currentTestInfo.purposeOfAdulteration}
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-slate-400" />
          <span>Standard Operating Protocol</span>
        </div>

        {steps.map((s, idx) => {
          const isCompleted = idx < state.currentStepIndex;
          const isCurrent = idx === state.currentStepIndex;
          const isUpcoming = idx > state.currentStepIndex;

          return (
            <div
              key={s.stepNumber}
              className={`p-3 rounded-lg border transition-all text-xs ${
                isCurrent
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-sm'
                  : isCompleted
                  ? 'bg-slate-900/30 border-slate-800/80 opacity-75'
                  : 'bg-slate-950/20 border-slate-800/40 opacity-40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <Circle className="w-4 h-4 text-cyan-400" />
                      <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-cyan-300'
                          : isCompleted
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      Step {s.stepNumber}: {s.title}
                    </span>
                    {s.targetVolume && (
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {s.targetVolume} {s.unit}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {s.instruction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Action Callout Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800 flex items-start gap-2 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-white block">Next Required Action:</span>
            <span className="text-slate-300 text-[11px] block mt-0.5">
              {state.reactionComplete
                ? 'Observation complete! Record findings in notebook.'
                : currentStep.instruction}
            </span>
          </div>
        </div>

        {/* Record Observation Button */}
        {state.reactionComplete && (
          <button
            onClick={onOpenObservationModal}
            className="w-full mt-2.5 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs rounded-md shadow-md shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Record Reaction in Lab Notebook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
