import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { matchStats } from '../data/matchStats';
import { StatLabelWithTooltip, renderLocation } from '../utils/matchUtils';

interface MatchDetailsModalProps {
  match: any;
  onClose: () => void;
}

export default function MatchDetailsModal({ match, onClose }: MatchDetailsModalProps) {
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  if (!match) return null;

  // Handle both the old format (from chatbot) and the new format (from matchesData)
  const isOldFormat = match.opponent !== undefined;
  
  const homeTeam = isOldFormat ? 'Dolores Dragons' : match.homeTeam;
  const awayTeam = isOldFormat ? match.opponent : match.awayTeam;
  
  let homeScore = match.homeScore;
  let awayScore = match.awayScore;
  let result = match.result;

  if (isOldFormat && match.result) {
    // Parse "W 45-30" or "45-30"
    const scoreMatch = match.result.match(/(\d+)\s*-\s*(\d+)/);
    if (scoreMatch) {
      homeScore = scoreMatch[1];
      awayScore = scoreMatch[2];
    }
    result = match.result.includes('W') ? 'W' : (match.result.includes('L') ? 'L' : undefined);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-background/50 sticky top-0 z-10">
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                {match.jornada ? `Jornada ${match.jornada}` : 'Partido'} {match.phase && `- ${match.phase}`}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {match.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {renderLocation(match.location)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Score Header */}
            <div className="flex items-center justify-between gap-4 mb-8 bg-background/30 p-6 rounded-xl border border-white/5">
              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-3">
                  {homeTeam === 'Dolores Dragons' ? (
                    <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-surface border border-white/10 rounded-full flex items-center justify-center text-lg font-bold text-text-muted">
                      {homeTeam?.substring(0,3).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-white leading-tight">{homeTeam}</p>
              </div>

              <div className="text-center px-4 shrink-0">
                <div className="text-4xl md:text-5xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                  {homeScore !== undefined ? `${homeScore} - ${awayScore}` : 'VS'}
                </div>
                {result && (
                  <div className={`text-xs font-bold px-3 py-1 rounded-full mt-2 inline-block ${result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {result === 'W' ? 'VICTORIA' : 'DERROTA'}
                  </div>
                )}
              </div>

              <div className="text-center flex-1">
                <div className="w-16 h-16 mx-auto mb-3">
                  {awayTeam === 'Dolores Dragons' ? (
                    <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-surface border border-white/10 rounded-full flex items-center justify-center text-lg font-bold text-text-muted">
                      {awayTeam?.substring(0,3).toUpperCase()}
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-white leading-tight">{awayTeam}</p>
              </div>
            </div>

            {/* Quarters (if available) */}
            {match.quarters && (
              <div className="mb-8 overflow-x-auto">
                <div className="min-w-[400px]">
                  <table className="w-full text-sm text-center">
                    <thead className="text-xs text-white/50 uppercase bg-white/5">
                      <tr>
                        <th className="py-2 px-4 font-medium text-left">Equipo</th>
                        {match.quarters.home.map((_: any, i: number) => (
                          <th key={i} className="py-2 px-4 font-medium">Q{i + 1}</th>
                        ))}
                        <th className="py-2 px-4 font-bold text-primary">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="bg-surface/30">
                        <td className="py-3 px-4 font-bold text-white text-left">{match.homeTeam}</td>
                        {match.quarters.home.map((homeQ: number, i: number) => {
                          const awayQ = match.quarters.away[i];
                          const isWinner = homeQ > awayQ;
                          const isLoser = homeQ < awayQ;
                          return (
                            <td key={i} className={`py-3 px-4 font-mono ${isWinner ? 'text-emerald-400 font-bold bg-emerald-500/10' : isLoser ? 'text-red-400/80 bg-red-500/5' : 'text-white/60'}`}>
                              {homeQ}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 font-bold text-white font-mono">{match.homeScore}</td>
                      </tr>
                      <tr className="bg-surface/30">
                        <td className="py-3 px-4 font-bold text-white text-left">{match.awayTeam}</td>
                        {match.quarters.away.map((awayQ: number, i: number) => {
                          const homeQ = match.quarters.home[i];
                          const isWinner = awayQ > homeQ;
                          const isLoser = awayQ < homeQ;
                          return (
                            <td key={i} className={`py-3 px-4 font-mono ${isWinner ? 'text-emerald-400 font-bold bg-emerald-500/10' : isLoser ? 'text-red-400/80 bg-red-500/5' : 'text-white/60'}`}>
                              {awayQ}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 font-bold text-white font-mono">{match.awayScore}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {matchStats[match.id] ? (
              <div className="space-y-8">
                {/* Score Evolution Chart */}
                <div className="bg-background/50 p-4 rounded-xl border border-white/5">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Evolución del Marcador</h4>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={matchStats[match.id].scoreEvolution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="minute" 
                          stroke="#8E9299" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          label={{ value: 'Minuto', position: 'insideBottom', offset: -5, fill: '#8E9299', fontSize: 10 }}
                        />
                        <YAxis 
                          stroke="#8E9299" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151619', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ fontSize: '12px' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="home" 
                          name={match.homeTeam} 
                          stroke={match.homeTeam === 'Dolores Dragons' ? '#D4AF37' : '#8E9299'} 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: match.homeTeam === 'Dolores Dragons' ? '#D4AF37' : '#8E9299' }} 
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="away" 
                          name={match.awayTeam} 
                          stroke={match.awayTeam === 'Dolores Dragons' ? '#D4AF37' : '#8E9299'} 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: match.awayTeam === 'Dolores Dragons' ? '#D4AF37' : '#8E9299' }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Best Players Section */}
                {matchStats[match.id].equipos && matchStats[match.id].equipos.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Mejores Jugadoras (Dolores Dragons)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchStats[match.id].equipos
                      .find((team: any) => team.nombre.toUpperCase() === 'DOLORES DRAGONS')
                      ?.jugadoras
                      .sort((a: any, b: any) => (b.pts || 0) - (a.pts || 0) || (b.val || 0) - (a.val || 0))
                      .slice(0, 4)
                      .map((player: any, pIdx: number) => (
                        <div key={pIdx} className="bg-background border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-primary border border-white/10">
                              {player.dorsal}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">{player.nombre}</div>
                              <div className="text-[10px] text-text-muted">Valoración: {player.val || 0}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary leading-none">{player.pts || 0}</div>
                            <div className="text-[8px] text-text-muted uppercase tracking-tighter">Puntos</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                )}

                {/* Team Stats Summary */}
                {matchStats[match.id].teamStats && matchStats[match.id].teamStats.length > 0 && (
                <div className="bg-background/30 p-6 rounded-xl border border-white/5">
                  <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6 text-center">Resumen Estadístico</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchStats[match.id].teamStats.map((stat: any, idx: number) => (
                      <div key={idx} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                        <StatLabelWithTooltip label={stat.label} />
                        <div className="flex items-center justify-between w-full px-4">
                          <span className={`text-sm font-bold ${match.homeTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>{stat.home}</span>
                          <div className="h-4 w-[1px] bg-white/10 mx-2" />
                          <span className={`text-sm font-bold ${match.awayTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>{stat.away}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {/* Detailed Stats Tables */}
                {matchStats[match.id].equipos && matchStats[match.id].equipos.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Estadísticas Detalladas</h4>
                  {matchStats[match.id].equipos.map((equipo: any, teamIdx: number) => (
                    <div key={teamIdx} className="bg-background border border-white/10 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setExpandedTeam(expandedTeam === teamIdx ? null : teamIdx)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-surface/50 hover:bg-surface transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Trophy className={`w-5 h-5 ${equipo.totales.pts > matchStats[match.id].equipos[teamIdx === 0 ? 1 : 0].totales.pts ? 'text-primary' : 'text-white/30'}`} />
                          <h4 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider text-left">Estadísticas: {equipo.nombre}</h4>
                        </div>
                        {expandedTeam === teamIdx ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
                      </button>
                      
                      <AnimatePresence>
                        {expandedTeam === teamIdx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="text-xs text-white/50 uppercase bg-white/5">
                                  <tr>
                                    <th className="px-4 py-3 font-medium">Dorsal</th>
                                    <th className="px-4 py-3 font-medium">Jugadora</th>
                                    <th className="px-4 py-3 font-medium text-center">MIN</th>
                                    <th className="px-4 py-3 font-medium text-center text-primary">PTS</th>
                                    <th className="px-4 py-3 font-medium text-center">T2</th>
                                    <th className="px-4 py-3 font-medium text-center">T3</th>
                                    <th className="px-4 py-3 font-medium text-center">TL</th>
                                    <th className="px-4 py-3 font-medium text-center">REB</th>
                                    <th className="px-4 py-3 font-medium text-center">AST</th>
                                    <th className="px-4 py-3 font-medium text-center">REC</th>
                                    <th className="px-4 py-3 font-medium text-center">PER</th>
                                    <th className="px-4 py-3 font-medium text-center">VAL</th>
                                    <th className="px-4 py-3 font-medium text-center">+/-</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                  {equipo.jugadoras.map((jugadora: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                      <td className="px-4 py-3 font-mono text-white/70">{jugadora.dorsal}</td>
                                      <td className="px-4 py-3 font-bold text-white">{jugadora.nombre.replace('*', '')}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.min}</td>
                                      <td className="px-4 py-3 text-center font-mono font-bold text-primary">{jugadora.pts}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.tc2p}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.tc3p}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.tl}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.rebTot}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.ast}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.rec}</td>
                                      <td className="px-4 py-3 text-center font-mono text-white/70">{jugadora.per}</td>
                                      <td className="px-4 py-3 text-center font-mono font-bold text-white">{jugadora.val}</td>
                                      <td className={`px-4 py-3 text-center font-mono font-bold ${jugadora.masMenos > 0 ? 'text-green-400' : jugadora.masMenos < 0 ? 'text-red-400' : 'text-white/50'}`}>
                                        {jugadora.masMenos > 0 ? '+' : ''}{jugadora.masMenos}
                                      </td>
                                    </tr>
                                  ))}
                                  {/* Totals Row */}
                                  <tr className="bg-primary/10 font-bold">
                                    <td colSpan={2} className="px-4 py-4 text-primary uppercase tracking-wider">Totales del Equipo</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.min}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary text-lg">{equipo.totales.pts}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.tc2p}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.tc3p}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.tl}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.rebTot}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.ast}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.rec}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.per}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.val}</td>
                                    <td className="px-4 py-4 text-center font-mono text-primary">{equipo.totales.masMenos}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-muted">Estadísticas detalladas no disponibles para este partido.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
