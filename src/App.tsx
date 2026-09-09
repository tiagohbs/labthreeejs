import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TerrainCanvas from './components/TerrainCanvas';
import StatsPanel from './components/StatsPanel';
import LabSuite from './components/LabSuite';
import { CustomTreeConfig } from './utils/treeGenerator';
import { CustomRockConfig } from './utils/rockGenerator';
import { CustomHouseConfig } from './utils/houseGenerator';
import { CustomGrassConfig } from './utils/grassGenerator';
import { TerrainConfig, TerrainStats, PlacedObject } from './types';
import { HelpCircle, RefreshCw, Hammer, Compass, BarChart } from 'lucide-react';

const DEFAULT_CONFIG: TerrainConfig = {
  seed: 42137,
  resolution: 80,
  noiseScale: 0.04,
  noiseOctaves: 4,
  maxHeight: 12,
  waterLevel: 3.5,
  terraceSteps: 8,
  isTerraced: false,
  
  // Density parameters
  treeCount: 80,
  rockCount: 40,
  grassCount: 150,
  
  // Rendering settings
  fogDensity: 0.02,
  shadowsEnabled: true,
  wireframeEnabled: false,
  autoRotate: false,
  themeId: 'forest'
};

const INITIAL_STATS: TerrainStats = {
  generationTimeMs: 0,
  vertexCount: 0,
  faceCount: 0,
  placedTrees: 0,
  placedRocks: 0,
  placedGrass: 0,
  heightDistribution: {
    water: 0,
    sand: 0,
    grass: 0,
    rock: 0,
    snow: 0
  }
};

