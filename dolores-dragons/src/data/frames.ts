export interface ProfileFrame {
  id: string;
  name: string;
  price: number;
  color: string;
  borderColor: string;
  glowColor: string;
  description: string;
}

export const PROFILE_FRAMES: ProfileFrame[] = [
  {
    id: 'default',
    name: 'Básico',
    price: 0,
    color: 'border-white/20',
    borderColor: 'border-white/20',
    glowColor: 'shadow-none',
    description: 'El marco estándar para todos los dragones.'
  },
  {
    id: 'bronze',
    name: 'Bronce Dracónico',
    price: 50,
    color: 'border-[#CD7F32]',
    borderColor: 'border-[#CD7F32]',
    glowColor: 'shadow-[0_0_10px_rgba(205,127,50,0.5)]',
    description: 'Un marco resistente forjado en las cuevas de Dolores.'
  },
  {
    id: 'silver',
    name: 'Plata de Escama',
    price: 150,
    color: 'border-[#C0C0C0]',
    borderColor: 'border-[#C0C0C0]',
    glowColor: 'shadow-[0_0_15px_rgba(192,192,192,0.5)]',
    description: 'Brilla con la intensidad de mil victorias.'
  },
  {
    id: 'gold',
    name: 'Oro del Tesoro',
    price: 500,
    color: 'border-[#D4AF37]',
    borderColor: 'border-[#D4AF37]',
    glowColor: 'shadow-[0_0_20px_rgba(212,175,55,0.6)]',
    description: 'Solo para los dragones más legendarios.'
  },
  {
    id: 'emerald',
    name: 'Esmeralda Mística',
    price: 1000,
    color: 'border-[#50C878]',
    borderColor: 'border-[#50C878]',
    glowColor: 'shadow-[0_0_25px_rgba(80,200,120,0.7)]',
    description: 'Imbuido con la magia antigua del bosque.'
  },
  {
    id: 'ruby',
    name: 'Rubí de Fuego',
    price: 2500,
    color: 'border-[#E0115F]',
    borderColor: 'border-[#E0115F]',
    glowColor: 'shadow-[0_0_30px_rgba(224,17,95,0.8)]',
    description: 'El calor de la pasión por el baloncesto hecho marco.'
  },
  {
    id: 'diamond',
    name: 'Diamante Eterno',
    price: 5000,
    color: 'border-[#B9F2FF]',
    borderColor: 'border-[#B9F2FF]',
    glowColor: 'shadow-[0_0_40px_rgba(185,242,255,0.9)]',
    description: 'La máxima distinción en la guarida.'
  }
];
