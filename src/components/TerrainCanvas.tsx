import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TerrainConfig, TerrainStats, PlacedObject } from '../types';
import { SeededPerlinNoise, SeededRandom } from '../utils/noise';
import { THEMES } from '../utils/themes';
import { createTreeMesh, createRockMesh, createGrassMesh, createHouseMesh, createPathMesh } from '../utils/generators';
import { CustomTreeConfig, buildCustomTree } from '../utils/treeGenerator';
import { CustomRockConfig, buildCustomRock } from '../utils/rockGenerator';
import { CustomHouseConfig, buildCustomHouse } from '../utils/houseGenerator';
import { CustomGrassConfig, buildCustomGrass } from '../utils/grassGenerator';

interface TerrainCanvasProps {
  config: TerrainConfig;
  customObjects: PlacedObject[];
  onAddCustomObject: (obj: PlacedObject) => void;
  activeTool: string;
  onUpdateStats: (stats: TerrainStats) => void;
  customTreeConfig: CustomTreeConfig | null;
  customRockConfig: CustomRockConfig | null;
  customHouseConfig: CustomHouseConfig | null;
  customGrassConfig: CustomGrassConfig | null;
}

export default function TerrainCanvas({
  config,
  customObjects,
  onAddCustomObject,
  activeTool,
  onUpdateStats,
  customTreeConfig,
  customRockConfig,
  customHouseConfig,
  customGrassConfig
}: TerrainCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef(new THREE.Clock());
  
  // Refs to share objects with animate loop and event handlers
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const hoverMarkerRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const customObjectsGroupRef = useRef<THREE.Group | null>(null);
  const proceduralGroupRef = useRef<THREE.Group | null>(null);
  
  // State for raycast inspector info
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; z: number; biome: string } | null>(null);
  
  // We keep track of the activeTool in a ref so native event listeners can access it without closures
  const activeToolRef = useRef(activeTool);
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // We maintain a 2D grid of actual heights to support real-time sculpting!
  const heightGridRef = useRef<number[][]>([]);
  const baseNoiseRef = useRef<SeededPerlinNoise | null>(null);

  // We keep a callback reference for adding custom objects to avoid closure staleness in Three.js events
  const onAddCustomObjectRef = useRef(onAddCustomObject);
  useEffect(() => {
    onAddCustomObjectRef.current = onAddCustomObject;
  }, [onAddCustomObject]);

  // Size of the physical terrain in world units
  const TERRAIN_SIZE = 40;

  // Evaluate the height at fractional grid coordinates
  const getHeightAtWorldCoords = (wx: number, wz: number): number => {
    if (heightGridRef.current.length === 0) return 0;
    
    // Map world coordinates [-TERRAIN_SIZE/2, TERRAIN_SIZE/2] to grid index [0, resolution]
    const res = config.resolution;
    const halfSize = TERRAIN_SIZE / 2;
    
    const gx = ((wx + halfSize) / TERRAIN_SIZE) * res;
    const gz = ((wz + halfSize) / TERRAIN_SIZE) * res;
    
    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);
    
    if (x0 < 0 || x0 >= res || z0 < 0 || z0 >= res) {
      // Fallback to noise if out of bounds
      if (baseNoiseRef.current) {
        let h = baseNoiseRef.current.fBm(wx * config.noiseScale, wz * config.noiseScale, config.noiseOctaves);
        h = (h + 1) / 2; // [0, 1]
        if (config.isTerraced) {
          h = Math.floor(h * config.terraceSteps) / config.terraceSteps;
        }
        return h * config.maxHeight;
      }
      return 0;
    }
    
    // Simple bilinear interpolation of heights on the grid
    const x1 = Math.min(x0 + 1, res);
    const z1 = Math.min(z0 + 1, res);
    
    const tx = gx - x0;
    const tz = gz - z0;
    
    const h00 = heightGridRef.current[x0][z0];
    const h10 = heightGridRef.current[x1][z0];
    const h01 = heightGridRef.current[x0][z1];
    const h11 = heightGridRef.current[x1][z1];
    
    const h0 = h00 * (1 - tx) + h10 * tx;
    const h1 = h01 * (1 - tx) + h11 * tx;
    
    return h0 * (1 - tz) + h1 * tz;
  };

  // Helper to determine biome name by height fraction
  const getBiomeName = (heightVal: number): string => {
    const norm = heightVal / config.maxHeight;
    const waterNorm = config.waterLevel / config.maxHeight;
    
    if (norm < waterNorm) return config.themeId === 'volcanic' ? 'Fundo de Lava' : 'Oceano';
    if (norm < waterNorm + 0.05) return config.themeId === 'volcanic' ? 'Margem de Cinza' : 'Praia de Areia';
    if (norm < 0.65) return config.themeId === 'volcanic' ? 'Vale Calcinado' : 'Planície / Campo';
    if (norm < 0.85) return 'Maciço Rochoso';
    return config.themeId === 'volcanic' ? 'Pico de Enxofre' : 'Pico Nevado';
  };

  // Build / Re-generate the entire scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    const startTime = performance.now();
    
    // --- 1. INITIALIZE THREE.JS CONTAINER ---
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 20, 28);
    cameraRef.current = camera;
    scene.add(camera);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = config.shadowsEnabled;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    
    // Clear old canvases
    containerRef.current.innerHTML = '';
    const canvasEl = renderer.domElement;
    containerRef.current.appendChild(canvasEl);
    
    // Attach native event listeners for clicking to bypass React/OrbitControls synthetic event swallows
    const onNativePointerDown = (e: PointerEvent) => handlePointerDown(e.clientX, e.clientY);
    const onNativePointerUp = (e: PointerEvent) => handlePointerUp(e.clientX, e.clientY);
    canvasEl.addEventListener('pointerdown', onNativePointerDown);
    canvasEl.addEventListener('pointerup', onNativePointerUp);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1; // Don't go below ground level
    controls.minDistance = 5;
    controls.maxDistance = 120;
    controlsRef.current = controls;
    
    // --- 2. THEME & COLORS CONFIGURATION ---
    const themeColors = THEMES[config.themeId] || THEMES.forest;
    scene.background = new THREE.Color(themeColors.sky);
    
    // Fog
    if (config.fogDensity > 0) {
      scene.fog = new THREE.FogExp2(themeColors.fog, config.fogDensity);
    }
    
    // Lighting
    const ambientLight = new THREE.HemisphereLight(
      themeColors.sky,
      themeColors.ambientLight,
      0.4
    );
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(themeColors.dirLight, 0.85);
    dirLight.position.set(20, 30, 15);
    dirLight.castShadow = config.shadowsEnabled;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);
    
    // Soft subtle secondary light for better 3D depth shadows fill
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    // --- 3. PROCEDURAL TERRAIN GENERATION ---
    const res = config.resolution;
    const baseNoise = new SeededPerlinNoise(config.seed);
    baseNoiseRef.current = baseNoise;
    
    // Initialize height grid
    const heightGrid: number[][] = [];
    for (let x = 0; x <= res; x++) {
      heightGrid[x] = [];
      for (let z = 0; z <= res; z++) {
        // Map grid indexes to world coords [-TERRAIN_SIZE/2, TERRAIN_SIZE/2]
        const wx = (x / res) * TERRAIN_SIZE - (TERRAIN_SIZE / 2);
        const wz = (z / res) * TERRAIN_SIZE - (TERRAIN_SIZE / 2);
        
        // Compute fractal noise
        let h = baseNoise.fBm(wx * config.noiseScale, wz * config.noiseScale, config.noiseOctaves);
        h = (h + 1) / 2; // Normalize to [0, 1]
        
        // Terracing effect
        if (config.isTerraced) {
          h = Math.floor(h * config.terraceSteps) / config.terraceSteps;
        }
        
        heightGrid[x][z] = h * config.maxHeight;
      }
    }
    heightGridRef.current = heightGrid;

    // Construct custom BufferGeometry for the terrain
    const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, res, res);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane
    
    // Update geometry heights and vertex colors based on heightGrid
    const posAttribute = geometry.attributes.position;
    const colors: number[] = [];
    
    const deepWaterColor = new THREE.Color(themeColors.deepWater);
    const shallowWaterColor = new THREE.Color(themeColors.shallowWater);
    const sandColor = new THREE.Color(themeColors.sand);
    const grassColor = new THREE.Color(themeColors.grass);
    const rockColor = new THREE.Color(themeColors.rock);
    const snowColor = new THREE.Color(themeColors.snow);
    
    // Height distribution counters
    let countWater = 0;
    let countSand = 0;
    let countGrass = 0;
    let countRock = 0;
    let countSnow = 0;
    
    for (let i = 0; i < posAttribute.count; i++) {
      // Find grid coordinate (x, z) of this vertex
      const xIndex = i % (res + 1);
      const zIndex = Math.floor(i / (res + 1));
      
      const heightVal = heightGrid[xIndex][zIndex];
      posAttribute.setY(i, heightVal);
      
      // Compute color based on height percentage
      const norm = heightVal / config.maxHeight;
      const waterNorm = config.waterLevel / config.maxHeight;
      
      let vertexColor = new THREE.Color();
      
      if (norm < waterNorm) {
        // Deep to shallow water blend
        const t = norm / waterNorm;
        vertexColor.copy(deepWaterColor).lerp(shallowWaterColor, t);
        countWater++;
      } else if (norm < waterNorm + 0.05) {
        // Sand strip
        vertexColor.copy(sandColor);
        countSand++;
      } else if (norm < 0.65) {
        // Grass / Plains
        const t = (norm - (waterNorm + 0.05)) / (0.65 - (waterNorm + 0.05));
        vertexColor.copy(sandColor).lerp(grassColor, t * 0.4);
        vertexColor.copy(grassColor);
        countGrass++;
      } else if (norm < 0.85) {
        // Rock zone
        const t = (norm - 0.65) / (0.85 - 0.65);
        vertexColor.copy(grassColor).lerp(rockColor, t);
        countRock++;
      } else {
        // Snow peaks
        const t = Math.min((norm - 0.85) / 0.15, 1.0);
        vertexColor.copy(rockColor).lerp(snowColor, t);
        countSnow++;
      }
      
      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.85,
      metalness: 0.12,
      flatShading: true,
      wireframe: config.wireframeEnabled,
    });
    
    const terrainMesh = new THREE.Mesh(geometry, terrainMaterial);
    terrainMesh.name = 'terrain-mesh';
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // --- 4. WATER PLANE SETUP ---
    const waterGeom = new THREE.PlaneGeometry(TERRAIN_SIZE * 0.99, TERRAIN_SIZE * 0.99, 10, 10);
    waterGeom.rotateX(-Math.PI / 2);
    
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(themeColors.water),
      transparent: true,
      opacity: config.themeId === 'volcanic' ? 0.92 : 0.65, // Volcanic lava is thicker
      roughness: config.themeId === 'volcanic' ? 0.7 : 0.15,
      metalness: config.themeId === 'volcanic' ? 0.3 : 0.1,
      flatShading: true,
    });
    
    const waterMesh = new THREE.Mesh(waterGeom, waterMaterial);
    waterMesh.name = 'water-mesh';
    // Position slightly offset vertically to avoid Z-fighting at exactly 0 water level
    waterMesh.position.y = config.waterLevel;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // --- 5. SCATTER PROCEDURAL OBJECTS ---
    const proceduralGroup = new THREE.Group();
    proceduralGroup.name = 'procedural-objects';
    scene.add(proceduralGroup);
    proceduralGroupRef.current = proceduralGroup;

    const spawnRng = new SeededRandom(config.seed + 1024);
    
    // A function to generate random point on grid and check placement validity
    const getRandomTerrainPoint = (): { wx: number; wz: number; h: number; slope: number } | null => {
      const rx = spawnRng.range(-TERRAIN_SIZE / 2 * 0.92, TERRAIN_SIZE / 2 * 0.92);
      const rz = spawnRng.range(-TERRAIN_SIZE / 2 * 0.92, TERRAIN_SIZE / 2 * 0.92);
      
      const h = getHeightAtWorldCoords(rx, rz);
      
      // Calculate basic slope by evaluating heights nearby
      const sampleDist = 0.3;
      const hX = getHeightAtWorldCoords(rx + sampleDist, rz);
      const hZ = getHeightAtWorldCoords(rx, rz + sampleDist);
      const slope = Math.sqrt(Math.pow(hX - h, 2) + Math.pow(hZ - h, 2)) / sampleDist;
      
      return { wx: rx, wz: rz, h, slope };
    };

    let treesSpawned = 0;
    let rocksSpawned = 0;
    let grassSpawned = 0;

    // Spawn Trees (only above water, below snow, on gentle slopes)
    let treeAttempts = 0;
    while (treesSpawned < config.treeCount && treeAttempts < config.treeCount * 5) {
      treeAttempts++;
      const pt = getRandomTerrainPoint();
      if (!pt) continue;
      
      const isWet = pt.h < config.waterLevel + 0.3;
      const isSnowy = pt.h > config.maxHeight * 0.85;
      const isTooSteep = pt.slope > 0.45;
      
      if (!isWet && !isTooSteep && (!isSnowy || config.themeId === 'arctic' || config.themeId === 'volcanic')) {
        let tree: THREE.Object3D;
        if (customTreeConfig) {
          // Generate a custom tree with its specific DNA, but with a unique seed for organic variety!
          const randomSeedForTree = Math.floor(spawnRng.next() * 999999);
          tree = buildCustomTree({ ...customTreeConfig, seed: randomSeedForTree });
          tree.scale.multiplyScalar(0.75); // standard visual scale for world
        } else {
          tree = createTreeMesh(config.themeId, () => spawnRng.next());
        }
        tree.position.set(pt.wx, pt.h, pt.wz);
        proceduralGroup.add(tree);
        treesSpawned++;
      }
    }

    // Spawn Rocks (can grow on slopes or high heights, but not deep water)
    let rockAttempts = 0;
    while (rocksSpawned < config.rockCount && rockAttempts < config.rockCount * 5) {
      rockAttempts++;
      const pt = getRandomTerrainPoint();
      if (!pt) continue;
      
      const isDeepWater = pt.h < config.waterLevel - 1.0;
      
      if (!isDeepWater) {
        let rock: THREE.Object3D;
        const scale = 0.5 + spawnRng.next() * 1.5;
        if (customRockConfig) {
          const randomSeedForRock = Math.floor(spawnRng.next() * 999999);
          rock = buildCustomRock({ ...customRockConfig, seed: randomSeedForRock });
          rock.scale.multiplyScalar(0.75);
        } else {
          rock = createRockMesh(config.themeId, () => spawnRng.next());
        }
        rock.scale.multiplyScalar(scale);
        const embedFactor = customRockConfig ? 0.02 : 0.08;
        rock.position.set(pt.wx, pt.h - (scale * embedFactor), pt.wz);
        proceduralGroup.add(rock);
        rocksSpawned++;
      }
    }

    // Spawn Grass tufts (only on green plains, not in sand, snow, or water)
    let grassAttempts = 0;
    while (grassSpawned < config.grassCount && grassAttempts < config.grassCount * 5) {
      grassAttempts++;
      const pt = getRandomTerrainPoint();
      if (!pt) continue;
      
      const isWet = pt.h < config.waterLevel + 0.3;
      const isSnowy = pt.h > config.maxHeight * 0.7;
      const isTooSteep = pt.slope > 0.6;
      
      if (!isWet && !isTooSteep && !isSnowy) {
        let grass: THREE.Object3D;
        if (customGrassConfig) {
           // Create small tufts of grass for the procedural scatter
           grass = buildCustomGrass(
             { ...customGrassConfig, seed: Math.floor(spawnRng.next() * 999999), count: 50, density: 1.5 },
             false,
             (lx, lz) => (getHeightAtWorldCoords(pt.wx + lx * 0.2, pt.wz + lz * 0.2) - pt.h) / 0.2
           );
           grass.scale.multiplyScalar(0.2); // Adjust grass scale for terrain
        } else {
           grass = createGrassMesh(config.themeId, () => spawnRng.next());
        }
        grass.position.set(pt.wx, pt.h, pt.wz);
        proceduralGroup.add(grass);
        grassSpawned++;
      }
    }

    // --- 6. ADD CUSTOM USER-PLACED OBJECTS ---
    const customGroup = new THREE.Group();
    customGroup.name = 'custom-placed-objects';
    scene.add(customGroup);
    customObjectsGroupRef.current = customGroup;

    customObjects.forEach((obj) => {
      // Compute correct current terrain height for placed objects (in case config maxheight changed)
      const currentHeight = getHeightAtWorldCoords(obj.position[0], obj.position[2]);
      
      let mesh: THREE.Object3D;
      if (obj.type === 'tree') {
        if (customTreeConfig) {
          // Use the custom tree config, with a random seed so each placed tree is uniquely shaped!
          const randomSeedForTree = Math.floor(Math.random() * 999999);
          mesh = buildCustomTree({ ...customTreeConfig, seed: randomSeedForTree });
          mesh.scale.multiplyScalar(0.75);
        } else {
          mesh = createTreeMesh(config.themeId, () => Math.random());
        }
      } else if (obj.type === 'rock') {
        if (customRockConfig) {
          const randomSeedForRock = Math.floor(Math.random() * 999999);
          mesh = buildCustomRock({ ...customRockConfig, seed: randomSeedForRock });
          mesh.scale.multiplyScalar(0.75);
        } else {
          mesh = createRockMesh(config.themeId, () => Math.random());
        }
      } else if (obj.type === 'house') {
        if (customHouseConfig) {
          const randomSeedForHouse = Math.floor(Math.random() * 999999);
          mesh = buildCustomHouse({ ...customHouseConfig, seed: randomSeedForHouse });
          mesh.scale.multiplyScalar(0.75);
        } else {
          mesh = createHouseMesh();
        }
      } else if (obj.type.startsWith('path_')) {
        mesh = createPathMesh(obj.type, () => Math.random());
      } else {
        if (customGrassConfig) {
          // A placed grass patch is bigger than a scattered tuft, but smaller than the full 20k lab preview
          mesh = buildCustomGrass(
            { ...customGrassConfig, seed: Math.floor(Math.random() * 999999), count: 2000, density: customGrassConfig.density * 0.5 },
            false,
            (lx, lz) => (getHeightAtWorldCoords(obj.position[0] + lx * 0.4, obj.position[2] + lz * 0.4) - currentHeight) / 0.4
          );
          mesh.scale.multiplyScalar(0.4);
        } else {
          mesh = createGrassMesh(config.themeId, () => Math.random());
        }
      }
      
      mesh.position.set(obj.position[0], currentHeight, obj.position[2]);
      mesh.scale.multiplyScalar(obj.scale);
      mesh.rotation.y = obj.rotation;
      customGroup.add(mesh);
    });

    // --- 7. HOVER MARKER FOR INTERACTION ---
    const markerGeom = new THREE.RingGeometry(0.28, 0.35, 16);
    markerGeom.rotateX(-Math.PI / 2); // Lay flat
    const markerMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const hoverMarker = new THREE.Mesh(markerGeom, markerMat);
    hoverMarker.visible = false;
    scene.add(hoverMarker);
    hoverMarkerRef.current = hoverMarker;

    // --- 8. EMIT METRICS/STATS ---
    const totalVertices = posAttribute.count;
    const totalFaces = totalVertices - res;
    
    const totalDistribution = countWater + countSand + countGrass + countRock + countSnow;
    
    onUpdateStats({
      generationTimeMs: performance.now() - startTime,
      vertexCount: totalVertices,
      faceCount: totalFaces * 2, // Standard grid of quads = 2 triangles per quad
      placedTrees: treesSpawned,
      placedRocks: rocksSpawned,
      placedGrass: grassSpawned,
      heightDistribution: {
        water: (countWater / totalDistribution) * 100,
        sand: (countSand / totalDistribution) * 100,
        grass: (countGrass / totalDistribution) * 100,
        rock: (countRock / totalDistribution) * 100,
        snow: (countSnow / totalDistribution) * 100,
      }
    });

    // --- 9. ANIMATION LOOP ---
    const clock = clockRef.current;
    
    renderer.setAnimationLoop(() => {
      const elapsedTime = clock.getElapsedTime();
      
      // Animate water waves
      if (waterMeshRef.current) {
        // Subtle floating movement representing ocean tides
        waterMeshRef.current.position.y = config.waterLevel + Math.sin(elapsedTime * 1.2) * 0.05;
      }

      // Animate procedural shaders (e.g. grass wind)
      if (customObjectsGroupRef.current) {
        customObjectsGroupRef.current.traverse((child) => {
          if ((child as any).userData?.uniforms?.uTime) {
            (child as any).userData.uniforms.uTime.value = elapsedTime;
          }
        });
      }
      if (proceduralGroupRef.current) {
        proceduralGroupRef.current.traverse((child) => {
          if ((child as any).userData?.uniforms?.uTime) {
            (child as any).userData.uniforms.uTime.value = elapsedTime;
          }
        });
      }
      
      // Auto rotate camera around scene center
      if (config.autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 0.5;
        controlsRef.current.update();
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
        controlsRef.current.update();
      }
      
      renderer.render(scene, camera);
    });
    
    // --- 10. CLEANUP ON UNMOUNT OR REGEN ---
    return () => {
      renderer.setAnimationLoop(null);
      canvasEl.removeEventListener('pointerdown', onNativePointerDown);
      canvasEl.removeEventListener('pointerup', onNativePointerUp);
      renderer.dispose();
      geometry.dispose();
      waterGeom.dispose();
      markerGeom.dispose();
      terrainMaterial.dispose();
      waterMaterial.dispose();
      markerMat.dispose();
      controls.dispose();
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [config, customObjects]);

  // Handle Resize of canvas container
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
      
      if (rendererRef.current) {
        rendererRef.current.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 11. MOUSE HOVER & CLICK EVENT HANDLERS ---
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !sceneRef.current || !terrainMeshRef.current || !hoverMarkerRef.current) return;
    
    // Get mouse pos normalized [-1, 1]
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    
    // Find camera
    const camera = sceneRef.current.children.find(c => c instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
    if (!camera) return;
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    
    // Intersect only with terrain mesh
    const intersects = raycaster.intersectObject(terrainMeshRef.current);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const pt = intersect.point;
      
      // Update hover ring position and rotation to lay on terrain face
      hoverMarkerRef.current.position.copy(pt).add(new THREE.Vector3(0, 0.05, 0)); // Slightly offset up to prevent Z-fighting
      
      // If we have face normal, align ring with it!
      if (intersect.face) {
        const normal = intersect.face.normal.clone();
        normal.transformDirection(terrainMeshRef.current.matrixWorld); // Apply rotation
        
        // Align marker's UP vector with the surface normal
        const up = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);
        hoverMarkerRef.current.setRotationFromQuaternion(quaternion);
      }
      
      hoverMarkerRef.current.visible = true;
      
      // Update state for coordinate HUD panel
      setHoverInfo({
        x: pt.x,
        y: pt.y,
        z: pt.z,
        biome: getBiomeName(pt.y)
      });
    } else {
      hoverMarkerRef.current.visible = false;
      setHoverInfo(null);
    }
  };

  const handleMouseLeave = () => {
    if (hoverMarkerRef.current) {
      hoverMarkerRef.current.visible = false;
    }
    setHoverInfo(null);
  };

  const pointerDownPos = useRef<{x: number, y: number} | null>(null);

  const handlePointerDown = (clientX: number, clientY: number) => {
    pointerDownPos.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = (clientX: number, clientY: number) => {
    if (!pointerDownPos.current) return;
    const dx = clientX - pointerDownPos.current.x;
    const dy = clientY - pointerDownPos.current.y;
    pointerDownPos.current = null;
    
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) return; // Ignore drag
    
    handleCanvasClick(clientX, clientY);
  };

  const handleCanvasClick = (clientX: number, clientY: number) => {
    if (!containerRef.current || !sceneRef.current || !terrainMeshRef.current || !hoverMarkerRef.current) return;
    const currentTool = activeToolRef.current;
    if (currentTool === 'inspect') return; // Just inspects

    // Get click pos normalized [-1, 1]
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    const raycaster = new THREE.Raycaster();
    const camera = sceneRef.current.children.find(c => c instanceof THREE.PerspectiveCamera) as THREE.PerspectiveCamera;
    if (!camera) return;
    
    raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
    const intersects = raycaster.intersectObject(terrainMeshRef.current);
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const pt = intersect.point;
      
      if (currentTool === 'sculpt_up' || currentTool === 'sculpt_down') {
        // --- SCULPTING LANDSCAPE TOOL ---
        const radius = 2.0;
        const strength = currentTool === 'sculpt_up' ? 0.6 : -0.6;
        
        // Find vertices of the terrainMesh in range and modify their Y values
        const pos = terrainMeshRef.current.geometry.attributes.position;
        const res = config.resolution;
        
        // We modify our master 2D heightGrid to keep in sync!
        for (let gx = 0; gx <= res; gx++) {
          for (let gz = 0; gz <= res; gz++) {
            // Compute world position of this grid vertex
            const wx = (gx / res) * TERRAIN_SIZE - (TERRAIN_SIZE / 2);
            const wz = (gz / res) * TERRAIN_SIZE - (TERRAIN_SIZE / 2);
            
            // Distance from click point
            const dist = Math.sqrt(Math.pow(wx - pt.x, 2) + Math.pow(wz - pt.z, 2));
            
            if (dist < radius) {
              // Smooth bell curve falloff multiplier
              const falloff = Math.pow(Math.cos((dist / radius) * Math.PI / 2), 2);
              const delta = strength * falloff;
              
              // Apply change to height map grid, clamping to [0, maxelevation]
              const currentH = heightGridRef.current[gx][gz];
              const nextH = Math.max(0, Math.min(currentH + delta, config.maxHeight));
              heightGridRef.current[gx][gz] = nextH;
            }
          }
        }
        
        // Re-colorize and update mesh geometry vertices!
        const colors: number[] = [];
        const themeColors = THEMES[config.themeId] || THEMES.forest;
        
        const deepWaterColor = new THREE.Color(themeColors.deepWater);
        const shallowWaterColor = new THREE.Color(themeColors.shallowWater);
        const sandColor = new THREE.Color(themeColors.sand);
        const grassColor = new THREE.Color(themeColors.grass);
        const rockColor = new THREE.Color(themeColors.rock);
        const snowColor = new THREE.Color(themeColors.snow);
        
        for (let i = 0; i < pos.count; i++) {
          const xIndex = i % (res + 1);
          const zIndex = Math.floor(i / (res + 1));
          
          const heightVal = heightGridRef.current[xIndex][zIndex];
          pos.setY(i, heightVal);
          
          const norm = heightVal / config.maxHeight;
          const waterNorm = config.waterLevel / config.maxHeight;
          
          let vertexColor = new THREE.Color();
          
          if (norm < waterNorm) {
            const t = norm / waterNorm;
            vertexColor.copy(deepWaterColor).lerp(shallowWaterColor, t);
          } else if (norm < waterNorm + 0.05) {
            vertexColor.copy(sandColor);
          } else if (norm < 0.65) {
            vertexColor.copy(grassColor);
          } else if (norm < 0.85) {
            const t = (norm - 0.65) / (0.85 - 0.65);
            vertexColor.copy(grassColor).lerp(rockColor, t);
          } else {
            const t = Math.min((norm - 0.85) / 0.15, 1.0);
            vertexColor.copy(rockColor).lerp(snowColor, t);
          }
          
          colors[i * 3] = vertexColor.r;
          colors[i * 3 + 1] = vertexColor.g;
          colors[i * 3 + 2] = vertexColor.b;
        }
        
        // Notify three.js that values changed
        pos.needsUpdate = true;
        terrainMeshRef.current.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        terrainMeshRef.current.geometry.computeVertexNormals();
        
        // Re-align any custom placed objects with new heights
        if (customObjectsGroupRef.current) {
          customObjectsGroupRef.current.children.forEach((mesh, index) => {
            const obj = customObjects[index];
            if (obj) {
              const h = getHeightAtWorldCoords(obj.position[0], obj.position[2]);
              mesh.position.y = h;
            }
          });
        }
        
      } else {
        // --- SPAWNING DECORATION OBJECT TOOL ---
        let type: PlacedObject['type'] = 'tree';
        let scale = 1.0;
        
        if (currentTool === 'add_rock') {
          type = 'rock';
          scale = 0.6 + Math.random() * 0.8;
        } else if (currentTool === 'add_house') {
          type = 'house';
          scale = 0.9;
        } else if (currentTool === 'add_grass') {
          type = 'grass';
          scale = 1.0;
        } else if (currentTool === 'path_stone') {
          type = 'path_stone';
          scale = 1.0;
        } else if (currentTool === 'path_dirt') {
          type = 'path_dirt';
          scale = 1.0;
        } else if (currentTool === 'path_grass') {
          type = 'path_grass';
          scale = 1.0;
        } else if (currentTool === 'path_wood') {
          type = 'path_wood';
          scale = 1.0;
        } else {
          type = 'tree';
          scale = 0.85 + Math.random() * 0.3;
        }
        
        const newObj: PlacedObject = {
          id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          type,
          position: [pt.x, pt.y, pt.z],
          scale,
          rotation: Math.random() * Math.PI * 2
        };
        
        onAddCustomObjectRef.current(newObj);
      }
    }
  };

  return (
    <div className="flex-1 relative h-full w-full bg-slate-950 select-none">
      {/* 3D WebGL Canvas */}
      <div
        id="canvas-3d-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full w-full cursor-crosshair"
      />

      {/* Coordinate HUD panel (Bottom-left overlay) */}
      {hoverInfo && (
        <div 
          id="coordinate-hud" 
          className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800/80 rounded-lg py-2 px-3 text-slate-300 font-mono text-[10px] flex flex-col gap-1 shadow-lg backdrop-blur-sm pointer-events-none"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-500">POS:</span>
            <span className="text-slate-100 font-bold">
              X: {hoverInfo.x.toFixed(1)} / Z: {hoverInfo.z.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ELEV:</span>
            <span className="text-emerald-400 font-bold">
              Y: {hoverInfo.y.toFixed(2)}m
            </span>
          </div>
          <div className="flex items-center gap-2 border-t border-slate-800/60 pt-1 mt-1">
            <span className="text-slate-500">BIOMA:</span>
            <span className="text-sky-400 font-bold uppercase tracking-wider">
              {hoverInfo.biome}
            </span>
          </div>
        </div>
      )}

      {/* Interaction Help Overlay (Top-right overlay) */}
      <div 
        id="control-tutorial-overlay" 
        className="absolute top-4 right-4 bg-slate-950/75 border border-slate-800/50 rounded-lg p-3 text-slate-400 text-[10px] leading-normal shadow-md max-w-[210px] pointer-events-none"
      >
        <span className="font-bold text-slate-200 block mb-1">Controles de Visualização:</span>
        <ul className="list-disc pl-4 space-y-1">
          <li><b className="text-slate-300">Botão Esquerdo:</b> Girar câmera</li>
          <li><b className="text-slate-300">Botão Direito / Shift:</b> Arrastar mapa</li>
          <li><b className="text-slate-300">Scroll do Mouse:</b> Zoom</li>
        </ul>
        <span className="font-bold text-slate-200 block mt-2 mb-1">Dica de Construção:</span>
        <p>Selecione uma ferramenta no menu lateral e clique no mapa para colocar árvores, pedras ou cabanas!</p>
      </div>
    </div>
  );
}
