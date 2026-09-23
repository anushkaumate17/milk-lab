import { 
  AdulterantType, 
  ExperimentState, 
  ExperimentMistake, 
  ExperimentLogEntry,
  EvaluationScore,
  UnknownSample,
  NotebookObservation 
} from '../types/lab';
import { ADULTERANT_DATA } from './adulterationData';

export function createInitialExperimentState(testType: AdulterantType, sampleId: string): ExperimentState {
  return {
    currentTest: testType,
    sampleId,
    isControlMode: false,
    currentStepIndex: 0,
    
    measuringCylinderMilkVolume: 0,
    pipetteLiquidVolume: 0,
    pipetteLiquidType: 'empty',
    
    testTubeMilkVolume: 0,
    testTubeReagentVolume: 0,
    
    controlTubeMilkVolume: 0,
    controlTubeReagentVolume: 0,
    
    sampleCollected: false,
    volumeCorrect: false,
    reagentAdded: false,
    reagentCorrect: false,
    mixed: false,
    mixingProgress: 0,
    heated: false,
    heatingSeconds: 0,
    currentTemperature: 24, // room temp
    reactionWaitElapsed: 0,
    reactionComplete: false,
    reactionProgress: 0,
    
    liquidColor: '#fafaf9', // normal milk creamy white
    controlLiquidColor: '#fafaf9',
    foamHeight: 0,
    bubbleActivity: 0,
    isHotPlateActive: false,
    isTimerRunning: false,
    timerElapsedSeconds: 0,
    
    mistakes: [],
    logs: [
      {
        id: Math.random().toString(),
        timestamp: Date.now(),
        type: 'info',
        message: `Assay initialized: ${ADULTERANT_DATA[testType].testName} for sample ${sampleId}.`
      }
    ],
    observationRecorded: false
  };
}

export class ExperimentEngine {
  public state: ExperimentState;
  public sample: UnknownSample;

  constructor(state: ExperimentState, sample: UnknownSample) {
    this.state = { ...state };
    this.sample = sample;
  }

  private addLog(type: ExperimentLogEntry['type'], message: string) {
    this.state.logs = [
      ...this.state.logs,
      {
        id: Math.random().toString(),
        timestamp: Date.now(),
        type,
        message
      }
    ];
  }

  private addMistake(
    type: ExperimentMistake['type'],
    title: string,
    description: string,
    penaltyPoints: number
  ) {
    const mistake: ExperimentMistake = {
      id: Math.random().toString(),
      timestamp: Date.now(),
      stepNumber: this.state.currentStepIndex + 1,
      type,
      title,
      description,
      penaltyPoints
    };
    this.state.mistakes = [...this.state.mistakes, mistake];
    this.addLog('warning', `⚠ ${title}: ${description}`);
  }

  // Action: Measure Milk Sample
  public measureSample(volume: number) {
    const testInfo = ADULTERANT_DATA[this.state.currentTest];
    const target = testInfo.milkSampleVolume;
    const tolerance = 0.5; // ±0.5 mL

    this.state.measuringCylinderMilkVolume = volume;
    this.state.sampleCollected = true;

    if (Math.abs(volume - target) <= tolerance) {
      this.state.volumeCorrect = true;
      this.addLog('success', `✓ Measured ${volume.toFixed(1)} mL milk sample (Target: ${target} mL).`);
      if (this.state.currentStepIndex === 0) {
        this.state.currentStepIndex = 1;
      }
    } else {
      this.state.volumeCorrect = false;
      this.addMistake(
        'measurement',
        'Volume Deviation',
        `Measured ${volume.toFixed(1)} mL, but experimental protocol requires ${target} mL (±${tolerance} mL).`,
        5
      );
    }
    return this.state;
  }