export default function App() {
  const [config, setConfig] = useState<TerrainConfig>(DEFAULT_CONFIG);
  const [customObjects, setCustomObjects] = useState<PlacedObject[]>([]);
  const [activeTool, setActiveTool] = useState<string>('inspect');
  const [stats, setStats] = useState<TerrainStats>(INITIAL_STATS);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [activeMode, setActiveMode] = useState<'world' | 'labs_suite'>('world');
  const [customTreeConfig, setCustomTreeConfig] = useState<CustomTreeConfig | null>(null);
  const [customRockConfig, setCustomRockConfig] = useState<CustomRockConfig | null>(null);
  const [customHouseConfig, setCustomHouseConfig] = useState<CustomHouseConfig | null>(null);
  const [customGrassConfig, setCustomGrassConfig] = useState<CustomGrassConfig | null>(null);
  const [lastLabTab, setLastLabTab] = useState<'tree' | 'rock' | 'house' | 'grass'>('tree');

  const handleConfigChange = (newConfig: TerrainConfig) => {
    setConfig(newConfig);
  };

  const handleGenerateNewSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999);
    setConfig((prev) => ({
      ...prev,
      seed: randomSeed
    }));
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setCustomObjects([]);
    setActiveTool('inspect');
  };

  const handleAddCustomObject = (obj: PlacedObject) => {
    setCustomObjects((prev) => [...prev, obj]);
  };

  const handleClearCustomObjects = () => {
    setCustomObjects([]);
  };

  if (activeMode === 'labs_suite') {
    return (
      <LabSuite
        onBackToWorld={() => setActiveMode('world')}
        onApplyCustomTree={(newTree) => setCustomTreeConfig(newTree)}
        onApplyCustomRock={(newRock) => setCustomRockConfig(newRock)}
        onApplyCustomHouse={(newHouse) => setCustomHouseConfig(newHouse)}
        onApplyCustomGrass={(newGrass) => setCustomGrassConfig(newGrass)}
        currentTree={customTreeConfig}
        currentRock={customRockConfig}
        currentHouse={customHouseConfig}
        currentGrass={customGrassConfig}
        initialTab={lastLabTab}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* 1. LEFT CONTROLS SIDEBAR */}
      <Sidebar
        config={config}
        onChange={handleConfigChange}
        onGenerate={handleGenerateNewSeed}
        onReset={handleReset}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onClearCustomObjects={handleClearCustomObjects}
        onOpenLab={(tab) => {
          setLastLabTab(tab);
          setActiveMode('labs_suite');
        }}
        hasCustomTree={customTreeConfig !== null}
        hasCustomRock={customRockConfig !== null}
        hasCustomHouse={customHouseConfig !== null}
        hasCustomGrass={customGrassConfig !== null}
      />

      {/* 2. CORE INTERACTIVE CANVAS WORKSPACE */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        
        {/* Floating Tool Bar Indicator */}
        <div id="active-tool-banner" className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl backdrop-blur-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ferramenta Ativa</span>
            <span className="text-xs font-bold text-slate-100">
              {activeTool === 'inspect' && '🧭 Modo de Inspeção / Navegação'}
              {activeTool === 'add_tree' && (
                customTreeConfig 
                  ? '🌳 Plantar Árvore DNA Customizado (Clique no mapa)' 
                  : '🌲 Plantar Árvore (Clique no mapa)'
              )}
              {activeTool === 'add_rock' && (
                customRockConfig 
                  ? '🪨 Colocar Rocha DNA Customizado (Clique no mapa)' 
                  : '🪨 Colocar Rocha (Clique no mapa)'
              )}
              {activeTool === 'add_house' && (
                customHouseConfig 
                  ? '🏡 Construir Cabana DNA Customizado (Clique no mapa)' 
                  : '🏡 Construir Cabana (Clique no mapa)'
              )}
              {activeTool === 'sculpt_up' && '🌋 Esculpir Relevo - Elevar Terra'}
              {activeTool === 'sculpt_down' && '🌊 Esculpir Relevo - Rebaixar Terra'}
              {activeTool === 'path_stone' && '🧱 Colocar Ladrilho de Pedra (Clique no mapa)'}
              {activeTool === 'path_dirt' && '🥾 Colocar Caminho de Barro (Clique no mapa)'}
              {activeTool === 'path_grass' && '🌿 Colocar Grama Pisoteada (Clique no mapa)'}
              {activeTool === 'path_wood' && '🪵 Colocar Caminho de Madeira (Clique no mapa)'}
            </span>
          </div>
        </div>

        {/* Floating Stats Panel Overlay (Bottom-Right) */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-auto">
          <StatsPanel stats={stats} themeId={config.themeId} />
        </div>

        {/* 3D WebGL Canvas */}
        <div className="flex-1 w-full h-full relative">
          <TerrainCanvas
            config={config}
            customObjects={customObjects}
            onAddCustomObject={handleAddCustomObject}
            activeTool={activeTool}
            onUpdateStats={setStats}
            customTreeConfig={customTreeConfig}
            customRockConfig={customRockConfig}
            customHouseConfig={customHouseConfig}
            customGrassConfig={customGrassConfig}
          />
        </div>

        {/* Floating Instructions/Welcome Modal (Dismissible) */}
        {showWelcome && (
          <div id="welcome-modal" className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md shadow-2xl relative">
              <button 
                id="btn-close-welcome"
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 font-bold text-lg p-1 transition-colors"
              >
                &times;
              </button>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-6 h-6 text-emerald-400" />
                <h2 className="font-sans font-bold text-lg text-slate-100">Bem-vindo ao Gerador de Mundos!</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Esta aplicação reconstrói o incrível projeto de <b>Geração Procedural 3D</b> em Three.js. 
                Aqui você pode criar, configurar e moldar sua própria paisagem natural em tempo real!
              </p>
              
              <div className="space-y-3 mb-5 text-xs text-slate-300">
                <div className="flex gap-2.5">
                  <div className="p-1 rounded bg-slate-800 h-fit text-emerald-400 font-bold">1</div>
                  <p><b>Escolha o Bioma:</b> Alterne entre florestas verdes, desertos escaldantes, montanhas geladas ou vulcões com lava brilhante!</p>
                </div>
                <div className="flex gap-2.5">
                  <div className="p-1 rounded bg-slate-800 h-fit text-emerald-400 font-bold">2</div>
                  <p><b>Molde o Relevo:</b> Ajuste semente, ruído e altitude máxima. Ou use as ferramentas de esculpir para levantar e rebaixar a terra diretamente com cliques!</p>
                </div>
                <div className="flex gap-2.5">
                  <div className="p-1 rounded bg-slate-800 h-fit text-emerald-400 font-bold">3</div>
                  <p><b>Modo Caixa de Areia:</b> Plante árvores, pedras e cabanas interativas para habitar seu mundo procedural!</p>
                </div>
              </div>

              <button
                id="btn-explore"
                onClick={() => setShowWelcome(false)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold text-xs rounded-xl tracking-wide transition-all shadow-lg shadow-emerald-500/20"
              >
                Começar a Explorar o Mundo
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
