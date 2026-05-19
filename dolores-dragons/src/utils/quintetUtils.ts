import { quintetsData } from '../data/quintets';
import { normalizeName, isSamePlayer } from './nameNormalization';

/**
 * Calculates how many times each player appears in the ideal quintets.
 * Returns a map of normalized player names to appearance counts.
 */
export const calculateQuintetAppearances = () => {
  const appearances: Record<string, number> = {};

  quintetsData.forEach(matchday => {
    matchday.players.forEach(player => {
      const normalizedName = normalizeName(player.name);
      appearances[normalizedName] = (appearances[normalizedName] || 0) + 1;
    });
  });

  return appearances;
};

/**
 * Gets the number of appearances for a specific player name.
 */
export const getPlayerAppearances = (name: string, appearancesMap: Record<string, number>) => {
  const normalizedName = normalizeName(name);
  return appearancesMap[normalizedName] || 0;
};
