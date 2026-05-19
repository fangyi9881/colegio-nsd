import { motion, AnimatePresence } from 'motion/react';
import { Shield, Star, Flame, Trophy, Minus, Plus, Zap, X as CloseIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import StreakModal from './StreakModal';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';

export default function StreakDisplay() {
  const { currentUser, userProfile, justLoggedIn } = useAuth();
  const [notification, setNotification] = useState<{ message: string, submessage: string, icon: React.ReactNode } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [prevStats, setPrevStats] = useState({
    streakCount: userProfile?.streakCount || 0,
    totalScales: userProfile?.totalScales || 0,
    specialScales: userProfile?.specialScales || 0,
    xp: userProfile?.xp || 0,
    level: userProfile?.level || 1
  });

  const logNotification = async (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    if (!currentUser) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: currentUser.uid,
        title,
        message,
        type,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'notifications');
    }
  };

  // Handle notification and minimize timeouts with fixed duration (3s)
  // This ensures the 3s is "duration" not "inactivity" (it won't reset if stats update rapidly)
  useEffect(() => {
    if (notification || !isMinimized) {
      const timer = setTimeout(() => {
        setNotification(null);
        setIsMinimized(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [!!notification, isMinimized]);

  useEffect(() => {
    if (userProfile) {
      // Check if we've already shown the initial streak info in this session
      const hasShown = sessionStorage.getItem('streak_shown');
      
      if (!hasShown || justLoggedIn) {
        const title = '¡Tu Racha Actual!';
        const message = `Llevas ${userProfile.streakCount} días seguidos. ¡Sigue así!`;
        
        setNotification({
          message: title,
          submessage: message,
          icon: <Flame className="w-5 h-5 text-primary animate-pulse" />
        });
        setIsMinimized(false);
        
        sessionStorage.setItem('streak_shown', 'true');
      }
    }
  }, [userProfile, justLoggedIn]);

  useEffect(() => {
    if (!userProfile) return;

    const { streakCount, totalScales, specialScales, xp, level } = userProfile;
    
    // Check for changes
    if (streakCount !== prevStats.streakCount || totalScales !== prevStats.totalScales || xp !== prevStats.xp || level !== prevStats.level) {
      
      if (streakCount > prevStats.streakCount) {
        const title = '¡Racha aumentada!';
        const message = `¡Llevas ${streakCount} días seguidos!`;
        
        setNotification({
          message: title,
          submessage: message,
          icon: <Flame className="w-5 h-5 animate-pulse" />
        });
        setIsMinimized(false);
        setIsModalOpen(true);
        logNotification(title, message, 'success');
      } else if (totalScales > prevStats.totalScales) {
        const title = '¡Escama obtenida!';
        const message = `Has ganado ${totalScales - prevStats.totalScales} escama(s) de dragón`;
        
        setNotification({
          message: title,
          submessage: message,
          icon: <Shield className="w-5 h-5 text-primary" />
        });
        setIsMinimized(false);
        logNotification(title, message, 'success');
      } else if (xp > prevStats.xp) {
        const title = '¡XP Ganada!';
        const message = `+${xp - prevStats.xp} puntos de experiencia`;
        
        setNotification({
          message: title,
          submessage: message,
          icon: <Zap className="w-5 h-5 text-yellow-400" />
        });
        setIsMinimized(false);
        logNotification(title, message, 'info');
      } else if (level > prevStats.level) {
        const title = '¡Nivel Subido!';
        const message = `¡Has alcanzado el nivel ${level}!`;
        
        setNotification({
          message: title,
          submessage: message,
          icon: <Trophy className="w-5 h-5 text-primary" />
        });
        setIsMinimized(false);
        logNotification(title, message, 'success');
      }

      setPrevStats({ streakCount, totalScales, specialScales, xp, level });
    }
  }, [userProfile, prevStats]);

  if (!userProfile) return null;

  const { streakCount, totalScales, specialScales } = userProfile;
  const isSpecialAward = streakCount > 0 && streakCount % 7 === 0;

  return (
    <>
      {/* Top Notification Popup */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="bg-surface/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-4 pointer-events-auto border border-primary/30"
            >
              <div className="bg-primary/20 p-3 rounded-full text-primary">
                {notification.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">{notification.message}</p>
                <p className="text-sm font-bold text-white/90">{notification.submessage}</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="p-1 text-white/40 hover:text-white transition-colors"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Streak Indicator */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3 items-end pointer-events-none">
        {isMinimized ? (
          <button 
            onClick={() => setIsMinimized(false)}
            className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-center text-primary hover:scale-105 transition-transform pointer-events-auto"
          >
            <Flame className="w-6 h-6" />
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface/80 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl flex flex-col gap-3 pointer-events-auto min-w-[160px]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Racha</p>
                  <p className="text-lg font-bold leading-none">{streakCount} días</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-1 text-text-muted hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-white/5" />

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-xl flex flex-col items-center justify-center text-center">
                <Shield className="w-4 h-4 text-primary mb-1" />
                <p className="text-[9px] text-text-muted uppercase font-bold">Escamas</p>
                <p className="text-sm font-bold">{totalScales}</p>
              </div>
              <div className="bg-primary/10 p-2 rounded-xl flex flex-col items-center justify-center text-center border border-primary/20">
                <Star className="w-4 h-4 text-primary mb-1 animate-spin-slow" />
                <p className="text-[9px] text-primary uppercase font-bold">Especiales</p>
                <p className="text-sm font-bold text-primary">{specialScales}</p>
              </div>
            </div>

            {streakCount > 0 && (
              <div className="mt-1">
                <div className="flex justify-between text-[9px] uppercase font-bold text-text-muted mb-1 px-1">
                  <span>Progreso Especial</span>
                  <span>{streakCount % 7}/7</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((streakCount % 7) || (streakCount > 0 && streakCount % 7 === 0 ? 7 : 0)) / 7 * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <StreakModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        streakCount={streakCount} 
        isSpecial={isSpecialAward} 
      />
    </>
  );
}
