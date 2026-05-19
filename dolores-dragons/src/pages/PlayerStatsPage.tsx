import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { normalizeName } from '../utils/nameNormalization';
import { matchStats } from '../data/matchStats';
import { Trophy, Users, Star, TrendingUp, ChevronDown, Search, ArrowUpDown } from 'lucide-react';

interface PlayerStats {
  nombre: string;
  dorsal: string;
  partidos: number;
  puntosTotales: number;
  rebotesTotales: number;
  asistenciasTotales: number;
  robosTotales: number;
  taponesTotales: number;
  valoracionTotal: number;
  minutosTotales: number; // in seconds for easier calculation
  tc2pHechos: number;
  tc2pIntentados: number;
  tc3pHechos: number;
  tc3pIntentados: number;
  tlHechos: number;
  tlIntentados: number;
}

type SortField = keyof PlayerStats | 'ppg' | 'rpg' | 'apg' | 'valpg';
type SortOrder = 'asc' | 'desc';

export default function PlayerStatsPage() {
  const [category, setCategory] = useState<'all' | 'cadete' | 'alevin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('ppg');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const processedStats = useMemo(() => {
    const stats: Record<string, PlayerStats> = {};

    Object.entries(matchStats).forEach(([id, match]) => {
      // Filter by category
      const isAlevin = id.startsWith('a');
      if (category === 'cadete' && isAlevin) return;
      if (category === 'alevin' && !isAlevin) return;

      const dragons = match.equipos.find(e => e.nombre === "DOLORES DRAGONS");
      if (!dragons) return;

      dragons.jugadoras.forEach(p => {
        if (!p.nombre || p.nombre.trim() === "") return;
        
        const name = normalizeName(p.nombre);
        if (!stats[name]) {
          stats[name] = {
            nombre: name,
            dorsal: p.dorsal,
            partidos: 0,
            puntosTotales: 0,
            rebotesTotales: 0,
            asistenciasTotales: 0,
            robosTotales: 0,
            taponesTotales: 0,
            valoracionTotal: 0,
            minutosTotales: 0,
            tc2pHechos: 0,
            tc2pIntentados: 0,
            tc3pHechos: 0,
            tc3pIntentados: 0,
            tlHechos: 0,
            tlIntentados: 0,
          };
        }

        const s = stats[name];
        s.partidos += 1;
        s.puntosTotales += p.pts || 0;
        s.rebotesTotales += p.rebTot || 0;
        s.asistenciasTotales += p.ast || 0;
        s.robosTotales += p.rec || 0;
        s.taponesTotales += p.tapTc || 0;
        s.valoracionTotal += p.val || 0;

        // Parse minutes (MM:SS) safely
        const timeParts = (p.min || "0:0").split(':');
        const mins = parseInt(timeParts[0]) || 0;
        const secs = parseInt(timeParts[1]) || 0;
        s.minutosTotales += mins * 60 + secs;

        // Parse shooting safely
        const tc2pParts = (p.tc2p || "0/0").split('/');
        s.tc2pHechos += parseInt(tc2pParts[0]) || 0;
        s.tc2pIntentados += parseInt(tc2pParts[1]) || 0;

        const tc3pParts = (p.tc3p || "0/0").split('/');
        s.tc3pHechos += parseInt(tc3pParts[0]) || 0;
        s.tc3pIntentados += parseInt(tc3pParts[1]) || 0;

        const tlParts = (p.tl || "0/0").split('/');
        s.tlHechos += parseInt(tlParts[0]) || 0;
        s.tlIntentados += parseInt(tlParts[1]) || 0;
      });
    });

    return Object.values(stats).map(s => {
      // Override Keren Rosas stats
      if (s.nombre.includes('KEREN') || s.nombre.includes('ROSAS')) {
        return {
          ...s,
          partidos: 4,
          ppg: 0,
          rpg: 0,
          apg: 0,
          spg: 0,
          bpg: 0,
          valpg: 0.5,
          mpg: 16.90,
          tc2pPct: 0,
          tc2pHechos: 0,
          tc2pIntentados: 0,
          tc3pPct: 0,
          tc3pHechos: 0,
          tc3pIntentados: 0,
          tlPct: 0,
          tlHechos: 0,
          tlIntentados: 0,
        };
      }
      return {
        ...s,
        ppg: s.puntosTotales / s.partidos,
        rpg: s.rebotesTotales / s.partidos,
        apg: s.asistenciasTotales / s.partidos,
        spg: s.robosTotales / s.partidos,
        bpg: s.taponesTotales / s.partidos,
        valpg: s.valoracionTotal / s.partidos,
        mpg: (s.minutosTotales / s.partidos) / 60,
        tc2pPct: s.tc2pIntentados > 0 ? (s.tc2pHechos / s.tc2pIntentados) * 100 : 0,
        tc3pPct: s.tc3pIntentados > 0 ? (s.tc3pHechos / s.tc3pIntentados) * 100 : 0,
        tlPct: s.tlIntentados > 0 ? (s.tlHechos / s.tlIntentados) * 100 : 0,
      };
    });
  }, [category]);

  const filteredAndSortedStats = useMemo(() => {
    return processedStats
      .filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[sortField as keyof typeof a];
        const bValue = b[sortField as keyof typeof b];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
        }
        return 0;
      });
  }, [processedStats, searchTerm, sortField, sortOrder]);

  const topScorers = useMemo(() => {
    return [...processedStats]
      .sort((a, b) => b.ppg - a.ppg)
      .slice(0, 5)
      .map(p => ({ name: p.nombre.split(',')[1]?.trim() || p.nombre, ppg: parseFloat(p.ppg.toFixed(1)) }));
  }, [processedStats]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background text-text">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Estadísticas <span className="text-primary italic">Individuales</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted max-w-2xl"
          >
            Análisis detallado del rendimiento de nuestras jugadoras durante la temporada 2025/2026.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex bg-surface p-1 rounded-full border border-white/5 w-full md:w-auto">
            {(['all', 'cadete', 'alevin'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  category === cat ? 'bg-primary text-black' : 'text-text-muted hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat === 'cadete' ? 'Cadete' : 'Alevín'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar jugadora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 bg-surface rounded-3xl p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold uppercase tracking-wider flex items-center gap-3">
                <TrendingUp className="text-primary w-5 h-5" />
                Líderes en Anotación (PPG)
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topScorers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#ffffff60', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="ppg" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                    {topScorers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#D4AF37' : '#D4AF3780'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-white/5 flex flex-col justify-center">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-primary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2">MVP de la Temporada</h3>
              <p className="text-text-muted text-sm uppercase tracking-widest">Basado en Valoración Media</p>
            </div>
            
            {processedStats.length > 0 && (
              <div className="space-y-6">
                {[...processedStats].sort((a, b) => b.valpg - a.valpg).slice(0, 3).map((p, i) => (
                  <div key={p.nombre} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-black ${i === 0 ? 'text-primary' : 'text-white/20'}`}>0{i + 1}</span>
                      <div>
                        <p className="font-bold text-sm uppercase tracking-wider">{p.nombre.split(',')[1]} {p.nombre.split(',')[0]}</p>
                        <p className="text-xs text-text-muted">#{p.dorsal}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{p.valpg.toFixed(1)}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest">VAL/G</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Table */}
        <div className="bg-surface rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-white/5 bg-white/5">
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Jugadora</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center">PJ</th>
                  <th 
                    className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('ppg')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      PPG {sortField === 'ppg' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th 
                    className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('rpg')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      RPG {sortField === 'rpg' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th 
                    className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('apg')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      APG {sortField === 'apg' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th 
                    className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('valpg')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      VAL {sortField === 'valpg' && <ArrowUpDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center">2P%</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center">3P%</th>
                  <th className="p-6 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted text-center">TL%</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStats.map((player, i) => (
                  <tr 
                    key={player.nombre} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-text-muted">#{player.dorsal}</span>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
                            {player.nombre.split(',')[1]} {player.nombre.split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-center font-mono text-sm">{player.partidos}</td>
                    <td className="p-6 text-center font-bold text-sm">{player.ppg.toFixed(1)}</td>
                    <td className="p-6 text-center font-mono text-sm text-text-muted">{player.rpg.toFixed(1)}</td>
                    <td className="p-6 text-center font-mono text-sm text-text-muted">{player.apg.toFixed(1)}</td>
                    <td className="p-6 text-center font-bold text-sm text-primary">{player.valpg.toFixed(1)}</td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">{player.tc2pPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-text-muted">{player.tc2pHechos}/{player.tc2pIntentados}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">{player.tc3pPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-text-muted">{player.tc3pHechos}/{player.tc3pIntentados}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold">{player.tlPct.toFixed(0)}%</span>
                        <span className="text-[10px] text-text-muted">{player.tlHechos}/{player.tlIntentados}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
