import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const XP_BASE = 500;

export function calculateLevel(xp: number): number {
  // Formula: XP = 250 * L * (L-1)
  // L = 0.5 + sqrt(0.25 + XP / 250)
  if (xp <= 0) return 1;
  return Math.floor(0.5 + Math.sqrt(0.25 + xp / 250));
}

export function getTotalXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return 250 * level * (level - 1);
}

export function getXPForNextLevel(level: number): number {
  // XP needed to go from level to level + 1
  return level * XP_BASE;
}

export async function addXP(userId: string, amount: number) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    const currentXP = (data.xp || 0) + amount;
    const currentLevel = data.level || 1;
    const newLevel = calculateLevel(currentXP);
    
    const updates: any = {
      xp: increment(amount)
    };
    
    // Always update level if it's different from stored level, 
    // just in case it was out of sync
    if (newLevel !== currentLevel) {
      updates.level = newLevel;
      
      // If they leveled up, give bonus scales
      if (newLevel > currentLevel) {
        updates.totalScales = increment(10 * newLevel);
      }
    }
    
    await updateDoc(userRef, updates);
    return { newXP: currentXP, newLevel };
  }
  return null;
}

export async function addScales(userId: string, amount: number) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    totalScales: increment(amount)
  });
}
