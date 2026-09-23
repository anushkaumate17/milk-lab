import React, { useState } from 'react';
import { NotebookObservation } from '../../types/lab';
import { Bookmark, Trash2, Download, Search, CheckCircle2, XCircle, Filter } from 'lucide-react';

interface LabNotebookProps {
  observations: NotebookObservation[];
  onClearNotebook: () => void;
  onGoToLab: () => void;
}

export const LabNotebook: React.FC<LabNotebookProps> = ({
  observations,
  onClearNotebook,
  onGoToLab,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sampleIds = Array.from(new Set(observations.map((o) => o.sampleId)));

  const filtered = observations.filter((obs) => {
    if (selectedFilter !== 'all' && obs.sampleId !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        obs.sampleId.toLowerCase().includes(q) ||
        obs.testName.toLowerCase().includes(q) ||
        obs.observedColor.toLowerCase().includes(q) ||
        obs.observedDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    if (observations.length === 0) return;
    const headers = ['Timestamp', 'Sample ID', 'Test Name', 'Reagent', 'Observed Color', 'Foam', 'Verdict', 'Notes'];
    const rows = observations.map((o) => [
      new Date(o.timestamp).toLocaleString(),
      o.sampleId,
      o.testName,
      o.reagentUsed,
      `"${o.observedColor}"`,
      o.observedFoam ? 'Yes' : 'No',
      o.verdict.toUpperCase(),
      `"${o.observedDescription}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `milksafe_lab_notebook_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 text-slate-100 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Electronic Laboratory Notebook (ELN)</span>
            </div>
            <h1 className="text-2xl font-bold font-display text-white">Observations Log</h1>
            <p className="text-xs text-slate-400 mt-1">
              Immutable qualitative assays record conforming to GLP (Good Laboratory Practice) simulation protocols.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={observations.length === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClearNotebook}
              disabled={observations.length === 0}
              className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-800 text-slate-400 text-xs font-medium rounded transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Samples ({observations.length})</option>
              {sampleIds.map((id) => (
                <option key={id} value={id}>
                  Sample {id}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search observations..."
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Notebook Table */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs space-y-3">
            <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No observations recorded yet.</p>
            <button
              onClick={onGoToLab}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs transition-colors"
            >
              Enter Virtual Lab to Run Tests
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Sample ID</th>
                    <th className="py-3 px-4">Adulterant Assay</th>
                    <th className="py-3 px-4">Reagent Used</th>
                    <th className="py-3 px-4">Observed Visual Response</th>
                    <th className="py-3 px-4">Foam</th>
                    <th className="py-3 px-4">Verdict</th>
                    <th className="py-3 px-4">Logged Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filtered.map((obs) => {
                    const timeStr = new Date(obs.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const isPositive = obs.verdict === 'positive';

                    return (
                      <tr key={obs.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-cyan-400">
                          {obs.sampleId}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{obs.testName}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {obs.reagentUsed}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="font-semibold block">{obs.observedColor}</span>
                          {obs.observedDescription && (
                            <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                              {obs.observedDescription}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {obs.observedFoam ? (
                            <span className="text-cyan-400 font-medium">Yes</span>
                          ) : (
                            <span className="text-slate-600">No</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                              isPositive
                                ? 'bg-rose-950/60 border border-rose-800 text-rose-300'
                                : 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                            }`}
                          >
                            {isPositive ? (
                              <XCircle className="w-3 h-3 text-rose-400" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            )}
                            <span>{obs.verdict.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {timeStr}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
