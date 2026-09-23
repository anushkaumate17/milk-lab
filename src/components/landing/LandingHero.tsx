import React from 'react';
import { 
  FlaskConical, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface LandingHeroProps {
  onEnterLab: () => void;
  onEnterChallenge: () => void;
  onLearnFirst: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterLab,
  onEnterChallenge,
  onLearnFirst,
}) => {
  const features = [
    {
      title: 'Interactive 3D Virtual Bench',
      description: 'Interact with realistic test-tube racks, pipettes, graduated cylinders, reagent bottles, and glowing hot plates.',
      icon: <FlaskConical className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: 'Procedural Accuracy Engine',
      description: 'Rule-based state machine validates correct reagent sequence, exact volumetric tolerance, and thermal incubation.',
      icon: <Sliders className="w-5 h-5 text-blue-400" />,
    },
    {
      title: 'Dual Control vs Test Stand',
      description: 'Side-by-side comparison of certified pure milk against suspect samples to discern subtle qualitative chromophores.',
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: 'Unknown Forensic Challenge',
      description: 'Receive blind industrial samples (e.g. MILK-047) and determine multi-adulterant presence under exam conditions.',
      icon: <HelpCircle className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Real-Time Mistake Auditing',
      description: 'Instant feedback on inverted procedural steps, under-heating, or inaccurate dispensing volumes.',
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
    },
    {
      title: 'Triple-Tier Rubric Analytics',
      description: 'Comprehensive scoring covering scientific accuracy (50%), procedural rigor (30%), and notebook precision (20%).',
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 flex justify-center">
      <div className="max-w-5xl w-full p-6 md:p-10 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Virtual Food Safety & Dairy Engineering Laboratory</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white max-w-3xl mx-auto leading-tight">
            MilkSafe 3D Lab
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Interactive qualitative chemical simulation for milk adulteration detection. Investigate unknown market samples, master procedural sequences, and uncover illegal adulterants in an immersive WebGL environment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onEnterLab}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg shadow-cyan-950/60 transition-all flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Enter Virtual 3D Lab</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onEnterChallenge}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-lg border border-slate-700 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Start Unknown Challenge</span>
            </button>

            <button
              onClick={onLearnFirst}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs rounded-lg border border-slate-800 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Learn Theory First</span>
            </button>
          </div>
        </div>

        {/* 3D Lab Interactive Teaser Banner */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-950 p-6 md:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block">
                Educational Simulation Platform
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display">
                5 Standard FSSAI Qualitative Assays
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replicate authentic laboratory assays for <strong>Starch</strong> (Iodine test), <strong>Urea</strong> (DMAB test), <strong>Detergent</strong> (shake foam stability), <strong>Cane Sugar</strong> (Resorcinol acid hydrolysis with hot plate), and <strong>Hydrogen Peroxide</strong> (p-Phenylenediamine oxidation).
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Starch', 'Urea', 'Detergent', 'Cane Sugar', 'H₂O₂'].map((item) => (
                  <span
                    key={item}
                    className="text-[11px] font-mono bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-slate-300"
                  >
                    ✓ {item} Assay
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/80 space-y-3 text-xs">
              <span className="font-semibold text-slate-200 block text-xs">
                Simulated Forensic Workflow:
              </span>
              <div className="space-y-2 text-slate-400 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    1
                  </span>
                  <span>Select unknown sample (e.g. MILK-047)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    2
                  </span>
                  <span>Measure volumes with graduated cylinder</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    3
                  </span>
                  <span>Dispense colorimetric reagents in order</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    4
                  </span>
                  <span>Mix or heat to observe color change</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center font-mono font-bold text-[10px]">
                    5
                  </span>
                  <span>Record in ELN & submit forensic diagnosis</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white font-display">
              Designed for Rigorous Engineering & Food-Safety Training
            </h3>
            <p className="text-xs text-slate-400">
              Not a passive video or static checklist: an active 3D procedural sandbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all space-y-2 text-xs"
              >
                <div className="p-2 w-fit rounded-lg bg-slate-950 border border-slate-800">
                  {f.icon}
                </div>
                <h4 className="text-sm font-semibold text-white">{f.title}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Educational Disclaimer (Section 24) */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed text-center">
          <strong className="text-slate-400">Educational Notice: </strong>
          MilkSafe 3D Lab is an interactive virtual academic simulation designed for university engineering, dairy technology, and food-safety curricula. It does not replace certified laboratory testing apparatus or physical regulatory inspections. Always follow strict laboratory safety protocols under expert supervision when working with real reagents.
        </div>
      </div>
    </div>
  );
};
