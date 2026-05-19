import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Star, Zap, CheckCircle2, AlertCircle, Loader2, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { calculateLevel } from '../utils/gamification';
import { BASKETBALL_QUESTIONS, Question } from '../data/triviaQuestions';

interface TriviaGameProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TriviaGame({ isOpen, onClose }: TriviaGameProps) {
  const { currentUser, userProfile } = useAuth();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const handleNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (isOpen) {
      // Pick 5 random questions
      const shuffled = [...BASKETBALL_QUESTIONS].sort(() => 0.5 - Math.random());
      setGameQuestions(shuffled.slice(0, 5));
      setGameState('start');
      setScore(0);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [isOpen]);

  const handleStart = () => {
    setGameState('playing');
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    if (optionIndex === gameQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < gameQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishGame();
    }
  };

  // Keep ref in sync so auto-advance always calls latest version
  handleNextRef.current = handleNext;

  // Auto-advance 1.4s after answering
  useEffect(() => {
    if (!isAnswered || gameState !== 'playing') return;
    const t = setTimeout(() => handleNextRef.current(), 1400);
    return () => clearTimeout(t);
  }, [isAnswered, gameState]);

  const finishGame = async () => {
    setGameState('result');
    if (!currentUser) return;

    setUpdatingProfile(true);
    try {
      const dailyGames = userProfile?.dailyTriviaGames || 0;
      const lastTriviaDate = userProfile?.lastTriviaDate?.toDate() || new Date(0);
      const now = new Date();
      
      const isSameDay = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      let gamesToday = isSameDay(now, lastTriviaDate) ? dailyGames : 0;
      
      // XP Calculation
      let xpMultiplier = gamesToday < 5 ? 1 : 0.1;
      let baseXP = score * 10;
      let bonusXP = score === 5 ? 50 : 0;
      let totalXP = Math.round((baseXP + bonusXP) * xpMultiplier);
      
      // Weekly Quest Bonus
      const currentWins = userProfile?.weeklyTriviaWins || 0;
      const wonGame = score >= 3;
      let weeklyQuestXP = 0;
      if (wonGame && currentWins === 2) { // This is the 3rd win
        weeklyQuestXP = 200;
      }
      
      totalXP += weeklyQuestXP;
      setEarnedXP(totalXP);

      const userRef = doc(db, 'users', currentUser.uid);
      
      // Level up check
      const currentXP = (userProfile?.xp || 0) + totalXP;
      const newLevel = calculateLevel(currentXP);

      await updateDoc(userRef, {
        xp: increment(totalXP),
        level: newLevel,
        dailyTriviaGames: gamesToday + 1,
        lastTriviaDate: serverTimestamp(),
        weeklyTriviaWins: wonGame ? increment(1) : currentWins
      });
    } catch (error) {
      console.error("Error updating trivia stats:", error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-surface border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {gameState === 'start' && (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Trivia <span className="text-primary">Dragón</span>
            </h2>
            <p className="text-text-muted mb-8">
              Demuestra cuánto sabes de baloncesto. Responde 5 preguntas y gana XP. 
              <br />
              <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60 mt-2 block">
                {userProfile?.dailyTriviaGames >= 5 ? '⚠️ Has superado el límite diario: recompensas reducidas' : '💎 Recompensas completas disponibles'}
              </span>
            </p>
            <button
              onClick={handleStart}
              className="w-full py-4 bg-primary text-black font-bold rounded-2xl uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
            >
              Comenzar Juego
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Pregunta {currentQuestionIndex + 1} de 5</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 w-6 rounded-full ${i <= currentQuestionIndex ? 'bg-primary' : 'bg-white/10'}`} 
                  />
                ))}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-8 leading-tight">
              {gameQuestions[currentQuestionIndex].question}
            </h3>

            <div className="grid gap-3">
              {gameQuestions[currentQuestionIndex].options.map((option, index) => {
                const isCorrect = index === gameQuestions[currentQuestionIndex].correctAnswer;
                const isSelected = index === selectedOption;
                
                let buttonClass = "bg-white/5 border-white/10 text-white hover:border-primary/50";
                if (isAnswered) {
                  if (isCorrect) buttonClass = "bg-green-500/20 border-green-500/50 text-green-400";
                  else if (isSelected) buttonClass = "bg-red-500/20 border-red-500/50 text-red-400";
                  else buttonClass = "bg-white/5 border-white/10 text-white/30";
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 rounded-2xl border text-left font-bold transition-all flex items-center justify-between ${buttonClass}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                    {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            {/* Auto-advance bar — appears after answering */}
            {isAnswered && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.4, ease: 'linear' }}
                className="mt-6 h-0.5 bg-primary origin-left rounded-full"
              />
            )}
            {!isAnswered && (
              <div className="mt-6 h-0.5 bg-white/5 rounded-full" />
            )}
          </div>
        )}

        {gameState === 'result' && (
          <div className="p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Trophy className={`w-full h-full ${score >= 3 ? 'text-primary' : 'text-text-muted opacity-50'}`} />
              {score === 5 && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 -right-2 bg-primary text-black p-2 rounded-full shadow-lg"
                >
                  <Star className="w-6 h-6 fill-current" />
                </motion.div>
              )}
            </div>

            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">
              {score === 5 ? '¡Perfecto!' : score >= 3 ? '¡Buen Trabajo!' : 'Sigue Practicando'}
            </h2>
            <p className="text-text-muted mb-8">Has acertado {score} de 5 preguntas.</p>

            <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/10">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">XP Ganada</p>
                  <div className="flex items-center gap-1.5 justify-center">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold text-white">+{earnedXP}</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Juegos Hoy</p>
                  <span className="text-2xl font-bold text-white">{userProfile?.dailyTriviaGames || 0}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-primary text-black font-bold rounded-2xl uppercase tracking-widest hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
            >
              Cerrar y Reclamar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
