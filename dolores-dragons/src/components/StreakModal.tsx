import { motion, AnimatePresence } from 'motion/react';
import { Flame, Star, X, Trophy, Shield } from 'lucide-react';
import { useBackToClose } from '../hooks/useBackToClose';
import { useEffect } from 'react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  isSpecial: boolean;
}

export default function StreakModal({ isOpen, onClose, streakCount, isSpecial }: StreakModalProps) {
  useBackToClose(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-surface border border-primary/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)] rounded-full -z-10" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative"
              >
                {isSpecial ? (
                  <Star className="w-12 h-12 text-primary animate-pulse" />
                ) : (
                  <Flame className="w-12 h-12 text-orange-500" />
                )}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-primary/30 rounded-full"
                />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {isSpecial ? '¡RECOMPENSA ESPECIAL!' : '¡RACHA AUMENTADA!'}
              </h2>
              
              <p className="text-text-muted mb-8">
                {isSpecial 
                  ? `¡Increíble! Has completado una semana completa. Has recibido una Escama Especial.`
                  : `Has vuelto un día más a la guarida. Tu racha actual es de ${streakCount} días.`}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full mb-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-[10px] text-text-muted uppercase font-bold">Días</p>
                  <p className="text-xl font-bold text-white">{streakCount}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <Shield className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-[10px] text-text-muted uppercase font-bold">Escamas</p>
                  <p className="text-xl font-bold text-white">+1</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-black rounded-xl font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
