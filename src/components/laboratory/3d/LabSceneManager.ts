import * as THREE from 'three';
import { AdulterantType, LabTool } from '../../../types/lab';
import { ADULTERANT_DATA } from '../../../lib/adulterationData';

export type CameraPreset = 'overview' | 'test_tube' | 'reagents' | 'hot_plate';

export interface SceneInteractionCallbacks {
  onObjectClick: (tool: LabTool, meta?: { reagentType?: AdulterantType }) => void;
  onObjectHover: (tool: LabTool | null, name: string | null) => void;
}

export class LabSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;
  private callbacks: SceneInteractionCallbacks;

  // Interactive Meshes
  private interactables: { mesh: THREE.Object3D; tool: LabTool; name: string; meta?: any }[] = [];
  private hoveredObject: { mesh: THREE.Object3D; originalColor?: number } | null = null;

  // Liquid and Dynamic meshes
  private testTubeLiquidMesh!: THREE.Mesh;
  private testTubeLiquidMaterial!: THREE.MeshPhysicalMaterial;
  private testTubeFoamMesh!: THREE.Mesh;
  private testTubeFoamMaterial!: THREE.MeshStandardMaterial;

  private controlTubeGroup!: THREE.Group;
  private controlTubeLiquidMesh!: THREE.Mesh;
  private controlTubeLiquidMaterial!: THREE.MeshPhysicalMaterial;

  private cylinderLiquidMesh!: THREE.Mesh;
  private pipetteGroup!: THREE.Group;
  private pipetteLiquidMesh!: THREE.Mesh;
  private hotPlateGlowMesh!: THREE.Mesh;
  private hotPlateGlowMaterial!: THREE.MeshBasicMaterial;

  // Particles
  private steamParticles!: THREE.Points;
  private steamGeometry!: THREE.BufferGeometry;
  private dropletGroup!: THREE.Group;

  // State caches
  private isHeating = false;
  private isMixing = false;
  private mixingTime = 0;
  private targetCameraPos = new THREE.Vector3(0, 3.2, 5.8);
  private targetCameraLookAt = new THREE.Vector3(0, 0.4, 0);

  // Mouse / Raycast
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private isMouseDown = false;
  private previousMousePosition = { x: 0, y: 0 };
  private spherical = { radius: 6.5, theta: Math.PI / 4, phi: Math.PI / 3 };

  constructor(container: HTMLElement, callbacks: SceneInteractionCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16); // Deep slate lab atmosphere
    this.scene.fog = new THREE.FogExp2(0x090d16, 0.04);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 3.2, 5.8);
    this.camera.lookAt(0, 0.4, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildLaboratoryEnvironment();
    this.setupEventListeners();
    this.startAnimationLoop();
  }

  private setupLighting() {
    // Ambient soft cool laboratory illumination
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    this.scene.add(ambientLight);

    // Primary Key Light (Overhead daylight fluorescent strip simulation)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(3, 6, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Soft Rim Light (Cyan lab tint from back for rim definition)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-4, 3, -3);
    this.scene.add(rimLight);

    // Warm accent light for bench foreground
    const fillLight = new THREE.DirectionalLight(0xf8fafc, 0.4);
    fillLight.position.set(0, 2, 5);
    this.scene.add(fillLight);
  }

  private buildLaboratoryEnvironment() {
    // 1. Heavy Laboratory Workbench (Chemical resistant black phenolic surface)
    const tableGeo = new THREE.BoxGeometry(9.0, 0.35, 4.2);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.28,
      metalness: 0.15
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.set(0, -0.175, 0);
    tableMesh.receiveShadow = true;
    this.scene.add(tableMesh);

    // Table subtle edge trim
    const trimGeo = new THREE.BoxGeometry(9.05, 0.05, 4.25);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.6 });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.set(0, -0.375, 0);
    this.scene.add(trimMesh);

    // Background Laboratory Wall with grid lines and ventilation
    const wallGeo = new THREE.PlaneGeometry(14, 8);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 3, -2.1);
    this.scene.add(wallMesh);

    // Digital LED display on back wall
    const ledBackGeo = new THREE.BoxGeometry(2.4, 0.7, 0.08);
    const ledBackMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.4 });
    const ledBack = new THREE.Mesh(ledBackGeo, ledBackMat);
    ledBack.position.set(0, 2.8, -2.02);
    this.scene.add(ledBack);

    // 2. Test-Tube Rack & Test Tubes (Center-Left)
    this.buildTestTubeRack();

    // 3. Graduated Measuring Cylinder (Right side)
    this.buildMeasuringCylinder();

    // 4. Precision Pipette / Dropper
    this.buildPipette();

    // 5. Milk Sample Container Flasks
    this.buildMilkContainers();

    // 6. Chemical Reagent Shelf & Bottles
    this.buildReagentShelf();

    // 7. Controlled Hot Plate with Heating Coil & Steam Emitter
    this.buildHotPlate();

    // 8. Waste Container Beaker
    this.buildWasteContainer();

    // 9. Droplet Particle System for Dispensing Animation
    this.buildDroplets();
  }

  // --- Test-Tube Rack & Test Tubes ---
  private buildTestTubeRack() {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(-0.6, 0, 0.3);

    // Acrylic / Stainless rack base & top plates
    const plateGeo = new THREE.BoxGeometry(2.2, 0.06, 0.75);
    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.25
    });

    const basePlate = new THREE.Mesh(plateGeo, rackMat);
    basePlate.position.set(0, 0.04, 0);
    basePlate.receiveShadow = true;
    rackGroup.add(basePlate);

    const midPlate = new THREE.Mesh(plateGeo, rackMat);
    midPlate.position.set(0, 0.8, 0);
    rackGroup.add(midPlate);

    // Vertical Support pillars
    const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 12);
    const p1 = new THREE.Mesh(pillarGeo, rackMat); p1.position.set(-1.0, 0.42, -0.3);
    const p2 = new THREE.Mesh(pillarGeo, rackMat); p2.position.set(1.0, 0.42, -0.3);
    const p3 = new THREE.Mesh(pillarGeo, rackMat); p3.position.set(-1.0, 0.42, 0.3);
    const p4 = new THREE.Mesh(pillarGeo, rackMat); p4.position.set(1.0, 0.42, 0.3);
    rackGroup.add(p1, p2, p3, p4);

    // Glass material for tubes
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.05
    });

    // Test Tube 1: Active Test Tube (Center slot: x = 0)
    const activeTubeGroup = new THREE.Group();
    activeTubeGroup.position.set(0, 0.1, 0);

    const tubeGeo = new THREE.CylinderGeometry(0.16, 0.16, 1.4, 24, 1, true);
    const tubeMesh = new THREE.Mesh(tubeGeo, glassMat);
    tubeMesh.position.set(0, 0.7, 0);
    activeTubeGroup.add(tubeMesh);

    // Hemispherical tube bottom
    const bottomGeo = new THREE.SphereGeometry(0.16, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const bottomMesh = new THREE.Mesh(bottomGeo, glassMat);
    bottomMesh.position.set(0, 0, 0);
    bottomMesh.rotation.x = Math.PI;
    activeTubeGroup.add(bottomMesh);

    // Rim ring
    const rimGeo = new THREE.TorusGeometry(0.165, 0.02, 12, 24);
    const rimMesh = new THREE.Mesh(rimGeo, glassMat);
    rimMesh.position.set(0, 1.4, 0);
    rimMesh.rotation.x = Math.PI / 2;
    activeTubeGroup.add(rimMesh);

    // Liquid Mesh inside Active Tube
    const liquidGeo = new THREE.CylinderGeometry(0.148, 0.148, 0.6, 20);
    this.testTubeLiquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfafaf9,
      transmission: 0.3,
      opacity: 0.95,
      transparent: true,
      roughness: 0.15,
      ior: 1.34
    });
    this.testTubeLiquidMesh = new THREE.Mesh(liquidGeo, this.testTubeLiquidMaterial);
    this.testTubeLiquidMesh.position.set(0, 0.35, 0);
    this.testTubeLiquidMesh.scale.set(1, 0.001, 1); // initially empty
    activeTubeGroup.add(this.testTubeLiquidMesh);

    // Foam Mesh on top of liquid
    const foamGeo = new THREE.CylinderGeometry(0.149, 0.149, 0.25, 20);
    this.testTubeFoamMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: 0
    });
    this.testTubeFoamMesh = new THREE.Mesh(foamGeo, this.testTubeFoamMaterial);
    this.testTubeFoamMesh.position.set(0, 0.7, 0);
    activeTubeGroup.add(this.testTubeFoamMesh);

    rackGroup.add(activeTubeGroup);
    this.interactables.push({ mesh: tubeMesh, tool: 'test_tube', name: 'Test Tube [Sample Assay]' });

    // Test Tube 2: Control Pure Milk Tube (Left slot: x = -0.55)
    this.controlTubeGroup = new THREE.Group();
    this.controlTubeGroup.position.set(-0.55, 0.1, 0);

    const cTubeMesh = new THREE.Mesh(tubeGeo.clone(), glassMat);
    cTubeMesh.position.set(0, 0.7, 0);
    this.controlTubeGroup.add(cTubeMesh);

    const cBottomMesh = new THREE.Mesh(bottomGeo.clone(), glassMat);
    cBottomMesh.position.set(0, 0, 0);
    cBottomMesh.rotation.x = Math.PI;
    this.controlTubeGroup.add(cBottomMesh);

    const cLiquidGeo = new THREE.CylinderGeometry(0.148, 0.148, 0.6, 20);
    this.controlTubeLiquidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfafaf9,
      transmission: 0.3,
      opacity: 0.95,
      transparent: true,
      roughness: 0.15,
      ior: 1.34
    });
    this.controlTubeLiquidMesh = new THREE.Mesh(cLiquidGeo, this.controlTubeLiquidMaterial);
    this.controlTubeLiquidMesh.position.set(0, 0.35, 0);
    this.controlTubeLiquidMesh.scale.set(1, 0.001, 1);
    this.controlTubeGroup.add(this.controlTubeLiquidMesh);

    rackGroup.add(this.controlTubeGroup);
    this.interactables.push({ mesh: cTubeMesh, tool: 'test_tube', name: 'Control Tube [Pure Milk Reference]' });

    // Test Tube 3: Clean Spare Tube (Right slot: x = 0.55)
    const spareTubeGroup = new THREE.Group();
    spareTubeGroup.position.set(0.55, 0.1, 0);
    const sTubeMesh = new THREE.Mesh(tubeGeo.clone(), glassMat);
    sTubeMesh.position.set(0, 0.7, 0);
    spareTubeGroup.add(sTubeMesh);
    const sBottomMesh = new THREE.Mesh(bottomGeo.clone(), glassMat);
    sBottomMesh.position.set(0, 0, 0);
    sBottomMesh.rotation.x = Math.PI;
    spareTubeGroup.add(sBottomMesh);
    rackGroup.add(spareTubeGroup);

    this.scene.add(rackGroup);
  }

  // --- Graduated Measuring Cylinder ---
  private buildMeasuringCylinder() {
    const cylinderGroup = new THREE.Group();
    cylinderGroup.position.set(0.75, 0, 0.4);

    // Hexagonal stable glass base
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.08, 6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.05,
      ior: 1.52,
      thickness: 0.06
    });
    const baseMesh = new THREE.Mesh(baseGeo, glassMat);
    baseMesh.position.set(0, 0.04, 0);
    cylinderGroup.add(baseMesh);

    // Cylinder column
    const colGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 24, 1, true);
    const colMesh = new THREE.Mesh(colGeo, glassMat);
    colMesh.position.set(0, 0.88, 0);
    cylinderGroup.add(colMesh);

    // Liquid in Cylinder
    const liquidGeo = new THREE.CylinderGeometry(0.19, 0.19, 1.4, 20);
    const liquidMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.2,
      transparent: true,
      opacity: 0.92
    });
    this.cylinderLiquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    this.cylinderLiquidMesh.position.set(0, 0.78, 0);
    this.cylinderLiquidMesh.scale.set(1, 0.001, 1);
    cylinderGroup.add(this.cylinderLiquidMesh);

    // Graduation markings ring indicators
    const markMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 1; i <= 5; i++) {
      const ringGeo = new THREE.TorusGeometry(0.202, 0.004, 8, 24);
      const ring = new THREE.Mesh(ringGeo, markMat);
      ring.position.set(0, 0.2 + i * 0.25, 0);
      ring.rotation.x = Math.PI / 2;
      cylinderGroup.add(ring);
    }

    this.scene.add(cylinderGroup);
    this.interactables.push({ mesh: colMesh, tool: 'measuring_cylinder', name: 'Graduated Cylinder (10 mL)' });
  }

  // --- Pipette / Dropper ---
  private buildPipette() {
    this.pipetteGroup = new THREE.Group();
    this.pipetteGroup.position.set(1.4, 0.35, 0.5);
    this.pipetteGroup.rotation.z = Math.PI / 6; // resting slightly tilted on stand

    // Stand base
    const standBaseGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.04, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5, roughness: 0.4 });
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.set(0, -0.33, 0);
    this.pipetteGroup.add(standBase);

    // Glass shaft
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.015, 1.2, 16);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      transparent: true,
      roughness: 0.05,
      ior: 1.5
    });
    const shaft = new THREE.Mesh(shaftGeo, glassMat);
    shaft.position.set(0, 0.4, 0);
    this.pipetteGroup.add(shaft);

    // Rubber bulb
    const bulbGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0, 1.05, 0);
    bulb.scale.set(0.9, 1.4, 0.9);
    this.pipetteGroup.add(bulb);

    // Internal liquid inside pipette
    const pipLiqGeo = new THREE.CylinderGeometry(0.035, 0.012, 0.8, 12);
    const pipLiqMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9
    });
    this.pipetteLiquidMesh = new THREE.Mesh(pipLiqGeo, pipLiqMat);
    this.pipetteLiquidMesh.position.set(0, 0.3, 0);
    this.pipetteLiquidMesh.scale.set(1, 0.001, 1);
    this.pipetteGroup.add(this.pipetteLiquidMesh);

    this.scene.add(this.pipetteGroup);
    this.interactables.push({ mesh: shaft, tool: 'pipette', name: 'Precision Pipette / Dropper' });
  }

  // --- Milk Sample Flasks ---
  private buildMilkContainers() {
    // 1. Unknown Milk Sample Flask (MILK-XXX)
    const unknownFlaskGroup = new THREE.Group();
    unknownFlaskGroup.position.set(-1.8, 0, 0.2);

    // Erlenmeyer Flask Body
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.55, 1.1, 24, 1);
    const flaskMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      transparent: true,
      roughness: 0.06,
      ior: 1.52,
      thickness: 0.05
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, flaskMat);
    bodyMesh.position.set(0, 0.55, 0);
    unknownFlaskGroup.add(bodyMesh);

    // Flask Neck
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.45, 24, 1, true);
    const neckMesh = new THREE.Mesh(neckGeo, flaskMat);
    neckMesh.position.set(0, 1.25, 0);
    unknownFlaskGroup.add(neckMesh);

    // Milk Liquid inside Flask
    const milkLiqGeo = new THREE.CylinderGeometry(0.28, 0.52, 0.7, 20);
    const milkMat = new THREE.MeshStandardMaterial({
      color: 0xfafaf9,
      roughness: 0.3,
      metalness: 0.02
    });
    const milkLiq = new THREE.Mesh(milkLiqGeo, milkMat);
    milkLiq.position.set(0, 0.38, 0);
    unknownFlaskGroup.add(milkLiq);

    // Flask Label (Cyan high-tech badge)
    const labelGeo = new THREE.PlaneGeometry(0.4, 0.22);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 248, 120);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('UNKNOWN', 35, 52);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 38px monospace';
    ctx.fillText('SAMPLE', 46, 96);
    const labelTex = new THREE.CanvasTexture(canvas);
    const labelMat = new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.48, 0.42);
    labelMesh.rotation.x = -Math.PI / 12;
    unknownFlaskGroup.add(labelMesh);

    this.scene.add(unknownFlaskGroup);
    this.interactables.push({ mesh: bodyMesh, tool: 'milk_container', name: 'Unknown Milk Sample Flask' });

    // 2. Pure Milk Control Bottle
    const pureBottleGroup = new THREE.Group();
    pureBottleGroup.position.set(-2.6, 0, 0.5);

    const pureGeo = new THREE.CylinderGeometry(0.3, 0.32, 1.2, 20);
    const pureMesh = new THREE.Mesh(pureGeo, flaskMat);
    pureMesh.position.set(0, 0.6, 0);
    pureBottleGroup.add(pureMesh);

    // Blue cap
    const capGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(0, 1.26, 0);
    pureBottleGroup.add(capMesh);

    // Pure liquid
    const pureLiqGeo = new THREE.CylinderGeometry(0.28, 0.3, 0.8, 16);
    const pureLiq = new THREE.Mesh(pureLiqGeo, milkMat);
    pureLiq.position.set(0, 0.45, 0);
    pureBottleGroup.add(pureLiq);

    this.scene.add(pureBottleGroup);
    this.interactables.push({ mesh: pureMesh, tool: 'milk_container', name: 'Pure Milk Control Bottle' });
  }

  // --- Chemical Reagent Shelf & Bottles ---
  private buildReagentShelf() {
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(0, 0, -1.0);

    // Dual-tier stainless reagent tier
    const tierGeo = new THREE.BoxGeometry(4.8, 0.08, 0.7);
    const tierMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const tier1 = new THREE.Mesh(tierGeo, tierMat);
    tier1.position.set(0, 0.15, 0);
    shelfGroup.add(tier1);

    const reagents: { id: AdulterantType; name: string; bottleColor: number; liquidColor: number; x: number }[] = [
      { id: 'starch', name: 'Iodine Solution (0.1N)', bottleColor: 0x78350f, liquidColor: 0x451a03, x: -1.7 },
      { id: 'urea', name: 'DMAB Reagent (1.6%)', bottleColor: 0xfef08a, liquidColor: 0xfacc15, x: -0.85 },
      { id: 'detergent', name: 'Methylene Blue (0.1%)', bottleColor: 0x1e3a8a, liquidColor: 0x2563eb, x: 0 },
      { id: 'cane_sugar', name: 'Resorcinol + HCl', bottleColor: 0xffffff, liquidColor: 0xf1f5f9, x: 0.85 },
      { id: 'hydrogen_peroxide', name: 'p-Phenylenediamine', bottleColor: 0x581c87, liquidColor: 0x7e22ce, x: 1.7 }
    ];

    reagents.forEach(r => {
      const bottleGroup = new THREE.Group();
      bottleGroup.position.set(r.x, 0.19, 0);

      const bGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.7, 16);
      const bMat = new THREE.MeshPhysicalMaterial({
        color: r.bottleColor,
        transmission: 0.7,
        transparent: true,
        roughness: 0.2,
        ior: 1.48
      });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      bMesh.position.set(0, 0.35, 0);
      bottleGroup.add(bMesh);

      // Dropper Cap / Stopper
      const stopperGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.2, 12);
      const stopperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const stopper = new THREE.Mesh(stopperGeo, stopperMat);
      stopper.position.set(0, 0.78, 0);
      bottleGroup.add(stopper);

      // Chemical Label text canvas
      const cvs = document.createElement('canvas');
      cvs.width = 128;
      cvs.height = 64;
      const ctx = cvs.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(r.id.toUpperCase(), 10, 26);
      ctx.font = '10px monospace';
      ctx.fillText('REAGENT', 10, 48);

      const tex = new THREE.CanvasTexture(cvs);
      const lblGeo = new THREE.PlaneGeometry(0.24, 0.16);
      const lblMat = new THREE.MeshBasicMaterial({ map: tex });
      const lblMesh = new THREE.Mesh(lblGeo, lblMat);
      lblMesh.position.set(0, 0.35, 0.21);
      bottleGroup.add(lblMesh);

      shelfGroup.add(bottleGroup);
      this.interactables.push({
        mesh: bMesh,
        tool: 'reagent_bottle',
        name: r.name,
        meta: { reagentType: r.id }
      });
    });

    this.scene.add(shelfGroup);
  }

  // --- Hot Plate with Glowing Coils and Steam ---
  private buildHotPlate() {
    const hpGroup = new THREE.Group();
    hpGroup.position.set(-1.8, 0, 1.2);

    // Chassis
    const baseGeo = new THREE.BoxGeometry(1.1, 0.2, 1.1);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set(0, 0.1, 0);
    hpGroup.add(baseMesh);

    // Ceramic top plate
    const topGeo = new THREE.CylinderGeometry(0.44, 0.44, 0.05, 32);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(0, 0.22, 0);
    hpGroup.add(topMesh);

    // Circular Glowing Heating Coil
    const glowGeo = new THREE.TorusGeometry(0.3, 0.03, 16, 32);
    this.hotPlateGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.05 // faint when idle
    });
    this.hotPlateGlowMesh = new THREE.Mesh(glowGeo, this.hotPlateGlowMaterial);
    this.hotPlateGlowMesh.position.set(0, 0.25, 0);
    this.hotPlateGlowMesh.rotation.x = Math.PI / 2;
    hpGroup.add(this.hotPlateGlowMesh);

    // Control knob & digital display
    const knobGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(0.35, 0.1, 0.56);
    knob.rotation.x = Math.PI / 2;
    hpGroup.add(knob);

    // Steam Particle System
    const particleCount = 60;
    this.steamGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = Math.random() * 1.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
    }
    this.steamGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const steamMat = new THREE.PointsMaterial({
      color: 0xe2e8f0,
      size: 0.08,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    this.steamParticles = new THREE.Points(this.steamGeometry, steamMat);
    this.steamParticles.position.set(0, 0.3, 0);
    hpGroup.add(this.steamParticles);

    this.scene.add(hpGroup);
    this.interactables.push({ mesh: baseMesh, tool: 'hot_plate', name: 'Digital Hot Plate / Water Bath' });
  }

  // --- Waste Container Beaker ---
  private buildWasteContainer() {
    const wasteGroup = new THREE.Group();
    wasteGroup.position.set(1.9, 0, -0.2);

    const beakerGeo = new THREE.CylinderGeometry(0.38, 0.35, 0.9, 20);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      transparent: true,
      roughness: 0.1,
      ior: 1.5
    });
    const beakerMesh = new THREE.Mesh(beakerGeo, glassMat);
    beakerMesh.position.set(0, 0.45, 0);
    wasteGroup.add(beakerMesh);

    // Waste label
    const labelGeo = new THREE.PlaneGeometry(0.32, 0.2);
    const cvs = document.createElement('canvas');
    cvs.width = 128;
    cvs.height = 80;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, 0, 128, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('WASTE', 25, 48);
    const tex = new THREE.CanvasTexture(cvs);
    const lblMat = new THREE.MeshBasicMaterial({ map: tex });
    const lbl = new THREE.Mesh(labelGeo, lblMat);
    lbl.position.set(0, 0.45, 0.39);
    wasteGroup.add(lbl);

    this.scene.add(wasteGroup);
    this.interactables.push({ mesh: beakerMesh, tool: 'waste_beaker', name: 'Chemical Waste Receptacle' });
  }

  // --- Droplets Particle System ---
  private buildDroplets() {
    this.dropletGroup = new THREE.Group();
    this.dropletGroup.position.set(-0.6, 1.2, 0.3); // above test tube
    for (let i = 0; i < 4; i++) {
      const dropGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const dropMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0
      });
      const drop = new THREE.Mesh(dropGeo, dropMat);
      drop.position.set(0, -i * 0.15, 0);
      this.dropletGroup.add(drop);
    }
    this.scene.add(this.dropletGroup);
  }

  // --- Dynamic State Updates from ExperimentEngine ---
  public updateState(state: {
    testTubeMilkVolume: number;
    testTubeReagentVolume: number;
    liquidColor: string;
    controlLiquidColor: string;
    foamHeight: number;
    isHotPlateActive: boolean;
    isMixing: boolean;
    measuringCylinderMilkVolume: number;
    pipetteLiquidVolume: number;
    isControlMode: boolean;
  }) {
    // 1. Active Test Tube Liquid
    const totalVol = state.testTubeMilkVolume + state.testTubeReagentVolume;
    const maxVol = 10.0;
    const scaleY = Math.min(1.0, Math.max(0.001, totalVol / maxVol));
    this.testTubeLiquidMesh.scale.y = scaleY;
    this.testTubeLiquidMesh.position.y = 0.05 + (scaleY * 0.6) / 2;
    this.testTubeLiquidMaterial.color.set(state.liquidColor);

    // Foam layer
    if (state.foamHeight > 0.05) {
      this.testTubeFoamMesh.scale.y = state.foamHeight;
      this.testTubeFoamMesh.position.y = 0.05 + scaleY * 0.6 + (state.foamHeight * 0.25) / 2;
      this.testTubeFoamMaterial.opacity = 0.95;
    } else {
      this.testTubeFoamMaterial.opacity = 0;
    }

    // 2. Control Tube
    this.controlTubeGroup.visible = state.isControlMode;
    if (state.isControlMode) {
      this.controlTubeLiquidMesh.scale.y = scaleY;
      this.controlTubeLiquidMesh.position.y = 0.05 + (scaleY * 0.6) / 2;
      this.controlTubeLiquidMaterial.color.set(state.controlLiquidColor);
    }

    // 3. Measuring Cylinder Liquid
    const cylScale = Math.min(1.0, Math.max(0.001, state.measuringCylinderMilkVolume / 10.0));
    this.cylinderLiquidMesh.scale.y = cylScale;
    this.cylinderLiquidMesh.position.y = 0.08 + (cylScale * 1.4) / 2;

    // 4. Pipette Liquid
    const pipScale = Math.min(1.0, Math.max(0.001, state.pipetteLiquidVolume / 5.0));
    this.pipetteLiquidMesh.scale.y = pipScale;

    // 5. Hot Plate Glow & Steam
    this.isHeating = state.isHotPlateActive;
    if (state.isHotPlateActive) {
      this.hotPlateGlowMaterial.opacity = 0.85;
      (this.steamParticles.material as THREE.PointsMaterial).opacity = 0.65;
    } else {
      this.hotPlateGlowMaterial.opacity = 0.05;
      (this.steamParticles.material as THREE.PointsMaterial).opacity = 0;
    }

    // 6. Mixing motion
    this.isMixing = state.isMixing;
  }

  // --- Camera presets ---
  public setCameraPreset(preset: CameraPreset) {
    switch (preset) {
      case 'overview':
        this.targetCameraPos.set(0, 3.2, 5.8);
        this.targetCameraLookAt.set(0, 0.4, 0);
        break;
      case 'test_tube':
        this.targetCameraPos.set(-0.6, 1.4, 2.5);
        this.targetCameraLookAt.set(-0.6, 0.7, 0.3);
        break;
      case 'reagents':
        this.targetCameraPos.set(0, 1.8, 1.8);
        this.targetCameraLookAt.set(0, 0.6, -1.0);
        break;
      case 'hot_plate':
        this.targetCameraPos.set(-1.8, 1.6, 3.0);
        this.targetCameraLookAt.set(-1.8, 0.4, 1.2);
        break;
    }
  }

  // --- Animation loop ---
  private startAnimationLoop() {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Camera smooth damping
      this.camera.position.lerp(this.targetCameraPos, 0.06);
      const currentLookAt = new THREE.Vector3();
      this.camera.getWorldDirection(currentLookAt);
      currentLookAt.add(this.camera.position);
      // smoothly look at target
      this.camera.lookAt(this.targetCameraLookAt);

      // Steam animation if heating
      if (this.isHeating && this.steamGeometry) {
        const positions = this.steamGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += delta * 0.8;
          if (positions[i * 3 + 1] > 1.2) {
            positions[i * 3 + 1] = 0.1;
          }
        }
        this.steamGeometry.attributes.position.needsUpdate = true;
      }

      // Mixing animation (swirling test tube)
      if (this.isMixing) {
        this.mixingTime += delta * 18;
        this.testTubeLiquidMesh.rotation.y += delta * 8;
        const rack = this.scene.getObjectByName('rack');
        // subtle agitation shake
        this.testTubeLiquidMesh.position.x = Math.sin(this.mixingTime) * 0.015;
      } else {
        this.testTubeLiquidMesh.position.x = 0;
      }

      // Hot plate pulse glow
      if (this.isHeating) {
        this.hotPlateGlowMaterial.opacity = 0.7 + Math.sin(elapsed * 6) * 0.2;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // --- Mouse / Touch Orbit & Raycasting ---
  private setupEventListeners() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    dom.addEventListener('mousemove', (e) => {
      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Orbit camera if dragging
      if (this.isMouseDown) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2.1, this.spherical.phi + deltaY * 0.006));

        this.targetCameraPos.x = this.targetCameraLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
        this.targetCameraPos.y = this.targetCameraLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
        this.targetCameraPos.z = this.targetCameraLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast Hover check
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const meshes = this.interactables.map(i => i.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const found = this.interactables.find(i => i.mesh === hit || i.mesh.children.includes(hit));
          if (found) {
            dom.style.cursor = 'pointer';
            this.callbacks.onObjectHover(found.tool, found.name);
            return;
          }
        }
        dom.style.cursor = 'default';
        this.callbacks.onObjectHover(null, null);
      }
    });

    // Zoom on wheel
    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(2.5, Math.min(9.0, this.spherical.radius + e.deltaY * 0.005));
      this.targetCameraPos.x = this.targetCameraLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
      this.targetCameraPos.y = this.targetCameraLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
      this.targetCameraPos.z = this.targetCameraLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
    }, { passive: false });

    // Click handler
    dom.addEventListener('click', () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const meshes = this.interactables.map(i => i.mesh);
      const intersects = this.raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const found = this.interactables.find(i => i.mesh === hit || i.mesh.children.includes(hit));
        if (found) {
          this.callbacks.onObjectClick(found.tool, found.meta);
        }
      }
    });

    // Resize
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
