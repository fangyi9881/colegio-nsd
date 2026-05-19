import React, { useState } from 'react';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { renderLocation } from '../utils/matchUtils';
import MatchDetailsModal from './MatchDetailsModal';

interface MatchCardProps {
  match: any; // Full match object from matchesData
}

export default function MatchCard({ match }: MatchCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  const location = match.location;
  const date = match.date;
  const jornada = match.jornada || '';
  const phase = match.phase || '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-white/10 rounded-2xl p-4 md:p-8 relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6">
          <span className="px-3 py-1 bg-white/5 text-text-muted border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest">
            Resultado {phase && `(${phase})`}
          </span>
          {jornada && (
            <span className="text-text-muted text-xs font-medium flex items-center gap-2">
              <Trophy className="w-3 h-3 text-primary" />
              J. {jornada}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-4 mb-6">
          <div className="text-center flex-1 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
              {homeTeam === 'Dolores Dragons' ? (
                <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                  {homeTeam?.substring(0,3).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-white leading-tight">{homeTeam}</p>
          </div>

          <div className="text-center px-2 md:px-4 shrink-0">
            <div className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              {homeScore !== undefined ? `${homeScore} - ${awayScore}` : 'VS'}
            </div>
            {result && (
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 ${result === 'W' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {result === 'W' ? 'VICTORIA' : 'DERROTA'}
              </div>
            )}
          </div>

          <div className="text-center flex-1 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2">
              {awayTeam === 'Dolores Dragons' ? (
                <img src="/images/dragon-logo.png" alt="DD Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-background border border-white/10 rounded-full flex items-center justify-center text-sm font-bold text-text-muted">
                  {awayTeam?.substring(0,3).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-xs font-bold text-white leading-tight">{awayTeam}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] text-text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary" />
            {renderLocation(location)}
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <MatchDetailsModal 
          match={match} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
