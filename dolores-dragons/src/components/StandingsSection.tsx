import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy } from 'lucide-react';

export default function StandingsSection() {
  const categories = ['Cadete Femenino', 'Alevín Mixto'] as const;
  const [activeCategory, setActiveCategory] = useState<'Cadete Femenino' | 'Alevín Mixto'>('Cadete Femenino');
  const [activePhase, setActivePhase] = useState<'1ª Fase' | '2ª Fase'>('2ª Fase');
  const [activeSeason, setActiveSeason] = useState('25/26');
  const seasons = ['25/26', '24/25'];

  const standingsData = {
    '25/26': {
      'Cadete Femenino': {
        '1ª Fase': [
          { posicion: 1, equipo: 'BJC', J: 11, G: 11, P: 0, PF: 460, PC: 165, puntos: 22 },
          { posicion: 2, equipo: 'KENSINGTON SCHOOL 1', J: 11, G: 10, P: 1, PF: 413, PC: 139, puntos: 21 },
          { posicion: 3, equipo: 'CB FEMENINO ALCORCÓN', J: 11, G: 8, P: 3, PF: 330, PC: 207, puntos: 19 },
          { posicion: 4, equipo: 'KENSINGTON SCHOOL', J: 11, G: 6, P: 5, PF: 357, PC: 252, puntos: 17 },
          { posicion: 5, equipo: 'LA DEHESA', J: 11, G: 6, P: 5, PF: 320, PC: 329, puntos: 17 },
          { posicion: 6, equipo: 'LOS ANGELES', J: 11, G: 6, P: 5, PF: 323, PC: 300, puntos: 17 },
          { posicion: 7, equipo: 'DOLORES DRAGONS', J: 11, G: 5, P: 6, PF: 333, PC: 299, puntos: 16 },
          { posicion: 8, equipo: 'AMIDECU CAD FEM', J: 11, G: 5, P: 6, PF: 269, PC: 273, puntos: 16 },
          { posicion: 9, equipo: 'VILLA DE LEGANES', J: 11, G: 5, P: 6, PF: 269, PC: 318, puntos: 16 },
          { posicion: 10, equipo: 'REVOLUTION', J: 11, G: 2, P: 9, PF: 212, PC: 415, puntos: 13 },
          { posicion: 11, equipo: 'Fundación Balia', J: 11, G: 2, P: 9, PF: 166, PC: 328, puntos: 13 },
          { posicion: 12, equipo: 'J CIERVA AMIDECU CAD FEM', J: 11, G: 0, P: 11, PF: 148, PC: 575, puntos: 11 }
        ],
        '2ª Fase': [
          { posicion: 1, equipo: 'DOLORES DRAGONS', J: 2, G: 2, P: 0, PF: 73, PC: 34, puntos: 4 },
          { posicion: 2, equipo: 'REVOLUTION', J: 2, G: 1, P: 1, PF: 56, PC: 47, puntos: 3 },
          { posicion: 3, equipo: 'Fundación Balia', J: 2, G: 1, P: 1, PF: 38, PC: 39, puntos: 3 },
          { posicion: 4, equipo: 'J CIERVA AMIDECU CAD FEM', J: 2, G: 0, P: 2, PF: 13, PC: 60, puntos: 2 }
        ]
      },
      'Alevín Mixto': {
        '1ª Fase': [
          { posicion: 1, equipo: 'REVOLUTION', J: 13, G: 13, P: 0, PF: 0, PC: 0, puntos: 26 },
          { posicion: 2, equipo: 'CEIP PORTUGAL VERDE', J: 13, G: 12, P: 1, PF: 0, PC: 0, puntos: 24 },
          { posicion: 3, equipo: 'CD LOURDES VERDE MBC ALE MIX', J: 13, G: 10, P: 3, PF: 0, PC: 0, puntos: 20 },
          { posicion: 4, equipo: 'HA BASKET SESI', J: 13, G: 10, P: 3, PF: 0, PC: 0, puntos: 20 },
          { posicion: 5, equipo: 'CDE Escolapios Aluche B', J: 13, G: 8, P: 5, PF: 0, PC: 0, puntos: 16 },
          { posicion: 6, equipo: 'CEIP HERNAN CORTES NEGRO', J: 13, G: 7, P: 6, PF: 0, PC: 0, puntos: 14 },
          { posicion: 7, equipo: 'HA BASKET', J: 13, G: 7, P: 6, PF: 0, PC: 0, puntos: 14 },
          { posicion: 8, equipo: 'BARTOLOME COSSIO "B"', J: 13, G: 6, P: 7, PF: 0, PC: 0, puntos: 12 },
          { posicion: 9, equipo: 'BOADILLA MONSTERS', J: 12, G: 5, P: 7, PF: 0, PC: 0, puntos: 10 },
          { posicion: 10, equipo: 'DOLORES DRAGONS', J: 13, G: 5, P: 8, PF: 0, PC: 0, puntos: 10 },
          { posicion: 11, equipo: 'Revolution B', J: 13, G: 4, P: 9, PF: 0, PC: 0, puntos: 8 },
          { posicion: 12, equipo: 'Revolution Gamo Diana', J: 13, G: 2, P: 11, PF: 0, PC: 0, puntos: 4 },
          { posicion: 13, equipo: 'CBC BASKET', J: 13, G: 1, P: 12, PF: 0, PC: 0, puntos: 2 },
          { posicion: 14, equipo: 'Revolution Arenales', J: 12, G: 0, P: 12, PF: 0, PC: 0, puntos: 0 }
        ]
      }
    },
    '24/25': {
      'Cadete Femenino': {
        '1ª Fase': [
          { posicion: 1, equipo: 'DOLORES DRAGONS', J: 10, G: 9, P: 1, PF: 400, PC: 200, puntos: 19 },
        ]
      },
      'Alevín Mixto': {
        '1ª Fase': [
          { posicion: 1, equipo: 'DOLORES DRAGONS', J: 10, G: 8, P: 2, PF: 350, PC: 250, puntos: 18 },
        ]
      }
    }
  };

  const currentStandings = (standingsData as any)[activeSeason][activeCategory][activePhase] || [];
  const availablePhases = Object.keys((standingsData as any)[activeSeason][activeCategory]);
  const currentPhase = activePhase;

  return (
    <section id="clasificacion" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 text-white uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span className="text-primary">Clasificación</span> JDM
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-text-muted max-w-2xl mx-auto mb-8"
          >
            Consulta la posición de nuestros equipos en la tabla clasificatoria de la 25/26.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Season Selector */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-block w-full max-w-xs">
              <select
                value={activeSeason}
                onChange={(e) => {
                  setActiveSeason(e.target.value);
                  setActivePhase('1ª Fase');
                }}
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
          </div>

          {/* Category Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  if (category === 'Alevín Mixto') setActivePhase('1ª Fase');
                }}
                className="relative px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider transition-all"
              >
                {activeCategory === category && (
                  <motion.div
                    layoutId="activeCategoryStandings"
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className={`relative z-10 transition-colors duration-300 ${
                  activeCategory === category ? 'text-black' : 'text-white hover:text-primary'
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
              key={`${activeSeason}-${activeCategory}-${activePhase}`}
              initial={{ opacity: 0, y: 20, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.99 }}
              transition={{ 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <div className="mb-6 text-center">
                {availablePhases.length > 1 && (
                  <div className="flex justify-center gap-2 mb-4">
                    {availablePhases.map((phase) => (
                      <button
                        key={phase}
                        onClick={() => setActivePhase(phase as any)}
                        className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
                          currentPhase === phase 
                            ? 'bg-white/20 text-white border border-white/30' 
                            : 'bg-transparent border border-white/10 text-text-muted hover:text-white hover:border-white/30'
                        }`}
                      >
                        {phase}
                      </button>
                    ))}
                  </div>
                )}
                {activeCategory === 'Cadete Femenino' && activePhase === '2ª Fase' && (
                  <p className="text-[10px] md:text-xs text-primary font-bold uppercase tracking-widest">
                    Latina Segunda Fase - Grupo 3
                  </p>
                )}
              </div>

              <div className="bg-background border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-text-muted text-[10px] md:text-xs uppercase tracking-wider font-bold">
                        <th className="p-2 md:p-4 text-center w-10 md:w-16">Pos</th>
                        <th className="p-2 md:p-4">Equipo</th>
                        <th className="p-2 md:p-4 text-center">J</th>
                        <th className="p-2 md:p-4 text-center">G</th>
                        <th className="p-2 md:p-4 text-center">P</th>
                        <th className="p-2 md:p-4 text-center hidden sm:table-cell">PF</th>
                        <th className="p-2 md:p-4 text-center hidden sm:table-cell">PC</th>
                        <th className="p-2 md:p-4 text-center text-primary">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm">
                      {currentStandings.map((team: any) => {
                        const isDragons = team.equipo.toUpperCase() === 'DOLORES DRAGONS';
                        return (
                          <tr 
                            key={team.equipo} 
                            className={`
                              transition-colors
                              ${isDragons ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-white/5 border-l-4 border-transparent'}
                            `}
                          >
                            <td className="p-2 md:p-4 text-center font-bold text-text-muted">
                              {team.posicion}
                            </td>
                            <td className={`p-2 md:p-4 font-bold ${isDragons ? 'text-primary' : 'text-white'}`}>
                              <div className="flex items-center gap-1 md:gap-2">
                                {isDragons && <Trophy className="w-3 h-3 md:w-4 md:h-4 text-primary shrink-0" />}
                                <span className="truncate max-w-[120px] sm:max-w-none">{team.equipo}</span>
                              </div>
                            </td>
                            <td className="p-2 md:p-4 text-center text-text-muted">{team.J}</td>
                            <td className="p-2 md:p-4 text-center text-green-500 font-semibold">{team.G}</td>
                            <td className="p-2 md:p-4 text-center text-red-500 font-semibold">{team.P}</td>
                            <td className="p-2 md:p-4 text-center text-text-muted hidden sm:table-cell">{team.PF}</td>
                            <td className="p-2 md:p-4 text-center text-text-muted hidden sm:table-cell">{team.PC}</td>
                            <td className="p-2 md:p-4 text-center font-bold text-primary text-sm md:text-lg">{team.puntos}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-background text-[10px] md:text-xs text-text-muted flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1">
                  <span>J: Jugados</span>
                  <span>G: Ganados</span>
                  <span>P: Perdidos</span>
                  <span className="hidden sm:inline">PF: Puntos a Favor</span>
                  <span className="hidden sm:inline">PC: Puntos en Contra</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
