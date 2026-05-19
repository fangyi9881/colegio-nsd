import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { addXP } from '../utils/gamification';
import { Flame, Zap, Star, Trophy } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  icon: any;
  type: 'daily' | 'weekly';
  duration?: number;
  link?: string;
}

interface GamificationContextType {
  quests: Quest[];
  questTimers: Record<string, number>;
  startQuest: (questId: string, onCloseModal?: () => void) => void;
  completeQuest: (questId: string) => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile } = useAuth();
  const [questTimers, setQuestTimers] = useState<Record<string, number>>({});
  const [quests, setQuests] = useState<Quest[]>([
    { id: 'login', title: 'Visita la guarida', xp: 20, completed: false, icon: Flame, type: 'daily', duration: 3 },
    { id: 'news', title: 'Lee las noticias (30s)', xp: 50, completed: false, icon: Zap, type: 'daily', duration: 30, link: '/#noticias' },
    { id: 'calendar', title: 'Mira el calendario', xp: 30, completed: false, icon: Star, type: 'daily', duration: 5, link: '/#calendario' },
    { id: 'quinteto', title: 'Mira el quinteto semanal', xp: 30, completed: false, icon: Trophy, type: 'daily', duration: 5, link: '/#quinteto' },
    { id: 'weekly_trivia', title: 'Gana 3 trivias', xp: 200, completed: false, icon: Trophy, type: 'weekly' },
  ]);

  // Sync quests with userProfile
  useEffect(() => {
    if (userProfile) {
      const completedIds = userProfile.completedQuests || [];
      setQuests(prev => prev.map(q => {
        let completed = completedIds.includes(q.id);
        
        // Special case for weekly trivia
        if (q.id === 'weekly_trivia') {
          completed = (userProfile.weeklyTriviaWins || 0) >= 3;
        }
        
        return { ...q, completed };
      }));
    }
  }, [userProfile]);

  const completeQuest = async (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed) return;

    // Optimistic update
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: true } : q));
    
    if (currentUser) {
      try {
        const { arrayUnion, doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase');
        const userRef = doc(db, 'users', currentUser.uid);
        
        await updateDoc(userRef, {
          completedQuests: arrayUnion(id)
        });
        
        await addXP(currentUser.uid, quest.xp);
      } catch (error) {
        console.error("Error updating quest XP:", error);
      }
    }
  };

  const startQuest = (questId: string, onCloseModal?: () => void) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    // Handle redirection first
    if (quest.link) {
      const id = quest.link.substring(2);
      const element = document.getElementById(id);
      
      // If we are in a modal, close it first
      if (onCloseModal) {
        onCloseModal();
      }

      // Small delay to allow modal to close and then scroll
      setTimeout(() => {
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (quest.link === '/#noticias') {
          // Fallback if element not found (e.g. on different page)
          window.location.href = quest.link;
        }
      }, 100);
    }

    if (quest.duration) {
      setQuestTimers(prev => ({ ...prev, [questId]: quest.duration! }));
    } else {
      // If no duration, we still want to wait a bit so they actually see the content
      // But the user asked for "redirije antes de darte la recompensa"
      // So we add a default 3s timer for visit quests if not specified
      setQuestTimers(prev => ({ ...prev, [questId]: 3 }));
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setQuestTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id] > 0) {
            next[id] -= 1;
            changed = true;
            if (next[id] === 0) {
              completeQuest(id);
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quests, currentUser]);

  return (
    <GamificationContext.Provider value={{ quests, questTimers, startQuest, completeQuest }}>
      {children}
    </GamificationContext.Provider>
  );
}
