import { AdulterantInfo, AdulterantType, UnknownSample, LabTool } from '../types/lab';

export const ADULTERANT_DATA: Record<AdulterantType, AdulterantInfo> = {
  starch: {
    id: 'starch',
    name: 'Starch',
    chemicalFormula: '(C6H10O5)n',
    purposeOfAdulteration: 'Artificially elevates the Solids-Not-Fat (SNF) content, increases viscosity, and mimics rich, creamy milk after water dilution.',
    healthHazard: 'Can cause digestive distress, metabolic imbalance in infants, and high glycemic spikes in diabetic individuals. Often combined with unhygienic flour.',
    testName: 'Iodine Qualitative Assay',
    reagentName: '0.1N Iodine Reagent (Lugol\'s Solution)',
    reagentFormula: 'I2 + KI in H2O',
    reagentVolumeRequired: 0.5, // ~2-3 drops or 0.5 mL
    reagentDropsRequired: 3,
    milkSampleVolume: 5.0, // 5 mL
    requiresHeating: false,
    requiresMixing: true,
    mixingDurationSeconds: 4,
    reactionWaitSeconds: 3,
    controlObservation: {
      color: 'Creamy White with pale amber tinge',
      description: 'The pure milk control exhibits no deep color change; only the pale amber tint of diluted iodine is momentarily visible.',
      hasFoam: false,
    },
    positiveObservation: {
      color: 'Deep Royal Navy Blue',
      description: 'Instant formation of an intense deep navy-blue coordination complex between helical amylose polymers and triiodide ions.',
      hasFoam: false,
      hexColor: '#1e3a8a', // Blue 900
    },
    negativeObservation: {
      color: 'Creamy Pale White / Light Buff',
      description: 'No blue complex observed. Normal milk coloration remains intact.',
      hasFoam: false,
      hexColor: '#fefce8',
    },
    chemistryExplanation:
      'Starch contains linear helical amylose chains. When iodine (I3⁻) is introduced, the triiodide ion slips into the helical amylose core, causing a charge-transfer complex that absorbs all visible wavelengths except deep blue/violet (absorbance peak at ~620 nm). Pure milk lacking starch shows no reaction.'
  },

  urea: {
    id: 'urea',
    name: 'Urea',
    chemicalFormula: 'CH4N2O',
    purposeOfAdulteration: 'Artificially inflates non-protein nitrogen (NPN), falsifying protein measurements performed via traditional Kjeldahl titration methods.',
    healthHazard: 'Causes excessive strain on kidneys, digestive tract acidosis, nausea, and long-term renal toxicity.',
    testName: 'DMAB Colorimetric Test',
    reagentName: '1.6% p-Dimethylaminobenzaldehyde (DMAB Reagent)',
    reagentFormula: '(CH3)2NC6H4CHO in EtOH + HCl',
    reagentVolumeRequired: 5.0, // 5 mL
    milkSampleVolume: 5.0, // 5 mL
    requiresHeating: false,
    requiresMixing: true,
    mixingDurationSeconds: 5,
    reactionWaitSeconds: 10,
    controlObservation: {
      color: 'Pale Cream / Light Yellowish White',
      description: 'Pure natural milk (which has low physiological background urea < 20-30 mg/dL) produces only an unnoticeable slight cream/ivory tint.',
      hasFoam: false,
    },
    positiveObservation: {
      color: 'Distinct Bright Canary Yellow',
      description: 'Development of an unmistakable vivid canary yellow color within 15 seconds due to Schiff base condensation.',
      hasFoam: false,
      hexColor: '#eab308', // Amber/Yellow
    },
    negativeObservation: {
      color: 'Off-white / Soft Cream',
      description: 'No intense yellow color is formed. Sample remains within normal physiological limits.',
      hasFoam: false,
      hexColor: '#fef08a',
    },
    chemistryExplanation:
      'p-Dimethylaminobenzaldehyde (DMAB) in acidic medium reacts specifically with the amino groups of urea via electrophilic condensation to form a yellow-colored chromophore (Schiff base derivative). The intensity of the yellow color is directly proportional to the urea concentration.'
  },

  detergent: {
    id: 'detergent',
    name: 'Detergent',
    chemicalFormula: 'Surfactants (e.g., Sodium Dodecyl Sulfate / LAS)',
    purposeOfAdulteration: 'Used as an emulsifier in synthetic milk preparations to blend vegetable oil with water, giving a milky opaque appearance and neutralizing acidity.',
    healthHazard: 'Severe gastrointestinal corrosion, intestinal villi destruction, skin and mucosal irritation, chronic organ toxicity from synthetic phosphates.',
    testName: 'Surfactant Foam Stability & Dye Affinity Test',
    reagentName: 'Methylene Blue Indicator (0.1% aqueous)',
    reagentFormula: 'C16H18ClN3S',
    reagentVolumeRequired: 1.0, // 1 mL or 0.1% dye
    milkSampleVolume: 5.0, // 5 mL
    requiresHeating: false,
    requiresMixing: true,
    mixingDurationSeconds: 8, // Vigorous agitation
    reactionWaitSeconds: 5,
    controlObservation: {
      color: 'Creamy White with ephemeral surface bubbles',
      description: 'Pure milk forms a thin layer of surface air bubbles that rapidly collapse within 15-20 seconds.',
      hasFoam: false,
    },
    positiveObservation: {
      color: 'Dense Persistent Micro-Foam Column',
      description: 'Formation of a dense, resilient micro-foam column (> 15 mm) that remains stable for minutes due to lowered liquid surface tension.',
      hasFoam: true,
      hexColor: '#38bdf8', // Sky blue tint or foam
    },
    negativeObservation: {
      color: 'Creamy White',
      description: 'Surface bubbles collapse immediately upon standing; no persistent frothy meniscus.',
      hasFoam: false,
      hexColor: '#ffffff',
    },
    chemistryExplanation:
      'Synthetic detergents contain anionic surfactants (like linear alkylbenzene sulfonates) that drastically reduce the interfacial surface tension of milk water. Upon mechanical agitation, stable air-in-liquid micro-vesicles form that resist drainage. In methylene blue dye tests, anionic surfactants also form an intense blue hydrophobic complex.'
  },

  cane_sugar: {
    id: 'cane_sugar',
    name: 'Cane Sugar (Sucrose)',
    chemicalFormula: 'C12H22O11',
    purposeOfAdulteration: 'Added to diluted milk to adjust density and refractometric Brix readings without triggering low-density lactometer warnings.',
    healthHazard: 'Dangerous for individuals with lactose intolerance and diabetes; encourages rapid microbial proliferation and spoilage.',
    testName: 'Resorcinol / Seliwanoff Acid Hydrolysis Test',
    reagentName: 'Resorcinol (0.5%) + Conc. Hydrochloric Acid (HCl)',
    reagentFormula: 'C6H4(OH)2 + HCl',
    reagentVolumeRequired: 1.0, // 1 mL reagent
    milkSampleVolume: 5.0, // 5 mL
    requiresHeating: true,
    heatingDurationSeconds: 12, // In simulation, 12 seconds hot plate
    heatingTempTarget: 90, // ~90°C water bath / hot plate
    requiresMixing: true,
    mixingDurationSeconds: 4,
    reactionWaitSeconds: 6,
    controlObservation: {
      color: 'Pale Beige / Light Yellow Cream',
      description: 'Pure milk heated with resorcinol shows no deep red chromophore, maintaining normal caramelized faint cream.',
      hasFoam: false,
    },
    positiveObservation: {
      color: 'Deep Brick-Red / Burgundy Crimson',
      description: 'Appearance of a distinct, rich brick-red/deep crimson coloration upon boiling and standing for 2 minutes.',
      hasFoam: false,
      hexColor: '#991b1b', // Red 800
    },
    negativeObservation: {
      color: 'Light Cream / Straw Yellow',
      description: 'No brick-red coloration develops after heating; negative for sucrose adulteration.',
      hasFoam: false,
      hexColor: '#fef3c7',
    },
    chemistryExplanation:
      'Concentrated HCl hydrolyzes sucrose (a disaccharide) into glucose and fructose. Fructose (a ketose) rapidly dehydrates upon controlled heating to form hydroxymethylfurfural (HMF). HMF condenses with resorcinol to yield a deep brick-red condensation product. Lactose reacts much more sluggishly, yielding no red chromophore under these timed conditions.'
  },

  hydrogen_peroxide: {
    id: 'hydrogen_peroxide',
    name: 'Hydrogen Peroxide (H2O2)',
    chemicalFormula: 'H2O2',
    purposeOfAdulteration: 'Added illegally as an unapproved chemical preservative to halt microbial souring in unrefrigerated supply chains.',
    healthHazard: 'Powerful oxidant; produces reactive oxygen species that damage gastric mucosa, cause chronic gastritis, and destroy native milk vitamins (especially vitamin A and B complex).',
    testName: 'p-Phenylenediamine Peroxidase Assay',
    reagentName: '2% p-Phenylenediamine Solution',
    reagentFormula: 'C6H4(NH2)2 in aqueous solution',
    reagentVolumeRequired: 0.5, // ~5 drops or 0.5 mL
    reagentDropsRequired: 5,
    milkSampleVolume: 5.0, // 5 mL
    requiresHeating: false,
    requiresMixing: true,
    mixingDurationSeconds: 4,
    reactionWaitSeconds: 5,
    controlObservation: {
      color: 'Creamy White',
      description: 'Pure fresh milk without H2O2 remains undisturbed creamy white or pale cream.',
      hasFoam: false,
    },
    positiveObservation: {
      color: 'Deep Royal Violet / Indigo Blue',
      description: 'Immediate oxidation produces a rich dark violet/indigo discoloration throughout the milk column.',
      hasFoam: false,
      hexColor: '#4c1d95', // Violet 900
    },
    negativeObservation: {
      color: 'Normal Creamy White',
      description: 'No violet oxidation chromophore; the milk retains natural coloration.',
      hasFoam: false,
      hexColor: '#fafaf9',
    },
    chemistryExplanation:
      'Natural bovine milk contains the endogenous enzyme lactoperoxidase. When exogenous H2O2 is present, lactoperoxidase oxidizes the colorless aromatic diamine (p-Phenylenediamine) into Bandrowski\'s base—a deep violet/indigo quinonoid pigment. In pure unadulterated milk, the absence of peroxide prevents this oxidation reaction.'
  }
};

