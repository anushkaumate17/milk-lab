import React, { useState } from 'react';
import { ADULTERANT_DATA } from '../../lib/adulterationData';
import { AdulterantType } from '../../types/lab';
import { 
  BookOpen, 
  ShieldAlert, 
  FlaskConical, 
  Scale, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LearnModeProps {
  onEnterLab: (testType?: AdulterantType) => void;
}

export const LearnMode: React.FC<LearnModeProps> = ({ onEnterLab }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'adulterants'>('adulterants');
  const [selectedAdulterant, setSelectedAdulterant] = useState<AdulterantType>('starch');

  const selectedInfo = ADULTERANT_DATA[selectedAdulterant];

  const coreConcepts = [
    {
      title: 'What is Milk Adulteration?',
      icon: <FlaskConical className="w-5 h-5 text-cyan-400" />,
      content:
        'Milk adulteration is the fraudulent addition of inferior, synthetic, or toxic substances (or the unauthorized skimming of milk fat followed by reconstitution with water and thickening agents) designed to falsely inflate volume, solid content, or shelf life for economic profit.',
    },
    {
      title: 'Why is Adulteration Dangerous?',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
      content:
        'Adulterants such as detergents cause severe mucosal erosion and gastrointestinal toxicity; urea induces severe renal strain and acidosis; hydrogen peroxide damages cellular DNA through reactive oxygen species; and starch causes dangerous glycemic spikes in diabetics and gut failure in infants.',
    },
    {
      title: 'What is Qualitative Chemical Analysis?',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      content:
        'Unlike quantitative methods that yield numerical concentrations (e.g., mg/dL), qualitative assays determine the presence or absence of a specific analyte through rapid, visible, chromogenic or physical changes (color formation, precipitation, foaming, or fluorescence).',
    },
    {
      title: 'Why are Chemical Controls Essential?',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      content:
        'A negative control (certified pure cow/buffalo milk) confirms the baseline color and proves the testing reagent does not cross-react with native milk lipids or casein. Without controls, false positives or subtle shifts cannot be confidently distinguished.',
    },
    {
      title: 'Why is Measurement & Sequence Accuracy Critical?',
      icon: <Scale className="w-5 h-5 text-blue-400" />,
      content:
        'Chemical kinetics require specific stoichiometric ratios. Adding reagent to an empty tube causes surface wall adsorption. Excessive acid without timed cooling causes nonspecific caramelization. Adding reagents in the wrong order inhibits catalytic enzyme complexes.',
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 text-slate-100 flex justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dairy Chemistry & Food Safety Compendium</span>
              </div>
              <h1 className="text-2xl font-bold font-display text-white">
                Adulteration Science & Protocols
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Comprehensive reference materials conforming to FSSAI (Food Safety and Standards Authority of India) and AOAC international qualitative laboratory methods.
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
              <button
                onClick={() => setActiveTab('adulterants')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'adulterants'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                5 Target Adulterants
              </button>
              <button
                onClick={() => setActiveTab('concepts')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'concepts'
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Core Lab Principles
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'adulterants' ? (
          <div className="space-y-6">
            {/* Adulterant Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(ADULTERANT_DATA) as AdulterantType[]).map((type) => {
                const info = ADULTERANT_DATA[type];
                const isSelected = selectedAdulterant === type;
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedAdulterant(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white font-semibold shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{info.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Detailed Adulterant Deep Dive Card */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                <div>
                  <span className="text-xs font-mono text-cyan-400 block mb-1">
                    Chemical Formula: {selectedInfo.chemicalFormula || 'Variable'}
                  </span>
                  <h2 className="text-xl font-bold text-white font-display">
                    {selectedInfo.name} Detection Assay
                  </h2>
                </div>
                <button
                  onClick={() => onEnterLab(selectedAdulterant)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Practice in 3D Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Purpose of adulteration */}
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Why Adulterators Add It:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedInfo.purposeOfAdulteration}
                  </p>
                </div>

                {/* Health hazard */}
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                    Toxicological & Health Hazards:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedInfo.healthHazard}
                  </p>
                </div>
              </div>

              {/* Chemical Mechanism */}
              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
                  Qualitative Reaction Mechanism:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedInfo.chemistryExplanation}
                </p>
              </div>

              {/* Side-by-Side Control vs Positive Visual Response */}
              <div>
                <span className="text-xs font-semibold text-white block mb-3">
                  Visual Chromatic Responses (Control vs Adulterated):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Control */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Pure Milk Control</span>
                      <div
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedInfo.negativeObservation.hexColor }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400 block">
                      {selectedInfo.controlObservation.color}
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      {selectedInfo.controlObservation.description}
                    </p>
                  </div>

                  {/* Positive */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-rose-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300">Adulterated Sample</span>
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shadow-md"
                        style={{ backgroundColor: selectedInfo.positiveObservation.hexColor }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-rose-400 block">
                      {selectedInfo.positiveObservation.color}
                    </span>
                    <p className="text-slate-400 text-[11px]">
                      {selectedInfo.positiveObservation.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Core Concepts Cards */
          <div className="grid grid-cols-1 gap-4">
            {coreConcepts.map((c, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-4 text-xs"
              >
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                  {c.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{c.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
