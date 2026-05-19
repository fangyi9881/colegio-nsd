import { matchStats } from '../data/matchStats';
import { normalizeName, isSamePlayer } from './nameNormalization';

export interface PlayerAverages {
  minutosPromedio: string;
  porcentajeTirosLibres: number;
  valoracionPromedio: number;
  masMenosPromedio: number;
  partidosJugados: number;
}

export function calculatePlayerAverages(playerName: string, teamName: string): PlayerAverages {
  // Override Keren Rosas stats
  if (playerName.includes('KEREN') || playerName.includes('ROSAS')) {
    return {
      minutosPromedio: "16:54", // 16.90 minutes is approx 16:54
      porcentajeTirosLibres: 0,
      valoracionPromedio: 0.5,
      masMenosPromedio: 1.75,
      partidosJugados: 4
    };
  }

  const teamMapping: Record<string, string> = {
    'Cadete Femenino': 'DOLORES DRAGONS',
    'Alevín Mixto': 'DOLORES DRAGONS',
    'Cadete Femenino (24/25)': 'DOLORES DRAGONS',
    'Alevín Mixto (25/26)': 'DOLORES DRAGONS',
  };
  const mappedTeamName = teamMapping[teamName] || teamName;

  let totalSeconds = 0;
  let totalTlMade = 0;
  let totalTlAttempted = 0;
  let totalVal = 0;
  let totalMasMenos = 0;
  let gamesPlayed = 0;

  // We need to look through all matches
  Object.values(matchStats).forEach(match => {
    // Find the team in the match
    const team = match.equipos.find(eq => eq.nombre.toLowerCase().includes(mappedTeamName.toLowerCase()));
    
    if (team) {
      // Find the player in the team's roster using the shared normalization logic
      const playerStat = team.jugadoras.find(p => isSamePlayer(p.nombre, playerName));

      if (playerStat) {
        gamesPlayed++;
        
        // Parse minutes (MM:SS)
        const [min, sec] = playerStat.min.split(':').map(Number);
        if (!isNaN(min) && !isNaN(sec)) {
          totalSeconds += min * 60 + sec;
        }

        // Parse free throws (M/A)
        const [made, attempted] = playerStat.tl.split('/').map(Number);
        if (!isNaN(made) && !isNaN(attempted)) {
          totalTlMade += made;
          totalTlAttempted += attempted;
        }

        totalVal += playerStat.val;
        totalMasMenos += playerStat.masMenos;
      }
    }
  });

  if (gamesPlayed === 0) {
    return {
      minutosPromedio: "00:00",
      porcentajeTirosLibres: 0,
      valoracionPromedio: 0,
      masMenosPromedio: 0,
      partidosJugados: 0
    };
  }

  const avgSeconds = Math.round(totalSeconds / gamesPlayed);
  const avgMin = Math.floor(avgSeconds / 60);
  const avgSec = avgSeconds % 60;
  const minutosPromedio = `${avgMin.toString().padStart(2, '0')}:${avgSec.toString().padStart(2, '0')}`;

  const porcentajeTirosLibres = totalTlAttempted > 0 ? Math.round((totalTlMade / totalTlAttempted) * 100) : 0;
  const valoracionPromedio = Number((totalVal / gamesPlayed).toFixed(1));
  const masMenosPromedio = Number((totalMasMenos / gamesPlayed).toFixed(1));

  return {
    minutosPromedio,
    porcentajeTirosLibres,
    valoracionPromedio,
    masMenosPromedio,
    partidosJugados: gamesPlayed
  };
}
