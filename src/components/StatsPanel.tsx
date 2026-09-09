import React from 'react';
import { 
  Activity, 
  Clock, 
  Layers, 
  Grid3X3, 
  TreePine, 
  Mountain, 
  Waves, 
  TrendingUp,
  Snowflake,
  Sun
} from 'lucide-react';
import { TerrainStats } from '../types';

interface StatsPanelProps {
  stats: TerrainStats;
  themeId: string;
}

export default function StatsPanel({ stats, themeId }: StatsPanelProps) {
  // Translate height categories for Portuguese display
  const categories = [
    { key: 'water', label: themeId === 'volcanic' ? 'Lava' : 'Água', color: themeId === 'volcanic' ? 'bg-red-500' : 'bg-blue-500', icon: Waves },
    { key: 'sand', label: themeId === 'volcanic' ? 'Cinza' : 'Areia', color: themeId === 'volcanic' ? 'bg-slate-700' : 'bg-amber-300', icon: Sun },
    { key: 'grass', label: themeId === 'volcanic' ? 'Queimado' : 'Grama', color: themeId === 'volcanic' ? 'bg-slate-900 border border-slate-800' : 'bg-emerald-500', icon: TreePine },
    { key: 'rock', label: 'Rocha', color: 'bg-slate-500', icon: Mountain },
    { key: 'snow', label: themeId === 'volcanic' ? 'Enxofre' : 'Neve', color: themeId === 'volcanic' ? 'bg-yellow-200' : 'bg-slate-100', icon: Snowflake }
  ];

  return (
    <div id="stats-panel" className="bg-slate-900/95 border border-slate-800 rounded-xl p-4 text-slate-200 shadow-xl max-w-sm backdrop-blur-md">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
        <Activity className="w-4 h-4 text-emerald-400" />
        <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-400">
          Métricas da Geração
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Gen Time */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block leading-tight">Tempo Geração</span>
            <span className="text-xs font-bold font-mono text-slate-200 truncate">
              {stats.generationTimeMs.toFixed(1)} ms
            </span>
          </div>
        </div>

        {/* Vertex count */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Grid3X3 className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block leading-tight">Polígonos (Faces)</span>
            <span className="text-xs font-bold font-mono text-slate-200 truncate">
              {stats.faceCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tree Count */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <TreePine className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block leading-tight">Total Árvores</span>
            <span className="text-xs font-bold font-mono text-slate-200 truncate">
              {stats.placedTrees}
            </span>
          </div>
        </div>

        {/* Rock Count */}
        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <Mountain className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 block leading-tight">Total Rochas</span>
            <span className="text-xs font-bold font-mono text-slate-200 truncate">
              {stats.placedRocks}
            </span>
          </div>
        </div>
      </div>

      {/* Distribution percentages bar */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
          Distribuição do Terreno
        </span>

        {/* ProgressBar */}
        <div className="h-2 w-full rounded-full overflow-hidden flex bg-slate-800">
          {categories.map((c) => {
            const pct = stats.heightDistribution[c.key as keyof typeof stats.heightDistribution] || 0;
            if (pct <= 0) return null;
            return (
              <div 
                key={c.key} 
                className={`${c.color} h-full transition-all duration-500`} 
                style={{ width: `${pct}%` }}
                title={`${c.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
          {categories.map((c) => {
            const pct = stats.heightDistribution[c.key as keyof typeof stats.heightDistribution] || 0;
            const Icon = c.icon;
            return (
              <div key={c.key} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className={`w-2 h-2 rounded-full ${c.color} shrink-0`} />
                <span className="truncate max-w-[80px]">{c.label}</span>
                <span className="font-mono text-slate-200 font-semibold ml-auto">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
