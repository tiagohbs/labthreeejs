export interface TerrainConfig {
  seed: number;
  resolution: number;
  noiseScale: number;
  noiseOctaves: number;
  maxHeight: number;
  waterLevel: number;
  terraceSteps: number; // 0 for smooth, > 1 for stepped levels
  isTerraced: boolean;
  
  // Density parameters
  treeCount: number;
  rockCount: number;
  grassCount: number;
  
  // Render parameters
  fogDensity: number;
  shadowsEnabled: boolean;
  wireframeEnabled: boolean;
  autoRotate: boolean;
  themeId: ThemeId;
}

export type ThemeId = 'forest' | 'desert' | 'arctic' | 'volcanic';

export interface ThemeColors {
  deepWater: string;
  shallowWater: string;
  sand: string;
  grass: string;
  rock: string;
  snow: string;
  sky: string;
  ambientLight: string;
  dirLight: string;
  fog: string;
  water: string;
  trunk: string;
  canopy: string[];
}

export interface PlacedObject {
  id: string;
  type: 'tree' | 'rock' | 'grass' | 'house' | 'path_stone' | 'path_dirt' | 'path_grass' | 'path_wood';
  position: [number, number, number];
  scale: number;
  rotation: number;
}

export interface TerrainStats {
  generationTimeMs: number;
  vertexCount: number;
  faceCount: number;
  placedTrees: number;
  placedRocks: number;
  placedGrass: number;
  heightDistribution: {
    water: number;
    sand: number;
    grass: number;
    rock: number;
    snow: number;
  };
}
