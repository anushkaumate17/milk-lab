/**
 * Types and interfaces for MilkSafe 3D Lab
 */

export type AdulterantType = 
  | 'starch'
  | 'urea'
  | 'detergent'
  | 'cane_sugar'
  | 'hydrogen_peroxide';

export interface AdulterantInfo {
  id: AdulterantType;
  name: string;
  chemicalFormula?: string;
  purposeOfAdulteration: string; // Why it is illegally added
  healthHazard: string;
  testName: string;
  reagentName: string;
  reagentFormula?: string;
  reagentVolumeRequired: number; // in mL
  reagentDropsRequired?: number; // e.g., 3 drops
  milkSampleVolume: number; // in mL
  requiresHeating: boolean;
  heatingDurationSeconds?: number;
  heatingTempTarget?: number; // in Celsius
  requiresMixing: boolean;
  mixingDurationSeconds?: number;
  reactionWaitSeconds: number;
  controlObservation: {
    color: string;
    description: string;
    hasFoam?: boolean;
  };
  positiveObservation: {
    color: string;
    description: string;
    hasFoam?: boolean;
    hexColor: string;
  };
  negativeObservation: {
    color: string;
    description: string;
    hasFoam?: boolean;
    hexColor: string;
  };
  chemistryExplanation: string;
}

export type LabTool = 
  | 'none'
  | 'pipette'
  | 'measuring_cylinder'
  | 'test_tube'
  | 'reagent_bottle'
  | 'milk_container'
  | 'hot_plate'
  | 'timer'
  | 'waste_beaker';

export interface UnknownSample {
  id: string; // e.g. "MILK-047"
  batchNumber: string;
  source: string; // e.g., "Dairy Supply Depot B"
  fatPercentage: number;
  snfPercentage: number;
  adulterantsPresent: AdulterantType[]; // Array, can be empty (pure) or have 1 or more
  difficulty: 'standard' | 'intermediate' | 'expert';
}

export interface ExperimentMistake {
  id: string;
  timestamp: number;
  stepNumber: number;
  type: 'sequence' | 'measurement' | 'reagent' | 'heating' | 'timing' | 'safety';
  title: string;
  description: string;
  penaltyPoints: number;
}

export interface ExperimentLogEntry {
  id: string;
  timestamp: number;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

export interface ExperimentStep {
  stepNumber: number;
  title: string;
  instruction: string;
  toolRequired: LabTool;
  targetVolume?: number;
  unit?: string;
  completed: boolean;
}

export interface ExperimentState {
  currentTest: AdulterantType;
  sampleId: string;
  isControlMode: boolean; // compare pure control vs test sample side-by-side
  currentStepIndex: number;
  
  // Volumes currently in vessels
  measuringCylinderMilkVolume: number; // in mL
  pipetteLiquidVolume: number; // in mL
  pipetteLiquidType: 'milk' | 'reagent' | 'empty';
  pipetteReagentId?: AdulterantType;
  
  testTubeMilkVolume: number; // in mL
  testTubeReagentVolume: number; // in mL
  testTubeReagentType?: AdulterantType;
  
  controlTubeMilkVolume: number;
  controlTubeReagentVolume: number;
  
  // Process flags
  sampleCollected: boolean;
  volumeCorrect: boolean;
  reagentAdded: boolean;
  reagentCorrect: boolean;
  mixed: boolean;
  mixingProgress: number; // 0 to 100
  heated: boolean;
  heatingSeconds: number;
  currentTemperature: number; // in Celsius
  reactionWaitElapsed: number; // in seconds
  reactionComplete: boolean;
  reactionProgress: number; // 0 to 100
  
  // Animation / Visual states
  liquidColor: string;
  controlLiquidColor: string;
  foamHeight: number; // 0 to 1
  bubbleActivity: number; // 0 to 1
  isHotPlateActive: boolean;
  isTimerRunning: boolean;
  timerElapsedSeconds: number;
  
  // Evaluation
  mistakes: ExperimentMistake[];
  logs: ExperimentLogEntry[];
  observationRecorded: boolean;
  recordedObservation?: {
    observedColor: string;
    hasFoam: boolean;
    resultVerdict: 'positive' | 'negative';
    confidence: number;
  };
}

export interface NotebookObservation {
  id: string;
  timestamp: number;
  sampleId: string;
  testId: AdulterantType;
  testName: string;
  reagentUsed: string;
  milkVolumeUsed: number;
  reagentVolumeUsed: number;
  observedColor: string;
  observedFoam: boolean;
  observedDescription: string;
  verdict: 'positive' | 'negative';
  correctVerdict: 'positive' | 'negative';
  isScientificallyAccurate: boolean;
}

export interface EvaluationScore {
  sampleId: string;
  scientificAccuracy: number; // 0 - 50
  proceduralAccuracy: number; // 0 - 30
  observationAccuracy: number; // 0 - 20
  totalScore: number; // 0 - 100
  testsCompletedCount: number;
  mistakesCount: number;
  mistakes: ExperimentMistake[];
  detectedAdulterants: AdulterantType[];
  actualAdulterants: AdulterantType[];
  diagnosisCorrect: boolean;
  timeSpentSeconds: number;
}
