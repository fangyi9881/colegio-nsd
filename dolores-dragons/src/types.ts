/**
 * Interfaces base para la estructura de datos del Club de Baloncesto
 */

export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';
  height?: string; // ej. "1.95m"
  weight?: string; // ej. "90kg"
  birthday?: string; // Format "DD/MM"
  idealQuintetAppearances?: number;
  image?: string;
  zoom?: number; // Optional zoom factor for the player's photo
  objectPosition?: string; // Optional CSS object-position (e.g., 'center 5%')
}

export interface Team {
  id: string;
  name: string;
  category: 'Cadete Femenino' | 'Alevín Mixto';
  coach: string;
  roster: Player[];
  teamPhoto?: string;
  season?: string;
}

export interface PlayerStats {
  dorsal: string;
  nombre: string;
  min: string;
  pts: number;
  tc2p: string;
  tc2pPct: number;
  tc3p: string;
  tc3pPct: number;
  tl: string;
  tlPct: number;
  rebDef: number;
  rebOf: number;
  rebTot: number;
  ast: number;
  rec: number;
  per: number;
  tapTc: number;
  tapTr: number;
  falFc: number;
  falFr: number;
  val: number;
  masMenos?: number;
}

export interface TeamStats {
  nombre: string;
  entrenador: string;
  jugadoras: PlayerStats[];
  totales: Omit<PlayerStats, 'dorsal' | 'nombre'>;
}

export interface MatchStats {
  competicion: string;
  titulo?: string;
  federacion: string;
  partido: string;
  location: string;
  teamStats: Array<{
    label: string;
    home: string | number;
    away: string | number;
  }>;
  scoreEvolution: Array<{
    minute: number;
    home: number;
    away: number;
  }>;
  equipos: TeamStats[];
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string; // ISO 8601 string
  location: string;
  homeScore?: number;
  awayScore?: number;
  status: 'Scheduled' | 'In Progress' | 'Finished';
  competition: string;
  stats?: MatchStats;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  category: string;
  image: string;
  tags: string[];
  downloadUrl?: string;
  match?: any;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url?: string;
}
