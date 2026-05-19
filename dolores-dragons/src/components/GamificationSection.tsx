import { motion } from 'motion/react';
import { Trophy, Flame, Shield, Star, CheckCircle2, Zap, Loader2, Brain, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import Leaderboard from './Leaderboard';
import DragonEgg from './DragonEgg';
import TriviaGame from './TriviaGame';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import ShopSection from './ShopSection';
import { addXP, getTotalXPForLevel, getXPForNextLevel } from '../utils/gamification';
import { PROFILE_FRAMES } from '../data/frames';

interface GamificationSectionProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function GamificationSection({ isModal = false, onClose }: GamificationSectionProps) {
  const { currentUser, userProfile } = useAuth();
  const { quests, questTimers, startQuest } = useGamification();
  const [isTriviaOpen, setIsTriviaOpen] = useState(false);

  const activeFrame = PROFILE_FRAMES.find(f => f.id === (userProfile?.activeFrame || 'default')) || PROFILE_FRAMES[0];
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Automatically start the login quest if not completed
    const loginQuest = quests.find(q => q.id === 'login');
    if (loginQuest && !loginQuest.completed && !questTimers['login']) {
      startQuest('login');
    }
  }, [quests, questTimers, startQuest]);

  useEffect(() => {
    // Listen for recent user updates to show activity
    const q = query(
      collection(db, 'users'),
      orderBy('lastStreakUpdate', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any)).filter(user => user.displayName); // Only show users with names
      setRecentActivity(activities);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section id="guarida" className={`${isModal ? 'py-8' : 'py-24'} bg-background relative overflow-hidden`}>
      {/* Background Elements */}
      {!isModal && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full" />
        </div>
      )}

      <div className={`${isModal ? 'px-4 sm:px-8' : 'container mx-auto px-4'} relative z-10`}>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Side: User Stats & Quests */}
          <div className="lg:w-1/2 space-y-12">
            <div>
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block"
              >
                Gamificación
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                La Guarida del <span className="text-primary">Dragón</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-text-muted text-lg max-w-xl"
              >
                Vuelve cada día para recolectar escamas, subir de nivel y demostrar que eres el dragón más fiel de Dolores.
              </motion.p>
            </div>

            {currentUser ? (
              <div className="space-y-12">
                {/* User Progress Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-surface border border-primary/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Shield className="w-24 h-24 text-primary" />
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-4 ${activeFrame.borderColor} ${activeFrame.glowColor} bg-background transition-all duration-500`}>
                      {userProfile?.photoURL || currentUser.photoURL ? (
                        <img src={userProfile?.photoURL || currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/50">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white leading-none mb-2">{userProfile?.displayName || 'Dragon Player'}</h3>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary text-black text-[10px] font-bold rounded-full uppercase tracking-wider">Nivel {userProfile?.level || 1}</span>
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                          <Flame className="w-4 h-4" />
                          {userProfile?.streakCount || 0} Días
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* XP Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-muted">
                      <span>Experiencia (XP)</span>
                      <span>{userProfile?.xp || 0} / {getTotalXPForLevel((userProfile?.level || 1) + 1)}</span>
                    </div>
                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, Math.max(0, 
                            ((userProfile?.xp || 0) - getTotalXPForLevel(userProfile?.level || 1)) / 
                            getXPForNextLevel(userProfile?.level || 1) * 100
                          ))}%` 
                        }}
                        className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                      />
                    </div>
                    <p className="text-[10px] text-text-muted text-right italic">
                      {getXPForNextLevel(userProfile?.level || 1) - ((userProfile?.xp || 0) - getTotalXPForLevel(userProfile?.level || 1))} XP para el siguiente nivel
                    </p>
                  </div>
                </motion.div>

                {/* Shop Section */}
                <ShopSection />

                {/* Dragon Egg Evolution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <DragonEgg />
                </motion.div>

                {/* Trivia Game Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="bg-primary/10 border border-primary/30 p-6 rounded-3xl relative overflow-hidden group cursor-pointer"
                  onClick={() => setIsTriviaOpen(true)}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                    <Brain className="w-12 h-12 text-primary" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">Trivia de Baloncesto</h4>
                  <p className="text-xs text-text-muted mb-4">Pon a prueba tus conocimientos y gana XP extra.</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Jugar Ahora</span>
                    <div className="flex items-center gap-1 text-[10px] text-text-muted uppercase font-bold">
                      <Zap className="w-3 h-3 text-primary" />
                      {userProfile?.dailyTriviaGames || 0}/5 Juegos Hoy
                    </div>
                  </div>
                </motion.div>

                {/* Daily Quests */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Misiones Diarias
                  </h4>
                  <div className="grid gap-3">
                    {quests.filter(q => q.type === 'daily').map((quest, i) => {
                      const Icon = quest.icon;
                      const isTimerActive = (questTimers[quest.id] || 0) > 0;
                      return (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            quest.completed 
                              ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                              : 'bg-white/5 border-white/10 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-primary/10 text-primary'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${quest.completed ? 'text-green-400' : 'text-white'}`}>{quest.title}</p>
                              <p className="text-[10px] text-text-muted uppercase font-bold">+{quest.xp} XP</p>
                            </div>
                          </div>
                          {quest.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : isTimerActive ? (
                            <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
                              <Clock className="w-4 h-4 animate-pulse" />
                              {questTimers[quest.id]}s
                            </div>
                          ) : (
                            <button 
                              onClick={() => startQuest(quest.id, onClose)}
                              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                            >
                              {quest.link ? 'Ir ahora' : 'Completar'}
                              {quest.link && <ExternalLink className="w-3 h-3" />}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Quests */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Misiones Semanales
                  </h4>
                  <div className="grid gap-3">
                    {quests.filter(q => q.type === 'weekly').map((quest, i) => {
                      const Icon = quest.icon;
                      return (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            quest.completed 
                              ? 'bg-green-500/5 border-green-500/20 opacity-60' 
                              : 'bg-white/5 border-white/10 hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${quest.completed ? 'bg-green-500/20 text-green-400' : 'bg-primary/10 text-primary'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`font-bold text-sm ${quest.completed ? 'text-green-400' : 'text-white'}`}>{quest.title}</p>
                              <p className="text-[10px] text-text-muted uppercase font-bold">+{quest.xp} XP</p>
                            </div>
                          </div>
                          {quest.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <button 
                              onClick={() => startQuest(quest.id, onClose)}
                              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                            >
                              {quest.link ? 'Ir ahora' : 'Completar'}
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> Actividad Reciente
                  </h4>
                  <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30">
                            {activity.photoURL ? (
                              <img src={activity.photoURL} alt={activity.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full bg-surface flex items-center justify-center text-primary text-[10px] font-bold">
                                {activity.displayName?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-white truncate">
                              {activity.displayName} <span className="text-text-muted font-normal">ha subido al nivel</span> {activity.level || 1}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[8px] text-primary uppercase font-bold tracking-tighter flex items-center gap-0.5">
                                <Flame className="w-2 h-2" /> Racha: {activity.streakCount || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-text-muted text-[10px] uppercase tracking-widest">
                        No hay actividad reciente
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-surface/50 border border-white/10 p-12 rounded-3xl text-center"
              >
                <Trophy className="w-16 h-16 text-primary/20 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">¡Únete a la competición!</h3>
                <p className="text-text-muted mb-8 max-w-xs mx-auto">Regístrate para empezar a ganar escamas, subir de nivel y aparecer en el ranking.</p>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-8 py-3 bg-primary text-black rounded-full font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                >
                  Regístrate Ahora
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Side: Leaderboard */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>

      <TriviaGame 
        isOpen={isTriviaOpen} 
        onClose={() => setIsTriviaOpen(false)} 
      />
    </section>
  );
}
