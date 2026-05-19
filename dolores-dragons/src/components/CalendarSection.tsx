import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MapPin, Clock, Trophy, ChevronRight, X, BarChart3, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { matchesData } from '../data/matches';
import { useBackToClose } from '../hooks/useBackToClose';
import { renderLocation } from '../utils/matchUtils';
import MatchDetailsModal from './MatchDetailsModal';

const parseSpanishDate = (dateStr: string) => {
  const months: Record<string, string> = {
    'Ene': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Abr': 'Apr', 'May': 'May', 'Jun': 'Jun',
    'Jul': 'Jul', 'Ago': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dic': 'Dec'
  };
  const parts = dateStr.split(' ');
  if (parts.length !== 3) return 0;
  const [day, month, year] = parts;
  const englishMonth = months[month] || month;
  return new Date(`${day} ${englishMonth} ${year}`).getTime();
};

export default function CalendarSection() {
  const [activeCategory, setActiveCategory] = useState<'Cadete Femenino' | 'Alevín Mixto'>('Cadete Femenino');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Handle back button to close modals
  useBackToClose(!!selectedMatch, () => setSelectedMatch(null));
  useBackToClose(isHistoryOpen, () => setIsHistoryOpen(false));

  const currentData = matchesData[activeCategory];

  return (
    <section id="calendario" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 text-white uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Calendario y <span className="text-primary">Resultados</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-6 md:mb-8"
          >
            Sigue de cerca nuestra trayectoria en la liga. No te pierdas el próximo gran enfrentamiento.
          </motion.p>
          
          {/* Category Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center gap-6 w-full"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {(['Cadete Femenino', 'Alevín Mixto'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="relative px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
                >
                  {activeCategory === category && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-300 ${
                    activeCategory === category ? 'text-[#000000]' : 'text-text-muted hover:text-white'
                  }`}>
                    {category}
                  </span>
                  {activeCategory !== category && (
                    <div className="absolute inset-0 bg-surface border border-white/10 rounded-full -z-10" />
                  )}
                </button>
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeCategory}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="flex gap-4 text-sm font-bold uppercase tracking-widest mt-2"
              >
                <div className="text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
                  {currentData.stats.wins} Victorias
                </div>
                <div className="text-red-500 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20">
                  {currentData.stats.losses} Derrotas
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeCategory}
            initial={{ opacity: 0, y: 20, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.99 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="max-w-5xl mx-auto mt-8 md:mt-12"
          >
            {/* Static Display for Last Result and Next Match */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {currentData.nextMatch ? (
                <>
                  {/* Left: Próximo Partido */}
                  {currentData.nextMatch && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-surface border border-primary/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] rounded-2xl p-4 md:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors"
                      onClick={() => setSelectedMatch(currentData.nextMatch)}
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-primary/10 text-primary border-primary/20 border rounded-full text-xs font-bold uppercase tracking-widest">
                          Próximo Partido
                        </span>
                        <span className="text-text-muted text-xs font-medium flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-primary" />
                          J. {currentData.nextMatch.jornada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:gap-4 mb-6">
                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.nextMatch.homeTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.nextMatch.homeTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.nextMatch.homeTeam}</p>
                        </div>

                        <div className="text-center px-2 md:px-4 shrink-0">
                          <div className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                            VS
                          </div>
                          <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                            {currentData.nextMatch.time}
                          </div>
                        </div>

                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.nextMatch.awayTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.nextMatch.awayTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.nextMatch.awayTeam}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentData.nextMatch.date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {currentData.nextMatch.location.split(',')[0]}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* Right: Último Resultado */}
                  {currentData.recentResults[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface border border-white/10 rounded-2xl p-4 md:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedMatch(currentData.recentResults[0])}
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-white/5 text-text-muted border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
                          Último Resultado {currentData.recentResults[0].phase && `(${currentData.recentResults[0].phase})`}
                        </span>
                        <span className="text-text-muted text-xs font-medium flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-primary" />
                          J. {currentData.recentResults[0].jornada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:gap-4 mb-6">
                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[0].homeTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[0].homeTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[0].homeTeam}</p>
                        </div>

                        <div className="text-center px-2 md:px-4 shrink-0">
                          <div className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                            {currentData.recentResults[0].homeScore} - {currentData.recentResults[0].awayScore}
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${currentData.recentResults[0].result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {currentData.recentResults[0].result === 'W' ? 'VICTORIA' : 'DERROTA'}
                          </div>
                        </div>

                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[0].awayTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[0].awayTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[0].awayTeam}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentData.recentResults[0].date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {renderLocation(currentData.recentResults[0].location)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  {/* Left: Último Resultado */}
                  {currentData.recentResults[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface border border-white/10 rounded-2xl p-4 md:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedMatch(currentData.recentResults[0])}
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-white/5 text-text-muted border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
                          Último Resultado {currentData.recentResults[0].phase && `(${currentData.recentResults[0].phase})`}
                        </span>
                        <span className="text-text-muted text-xs font-medium flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-primary" />
                          J. {currentData.recentResults[0].jornada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:gap-4 mb-6">
                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[0].homeTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[0].homeTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[0].homeTeam}</p>
                        </div>

                        <div className="text-center px-2 md:px-4 shrink-0">
                          <div className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                            {currentData.recentResults[0].homeScore} - {currentData.recentResults[0].awayScore}
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${currentData.recentResults[0].result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {currentData.recentResults[0].result === 'W' ? 'VICTORIA' : 'DERROTA'}
                          </div>
                        </div>

                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[0].awayTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[0].awayTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[0].awayTeam}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentData.recentResults[0].date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {renderLocation(currentData.recentResults[0].location)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* Right: Penúltimo Resultado */}
                  {currentData.recentResults[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-surface border border-white/10 hover:border-primary/30 cursor-pointer rounded-2xl p-4 md:p-8 relative overflow-hidden group transition-colors"
                      onClick={() => setSelectedMatch(currentData.recentResults[1])}
                    >
                      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-3 py-1 bg-white/5 text-text-muted border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
                          Penúltimo Resultado {currentData.recentResults[1].phase ? `(${currentData.recentResults[1].phase})` : ''}
                        </span>
                        <span className="text-text-muted text-xs font-medium flex items-center gap-2">
                          <Trophy className="w-3 h-3 text-primary" />
                          J. {currentData.recentResults[1].jornada}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 md:gap-4 mb-6">
                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[1].homeTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[1].homeTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[1].homeTeam}</p>
                        </div>

                        <div className="text-center px-2 md:px-4 shrink-0">
                          <div className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
                            {currentData.recentResults[1].homeScore} - {currentData.recentResults[1].awayScore}
                          </div>
                          <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${currentData.recentResults[1].result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {currentData.recentResults[1].result === 'W' ? 'VICTORIA' : 'DERROTA'}
                          </div>
                        </div>

                        <div className="text-center flex-1 min-w-0">
                          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
                            {currentData.recentResults[1].awayTeam === 'Dolores Dragons' ? (
                              <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                                {currentData.recentResults[1].awayTeam.substring(0,3).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{currentData.recentResults[1].awayTeam}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-text-muted">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {currentData.recentResults[1].date}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {renderLocation(currentData.recentResults[1].location)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="px-8 py-4 bg-surface border border-white/10 rounded-full text-sm font-bold text-white hover:text-primary hover:border-primary/50 transition-all uppercase tracking-widest flex items-center gap-3 shadow-xl"
              >
                Ver todos los partidos <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Horarios de Entrenamiento */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16 max-w-6xl mx-auto bg-surface border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8 relative z-10">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2 md:gap-3" style={{ fontFamily: 'var(--font-display)' }}>
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Horarios de Entrenamiento
              </h3>
              <p className="text-sm md:text-base text-text-muted mt-2">
                Días lectivos según el calendario escolar de la Comunidad de Madrid (Ayuntamiento de Carabanchel).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
            {/* Cadetes */}
            <div className="bg-background border border-white/5 rounded-xl p-5 md:p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">Cadete Femenino</h4>
                <span className="px-2.5 md:px-3 py-1 bg-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-full border border-primary/20">
                  Martes y Jueves
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-text-muted mb-2">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
                <span className="text-sm md:text-base text-white font-medium">17:00 - 19:00</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-text-muted">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/qdZukKnonRvUNfnF9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm md:text-base hover:text-primary transition-colors hover:underline truncate"
                >
                  DOLORES DRAGONS
                </a>
              </div>
            </div>

            {/* Alevines */}
            <div className="bg-background border border-white/5 rounded-xl p-5 md:p-6 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h4 className="text-base md:text-lg font-bold text-white uppercase tracking-wider">Alevín Mixto</h4>
                <span className="px-2.5 md:px-3 py-1 bg-primary/10 text-primary text-[10px] md:text-xs font-bold rounded-full border border-primary/20">
                  Martes y Jueves
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-text-muted mb-2">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
                <span className="text-sm md:text-base text-white font-medium">17:00 - 18:00</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3 text-text-muted">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary shrink-0" />
                <a 
                  href="https://maps.app.goo.gl/qdZukKnonRvUNfnF9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm md:text-base hover:text-primary transition-colors hover:underline truncate"
                >
                  DOLORES DRAGONS
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Match Stats Modal */}
      <MatchDetailsModal 
        match={selectedMatch} 
        onClose={() => setSelectedMatch(null)} 
      />

      {/* Full History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsHistoryOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-4 md:p-8 max-w-4xl w-full relative max-h-[85vh] overflow-y-auto cursor-default"
            >
              <button 
                onClick={() => setIsHistoryOpen(false)} 
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 uppercase tracking-wider pr-8" style={{ fontFamily: 'var(--font-display)' }}>
                Historial Completo
              </h3>
              <p className="text-text-muted mb-6">Todos los partidos de {activeCategory}</p>
              
              <div className="flex flex-col gap-3">
                {[...currentData.upcomingMatches, ...currentData.recentResults]
                  .sort((a, b) => parseSpanishDate(b.date) - parseSpanishDate(a.date))
                  .map((match, index, array) => {
                    const showPhase = match.phase && (index === 0 || array[index-1].phase !== match.phase);
                    return (
                      <div key={match.id}>
                        {showPhase && <div className="text-sm font-bold text-primary uppercase tracking-widest my-4">{match.phase}</div>}
                        <div 
                          onClick={() => {
                            setIsHistoryOpen(false);
                            setSelectedMatch(match as any);
                          }}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-background border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group gap-4"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Date Box */}
                            <div className="text-center px-3 py-1.5 bg-surface rounded-lg border border-white/10 min-w-[80px] shrink-0">
                              <div className="text-[10px] text-text-muted uppercase tracking-wider">{match.date}</div>
                              {match.time && <div className="text-[10px] text-white font-bold">{match.time}</div>}
                              {match.jornada && <div className="text-[9px] text-primary font-bold mt-1">J. {match.jornada}</div>}
                            </div>

                            {/* Teams and Scores (Mobile) */}
                            <div className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 flex-1">
                              <span className={`text-xs font-bold leading-tight ${match.homeTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>
                                {match.homeTeam}
                              </span>
                              <span className={`sm:hidden text-sm font-bold text-right min-w-[24px] ${match.homeTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>
                                {(match as any).homeScore !== undefined ? (match as any).homeScore : ''}
                              </span>
                              
                              <span className={`text-xs font-bold leading-tight ${match.awayTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>
                                {match.awayTeam}
                              </span>
                              <span className={`sm:hidden text-sm font-bold text-right min-w-[24px] ${match.awayTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}`}>
                                {(match as any).awayScore !== undefined ? (match as any).awayScore : ''}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                            {match.location && (
                              <div className="text-[10px] text-text-muted flex items-center gap-1 max-w-[150px] sm:max-w-none">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <div className="truncate">{renderLocation(match.location)}</div>
                              </div>
                            )}
                            
                            {/* Desktop Score */}
                            <div className="hidden sm:flex items-center gap-3 font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
                              {(match as any).homeScore !== undefined ? (
                                <>
                                  <span className={match.homeTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}>{(match as any).homeScore}</span>
                                  <span className="text-text-muted text-sm">-</span>
                                  <span className={match.awayTeam === 'Dolores Dragons' ? 'text-primary' : 'text-white'}>{(match as any).awayScore}</span>
                                </>
                              ) : (
                                <span className="text-text-muted text-[10px] uppercase tracking-widest font-sans">Por jugar</span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {(match as any).result && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${(match as any).result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {(match as any).result === 'W' ? 'V' : 'D'}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                
                <div className="p-4 text-center text-text-muted text-sm border border-dashed border-white/10 rounded-xl mt-2">
                  Más partidos se añadirán a medida que avance la temporada.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
