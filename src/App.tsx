import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AdulterantType, 
  LabTool, 
  ExperimentState, 
  UnknownSample, 
  NotebookObservation, 
  EvaluationScore,
  ExperimentMistake
} from './types/lab';
import { UNKNOWN_SAMPLES_PRESETS, ADULTERANT_DATA } from './lib/adulterationData';
import { ExperimentEngine, createInitialExperimentState } from './lib/experimentEngine';
import { storage } from './lib/storage';
import { Navbar, NavTab } from './components/layout/Navbar';
import { LabCanvas } from './components/laboratory/3d/LabCanvas';
import { ProcedurePanel } from './components/laboratory/ProcedurePanel';
import { EquipmentPanel } from './components/laboratory/EquipmentPanel';
import { MistakeBanner } from './components/laboratory/MistakeBanner';
import { ExperimentLogDrawer } from './components/laboratory/ExperimentLogDrawer';
import { ObservationModal } from './components/laboratory/ObservationModal';
import { ChallengeDashboard } from './components/challenge/ChallengeDashboard';
import { ResultsDashboard } from './components/results/ResultsDashboard';
import { LabNotebook } from './components/notebook/LabNotebook';
import { LearnMode } from './components/learn/LearnMode';
import { LandingHero } from './components/landing/LandingHero';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab | 'landing'>('landing');

  // Active Sample
  const [currentSample, setCurrentSample] = useState<UnknownSample>(() => {
    return storage.getCurrentSample();
  });

  // Current Target Test
  const [currentTest, setCurrentTest] = useState<AdulterantType>('starch');

  // Experiment State
  const [experimentState, setExperimentState] = useState<ExperimentState>(() => {
    return createInitialExperimentState('starch', currentSample.id);
  });

  // Active Tool selection
  const [selectedTool, setSelectedTool] = useState<LabTool>('milk_container');

  // Observation Modal
  const [isObsModalOpen, setIsObsModalOpen] = useState<boolean>(false);

  // Observations list
  const [observations, setObservations] = useState<NotebookObservation[]>(() => {
    return storage.getObservations();
  });

  // Evaluation Score
  const [latestScore, setLatestScore] = useState<EvaluationScore | null>(null);

  // Latest Mistake for Floating Toast
  const [latestMistake, setLatestMistake] = useState<ExperimentMistake | undefined>(undefined);

  // Physical animation flags for 3D
  const [isMixingActive, setIsMixingActive] = useState<boolean>(false);
  const [isHotPlateActive, setIsHotPlateActive] = useState<boolean>(false);

  // Sync sample change
  const handleSelectSample = (sample: UnknownSample) => {
    setCurrentSample(sample);
    storage.setCurrentSample(sample);
    setExperimentState(createInitialExperimentState(currentTest, sample.id));
  };

  // Sync test change
  const handleSelectTest = (test: AdulterantType) => {
    setCurrentTest(test);
    setExperimentState(createInitialExperimentState(test, currentSample.id));
  };

  // Engine helper
  const runEngineAction = useCallback(
    (actionFn: (engine: ExperimentEngine) => ExperimentState) => {
      setExperimentState((prev) => {
        const engine = new ExperimentEngine(prev, currentSample);
        const next = actionFn(engine);
        // Check if new mistake was logged
        if (next.mistakes.length > prev.mistakes.length) {
          const newest = next.mistakes[next.mistakes.length - 1];
          setLatestMistake(newest);
        }
        return { ...next };
      });
    },
    [currentSample]
  );

  // Lab Actions
  const handleMeasureSample = useCallback(
    (vol: number) => {
      runEngineAction((engine) => engine.measureSample(vol));
    },
    [runEngineAction]
  );

  const handleTransferSample = useCallback(() => {
    runEngineAction((engine) => engine.transferSampleToTube());
  }, [runEngineAction]);

  const handleDispenseReagent = useCallback(
    (reagentType: AdulterantType, vol: number) => {
      runEngineAction((engine) => engine.dispenseReagent(reagentType, vol));
    },
    [runEngineAction]
  );

  const handleAgitate = useCallback(
    (seconds: number) => {
      setIsMixingActive(true);
      setTimeout(() => {
        setIsMixingActive(false);
      }, seconds * 1000);

      runEngineAction((engine) => engine.agitateSample(seconds));
    },
    [runEngineAction]
  );

  const handleHeat = useCallback(
    (seconds: number) => {
      setIsHotPlateActive(true);
      setTimeout(() => {
        setIsHotPlateActive(false);
      }, seconds * 1000);

      runEngineAction((engine) => engine.heatSample(seconds));
    },
    [runEngineAction]
  );

  const handleWashTube = useCallback(() => {
    runEngineAction((engine) => engine.washTestTube());
  }, [runEngineAction]);

  const handleToggleControlMode = useCallback(() => {
    setExperimentState((prev) => ({
      ...prev,
      isControlMode: !prev.isControlMode,
    }));
  }, []);

  const handleResetBench = useCallback(() => {
    setExperimentState(createInitialExperimentState(currentTest, currentSample.id));
    setLatestMistake(undefined);
  }, [currentTest, currentSample.id]);

  // Object Click in 3D Scene
  const handleSceneObjectClick = useCallback(
    (tool: LabTool, meta?: { reagentType?: AdulterantType }) => {
      setSelectedTool(tool);

      if (tool === 'milk_container') {
        const targetVol = ADULTERANT_DATA[experimentState.currentTest].milkSampleVolume;
        handleMeasureSample(targetVol);
      } else if (tool === 'measuring_cylinder') {
        handleTransferSample();
      } else if (tool === 'reagent_bottle' && meta?.reagentType) {
        const info = ADULTERANT_DATA[meta.reagentType];
        handleDispenseReagent(meta.reagentType, info.reagentVolumeRequired);
      } else if (tool === 'test_tube') {
        // If reagent added, agitate
        if (experimentState.reagentAdded && !experimentState.mixed) {
          handleAgitate(ADULTERANT_DATA[experimentState.currentTest].mixingDurationSeconds || 5);
        } else if (experimentState.reactionComplete) {
          setIsObsModalOpen(true);
        }
      } else if (tool === 'hot_plate') {
        handleHeat(ADULTERANT_DATA[experimentState.currentTest].heatingDurationSeconds || 10);
      } else if (tool === 'waste_beaker') {
        handleWashTube();
      }
    },
    [
      experimentState.currentTest,
      experimentState.reagentAdded,
      experimentState.mixed,
      experimentState.reactionComplete,
      handleMeasureSample,
      handleTransferSample,
      handleDispenseReagent,
      handleAgitate,
      handleHeat,
      handleWashTube,
    ]
  );

  // Save Notebook Observation
  const handleSaveObservation = (obs: NotebookObservation) => {
    storage.saveObservation(obs);
    setObservations(storage.getObservations());
    setExperimentState((prev) => ({
      ...prev,
      observationRecorded: true,
      logs: [
        ...prev.logs,
        {
          id: Math.random().toString(),
          timestamp: Date.now(),
          type: 'success',
          message: `✓ Recorded qualitative observation for ${obs.testName} (${obs.verdict.toUpperCase()}).`,
        },
      ],
    }));
  };

  // Submit Final Diagnosis in Challenge
  const handleSubmitDiagnosis = (score: EvaluationScore) => {
    storage.saveScore(score);
    setLatestScore(score);
    setActiveTab('results');
  };

  // Try Next Sample
  const handleTryNextSample = () => {
    const currentIndex = UNKNOWN_SAMPLES_PRESETS.findIndex((s) => s.id === currentSample.id);
    const nextIndex = (currentIndex + 1) % UNKNOWN_SAMPLES_PRESETS.length;
    const nextSample = UNKNOWN_SAMPLES_PRESETS[nextIndex];
    handleSelectSample(nextSample);
    setActiveTab('challenge');
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab === 'landing' ? 'lab' : activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        currentSample={currentSample}
        onResetBench={handleResetBench}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 w-full h-[calc(100vh-3.5rem)] relative overflow-hidden">
        {/* LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingHero
            onEnterLab={() => setActiveTab('lab')}
            onEnterChallenge={() => setActiveTab('challenge')}
            onLearnFirst={() => setActiveTab('learn')}
          />
        )}

        {/* 3D VIRTUAL LAB SCREEN */}
        {activeTab === 'lab' && (
          <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden relative">
            {/* Left: Procedure & Protocol Panel (Desktop 320px) */}
            <div className="w-full lg:w-80 h-64 lg:h-full shrink-0 z-10 order-2 lg:order-1">
              <ProcedurePanel
                state={experimentState}
                onSelectTest={handleSelectTest}
                onOpenObservationModal={() => setIsObsModalOpen(true)}
              />
            </div>

            {/* Center: 3D WebGL Canvas */}
            <div className="flex-1 h-full relative order-1 lg:order-2 overflow-hidden bg-slate-950">
              <LabCanvas
                testTubeMilkVolume={experimentState.testTubeMilkVolume}
                testTubeReagentVolume={experimentState.testTubeReagentVolume}
                liquidColor={experimentState.liquidColor}
                controlLiquidColor={experimentState.controlLiquidColor}
                foamHeight={experimentState.foamHeight}
                isHotPlateActive={isHotPlateActive}
                isMixing={isMixingActive}
                measuringCylinderMilkVolume={experimentState.measuringCylinderMilkVolume}
                pipetteLiquidVolume={experimentState.pipetteLiquidVolume}
                isControlMode={experimentState.isControlMode}
                onObjectClick={handleSceneObjectClick}
              />

              {/* Mistake Alert Banner */}
              <MistakeBanner
                latestMistake={latestMistake}
                logs={experimentState.logs}
                onDismissMistake={() => setLatestMistake(undefined)}
              />

              {/* Real-time Experiment Audit Log Drawer */}
              <ExperimentLogDrawer
                logs={experimentState.logs}
                mistakes={experimentState.mistakes}
              />
            </div>

            {/* Right: Equipment, Inventory & Volumetric Controls (Desktop 340px) */}
            <div className="w-full lg:w-84 h-72 lg:h-full shrink-0 z-10 order-3">
              <EquipmentPanel
                state={experimentState}
                selectedTool={selectedTool}
                onSelectTool={setSelectedTool}
                onMeasureSample={handleMeasureSample}
                onTransferSample={handleTransferSample}
                onDispenseReagent={handleDispenseReagent}
                onAgitate={handleAgitate}
                onHeat={handleHeat}
                onWashTube={handleWashTube}
                isControlMode={experimentState.isControlMode}
                onToggleControlMode={handleToggleControlMode}
              />
            </div>
          </div>
        )}

        {/* CHALLENGE DASHBOARD */}
        {activeTab === 'challenge' && (
          <ChallengeDashboard
            currentSample={currentSample}
            onSelectSample={handleSelectSample}
            observations={observations}
            onStartAssay={(test) => {
              handleSelectTest(test);
              setActiveTab('lab');
            }}
            onSubmitFinalDiagnosis={handleSubmitDiagnosis}
          />
        )}

        {/* LAB NOTEBOOK (ELN) */}
        {activeTab === 'notebook' && (
          <LabNotebook
            observations={observations}
            onClearNotebook={() => {
              storage.clearObservations();
              setObservations([]);
            }}
            onGoToLab={() => setActiveTab('lab')}
          />
        )}

        {/* LEARN THEORY MODE */}
        {activeTab === 'learn' && (
          <LearnMode
            onEnterLab={(test) => {
              if (test) handleSelectTest(test);
              setActiveTab('lab');
            }}
          />
        )}

        {/* RESULTS & PERFORMANCE EVALUATION */}
        {activeTab === 'results' && (
          <ResultsDashboard
            score={latestScore}
            currentSample={currentSample}
            observations={observations}
            onTryNextSample={handleTryNextSample}
            onReturnToLab={() => setActiveTab('lab')}
          />
        )}
      </main>

      {/* Observation Modal */}
      <ObservationModal
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        state={experimentState}
        sample={currentSample}
        onSaveObservation={handleSaveObservation}
      />
    </div>
  );
}