  // Action: Transfer Milk to Test Tube
  public transferSampleToTube() {
    if (!this.state.sampleCollected || this.state.measuringCylinderMilkVolume <= 0) {
      this.addMistake(
        'sequence',
        'Cylinder Empty',
        'Attempted to transfer milk before measuring from the sample container.',
        6
      );
      return this.state;
    }

    const volume = this.state.measuringCylinderMilkVolume;
    this.state.testTubeMilkVolume = volume;
    this.state.controlTubeMilkVolume = volume; // control also gets same pure baseline
    this.state.measuringCylinderMilkVolume = 0;

    this.addLog('success', `✓ Transferred ${volume.toFixed(1)} mL milk sample into test tube.`);
    if (this.state.currentStepIndex === 1) {
      this.state.currentStepIndex = 2;
    }
    return this.state;
  }

  // Action: Pipette Reagent Selection and Suction
  public fillPipetteWithReagent(reagentType: AdulterantType, volume: number) {
    this.state.pipetteLiquidType = 'reagent';
    this.state.pipetteReagentId = reagentType;
    this.state.pipetteLiquidVolume = volume;
    this.addLog('info', `Pipette loaded with ${volume.toFixed(1)} mL of ${ADULTERANT_DATA[reagentType].reagentName}.`);
    return this.state;
  }

  // Action: Dispense Reagent into Test Tube
  public dispenseReagent(reagentType: AdulterantType, volume: number) {
    const testInfo = ADULTERANT_DATA[this.state.currentTest];

    // Check Sequence: Milk must already be transferred
    if (this.state.testTubeMilkVolume <= 0) {
      this.addMistake(
        'sequence',
        'Premature Reagent Addition',
        'Reagent added to empty test tube. The milk sample must be introduced first to prevent chemical wall residue.',
        8
      );
    }

    // Check Reagent Correctness
    if (reagentType !== this.state.currentTest) {
      this.addMistake(
        'reagent',
        'Wrong Chemical Reagent',
        `Introduced ${ADULTERANT_DATA[reagentType].reagentName} instead of required ${testInfo.reagentName} for ${testInfo.testName}.`,
        12
      );
      this.state.reagentCorrect = false;
    } else {
      this.state.reagentCorrect = true;
    }

    // Check Reagent Volume
    const targetVol = testInfo.reagentVolumeRequired;
    const volTolerance = testInfo.reagentDropsRequired ? 0.3 : 0.8;
    if (Math.abs(volume - targetVol) > volTolerance) {
      this.addMistake(
        'measurement',
        'Reagent Volume Inaccuracy',
        `Dispensed ${volume.toFixed(1)} mL of reagent, protocol specifies ${targetVol} mL.`,
        4
      );
    }

    this.state.testTubeReagentVolume = volume;
    this.state.testTubeReagentType = reagentType;
    this.state.controlTubeReagentVolume = volume;
    this.state.reagentAdded = true;
    this.state.pipetteLiquidVolume = 0;
    this.state.pipetteLiquidType = 'empty';

    this.addLog('success', `✓ Dispensed ${volume.toFixed(1)} mL ${ADULTERANT_DATA[reagentType].reagentName} into test tube.`);

    if (this.state.currentStepIndex <= 2) {
      this.state.currentStepIndex = 3;
    }

    return this.state;
  }

