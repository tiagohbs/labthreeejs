import { ThemeColors, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeColors> = {
  forest: {
    deepWater: '#023e8a',
    shallowWater: '#0096c7',
    sand: '#e9c46a',
    grass: '#2a9d8f',
    rock: '#7678ed',
    snow: '#f1f5f9',
    sky: '#bae6fd',
    ambientLight: '#ffffff',
    dirLight: '#fffbeb',
    fog: '#e0f2fe',
    water: '#0077b6',
    trunk: '#5c3d2e',
    canopy: ['#2d6a4f', '#40916c', '#52b788', '#74c69d']
  },
  desert: {
    deepWater: '#155e75',
    shallowWater: '#0891b2',
    sand: '#eab308',
    grass: '#d97706',
    rock: '#9a3412',
    snow: '#e2e8f0',
    sky: '#ffedd5',
    ambientLight: '#ffedd5',
    dirLight: '#fbbf24',
    fog: '#fed7aa',
    water: '#0e7490',
    trunk: '#b45309',
    canopy: ['#854d0e', '#a16207', '#b45309']
  },
  arctic: {
    deepWater: '#1e3a8a',
    shallowWater: '#3b82f6',
    sand: '#94a3b8',
    grass: '#cbd5e1',
    rock: '#475569',
    snow: '#ffffff',
    sky: '#cbd5e1',
    ambientLight: '#eff6ff',
    dirLight: '#38bdf8',
    fog: '#cbd5e1',
    water: '#2563eb',
    trunk: '#64748b',
    canopy: ['#94a3b8', '#cbd5e1', '#e2e8f0']
  },
  volcanic: {
    deepWater: '#7f1d1d',
    shallowWater: '#c2410c',
    sand: '#1e293b',
    grass: '#0f172a',
    rock: '#334155',
    snow: '#f8fafc',
    sky: '#1e1b4b',
    ambientLight: '#b91c1c',
    dirLight: '#ea580c',
    fog: '#ea580c',
    water: '#ea580c', // Molten lava!
    trunk: '#111827',
    canopy: ['#1e293b', '#0f172a', '#334155']
  }
};
