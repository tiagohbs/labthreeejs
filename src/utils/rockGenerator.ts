import * as THREE from 'three';
import { SeededRandom } from './noise';

export interface CustomRockConfig {
  seed: number;
  radius: number;         // 0.2 to 1.5
  ruggedness: number;     // 0 to 100
  scaleX: number;         // 0.5 to 2.0
  scaleY: number;         // 0.3 to 2.0
  scaleZ: number;         // 0.5 to 2.0
  rockColor: string;
  hasMoss: boolean;
  mossColor: string;
  hasCrystals: boolean;
  crystalColor: string;
  stylePreset: 'boulder' | 'crystal' | 'obsidian' | 'meteorite' | 'sandstone';
}

export const ROCK_PRESETS: Record<CustomRockConfig['stylePreset'], Omit<CustomRockConfig, 'seed' | 'stylePreset'>> = {
  boulder: {
    radius: 0.6,
    ruggedness: 45,
    scaleX: 1.1,
    scaleY: 0.8,
    scaleZ: 1.1,
    rockColor: '#64748b', // Slate grey
    hasMoss: true,
    mossColor: '#4d7c0f', // Grass green
    hasCrystals: false,
    crystalColor: '#38bdf8',
  },
  crystal: {
    radius: 0.5,
    ruggedness: 10,
    scaleX: 0.8,
    scaleY: 1.6,
    scaleZ: 0.8,
    rockColor: '#1e1b4b', // Deep dark blue
    hasMoss: false,
    mossColor: '#3f6212',
    hasCrystals: true,
    crystalColor: '#ec4899', // Pink glowing quartz
  },
  obsidian: {
    radius: 0.55,
    ruggedness: 30,
    scaleX: 1.0,
    scaleY: 1.2,
    scaleZ: 1.0,
    rockColor: '#090d16', // Jet black
    hasMoss: false,
    mossColor: '#1e3a1e',
    hasCrystals: true,
    crystalColor: '#ef4444', // Red fire veins
  },
  meteorite: {
    radius: 0.65,
    ruggedness: 95, // extremely bumpy/pitted
    scaleX: 1.2,
    scaleY: 1.1,
    scaleZ: 1.2,
    rockColor: '#4338ca', // Cosmic indigo
    hasMoss: false,
    mossColor: '#22c55e',
    hasCrystals: true,
    crystalColor: '#a855f7', // Purple celestial light
  },
  sandstone: {
    radius: 0.7,
    ruggedness: 35,
    scaleX: 1.4,
    scaleY: 0.6,
    scaleZ: 1.4,
    rockColor: '#d97706', // Desert orange
    hasMoss: false,
    mossColor: '#854d0e',
    hasCrystals: false,
    crystalColor: '#eab308',
  }
};

