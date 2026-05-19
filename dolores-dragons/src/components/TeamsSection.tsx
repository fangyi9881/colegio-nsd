import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, X, Cake, RotateCcw, Award } from 'lucide-react';
import { mockTeams } from '../data/mockData';
import { Team, Player } from '../types';
import { useBackToClose } from '../hooks/useBackToClose';
import { calculatePlayerAverages } from '../utils/statsCalculator';
import { normalizeName, isSamePlayer } from '../utils/nameNormalization';
import { calculateQuintetAppearances, getPlayerAppearances } from '../utils/quintetUtils';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Pre-calculate appearances map once
const appearancesMap = calculateQuintetAppearances();

function PlayerCard({ player, teamName, today }: { player: Player, teamName: string, today: string }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [apellidos, nombre] = player.name.includes(',') 
    ? player.name.split(',').map(s => s.trim())
    : [player.name, ''];
  const isBirthday = player.birthday === today;
  const stats = useMemo(() => calculatePlayerAverages(player.name, teamName), [player.name, teamName]);
  const idealQuintetAppearances = useMemo(() => getPlayerAppearances(player.name, appearancesMap), [player.name]);

  return (
    <div 
      className={`bg-background rounded-xl overflow-hidden border transition-all duration-500 group cursor-pointer perspective-1000 aspect-[3/4] w-full ${
        isBirthday 
          ? 'border-primary shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02] z-10' 
          : 'border-white/5'
      }`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front of Card */}
        <div className="backface-hidden w-full h-full">
          <div className="aspect-[3/4] relative overflow-hidden bg-surface">
            <img 
              src={player.image || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=400&auto=format&fit=crop'} 
              alt={normalizeName(player.name)}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isBirthday ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'
              }`}
              style={{ 
                transform: `scale(${player.zoom || 1})`,
                objectPosition: player.objectPosition || 'center 8%'
              }}
              referrerPolicy="no-referrer"
            />
            
            {isBirthday && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 left-2 md:top-3 md:left-3 z-20"
              >
                <div className="bg-primary text-black px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Cake className="w-3 h-3 md:w-4 md:h-4 animate-bounce" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter">¡CUMPLE!</span>
                </div>
              </motion.div>
            )}

            {/* Team Logo in the other corner */}
            <div className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 md:w-10 md:h-10 z-20">
              <img 
                src="/images/dragon-logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain drop-shadow-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Birthday in top-left */}
            {player.birthday && (
              <div className={`absolute top-2 left-2 md:top-3 md:left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold shadow-lg ${isBirthday ? 'bg-primary text-black' : 'bg-black/50 text-white backdrop-blur-sm'}`}>
                <Cake className="w-3 h-3" />
                <span>{player.birthday}</span>
              </div>
            )}

            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background to-transparent p-3 md:p-4 pt-12">
              <div className="flex justify-between items-end mb-2">
                <p className="text-primary text-[10px] md:text-xs font-bold uppercase tracking-wider">{player.position || 'Jugador'}</p>
                <div className="relative">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary text-[#000000] flex items-center justify-center rounded-full font-bold text-sm md:text-lg shadow-lg z-20" style={{ fontFamily: 'var(--font-display)' }}>
                    {player.number || '-'}
                  </div>
                </div>
              </div>
              <h4 className="text-sm md:text-lg font-bold text-white leading-tight">
                <span className="block uppercase whitespace-nowrap">{apellidos}</span>
                <span className="block text-primary">{nombre}</span>
              </h4>
            </div>
          </div>
          <div className="p-2 md:p-4 flex justify-between items-center text-[10px] md:text-sm text-text-muted border-t border-white/5">
            <div className="flex gap-3">
              <span>{player.height ? `${player.height} cm` : '-'}</span>
              <span>{player.weight || '-'}</span>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface border border-white/10 rounded-xl p-3 md:p-4 flex flex-col items-center justify-center text-center overflow-hidden">
          <div className="absolute top-3 right-3 text-text-muted opacity-50">
            <RotateCcw className="w-3 h-3 md:w-4 md:h-4" />
          </div>
          <h4 className="text-sm md:text-lg font-bold text-white mb-3 md:mb-6 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>{normalizeName(player.name)}</h4>
          
          <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
            <div className="bg-background rounded-lg p-2 md:p-3 border border-white/5">
              <p className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Minutos</p>
              <p className="text-base md:text-xl font-bold text-primary">{stats.minutosPromedio}</p>
            </div>
            <div className="bg-background rounded-lg p-2 md:p-3 border border-white/5">
              <p className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-wider mb-0.5">% Libres</p>
              <p className="text-base md:text-xl font-bold text-primary">{stats.porcentajeTirosLibres}%</p>
            </div>
            <div className="bg-background rounded-lg p-2 md:p-3 border border-white/5">
              <p className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Valoración</p>
              <p className="text-base md:text-xl font-bold text-primary">{stats.valoracionPromedio}</p>
            </div>
            <div className="bg-background rounded-lg p-2 md:p-3 border border-white/5">
              <p className="text-[8px] md:text-[10px] text-text-muted uppercase tracking-wider mb-0.5">+/-</p>
              <p className="text-base md:text-xl font-bold text-primary">{stats.masMenosPromedio > 0 ? `+${stats.masMenosPromedio}` : stats.masMenosPromedio}</p>
            </div>
          </div>
          
          <div className="mt-3 md:mt-6 text-[10px] md:text-xs text-text-muted flex flex-col gap-1">
            <div>
              Partidos jugados: <span className="text-white font-bold">{stats.partidosJugados}</span>
            </div>
            {idealQuintetAppearances > 0 && (
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <Award className="w-3 h-3" />
                <span className="font-bold">{idealQuintetAppearances}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TeamsSection() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [teams, setTeams] = useState<Team[]>(mockTeams);

  // Extract unique seasons and sort them descending
  const seasons = useMemo(() => {
    const uniqueSeasons = Array.from(new Set(teams.map(t => t.season || '25/26')));
    return uniqueSeasons.sort((a, b) => b.localeCompare(a));
  }, [teams]);

  const [activeSeason, setActiveSeason] = useState(seasons[0] || '25/26');

  const filteredTeams = useMemo(() => {
    return teams.filter(team => (team.season || '25/26') === activeSeason);
  }, [activeSeason, teams]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch verified players from Firestore
  useEffect(() => {
    const fetchVerifiedPlayers = async () => {
      try {
        const q = query(collection(db, 'public_profiles'), where('isVerifiedPlayer', '==', true));
        const querySnapshot = await getDocs(q);
        
        const verifiedPlayers: any[] = [];
        querySnapshot.forEach((doc) => {
          verifiedPlayers.push({ id: doc.id, ...doc.data() });
        });

        // Merge verified players into mockTeams
        const updatedTeams = mockTeams.map(team => {
          const teamPlayers = verifiedPlayers.filter(p => p.category === team.category);
          
          // Convert Firestore user to Player type
          const newRoster = teamPlayers.map(p => {
            const name = p.fullName || p.displayName || 'Jugador';
            const existingPlayer = team.roster.find(existing => isSamePlayer(name, existing.name));
            
            let formattedBirthday = existingPlayer?.birthday;
            if (p.birthDate) {
              const [year, month, day] = p.birthDate.split('-');
              formattedBirthday = `${day}/${month}`;
            }

            const isCustomUpload = p.photoURL?.startsWith('data:image');
            const finalImage = isCustomUpload 
              ? p.photoURL 
              : (existingPlayer?.image || p.photoURL || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500&auto=format&fit=crop');

            return {
              id: p.uid,
              name: name,
              number: p.jerseyNumber || existingPlayer?.number || p.number || 0,
              position: p.position || existingPlayer?.position || 'N/A',
              height: p.height || existingPlayer?.height,
              weight: p.weight ? `${p.weight} kg` : existingPlayer?.weight,
              birthday: formattedBirthday,
              image: finalImage,
              zoom: existingPlayer?.zoom,
              objectPosition: existingPlayer?.objectPosition
            };
          });

          // Merge without duplicates (by ID or name)
          const existingRoster = team.roster.filter(
            existing => !newRoster.some(newP => isSamePlayer(newP.name, existing.name))
          );

          return {
            ...team,
            roster: [...existingRoster, ...newRoster]
          };
        });

        setTeams(updatedTeams);
      } catch (error) {
        console.error("Error fetching verified players:", error);
      }
    };

    fetchVerifiedPlayers();
  }, []);

  // Reset scroll position when season changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setCurrentIndex(0);
  }, [activeSeason]);

  const scrollToTeam = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const items = container.children;
      if (items[index]) {
        const item = items[index] as HTMLElement;
        const containerWidth = container.offsetWidth;
        const itemWidth = item.offsetWidth;
        const scrollLeft = item.offsetLeft - (containerWidth - itemWidth) / 2;
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
        setCurrentIndex(index);
      }
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const items = Array.from(container.children) as HTMLElement[];
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      items.forEach((item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const containerCenter = scrollLeft + containerWidth / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    }
  };

  const today = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background relative" id="equipos">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 bg-primary/50" />
            <span className="text-primary/60 font-bold uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.34em' }}>
              Club Selecto · Madrid
            </span>
            <div className="h-px w-10 bg-primary/50" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Nuestros <span className="text-gold-shimmer">Equipos</span>
          </h2>
          <p className="text-sm md:text-lg text-text-muted max-w-2xl mx-auto mb-8">
            Conoce a los jugadores que defienden nuestros colores en la {activeSeason}.
          </p>

          {/* Season Selector */}
          {seasons.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-center mb-12"
            >
              <div className="relative inline-block w-full max-w-xs">
                <select
                  value={activeSeason}
                  onChange={(e) => setActiveSeason(e.target.value)}
                  className="w-full appearance-none px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all bg-surface border border-white/20 text-white hover:border-primary focus:outline-none focus:border-primary shadow-[0_0_15px_rgba(0,0,0,0.2)] cursor-pointer"
                >
                  {seasons.map((season) => (
                    <option key={season} value={season} className="bg-surface text-white">
                      Temporada {season}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Team Cards Carousel/Grid */}
        <div className="relative max-w-7xl mx-auto group">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex md:flex-wrap md:justify-center gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory hide-scrollbar pb-8 md:pb-0 px-4 md:px-0"
          >
            {filteredTeams.map((team, index) => (
              <div
                key={team.id}
                className="w-[85vw] sm:w-[calc(50%-12px)] md:w-[calc(50%-24px)] lg:w-[calc(50%-24px)] shrink-0 snap-center"
              >
                <div
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-background border border-white/10 hover:border-primary/50 transition-colors h-full flex flex-col shadow-xl"
                  onClick={() => setSelectedTeam(team)}
                >
                  <div className="h-80 md:h-72 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent z-10" />
                    <img 
                      src={team.teamPhoto} 
                      alt={`Foto del equipo ${team.name}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-4 left-4 z-20">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="px-2 py-0.5 bg-primary text-[#000000] text-[10px] font-black uppercase tracking-wider rounded-md inline-block shadow-lg">
                          {team.category.split(' ')[0]}
                        </span>
                        {team.category.split(' ').length > 1 && (
                          <span 
                            className="text-white text-2xl font-bold uppercase leading-tight ml-0.5"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {team.category.split(' ').slice(1).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="p-5 md:p-4 flex items-center justify-between mt-auto bg-surface/30">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">{team.roster.length} Jugadores</span>
                    </div>
                    <div className="flex items-center text-primary font-bold text-xs group-hover:translate-x-1 transition-transform">
                      Ver Plantilla
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators - Mobile Only */}
          <div className="flex md:hidden justify-center gap-2 mt-4">
            {filteredTeams.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToTeam(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-primary' : 'bg-white/20'
                }`}
                aria-label={`Ir al equipo ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Roster Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTeam(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Modal Header */}
              <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-background sticky top-0 z-10">
                <div className="pr-8">
                  <div className="flex flex-col items-start gap-1">
                    <span className="px-2.5 py-0.5 bg-primary text-[#000000] text-[10px] md:text-[11px] font-black uppercase tracking-wider rounded-md inline-block">
                      {selectedTeam.category.split(' ')[0]}
                    </span>
                    {selectedTeam.category.split(' ').length > 1 && (
                      <span 
                        className="text-white text-lg md:text-3xl font-bold uppercase leading-tight ml-0.5"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {selectedTeam.category.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-[10px] md:text-sm mt-0.5">Entrenador: {selectedTeam.coach}</p>
                </div>
                <button 
                  onClick={() => setSelectedTeam(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white bg-white/5 md:bg-transparent"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {/* Roster Grid */}
              <div className="p-3 md:p-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {selectedTeam.roster.map((player: Player) => (
                    <PlayerCard key={player.id} player={player} teamName={selectedTeam.name} today={today} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
