import * as THREE from 'three';
import { SeededRandom } from './noise';

export interface CustomTreeConfig {
  seed: number;
  iterations: number;     // 1 to 5
  branchSplit: number;    // 1.0 to 5.0
  baseLength: number;     // 1.0 to 10.0
  baseRadius: number;     // 0.1 to 1.5
  spreadAngle: number;    // 0 to 90
  crookedness: number;    // 0 to 100
  showLeaves: boolean;
  blobRadius: number;     // 0.5 to 3.0
  detailLevel: number;    // 0 to 5 (Dodecahedron detail level)
  fluffiness: number;     // 0.1 to 2.0
  windStrength: number;   // 0 to 2.0
  stylePreset: 'sakura' | 'oak' | 'willow' | 'maple' | 'birch' | 'cactus' | 'bonsai' | 'pine'
    | 'ivy' | 'bougainvillea' | 'liana' | 'grapevine' | 'pothos' | 'trumpet_vine'
    | 'rose' | 'sunflower' | 'lotus' | 'tulip' | 'daisy' | 'hibiscus'
    | 'silver_eucalyptus' | 'rainbow_eucalyptus' | 'giant_eucalyptus'
    | 'apple' | 'lemon' | 'mango' | 'peach' | 'cherry' | 'orange'
    | 'palm' | 'bamboo' | 'mushroom' | 'fern' | 'baobab' | 'wheat' | 'lichen'
    | 'kapok_giant' | 'brazil_nut' | 'mahogany' | 'jequitiba' | 'dinizia' | 'araucaria'
    | 'giant_sequoia' | 'coast_redwood' | 'live_oak' | 'bald_cypress' | 'bristlecone_pine' | 'sugar_maple'
    | 'african_baobab' | 'strangler_fig' | 'kauri' | 'dragon_blood' | 'banyan' | 'lebanon_cedar'
    | 'golden_barrel' | 'organ_pipe' | 'prickly_pear' | 'hedgehog_cactus' | 'branching_saguaro'
    | 'mandacaru' | 'xique_xique' | 'turks_cap' | 'may_flower'
    | 'candelabra' | 'brain_cactus' | 'dragon_fruit' | 'living_stone' | 'monkey_tail' | 'fishbone';
  trunkColor: string;
  leafColor: string;
}

