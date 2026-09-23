import React, { useState } from 'react';
import { UnknownSample, AdulterantType, NotebookObservation, EvaluationScore } from '../../types/lab';
import { UNKNOWN_SAMPLES_PRESETS, ADULTERANT_DATA } from '../../lib/adulterationData';
import { ExperimentEngine } from '../../lib/experimentEngine';
import { 
  FlaskConical, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  ClipboardCheck, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';

interface ChallengeDashboardProps {
  currentSample: UnknownSample;
  onSelectSample: (sample: UnknownSample) => void;
  observations: NotebookObservation[];
  onStartAssay: (test: AdulterantType) => void;
  onSubmitFinalDiagnosis: (score: EvaluationScore) => void;
}

export const ChallengeDashboard: React.FC<ChallengeDashboardProps> = ({
  currentSample,
  onSelectSample,
  observations,
  onStartAssay,
  onSubmitFinalDiagnosis,
}) => {
  const [selectedAdulterants, setSelectedAdulterants] = useState<AdulterantType[]>([]);
  const [isPureSelected, setIsPureSelected] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [startTime] = useState<number>(Date.now());

  const allAdulterants: AdulterantType[] = ['starch', 'urea', 'detergent', 'cane_sugar', 'hydrogen_peroxide'];

  const sampleObservations = observations.filter((o) => o.sampleId === currentSample.id);
  const testedAdulterants = new Set(sampleObservations.map((o) => o.testId));

  const handleToggleAdulterant = (type: AdulterantType) => {
    setIsPureSelected(false);
    if (selectedAdulterants.includes(type)) {
      setSelectedAdulterants(selectedAdulterants.filter((t) => t !== type));
    } else {
      setSelectedAdulterants([...selectedAdulterants, type]);
    }
  };

  const handleTogglePure = () => {
    if (!isPureSelected) {
      setIsPureSelected(true);
      setSelectedAdulterants([]);
    } else {
      setIsPureSelected(false);
    }
  };

  const handleSubmitDiagnosis = () => {
    const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
    const finalAdulterants = isPureSelected ? [] : selectedAdulterants;

    const score = ExperimentEngine.calculateChallengeScore(
      currentSample,
      observations,
      finalAdulterants,
      [], // aggregated mistakes if any
      timeSpentSeconds
    );

    onSubmitFinalDiagnosis(score);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 text-slate-100 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Challenge Banner */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
                <span>Active Forensic Investigation Challenge</span>
                <span className="text-slate-600">·</span>
                <span>Qualitative Assay Protocol</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-white">
                Unknown Sample Investigation: <span className="text-cyan-400">{currentSample.id}</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                A batch of suspect market milk has arrived at the food safety laboratory. Your objective is to systematically conduct qualitative chemical assays, record chromatic responses, and pinpoint every adulterant present.
              </p>
            </div>

            {/* Change Sample Dropdown */}
            <div className="shrink-0 bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs">
              <label className="text-slate-400 block mb-1 font-medium">Select Investigation Target:</label>
              <select
                value={currentSample.id}
                onChange={(e) => {
                  const s = UNKNOWN_SAMPLES_PRESETS.find((p) => p.id === e.target.value);
                  if (s) {
                    onSelectSample(s);
                    setSelectedAdulterants([]);
                    setIsPureSelected(false);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {UNKNOWN_SAMPLES_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.id} ({p.difficulty.toUpperCase()}) — {p.source}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sample Baseline Parameters */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[11px]">Batch Number</span>
              <span className="font-mono text-slate-200 font-semibold">{currentSample.batchNumber}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[11px]">Source Facility</span>
              <span className="text-slate-200 font-medium truncate block">{currentSample.source}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[11px]">Fat % (Gerber Method)</span>
              <span className="font-mono text-cyan-400 font-semibold">{currentSample.fatPercentage}%</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60">
              <span className="text-slate-500 block text-[11px]">SNF % (Solids-Not-Fat)</span>
              <span className="font-mono text-cyan-400 font-semibold">{currentSample.snfPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Assay Execution Checklist Matrix */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">1. Conduct Adulterant Assays</h2>
              <p className="text-xs text-slate-400">
                Launch individual tests in the 3D lab environment to inspect reaction changes.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800 px-2.5 py-1 rounded">
              Completed: {sampleObservations.length} / 5 Assays
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allAdulterants.map((type) => {
              const info = ADULTERANT_DATA[type];
              const isTested = testedAdulterants.has(type);
              const observation = sampleObservations.find((o) => o.testId === type);

              return (
                <div
                  key={type}
                  className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                    isTested
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-white">{info.name} Test</span>
                      {isTested ? (
                        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Recorded ({observation?.verdict?.toUpperCase()})</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Not Tested Yet</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block font-mono">{info.testName}</span>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      Reagent: {info.reagentName}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    {observation ? (
                      <span className="text-xs text-slate-300 italic truncate max-w-[200px]">
                        "{observation.observedColor}"
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Requires ~2 min assay</span>
                    )}

                    <button
                      onClick={() => onStartAssay(type)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 text-xs font-semibold rounded transition-colors flex items-center gap-1.5"
                    >
                      <span>{isTested ? 'Re-run Assay' : 'Run Assay in 3D Lab'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final Forensic Diagnosis Submission Form */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">2. Submit Forensic Diagnosis</h2>
            <p className="text-xs text-slate-400">
              Based on your qualitative observations and color changes, check every adulterant detected in sample{' '}
              <strong className="text-cyan-400 font-mono">{currentSample.id}</strong>:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-6">
            {allAdulterants.map((type) => {
              const isChecked = selectedAdulterants.includes(type);
              const info = ADULTERANT_DATA[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleToggleAdulterant(type)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isChecked
                      ? 'bg-rose-950/50 border-rose-500 text-white shadow-md shadow-rose-950/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs">{info.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      readOnly
                      className="accent-rose-500 rounded"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 block">{info.chemicalFormula}</span>
                </button>
              );
            })}

            {/* Pure Milk Option */}
            <button
              type="button"
              onClick={handleTogglePure}
              className={`p-3 rounded-lg border text-left transition-all ${
                isPureSelected
                  ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md shadow-emerald-950/30'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-xs">No Adulterants (Pure Milk)</span>
                <input
                  type="checkbox"
                  checked={isPureSelected}
                  readOnly
                  className="accent-emerald-500 rounded"
                />
              </div>
              <span className="text-[11px] text-slate-400 block">Compliant with FSSAI standards</span>
            </button>
          </div>

          {/* Submission button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Evaluates: Scientific result (50%) + Procedural accuracy (30%) + Observation (20%)
            </span>

            <button
              onClick={handleSubmitDiagnosis}
              disabled={selectedAdulterants.length === 0 && !isPureSelected}
              className={`py-2 px-6 rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 transition-all ${
                selectedAdulterants.length > 0 || isPureSelected
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-950/50 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Submit Final Diagnosis & Grade</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