  // Action: Agitate / Mix
  public agitateSample(durationSeconds: number) {
    const testInfo = ADULTERANT_DATA[this.state.currentTest];

    if (!this.state.reagentAdded) {
      this.addMistake(
        'sequence',
        'Agitation Prior to Reagent',
        'Sample mixed before adding reagent. Mixing is only useful after combining reactants.',
        4
      );
      return this.state;
    }

    const requiredDuration = testInfo.mixingDurationSeconds || 4;
    this.state.mixingProgress = Math.min(100, Math.round((durationSeconds / requiredDuration) * 100));

    if (durationSeconds < requiredDuration * 0.75) {
      this.addMistake(
        'timing',
        'Insufficient Agitation',
        `Mixed for only ${durationSeconds.toFixed(1)}s (protocol dictates ${requiredDuration}s). Reactants may remain unhomogenized.`,
        3
      );
    } else {
      this.state.mixed = true;
      this.addLog('success', `✓ Sample agitated and thoroughly mixed (${durationSeconds.toFixed(1)}s).`);
    }

    // Special behavior for detergent: mechanical agitation generates foam!
    const isAdulterated = this.sample.adulterantsPresent.includes(this.state.currentTest);
    if (this.state.currentTest === 'detergent' && this.state.reagentCorrect) {
      if (isAdulterated) {
        this.state.foamHeight = 0.85; // High stable foam
        this.state.bubbleActivity = 0.9;
      } else {
        this.state.foamHeight = 0.15; // Ephemeral thin film
        this.state.bubbleActivity = 0.2;
      }
    }

    if (testInfo.requiresHeating) {
      if (this.state.currentStepIndex === 3) this.state.currentStepIndex = 4;
    } else {
      if (this.state.currentStepIndex === 3) this.state.currentStepIndex = 4;
    }

    this.evaluateReactionState();
    return this.state;
  }

  // Action: Heat on Hot Plate
  public heatSample(durationSeconds: number, targetTemp = 90) {
    const testInfo = ADULTERANT_DATA[this.state.currentTest];

    if (!testInfo.requiresHeating) {
      this.addMistake(
        'heating',
        'Unnecessary Heating',
        `${testInfo.testName} is a room-temperature assay. Heat can denature milk proteins and invalidate results.`,
        6
      );
    }

    if (!this.state.mixed) {
      this.addMistake(
        'sequence',
        'Heating Unmixed Reactants',
        'Heating initiated prior to proper mixing, creating localized thermal degradation.',
        5
      );
    }

    this.state.heatingSeconds += durationSeconds;
    this.state.currentTemperature = Math.min(98, 24 + durationSeconds * 5.5);
    this.state.heated = true;

    this.addLog('info', `Heated sample to ~${Math.round(this.state.currentTemperature)}°C for ${durationSeconds} seconds.`);

    const requiredDuration = testInfo.heatingDurationSeconds || 10;
    if (this.state.heatingSeconds < requiredDuration * 0.7) {
      this.addMistake(
        'heating',
        'Underheating',
        `Sample heated for ${this.state.heatingSeconds}s; needs at least ${requiredDuration}s to hydrolyze and condense chromophore.`,
        4
      );
    }

    if (this.state.currentStepIndex === 4 && testInfo.requiresHeating) {
      this.state.currentStepIndex = 5;
    }

    this.evaluateReactionState();
    return this.state;
  }

  // Evaluate visible reaction
  public evaluateReactionState() {
    const testInfo = ADULTERANT_DATA[this.state.currentTest];
    const isAdulterated = this.sample.adulterantsPresent.includes(this.state.currentTest);

    // If wrong reagent was used, reaction won't proceed properly
    if (!this.state.reagentCorrect) {
      this.state.liquidColor = '#f1f5f9'; // dull inert grayish
      this.state.reactionComplete = true;
      this.state.reactionProgress = 100;
      return;
    }

    // Check if required heating step was satisfied if test requires heating
    if (testInfo.requiresHeating && (!this.state.heated || this.state.currentTemperature < 60)) {
      this.state.liquidColor = '#fefce8';
      this.state.reactionProgress = 30;
      return;
    }

    // Reaction occurs!
    this.state.reactionComplete = true;
    this.state.reactionProgress = 100;

    if (isAdulterated) {
      this.state.liquidColor = testInfo.positiveObservation.hexColor;
      if (testInfo.positiveObservation.hasFoam) {
        this.state.foamHeight = 0.9;
      }
    } else {
      this.state.liquidColor = testInfo.negativeObservation.hexColor;
      if (testInfo.negativeObservation.hasFoam) {
        this.state.foamHeight = 0.1;
      }
    }

    // Control is always negative (pure milk)
    this.state.controlLiquidColor = testInfo.negativeObservation.hexColor;
  }