export const UNKNOWN_SAMPLES_PRESETS: UnknownSample[] = [
  {
    id: 'MILK-047',
    batchNumber: 'B-2026-081',
    source: 'Regional Dairy Hub North',
    fatPercentage: 3.1,
    snfPercentage: 8.8,
    adulterantsPresent: ['starch', 'detergent'],
    difficulty: 'standard'
  },
  {
    id: 'MILK-118',
    batchNumber: 'B-2026-112',
    source: 'Interstate Bulk Tanker 4',
    fatPercentage: 2.8,
    snfPercentage: 9.4,
    adulterantsPresent: ['urea'],
    difficulty: 'standard'
  },
  {
    id: 'MILK-205',
    batchNumber: 'B-2026-205',
    source: 'Cooperative Collection Center 9',
    fatPercentage: 3.8,
    snfPercentage: 8.5,
    adulterantsPresent: ['cane_sugar'],
    difficulty: 'standard'
  },
  {
    id: 'MILK-334',
    batchNumber: 'B-2026-334',
    source: 'Unlicensed Vendor Stall X',
    fatPercentage: 2.2,
    snfPercentage: 8.9,
    adulterantsPresent: ['hydrogen_peroxide'],
    difficulty: 'intermediate'
  },
  {
    id: 'MILK-412',
    batchNumber: 'B-2026-412',
    source: 'Certified Organic Cooperative A',
    fatPercentage: 4.2,
    snfPercentage: 8.7,
    adulterantsPresent: [], // Pure!
    difficulty: 'intermediate'
  },
  {
    id: 'MILK-559',
    batchNumber: 'B-2026-559',
    source: 'Commercial Processing Plant 3',
    fatPercentage: 2.9,
    snfPercentage: 9.1,
    adulterantsPresent: ['starch', 'cane_sugar'],
    difficulty: 'expert'
  }
];

