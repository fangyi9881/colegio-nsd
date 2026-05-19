import { Star, Shield, Zap, Target, Award } from 'lucide-react';
import React from 'react';

export interface QuintetPlayer {
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

export interface MatchdayQuintet {
  id: string;
  label: string;
  date: string;
  players: QuintetPlayer[];
}

export const quintetsData: MatchdayQuintet[] = [
  {
    id: 'j15',
    label: 'Jornada 15',
    date: '21 Mar 2026',
    players: [
      { id: '71', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '11 pts, 10 val, 1/1 t2, 3/3 t3', image: '', role: 'Triple Threat', icon: Star, dorsal: 6, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '72', name: 'CAMPOVERDE ILLANES, NAOMI', position: 'Alero', stats: '10 pts, 4 val, 3/3 t2, 1/1 t3, 1/5 tl', image: '', role: 'Floor General', icon: Zap, dorsal: 30, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '73', name: 'MERINERO PEINADO, PAULA', position: 'Base', stats: '3 pts, 2 val, 1/1 t3', image: '', role: 'Defensive Anchor', icon: Zap, dorsal: 4, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '74', name: 'SANAITAN TORBISCO, JIMENA BELEN', position: 'Escolta', stats: '3 pts, 2 val, 1/1 t3', image: '', role: 'MVP', icon: Award, dorsal: 12, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '75', name: 'RODRIGUEZ JARAMILLO, CAMILA', position: 'Ala-Pívot', stats: '2 pts, 2 val, 1/1 t2', image: '', role: 'All-around', icon: Zap, dorsal: 24, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j14',
    label: 'Jornada 14',
    date: '14 Mar 2026',
    players: [
      { id: '66', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '19 pts, 9 val, 6/6 t2, 2/2 t3, 1/4 tl', image: '', role: 'Clutch Thief', icon: Star, dorsal: 30, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '67', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '6 pts, 6 val, 2/2 t2, 2/2 tl', image: '', role: 'Paint Presence', icon: Zap, dorsal: 6, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '68', name: 'SANAITAN TORBISCO, JIMENA BELEN', position: 'Escolta', stats: '6 pts, 6 val, 3/3 t2', image: '', role: 'Clutch Thief', icon: Target, dorsal: 12, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '69', name: 'MERINERO PEINADO, PAULA', position: 'Base', stats: '6 pts, 5 val, 3/3 t2', image: '', role: 'Rebounder', icon: Zap, dorsal: 4, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '70', name: 'LOPEZ LOPEZ-CORONA, ZAIRA', position: 'Escolta', stats: '5 pts, 4 val, 1/1 t2, 1/1 t3', image: '', role: 'Protector', icon: Star, dorsal: 11, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j13',
    label: 'Jornada 13',
    date: '07 Mar 2026',
    players: [
      { id: '61', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '9 pts, 9 val, 4/4 t2', image: '', role: 'Paint Presence', icon: Zap, dorsal: 30, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '62', name: 'AUZMENDI GONZÁLEZ, SARA', position: 'Base', stats: '5 pts, 5 val, 2/2 t3', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 4, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '63', name: 'HUAMAN CAYTA, VALENTINA MICAELA', position: 'Jugador', stats: '2 pts, 2 val, 1/1 t2', image: '', role: 'Clutch Thief', icon: Star, dorsal: 11, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '64', name: 'CASTILLO MERINO, MARY DEL CARMEN', position: 'Pívot', stats: '2 pts, 2 val, 1/1 t2', image: '', role: 'Protector', icon: Zap, dorsal: 17, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '65', name: 'TORRESANO, MIGUEL', position: 'Base', stats: 'Aportación clave en equipo', image: '', role: 'Protector', icon: Zap, dorsal: 5, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j12',
    label: 'Jornada 12',
    date: '28 Feb 2026',
    players: [
      { id: '56', name: 'RODRIGUEZ JARAMILLO, CAMILA', position: 'Ala-Pívot', stats: '7 pts, 6 val, 3/3 t2, 1/2 tl', image: '', role: 'MVP', icon: Zap, dorsal: 24, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '57', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '13 pts, 5 val, 5/5 t2, 1/1 t3', image: '', role: 'MVP', icon: Zap, dorsal: 30, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '58', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '8 pts, 4 val, 2/2 t2, 1/1 t3, 1/2 tl', image: '', role: 'Rebounder', icon: Star, dorsal: 6, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '59', name: 'CASTILLO MERINO, MARY DEL CARMEN', position: 'Pívot', stats: '2 pts, 2 val, 1/1 t2', image: '', role: 'System Anchor', icon: Shield, dorsal: 17, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '60', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '5 pts, 1 val, 2/2 t2, 1/2 tl', image: '', role: 'Scorer', icon: Star, dorsal: 15, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j11',
    label: 'Jornada 11',
    date: '21 Feb 2026',
    players: [
      { id: '51', name: 'AUZMENDI GONZÁLEZ, SARA', position: 'Base', stats: '9 pts, 9 val, 3/3 t2, 1/1 t3', image: '', role: 'Clutch Thief', icon: Target, dorsal: 4, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '52', name: 'CAMPOVERDE ILLANES, NAOMI', position: 'Alero', stats: '8 pts, 7 val, 1/1 t2, 2/2 t3', image: '', role: 'MVP', icon: Star, dorsal: 30, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '53', name: 'CASTILLO MERINO, MARY DEL CARMEN', position: 'Pívot', stats: '7 pts, 7 val, 2/2 t2, 1/1 t3', image: '', role: 'Offensive Catalyst', icon: Zap, dorsal: 17, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '54', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '7 pts, 5 val, 2/2 t2, 1/1 t3', image: '', role: 'Defensive Anchor', icon: Award, dorsal: 15, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '55', name: 'LOPEZ LOPEZ-CORONA, ZAIRA', position: 'Escolta', stats: '3 pts, 3 val, 1/1 t3', image: '', role: 'Offensive Catalyst', icon: Target, dorsal: 11, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j10',
    label: 'Jornada 10',
    date: '07 Feb 2026',
    players: [
      { id: '46', name: 'CAMPOVERDE ILLANES, NAOMI', position: 'Alero', stats: '28 pts, 28 val, 14/14 t2', image: '', role: 'MVP', icon: Zap, dorsal: 30, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '47', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '23 pts, 23 val, 10/10 t2, 1/1 t3', image: '', role: 'Scorer', icon: Zap, dorsal: 30, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '48', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '21 pts, 19 val, 10/10 t2, 1/2 tl', image: '', role: 'All-around', icon: Target, dorsal: 15, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '49', name: 'AUZMENDI GONZÁLEZ, SARA', position: 'Base', stats: '10 pts, 10 val, 2/2 t2, 2/2 t3', image: '', role: 'Scoring Force', icon: Star, dorsal: 4, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '50', name: 'LOPEZ LOPEZ-CORONA, ZAIRA', position: 'Escolta', stats: '8 pts, 8 val, 4/4 t2', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 11, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j9',
    label: 'Jornada 9',
    date: '31 Ene 2026',
    players: [
      { id: '41', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '10 pts, 8 val, 2/2 t2, 1/1 t3, 1/2 tl', image: '', role: 'All-around', icon: Shield, dorsal: 30, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '42', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '7 pts, 7 val, 2/2 t2, 1/1 t3', image: '', role: 'Protector', icon: Shield, dorsal: 6, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '43', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '6 pts, 6 val, 3/3 t2', image: '', role: 'Playmaker', icon: Star, dorsal: 11, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '44', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '4 pts, 2 val, 2/2 t2', image: '', role: 'Playmaker', icon: Zap, dorsal: 15, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '45', name: 'CLOVES DE FRANÇA, SOPHIA', position: 'Pívot', stats: '2 pts, 1 val, 1/1 t2', image: '', role: 'Paint Presence', icon: Shield, dorsal: 8, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j8',
    label: 'Jornada 8',
    date: '24 Ene 2026',
    players: [
      { id: '36', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '17 pts, 16 val, 6/6 t2, 1/1 t3, 2/2 tl', image: '', role: 'Scoring Force', icon: Shield, dorsal: 15, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '37', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '6 pts, 5 val, 3/3 t2', image: '', role: 'Paint Presence', icon: Award, dorsal: 6, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '38', name: 'CAMPOVERDE ILLANES, NAOMI', position: 'Alero', stats: '9 pts, 4 val, 4/4 t2, 1/6 tl', image: '', role: 'Rebounder', icon: Shield, dorsal: 30, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '39', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '5 pts, 3 val, 1/1 t2, 1/1 t3', image: '', role: 'Defensive Anchor', icon: Shield, dorsal: 11, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '40', name: 'TORRESANO, MIGUEL', position: 'Base', stats: '4 pts, 1 val, 1/1 t2, 2/4 tl', image: '', role: 'Floor General', icon: Award, dorsal: 5, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j7',
    label: 'Jornada 7',
    date: '17 Ene 2026',
    players: [
      { id: '31', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '8 pts, 8 val, 4/4 t2', image: '', role: 'All-around', icon: Award, dorsal: 11, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '32', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '10 pts, 8 val, 5/5 t2', image: '', role: 'Defensive Anchor', icon: Star, dorsal: 30, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '33', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '6 pts, 6 val, 3/3 t2', image: '', role: 'Playmaker', icon: Award, dorsal: 6, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '34', name: 'CASTILLO MERINO, MARY DEL CARMEN', position: 'Pívot', stats: '4 pts, 3 val, 2/2 t2', image: '', role: 'Defensive Anchor', icon: Shield, dorsal: 17, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '35', name: 'MERINERO PEINADO, SARA', position: 'Base', stats: '2 pts, 2 val, 1/1 t2', image: '', role: 'System Anchor', icon: Zap, dorsal: 8, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j6',
    label: 'Jornada 6',
    date: '10 Ene 2026',
    players: [
      { id: '26', name: 'CAMPOVERDE ILLANES, NAOMI', position: 'Alero', stats: '8 pts, 6 val, 4/4 t2', image: '', role: 'Floor General', icon: Star, dorsal: 30, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '27', name: 'RODRIGUEZ JARAMILLO, CAMILA', position: 'Ala-Pívot', stats: '5 pts, 5 val, 1/1 t2, 1/1 t3', image: '', role: 'Floor General', icon: Shield, dorsal: 24, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '28', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '10 pts, 4 val, 5/5 t2', image: '', role: 'Rebounder', icon: Target, dorsal: 6, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '29', name: 'CLOVES DE FRANÇA, SOPHIA', position: 'Pívot', stats: '2 pts, 1 val, 1/1 t2', image: '', role: 'Defensive Anchor', icon: Target, dorsal: 8, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '30', name: 'MERINERO PEINADO, PAULA', position: 'Base', stats: '2 pts, 1/1 t2', image: '', role: 'Protector', icon: Star, dorsal: 4, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j5',
    label: 'Jornada 5',
    date: '13 Dic 2025',
    players: [
      { id: '21', name: 'TORRESANO, MIGUEL', position: 'Base', stats: '20 pts, 20 val, 7/7 t2, 2/2 t3', image: '', role: 'Playmaker', icon: Target, dorsal: 5, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '22', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '6 pts, 6 val, 3/3 t2', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 11, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '23', name: 'CASTILLO MERINO, MARY DEL CARMEN', position: 'Pívot', stats: '6 pts, 5 val, 3/3 t2', image: '', role: 'Rebounder', icon: Shield, dorsal: 17, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '24', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '6 pts, 5 val, 3/3 t2', image: '', role: 'Scorer', icon: Shield, dorsal: 30, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '25', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '9 pts, 4 val, 1/1 t2, 2/2 t3, 1/3 tl', image: '', role: 'Scoring Force', icon: Star, dorsal: 15, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j4',
    label: 'Jornada 4',
    date: '29 Nov 2025',
    players: [
      { id: '16', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '8 pts, 6 val, 4/4 t2', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 6, categoria: 'Cadete Femenino', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '17', name: 'CLOVES DE FRANÇA, SOPHIA', position: 'Pívot', stats: '6 pts, 5 val, 3/3 t2', image: '', role: 'Scorer', icon: Target, dorsal: 8, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '18', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Jugador', stats: '9 pts, 4 val, 4/4 t2, 1/2 tl', image: '', role: 'Scorer', icon: Award, dorsal: 15, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '19', name: 'RODRIGUEZ JARAMILLO, CAMILA', position: 'Ala-Pívot', stats: '6 pts, 3 val, 3/3 t2', image: '', role: 'Triple Threat', icon: Target, dorsal: 24, categoria: 'Cadete Femenino', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '20', name: 'TORRESANO, MIGUEL', position: 'Base', stats: '4 pts, 3 val, 2/2 t2', image: '', role: 'Paint Presence', icon: Zap, dorsal: 5, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j3',
    label: 'Jornada 3',
    date: '22 Nov 2025',
    players: [
      { id: '11', name: 'RODRIGUEZ MUR, LUISA MARIA', position: 'Alero', stats: '14 pts, 12 val, 4/4 t2, 2/2 t3', image: '', role: 'MVP', icon: Shield, dorsal: 30, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '12', name: 'ATANASSOVA, NICOLE', position: 'Alero', stats: '11 pts, 7 val, 2/2 t2, 2/2 t3, 1/2 tl', image: '', role: 'Clutch Thief', icon: Award, dorsal: 6, categoria: 'Cadete Femenino', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '13', name: 'AUZMENDI GONZÁLEZ, SARA', position: 'Base', stats: '8 pts, 6 val, 2/2 t3, 2/4 tl', image: '', role: 'Rebounder', icon: Star, dorsal: 4, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '14', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '4 pts, 4 val, 2/2 t2', image: '', role: 'Defensive Anchor', icon: Target, dorsal: 11, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '15', name: 'MERINERO PEINADO, SARA', position: 'Base', stats: '3 pts, 3 val, 1/1 t3', image: '', role: 'MVP', icon: Award, dorsal: 8, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j2',
    label: 'Jornada 2',
    date: '15 Nov 2025',
    players: [
      { id: '6', name: 'HUAMAN CAYZA, VALENTINA MICAELA', position: 'Jugador', stats: '5 pts, 5 val, 1/1 t3', image: '', role: 'Playmaker', icon: Zap, dorsal: 11, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '7', name: 'TORRESANO, MIGUEL', position: 'Base', stats: '5 pts, 2 val, 1/1 t3', image: '', role: 'Triple Threat', icon: Zap, dorsal: 5, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '8', name: 'RODRIGUEZ ZEPEDA, ANGELLY RAQUEL', position: 'Base', stats: '7 pts, 1 val, 2/2 t2, 3/4 tl', image: '', role: 'Floor General', icon: Zap, dorsal: 15, categoria: 'Cadete Femenino', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '9', name: 'AUZMENDI GONZÁLEZ, SARA', position: 'Base', stats: '5 pts, 1 val, 1/1 t2, 1/2 tl', image: '', role: 'Paint Presence', icon: Award, dorsal: 4, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '10', name: 'MERINERO PEINADO, PAULA', position: 'Base', stats: 'Aportación clave en equipo', image: '', role: 'Defensive Anchor', icon: Star, dorsal: 4, categoria: 'Cadete Femenino', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  },
  {
    id: 'j1',
    label: 'Jornada 1',
    date: '08 Nov 2025',
    players: [
      { id: '1', name: 'Castillo Merino, Mary del Carmen', position: 'Jugador', stats: '9 pts, 1 val, 3/3 t2', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 17, categoria: 'Alevín Mixto', description: 'Actuación estelar liderando al equipo en momentos críticos. Su visión de juego y capacidad anotadora fueron fundamentales para asegurar la victoria.' },
      { id: '2', name: 'ROSAS, KEREN', position: 'Jugador', stats: 'Aportación clave en equipo', image: '', role: 'System Anchor', icon: Shield, dorsal: 2, categoria: 'Alevín Mixto', description: 'Un muro en defensa y letal en ataque. Dominó la pintura con autoridad, capturando rebotes clave y aportando puntos decisivos.' },
      { id: '3', name: 'MERINERO PEINADO, SARA', position: 'Base', stats: 'Aportación clave en equipo', image: '', role: 'Offensive Catalyst', icon: Shield, dorsal: 8, categoria: 'Alevín Mixto', description: 'Velocidad, precisión y garra. Su energía contagió al equipo y sus robos de balón cambiaron el rumbo del partido por completo.' },
      { id: '4', name: 'Proaño Quinaucho, Sara Guadalupe', position: 'Jugador', stats: 'Aportación clave en equipo', image: '', role: 'Clutch Thief', icon: Star, dorsal: 9, categoria: 'Alevín Mixto', description: 'Eficacia pura desde el perímetro. Sus triples llegaron en el momento exacto para romper la defensa rival y consolidar la ventaja.' },
      { id: '5', name: 'NUÑEZ SALAZAR, DAREK', position: 'Pívot', stats: 'Aportación clave en equipo', image: '', role: 'Protector', icon: Target, dorsal: 13, categoria: 'Alevín Mixto', description: 'Liderazgo silencioso pero efectivo. Organizó el juego con maestría, repartió asistencias de lujo y mantuvo la calma bajo presión.' }
    ]
  }
];