export function buildCustomRock(config: CustomRockConfig): THREE.Group {
  const group = new THREE.Group();
  group.name = 'custom-procedural-rock';

  const rng = new SeededRandom(config.seed);

  // Rock base material
  const rockMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.rockColor),
    roughness: config.stylePreset === 'obsidian' || config.stylePreset === 'crystal' ? 0.15 : 0.85,
    metalness: config.stylePreset === 'obsidian' ? 0.8 : 0.1,
    flatShading: true,
  });

  // 1. Create Deformed Base Rock Mesh
  const detail = config.stylePreset === 'crystal' ? 0 : 1; // 0 detail makes it more sharp & gem-like
  const geom = new THREE.DodecahedronGeometry(config.radius, detail);

  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Apply noise deformation based on ruggedness
    if (config.ruggedness > 0) {
      const deformFactor = (config.ruggedness / 100) * 0.45 * config.radius;
      pos.setXYZ(
        i,
        x + rng.range(-deformFactor, deformFactor),
        y + rng.range(-deformFactor, deformFactor) * 0.7, // flatten slightly on Y for natural sitting
        z + rng.range(-deformFactor, deformFactor)
      );
    }
  }
  geom.computeVertexNormals();

  const rockMesh = new THREE.Mesh(geom, rockMaterial);
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;
  rockMesh.scale.set(config.scaleX, config.scaleY, config.scaleZ);
  group.add(rockMesh);

  // 2. Add Moss Cap (Procedural layer on the top of the rock)
  if (config.hasMoss && config.stylePreset !== 'crystal') {
    const mossMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.mossColor),
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });

    // Create a flatter, smaller offset geometry on top
    const mossRadius = config.radius * 0.92;
    const mossGeom = new THREE.DodecahedronGeometry(mossRadius, 1);
    
    // Flatten and offset upwards
    const mPos = mossGeom.attributes.position;
    for (let i = 0; i < mPos.count; i++) {
      const x = mPos.getX(i);
      const y = mPos.getY(i);
      const z = mPos.getZ(i);

      // Keep mostly positive Y vertices, pull negative Y vertices up to create a cap
      const capY = y < 0 ? y * 0.1 : y * 1.05;
      const deformFactor = (config.ruggedness / 100) * 0.35 * mossRadius;

      mPos.setXYZ(
        i,
        x + rng.range(-deformFactor, deformFactor),
        capY + rng.range(0, deformFactor * 0.3),
        z + rng.range(-deformFactor, deformFactor)
      );
    }
    mossGeom.computeVertexNormals();

    const mossMesh = new THREE.Mesh(mossGeom, mossMaterial);
    mossMesh.castShadow = true;
    mossMesh.receiveShadow = true;
    
    // Scale and lift slightly on Y to rest nicely as a "snow/moss cap"
    mossMesh.scale.set(config.scaleX * 1.01, config.scaleY * 1.02, config.scaleZ * 1.01);
    mossMesh.position.y = config.radius * config.scaleY * 0.22;
    group.add(mossMesh);
  }

  // 3. Add Glowing Crystals (Sticking out of the rock!)
  if (config.hasCrystals) {
    const crystalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.crystalColor),
      roughness: 0.1,
      metalness: 0.9,
      emissive: new THREE.Color(config.crystalColor),
      emissiveIntensity: 0.75,
      flatShading: true,
    });

    const shardCount = Math.floor(rng.range(2, 6));
    const baseShardGeom = new THREE.CylinderGeometry(0, 1, 1, 5);
    for (let s = 0; s < shardCount; s++) {
      // Slender hexagonal prisms using single shared geometry
      const shardHeight = config.radius * rng.range(0.4, 0.95);
      const shardRad = config.radius * rng.range(0.08, 0.18);
      const shard = new THREE.Mesh(baseShardGeom, crystalMaterial);
      shard.scale.set(shardRad, shardHeight, shardRad);
      shard.castShadow = true;

      // Position sticking out around the mid-upper hemisphere
      const phi = rng.range(0.2, Math.PI / 2.2); // vertical angle (limit to upper half)
      const theta = rng.range(0, Math.PI * 2);    // orbital angle
      
      const rx = Math.sin(phi) * Math.cos(theta);
      const ry = Math.cos(phi);
      const rz = Math.sin(phi) * Math.sin(theta);

      const surfacePoint = new THREE.Vector3(
        rx * config.radius * config.scaleX * 0.88,
        ry * config.radius * config.scaleY * 0.88,
        rz * config.radius * config.scaleZ * 0.88
      );

      shard.position.copy(surfacePoint);

      // Point the crystal OUTWARD from the center
      const up = new THREE.Vector3(0, 1, 0);
      const crystalDir = surfacePoint.clone().normalize();
      shard.quaternion.setFromUnitVectors(up, crystalDir);

      // Lean slightly for dramatic crystal cluster look
      shard.rotateX(rng.range(-0.15, 0.15));
      shard.rotateZ(rng.range(-0.15, 0.15));

      group.add(shard);
    }
  }

  return group;
}