export const TREE_PRESETS: Record<CustomTreeConfig['stylePreset'], Omit<CustomTreeConfig, 'seed' | 'stylePreset'>> = {
  // --- CACTI PRESETS ---
  golden_barrel: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 2.0,
    baseRadius: 1.5,
    spreadAngle: 0,
    crookedness: 0,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 2,
    fluffiness: 0.1,
    windStrength: 0,
    trunkColor: '#8a9e4d',
    leafColor: '#ffffff',
  },
  organ_pipe: {
    iterations: 3,
    branchSplit: 1.5,
    baseLength: 5.0,
    baseRadius: 0.5,
    spreadAngle: 10,
    crookedness: 5,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#3d5c3d',
    leafColor: '#ffffff',
  },
  prickly_pear: {
    iterations: 3,
    branchSplit: 2.5,
    baseLength: 1.5,
    baseRadius: 0.8,
    spreadAngle: 45,
    crookedness: 10,
    showLeaves: true,
    blobRadius: 1.0,
    detailLevel: 0,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#5c7a4d',
    leafColor: '#d64c7e', // Flowers
  },
  hedgehog_cactus: {
    iterations: 1,
    branchSplit: 3.0,
    baseLength: 1.0,
    baseRadius: 0.6,
    spreadAngle: 25,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 0.8,
    detailLevel: 2,
    fluffiness: 0.5,
    windStrength: 0,
    trunkColor: '#4d693a',
    leafColor: '#b83b6e',
  },
  branching_saguaro: {
    iterations: 4,
    branchSplit: 1.8,
    baseLength: 7.0,
    baseRadius: 1.0,
    spreadAngle: 30,
    crookedness: 5,
    showLeaves: false,
    blobRadius: 0.2,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#2f4a2f',
    leafColor: '#ffffff',
  },
  mandacaru: {
    iterations: 4,
    branchSplit: 2.0,
    baseLength: 6.0,
    baseRadius: 0.7,
    spreadAngle: 25,
    crookedness: 10,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 1,
    fluffiness: 0.2,
    windStrength: 0.2,
    trunkColor: '#3a5c3a',
    leafColor: '#ffffff', // White flowers
  },
  xique_xique: {
    iterations: 3,
    branchSplit: 3.5,
    baseLength: 3.0,
    baseRadius: 0.5,
    spreadAngle: 60,
    crookedness: 40,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#4d693a',
    leafColor: '#ffffff',
  },
  turks_cap: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 1.2,
    baseRadius: 0.9,
    spreadAngle: 0,
    crookedness: 0,
    showLeaves: true,
    blobRadius: 0.6,
    detailLevel: 2,
    fluffiness: 0.4,
    windStrength: 0,
    trunkColor: '#5c7a4d',
    leafColor: '#d62d2d', // Red cephalium
  },
  may_flower: {
    iterations: 2,
    branchSplit: 4.0,
    baseLength: 1.5,
    baseRadius: 0.3,
    spreadAngle: 75,
    crookedness: 20,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 0,
    fluffiness: 0.1,
    windStrength: 0.2,
    trunkColor: '#3a5c3a',
    leafColor: '#e64c8e', // Pink flowers
  },
  candelabra: {
    iterations: 3,
    branchSplit: 2.5,
    baseLength: 4.0,
    baseRadius: 0.8,
    spreadAngle: 35,
    crookedness: 8,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#2d4a2d',
    leafColor: '#ffffff',
  },
  brain_cactus: {
    iterations: 2,
    branchSplit: 5.0,
    baseLength: 0.5,
    baseRadius: 1.2,
    spreadAngle: 80,
    crookedness: 80,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 3,
    fluffiness: 0.5,
    windStrength: 0,
    trunkColor: '#6a8a4d',
    leafColor: '#ffffff',
  },
  dragon_fruit: {
    iterations: 4,
    branchSplit: 2.5,
    baseLength: 2.5,
    baseRadius: 0.4,
    spreadAngle: 60,
    crookedness: 50,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.3,
    trunkColor: '#4d7a4d',
    leafColor: '#d61c5c', // Red dragon fruits
  },
  living_stone: {
    iterations: 1,
    branchSplit: 2.0,
    baseLength: 0.2,
    baseRadius: 0.4,
    spreadAngle: 10,
    crookedness: 0,
    showLeaves: true,
    blobRadius: 0.8,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0,
    trunkColor: '#8a7a6d',
    leafColor: '#e6dcae', // Yellowish flower
  },
  monkey_tail: {
    iterations: 3,
    branchSplit: 1.5,
    baseLength: 3.5,
    baseRadius: 0.2,
    spreadAngle: 80,
    crookedness: 60,
    showLeaves: true,
    blobRadius: 0.3,
    detailLevel: 1,
    fluffiness: 0.8,
    windStrength: 0.4,
    trunkColor: '#7a8a6d',
    leafColor: '#d64c4c', // Red flowers
  },
  fishbone: {
    iterations: 3,
    branchSplit: 2.5,
    baseLength: 2.0,
    baseRadius: 0.2,
    spreadAngle: 50,
    crookedness: 30,
    showLeaves: false,
    blobRadius: 0.1,
    detailLevel: 1,
    fluffiness: 0.2,
    windStrength: 0.2,
    trunkColor: '#3a693a',
    leafColor: '#ffffff',
  },
  // --- BASE PRESETS ---
  kapok_giant: {
    iterations: 5,
    branchSplit: 4.5,
    baseLength: 8.0,
    baseRadius: 1.5,
    spreadAngle: 45,
    crookedness: 20,
    showLeaves: true,
    blobRadius: 2.5,
    detailLevel: 2,
    fluffiness: 1.2,
    windStrength: 0.4,
    trunkColor: '#5c5248',
    leafColor: '#2d4c1e',
  },
  brazil_nut: {
    iterations: 4,
    branchSplit: 3.5,
    baseLength: 7.5,
    baseRadius: 1.2,
    spreadAngle: 30,
    crookedness: 10,
    showLeaves: true,
    blobRadius: 2.2,
    detailLevel: 2,
    fluffiness: 1.0,
    windStrength: 0.5,
    trunkColor: '#3a2b22',
    leafColor: '#1e381b',
  },
  mahogany: {
    iterations: 4,
    branchSplit: 3.8,
    baseLength: 6.5,
    baseRadius: 1.1,
    spreadAngle: 40,
    crookedness: 15,
    showLeaves: true,
    blobRadius: 2.0,
    detailLevel: 1,
    fluffiness: 1.1,
    windStrength: 0.4,
    trunkColor: '#4a2511',
    leafColor: '#2d5a27',
  },
  jequitiba: {
    iterations: 5,
    branchSplit: 4.0,
    baseLength: 9.0,
    baseRadius: 1.4,
    spreadAngle: 35,
    crookedness: 25,
    showLeaves: true,
    blobRadius: 2.3,
    detailLevel: 2,
    fluffiness: 1.15,
    windStrength: 0.6,
    trunkColor: '#6e5c53',
    leafColor: '#385e29',
  },
  dinizia: {
    iterations: 5,
    branchSplit: 3.2,
    baseLength: 8.5,
    baseRadius: 1.3,
    spreadAngle: 25,
    crookedness: 12,
    showLeaves: true,
    blobRadius: 2.1,
    detailLevel: 2,
    fluffiness: 0.9,
    windStrength: 0.3,
    trunkColor: '#4d3327',
    leafColor: '#20401d',
  },
  araucaria: {
    iterations: 4,
    branchSplit: 4.5,
    baseLength: 6.0,
    baseRadius: 0.9,
    spreadAngle: 80,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 1,
    fluffiness: 0.5,
    windStrength: 0.2,
    trunkColor: '#3d3024',
    leafColor: '#143318',
  },
  giant_sequoia: {
    iterations: 5,
    branchSplit: 3.0,
    baseLength: 9.5,
    baseRadius: 1.5,
    spreadAngle: 20,
    crookedness: 8,
    showLeaves: true,
    blobRadius: 1.8,
    detailLevel: 1,
    fluffiness: 0.8,
    windStrength: 0.1,
    trunkColor: '#8b4513',
    leafColor: '#1a331f',
  },
  coast_redwood: {
    iterations: 5,
    branchSplit: 2.8,
    baseLength: 10.0,
    baseRadius: 1.4,
    spreadAngle: 15,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 1.6,
    detailLevel: 1,
    fluffiness: 0.7,
    windStrength: 0.2,
    trunkColor: '#7a3b1a',
    leafColor: '#204024',
  },
  live_oak: {
    iterations: 4,
    branchSplit: 4.8,
    baseLength: 4.0,
    baseRadius: 1.3,
    spreadAngle: 75,
    crookedness: 60,
    showLeaves: true,
    blobRadius: 2.4,
    detailLevel: 2,
    fluffiness: 1.5,
    windStrength: 0.5,
    trunkColor: '#453f38',
    leafColor: '#4a6b36',
  },
  bald_cypress: {
    iterations: 4,
    branchSplit: 3.5,
    baseLength: 6.0,
    baseRadius: 1.2,
    spreadAngle: 45,
    crookedness: 30,
    showLeaves: true,
    blobRadius: 1.5,
    detailLevel: 1,
    fluffiness: 0.6,
    windStrength: 0.4,
    trunkColor: '#5a4d41',
    leafColor: '#6b8e23',
  },
  bristlecone_pine: {
    iterations: 4,
    branchSplit: 3.0,
    baseLength: 3.5,
    baseRadius: 0.8,
    spreadAngle: 60,
    crookedness: 90,
    showLeaves: true,
    blobRadius: 1.0,
    detailLevel: 1,
    fluffiness: 0.4,
    windStrength: 0.1,
    trunkColor: '#8a7f72',
    leafColor: '#2f4f2f',
  },
  sugar_maple: {
    iterations: 4,
    branchSplit: 4.2,
    baseLength: 5.0,
    baseRadius: 1.0,
    spreadAngle: 50,
    crookedness: 20,
    showLeaves: true,
    blobRadius: 2.2,
    detailLevel: 2,
    fluffiness: 1.3,
    windStrength: 0.6,
    trunkColor: '#4c433c',
    leafColor: '#cc5500',
  },
  african_baobab: {
    iterations: 3,
    branchSplit: 4.5,
    baseLength: 5.5,
    baseRadius: 2.5,
    spreadAngle: 65,
    crookedness: 40,
    showLeaves: true,
    blobRadius: 1.8,
    detailLevel: 2,
    fluffiness: 1.0,
    windStrength: 0.2,
    trunkColor: '#8b8478',
    leafColor: '#4d6930',
  },
  strangler_fig: {
    iterations: 5,
    branchSplit: 4.0,
    baseLength: 6.5,
    baseRadius: 1.2,
    spreadAngle: 55,
    crookedness: 80,
    showLeaves: true,
    blobRadius: 2.0,
    detailLevel: 2,
    fluffiness: 1.2,
    windStrength: 0.3,
    trunkColor: '#5e5145',
    leafColor: '#2b5220',
  },
  kauri: {
    iterations: 4,
    branchSplit: 3.5,
    baseLength: 8.0,
    baseRadius: 1.6,
    spreadAngle: 30,
    crookedness: 15,
    showLeaves: true,
    blobRadius: 2.1,
    detailLevel: 1,
    fluffiness: 1.1,
    windStrength: 0.4,
    trunkColor: '#6b6054',
    leafColor: '#2a4221',
  },
  dragon_blood: {
    iterations: 4,
    branchSplit: 4.8,
    baseLength: 4.5,
    baseRadius: 1.0,
    spreadAngle: 85,
    crookedness: 25,
    showLeaves: true,
    blobRadius: 1.4,
    detailLevel: 1,
    fluffiness: 0.8,
    windStrength: 0.3,
    trunkColor: '#7a6857',
    leafColor: '#1f4024',
  },
  banyan: {
    iterations: 5,
    branchSplit: 4.5,
    baseLength: 5.0,
    baseRadius: 1.8,
    spreadAngle: 70,
    crookedness: 50,
    showLeaves: true,
    blobRadius: 2.5,
    detailLevel: 2,
    fluffiness: 1.4,
    windStrength: 0.4,
    trunkColor: '#4f443a',
    leafColor: '#305e27',
  },
  lebanon_cedar: {
    iterations: 4,
    branchSplit: 4.0,
    baseLength: 5.5,
    baseRadius: 1.1,
    spreadAngle: 75,
    crookedness: 35,
    showLeaves: true,
    blobRadius: 1.9,
    detailLevel: 2,
    fluffiness: 1.2,
    windStrength: 0.5,
    trunkColor: '#42362b',
    leafColor: '#1d3b1b',
  },
  sakura: {
    iterations: 4,
    branchSplit: 3.7,
    baseLength: 5.5,
    baseRadius: 0.55,
    spreadAngle: 38,
    crookedness: 45,
    showLeaves: true,
    blobRadius: 1.9,
    detailLevel: 1, // 0-2 works best for low-poly feel
    fluffiness: 1.15,
    windStrength: 0.5,
    trunkColor: '#3d2f2b',
    leafColor: '#ffb7c5',
  },
  oak: {
    iterations: 5,
    branchSplit: 3.0,
    baseLength: 4.5,
    baseRadius: 0.75,
    spreadAngle: 42,
    crookedness: 55,
    showLeaves: true,
    blobRadius: 2.2,
    detailLevel: 1,
    fluffiness: 1.0,
    windStrength: 0.2,
    trunkColor: '#4a3b32',
    leafColor: '#1e4620',
  },
  willow: {
    iterations: 4,
    branchSplit: 3.0,
    baseLength: 6.0,
    baseRadius: 0.5,
    spreadAngle: 25,
    crookedness: 25,
    showLeaves: true,
    blobRadius: 1.5,
    detailLevel: 1,
    fluffiness: 1.4,
    windStrength: 0.8,
    trunkColor: '#302b1e',
    leafColor: '#40916c',
  },
  maple: {
    iterations: 4,
    branchSplit: 3.5,
    baseLength: 5.2,
    baseRadius: 0.5,
    spreadAngle: 40,
    crookedness: 35,
    showLeaves: true,
    blobRadius: 2.0,
    detailLevel: 1,
    fluffiness: 1.1,
    windStrength: 0.4,
    trunkColor: '#4a3525',
    leafColor: '#f48c06',
  },
  birch: {
    iterations: 3,
    branchSplit: 2.2,
    baseLength: 6.8,
    baseRadius: 0.38,
    spreadAngle: 22,
    crookedness: 15,
    showLeaves: true,
    blobRadius: 1.6,
    detailLevel: 1,
    fluffiness: 0.95,
    windStrength: 0.6,
    trunkColor: '#e2e8f0', // Off white
    leafColor: '#52b788',
  },
  cactus: {
    iterations: 3,
    branchSplit: 2.0,
    baseLength: 5.5,
    baseRadius: 0.65,
    spreadAngle: 50,
    crookedness: 5,
    showLeaves: false,
    blobRadius: 0.0,
    detailLevel: 0,
    fluffiness: 0.0,
    windStrength: 0.1,
    trunkColor: '#2d6a4f',
    leafColor: '#fef08a', // Flowers / needle tips
  },
  bonsai: {
    iterations: 5,
    branchSplit: 2.4,
    baseLength: 3.2,
    baseRadius: 0.85,
    spreadAngle: 52,
    crookedness: 85,
    showLeaves: true,
    blobRadius: 1.1,
    detailLevel: 1,
    fluffiness: 1.6,
    windStrength: 0.1,
    trunkColor: '#523a28',
    leafColor: '#0f3c24',
  },
  pine: {
    iterations: 4,
    branchSplit: 2.8,
    baseLength: 5.0,
    baseRadius: 0.48,
    spreadAngle: 20,
    crookedness: 10,
    showLeaves: true,
    blobRadius: 2.4,
    detailLevel: 1,
    fluffiness: 0.75,
    windStrength: 0.3,
    trunkColor: '#5c3104',
    leafColor: '#143525',
  },

  // 🌿 Trepadeiras e Cipós
  ivy: {
    iterations: 4,
    branchSplit: 2.0,
    baseLength: 6.0,
    baseRadius: 0.18,
    spreadAngle: 45,
    crookedness: 80,
    showLeaves: true,
    blobRadius: 0.8,
    detailLevel: 1,
    fluffiness: 1.5,
    windStrength: 0.7,
    trunkColor: '#4b5563',
    leafColor: '#2d6a4f',
  },
  bougainvillea: {
    iterations: 4,
    branchSplit: 2.5,
    baseLength: 5.5,
    baseRadius: 0.22,
    spreadAngle: 40,
    crookedness: 70,
    showLeaves: true,
    blobRadius: 1.4,
    detailLevel: 1,
    fluffiness: 1.6,
    windStrength: 0.6,
    trunkColor: '#5a4a42',
    leafColor: '#f72585',
  },
  liana: {
    iterations: 3,
    branchSplit: 1.8,
    baseLength: 7.0,
    baseRadius: 0.3,
    spreadAngle: 35,
    crookedness: 90,
    showLeaves: true,
    blobRadius: 0.4,
    detailLevel: 0,
    fluffiness: 0.4,
    windStrength: 0.8,
    trunkColor: '#513b2c',
    leafColor: '#386641',
  },
  grapevine: {
    iterations: 4,
    branchSplit: 2.3,
    baseLength: 4.5,
    baseRadius: 0.28,
    spreadAngle: 45,
    crookedness: 85,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 1,
    fluffiness: 1.2,
    windStrength: 0.4,
    trunkColor: '#3a2414',
    leafColor: '#52b788',
  },
  pothos: {
    iterations: 4,
    branchSplit: 2.0,
    baseLength: 5.8,
    baseRadius: 0.15,
    spreadAngle: 30,
    crookedness: 60,
    showLeaves: true,
    blobRadius: 1.0,
    detailLevel: 1,
    fluffiness: 1.5,
    windStrength: 0.9,
    trunkColor: '#606c38',
    leafColor: '#d4d700',
  },
  trumpet_vine: {
    iterations: 4,
    branchSplit: 2.2,
    baseLength: 5.5,
    baseRadius: 0.16,
    spreadAngle: 38,
    crookedness: 65,
    showLeaves: true,
    blobRadius: 1.1,
    detailLevel: 1,
    fluffiness: 1.3,
    windStrength: 0.7,
    trunkColor: '#4f5d75',
    leafColor: '#ff4d6d',
  },

  // 🌸 Flores
  rose: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 4.8,
    baseRadius: 0.14,
    spreadAngle: 0,
    crookedness: 10,
    showLeaves: true,
    blobRadius: 0.7,
    detailLevel: 1,
    fluffiness: 0.2,
    windStrength: 0.5,
    trunkColor: '#1b4332',
    leafColor: '#c31232',
  },
  sunflower: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 6.2,
    baseRadius: 0.16,
    spreadAngle: 0,
    crookedness: 2,
    showLeaves: true,
    blobRadius: 1.0,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.6,
    trunkColor: '#2d6a4f',
    leafColor: '#ffb703',
  },
  lotus: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 1.2,
    baseRadius: 0.22,
    spreadAngle: 0,
    crookedness: 0,
    showLeaves: true,
    blobRadius: 1.2,
    detailLevel: 2,
    fluffiness: 0.5,
    windStrength: 0.2,
    trunkColor: '#1e6091',
    leafColor: '#ff85a1',
  },
  tulip: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 4.0,
    baseRadius: 0.15,
    spreadAngle: 0,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 0.8,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.4,
    trunkColor: '#52b788',
    leafColor: '#ff5400',
  },
  daisy: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 4.2,
    baseRadius: 0.1,
    spreadAngle: 0,
    crookedness: 12,
    showLeaves: true,
    blobRadius: 0.6,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 0.7,
    trunkColor: '#40916c',
    leafColor: '#ffffff',
  },
  hibiscus: {
    iterations: 2,
    branchSplit: 1.8,
    baseLength: 4.5,
    baseRadius: 0.18,
    spreadAngle: 30,
    crookedness: 25,
    showLeaves: true,
    blobRadius: 0.9,
    detailLevel: 1,
    fluffiness: 0.8,
    windStrength: 0.5,
    trunkColor: '#2d6a4f',
    leafColor: '#ff2a85',
  },

  // 🐨 Eucaliptos
  silver_eucalyptus: {
    iterations: 4,
    branchSplit: 2.8,
    baseLength: 7.2,
    baseRadius: 0.38,
    spreadAngle: 30,
    crookedness: 20,
    showLeaves: true,
    blobRadius: 1.4,
    detailLevel: 1,
    fluffiness: 1.1,
    windStrength: 0.6,
    trunkColor: '#cad2c5',
    leafColor: '#84a59d',
  },
  rainbow_eucalyptus: {
    iterations: 4,
    branchSplit: 3.2,
    baseLength: 8.5,
    baseRadius: 0.5,
    spreadAngle: 35,
    crookedness: 15,
    showLeaves: true,
    blobRadius: 1.8,
    detailLevel: 1,
    fluffiness: 1.2,
    windStrength: 0.5,
    trunkColor: '#4f772d',
    leafColor: '#70e000',
  },
  giant_eucalyptus: {
    iterations: 5,
    branchSplit: 2.6,
    baseLength: 11.0,
    baseRadius: 0.85,
    spreadAngle: 25,
    crookedness: 8,
    showLeaves: true,
    blobRadius: 2.3,
    detailLevel: 1,
    fluffiness: 0.95,
    windStrength: 0.4,
    trunkColor: '#d3d3d3',
    leafColor: '#386641',
  },

  // 🍎 Árvores Frutíferas
  apple: {
    iterations: 4,
    branchSplit: 3.0,
    baseLength: 5.0,
    baseRadius: 0.6,
    spreadAngle: 38,
    crookedness: 40,
    showLeaves: true,
    blobRadius: 1.8,
    detailLevel: 1,
    fluffiness: 1.2,
    windStrength: 0.3,
    trunkColor: '#4a3b32',
    leafColor: '#2d6a4f',
  },
  lemon: {
    iterations: 4,
    branchSplit: 3.2,
    baseLength: 4.2,
    baseRadius: 0.45,
    spreadAngle: 42,
    crookedness: 45,
    showLeaves: true,
    blobRadius: 1.5,
    detailLevel: 1,
    fluffiness: 1.3,
    windStrength: 0.3,
    trunkColor: '#5c4033',
    leafColor: '#52b788',
  },
  mango: {
    iterations: 4,
    branchSplit: 3.5,
    baseLength: 5.5,
    baseRadius: 0.7,
    spreadAngle: 40,
    crookedness: 30,
    showLeaves: true,
    blobRadius: 2.2,
    detailLevel: 1,
    fluffiness: 1.1,
    windStrength: 0.2,
    trunkColor: '#3a2212',
    leafColor: '#1b4332',
  },
  peach: {
    iterations: 4,
    branchSplit: 2.8,
    baseLength: 4.6,
    baseRadius: 0.5,
    spreadAngle: 45,
    crookedness: 50,
    showLeaves: true,
    blobRadius: 1.6,
    detailLevel: 1,
    fluffiness: 1.4,
    windStrength: 0.4,
    trunkColor: '#4e3629',
    leafColor: '#70e000',
  },
  cherry: {
    iterations: 4,
    branchSplit: 3.4,
    baseLength: 5.2,
    baseRadius: 0.52,
    spreadAngle: 35,
    crookedness: 35,
    showLeaves: true,
    blobRadius: 1.7,
    detailLevel: 1,
    fluffiness: 1.25,
    windStrength: 0.5,
    trunkColor: '#2b1c12',
    leafColor: '#386641',
  },
  orange: {
    iterations: 4,
    branchSplit: 3.1,
    baseLength: 4.8,
    baseRadius: 0.55,
    spreadAngle: 40,
    crookedness: 38,
    showLeaves: true,
    blobRadius: 1.7,
    detailLevel: 1,
    fluffiness: 1.2,
    windStrength: 0.3,
    trunkColor: '#523a28',
    leafColor: '#1b4332',
  },

  // 🌴 Mais Tipos (Diversos e Biomas Diferentes)
  palm: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 9.5,
    baseRadius: 0.45,
    spreadAngle: 0,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 2.5,
    detailLevel: 1,
    fluffiness: 1.0,
    windStrength: 0.8,
    trunkColor: '#8a7968',
    leafColor: '#38b000',
  },
  bamboo: {
    iterations: 3,
    branchSplit: 1.5,
    baseLength: 8.0,
    baseRadius: 0.18,
    spreadAngle: 15,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 1.0,
    detailLevel: 1,
    fluffiness: 0.8,
    windStrength: 0.9,
    trunkColor: '#52b788',
    leafColor: '#74c69d',
  },
  mushroom: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 4.5,
    baseRadius: 0.95,
    spreadAngle: 0,
    crookedness: 5,
    showLeaves: true,
    blobRadius: 2.8,
    detailLevel: 2,
    fluffiness: 0.1,
    windStrength: 0.1,
    trunkColor: '#f1f5f9',
    leafColor: '#d90429',
  },
  fern: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 1.5,
    baseRadius: 0.25,
    spreadAngle: 0,
    crookedness: 30,
    showLeaves: true,
    blobRadius: 2.0,
    detailLevel: 1,
    fluffiness: 1.6,
    windStrength: 0.6,
    trunkColor: '#2d6a4f',
    leafColor: '#40916c',
  },
  baobab: {
    iterations: 3,
    branchSplit: 2.2,
    baseLength: 4.2,
    baseRadius: 1.8,
    spreadAngle: 30,
    crookedness: 30,
    showLeaves: true,
    blobRadius: 0.8,
    detailLevel: 1,
    fluffiness: 0.6,
    windStrength: 0.1,
    trunkColor: '#6f5e53',
    leafColor: '#1e4620',
  },
  wheat: {
    iterations: 1,
    branchSplit: 1.0,
    baseLength: 3.5,
    baseRadius: 0.08,
    spreadAngle: 0,
    crookedness: 12,
    showLeaves: true,
    blobRadius: 0.5,
    detailLevel: 1,
    fluffiness: 0.1,
    windStrength: 1.2,
    trunkColor: '#e0a96d',
    leafColor: '#ffe8a3',
  },
  lichen: {
    iterations: 2,
    branchSplit: 3.0,
    baseLength: 1.0,
    baseRadius: 0.4,
    spreadAngle: 60,
    crookedness: 45,
    showLeaves: true,
    blobRadius: 0.7,
    detailLevel: 1,
    fluffiness: 1.5,
    windStrength: 0.2,
    trunkColor: '#1e293b',
    leafColor: '#00f5ff',
  },
};

