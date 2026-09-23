import React, { useState } from 'react';
import { AdulterantType, ExperimentState, NotebookObservation, UnknownSample } from '../../types/lab';
import { ADULTERANT_DATA } from '../../lib/adulterationData';
import { X, Sparkles, Check, AlertCircle, Bookmark } from 'lucide-react';

interface ObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: ExperimentState;
  sample: UnknownSample;
  onSaveObservation: (observation: NotebookObservation) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  isOpen,
  onClose,
  state,
  sample,
  onSaveObservation,
}) => {
  if (!isOpen) return null;

  const currentTestInfo = ADULTERANT_DATA[state.currentTest];
  const isActuallyPresent = sample.adulterantsPresent.includes(state.currentTest);

  const [observedColor, setObservedColor] = useState<string>(
    isActuallyPresent
      ? currentTestInfo.positiveObservation.color
      : currentTestInfo.negativeObservation.color
  );
  const [observedFoam, setObservedFoam] = useState<boolean>(state.foamHeight > 0.4);
  const [verdict, setVerdict] = useState<'positive' | 'negative'>(
    isActuallyPresent ? 'positive' : 'negative'
  );
  const [userNotes, setUserNotes] = useState<string>(
    isActuallyPresent
      ? currentTestInfo.positiveObservation.description
      : currentTestInfo.negativeObservation.description
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctVerdict: 'positive' | 'negative' = isActuallyPresent ? 'positive' : 'negative';
    const isScientificallyAccurate = verdict === correctVerdict;

    const observation: NotebookObservation = {
      id: Math.random().toString(),
      timestamp: Date.now(),
      sampleId: sample.id,
      testId: state.currentTest,
      testName: currentTestInfo.testName,
      reagentUsed: currentTestInfo.reagentName,
      milkVolumeUsed: state.testTubeMilkVolume,
      reagentVolumeUsed: state.testTubeReagentVolume,
      observedColor,
      observedFoam,
      observedDescription: userNotes,
      verdict,
      correctVerdict,
      isScientificallyAccurate,
    };

    onSaveObservation(observation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Record Qualitative Observation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Metadata banner */}
          <div className="flex items-center justify-between text-slate-400 p-2.5 rounded bg-slate-950 border border-slate-800">
            <div>
              <span className="text-slate-500">Sample: </span>
              <strong className="text-cyan-400 font-mono">{sample.id}</strong>
            </div>
            <div>
              <span className="text-slate-500">Assay: </span>
              <strong className="text-white">{currentTestInfo.testName}</strong>
            </div>
          </div>

          {/* Color Preview Swatch */}
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Visual Appearance in Reaction Tube:
            </label>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div
                className="w-10 h-10 rounded-full border border-white/20 shadow-inner shrink-0"
                style={{ backgroundColor: state.liquidColor }}
              />
              <div className="flex-1">
                <span className="font-semibold text-slate-200 block text-xs">
                  Simulated Chromatic Response
                </span>
                <span className="text-[11px] text-slate-400">
                  {state.foamHeight > 0.4 ? 'Dense stable foam column formed' : 'Homogeneous liquid column'}
                </span>
              </div>
            </div>
          </div>

          {/* Observed Color Input */}
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Observed Coloration Description:
            </label>
            <input
              type="text"
              value={observedColor}
              onChange={(e) => setObservedColor(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="e.g., Deep Royal Navy Blue, Vivid Canary Yellow, Brick Red..."
              required
            />
          </div>

          {/* Foam Toggle */}
          <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">Persistent Foam / Froth Meniscus:</span>
              <span className="text-[11px] text-slate-400">
                Did a thick foam layer persist longer than 60 seconds?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setObservedFoam(false)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  !observedFoam ? 'bg-slate-700 text-white font-semibold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setObservedFoam(true)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  observedFoam ? 'bg-cyan-600 text-white font-semibold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Yes
              </button>
            </div>
          </div>

          {/* Qualitative Verdict Selector */}
          <div>
            <label className="text-slate-300 font-medium block mb-1.5">
              Preliminary Qualitative Diagnostic Verdict:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVerdict('positive')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  verdict === 'positive'
                    ? 'bg-rose-950/40 border-rose-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-rose-300">POSITIVE</span>
                  {verdict === 'positive' && <Check className="w-4 h-4 text-rose-400" />}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Adulterant ({currentTestInfo.name}) is present in this sample.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setVerdict('negative')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  verdict === 'negative'
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-emerald-300">NEGATIVE</span>
                  {verdict === 'negative' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <span className="text-[11px] text-slate-400 block">
                  No indication of {currentTestInfo.name} adulteration detected.
                </span>
              </button>
            </div>
          </div>

          {/* Notebook Notes */}
          <div>
            <label className="text-slate-300 font-medium block mb-1">
              Analytical Notes:
            </label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              placeholder="Record exact color changes, precipitate, or temperature behavior..."
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save to Lab Notebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
