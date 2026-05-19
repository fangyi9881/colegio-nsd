import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const STAT_DEFINITIONS: Record<string, string> = {
  'Tiros de Campo': 'Porcentaje de acierto en lanzamientos de dos y tres puntos.',
  'Tiros Libres': 'Porcentaje de acierto en lanzamientos desde la línea de personal.',
  'Rebotes': 'Total de balones atrapados tras un tiro fallido (ofensivos + defensivos).',
  'Asistencias': 'Pases que terminan directamente en una canasta de un compañero.',
  'Pérdidas': 'Veces que se pierde la posesión del balón antes de tirar.',
  'Tiros de 2P': 'Lanzamientos de dos puntos convertidos e intentados.',
  'Tiros de 3P': 'Lanzamientos de tres puntos convertidos e intentados.',
  'Faltas': 'Infracciones personales cometidas durante el juego.',
  'Valoración': 'Cálculo estadístico de la contribución total de un jugador o equipo.',
  'Triples': 'Lanzamientos de tres puntos convertidos.',
  'Robos': 'Balones recuperados al equipo contrario.',
  'Tapones': 'Lanzamientos del oponente desviados o bloqueados.',
};

export const StatLabelWithTooltip = ({ label }: { label: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const definition = STAT_DEFINITIONS[label];

  if (!definition) return <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>;

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="text-[10px] text-text-muted uppercase tracking-wider cursor-help border-b border-dotted border-text-muted/50 hover:text-primary hover:border-primary/50 transition-colors">
        {label}
      </span>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#151619] border border-white/10 rounded-lg shadow-2xl z-[60] pointer-events-none"
          >
            <p className="text-[10px] text-white leading-tight text-center font-normal normal-case tracking-normal">
              {definition}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#151619]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const generateMockStats = (match: any) => {
  if (!match) return null;
  
  const seed = match.id || 1;
  const random = (min: number, max: number, offset: number = 0) => 
    Math.floor(Math.abs(Math.sin(seed + offset) * 10000) % (max - min + 1)) + min;
  
  return {
    teamStats: [
      { label: 'Tiros de Campo', home: `${random(30, 50, 1)}%`, away: `${random(30, 50, 2)}%` },
      { label: 'Tiros Libres', home: `${random(60, 85, 3)}%`, away: `${random(60, 85, 4)}%` },
      { label: 'Rebotes', home: random(25, 45, 5), away: random(25, 45, 6) },
      { label: 'Asistencias', home: random(10, 25, 7), away: random(10, 25, 8) },
      { label: 'Pérdidas', home: random(8, 20, 9), away: random(8, 20, 10) },
    ],
    topPlayers: [
      { name: match.homeTeam === 'Dolores Dragons' ? 'RODRIGUEZ MUR, LUNA MARIA' : 'GARCÍA LÓPEZ, MARÍA', pts: random(12, 25, 11), reb: random(2, 8, 12), ast: random(2, 8, 13), team: 'home' },
      { name: match.homeTeam === 'Dolores Dragons' ? 'ALVAREZ GONZALEZ, SARA' : 'MARTÍNEZ SÁNCHEZ, LUCÍA', pts: random(10, 20, 14), reb: random(2, 8, 15), ast: random(2, 8, 16), team: 'home' },
      { name: match.awayTeam === 'Dolores Dragons' ? 'RODRIGUEZ MUR, LUNA MARIA' : 'GARCÍA LÓPEZ, MARÍA', pts: random(12, 25, 17), reb: random(2, 8, 18), ast: random(2, 8, 19), team: 'away' },
      { name: match.awayTeam === 'Dolores Dragons' ? 'ALVAREZ GONZALEZ, SARA' : 'MARTÍNEZ SÁNCHEZ, LUCÍA', pts: random(10, 20, 20), reb: random(2, 8, 21), ast: random(2, 8, 22), team: 'away' },
    ]
  };
};

export const renderLocation = (location: string) => {
  const locLower = location.toLowerCase();
  
  const locations = [
    { name: 'las cruces', url: 'https://maps.app.goo.gl/13Mv5dh77AVASTf56' },
    { name: 'gallur', url: 'https://maps.app.goo.gl/3CW6F2JnWJrhAg9W9' },
    { name: 'francisco fernandez ochoa', url: 'https://maps.app.goo.gl/ZhrgXCUyXEm5AyHS9' },
    { name: 'blanca fernandez ochoa', url: 'https://maps.app.goo.gl/5XTqKMw5gV5ddaJE7' },
    { name: 'olivillo', url: 'https://maps.app.goo.gl/SLzMNacSg22ddLf1A' },
    { name: 'aluche', url: 'https://maps.app.goo.gl/C9Z24N95GMBAfqm77' },
  ];

  const found = locations.find(loc => locLower.includes(loc.name));
  
  if (found) {
    return (
      <a 
        href={found.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="hover:text-primary transition-colors hover:underline"
      >
        {location}
      </a>
    );
  }

  return <span>{location}</span>;
};