/**
 * Procedural Tree Mesh Builder
 * Generates a full 3D branching tree based on CustomTreeConfig parameters.
 */
export function buildCustomTree(config: CustomTreeConfig): THREE.Group {
  const group = new THREE.Group();
  group.name = 'custom-procedural-tree';

  const rng = new SeededRandom(config.seed);

  // Materials
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.trunkColor),
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(config.leafColor),
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  // Keep track of wind animated components
  const windLeaves: THREE.Mesh[] = [];
  const windBranches: THREE.Mesh[] = [];

  // Helper to find perpendicular vector
  function getPerpendicularVector(v: THREE.Vector3): THREE.Vector3 {
    const ax = Math.abs(v.x);
    const ay = Math.abs(v.y);
    const az = Math.abs(v.z);
    if (ax <= ay && ax <= az) return new THREE.Vector3(0, -v.z, v.y).normalize();
    if (ay <= ax && ay <= az) return new THREE.Vector3(-v.z, 0, v.x).normalize();
    return new THREE.Vector3(-v.y, v.x, 0).normalize();
  }

  // Recursive Branching function
  function createBranch(
    startPos: THREE.Vector3,
    direction: THREE.Vector3,
    length: number,
    radius: number,
    depth: number
  ) {
    // 1. Draw current branch
    // To implement "crookedness", we split the branch into 3 sub-segments that wiggle
    const segmentCount = Math.max(2, Math.floor(2 + (config.crookedness / 30)));
    let currentStart = startPos.clone();
    const segmentLength = length / segmentCount;
    let currentDir = direction.clone().normalize();

    const branchSegments: THREE.Mesh[] = [];

    for (let i = 0; i < segmentCount; i++) {
      // Add crookedness wiggle to segment direction
      if (config.crookedness > 0 && i > 0) {
        const wiggleStrength = (config.crookedness / 100) * 0.28;
        const wiggle = new THREE.Vector3(
          rng.range(-wiggleStrength, wiggleStrength),
          rng.range(-wiggleStrength, wiggleStrength),
          rng.range(-wiggleStrength, wiggleStrength)
        );
        currentDir.add(wiggle).normalize();
      }

      const currentEnd = currentStart.clone().add(currentDir.clone().multiplyScalar(segmentLength));
      
      // Interpolate radius along the branch
      const rStart = radius * (1 - (i / segmentCount) * 0.25);
      const rEnd = radius * (1 - ((i + 1) / segmentCount) * 0.25);

      // Custom material for rainbow eucalyptus!
      let segmentMat = trunkMaterial;
      if (config.stylePreset === 'rainbow_eucalyptus') {
        const rainbowColors = ['#4f772d', '#90a955', '#ec3f47', '#ffb703', '#3a86c8', '#8338ec', '#6f5e53'];
        const chosenColor = rainbowColors[Math.floor(rng.range(0, rainbowColors.length))];
        segmentMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(chosenColor),
          roughness: 0.8,
          metalness: 0.1,
          flatShading: true,
        });
      }

      const geom = new THREE.CylinderGeometry(rEnd, rStart, segmentLength, 6);
      const mesh = new THREE.Mesh(geom, segmentMat);
      mesh.castShadow = true;
      mesh.receiveShadow = depth === 0; // Only main trunk receives shadow, cutting shadow draw calls

      // Position & Rotate cylinder
      mesh.position.copy(currentStart).add(currentDir.clone().multiplyScalar(segmentLength * 0.5));
      
      const defaultAxis = new THREE.Vector3(0, 1, 0);
      mesh.quaternion.setFromUnitVectors(defaultAxis, currentDir);
      mesh.userData.baseRotZ = mesh.rotation.z;
      mesh.userData.baseRotX = mesh.rotation.x;

      group.add(mesh);
      branchSegments.push(mesh);
      windBranches.push(mesh);

      // Highlight bamboo joints with lighter ring nodes!
      if (config.stylePreset === 'bamboo') {
        const ringGeom = new THREE.CylinderGeometry(radius * 1.15, radius * 1.15, segmentLength * 0.08, 6);
        const ringMat = new THREE.MeshStandardMaterial({ color: '#74c69d', roughness: 0.4 });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.copy(currentStart);
        ring.quaternion.setFromUnitVectors(defaultAxis, currentDir);
        group.add(ring);
      }

      // Spawning climber leaves along branch segments for vines
      if (['ivy', 'bougainvillea', 'pothos', 'trumpet_vine'].includes(config.stylePreset) && rng.next() > 0.4) {
        const leafSize = radius * rng.range(1.2, 2.2);
        const vineLeafGeom = new THREE.DodecahedronGeometry(leafSize, 0);
        
        let vineLeafColor = config.leafColor;
        if (config.stylePreset === 'pothos') {
          vineLeafColor = rng.next() > 0.5 ? '#d4d700' : '#4f772d';
        } else if (config.stylePreset === 'bougainvillea') {
          vineLeafColor = rng.next() > 0.3 ? '#f72585' : '#b5179e';
        } else if (config.stylePreset === 'trumpet_vine') {
          vineLeafColor = rng.next() > 0.5 ? '#ff4d6d' : '#ff7096';
        }

        const vineLeafMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(vineLeafColor),
          roughness: 0.8,
          flatShading: true,
        });
        const vineLeaf = new THREE.Mesh(vineLeafGeom, vineLeafMat);
        vineLeaf.castShadow = true;
        const angle = rng.range(0, Math.PI * 2);
        vineLeaf.position.copy(mesh.position).add(new THREE.Vector3(
          Math.cos(angle) * radius * 1.1,
          rng.range(-segmentLength * 0.4, segmentLength * 0.4),
          Math.sin(angle) * radius * 1.1
        ));
        group.add(vineLeaf);
        windLeaves.push(vineLeaf);
      }

      // Advance
      currentStart = currentEnd;
    }

    const endPos = currentStart;

    // 2. Base features for specific presets (e.g., Cactus ribs & spines)
    if (config.stylePreset === 'cactus') {
      // Draw some ribbed vertical lines or needles on cacti
      const needlesCount = Math.floor(rng.range(3, 7));
      const needleMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
      for (let n = 0; n < needlesCount; n++) {
        const needleGeom = new THREE.CylinderGeometry(0.002, 0.005, 0.08, 4);
        const needle = new THREE.Mesh(needleGeom, needleMat);
        const offsetAngle = rng.range(0, Math.PI * 2);
        needle.position.copy(endPos).add(new THREE.Vector3(
          Math.cos(offsetAngle) * radius * 0.9,
          rng.range(-length * 0.5, length * 0.5),
          Math.sin(offsetAngle) * radius * 0.9
        ));
        needle.rotation.set(rng.range(-0.5, 0.5), offsetAngle, rng.range(-0.5, 0.5));
        group.add(needle);
      }
    }

    // 3. Branch Split or Canopy Leaves
    if (depth < config.iterations) {
      // Spawn sub-branches
      // Decimal split represents probability of spawning an extra branch
      const baseSplit = Math.floor(config.branchSplit);
      const splitProbability = config.branchSplit % 1;
      const actualSplit = baseSplit + (rng.next() < splitProbability ? 1 : 0);

      // Spread angle conversion to radians
      const maxSpread = (config.spreadAngle * Math.PI) / 180;

      for (let b = 0; b < actualSplit; b++) {
        // Distribute branch directions evenly in an umbrella fashion around currentDir
        const angleOffset = (b * Math.PI * 2) / actualSplit + rng.range(-0.2, 0.2);
        
        // Calculate spread direction
        const perp = getPerpendicularVector(currentDir);
        const subDir = currentDir.clone();
        
        // Rotate subDir away from parent dir by a spread angle
        const spreadVal = maxSpread * rng.range(0.65, 1.05);
        subDir.applyAxisAngle(perp, spreadVal);
        subDir.applyAxisAngle(currentDir, angleOffset);
        subDir.normalize();

        // Reduce length and radius for children branches
        const lenMultiplier = rng.range(0.68, 0.78);
        const radMultiplier = rng.range(0.58, 0.68);

        createBranch(
          endPos,
          subDir,
          length * lenMultiplier,
          radius * radMultiplier,
          depth + 1
        );
      }
    } else {
      // Outer tips: Spawn Canopy / Leaves!
      if (config.showLeaves && config.blobRadius > 0.1) {
        const foliageGroup = new THREE.Group();
        foliageGroup.position.copy(endPos);

        // Check if preset is a flower species
        const isFlowerStyle = ['rose', 'sunflower', 'lotus', 'tulip', 'daisy', 'hibiscus'].includes(config.stylePreset);
        
        if (isFlowerStyle) {
          const bloomGroup = new THREE.Group();
          
          if (config.stylePreset === 'rose') {
            const petalColors = ['#9e0018', '#d00000', '#ff0a54'];
            for (let p = 0; p < 3; p++) {
              const petalGeom = new THREE.DodecahedronGeometry(0.35 - p * 0.08, 1);
              const petalMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(petalColors[p]),
                roughness: 0.6,
                flatShading: true,
              });
              const petalMesh = new THREE.Mesh(petalGeom, petalMat);
              petalMesh.position.y = p * 0.1;
              bloomGroup.add(petalMesh);
              windLeaves.push(petalMesh);
            }
          }
          else if (config.stylePreset === 'sunflower') {
            const centerGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 8);
            const centerMat = new THREE.MeshStandardMaterial({ color: '#4a3728', roughness: 0.9, flatShading: true });
            const centerMesh = new THREE.Mesh(centerGeom, centerMat);
            centerMesh.rotation.x = Math.PI / 2.5;
            bloomGroup.add(centerMesh);

            const petalCount = 12;
            const petalMat = new THREE.MeshStandardMaterial({ color: '#ffb703', roughness: 0.5, flatShading: true });
            for (let p = 0; p < petalCount; p++) {
              const angle = (p * Math.PI * 2) / petalCount;
              const pGeom = new THREE.ConeGeometry(0.1, 0.35, 4);
              const pMesh = new THREE.Mesh(pGeom, petalMat);
              pMesh.position.set(Math.cos(angle) * 0.45, Math.sin(angle) * 0.45 * Math.sin(Math.PI / 2.5), 0);
              pMesh.rotation.z = angle - Math.PI / 2;
              pMesh.rotation.x = Math.PI / 2.5;
              bloomGroup.add(pMesh);
              windLeaves.push(pMesh);
            }
          }
          else if (config.stylePreset === 'lotus') {
            const padGeom = new THREE.CylinderGeometry(0.8, 0.8, 0.03, 10);
            const padMat = new THREE.MeshStandardMaterial({ color: '#1b4332', roughness: 0.8, flatShading: true });
            const padMesh = new THREE.Mesh(padGeom, padMat);
            padMesh.position.y = -0.1;
            bloomGroup.add(padMesh);

            const petalCount = 12;
            const lotusPetalMat = new THREE.MeshStandardMaterial({ color: '#ff85a1', roughness: 0.4, flatShading: true });
            for (let p = 0; p < petalCount; p++) {
              const angle = (p * Math.PI * 2) / petalCount;
              const pGeom = new THREE.ConeGeometry(0.14, 0.45, 4);
              const pMesh = new THREE.Mesh(pGeom, lotusPetalMat);
              pMesh.position.set(Math.cos(angle) * 0.28, 0.05, Math.sin(angle) * 0.28);
              pMesh.rotation.set(0.3, -angle, 0.4);
              bloomGroup.add(pMesh);
              windLeaves.push(pMesh);
            }
            const coreGeom = new THREE.DodecahedronGeometry(0.12, 0);
            const coreMat = new THREE.MeshStandardMaterial({ color: '#ffea00', roughness: 0.2 });
            const core = new THREE.Mesh(coreGeom, coreMat);
            core.position.y = 0.12;
            bloomGroup.add(core);
          }
          else if (config.stylePreset === 'tulip') {
            const tulipColors = ['#ff0054', '#ff5400', '#ffbd00'];
            const tColor = tulipColors[Math.floor(rng.range(0, tulipColors.length))];
            const tMat = new THREE.MeshStandardMaterial({ color: tColor, roughness: 0.5, flatShading: true });
            const petalCount = 4;
            for (let p = 0; p < petalCount; p++) {
              const angle = (p * Math.PI * 2) / petalCount;
              const pGeom = new THREE.CylinderGeometry(0.15, 0.04, 0.4, 4);
              const pMesh = new THREE.Mesh(pGeom, tMat);
              pMesh.position.set(Math.cos(angle) * 0.1, 0.18, Math.sin(angle) * 0.1);
              pMesh.rotation.set(0.2, -angle, 0.1);
              bloomGroup.add(pMesh);
              windLeaves.push(pMesh);
            }
          }
          else if (config.stylePreset === 'daisy') {
            const centerGeom = new THREE.DodecahedronGeometry(0.15, 1);
            const centerMat = new THREE.MeshStandardMaterial({ color: '#ffb703', roughness: 0.8 });
            const centerMesh = new THREE.Mesh(centerGeom, centerMat);
            bloomGroup.add(centerMesh);

            const petalCount = 10;
            const petalMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, flatShading: true });
            for (let p = 0; p < petalCount; p++) {
              const angle = (p * Math.PI * 2) / petalCount;
              const pGeom = new THREE.BoxGeometry(0.25, 0.02, 0.08);
              const pMesh = new THREE.Mesh(pGeom, petalMat);
              pMesh.position.set(Math.cos(angle) * 0.22, 0, Math.sin(angle) * 0.22);
              pMesh.rotation.y = -angle;
              bloomGroup.add(pMesh);
              windLeaves.push(pMesh);
            }
          }
          else if (config.stylePreset === 'hibiscus') {
            const petalCount = 5;
            const petalMat = new THREE.MeshStandardMaterial({ color: '#ff2a85', roughness: 0.6, flatShading: true });
            for (let p = 0; p < petalCount; p++) {
              const angle = (p * Math.PI * 2) / petalCount;
              const pGeom = new THREE.DodecahedronGeometry(0.24, 0);
              const pMesh = new THREE.Mesh(pGeom, petalMat);
              pMesh.position.set(Math.cos(angle) * 0.18, 0.04, Math.sin(angle) * 0.18);
              pMesh.scale.set(1.2, 0.2, 0.8);
              pMesh.rotation.set(0.4, -angle, 0);
              bloomGroup.add(pMesh);
              windLeaves.push(pMesh);
            }
            const stamenGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.4, 4);
            const stamenMat = new THREE.MeshStandardMaterial({ color: '#ffb703', roughness: 0.4 });
            const stamenMesh = new THREE.Mesh(stamenGeom, stamenMat);
            stamenMesh.position.set(0, 0.2, 0);
            stamenMesh.rotation.z = 0.2;
            bloomGroup.add(stamenMesh);
          }

          foliageGroup.add(bloomGroup);
          group.add(foliageGroup);
          return;
        }

        // Standard low-poly fluffy canopy puff: a main sphere/dodecahedron and several satellite puffs
        const detail = Math.min(2, Math.floor(config.detailLevel));
        const mainRadius = config.blobRadius * rng.range(0.85, 1.15);
        const geom = new THREE.DodecahedronGeometry(mainRadius, detail);
        const mainFoliage = new THREE.Mesh(geom, leafMaterial);
        mainFoliage.castShadow = true;
        mainFoliage.receiveShadow = true;
        foliageGroup.add(mainFoliage);
        windLeaves.push(mainFoliage);

        // Fluffiness: Spawns satellite puffs around the main blob
        const satelliteCount = Math.floor(config.fluffiness * 4);
        for (let s = 0; s < satelliteCount; s++) {
          const satRadius = mainRadius * rng.range(0.4, 0.7) * (0.6 + config.fluffiness * 0.4);
          const satGeom = new THREE.DodecahedronGeometry(satRadius, detail);
          
          // Custom tint for visual rich depth if preset is maple/sakura/oak
          let satMat = leafMaterial;
          if (rng.next() > 0.4) {
            // Apply slight color variation
            const colorVar = new THREE.Color(config.leafColor);
            colorVar.offsetHSL(rng.range(-0.04, 0.04), rng.range(-0.1, 0.05), rng.range(-0.08, 0.08));
            satMat = new THREE.MeshStandardMaterial({
              color: colorVar,
              roughness: 0.85,
              metalness: 0.05,
              flatShading: true,
            });
          }

          const satMesh = new THREE.Mesh(satGeom, satMat);
          satMesh.castShadow = true;
          satMesh.receiveShadow = true;

          // Position offset
          const offsetAngle = rng.range(0, Math.PI * 2);
          const offsetDist = mainRadius * rng.range(0.4, 0.85);
          satMesh.position.set(
            Math.cos(offsetAngle) * offsetDist,
            rng.range(-mainRadius * 0.3, mainRadius * 0.4),
            Math.sin(offsetAngle) * offsetDist
          );

          foliageGroup.add(satMesh);
          windLeaves.push(satMesh);
        }

        // Weeping Willow specific: hanging cascading branches
        if (config.stylePreset === 'willow') {
          const cascadeCount = Math.floor(rng.range(3, 6));
          for (let c = 0; c < cascadeCount; c++) {
            const cascadeAngle = (c * Math.PI * 2) / cascadeCount + rng.range(-0.3, 0.3);
            const cascadeDist = mainRadius * rng.range(0.6, 0.9);
            const cascadeStart = new THREE.Vector3(
              Math.cos(cascadeAngle) * cascadeDist,
              -mainRadius * 0.2,
              Math.sin(cascadeAngle) * cascadeDist
            );

            // Chain of weeping leaves
            const chainLength = Math.floor(rng.range(3, 6));
            let prevY = cascadeStart.y;
            for (let l = 0; l < chainLength; l++) {
              const h = rng.range(0.12, 0.22);
              const w = rng.range(0.02, 0.04);
              const dropGeom = new THREE.BoxGeometry(w, h, w);
              const drop = new THREE.Mesh(dropGeom, leafMaterial);
              drop.castShadow = true;
              drop.position.set(
                cascadeStart.x + rng.range(-0.04, 0.04),
                prevY - h / 2,
                cascadeStart.z + rng.range(-0.04, 0.04)
              );
              drop.rotation.set(rng.range(-0.1, 0.1), rng.range(0, Math.PI), rng.range(-0.1, 0.1));
              foliageGroup.add(drop);
              windLeaves.push(drop);
              prevY -= h * 0.85;
            }
          }
        }

        // Apple Tree additions (Specific styling touch for Oak with Apples!)
        if (config.stylePreset === 'oak' && rng.next() > 0.4) {
          const appleMat = new THREE.MeshStandardMaterial({
            color: 0xd90429, // Apples!
            roughness: 0.3,
            metalness: 0.1,
            flatShading: true,
          });
          const applesCount = Math.floor(rng.range(1, 4));
          for (let a = 0; a < applesCount; a++) {
            const appleGeom = new THREE.DodecahedronGeometry(0.06, 0);
            const apple = new THREE.Mesh(appleGeom, appleMat);
            const offsetAngle = rng.range(0, Math.PI * 2);
            const offsetDist = mainRadius * rng.range(0.7, 1.0);
            apple.position.set(
              Math.cos(offsetAngle) * offsetDist,
              -mainRadius * rng.range(0.2, 0.6),
              Math.sin(offsetAngle) * offsetDist
            );
            foliageGroup.add(apple);
          }
        }

        // Silver Dollar Eucalyptus specific: round silver-blue leaves
        if (config.stylePreset === 'silver_eucalyptus') {
          foliageGroup.remove(mainFoliage);
          const leafCount = Math.floor(rng.range(6, 12));
          const coinMat = new THREE.MeshStandardMaterial({ color: '#84a59d', roughness: 0.8, flatShading: true });
          for (let c = 0; c < leafCount; c++) {
            const coinGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.02, 6);
            const coin = new THREE.Mesh(coinGeom, coinMat);
            coin.castShadow = true;
            const angle = rng.range(0, Math.PI * 2);
            const dist = mainRadius * rng.range(0.4, 1.2);
            coin.position.set(
              Math.cos(angle) * dist,
              rng.range(-0.5, 0.5),
              Math.sin(angle) * dist
            );
            coin.rotation.set(rng.range(-1, 1), angle, rng.range(-1, 1));
            foliageGroup.add(coin);
            windLeaves.push(coin);
          }
        }

        // Imperial Palm specific: long drooping green fronds
        if (config.stylePreset === 'palm') {
          foliageGroup.remove(mainFoliage);
          const frondCount = 12;
          const frondMat = new THREE.MeshStandardMaterial({ color: '#2d6a4f', roughness: 0.8, flatShading: true });
          for (let fr = 0; fr < frondCount; fr++) {
            const frondAngle = (fr * Math.PI * 2) / frondCount + rng.range(-0.1, 0.1);
            const frondLength = 2.4;
            const frondSegmentCount = 5;
            
            let currentFrondPos = new THREE.Vector3(0, 0, 0);
            let frondDir = new THREE.Vector3(Math.cos(frondAngle), 0.2, Math.sin(frondAngle)).normalize();
            
            for (let s = 0; s < frondSegmentCount; s++) {
              frondDir.y -= 0.18;
              frondDir.normalize();
              
              const segLen = frondLength / frondSegmentCount;
              const nextPos = currentFrondPos.clone().add(frondDir.clone().multiplyScalar(segLen));
              
              const frondGeom = new THREE.BoxGeometry(0.14 * (1 - s / frondSegmentCount), 0.015, segLen);
              const frondMesh = new THREE.Mesh(frondGeom, frondMat);
              frondMesh.castShadow = true;
              
              frondMesh.position.copy(currentFrondPos).add(frondDir.clone().multiplyScalar(segLen * 0.5));
              frondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), frondDir);
              
              foliageGroup.add(frondMesh);
              windLeaves.push(frondMesh);
              
              currentFrondPos = nextPos;
            }
          }
        }

        // Bamboo foliage: sparse wispy green boxes
        if (config.stylePreset === 'bamboo') {
          foliageGroup.remove(mainFoliage);
          const wispCount = 6;
          const wispMat = new THREE.MeshStandardMaterial({ color: '#52b788', roughness: 0.7, flatShading: true });
          for (let w = 0; w < wispCount; w++) {
            const wispGeom = new THREE.BoxGeometry(0.15, 0.02, 0.6);
            const wisp = new THREE.Mesh(wispGeom, wispMat);
            const angle = rng.range(0, Math.PI * 2);
            wisp.position.set(Math.cos(angle) * 0.4, rng.range(-0.3, 0.3), Math.sin(angle) * 0.4);
            wisp.rotation.set(0.3, angle, 0.2);
            foliageGroup.add(wisp);
            windLeaves.push(wisp);
          }
        }

        // Giant Mushroom Cap and Spots!
        if (config.stylePreset === 'mushroom') {
          foliageGroup.remove(mainFoliage);
          const capGeom = new THREE.CylinderGeometry(0.2, mainRadius * 1.3, 0.6, 12);
          const capMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(config.leafColor), roughness: 0.5, flatShading: true });
          const cap = new THREE.Mesh(capGeom, capMat);
          cap.position.y = 0.2;
          foliageGroup.add(cap);
          windLeaves.push(cap);

          const spotGeom = new THREE.DodecahedronGeometry(0.12, 0);
          const spotMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9, flatShading: true });
          const spotCount = 10;
          for (let sp = 0; sp < spotCount; sp++) {
            const angle = rng.range(0, Math.PI * 2);
            const dist = mainRadius * rng.range(0.3, 0.9);
            const spot = new THREE.Mesh(spotGeom, spotMat);
            spot.position.set(
              Math.cos(angle) * dist,
              0.45 - (dist / mainRadius) * 0.15,
              Math.sin(angle) * dist
            );
            foliageGroup.add(spot);
          }
        }

        // Ancient Fern: Arching feathery green fronds
        if (config.stylePreset === 'fern') {
          foliageGroup.remove(mainFoliage);
          const frondCount = 10;
          const fernMat = new THREE.MeshStandardMaterial({ color: '#40916c', roughness: 0.8, flatShading: true });
          for (let fr = 0; fr < frondCount; fr++) {
            const angle = (fr * Math.PI * 2) / frondCount + rng.range(-0.15, 0.15);
            const frondLength = 2.0;
            const segCount = 4;
            let currentPos = new THREE.Vector3(0, -0.4, 0);
            let dir = new THREE.Vector3(Math.cos(angle), 0.4, Math.sin(angle)).normalize();
            
            for (let s = 0; s < segCount; s++) {
              dir.y -= 0.12;
              dir.normalize();
              const segLen = frondLength / segCount;
              const nextPos = currentPos.clone().add(dir.clone().multiplyScalar(segLen));
              
              const stemGeom = new THREE.BoxGeometry(0.04, 0.04, segLen);
              const stem = new THREE.Mesh(stemGeom, fernMat);
              stem.position.copy(currentPos).add(dir.clone().multiplyScalar(segLen * 0.5));
              stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
              foliageGroup.add(stem);
              
              const leafletCount = 3;
              for (let lf = 0; lf < leafletCount; lf++) {
                const sideGeom = new THREE.BoxGeometry(0.4 * (1 - s / segCount), 0.012, 0.12);
                const leftL = new THREE.Mesh(sideGeom, fernMat);
                const rightL = new THREE.Mesh(sideGeom, fernMat);
                
                const offsetPos = currentPos.clone().add(dir.clone().multiplyScalar(segLen * (lf / leafletCount)));
                const sideDir = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
                
                leftL.position.copy(offsetPos).add(sideDir.clone().multiplyScalar(0.18));
                leftL.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), sideDir);
                foliageGroup.add(leftL);
                
                rightL.position.copy(offsetPos).add(sideDir.clone().multiplyScalar(-0.18));
                rightL.quaternion.setFromUnitVectors(new THREE.Vector3(-1, 0, 0), sideDir);
                foliageGroup.add(rightL);
              }
              
              currentPos = nextPos;
            }
          }
        }

        // Golden Wheat Spikelets
        if (config.stylePreset === 'wheat') {
          foliageGroup.remove(mainFoliage);
          const earColors = ['#e0a96d', '#ffe8a3', '#ffb703'];
          const spikeletCount = 6;
          for (let sp = 0; sp < spikeletCount; sp++) {
            const earGeom = new THREE.DodecahedronGeometry(0.12, 0);
            const earMat = new THREE.MeshStandardMaterial({ color: earColors[sp % 3], roughness: 0.9, flatShading: true });
            const ear = new THREE.Mesh(earGeom, earMat);
            ear.position.set(
              (sp % 2 === 0 ? 0.05 : -0.05),
              sp * 0.12 - 0.2,
              0
            );
            foliageGroup.add(ear);
            windLeaves.push(ear);
          }
        }

        // Cave Lichen (emissive bioluminescence)
        if (config.stylePreset === 'lichen') {
          foliageGroup.remove(mainFoliage);
          const lichenMat = new THREE.MeshStandardMaterial({
            color: '#00f5ff',
            emissive: '#008b8b',
            emissiveIntensity: 0.8,
            roughness: 0.2,
            flatShading: true,
          });
          const lichenCount = 5;
          for (let lc = 0; lc < lichenCount; lc++) {
            const lGeom = new THREE.DodecahedronGeometry(0.24, 0);
            const lMesh = new THREE.Mesh(lGeom, lichenMat);
            lMesh.position.set(
              rng.range(-0.5, 0.5),
              rng.range(-0.1, 0.1),
              rng.range(-0.5, 0.5)
            );
            foliageGroup.add(lMesh);
            windLeaves.push(lMesh);
          }
        }

        // FRUIT GENERATION for general fruit trees (apple, lemon, mango, peach, cherry, orange)
        const isFruitTreeStyle = ['apple', 'lemon', 'mango', 'peach', 'cherry', 'orange'].includes(config.stylePreset);
        if (isFruitTreeStyle) {
          let fruitColor = '#d90429';
          let fruitRadius = 0.08;
          let isTeardrop = false;
          let isCherryPairs = false;

          if (config.stylePreset === 'lemon') {
            fruitColor = '#ffee32';
            fruitRadius = 0.06;
          } else if (config.stylePreset === 'mango') {
            fruitColor = '#ffb703';
            fruitRadius = 0.09;
            isTeardrop = true;
          } else if (config.stylePreset === 'peach') {
            fruitColor = '#ffb5a7';
            fruitRadius = 0.07;
          } else if (config.stylePreset === 'cherry') {
            fruitColor = '#9e0059';
            fruitRadius = 0.045;
            isCherryPairs = true;
          } else if (config.stylePreset === 'orange') {
            fruitColor = '#f77f00';
            fruitRadius = 0.08;
          }

          const fruitMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(fruitColor),
            roughness: 0.3,
            metalness: 0.1,
            flatShading: true,
          });

          const fruitCount = Math.floor(rng.range(2, 5));
          for (let f = 0; f < fruitCount; f++) {
            const offsetAngle = rng.range(0, Math.PI * 2);
            const offsetDist = mainRadius * rng.range(0.65, 1.0);
            
            if (isCherryPairs) {
              const cherryPair = new THREE.Group();
              cherryPair.position.set(
                Math.cos(offsetAngle) * offsetDist,
                -mainRadius * rng.range(0.1, 0.5),
                Math.sin(offsetAngle) * offsetDist
              );

              const cherryGeom = new THREE.DodecahedronGeometry(fruitRadius, 0);
              const c1 = new THREE.Mesh(cherryGeom, fruitMat);
              c1.position.set(-0.04, -0.06, 0);
              cherryPair.add(c1);

              const c2 = new THREE.Mesh(cherryGeom, fruitMat);
              c2.position.set(0.04, -0.06, 0);
              cherryPair.add(c2);

              foliageGroup.add(cherryPair);
            } else {
              const geom = isTeardrop 
                ? new THREE.ConeGeometry(fruitRadius, fruitRadius * 2, 4)
                : new THREE.DodecahedronGeometry(fruitRadius, 0);
              const fruit = new THREE.Mesh(geom, fruitMat);
              fruit.castShadow = true;
              fruit.position.set(
                Math.cos(offsetAngle) * offsetDist,
                -mainRadius * rng.range(0.15, 0.6),
                Math.sin(offsetAngle) * offsetDist
              );
              if (isTeardrop) {
                fruit.rotation.z = Math.PI;
              }
              foliageGroup.add(fruit);
            }
          }
        }

        group.add(foliageGroup);
      }
    }
  }

  // Initial trunk direction is straight UP
  const initialPos = new THREE.Vector3(0, 0, 0);
  const initialDir = new THREE.Vector3(0, 1, 0);

  createBranch(
    initialPos,
    initialDir,
    config.baseLength * 0.45, // scale base length down slightly to fit visualizer
    config.baseRadius * 0.45, // scale base radius down slightly
    1
  );

  // Add root flares at the base (for rich look, e.g. oak / sakura)
  if (config.stylePreset === 'oak' || config.stylePreset === 'sakura' || config.stylePreset === 'bonsai') {
    const flareCount = 4;
    const baseRad = config.baseRadius * 0.45;
    for (let i = 0; i < flareCount; i++) {
      const angle = (i * Math.PI * 2) / flareCount + rng.range(-0.2, 0.2);
      const flareLength = baseRad * rng.range(1.5, 2.5);
      const flareGeom = new THREE.CylinderGeometry(baseRad * 0.4, baseRad * 1.2, flareLength, 5);
      const flare = new THREE.Mesh(flareGeom, trunkMaterial);
      flare.castShadow = true;
      flare.receiveShadow = true;

      // Position flat at ground
      flare.position.set(Math.cos(angle) * baseRad * 0.8, baseRad * 0.1, Math.sin(angle) * baseRad * 0.8);
      flare.rotation.set(Math.PI / 2.3, angle + Math.PI / 2, 0);
      group.add(flare);
    }
  }

  // Attach reference to wind animated items so we can animate them in the loop!
  (group as any).userData = {
    windLeaves,
    windBranches,
    windStrength: config.windStrength,
  };

  return group;
}

/**
 * Updates a custom tree model's wind animation in real-time.
 * Call this inside the requestAnimationFrame loop.
 */
export function animateCustomTreeWind(tree: THREE.Group, time: number) {
  const { windLeaves, windStrength } = tree.userData || {};
  if (windStrength === undefined || windStrength === 0) return;

  const speed = 1.8;
  const strength = windStrength * 0.04;

  // Gentle organic sway of the entire tree trunk and branches pivoting from base
  tree.rotation.z = Math.sin(time * speed * 0.7) * (windStrength * 0.012);
  tree.rotation.x = Math.cos(time * speed * 0.5) * (windStrength * 0.008);

  // Animate leaves swaying in the wind
  if (windLeaves && windLeaves.length > 0) {
    for (let i = 0; i < windLeaves.length; i++) {
      const leaf = windLeaves[i];
      const offset = i * 0.15;
      
      // Sway positions
      leaf.rotation.z = Math.sin(time * speed + offset) * strength;
      leaf.rotation.x = Math.cos(time * speed * 0.8 + offset) * (strength * 0.5);
      
      // Subtle breathing scale
      const scaleFactor = 1.0 + Math.sin(time * 2 + offset) * (strength * 0.08);
      leaf.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  }
}
