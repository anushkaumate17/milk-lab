import React, { useEffect, useState } from 'react';
import { EvaluationScore, UnknownSample, AdulterantType, NotebookObservation } from '../../types/lab';
import { ADULTERANT_DATA } from '../../lib/adulterationData';
import { generateLabReportPDF } from '../../lib/pdfReportGenerator';
import { storage } from '../../lib/storage';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  FileDown,
  FileText,
  User,
  Check
} from 'lucide-react';

interface ResultsDashboardProps {
  score: EvaluationScore | null;
  currentSample: UnknownSample;
  observations?: NotebookObservation[];
  onTryNextSample: () => void;
  onReturnToLab: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  score,
  currentSample,
  observations = [],
  onTryNextSample,
  onReturnToLab,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [studentName, setStudentName] = useState<string>('Student Analyst');
  const [showNameEdit, setShowNameEdit] = useState(false);

  useEffect(() => {
    if (score && score.totalScore >= 75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [score]);

  const handleDownloadReport = () => {
    if (!score) return;
    setIsGeneratingPDF(true);

    try {
      const allObservations = observations.length > 0 ? observations : storage.getObservations();
      generateLabReportPDF({
        score,
        sample: currentSample,
        observations: allObservations,
        studentName: studentName.trim() || 'Student Analyst',
      });

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error generating PDF lab report:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!score) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-slate-300">
        <Award className="w-12 h-12 text-slate-600 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">No Evaluation Data Yet</h2>
        <p className="text-xs text-slate-400 mb-4 max-w-sm text-center">
          Conduct assays on an unknown sample and submit your final diagnosis in Challenge Mode to receive a detailed rubric score.
        </p>
        <button
          onClick={onReturnToLab}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-md shadow-sm transition-colors"
        >
          Go to Virtual Lab
        </button>
      </div>
    );
  }

  const allAdulterants: AdulterantType[] = ['starch', 'urea', 'detergent', 'cane_sugar', 'hydrogen_peroxide'];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 text-slate-100 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Performance Score Summary Header */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-2">
                <span>Evaluation Assessment Report</span>
                <span className="text-slate-600">·</span>
                <span>Sample {score.sampleId}</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-white">
                {score.diagnosisCorrect ? 'Diagnosis Verified: Accurate' : 'Diagnosis Incomplete or Discrepant'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
                Rubric evaluated against standard food safety laboratory criteria: qualitative detection, procedural adherence, and accurate notebook observations.
              </p>
            </div>

            {/* Score Ring / Gauge */}
            <div className="flex items-center gap-5 bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0">
              <div className="text-center">
                <span className="text-3xl font-extrabold font-mono text-cyan-400">
                  {score.totalScore}
                </span>
                <span className="text-xs text-slate-500 block">/ 100 PTS</span>
              </div>
              <div className="border-l border-slate-800 pl-4 space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between gap-4">
                  <span>Scientific (50%):</span>
                  <strong className="text-cyan-300 font-mono">{score.scientificAccuracy} / 50</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Procedure (30%):</span>
                  <strong className="text-cyan-300 font-mono">{score.proceduralAccuracy} / 30</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Observation (20%):</span>
                  <strong className="text-cyan-300 font-mono">{score.observationAccuracy} / 20</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick PDF Report Bar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Investigator:</span>
              {showNameEdit ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter Analyst / Student Name"
                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500 w-44"
                  />
                  <button
                    onClick={() => setShowNameEdit(false)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] rounded"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowNameEdit(true)}
                  className="font-medium text-cyan-300 hover:underline flex items-center gap-1"
                  title="Click to edit name for PDF certificate"
                >
                  <span>{studentName}</span>
                  <span className="text-[10px] text-slate-500">(edit)</span>
                </button>
              )}
            </div>

            {/* Top Download Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadReport}
                disabled={isGeneratingPDF}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-all flex items-center gap-2 shadow-sm ${
                  downloadSuccess
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Report Downloaded!</span>
                  </>
                ) : isGeneratingPDF ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Download Lab Report (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Diagnosis Comparison: Student vs Reality */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <h2 className="text-base font-semibold text-white mb-1">
            Forensic Findings: Sample {score.sampleId}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Comparison between your diagnosed submissions and actual chemical composition.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {allAdulterants.map((type) => {
              const info = ADULTERANT_DATA[type];
              const isActuallyPresent = score.actualAdulterants.includes(type);
              const isStudentDetected = score.detectedAdulterants.includes(type);
              const isCorrectMatch = isActuallyPresent === isStudentDetected;

              return (
                <div
                  key={type}
                  className={`p-3.5 rounded-lg border text-xs ${
                    isCorrectMatch
                      ? 'bg-slate-900/80 border-slate-800'
                      : 'bg-rose-950/20 border-rose-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{info.name}</span>
                    {isCorrectMatch ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Your Verdict:</span>
                      <span
                        className={
                          isStudentDetected ? 'text-rose-300 font-medium' : 'text-slate-400'
                        }
                      >
                        {isStudentDetected ? 'DETECTED' : 'Not Detected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Actual Sample:</span>
                      <span
                        className={
                          isActuallyPresent ? 'text-cyan-300 font-medium' : 'text-slate-400'
                        }
                      >
                        {isActuallyPresent ? 'PRESENT' : 'Absent'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Procedural Mistakes Audit Trail */}
        {score.mistakes.length > 0 && (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Procedural Deviations Audit</span>
              </h2>
              <span className="text-xs font-mono text-amber-400">
                {score.mistakes.length} mistakes recorded
              </span>
            </div>

            <div className="space-y-2">
              {score.mistakes.map((m, idx) => (
                <div
                  key={m.id || idx}
                  className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-rose-300 block">{m.title}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{m.description}</p>
                  </div>
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-900 shrink-0">
                    -{m.penaltyPoints} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chemical Education & Reaction Explanations */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">
              Scientific Chemistry Breakdown & Mechanisms
            </h2>
          </div>

          <div className="space-y-3">
            {allAdulterants.map((type) => {
              const info = ADULTERANT_DATA[type];
              const wasPresent = score.actualAdulterants.includes(type);

              return (
                <div
                  key={type}
                  className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-xs">
                      {info.testName} ({info.name})
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        wasPresent
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      {wasPresent ? 'ADULTERANT PRESENT IN SAMPLE' : 'ABSENT'}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {info.chemistryExplanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={onReturnToLab}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Return to Virtual Lab</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Download Lab Report Primary Button */}
            <button
              onClick={handleDownloadReport}
              disabled={isGeneratingPDF}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 shadow-sm ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700 hover:border-slate-600'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Report Downloaded!</span>
                </>
              ) : isGeneratingPDF ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>Download Lab Report</span>
                </>
              )}
            </button>

            <button
              onClick={onTryNextSample}
              className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>Investigate Next Unknown Sample</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

