import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  buildCustomTree, 
  animateCustomTreeWind, 
  CustomTreeConfig, 
  TREE_PRESETS 
} from '../utils/treeGenerator';
import { 
  buildCustomRock, 
  CustomRockConfig, 
  ROCK_PRESETS 
} from '../utils/rockGenerator';
import { 
  buildCustomHouse, 
  CustomHouseConfig, 
  HOUSE_PRESETS 
} from '../utils/houseGenerator';
import { 
  buildCustomGrass, 
  CustomGrassConfig, 
  GRASS_PRESETS 
} from '../utils/grassGenerator';
import { BUILDING_DATABASE, BuildingDatabaseEntry } from '../utils/buildingDatabase';
import { 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Paintbrush, 
  Check, 
  ArrowLeft, 
  Shuffle, 
  RotateCw, 
  Wind,
  Compass,
  Home,
  Mountain,
  Layout,
  Sun,
  Eye,
  Search,
  BookOpen,
  Filter,
  Dices,
  Bug,
  Copy
} from 'lucide-react';

interface LabSuiteProps {
  onBackToWorld: () => void;
  onApplyCustomTree: (config: CustomTreeConfig | null) => void;
  onApplyCustomRock: (config: CustomRockConfig | null) => void;
  onApplyCustomHouse: (config: CustomHouseConfig | null) => void;
  onApplyCustomGrass: (config: CustomGrassConfig | null) => void;
  currentTree: CustomTreeConfig | null;
  currentRock: CustomRockConfig | null;
  currentHouse: CustomHouseConfig | null;
  currentGrass: CustomGrassConfig | null;
  initialTab?: 'tree' | 'rock' | 'house' | 'grass';
}

const DEFAULT_TREE: CustomTreeConfig = {
  seed: 42137,
  iterations: 4,
  branchSplit: 3.5,
  baseLength: 5.5,
  baseRadius: 0.55,
  spreadAngle: 38,
  crookedness: 45,
  showLeaves: true,
  blobRadius: 1.8,
  detailLevel: 1,
  fluffiness: 1.15,
  windStrength: 0.5,
  stylePreset: 'sakura',
  trunkColor: '#3d2f2b',
  leafColor: '#ffb7c5',
};

const DEFAULT_ROCK: CustomRockConfig = {
  seed: 98124,
  radius: 0.65,
  ruggedness: 45,
  scaleX: 1.1,
  scaleY: 0.8,
  scaleZ: 1.1,
  rockColor: '#64748b',
  hasMoss: true,
  mossColor: '#4d7c0f',
  hasCrystals: false,
  crystalColor: '#38bdf8',
  stylePreset: 'boulder',
};

const DEFAULT_GRASS: CustomGrassConfig = {
  seed: 98765,
  count: 3200,
  density: 7,
  bladeDetail: 6,
  bladeWidth: 0.20,
  bladeHeight: 1.00,
  windStrength: 1.00,
  simulationSpeed: 0.80,
  baseColor: '#1d5c00',
  tipColor: '#e8e800',
  groundColor: '#5b4327',
  stylePreset: 'sunny_day',
};

const DEFAULT_HOUSE: CustomHouseConfig = {
  seed: 71239,
  width: 0.6,
  length: 0.6,
  height: 0.45,
  roofType: 'cone',
  roofHeight: 0.35,
  roofOverhang: 0.08,
  wallColor: '#b23b3b',
  roofColor: '#3d3530',
  doorColor: '#5c3d2e',
  windowGlowColor: '#fde047',
  windowCount: 2,
  hasChimney: true,
  chimneyHeight: 0.28,
  hasPorch: false,
  stylePreset: 'cabin',
};

