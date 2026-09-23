import React, { useState } from 'react';
import { ExperimentLogEntry, ExperimentMistake } from '../../types/lab';
import { Terminal, ChevronUp, ChevronDown, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface ExperimentLogDrawerProps {
  logs: ExperimentLogEntry[];
  mistakes: ExperimentMistake[];
}

export const ExperimentLogDrawer: React.FC<ExperimentLogDrawerProps> = ({ logs, mistakes }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto">
      {/* Drawer Toggle Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 backdrop-blur-md px-4 py-2 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono font-medium">Real-Time Experiment Audit Log</span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            {logs.length} events
          </span>
          {mistakes.length > 0 && (
            <span className="text-[10px] bg-rose-950 border border-rose-800 text-rose-300 px-1.5 py-0.5 rounded font-mono">
              {mistakes.length} errors
            </span>
          )}
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        {/* Latest log preview */}
        {!isOpen && logs.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 truncate max-w-md">
            <span className="text-slate-600">Latest:</span>
            <span className="truncate text-slate-300">{logs[logs.length - 1].message}</span>
          </div>
        )}
      </div>

      {/* Expanded Log Content */}
      {isOpen && (
        <div className="bg-slate-950/95 border-t border-slate-800/80 p-4 max-h-56 overflow-y-auto font-mono text-[11px] space-y-2 backdrop-blur-md">
          {logs.map((log) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            return (
              <div key={log.id} className="flex items-start gap-2.5">
                <span className="text-slate-600 shrink-0 select-none">[{timeStr}]</span>
                {log.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                {log.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
                {log.type === 'error' && <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />}
                {log.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                <span
                  className={
                    log.type === 'warning'
                      ? 'text-amber-300'
                      : log.type === 'error'
                      ? 'text-rose-300'
                      : log.type === 'success'
                      ? 'text-emerald-300'
                      : 'text-slate-300'
                  }
                >
                  {log.message}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
