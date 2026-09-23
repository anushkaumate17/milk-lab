import React from 'react';
import { UnknownSample } from '../../types/lab';
import { FlaskConical, BookOpen, Award, Sparkles, RotateCcw } from 'lucide-react';

export type NavTab = 'lab' | 'challenge' | 'notebook' | 'learn' | 'results';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentSample: UnknownSample;
  onResetBench: () => void;
  accuracyScore?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  currentSample,
  onResetBench,
  accuracyScore,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-30">
      {/* Zone 1: Wordmark */}
      <button
        onClick={() => onSelectTab('lab')}
        className="text-base font-bold tracking-tight text-white hover:text-cyan-400 transition-colors flex items-center gap-2"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
        <span className="font-display tracking-wide uppercase text-sm">MilkSafe 3D Lab</span>
      </button>

      {/* Zone 2: Navigation Links (Clean text with hover states) */}
      <nav className="hidden md:flex items-center gap-1">
        <button
          onClick={() => onSelectTab('lab')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'lab'
              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Virtual Lab
        </button>

        <button
          onClick={() => onSelectTab('challenge')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'challenge'
              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Sample Challenge
        </button>

        <button
          onClick={() => onSelectTab('notebook')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'notebook'
              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Lab Notebook
        </button>

        <button
          onClick={() => onSelectTab('learn')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'learn'
              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Adulteration Theory
        </button>

        <button
          onClick={() => onSelectTab('results')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'results'
              ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Performance & Scores
        </button>
      </nav>

      {/* Zone 3: Active Status & Primary Actions */}
      <div className="flex items-center gap-3">
        {/* Sample ID Pill-Free Indicator */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border-r border-slate-800 pr-3">
          <span>Active Sample:</span>
          <span className="font-mono text-cyan-400 font-semibold">{currentSample.id}</span>
          <span className="text-slate-600">·</span>
          <span>Fat {currentSample.fatPercentage}%</span>
          <span className="text-slate-600">·</span>
          <span>SNF {currentSample.snfPercentage}%</span>
        </div>

        <button
          onClick={onResetBench}
          title="Reset equipment and flush vessels"
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Bench</span>
        </button>
      </div>
    </header>
  );
};