export default function LabSuite({
  onBackToWorld,
  onApplyCustomTree,
  onApplyCustomRock,
  onApplyCustomHouse,
  onApplyCustomGrass,
  currentTree,
  currentRock,
  currentHouse,
  currentGrass,
  initialTab = 'tree',
}: LabSuiteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef(new THREE.Clock());
  
  // Active Laboratory Tab
  const [activeTab, setActiveTab] = useState<'tree' | 'rock' | 'house' | 'grass'>(initialTab);

  const [showDebug, setShowDebug] = useState<boolean>(false);
  const debugStatsRef = useRef<HTMLDivElement>(null);

  // Configuration States
  const [treeConfig, setTreeConfig] = useState<CustomTreeConfig>(currentTree || DEFAULT_TREE);
  const [rockConfig, setRockConfig] = useState<CustomRockConfig>(currentRock || DEFAULT_ROCK);
  const [houseConfig, setHouseConfig] = useState<CustomHouseConfig>(currentHouse || DEFAULT_HOUSE);
  const [grassConfig, setGrassConfig] = useState<CustomGrassConfig>(currentGrass || DEFAULT_GRASS);

  // Export State
  const [exportName, setExportName] = useState<string>('Minha Semente de Grama');
  const [showExportSuccess, setShowExportSuccess] = useState<boolean>(false);

  // Expanded Building Database UI States
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('tavern-mid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [justAppliedId, setJustAppliedId] = useState<string | null>(null);

  const handleApplyBuildingDesign = (entry: BuildingDatabaseEntry) => {
    setHouseConfig((prev) => ({
      ...prev,
      ...entry.config,
      seed: Math.floor(Math.random() * 999999), // Give it a fresh seed for unique layout elements
    }));
    setJustAppliedId(entry.id);
    setTimeout(() => setJustAppliedId(null), 2500);
  };

  // Generic View Controls
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pedestalTheme, setPedestalTheme] = useState<'grass' | 'sand' | 'brick'>('grass');

  // Sidebar Sub-Sections Collapse States
  const [openSection, setOpenSection] = useState<string | null>('trunk');

  // Refs for 3D Viewport
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const grassTopRef = useRef<THREE.Mesh | null>(null);
  const renderDirtyRef = useRef<boolean>(true);
  const rebuildModelRef = useRef<(() => void) | null>(null);

  // Sync state into refs to support the single persistent animation loop without context rebuilds
  const activeTabRef = useRef(activeTab);
  const treeConfigRef = useRef(treeConfig);
  const rockConfigRef = useRef(rockConfig);
  const houseConfigRef = useRef(houseConfig);
  const grassConfigRef = useRef(grassConfig);
  const autoRotateRef = useRef(autoRotate);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { treeConfigRef.current = treeConfig; }, [treeConfig]);
  useEffect(() => { rockConfigRef.current = rockConfig; }, [rockConfig]);
  useEffect(() => { houseConfigRef.current = houseConfig; }, [houseConfig]);
  useEffect(() => { grassConfigRef.current = grassConfig; }, [grassConfig]);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
    renderDirtyRef.current = true;
  }, [autoRotate]);

  // Set default pedestal theme based on active tab
  useEffect(() => {
    if (activeTab === 'tree') {
      setPedestalTheme('grass');
      setOpenSection('trunk');
    } else if (activeTab === 'rock') {
      setPedestalTheme('sand');
      setOpenSection('shape');
    } else if (activeTab === 'house') {
      setPedestalTheme('brick');
      setOpenSection('walls');
    } else if (activeTab === 'grass') {
      setPedestalTheme('grass');
      setOpenSection('grass');
    }
  }, [activeTab]);

  // Adjust Pedestal Surface Mesh when pedestalTheme changes
  useEffect(() => {
    if (!grassTopRef.current) return;
    const mesh = grassTopRef.current;
    if (pedestalTheme === 'grass') {
      (mesh.material as THREE.MeshStandardMaterial).color.set('#65a30d'); // Fresh green
    } else if (pedestalTheme === 'sand') {
      (mesh.material as THREE.MeshStandardMaterial).color.set('#eab308'); // Desert amber sand
    } else {
      (mesh.material as THREE.MeshStandardMaterial).color.set('#475569'); // Dark slate cobblestone
    }
    renderDirtyRef.current = true;
  }, [pedestalTheme]);

  // Dedicated procedural model builder (swaps geometry in active model group with zero context recreate)
  const rebuildModel = useCallback(() => {
    const group = modelGroupRef.current;
    if (!group) return;

    // Dispose and remove previous model meshes
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });
    }

    if (activeTab === 'tree') {
      const treeMesh = buildCustomTree(treeConfig);
      group.add(treeMesh);
    } else if (activeTab === 'rock') {
      const rockMesh = buildCustomRock(rockConfig);
      rockMesh.position.y = rockConfig.radius * rockConfig.scaleY * 0.4;
      group.add(rockMesh);
    } else if (activeTab === 'house') {
      const houseMesh = buildCustomHouse(houseConfig);
      group.add(houseMesh);
    } else if (activeTab === 'grass') {
      const grassMesh = buildCustomGrass(grassConfig);
      group.add(grassMesh);
    }

    renderDirtyRef.current = true;
  }, [activeTab, treeConfig, rockConfig, houseConfig, grassConfig]);

  rebuildModelRef.current = rebuildModel;

  // 1. Core WebGL Lifecycle (Mounts ONCE, handles resize and persistent loop)
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#f8fafc'); // Clean ivory off-white

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 12);
    cameraRef.current = camera;

    // Renderer: created strictly ONCE
    const webglRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    webglRenderer.setSize(width, height);
    webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    webglRenderer.shadowMap.enabled = true;
    webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = webglRenderer;

    containerRef.current.appendChild(webglRenderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, webglRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 25;
    controls.maxPolarAngle = Math.PI / 1.95;
    controls.target.set(0, 1.8, 0);
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 0.8;
    controlsRef.current = controls;

    // Lighting Setup: tight shadow frustum and 512x512 map for optimal performance
    const ambientLight = new THREE.HemisphereLight('#ffffff', '#e2e8f0', 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.85);
    dirLight.position.set(6, 12, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -3.5;
    dirLight.shadow.camera.right = 3.5;
    dirLight.shadow.camera.top = 3.5;
    dirLight.shadow.camera.bottom = -3.5;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.35);
    fillLight.position.set(-6, 5, -6);
    scene.add(fillLight);

    // Platform Pedestal
    const pedestalGroup = new THREE.Group();
    pedestalGroup.name = 'pedestal';

    const ringGeom = new THREE.CylinderGeometry(2.6, 2.8, 0.4, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.85,
      flatShading: true,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.y = -0.2;
    ring.receiveShadow = true;
    pedestalGroup.add(ring);

    const topGeom = new THREE.CylinderGeometry(2.55, 2.55, 0.05, 32);
    const topMat = new THREE.MeshStandardMaterial({
      color: pedestalTheme === 'sand' ? '#eab308' : pedestalTheme === 'brick' ? '#475569' : '#65a30d',
      roughness: 0.9,
      flatShading: true,
    });
    const topMesh = new THREE.Mesh(topGeom, topMat);
    topMesh.position.y = 0.01;
    topMesh.receiveShadow = true;
    pedestalGroup.add(topMesh);
    grassTopRef.current = topMesh;

    scene.add(pedestalGroup);

    // Active Model Container Group
    const modelGroup = new THREE.Group();
    modelGroup.name = 'active-procedural-group';
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // Immediately generate the active model so scene is never blank upon mount or remount
    rebuildModelRef.current?.();

    // Resize Handler via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
          renderDirtyRef.current = true;
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    controls.addEventListener('change', () => {
      renderDirtyRef.current = true;
    });

    // Render loop
    let animId: number;
    const clock = clockRef.current;

    const debugTracker = {
      frames: 0,
      prevTime: performance.now(),
      lastFpsUpdate: performance.now(),
      deltas: [] as number[],
    };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Check if continuous animation is required
      const isAutoRotating = autoRotateRef.current;
      const currentTab = activeTabRef.current;
      const hasTreeWind = currentTab === 'tree' && (treeConfigRef.current.windStrength > 0);
      const hasGrassWind = currentTab === 'grass' && (grassConfigRef.current.windStrength > 0);
      const needsContinuous = isAutoRotating || hasTreeWind || hasGrassWind;

      // Update controls damping/autorotate
      if (controlsRef.current) {
        controlsRef.current.autoRotate = isAutoRotating;
        const dampingActive = controlsRef.current.update();
        if (dampingActive) {
          renderDirtyRef.current = true;
        }
      }

      // Animate active model if applicable
      if (modelGroupRef.current && modelGroupRef.current.children.length > 0) {
        if (hasTreeWind) {
          animateCustomTreeWind(modelGroupRef.current.children[0] as THREE.Group, time);
          renderDirtyRef.current = true;
        } else if (hasGrassWind) {
          const grassGroup = modelGroupRef.current.children[0] as THREE.Group;
          grassGroup.children.forEach((child) => {
            if (child instanceof THREE.InstancedMesh && child.userData.uniforms) {
              child.userData.uniforms.uTime.value = time;
            }
          });
          renderDirtyRef.current = true;
        }
      }

      // Render only when dirty or during continuous animation
      if (needsContinuous || renderDirtyRef.current) {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        renderDirtyRef.current = false;

        // Debug Tracking
        const now = performance.now();
        debugTracker.frames++;
        debugTracker.deltas.push(now - debugTracker.prevTime);
        debugTracker.prevTime = now;

        if (now > debugTracker.lastFpsUpdate + 1000) {
          const fps = Math.round((debugTracker.frames * 1000) / (now - debugTracker.lastFpsUpdate));
          const sorted = [...debugTracker.deltas].sort((a, b) => a - b);
          const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
          const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
          const max = sorted.length > 0 ? sorted[sorted.length - 1] : 0;

          if (debugStatsRef.current && rendererRef.current) {
            const calls = rendererRef.current.info.render.calls;
            const tris = rendererRef.current.info.render.triangles;
            const w = rendererRef.current.domElement.width;
            const h = rendererRef.current.domElement.height;
            const dpr = rendererRef.current.getPixelRatio();

            let seedDisplay = '0';
            if (currentTab === 'tree') seedDisplay = treeConfigRef.current.seed.toString();
            if (currentTab === 'rock') seedDisplay = rockConfigRef.current.seed.toString();
            if (currentTab === 'house') seedDisplay = houseConfigRef.current.seed.toString();
            if (currentTab === 'grass') seedDisplay = grassConfigRef.current.seed.toString();

            debugStatsRef.current.innerHTML = `
              <div class="flex justify-between gap-4"><span>p50 ${p50.toFixed(1)}ms</span> <span>p95 ${p95.toFixed(1)}ms</span></div>
              <div class="flex justify-between gap-4"><span>max ${max.toFixed(1)}ms</span> <span>(${fps} fps)</span></div>
              <div class="flex justify-between gap-4 text-[#e07a5f] mt-1 pt-1 border-t border-amber-900/30"><span>draw ${calls}</span> <span>tris ${(tris / 1000).toFixed(1)}k</span></div>
              <div class="text-[#e07a5f] mt-1">vp ${w}x${h} &nbsp; dpr ${dpr.toFixed(2)}</div>
              <div class="text-[#e07a5f]">seed ${seedDisplay} &nbsp; tab ${currentTab}</div>
            `;
          }

          debugTracker.frames = 0;
          debugTracker.lastFpsUpdate = now;
          debugTracker.deltas = [];
        }
      }
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);

      if (modelGroupRef.current) {
        modelGroupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
            else child.material?.dispose();
          }
        });
      }

      ringGeom.dispose();
      ringMat.dispose();
      topGeom.dispose();
      topMat.dispose();

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      sceneRef.current = null;
      cameraRef.current = null;
      modelGroupRef.current = null;
      grassTopRef.current = null;
    };
  }, []);

  // 2. Procedural Model Rebuilder (Executes ONLY when parameters or active tab change - zero context recreation)
  useEffect(() => {
    rebuildModel();
  }, [rebuildModel]);

  // --- PRESETS APPLIERS ---
  const applyTreePreset = (presetKey: CustomTreeConfig['stylePreset']) => {
    setTreeConfig((prev) => ({
      ...prev,
      ...TREE_PRESETS[presetKey],
      stylePreset: presetKey,
    }));
  };

  const applyRockPreset = (presetKey: CustomRockConfig['stylePreset']) => {
    setRockConfig((prev) => ({
      ...prev,
      ...ROCK_PRESETS[presetKey],
      stylePreset: presetKey,
    }));
  };

  const applyHousePreset = (presetKey: CustomHouseConfig['stylePreset']) => {
    setHouseConfig((prev) => ({
      ...prev,
      ...HOUSE_PRESETS[presetKey],
      stylePreset: presetKey,
    }));
  };

  const applyGrassPreset = (presetKey: CustomGrassConfig['stylePreset']) => {
    if (presetKey === 'custom') {
      setGrassConfig((prev) => ({ ...prev, stylePreset: 'custom' }));
      return;
    }
    setGrassConfig((prev) => ({
      ...prev,
      ...GRASS_PRESETS[presetKey as Exclude<CustomGrassConfig['stylePreset'], 'custom'>],
      stylePreset: presetKey,
    }));
  };

  // --- RANDOM SEED GENERATORS ---
  const handleGrowNewTree = () => {
    setTreeConfig((prev) => ({ ...prev, seed: Math.floor(Math.random() * 999999) }));
  };

  const handleGrowNewRock = () => {
    setRockConfig((prev) => ({ ...prev, seed: Math.floor(Math.random() * 999999) }));
  };

  const handleGrowNewHouse = () => {
    setHouseConfig((prev) => ({ ...prev, seed: Math.floor(Math.random() * 999999) }));
  };

  const handleGrowNewGrass = () => {
    const randomHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setGrassConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 999999),
      density: Math.floor(Math.random() * 14) + 2,
      bladeHeight: parseFloat((Math.random() * 2.7 + 0.3).toFixed(2)),
      bladeWidth: parseFloat((Math.random() * 0.45 + 0.05).toFixed(2)),
      bladeDetail: Math.floor(Math.random() * 9) + 2,
      windStrength: parseFloat((Math.random() * 4.5 + 0.5).toFixed(2)),
      simulationSpeed: parseFloat((Math.random() * 2.8 + 0.2).toFixed(2)),
      baseColor: randomHex(),
      tipColor: randomHex(),
      groundColor: randomHex(),
      stylePreset: 'custom',
    }));
  };

  const handleExportGrassConfig = () => {
    const configToExport = {
      name: exportName || `Seed-${grassConfig.seed}`,
      ...grassConfig
    };
    navigator.clipboard.writeText(JSON.stringify(configToExport, null, 2))
      .then(() => {
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 2000);
      });
  };

  // --- ALL-SLIDER RANDOMIZATIONS (USER-REQUESTED FEATURE!) ---
  const handleRandomizeTreeSliders = () => {
    const allPresets = [
      'sakura', 'oak', 'willow', 'maple', 'birch', 'cactus', 'bonsai', 'pine',
      'ivy', 'bougainvillea', 'liana', 'grapevine', 'pothos', 'trumpet_vine',
      'rose', 'sunflower', 'lotus', 'tulip', 'daisy', 'hibiscus',
      'silver_eucalyptus', 'rainbow_eucalyptus', 'giant_eucalyptus',
      'apple', 'lemon', 'mango', 'peach', 'cherry', 'orange',
      'palm', 'bamboo', 'mushroom', 'fern', 'baobab', 'wheat', 'lichen',
      'kapok_giant', 'brazil_nut', 'mahogany', 'jequitiba', 'dinizia', 'araucaria',
      'giant_sequoia', 'coast_redwood', 'live_oak', 'bald_cypress', 'bristlecone_pine', 'sugar_maple',
      'african_baobab', 'strangler_fig', 'kauri', 'dragon_blood', 'banyan', 'lebanon_cedar',
      'golden_barrel', 'organ_pipe', 'prickly_pear', 'hedgehog_cactus', 'branching_saguaro',
      'mandacaru', 'xique_xique', 'turks_cap', 'may_flower',
      'candelabra', 'brain_cactus', 'dragon_fruit', 'living_stone', 'monkey_tail', 'fishbone'
    ] as const;
    const randomPreset = allPresets[Math.floor(Math.random() * allPresets.length)];
    const trunkTones = ['#3d2f2b', '#4a3b32', '#302b1e', '#4a3525', '#e2e8f0', '#5c3104', '#1f4d33'];
    const leafTones = ['#ffb7c5', '#ff8da1', '#2d6a4f', '#40916c', '#f48c06', '#95d5b2', '#0f3c24', '#ff7096', '#ea580c'];

    setTreeConfig({
      seed: Math.floor(Math.random() * 999999),
      iterations: Math.floor(Math.random() * 3) + 3, // 3 to 5
      branchSplit: parseFloat((Math.random() * 2.5 + 1.5).toFixed(3)),
      baseLength: parseFloat((Math.random() * 5.0 + 3.0).toFixed(2)),
      baseRadius: parseFloat((Math.random() * 0.7 + 0.25).toFixed(4)),
      spreadAngle: Math.floor(Math.random() * 50) + 15,
      crookedness: Math.floor(Math.random() * 80) + 10,
      showLeaves: Math.random() > 0.12,
      blobRadius: parseFloat((Math.random() * 1.8 + 0.8).toFixed(2)),
      detailLevel: 1,
      fluffiness: parseFloat((Math.random() * 1.5 + 0.4).toFixed(3)),
      windStrength: parseFloat((Math.random() * 1.2 + 0.1).toFixed(1)),
      stylePreset: randomPreset,
      trunkColor: trunkTones[Math.floor(Math.random() * trunkTones.length)],
      leafColor: leafTones[Math.floor(Math.random() * leafTones.length)],
    });
  };

  const handleRandomizeRockSliders = () => {
    const presets = ['boulder', 'crystal', 'obsidian', 'meteorite', 'sandstone'] as const;
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    const rockColors = ['#475569', '#334155', '#1e293b', '#1e1b4b', '#030712', '#4338ca', '#d97706', '#b45309', '#065f46'];
    const crystalColors = ['#ec4899', '#38bdf8', '#a855f7', '#10b981', '#ef4444', '#f59e0b', '#06b6d4'];
    const mossColors = ['#4d7c0f', '#3f6212', '#16a34a', '#15803d', '#4ade80'];

    setRockConfig({
      seed: Math.floor(Math.random() * 999999),
      radius: parseFloat((Math.random() * 1.0 + 0.3).toFixed(2)),
      ruggedness: Math.floor(Math.random() * 100),
      scaleX: parseFloat((Math.random() * 1.3 + 0.6).toFixed(2)),
      scaleY: parseFloat((Math.random() * 1.3 + 0.4).toFixed(2)),
      scaleZ: parseFloat((Math.random() * 1.3 + 0.6).toFixed(2)),
      rockColor: rockColors[Math.floor(Math.random() * rockColors.length)],
      hasMoss: Math.random() > 0.4,
      mossColor: mossColors[Math.floor(Math.random() * mossColors.length)],
      hasCrystals: Math.random() > 0.5,
      crystalColor: crystalColors[Math.floor(Math.random() * crystalColors.length)],
      stylePreset: randomPreset,
    });
  };

  const handleRandomizeHouseSliders = () => {
    const presets = ['cabin', 'modern', 'castle', 'wizard', 'nordic'] as const;
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    const wallColors = ['#b23b3b', '#e2e8f0', '#64748b', '#4c1d95', '#0c4a6e', '#15803d', '#a16207', '#475569'];
    const roofColors = ['#3d3530', '#1e293b', '#7f1d1d', '#111827', '#b91c1c', '#0f172a', '#1e3a8a'];
    const doorColors = ['#5c3d2e', '#0f172a', '#451a03', '#d97706', '#e2e8f0', '#3b0764', '#065f46'];
    const glowColors = ['#fde047', '#38bdf8', '#a855f7', '#22c55e', '#fdba74', '#f43f5e', '#ffffff'];

    setHouseConfig({
      seed: Math.floor(Math.random() * 999999),
      width: parseFloat((Math.random() * 0.9 + 0.4).toFixed(2)),
      length: parseFloat((Math.random() * 0.9 + 0.4).toFixed(2)),
      height: parseFloat((Math.random() * 0.9 + 0.3).toFixed(2)),
      roofType: (['cone', 'gabled', 'flat', 'spire'] as const)[Math.floor(Math.random() * 4)],
      roofHeight: parseFloat((Math.random() * 0.8 + 0.15).toFixed(2)),
      roofOverhang: parseFloat((Math.random() * 0.25 + 0.02).toFixed(2)),
      wallColor: wallColors[Math.floor(Math.random() * wallColors.length)],
      roofColor: roofColors[Math.floor(Math.random() * roofColors.length)],
      doorColor: doorColors[Math.floor(Math.random() * doorColors.length)],
      windowGlowColor: glowColors[Math.floor(Math.random() * glowColors.length)],
      windowCount: Math.floor(Math.random() * 4) + 1,
      hasChimney: Math.random() > 0.35,
      chimneyHeight: parseFloat((Math.random() * 0.35 + 0.15).toFixed(2)),
      hasPorch: Math.random() > 0.45,
      stylePreset: randomPreset,
    });
  };

  // --- SAVE & TRANSPLANT ACTIVE CONFIG TO MAP ---
  const handleExportAndSave = () => {
    if (activeTab === 'tree') {
      onApplyCustomTree(treeConfig);
    } else if (activeTab === 'rock') {
      onApplyCustomRock(rockConfig);
    } else if (activeTab === 'house') {
      onApplyCustomHouse(houseConfig);
    } else if (activeTab === 'grass') {
      onApplyCustomGrass(grassConfig);
    }
    onBackToWorld();
  };

  return (
    <div id="labs-suite-container" className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 select-none">
      
      {/* 1. LEFT SIDE: 3D VIEWPORT & GLOBAL TAB SWITCHERS */}
      <div className="flex-1 relative flex flex-col h-full bg-slate-100">
        
        {/* UPPER NAVIGATION BAR: Back & Tab Switches */}
        <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              id="btn-labs-back-to-world"
              onClick={onBackToWorld}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ver Mundo</span>
            </button>

            <button
              onClick={() => setShowDebug(!showDebug)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer ${showDebug ? 'bg-amber-500 hover:bg-amber-400 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
            >
              <Bug className="w-4 h-4" />
              <span className="hidden sm:inline">Debug</span>
            </button>

            <div className="hidden sm:flex bg-white/90 border border-slate-200 shadow-md rounded-xl px-3.5 py-2.5 items-center gap-2 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Laboratório de Design Procedural</span>
            </div>
          </div>

          {/* LAB SELECTOR TABS */}
          <div className="flex bg-slate-900/90 border border-slate-700 p-1 rounded-xl shadow-xl backdrop-blur-md">
            <button
              id="tab-select-tree"
              onClick={() => setActiveTab('tree')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tree' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">🌳</span>
              <span>Árvore</span>
            </button>
            <button
              id="tab-select-rock"
              onClick={() => setActiveTab('rock')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'rock' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">🪨</span>
              <span>Pedra</span>
            </button>
            <button
              id="tab-select-house"
              onClick={() => setActiveTab('house')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'house' 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">🏡</span>
              <span>Cabana</span>
            </button>
            <button
              id="tab-select-grass"
              onClick={() => setActiveTab('grass')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'grass' 
                  ? 'bg-lime-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="text-base">🌿</span>
              <span>Grama</span>
            </button>
          </div>

        </div>

        {/* BOTTOM LEFT OVERLAYS */}
        <div className="absolute bottom-4 left-4 z-20 space-y-2 max-w-xs">
          
          {/* Pedestal Surface theme picker */}
          <div className="bg-white/95 border border-slate-200 p-2.5 rounded-xl shadow-lg backdrop-blur-md flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700">Plataforma:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPedestalTheme('grass')}
                className={`w-5 h-5 rounded-full bg-lime-600 border ${pedestalTheme === 'grass' ? 'border-slate-800 ring-2 ring-lime-300' : 'border-slate-300'}`}
                title="Grama"
              />
              <button
                onClick={() => setPedestalTheme('sand')}
                className={`w-5 h-5 rounded-full bg-amber-400 border ${pedestalTheme === 'sand' ? 'border-slate-800 ring-2 ring-amber-200' : 'border-slate-300'}`}
                title="Areia"
              />
              <button
                onClick={() => setPedestalTheme('brick')}
                className={`w-5 h-5 rounded-full bg-slate-600 border ${pedestalTheme === 'brick' ? 'border-slate-800 ring-2 ring-slate-400' : 'border-slate-300'}`}
                title="Calçamento"
              />
            </div>
          </div>

          <div className="bg-white/95 border border-slate-200 p-3 rounded-xl shadow-lg text-[11px] leading-relaxed text-slate-500 backdrop-blur-md">
            <p className="font-bold text-slate-800 text-xs mb-1">🧬 DNA Procedural Ativo:</p>
            {activeTab === 'tree' && 'Edite a estrutura fractal desta árvore. Clique em "Usar no Mundo" para adicioná-la à ferramenta de plantio do mapa.'}
            {activeTab === 'rock' && 'Deforme e molde esta rocha em formatos pontiagudos de cristal, meteorito achatado ou seixos musgosos.'}
            {activeTab === 'house' && 'Projete as paredes, tipo de telhado (gótico, nórdico, moderno ou cone), chaminé com fumaça e varandas.'}
            {activeTab === 'grass' && 'Gere campos de grama interativos. Ajuste física do vento, coloração base, e densidade.'}
          </div>
        </div>

        {/* 3D RENDERING CANVAS CONTAINER */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing relative" />

        {/* DEBUG STATS OVERLAY */}
        {showDebug && (
          <div className="absolute top-20 left-4 z-20 pointer-events-none">
            <div 
              ref={debugStatsRef}
              className="bg-black/90 border border-amber-900/50 text-amber-500 font-mono text-[10px] sm:text-xs p-3 rounded-lg shadow-xl backdrop-blur-md min-w-[200px]"
            >
              Inicializando telemetria...
            </div>
          </div>
        )}
      </div>

      {/* 2. RIGHT SIDEBAR: HIGHLY CUSTOMIZABLE SLIDERS (MATCHING THE PARCHMENT THEME OF MAP CONFIGURATOR) */}
      <div 
        id="labs-sidebar-configurator"
        className="w-full lg:w-96 bg-[#f7efe5] border-t lg:border-t-0 lg:border-l border-[#dfd4c5] shadow-2xl flex flex-col h-full overflow-hidden"
      >
        
        {/* TAB SPECIFIC HEADER */}
        <div className="p-4 border-b border-[#dfd4c5] bg-[#ebdccb] flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-amber-950 text-sm">
            {activeTab === 'tree' && <span>🌳 Tree Configurator</span>}
            {activeTab === 'rock' && <span>🪨 Rock Configurator</span>}
            {activeTab === 'house' && <span>🏡 Cabin Configurator</span>}
            {activeTab === 'grass' && <span>🌿 Grass Configurator</span>}
          </div>
          <span className="text-[10px] text-amber-900/60 font-semibold uppercase">
            Seed: {activeTab === 'tree' ? treeConfig.seed : activeTab === 'rock' ? rockConfig.seed : activeTab === 'house' ? houseConfig.seed : grassConfig.seed}
          </span>
        </div>

        {/* SCROLLABLE SIDEBAR PARAMETERS */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-amber-950">

          {/* ==================== 🌳 TREE CONFIGURATORS ==================== */}
          {activeTab === 'tree' && (
            <>
              {/* Preset Selector */}
              <div className="space-y-1.5 bg-white/40 border border-[#e8dac7] p-3 rounded-xl">
                <label className="text-xs font-bold text-amber-950 block">Espécie Básica</label>
                <select
                  value={treeConfig.stylePreset}
                  onChange={(e) => applyTreePreset(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none"
                >
                  <optgroup label="🌳 Árvores Amazônicas e Sul-Americanas">
                    <option value="kapok_giant">🌳 Samaúma Gigante (Giant Kapok Tree)</option>
                    <option value="brazil_nut">🌰 Castanheira-do-Pará Colossal (Brazil Nut)</option>
                    <option value="mahogany">🪵 Mogno Ancestral (Ancient Mahogany)</option>
                    <option value="jequitiba">🍃 Jequitibá-Rosa Centenário (Jequitiba)</option>
                    <option value="dinizia">🌿 Angelim-Vermelho Majestoso (Dinizia)</option>
                    <option value="araucaria">🌲 Araucária Milenar (Ancient Paraná Pine)</option>
                  </optgroup>

                  <optgroup label="🌲 Árvores Norte-Americanas">
                    <option value="giant_sequoia">🌲 Sequoia Gigante (Giant Sequoia)</option>
                    <option value="coast_redwood">🌁 Sequoia Costeira Titânica (Coast Redwood)</option>
                    <option value="live_oak">🌳 Carvalho-Vivo Sulista (Southern Live Oak)</option>
                    <option value="bald_cypress">🪵 Cipreste-Calvo do Pântano (Bald Cypress)</option>
                    <option value="bristlecone_pine">🌲 Pinheiro-de-Cone-Rígido (Bristlecone Pine)</option>
                    <option value="sugar_maple">🍁 Bordo-Açucareiro Maciço (Sugar Maple)</option>
                  </optgroup>

                  <optgroup label="🐘 Outras Espécies de Troncos Supergrossos">
                    <option value="african_baobab">🐘 Baobá Africano Milenar (African Baobab)</option>
                    <option value="strangler_fig">🌿 Figueira-Estranguladora (Strangler Fig)</option>
                    <option value="kauri">🌳 Kauri Neozelandês (New Zealand Kauri)</option>
                    <option value="dragon_blood">🐉 Dragoeiro Ancestral (Dragon Blood Tree)</option>
                    <option value="banyan">🍃 Bananeira-da-Terra-Maciça (Massive Banyan)</option>
                    <option value="lebanon_cedar">🪵 Cedro-do-Líbano (Lebanon Cedar)</option>
                  </optgroup>

                  <optgroup label="🌵 Cactos Clássicos de Deserto">
                    <option value="golden_barrel">🛢️ Cacto Barril Dourado (Golden Barrel)</option>
                    <option value="organ_pipe">🏜️ Cacto Tubo-de-Órgão (Organ Pipe)</option>
                    <option value="prickly_pear">🌺 Cacto Palma / Figueira-da-Índia (Prickly Pear)</option>
                    <option value="hedgehog_cactus">🦔 Cacto Ouriço (Hedgehog)</option>
                    <option value="branching_saguaro">🌵 Cacto Saguaro Ramificado (Branching Saguaro)</option>
                  </optgroup>

                  <optgroup label="🇧🇷 Cactos da Caatinga e América do Sul">
                    <option value="mandacaru">🌵 Mandacaru Majestoso (Mandacaru)</option>
                    <option value="xique_xique">🌱 Xique-Xique Selvagem (Xique-Xique)</option>
                    <option value="turks_cap">👑 Cacto Coroa-de-Frade (Turk's Cap)</option>
                    <option value="may_flower">🌸 Flor-de-Maio Silvestre (May Flower)</option>
                  </optgroup>

                  <optgroup label="🐉 Cactos Exóticos e Formatos Diferenciados">
                    <option value="candelabra">🕯️ Cacto Candelabro (Candelabra)</option>
                    <option value="brain_cactus">🧠 Cacto Cérebro (Brain Cactus)</option>
                    <option value="dragon_fruit">🐉 Cacto Pitaia Trepador (Dragon Fruit)</option>
                    <option value="living_stone">🪨 Cacto Pedra Viva (Living Stone)</option>
                    <option value="monkey_tail">🐒 Cacto Rabo-de-Macaco (Monkey Tail)</option>
                    <option value="fishbone">🌊 Cacto Espinha-de-Peixe (Fishbone)</option>
                  </optgroup>

                  <optgroup label="🌳 Árvores Clássicas">
                    <option value="sakura">🌸 Cerejeira Japonesa (Sakura)</option>
                    <option value="oak">🌳 Carvalho Ancestral (Ancient Oak)</option>
                    <option value="willow">🍃 Salgueiro Chorão (Weeping Willow)</option>
                    <option value="maple">🍁 Bordo de Outono (Autumn Maple)</option>
                    <option value="birch">🪵 Vidoeiro Elegante (White Birch)</option>
                    <option value="cactus">🌵 Cacto Saguaro Gigante (Saguaro)</option>
                    <option value="bonsai">🪴 Mestre Bonsai (Miniature Zen)</option>
                    <option value="pine">🌲 Pinheiro-Silvestre (Scots Pine)</option>
                  </optgroup>

                  <optgroup label="🌿 Trepadeiras e Cipós">
                    <option value="ivy">🌿 Hera Inglesa (English Ivy)</option>
                    <option value="bougainvillea">🌺 Primavera Vibrante (Bougainvillea)</option>
                    <option value="liana">🐒 Cipó Selvagem (Jungle Liana)</option>
                    <option value="grapevine">🍇 Videira Farta (Grapevine)</option>
                    <option value="pothos">🌱 Jiboia Rasteira (Golden Pothos)</option>
                    <option value="trumpet_vine">➰ Trepadeira-Trombeta (Trumpet Vine)</option>
                  </optgroup>

                  <optgroup label="🌸 Flores Decorativas">
                    <option value="rose">🌹 Rosa Clássica (Classic Rose)</option>
                    <option value="sunflower">🌻 Girassol Radiante (Radiant Sunflower)</option>
                    <option value="lotus">🪷 Lótus Mística (Mystic Lotus)</option>
                    <option value="tulip">🌷 Tulipa Holandesa (Dutch Tulip)</option>
                    <option value="daisy">🌼 Margarida Silvestre (Wild Daisy)</option>
                    <option value="hibiscus">🌺 Hibisco Tropical (Tropical Hibiscus)</option>
                  </optgroup>

                  <optgroup label="🐨 Eucaliptos Especiais">
                    <option value="silver_eucalyptus">🍃 Eucalipto Prateado (Silver Dollar)</option>
                    <option value="rainbow_eucalyptus">🌈 Eucalipto Arco-Íris (Rainbow)</option>
                    <option value="giant_eucalyptus">🌲 Eucalipto Gigante (Mountain Ash)</option>
                  </optgroup>

                  <optgroup label="🍎 Árvores Frutíferas">
                    <option value="apple">🍎 Macieira Ancestral (Apple Tree)</option>
                    <option value="lemon">🍋 Limoeiro Cítrico (Lemon Tree)</option>
                    <option value="mango">🥭 Mangueira Tropical (Mango Tree)</option>
                    <option value="peach">🍑 Pessegueiro Suave (Peach Tree)</option>
                    <option value="cherry">🍒 Cerejeira Frutífera (Cherry Tree)</option>
                    <option value="orange">🍊 Laranjeira Farta (Orange Tree)</option>
                  </optgroup>

                  <optgroup label="🌴 Exóticos e Outros Biomas">
                    <option value="palm">🌴 Palmeira Imperial (Imperial Palm)</option>
                    <option value="bamboo">🎋 Bosque de Bambu (Bamboo Grove)</option>
                    <option value="mushroom">🍄 Cogumelo Gigante (Giant Mushroom)</option>
                    <option value="fern">🌿 Samambaia Pré-histórica (Ancient Fern)</option>
                    <option value="baobab">🍂 Baobá Majestoso (Majestic Baobab)</option>
                    <option value="wheat">🌾 Trigo Dourado (Golden Wheat)</option>
                    <option value="lichen">🪨 Líquen das Cavernas (Cave Lichen)</option>
                  </optgroup>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 bg-[#ebdccb]/40 border border-[#dfd4c5] p-2.5 rounded-xl">
                <button
                  onClick={handleGrowNewTree}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e6ccb2] hover:bg-[#ddb892] border border-[#b08968]/40 text-amber-950 font-bold text-xs rounded-lg transition-all"
                  title="Gera uma variação orgânica diferente com o mesmo DNA"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-800" />
                  <span>Brotar Nova</span>
                </button>
                <button
                  onClick={handleRandomizeTreeSliders}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e07a5f] hover:bg-[#d6684b] border border-[#c45a3f]/40 text-white font-bold text-xs rounded-lg transition-all"
                  title="Valores totalmente aleatórios para criar bizarrices!"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Randomizar</span>
                </button>
              </div>

              {/* Auto-rotate toggle */}
              <div className="flex items-center justify-between p-2.5 bg-white/40 border border-[#e8dac7] rounded-xl text-xs font-semibold">
                <span className="text-amber-900">Rotação da Câmera</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={() => setAutoRotate(!autoRotate)}
                  className="w-4 h-4 accent-coral cursor-pointer"
                />
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                {/* Trunk */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'trunk' ? null : 'trunk')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Estrutura de Galhos (Trunk)</span>
                    </span>
                    <span>{openSection === 'trunk' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'trunk' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Iterations (Nível Fractal)</span>
                          <span className="font-mono">{treeConfig.iterations}</span>
                        </div>
                        <input
                          type="range" min={1} max={5} step={1}
                          value={treeConfig.iterations}
                          onChange={(e) => setTreeConfig({ ...treeConfig, iterations: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Branch Split (Bifurcação)</span>
                          <span className="font-mono">{treeConfig.branchSplit}</span>
                        </div>
                        <input
                          type="range" min={1.0} max={5.0} step={0.1}
                          value={treeConfig.branchSplit}
                          onChange={(e) => setTreeConfig({ ...treeConfig, branchSplit: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Base Length (Altura)</span>
                          <span className="font-mono">{treeConfig.baseLength}</span>
                        </div>
                        <input
                          type="range" min={1.0} max={10.0} step={0.1}
                          value={treeConfig.baseLength}
                          onChange={(e) => setTreeConfig({ ...treeConfig, baseLength: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Base Radius (Espessura)</span>
                          <span className="font-mono">{treeConfig.baseRadius}</span>
                        </div>
                        <input
                          type="range" min={0.1} max={1.5} step={0.05}
                          value={treeConfig.baseRadius}
                          onChange={(e) => setTreeConfig({ ...treeConfig, baseRadius: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Spread Angle (Abertura)</span>
                          <span className="font-mono">{treeConfig.spreadAngle}°</span>
                        </div>
                        <input
                          type="range" min={0} max={90} step={1}
                          value={treeConfig.spreadAngle}
                          onChange={(e) => setTreeConfig({ ...treeConfig, spreadAngle: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Crookedness (Torção)</span>
                          <span className="font-mono">{treeConfig.crookedness}</span>
                        </div>
                        <input
                          type="range" min={0} max={100} step={1}
                          value={treeConfig.crookedness}
                          onChange={(e) => setTreeConfig({ ...treeConfig, crookedness: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Canopy */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'canopy' ? null : 'canopy')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      <span>Copas e Folhas (Canopy)</span>
                    </span>
                    <span>{openSection === 'canopy' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'canopy' && (
                    <div className="p-3.5 space-y-3.5 bg-white/30 text-xs text-amber-900">
                      <div className="flex items-center justify-between font-semibold border-b border-[#dfd4c5]/30 pb-2">
                        <span>Mostrar Folhas</span>
                        <input
                          type="checkbox"
                          checked={treeConfig.showLeaves}
                          onChange={() => setTreeConfig({ ...treeConfig, showLeaves: !treeConfig.showLeaves })}
                          className="w-4 h-4 accent-[#e07a5f] cursor-pointer"
                        />
                      </div>

                      {treeConfig.showLeaves && (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>Blob Radius (Tamanho)</span>
                              <span className="font-mono">{treeConfig.blobRadius}</span>
                            </div>
                            <input
                              type="range" min={0.5} max={3.0} step={0.1}
                              value={treeConfig.blobRadius}
                              onChange={(e) => setTreeConfig({ ...treeConfig, blobRadius: parseFloat(e.target.value) })}
                              className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between font-semibold">
                              <span>Fluffiness (Densidade)</span>
                              <span className="font-mono">{treeConfig.fluffiness}</span>
                            </div>
                            <input
                              type="range" min={0.1} max={2.0} step={0.05}
                              value={treeConfig.fluffiness}
                              onChange={(e) => setTreeConfig({ ...treeConfig, fluffiness: parseFloat(e.target.value) })}
                              className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className="flex items-center gap-1">
                            <Wind className="w-3.5 h-3.5 text-sky-600" />
                            <span>Wind Sway (Oscilação do Vento)</span>
                          </span>
                          <span className="font-mono">{treeConfig.windStrength}</span>
                        </div>
                        <input
                          type="range" min={0.0} max={2.0} step={0.1}
                          value={treeConfig.windStrength}
                          onChange={(e) => setTreeConfig({ ...treeConfig, windStrength: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Materials/Colors */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'colors' ? null : 'colors')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cores e Materiais</span>
                    </span>
                    <span>{openSection === 'colors' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'colors' && (
                    <div className="p-3.5 space-y-3 bg-white/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Tronco (Trunk Color)</span>
                        <input
                          type="color"
                          value={treeConfig.trunkColor}
                          onChange={(e) => setTreeConfig({ ...treeConfig, trunkColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Copa / Folhas (Leaf Color)</span>
                        <input
                          type="color"
                          value={treeConfig.leafColor}
                          onChange={(e) => setTreeConfig({ ...treeConfig, leafColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ==================== 🪨 ROCK CONFIGURATORS ==================== */}
          {activeTab === 'rock' && (
            <>
              {/* Preset Selector */}
              <div className="space-y-1.5 bg-white/40 border border-[#e8dac7] p-3 rounded-xl">
                <label className="text-xs font-bold text-amber-950 block">Espécie de Rocha</label>
                <select
                  value={rockConfig.stylePreset}
                  onChange={(e) => applyRockPreset(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none"
                >
                  <option value="boulder">🪨 Seixo / Matacão Musgoso (Boulder)</option>
                  <option value="crystal">💎 Drusa de Cristal (Crystal Cluster)</option>
                  <option value="obsidian">🌌 Vidro de Vulcão (Obsidian Veins)</option>
                  <option value="meteorite">☄️ Meteorito Cósmico (Crater Meteorite)</option>
                  <option value="sandstone">🥪 Arenito Desértico (Sandstone Slab)</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 bg-[#ebdccb]/40 border border-[#dfd4c5] p-2.5 rounded-xl">
                <button
                  onClick={handleGrowNewRock}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e6ccb2] hover:bg-[#ddb892] border border-[#b08968]/40 text-amber-950 font-bold text-xs rounded-lg transition-all"
                  title="Gera uma variação de rocha diferente sob o mesmo DNA"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-800" />
                  <span>Brotar Nova</span>
                </button>
                <button
                  onClick={handleRandomizeRockSliders}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e07a5f] hover:bg-[#d6684b] border border-[#c45a3f]/40 text-white font-bold text-xs rounded-lg transition-all"
                  title="Randomiza totalmente o formato, cor, musgo e cristais!"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Randomizar</span>
                </button>
              </div>

              {/* Auto rotate */}
              <div className="flex items-center justify-between p-2.5 bg-white/40 border border-[#e8dac7] rounded-xl text-xs font-semibold">
                <span className="text-amber-900">Rotação da Câmera</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={() => setAutoRotate(!autoRotate)}
                  className="w-4 h-4 accent-coral cursor-pointer"
                />
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                {/* Form & Shape */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'shape' ? null : 'shape')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Formato e Proporções (Shape)</span>
                    </span>
                    <span>{openSection === 'shape' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'shape' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Radius (Raio Base)</span>
                          <span className="font-mono">{rockConfig.radius}</span>
                        </div>
                        <input
                          type="range" min={0.2} max={1.5} step={0.05}
                          value={rockConfig.radius}
                          onChange={(e) => setRockConfig({ ...rockConfig, radius: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Ruggedness (Rugosidade/Torção)</span>
                          <span className="font-mono">{rockConfig.ruggedness}%</span>
                        </div>
                        <input
                          type="range" min={0} max={100} step={1}
                          value={rockConfig.ruggedness}
                          onChange={(e) => setRockConfig({ ...rockConfig, ruggedness: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1 border-t border-[#dfd4c5]/30 pt-2 text-[10px] uppercase font-bold text-amber-900/60 tracking-wider">
                        Não-Uniform Scaling:
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Scale X (Largura)</span>
                          <span className="font-mono">{rockConfig.scaleX}</span>
                        </div>
                        <input
                          type="range" min={0.4} max={2.5} step={0.05}
                          value={rockConfig.scaleX}
                          onChange={(e) => setRockConfig({ ...rockConfig, scaleX: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Scale Y (Altura)</span>
                          <span className="font-mono">{rockConfig.scaleY}</span>
                        </div>
                        <input
                          type="range" min={0.2} max={2.5} step={0.05}
                          value={rockConfig.scaleY}
                          onChange={(e) => setRockConfig({ ...rockConfig, scaleY: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Scale Z (Profundidade)</span>
                          <span className="font-mono">{rockConfig.scaleZ}</span>
                        </div>
                        <input
                          type="range" min={0.4} max={2.5} step={0.05}
                          value={rockConfig.scaleZ}
                          onChange={(e) => setRockConfig({ ...rockConfig, scaleZ: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Moss Cap Option */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'moss' ? null : 'moss')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Placa de Musgo / Neve (Moss)</span>
                    </span>
                    <span>{openSection === 'moss' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'moss' && (
                    <div className="p-3.5 space-y-3.5 bg-white/30 text-xs">
                      <div className="flex items-center justify-between font-semibold text-amber-900">
                        <span>Habilitar Cobertura (Top Cap)</span>
                        <input
                          type="checkbox"
                          checked={rockConfig.hasMoss}
                          disabled={rockConfig.stylePreset === 'crystal'}
                          onChange={() => setRockConfig({ ...rockConfig, hasMoss: !rockConfig.hasMoss })}
                          className="w-4 h-4 accent-[#e07a5f] cursor-pointer"
                        />
                      </div>

                      {rockConfig.hasMoss && rockConfig.stylePreset !== 'crystal' && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">Cor da Cobertura</span>
                          <input
                            type="color"
                            value={rockConfig.mossColor}
                            onChange={(e) => setRockConfig({ ...rockConfig, mossColor: e.target.value })}
                            className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Crystal options */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'crystals' ? null : 'crystals')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>Cristais e Veias de Luz</span>
                    </span>
                    <span>{openSection === 'crystals' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'crystals' && (
                    <div className="p-3.5 space-y-3.5 bg-white/30 text-xs">
                      <div className="flex items-center justify-between font-semibold text-amber-900">
                        <span>Mostrar Cristais Injetados</span>
                        <input
                          type="checkbox"
                          checked={rockConfig.hasCrystals}
                          onChange={() => setRockConfig({ ...rockConfig, hasCrystals: !rockConfig.hasCrystals })}
                          className="w-4 h-4 accent-[#e07a5f] cursor-pointer"
                        />
                      </div>

                      {rockConfig.hasCrystals && (
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">Brilho do Cristal</span>
                          <input
                            type="color"
                            value={rockConfig.crystalColor}
                            onChange={(e) => setRockConfig({ ...rockConfig, crystalColor: e.target.value })}
                            className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'rockcolors' ? null : 'rockcolors')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cor da Rocha</span>
                    </span>
                    <span>{openSection === 'rockcolors' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'rockcolors' && (
                    <div className="p-3.5 space-y-3 bg-white/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Rocha Sólida</span>
                        <input
                          type="color"
                          value={rockConfig.rockColor}
                          onChange={(e) => setRockConfig({ ...rockConfig, rockColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ==================== 🏡 CABIN CONFIGURATORS ==================== */}
          {activeTab === 'house' && (
            <>
              {/* 🏛️ BANCO DE DADOS DE CONSTRUÇÕES */}
              <div className="space-y-3 bg-white/75 border-2 border-amber-800 p-4 rounded-xl shadow-md backdrop-blur-md">
                <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
                  <BookOpen className="w-4 h-4 text-amber-800" />
                  <span className="font-bold text-amber-950 text-xs tracking-wide uppercase">Grimório de Projetos (Database)</span>
                </div>
                
                <p className="text-[10px] text-amber-950 leading-relaxed font-semibold">
                  Selecione um local histórico da lista para carregar seu DNA procedural e sua descrição detalhada de arquitetura e materiais.
                </p>

                {/* Filtros de Categoria */}
                <div className="flex flex-wrap gap-1">
                  {['Todos', 'Comércio e Serviços', 'Governo e Segurança', 'Religião e Magia', 'Residencial e Social', 'Submundo e Entretenimento'].map((cat) => {
                    const labelMap: Record<string, string> = {
                      'Todos': 'Todos',
                      'Comércio e Serviços': 'Comércio',
                      'Governo e Segurança': 'Governo',
                      'Religião e Magia': 'Magia/Fé',
                      'Residencial e Social': 'Social',
                      'Submundo e Entretenimento': 'Submundo'
                    };
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          // Select the first building of the new category to avoid keeping a stale selection
                          const filtered = BUILDING_DATABASE.filter(b => cat === 'Todos' || b.category === cat);
                          if (filtered.length > 0) {
                            setSelectedBuildingId(filtered[0].id);
                          }
                        }}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-amber-800 text-white shadow-sm'
                            : 'bg-amber-950/5 text-amber-900 hover:bg-amber-950/10'
                        }`}
                      >
                        {labelMap[cat] || cat}
                      </button>
                    );
                  })}
                </div>

                {/* Caixa de Busca */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-amber-800" />
                  <input
                    type="text"
                    placeholder="Buscar nome do local..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none"
                  />
                </div>

                {/* Seletor de Prédio Filtrado */}
                {(() => {
                  const filtered = BUILDING_DATABASE.filter((b) => {
                    const matchesCat = selectedCategory === 'Todos' || b.category === selectedCategory;
                    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          b.type.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCat && matchesSearch;
                  });

                  // Try to find the selected one, or default to the first filtered entry
                  let activeBuilding = BUILDING_DATABASE.find(b => b.id === selectedBuildingId);
                  if (!activeBuilding || !filtered.some(f => f.id === activeBuilding?.id)) {
                    activeBuilding = filtered[0] || BUILDING_DATABASE[0];
                  }

                  return (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-950 block">Escolha o Local:</label>
                        <select
                          value={activeBuilding?.id || ''}
                          onChange={(e) => setSelectedBuildingId(e.target.value)}
                          className="w-full p-2 rounded-lg border border-amber-800/40 bg-white text-xs text-amber-950 font-semibold focus:outline-none"
                        >
                          {filtered.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name} ({b.type})
                            </option>
                          ))}
                          {filtered.length === 0 && (
                            <option value="">Nenhum resultado encontrado</option>
                          )}
                        </select>
                      </div>

                      {activeBuilding && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg space-y-2 text-xs text-amber-950 shadow-inner">
                          {/* Nome do Local */}
                          <div className="border-b border-amber-200 pb-1.5">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-700 block">NOME DO LOCAL</span>
                            <span className="font-extrabold text-xs text-amber-950">{activeBuilding.name}</span>
                          </div>

                          {/* Tipo / Categoria */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-amber-800">
                            <div>
                              <span className="text-amber-600 block text-[9px] uppercase font-extrabold">CATEGORIA</span>
                              <span>{activeBuilding.category}</span>
                            </div>
                            <div className="border-l border-amber-200 pl-2">
                              <span className="text-amber-600 block text-[9px] uppercase font-extrabold">TIPO / VARIAÇÃO</span>
                              <span className="block leading-tight text-amber-950 font-semibold">{activeBuilding.type}</span>
                              <span className="block text-[9px] text-amber-700 font-medium leading-tight">{activeBuilding.variation}</span>
                            </div>
                          </div>

                          {/* Arquitetura & Materiais */}
                          <div className="bg-[#fcfaf7] border border-[#e8dac7] p-2.5 rounded text-[11px] leading-relaxed text-amber-900 font-medium max-h-36 overflow-y-auto shadow-inner">
                            <span className="text-[9px] uppercase font-extrabold text-amber-700 block mb-0.5">ARQUITETURA & MATERIAIS</span>
                            {activeBuilding.architectureMaterials}
                          </div>

                          {/* Botão de Aplicar DNA */}
                          <button
                            onClick={() => activeBuilding && handleApplyBuildingDesign(activeBuilding)}
                            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              justAppliedId === activeBuilding.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-800 hover:bg-amber-900 text-white shadow-sm hover:shadow-md'
                            }`}
                          >
                            {justAppliedId === activeBuilding.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>DNA Aplicado com Sucesso!</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>🧬 Carregar DNA 3D no Pedestal</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Linha Divisória Decorativa */}
              <div className="h-px bg-[#dfd4c5] my-4" />

              {/* Preset Selector */}
              <div className="space-y-1.5 bg-white/40 border border-[#e8dac7] p-3 rounded-xl">
                <label className="text-xs font-bold text-amber-950 block">Arquitetura de Cabana (Básica)</label>
                <select
                  value={houseConfig.stylePreset}
                  onChange={(e) => applyHousePreset(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none"
                >
                  <option value="cabin">🏡 Cabana de Madeira (Red Barn Cabin)</option>
                  <option value="modern">🌇 Mansão Minimalista (Flat Modern Slate)</option>
                  <option value="castle">🏰 Torre de Fortaleza (Spired Keep)</option>
                  <option value="wizard">🔮 Spire do Mago (Wizard Spire)</option>
                  <option value="nordic">❄️ Chalé Nórdico (A-Frame Lodge)</option>
                </select>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 bg-[#ebdccb]/40 border border-[#dfd4c5] p-2.5 rounded-xl">
                <button
                  onClick={handleGrowNewHouse}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e6ccb2] hover:bg-[#ddb892] border border-[#b08968]/40 text-amber-950 font-bold text-xs rounded-lg transition-all"
                  title="Gera uma fumaça de chaminé diferente com os mesmos controles"
                >
                  <RotateCw className="w-3.5 h-3.5 text-amber-800" />
                  <span>Brotar Nova</span>
                </button>
                <button
                  onClick={handleRandomizeHouseSliders}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#e07a5f] hover:bg-[#d6684b] border border-[#c45a3f]/40 text-white font-bold text-xs rounded-lg transition-all"
                  title="Valores totalmente aleatórios para criar vilarejos divertidos!"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Randomizar</span>
                </button>
              </div>

              {/* Auto rotate */}
              <div className="flex items-center justify-between p-2.5 bg-white/40 border border-[#e8dac7] rounded-xl text-xs font-semibold">
                <span className="text-amber-900">Rotação da Câmera</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={() => setAutoRotate(!autoRotate)}
                  className="w-4 h-4 accent-coral cursor-pointer"
                />
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                {/* Walls & Dimensions */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'walls' ? null : 'walls')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Estrutura e Paredes (Base)</span>
                    </span>
                    <span>{openSection === 'walls' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'walls' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Width (Largura)</span>
                          <span className="font-mono">{houseConfig.width}</span>
                        </div>
                        <input
                          type="range" min={0.3} max={1.5} step={0.05}
                          value={houseConfig.width}
                          onChange={(e) => setHouseConfig({ ...houseConfig, width: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Length (Profundidade)</span>
                          <span className="font-mono">{houseConfig.length}</span>
                        </div>
                        <input
                          type="range" min={0.3} max={1.5} step={0.05}
                          value={houseConfig.length}
                          onChange={(e) => setHouseConfig({ ...houseConfig, length: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Height (Altura da Parede)</span>
                          <span className="font-mono">{houseConfig.height}</span>
                        </div>
                        <input
                          type="range" min={0.2} max={1.5} step={0.05}
                          value={houseConfig.height}
                          onChange={(e) => setHouseConfig({ ...houseConfig, height: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Roof Style */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'roof' ? null : 'roof')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-700" />
                      <span>Estilo do Telhado (Roof)</span>
                    </span>
                    <span>{openSection === 'roof' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'roof' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-amber-900 block">Tipo de Telhado</label>
                        <select
                          value={houseConfig.roofType}
                          onChange={(e) => setHouseConfig({ ...houseConfig, roofType: e.target.value as any })}
                          className="w-full p-2 rounded border border-[#dfd4c5] bg-white text-xs font-medium focus:outline-none"
                        >
                          <option value="cone">Cone / Pirâmide Simples</option>
                          <option value="gabled">Duas Águas (Nordic Lodge / A-Frame)</option>
                          <option value="flat">Laje Minimalista (Modern Slab)</option>
                          <option value="spire">Agulha / Torre de Feiticeiro (Wizard Spire)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Roof Height (Altura do Telhado)</span>
                          <span className="font-mono">{houseConfig.roofHeight}</span>
                        </div>
                        <input
                          type="range" min={0.05} max={1.2} step={0.05}
                          value={houseConfig.roofHeight}
                          onChange={(e) => setHouseConfig({ ...houseConfig, roofHeight: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Roof Overhang (Aba do Telhado)</span>
                          <span className="font-mono">{houseConfig.roofOverhang}</span>
                        </div>
                        <input
                          type="range" min={0.0} max={0.4} step={0.02}
                          value={houseConfig.roofOverhang}
                          onChange={(e) => setHouseConfig({ ...houseConfig, roofOverhang: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional additions */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'additions' ? null : 'additions')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layout className="w-3.5 h-3.5 text-blue-800" />
                      <span>Detalhes: Janelas, Chaminé, Varanda</span>
                    </span>
                    <span>{openSection === 'additions' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'additions' && (
                    <div className="p-3.5 space-y-3.5 bg-white/30 text-xs text-amber-900">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span>Window Count (Número de Janelas)</span>
                          <span className="font-mono">{houseConfig.windowCount}</span>
                        </div>
                        <input
                          type="range" min={0} max={4} step={1}
                          value={houseConfig.windowCount}
                          onChange={(e) => setHouseConfig({ ...houseConfig, windowCount: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center justify-between font-semibold border-t border-[#dfd4c5]/30 pt-2">
                        <span>Chaminé com Fumaça</span>
                        <input
                          type="checkbox"
                          checked={houseConfig.hasChimney}
                          onChange={() => setHouseConfig({ ...houseConfig, hasChimney: !houseConfig.hasChimney })}
                          className="w-4 h-4 accent-[#e07a5f] cursor-pointer"
                        />
                      </div>

                      {houseConfig.hasChimney && (
                        <div className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span>Altura da Chaminé</span>
                            <span className="font-mono">{houseConfig.chimneyHeight}</span>
                          </div>
                          <input
                            type="range" min={0.1} max={0.6} step={0.05}
                            value={houseConfig.chimneyHeight}
                            onChange={(e) => setHouseConfig({ ...houseConfig, chimneyHeight: parseFloat(e.target.value) })}
                            className="w-full h-1 bg-[#dfd4c5] accent-[#e07a5f] rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between font-semibold border-t border-[#dfd4c5]/30 pt-2">
                        <span>Varanda com Colunas</span>
                        <input
                          type="checkbox"
                          checked={houseConfig.hasPorch}
                          onChange={() => setHouseConfig({ ...houseConfig, hasPorch: !houseConfig.hasPorch })}
                          className="w-4 h-4 accent-[#e07a5f] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'housecolors' ? null : 'housecolors')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cores da Construção</span>
                    </span>
                    <span>{openSection === 'housecolors' ? '▲' : '▼'}</span>
                  </button>

                  {openSection === 'housecolors' && (
                    <div className="p-3.5 space-y-3 bg-white/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Paredes (Walls)</span>
                        <input
                          type="color"
                          value={houseConfig.wallColor}
                          onChange={(e) => setHouseConfig({ ...houseConfig, wallColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Telhado (Roof)</span>
                        <input
                          type="color"
                          value={houseConfig.roofColor}
                          onChange={(e) => setHouseConfig({ ...houseConfig, roofColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Portas e Postes</span>
                        <input
                          type="color"
                          value={houseConfig.doorColor}
                          onChange={(e) => setHouseConfig({ ...houseConfig, doorColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Glow das Janelas</span>
                        <input
                          type="color"
                          value={houseConfig.windowGlowColor}
                          onChange={(e) => setHouseConfig({ ...houseConfig, windowGlowColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ==================== 🌿 GRASS CONFIGURATORS ==================== */}
          {activeTab === 'grass' && (
            <>
              {/* Top Controls: Preset & Seed */}
              <div className="flex gap-2">
                <button
                  onClick={handleGrowNewGrass}
                  className="flex-1 py-2 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-500 hover:to-green-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Nova Semente</span>
                </button>
              </div>

              {/* Export Config */}
              <div className="space-y-2 bg-white/60 border border-[#dfd4c5] p-3 rounded-xl">
                <label className="text-xs font-bold text-amber-950 block">Salvar / Exportar Bioma</label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={exportName}
                    onChange={(e) => setExportName(e.target.value)}
                    placeholder="Nome da semente..."
                    className="w-full p-2 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none focus:border-lime-500"
                  />
                  <button
                    onClick={handleExportGrassConfig}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer relative"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{showExportSuccess ? 'Copiado para Área de Transferência!' : 'Exportar Semente (JSON)'}</span>
                  </button>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="space-y-1.5 bg-white/40 border border-[#dfd4c5] p-3 rounded-xl">
                <label className="text-xs font-bold text-amber-950 block">Bioma da Grama</label>
                <select
                  value={grassConfig.stylePreset}
                  onChange={(e) => applyGrassPreset(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#dfd4c5] bg-white text-xs text-amber-950 font-medium focus:outline-none"
                >
                  <option value="sunny_day">🌿 Campo Verdejante (Sunny Day)</option>
                  <option value="lush_forest">🌲 Floresta Densa (Lush Forest)</option>
                  <option value="dry_savanna">🌾 Savana Seca (Dry Savanna)</option>
                  <option value="burnt_ash">🔥 Cinzas Queimadas (Burnt Ash)</option>
                  <option value="alien_glow">👽 Brilho Alienígena (Alien Glow)</option>
                  <option value="custom">✨ Semente Personalizada (Custom)</option>
                </select>
              </div>

              {/* Subcategories */}
              <div className="space-y-3">
                {/* Grass Geometry */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'grass' ? null : 'grass')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-700" />
                      <span>Geometria da Grama</span>
                    </span>
                    <span>{openSection === 'grass' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'grass' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Densidade (Density)</span>
                          <span className="font-mono">{grassConfig.density}</span>
                        </div>
                        <input
                          type="range" min={2} max={15} step={1}
                          value={grassConfig.density}
                          onChange={(e) => setGrassConfig({ ...grassConfig, density: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-lime-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Altura (Height)</span>
                          <span className="font-mono">{grassConfig.bladeHeight.toFixed(2)}</span>
                        </div>
                        <input
                          type="range" min={0.3} max={3.0} step={0.1}
                          value={grassConfig.bladeHeight}
                          onChange={(e) => setGrassConfig({ ...grassConfig, bladeHeight: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-lime-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Largura (Width)</span>
                          <span className="font-mono">{grassConfig.bladeWidth.toFixed(2)}</span>
                        </div>
                        <input
                          type="range" min={0.05} max={0.5} step={0.05}
                          value={grassConfig.bladeWidth}
                          onChange={(e) => setGrassConfig({ ...grassConfig, bladeWidth: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-lime-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Segmentos (Detail)</span>
                          <span className="font-mono">{grassConfig.bladeDetail}</span>
                        </div>
                        <input
                          type="range" min={2} max={10} step={1}
                          value={grassConfig.bladeDetail}
                          onChange={(e) => setGrassConfig({ ...grassConfig, bladeDetail: parseInt(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-lime-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Physics */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'physics' ? null : 'physics')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-amber-700" />
                      <span>Física do Vento</span>
                    </span>
                    <span>{openSection === 'physics' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'physics' && (
                    <div className="p-3.5 space-y-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Força do Vento (Strength)</span>
                          <span className="font-mono">{grassConfig.windStrength.toFixed(2)}</span>
                        </div>
                        <input
                          type="range" min={0.0} max={3.0} step={0.1}
                          value={grassConfig.windStrength}
                          onChange={(e) => setGrassConfig({ ...grassConfig, windStrength: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-blue-500 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Velocidade de Simulação (Speed)</span>
                          <span className="font-mono">{grassConfig.simulationSpeed.toFixed(2)}</span>
                        </div>
                        <input
                          type="range" min={0.1} max={3.0} step={0.1}
                          value={grassConfig.simulationSpeed}
                          onChange={(e) => setGrassConfig({ ...grassConfig, simulationSpeed: parseFloat(e.target.value) })}
                          className="w-full h-1 bg-[#dfd4c5] accent-blue-500 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="border border-[#dfd4c5] rounded-xl overflow-hidden bg-white/45">
                  <button
                    onClick={() => setOpenSection(openSection === 'grasscolors' ? null : 'grasscolors')}
                    className="w-full px-3 py-2.5 bg-[#ebdccb]/70 hover:bg-[#ebdccb] text-xs font-bold flex items-center justify-between transition-colors text-amber-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <Paintbrush className="w-3.5 h-3.5 text-amber-700" />
                      <span>Cores do Bioma</span>
                    </span>
                    <span>{openSection === 'grasscolors' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'grasscolors' && (
                    <div className="p-3.5 space-y-3 bg-white/30 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Cor Base (Raiz)</span>
                        <input
                          type="color"
                          value={grassConfig.baseColor}
                          onChange={(e) => setGrassConfig({ ...grassConfig, baseColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Cor do Topo (Ponta)</span>
                        <input
                          type="color"
                          value={grassConfig.tipColor}
                          onChange={(e) => setGrassConfig({ ...grassConfig, tipColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-amber-900">Cor da Terra (Solo)</span>
                        <input
                          type="color"
                          value={grassConfig.groundColor}
                          onChange={(e) => setGrassConfig({ ...grassConfig, groundColor: e.target.value })}
                          className="w-7 h-7 rounded border border-[#dfd4c5] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

        {/* BOTTOM GLOBAL SAVE & APPLY BAR */}
        <div className="p-4 border-t border-[#dfd4c5] bg-[#ebdccb] flex flex-col gap-2">
          <button
            onClick={handleExportAndSave}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-[#e07a5f] to-amber-600 hover:from-emerald-500 hover:to-[#e68a71] text-white font-extrabold text-xs rounded-xl tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Usar {activeTab === 'tree' ? 'Árvore' : activeTab === 'rock' ? 'Rocha' : activeTab === 'house' ? 'Cabana' : 'Grama'} no Mundo</span>
          </button>
        </div>

      </div>

    </div>
  );
}
