import * as THREE from 'three';
import { SeededRandom } from './noise';

export interface CustomGrassConfig {
  seed: number;
  count: number;
  density: number;
  bladeDetail: number;
  bladeWidth: number;
  bladeHeight: number;
  windStrength: number;
  simulationSpeed: number;
  baseColor: string;
  tipColor: string;
  groundColor: string;
  stylePreset: 'sunny_day' | 'dry_savanna' | 'alien_glow' | 'lush_forest' | 'burnt_ash' | 'custom';
}

type PresetKey = Exclude<CustomGrassConfig['stylePreset'], 'custom'>;

export const GRASS_PRESETS: Record<PresetKey, Omit<CustomGrassConfig, 'seed' | 'stylePreset'>> = {
  sunny_day: {
    count: 20000,
    density: 7,
    bladeDetail: 6,
    bladeWidth: 0.20,
    bladeHeight: 1.00,
    windStrength: 1.00,
    simulationSpeed: 0.80,
    baseColor: '#1d5c00',
    tipColor: '#e8e800',
    groundColor: '#5b4327',
  },
  dry_savanna: {
    count: 15000,
    density: 5,
    bladeDetail: 4,
    bladeWidth: 0.25,
    bladeHeight: 1.20,
    windStrength: 1.50,
    simulationSpeed: 1.20,
    baseColor: '#8b7d3a',
    tipColor: '#d6cd94',
    groundColor: '#7a5c3d',
  },
  lush_forest: {
    count: 25000,
    density: 9,
    bladeDetail: 6,
    bladeWidth: 0.15,
    bladeHeight: 0.80,
    windStrength: 0.50,
    simulationSpeed: 0.50,
    baseColor: '#0a3a14',
    tipColor: '#2b8f38',
    groundColor: '#302b21',
  },
  alien_glow: {
    count: 18000,
    density: 6,
    bladeDetail: 5,
    bladeWidth: 0.22,
    bladeHeight: 1.50,
    windStrength: 2.00,
    simulationSpeed: 1.50,
    baseColor: '#1a0d4a',
    tipColor: '#8a2be2',
    groundColor: '#0a0a0a',
  },
  burnt_ash: {
    count: 10000,
    density: 4,
    bladeDetail: 3,
    bladeWidth: 0.30,
    bladeHeight: 0.60,
    windStrength: 1.00,
    simulationSpeed: 0.80,
    baseColor: '#2a2a2a',
    tipColor: '#5c5c5c',
    groundColor: '#1c1c1c',
  }
};

export function buildCustomGrass(config: CustomGrassConfig, includeGround: boolean = true, heightFunc?: (x: number, z: number) => number): THREE.Group {
  const group = new THREE.Group();
  
  // 1. Create Ground Patch
  const patchSize = 10;
  
  const rnd = new SeededRandom(config.seed);
  
  const labHeightFunc = (x: number, z: number) => Math.sin(x * 1.5) * Math.cos(z * 1.5) * 0.3;
  const effectiveHeightFunc = includeGround ? labHeightFunc : (heightFunc || (() => 0));
  
  if (includeGround) {
    const groundGeo = new THREE.PlaneGeometry(patchSize, patchSize, 16, 16);
    groundGeo.rotateX(-Math.PI / 2);
    
    const posArray = groundGeo.attributes.position.array;
    for (let i = 0; i < posArray.length; i += 3) {
      const vx = posArray[i];
      const vz = posArray[i + 2];
      posArray[i + 1] = labHeightFunc(vx, vz);
    }
    groundGeo.computeVertexNormals();
    
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.groundColor),
      roughness: 0.9,
      flatShading: true
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    group.add(groundMesh);
  }
  
  // 2. Create Grass Instanced Mesh
  const bladeDetail = Math.max(1, Math.floor(config.bladeDetail));
  const grassGeo = new THREE.PlaneGeometry(config.bladeWidth, config.bladeHeight, 1, bladeDetail);
  grassGeo.translate(0, config.bladeHeight / 2, 0); // Move origin to base
  
  // Custom GPU ShaderMaterial for wind animation and color gradient
  const grassMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: false,
    alphaTest: 0.1, // Early-Z GPU culling without costly CPU depth sorting
    depthWrite: true,
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(config.baseColor) },
      uTipColor: { value: new THREE.Color(config.tipColor) },
      uWindStrength: { value: config.windStrength },
      uSimulationSpeed: { value: config.simulationSpeed },
    },
    vertexShader: `
      attribute vec3 instancePosition;
      uniform float uTime;
      uniform float uWindStrength;
      uniform float uSimulationSpeed;

      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);

        // Transform position by instanceMatrix then modelMatrix to get true world position
        vec4 instanceLocalPos = instanceMatrix * vec4(position, 1.0);
        vec4 worldPos = modelMatrix * instanceLocalPos;

        // Spatial wind wave based on world position
        float globalTime = uTime * uSimulationSpeed;
        float windWave1 = sin(globalTime + worldPos.x * 0.5 + worldPos.z * 0.5);
        float windWave2 = sin(globalTime * 1.5 + worldPos.x * 1.2 + worldPos.z * 0.8) * 0.5;
        float windWave3 = sin(globalTime * 3.0 + worldPos.x * 2.5 + worldPos.z * 2.0) * 0.25;

        float totalWind = (windWave1 + windWave2 + windWave3) * uWindStrength;

        // Base preservation: wind affects tips non-linearly
        float windEffect = pow(uv.y, 2.0);
        vec3 windOffset = vec3(totalWind * windEffect * 0.8, 0.0, totalWind * windEffect * 0.4);

        worldPos.xyz += windOffset;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uBaseColor;
      uniform vec3 uTipColor;

      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        // Round blade tips
        float dist = abs(vUv.x - 0.5) * 2.0;
        float tipThreshold = 1.0 - (vUv.y - 0.8) * 5.0;
        if (vUv.y > 0.8 && dist > tipThreshold) {
          discard;
        }

        // Base to tip gradient
        vec3 col = mix(uBaseColor, uTipColor, vUv.y);

        // Directional lighting for double-sided grass blades
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        float diff = abs(dot(vNormal, lightDir));
        col *= (0.55 + diff * 0.45);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });

  // Create instanced mesh: scale total blade count dynamically with density
  // Clamped for extreme performance and memory safety
  const rawBase = config.count || 3200;
  const baseCount = Math.min(rawBase, 5000);
  const densityRatio = (config.density ?? 7) / 7;
  const count = Math.max(10, Math.round(baseCount * densityRatio));

  const instancedMesh = new THREE.InstancedMesh(grassGeo, grassMat, count);
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = false; // Prevents shadow acne and double-pass overhead on blades
  instancedMesh.userData.uniforms = grassMat.uniforms;
  
  const dummy = new THREE.Object3D();
  const instancePositionArray = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const x = (rnd.next() - 0.5) * patchSize;
    const z = (rnd.next() - 0.5) * patchSize;
    const y = effectiveHeightFunc(x, z);
    
    const rotY = rnd.next() * Math.PI * 2;
    
    instancePositionArray[i * 3 + 0] = x;
    instancePositionArray[i * 3 + 1] = y;
    instancePositionArray[i * 3 + 2] = z;
    
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, rotY, 0);
    const scale = 0.6 + rnd.next() * 0.6;
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    
    instancedMesh.setMatrixAt(i, dummy.matrix);
  }
  
  // Provide instancePosition attribute for GPU wind calculation
  grassGeo.setAttribute('instancePosition', new THREE.InstancedBufferAttribute(instancePositionArray, 3));
  
  group.add(instancedMesh);
  
  return group;
}