  // Action: Wash and Reset Test Tube
  public washTestTube() {
    this.state.testTubeMilkVolume = 0;
    this.state.testTubeReagentVolume = 0;
    this.state.controlTubeMilkVolume = 0;
    this.state.controlTubeReagentVolume = 0;
    this.state.sampleCollected = false;
    this.state.volumeCorrect = false;
    this.state.reagentAdded = false;
    this.state.reagentCorrect = false;
    this.state.mixed = false;
    this.state.heated = false;
    this.state.currentTemperature = 24;
    this.state.reactionComplete = false;
    this.state.reactionProgress = 0;
    this.state.liquidColor = '#fafaf9';
    this.state.foamHeight = 0;
    this.state.bubbleActivity = 0;
    this.state.currentStepIndex = 0;
    this.addLog('info', 'Test tube contents emptied into waste receptacle and flushed with distilled water.');
    return this.state;
  }

  // Calculate final score
  public static calculateChallengeScore(
    sample: UnknownSample,
    observations: NotebookObservation[],
    diagnosedAdulterants: AdulterantType[],
    mistakes: ExperimentMistake[],
    timeSpentSeconds: number
  ): EvaluationScore {
    // 1. Scientific Accuracy (Max 50 points)
    // Compare diagnosedAdulterants against sample.adulterantsPresent
    const actual = new Set(sample.adulterantsPresent);
    const diagnosed = new Set(diagnosedAdulterants);

    let correctMatches = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    const allTypes: AdulterantType[] = ['starch', 'urea', 'detergent', 'cane_sugar', 'hydrogen_peroxide'];
    
    allTypes.forEach(t => {
      const isActual = actual.has(t);
      const isDiagnosed = diagnosed.has(t);
      if (isActual && isDiagnosed) correctMatches++;
      else if (!isActual && !isDiagnosed) correctMatches++;
      else if (!isActual && isDiagnosed) falsePositives++;
      else if (isActual && !isDiagnosed) falseNegatives++;
    });

    const matchRatio = correctMatches / allTypes.length;
    const scientificAccuracy = Math.max(0, Math.round(matchRatio * 50));
    const diagnosisCorrect = falsePositives === 0 && falseNegatives === 0;

    // 2. Procedural Accuracy (Max 30 points)
    // Start at 30, subtract penalties from mistakes
    let totalPenalties = 0;
    mistakes.forEach(m => {
      totalPenalties += m.penaltyPoints;
    });
    const proceduralAccuracy = Math.max(0, Math.min(30, 30 - Math.round(totalPenalties * 0.8)));

    // 3. Observation Accuracy (Max 20 points)
    // Check notebook entries for accuracy against reality
    let validObservationsCount = 0;
    const sampleObs = observations.filter(o => o.sampleId === sample.id);
    
    if (sampleObs.length > 0) {
      sampleObs.forEach(obs => {
        const isActuallyPresent = actual.has(obs.testId);
        const expectedVerdict = isActuallyPresent ? 'positive' : 'negative';
        if (obs.verdict === expectedVerdict) {
          validObservationsCount++;
        }
      });
      const obsRatio = validObservationsCount / Math.max(sampleObs.length, 1);
      var observationAccuracy = Math.round(obsRatio * 20);
    } else {
      var observationAccuracy = 0;
    }

    const totalScore = scientificAccuracy + proceduralAccuracy + observationAccuracy;

    return {
      sampleId: sample.id,
      scientificAccuracy,
      proceduralAccuracy,
      observationAccuracy,
      totalScore,
      testsCompletedCount: sampleObs.length,
      mistakesCount: mistakes.length,
      mistakes,
      detectedAdulterants: diagnosedAdulterants,
      actualAdulterants: sample.adulterantsPresent,
      diagnosisCorrect,
      timeSpentSeconds
    };
  }
}
