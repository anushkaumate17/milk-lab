import React from 'react';
import { ExperimentMistake, ExperimentLogEntry } from '../../types/lab';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface MistakeBannerProps {
  latestMistake?: ExperimentMistake;
  logs: ExperimentLogEntry[];
  onDismissMistake?: () => void;
}

export const MistakeBanner: React.FC<MistakeBannerProps> = ({
  latestMistake,
  logs,
  onDismissMistake,
}) => {
  if (!latestMistake) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 max-w-lg w-full px-4 z-40 animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="bg-rose-950/90 border border-rose-500/80 rounded-lg p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 text-xs text-rose-100">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-bold text-rose-200 uppercase tracking-wide text-[11px]">
              ⚠ Procedural Deviation: {latestMistake.title}
            </span>
            <span className="font-mono text-rose-300 text-[10px] bg-rose-900/60 px-1.5 py-0.5 rounded">
              -{latestMistake.penaltyPoints} Pts
            </span>
          </div>
          <p className="mt-1 text-rose-300/90 leading-relaxed">
            {latestMistake.description}
          </p>
        </div>
        {onDismissMistake && (
          <button
            onClick={onDismissMistake}
            className="text-rose-400 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