export const STEP_DEFINITIONS = (testType: AdulterantType): Array<{
  stepNumber: number;
  title: string;
  instruction: string;
  toolRequired: LabTool;
  targetVolume?: number;
  unit?: string;
}> => {
  const testInfo = ADULTERANT_DATA[testType];
  const steps: Array<{
    stepNumber: number;
    title: string;
    instruction: string;
    toolRequired: LabTool;
    targetVolume?: number;
    unit?: string;
  }> = [
    {
      stepNumber: 1,
      title: 'Measure Milk Sample',
      instruction: `Measure exactly ${testInfo.milkSampleVolume} mL of the unknown milk sample into the measuring cylinder or pipette.`,
      toolRequired: 'milk_container' as const,
      targetVolume: testInfo.milkSampleVolume,
      unit: 'mL'
    },
    {
      stepNumber: 2,
      title: 'Transfer to Test Tube',
      instruction: `Transfer the measured ${testInfo.milkSampleVolume} mL sample into the primary test tube in the rack.`,
      toolRequired: 'test_tube' as const,
      targetVolume: testInfo.milkSampleVolume,
      unit: 'mL'
    },
    {
      stepNumber: 3,
      title: `Add ${testInfo.reagentName}`,
      instruction: `Select and introduce ${testInfo.reagentVolumeRequired} mL of ${testInfo.reagentName} into the test tube.`,
      toolRequired: 'reagent_bottle' as const,
      targetVolume: testInfo.reagentVolumeRequired,
      unit: 'mL'
    },
    {
      stepNumber: 4,
      title: 'Mix Thoroughly',
      instruction: 'Agitate or swirl the test tube to ensure homogeneous distribution of the reagent.',
      toolRequired: 'test_tube' as const,
      targetVolume: undefined,
      unit: undefined
    }
  ];

  if (testInfo.requiresHeating) {
    steps.push({
      stepNumber: 5,
      title: 'Controlled Heating',
      instruction: `Place test tube on the regulated hot plate / water bath for ~${testInfo.heatingDurationSeconds} seconds until reaction threshold reached.`,
      toolRequired: 'hot_plate' as const,
      targetVolume: undefined,
      unit: undefined
    });
    steps.push({
      stepNumber: 6,
      title: 'Observe & Record Observation',
      instruction: 'Observe the simulated colorimetric change or precipitate, then record your findings in the electronic lab notebook.',
      toolRequired: 'timer' as const,
      targetVolume: undefined,
      unit: undefined
    });
  } else {
    steps.push({
      stepNumber: 5,
      title: 'Observe & Record Observation',
      instruction: 'Observe the simulated reaction or foam formation, then record your findings in the electronic lab notebook.',
      toolRequired: 'timer' as const,
      targetVolume: undefined,
      unit: undefined
    });
  }

  return steps;
};
