import React, { useState } from 'react';
import { 
  TreePine, 
  Mountain, 
  Waves, 
  Compass, 
  Sun, 
  Flame, 
  Snowflake, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Home, 
  Eraser, 
  MousePointer, 
  ChevronDown, 
  ChevronUp,
  Hammer,
  Eye,
  Settings,
  TreeDeciduous,
  Footprints,
  Component,
  Route,
  AlignJustify
} from 'lucide-react';
import { TerrainConfig, ThemeId } from '../types';

interface SidebarProps {
  config: TerrainConfig;
  onChange: (newConfig: TerrainConfig) => void;
  onGenerate: () => void;
  onReset: () => void;
  activeTool: string;
  setActiveTool: (tool: any) => void;
  onClearCustomObjects: () => void;
  onOpenLab: (tab: 'tree' | 'rock' | 'house' | 'grass') => void;
  hasCustomTree: boolean;
  hasCustomRock: boolean;
  hasCustomHouse: boolean;
  hasCustomGrass: boolean;
}

export default function Sidebar({
  config,
  onChange,
  onGenerate,
  onReset,
  activeTool,
  setActiveTool,
  onClearCustomObjects,
  onOpenLab,
  hasCustomTree,
  hasCustomRock,
  hasCustomHouse,
  hasCustomGrass
}: SidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('theme');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSliderChange = (key: keyof TerrainConfig, value: number) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const handleToggleChange = (key: keyof TerrainConfig) => {
    onChange({
      ...config,
      [key]: !config[key]
    });
  };

  const handleThemeSelect = (themeId: ThemeId) => {
    onChange({
      ...config,
      themeId
    });
  };

  const rollNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 999999);
    handleSliderChange('seed', newSeed);
  };

  const tools = [
    { id: 'inspect', label: 'Inspecionar', icon: MousePointer, color: 'text-sky-400 bg-sky-950/40 border-sky-800' },
    { id: 'add_tree', label: 'Árvore', icon: TreePine, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' },
    { id: 'add_rock', label: 'Pedra', icon: Mountain, color: 'text-slate-400 bg-slate-800/40 border-slate-700' },
    { id: 'add_house', label: 'Cabana', icon: Home, color: 'text-amber-400 bg-amber-950/40 border-amber-800' },
    { id: 'add_grass', label: 'Grama', icon: Component, color: 'text-green-400 bg-green-950/40 border-green-800' },
    { id: 'sculpt_up', label: 'Elevar Terra', icon: ChevronUp, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800' },
    { id: 'sculpt_down', label: 'Rebaixar Terra', icon: ChevronDown, color: 'text-rose-400 bg-rose-950/40 border-rose-800' },
    { id: 'path_stone', label: 'Ladrilho', icon: Component, color: 'text-stone-400 bg-stone-900/40 border-stone-700' },
    { id: 'path_dirt', label: 'Barro', icon: Footprints, color: 'text-orange-900 bg-orange-950/40 border-orange-900' },
    { id: 'path_grass', label: 'Grama Piso.', icon: Route, color: 'text-lime-400 bg-lime-950/40 border-lime-800' },
    { id: 'path_wood', label: 'Madeira', icon: AlignJustify, color: 'text-amber-600 bg-amber-950/40 border-amber-900' },
  ];

  return (
    <div id="app-sidebar" className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-full overflow-hidden select-none">
      {/* App Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-emerald-400" />
          <h1 className="font-sans font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
            Mundo Procedural 3D
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Simulador de Geração de Terreno em Three.js
        </p>
      </div>

      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        
        {/* PROMINENT CARD: Unified Creation Laboratories */}
        <div className="bg-gradient-to-r from-[#064e3b]/35 via-[#0c4a6e]/35 to-[#451a03]/25 border border-emerald-800/40 p-4 rounded-xl space-y-3 shadow-lg">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-100">🧬 Laboratórios de Design 3D</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Customize o DNA de vegetações, minerais e arquiteturas para gerar e plantar suas próprias espécies procedurais exclusivas no mapa!
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <button
              id="btn-open-tree-lab"
              onClick={() => onOpenLab('tree')}
              className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-between gap-1.5 shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-1.5">🌳 Laboratório de Árvores</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${hasCustomTree ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-900/40 text-slate-400'}`}>
                {hasCustomTree ? 'DNA Ativo' : 'Padrão'}
              </span>
            </button>
            <button
              id="btn-open-rock-lab"
              onClick={() => onOpenLab('rock')}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-between gap-1.5 shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-1.5">🪨 Laboratório de Pedras</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${hasCustomRock ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'bg-slate-900/40 text-slate-400'}`}>
                {hasCustomRock ? 'DNA Ativo' : 'Padrão'}
              </span>
            </button>
            <button
              id="btn-open-house-lab"
              onClick={() => onOpenLab('house')}
              className="w-full py-2 px-3 bg-[#e07a5f] hover:bg-[#d6684b] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-between gap-1.5 shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-1.5">🏡 Laboratório de Cabanas</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${hasCustomHouse ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'bg-slate-900/40 text-slate-400'}`}>
                {hasCustomHouse ? 'DNA Ativo' : 'Padrão'}
              </span>
            </button>
            <button
              id="btn-open-grass-lab"
              onClick={() => onOpenLab('grass')}
              className="w-full py-2 px-3 bg-[#5c9451] hover:bg-[#4b7a42] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-between gap-1.5 shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-1.5">🌿 Laboratório de Grama</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${hasCustomGrass ? 'bg-lime-500/30 text-lime-300 border border-lime-500/50' : 'bg-slate-900/40 text-slate-400'}`}>
                {hasCustomGrass ? 'DNA Ativo' : 'Padrão'}
              </span>
            </button>
          </div>
        </div>
        
        {/* SECTION: Sandbox Mode Tools */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Hammer className="w-4 h-4 text-emerald-400" />
            <span>Ferramentas de Interação (Clique no Mapa)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tools.map((t) => {
              const Icon = t.icon;
              const isActive = activeTool === t.id;
              return (
                <button
                  key={t.id}
                  id={`tool-${t.id}`}
                  onClick={() => setActiveTool(t.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-[11px] font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10' 
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title={t.label}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          <button
            id="clear-custom-objects"
            onClick={onClearCustomObjects}
            className="w-full py-1.5 px-3 rounded bg-slate-800/60 border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 hover:text-slate-100 flex items-center justify-center gap-1.5 transition-all mt-1"
          >
            <Eraser className="w-3.5 h-3.5" />
            Limpar Objetos Criados
          </button>
        </div>

        {/* SECTION 1: Biomes / Themes */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
          <button 
            id="header-theme"
            onClick={() => toggleSection('theme')}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 text-sm font-semibold text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Bioma e Clima</span>
            </div>
            {expandedSection === 'theme' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'theme' && (
            <div className="p-4 grid grid-cols-2 gap-2 bg-slate-900/30">
              <button
                id="theme-forest"
                onClick={() => handleThemeSelect('forest')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative overflow-hidden group ${
                  config.themeId === 'forest' 
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-100 shadow-sm shadow-emerald-500/15' 
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="absolute top-0 right-0 p-1 text-emerald-400/20 group-hover:scale-110 transition-transform">
                  <TreePine className="w-12 h-12 -mr-3 -mt-3" />
                </div>
                <TreePine className={`w-4 h-4 ${config.themeId === 'forest' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Floresta Verde</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">Pinheiros e campina</span>
              </button>

              <button
                id="theme-desert"
                onClick={() => handleThemeSelect('desert')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative overflow-hidden group ${
                  config.themeId === 'desert' 
                    ? 'border-amber-500 bg-amber-950/20 text-amber-100 shadow-sm shadow-amber-500/15' 
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="absolute top-0 right-0 p-1 text-amber-400/20 group-hover:scale-110 transition-transform">
                  <Sun className="w-12 h-12 -mr-3 -mt-3" />
                </div>
                <Sun className={`w-4 h-4 ${config.themeId === 'desert' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Deserto Dourado</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">Cactos e rochas vermelhas</span>
              </button>

              <button
                id="theme-arctic"
                onClick={() => handleThemeSelect('arctic')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative overflow-hidden group ${
                  config.themeId === 'arctic' 
                    ? 'border-sky-500 bg-sky-950/20 text-sky-100 shadow-sm shadow-sky-500/15' 
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="absolute top-0 right-0 p-1 text-sky-400/20 group-hover:scale-110 transition-transform">
                  <Snowflake className="w-12 h-12 -mr-3 -mt-3" />
                </div>
                <Snowflake className={`w-4 h-4 ${config.themeId === 'arctic' ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Ártico Gelado</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">Montanhas e pinheiros nevados</span>
              </button>

              <button
                id="theme-volcanic"
                onClick={() => handleThemeSelect('volcanic')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left transition-all relative overflow-hidden group ${
                  config.themeId === 'volcanic' 
                    ? 'border-rose-500 bg-rose-950/20 text-rose-100 shadow-sm shadow-rose-500/15' 
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="absolute top-0 right-0 p-1 text-rose-400/20 group-hover:scale-110 transition-transform">
                  <Flame className="w-12 h-12 -mr-3 -mt-3" />
                </div>
                <Flame className={`w-4 h-4 ${config.themeId === 'volcanic' ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="font-bold text-xs">Terra Vulcânica</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">Cinzas, lava e troncos secos</span>
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2: Terrain Sliders */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
          <button 
            id="header-terrain"
            onClick={() => toggleSection('terrain')}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 text-sm font-semibold text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Modelagem do Relevo</span>
            </div>
            {expandedSection === 'terrain' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'terrain' && (
            <div className="p-4 space-y-4 bg-slate-900/30">
              
              {/* Seed Control */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400">Semente (Seed)</label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{config.seed}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={config.seed}
                    onChange={(e) => handleSliderChange('seed', parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    id="btn-roll-seed"
                    onClick={rollNewSeed}
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition-colors"
                    title="Gerar Semente Aleatória"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resolution */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Resolução do Grid</span>
                  <span className="text-slate-200 font-bold">{config.resolution} × {config.resolution}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="160"
                  step="10"
                  value={config.resolution}
                  onChange={(e) => handleSliderChange('resolution', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Maiores valores geram terreno mais detalhado.</span>
              </div>

              {/* Noise Scale */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Escala de Ruído (Zoom Ruído)</span>
                  <span className="text-slate-200 font-bold">{config.noiseScale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.10"
                  step="0.005"
                  value={config.noiseScale}
                  onChange={(e) => handleSliderChange('noiseScale', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Elevation / Height multiplier */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Altitude Máxima</span>
                  <span className="text-slate-200 font-bold">{config.maxHeight}m</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={config.maxHeight}
                  onChange={(e) => handleSliderChange('maxHeight', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Water Level */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Nível da Água</span>
                  <span className="text-slate-200 font-bold">{config.waterLevel.toFixed(1)}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.2"
                  value={config.waterLevel}
                  onChange={(e) => handleSliderChange('waterLevel', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Terrace Toggle and Steps */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Terreno em Degraus (Terrace)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isTerraced}
                      onChange={() => handleToggleChange('isTerraced')}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                {config.isTerraced && (
                  <div className="space-y-1 pl-2 border-l border-slate-800">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-400 text-[11px]">Número de Degraus</span>
                      <span className="text-slate-200 font-bold">{config.terraceSteps}</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="20"
                      step="1"
                      value={config.terraceSteps}
                      onChange={(e) => handleSliderChange('terraceSteps', parseInt(e.target.value))}
                      className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* SECTION 3: Vegetation & Objects Density */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
          <button 
            id="header-density"
            onClick={() => toggleSection('density')}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 text-sm font-semibold text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Densidade dos Elementos</span>
            </div>
            {expandedSection === 'density' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'density' && (
            <div className="p-4 space-y-4 bg-slate-900/30">
              
              {/* Trees */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5 text-emerald-500" />
                    {config.themeId === 'desert' ? 'Cactos' : 'Árvores'}
                  </span>
                  <span className="text-slate-200 font-bold">{config.treeCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="10"
                  value={config.treeCount}
                  onChange={(e) => handleSliderChange('treeCount', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                
                {/* Species Variety Display Badge */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-2 text-[10px] space-y-1">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Espécies no Pool:</div>
                  <div className="text-emerald-400/90 font-medium leading-relaxed">
                    {config.themeId === 'forest' && '🌳 Carvalho Ancestral, 🌸 Cerejeira Sakura, 🍃 Salgueiro Chorão, 🍁 Bordo de Outono, 🪵 Vidoeiro Elegante, 🌲 Pinheiro-Silvestre'}
                    {config.themeId === 'desert' && '🌵 Cacto Saguaro, 🌿 Árvore de Josué, 🌴 Palmeira Tropical'}
                    {config.themeId === 'arctic' && '❄️ Pinheiro Imperial, 💎 Vidoeiro Glacial, 🪵 Tronco Ancestral'}
                    {config.themeId === 'volcanic' && '🌋 Carvalho de Magma, 🪨 Cristal de Enxofre, 🔥 Broto de Fogo'}
                  </div>
                </div>
              </div>

              {/* Rocks */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-slate-400" />
                    Rochas
                  </span>
                  <span className="text-slate-200 font-bold">{config.rockCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={config.rockCount}
                  onChange={(e) => handleSliderChange('rockCount', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Grass */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <TreeDeciduous className="w-3.5 h-3.5 text-green-400" />
                    Tufos de Grama
                  </span>
                  <span className="text-slate-200 font-bold">{config.grassCount}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={config.grassCount}
                  onChange={(e) => handleSliderChange('grassCount', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

            </div>
          )}
        </div>

        {/* SECTION 4: Rendering / Display settings */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20">
          <button 
            id="header-render"
            onClick={() => toggleSection('render')}
            className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/40 hover:bg-slate-800/60 text-sm font-semibold text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Efeitos e Visualização</span>
            </div>
            {expandedSection === 'render' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {expandedSection === 'render' && (
            <div className="p-4 space-y-4 bg-slate-900/30">
              
              {/* Fog Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-400">Densidade da Neblina (Fog)</span>
                  <span className="text-slate-200 font-bold">{(config.fogDensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.08"
                  step="0.005"
                  value={config.fogDensity}
                  onChange={(e) => handleSliderChange('fogDensity', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Shadow toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Sombras Realistas</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.shadowsEnabled}
                    onChange={() => handleToggleChange('shadowsEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Wireframe toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Modo Aramado (Wireframe)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.wireframeEnabled}
                    onChange={() => handleToggleChange('wireframeEnabled')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Auto rotate camera */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Giro Automático da Câmera</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoRotate}
                    onChange={() => handleToggleChange('autoRotate')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/70 grid grid-cols-2 gap-2">
        <button
          id="btn-reset-defaults"
          onClick={onReset}
          className="py-2.5 px-3 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 font-semibold hover:text-slate-100 transition-colors flex items-center justify-center gap-1"
        >
          Padrão
        </button>
        <button
          id="btn-re-generate"
          onClick={onGenerate}
          className="py-2.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-tight transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Regerar Mapa
        </button>
      </div>
    </div>
  );
}
