import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Shield, Zap, Target, Award, Calendar, Grid, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockTeams } from '../data/mockData';
import { quintetsData } from '../data/quintets';
import { calculateQuintetAppearances, getPlayerAppearances } from '../utils/quintetUtils';

// Pre-calculate appearances map once
const appearancesMap = calculateQuintetAppearances();

interface Player {
  id: string;
  name: string;
  position: string;
  stats: string;
  image: string;
  role: string;
  icon: React.ElementType;
  dorsal?: number;
  categoria?: string;
  zoom?: number;
  objectPosition?: string;
  description?: string;
}

interface MatchdayQuintet {
  id: string;
  label: string;
  date: string;
  players: Player[];
}

const PlayerCard = ({ player, onClick }: { player: Player, onClick: () => void }) => {
  // Dynamic image lookup for synchronization
  const synchronizedData = useMemo(() => {
    let image = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop';
    let zoom = player.zoom || 1;
    let objectPosition = player.objectPosition || 'center 8%';

    if (player.image && player.image.startsWith('http')) {
      image = player.image;
    } else {
      // Search in mockTeams by dorsal and category
      for (const team of mockTeams) {
        if (player.categoria && team.category !== player.categoria) continue;
        const found = team.roster.find(p => p.number === player.dorsal);
        if (found) {
          image = found.image || image;
          zoom = found.zoom || zoom;
          objectPosition = found.objectPosition || objectPosition;
          break;
        }
        
        // Fallback to name search
        const nameMatch = team.roster.find(p => {
          const normalizedRoster = p.name.toLowerCase().replace(/,/g, '');
          const normalizedSearch = player.name.toLowerCase();
          return normalizedRoster.includes(normalizedSearch) || normalizedSearch.includes(normalizedRoster);
        });
        if (nameMatch) {
          image = nameMatch.image || image;
          zoom = nameMatch.zoom || zoom;
          objectPosition = nameMatch.objectPosition || objectPosition;
          break;
        }
      }
    }
    
    return { image, zoom, objectPosition };
  }, [player]);

  const appearances = useMemo(() => getPlayerAppearances(player.name, appearancesMap), [player.name]);

  return (
    <motion.div
      className="relative w-24 h-32 sm:w-36 sm:h-44 cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      {/* Front */}
      <div className="absolute inset-0 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-xl group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(212,175,55,0.8)] transition-all duration-300">
        <img
          src={synchronizedData.image}
          alt={player.name}
          className="w-full h-full object-cover transition-transform duration-500"
          style={{ 
            transform: `scale(${synchronizedData.zoom})`,
            objectPosition: synchronizedData.objectPosition
          }}
          referrerPolicy="no-referrer"
        />

        {/* Appearances Badge */}
        {appearances > 0 && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-black/80 backdrop-blur-sm border border-primary/50 text-primary px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
              <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-[8px] sm:text-[10px] font-black">{appearances}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/70 to-transparent p-2 sm:p-3 pt-8 sm:pt-12 text-center">
          <div className="flex justify-center mb-0.5 sm:mb-1">
             {React.createElement(player.icon, { className: "w-3 h-3 sm:w-4 sm:h-4 text-primary" })}
          </div>
          <h4 className="text-[9px] sm:text-xs font-bold text-white uppercase truncate px-1 leading-tight">{player.name}</h4>
          <p className="text-[7px] sm:text-[10px] text-primary uppercase font-semibold tracking-wider">{player.position}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function WeeklyQuintet() {
  const [selectedJornada, setSelectedJornada] = useState<string>(quintetsData[0].id);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const currentQuintet = quintetsData.find(q => q.id === selectedJornada) || quintetsData[0];

  const synchronizedData = useMemo(() => {
    let image = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop';
    let zoom = selectedPlayer?.zoom || 1;
    let objectPosition = selectedPlayer?.objectPosition || 'center 8%';

    if (!selectedPlayer) return { image: '', zoom: 1, objectPosition: 'center 8%' };
    if (selectedPlayer.image && selectedPlayer.image.startsWith('http')) {
      image = selectedPlayer.image;
    } else {
      for (const team of mockTeams) {
        if (selectedPlayer.categoria && team.category !== selectedPlayer.categoria) continue;
        const found = team.roster.find(p => p.number === selectedPlayer.dorsal);
        if (found) {
          image = found.image || image;
          zoom = found.zoom || zoom;
          objectPosition = found.objectPosition || objectPosition;
          break;
        }
        
        const nameMatch = team.roster.find(p => {
          const normalizedRoster = p.name.toLowerCase().replace(/,/g, '');
          const normalizedSearch = selectedPlayer.name.toLowerCase();
          return normalizedRoster.includes(normalizedSearch) || normalizedSearch.includes(normalizedRoster);
        });
        if (nameMatch) {
          image = nameMatch.image || image;
          zoom = nameMatch.zoom || zoom;
          objectPosition = nameMatch.objectPosition || objectPosition;
          break;
        }
      }
    }
    return { image, zoom, objectPosition };
  }, [selectedPlayer]);

  return (
    <section id="quinteto" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3 mb-4 md:mb-6"
          >
            <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">
              Reconocimiento Semanal
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quinteto <span className="text-primary">Ideal</span>
          </motion.h2>

          {/* Filter Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <div className="relative w-full sm:w-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <select
                  value={selectedJornada}
                  onChange={(e) => {
                    setSelectedJornada(e.target.value);
                  }}
                  className="w-full sm:w-64 pl-10 pr-10 py-3 bg-surface border border-white/10 rounded-xl text-white text-sm font-bold uppercase tracking-wider appearance-none focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  {quintetsData.map(q => (
                    <option key={q.id} value={q.id}>{q.label}</option>
                  ))}
                </select>
              </div>
              <div className="text-primary/70 text-xs md:text-sm font-medium uppercase flex items-center gap-2 text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50 hidden sm:block" /> {currentQuintet.date}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quintet Court Layout */}
        <div className="relative max-w-4xl mx-auto aspect-[0.65/1] sm:aspect-[0.9/1] md:aspect-[1.3/1] bg-surface/40 border-2 sm:border-4 border-primary/60 rounded-3xl mt-12 mb-8 overflow-hidden shadow-2xl">
          {/* Half Court SVG - Flipped (Basket at bottom) */}
          <svg className="absolute inset-0 w-full h-full opacity-80 pointer-events-none rotate-180" viewBox="0 0 1500 1400" preserveAspectRatio="xMidYMid slice">
            {/* Background */}
            <rect x="0" y="0" width="1500" height="1400" fill="transparent" />
            
            {/* Court Outer Border */}
            <rect x="4" y="4" width="1492" height="1392" fill="none" stroke="#d4af37" strokeWidth="16" />
            
            {/* Paint (Zona) */}
            <rect x="505" y="0" width="490" height="580" fill="#d4af37" fillOpacity="0.1" stroke="#d4af37" strokeWidth="8" />
            
            {/* Free throw circle */}
            <circle cx="750" cy="580" r="180" fill="none" stroke="#d4af37" strokeWidth="8" />
            <path d="M 570 580 A 180 180 0 0 1 930 580" fill="none" stroke="#d4af37" strokeWidth="8" strokeDasharray="20, 20" />
            
            {/* 3-point line */}
            <path d="M 90 0 L 90 299 A 675 675 0 0 0 1410 299 L 1410 0" fill="none" stroke="#d4af37" strokeWidth="8" />
            
            {/* Backboard & Basket */}
            <line x1="660" y1="120" x2="840" y2="120" stroke="#d4af37" strokeWidth="12" />
            <circle cx="750" cy="157.5" r="22.5" fill="none" stroke="#d4af37" strokeWidth="8" />
            
            {/* Restricted Area */}
            <path d="M 625 120 L 625 157.5 A 125 125 0 0 0 875 157.5 L 875 120" fill="none" stroke="#d4af37" strokeWidth="8" />
            
            {/* Center circle (half) */}
            <path d="M 570 1400 A 180 180 0 0 1 930 1400" fill="none" stroke="#d4af37" strokeWidth="8" />
            <path d="M 390 1400 A 360 360 0 0 1 1110 1400" fill="none" stroke="#d4af37" strokeWidth="8" />
          </svg>

          {/* Player Cards */}
          <AnimatePresence mode="popLayout">
            {currentQuintet.players.map((player, index) => {
              // 3 at the top (backcourt), 2 at the bottom (near basket)
              const positions = [
                { top: '15%', left: '50%' }, // Base (Top center)
                { top: '40%', left: '20%' }, // Escolta (Wing left)
                { top: '40%', left: '80%' }, // Alero (Wing right)
                { top: '75%', left: '30%' }, // Ala-Pívot (Low post left)
                { top: '75%', left: '70%' }, // Pívot (Low post right)
              ];
              const pos = positions[index];

              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <PlayerCard player={player} onClick={() => setSelectedPlayer(player)} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Detail Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedPlayer(null)}>
            <motion.div
              initial={{ rotateY: 90, scale: 0.8, opacity: 0, y: 50 }}
              animate={{ rotateY: 180, scale: 1, opacity: 1, y: 0 }}
              exit={{ rotateY: 90, scale: 0.8, opacity: 0, y: 50 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 25 }}
              className="relative w-[90vw] max-w-[480px] h-[75vh] max-h-[700px] cursor-pointer"
              style={{ transformStyle: "preserve-3d" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Front of card (visible during the first half of the flip) */}
              <div className="absolute inset-0 backface-hidden bg-surface border-2 border-primary/50 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={synchronizedData.image}
                  alt={selectedPlayer.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                  style={{ 
                    transform: `scale(${synchronizedData.zoom})`,
                    objectPosition: synchronizedData.objectPosition
                  }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 sm:p-8 pt-16 sm:pt-24 text-center">
                  <div className="flex justify-center mb-4">
                     {React.createElement(selectedPlayer.icon, { className: "w-12 h-12 sm:w-16 sm:h-16 text-primary drop-shadow-lg" })}
                  </div>
                  <h4 className="text-2xl sm:text-4xl font-black text-white uppercase leading-tight mb-2">{selectedPlayer.name}</h4>
                  <p className="text-base sm:text-xl text-primary uppercase font-bold tracking-wider">{selectedPlayer.position} {selectedPlayer.dorsal ? `#${selectedPlayer.dorsal}` : ''}</p>
                  <p className="text-xs sm:text-sm text-white/70 uppercase font-medium mt-2 tracking-widest">{selectedPlayer.categoria}</p>
                </div>
              </div>

              {/* Back of card (visible after flip) */}
              <div 
                className="absolute inset-0 backface-hidden bg-gradient-to-br from-surface via-surface to-black text-white rounded-3xl shadow-2xl flex flex-col p-6 sm:p-8 text-center border border-primary/30 overflow-hidden"
                style={{ transform: "rotateY(180deg)" }}
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-3xl" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary blur-3xl" />
                </div>
                
                <button 
                  onClick={() => setSelectedPlayer(null)}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-6 h-6 text-white/70" />
                </button>
                
                <div className="flex-1 flex flex-col justify-center items-center h-full py-2 sm:py-4 relative z-10 overflow-y-auto no-scrollbar">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="flex flex-col items-center w-full px-2"
                  >
                    <div className="p-3 sm:p-4 rounded-full bg-primary/10 border border-primary/20 mb-3 sm:mb-4">
                      {React.createElement(selectedPlayer.icon, { className: "w-8 h-8 sm:w-10 sm:h-10 text-primary" })}
                    </div>
                    <h4 className="text-xl sm:text-2xl md:text-3xl font-black uppercase leading-tight mb-1 sm:mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{selectedPlayer.name}</h4>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary mt-1">{selectedPlayer.position} {selectedPlayer.dorsal ? `#${selectedPlayer.dorsal}` : ''}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 mt-1 sm:mt-2">{selectedPlayer.categoria}</p>
                  </motion.div>
                  
                  <div className="w-full my-4 sm:my-6">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-3 sm:my-4" />
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/5 shadow-inner w-full max-w-sm mx-auto"
                    >
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-primary/80 mb-3 sm:mb-4">Estadísticas</p>
                      <div className="flex justify-center gap-4 sm:gap-6 mb-4">
                        {selectedPlayer.stats.split(', ').map((stat, i) => {
                          const parts = stat.split(' ');
                          const val = parts[0];
                          const label = parts.slice(1).join(' ');
                          return (
                            <div key={i} className="flex flex-col items-center">
                              <span className="text-xl sm:text-2xl md:text-3xl font-black text-white">{val}</span>
                              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary/80">{label}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-primary/20 rounded-full border border-primary/30">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary">Rol: {selectedPlayer.role}</p>
                      </div>
                    </motion.div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-3 sm:my-4" />
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-xs sm:text-sm leading-relaxed text-white/80 px-4 font-serif italic max-w-md text-center"
                  >
                    <span className="text-primary text-xl sm:text-2xl leading-none mr-1">"</span>
                    {selectedPlayer.description}
                    <span className="text-primary text-xl sm:text-2xl leading-none ml-1">"</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-white/10 rounded-3xl p-4 md:p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative"
            >
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <h3 className="text-xl md:text-4xl font-bold text-white mb-6 md:mb-8 uppercase tracking-wider pr-10" style={{ fontFamily: 'var(--font-display)' }}>
                Historial de <span className="text-primary">Quintetos</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {quintetsData.map((quintet) => (
                  <div key={quintet.id} className="bg-background/50 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-xl font-bold text-white">{quintet.label}</h4>
                        <p className="text-xs text-primary/70 uppercase">{quintet.date}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedJornada(quintet.id);
                          setIsHistoryOpen(false);
                        }}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-[#000000] transition-colors"
                      >
                        VER DETALLE
                      </button>
                    </div>
                    <div className="flex -space-x-3 overflow-hidden">
                      {quintet.players.map((player) => (
                        <div key={player.id} className="inline-block h-12 w-12 rounded-full ring-2 ring-surface overflow-hidden bg-surface">
                          <img src={player.image} alt={player.name} className="h-full w-full object-cover grayscale" referrerPolicy="no-referrer" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {quintet.players.map((player) => (
                        <span key={player.id} className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {player.name.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
