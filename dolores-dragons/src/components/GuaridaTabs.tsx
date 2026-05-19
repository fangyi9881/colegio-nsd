import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy, Flame, Shield, Brain, Zap, Clock, ExternalLink,
  CheckCircle2, Loader2, Lock, Sword,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import Leaderboard from './Leaderboard';
import DragonEgg from './DragonEgg';
import TriviaGame from './TriviaGame';
import ShopSection from './ShopSection';
import AuthModal from './AuthModal';
import { getTotalXPForLevel, getXPForNextLevel } from '../utils/gamification';
import { PROFILE_FRAMES } from '../data/frames';

interface GuaridaTabsProps {
  onClose?: () => void;
}

export default function GuaridaTabs({ onClose }: GuaridaTabsProps) {
  const [activeTab, setActiveTab] = useState('progreso');
  const { currentUser, userProfile } = useAuth();
  const { quests, questTimers, startQuest } = useGamification();
  const [isTriviaOpen, setIsTriviaOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const activeFrame = PROFILE_FRAMES.find(f => f.id === (userProfile?.activeFrame || 'default')) || PROFILE_FRAMES[0];

  const tabs = [
    { id: 'progreso', label: 'Progreso' },
    { id: 'tienda', label: 'Tienda' },
    { id: 'ranking', label: 'Ranking' },
  ];

  const dailyQuests = quests.filter(q => q.type === 'daily');
  const weeklyQuests = quests.filter(q => q.type === 'weekly');

  const xpForLevel = getTotalXPForLevel(userProfile?.level || 1);
  const xpForNext = getXPForNextLevel(userProfile?.level || 1);
  const xpProgress = Math.min(100, Math.max(0, (((userProfile?.xp || 0) - xpForLevel) / xpForNext) * 100));

  /* ── Login gate ─────────────────────────────────────── */
  if (!currentUser) {
    return (
      <div className="w-full flex flex-col items-center justify-center px-6 py-10 text-center">
        {/* Title */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-10 bg-primary/45" />
          <span className="text-primary/55 font-bold uppercase text-[10px]" style={{ letterSpacing: '0.3em' }}>Acceso Restringido</span>
          <div className="h-px w-10 bg-primary/45" />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)', transform: 'scale(2.8)', filter: 'blur(20px)' }} />
          <img src="/images/dragon-logo.png" alt="Dragons" className="relative w-20 h-20 object-contain" referrerPolicy="no-referrer" style={{ filter: 'drop-shadow(0 0 16px rgba(212,175,55,0.55))' }} />
        </div>

        <h2 className="text-white font-black uppercase text-2xl mb-2" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
          La Guarida del <span className="text-gold-shimmer">Dragón</span>
        </h2>
        <p className="text-white/38 text-sm mb-8 max-w-xs leading-relaxed">
          Accede a la trivia, la tienda exclusiva, el ranking y tu progreso como miembro del club.
        </p>

        {/* Perks */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-8">
          {[
            { icon: Brain, label: 'Trivia de baloncesto' },
            { icon: Trophy, label: 'Ranking global' },
            { icon: Shield, label: 'Tienda de insignias' },
            { icon: Flame, label: 'Racha de actividad' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 px-3 py-2.5 text-left" style={{ border: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.04)' }}>
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-white/55 text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setIsAuthOpen(true)}
          className="flex items-center gap-2.5 px-8 py-3.5 bg-primary hover:bg-primary/85 text-black font-bold uppercase text-xs transition-all hover:shadow-[0_0_35px_rgba(212,175,55,0.4)]"
          style={{ letterSpacing: '0.18em' }}
        >
          <Sword className="w-4 h-4" />
          Unirse al Club
        </button>
        <p className="text-white/22 text-[10px] mt-3">Google · Facebook · Apple · Correo</p>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  /* ── Authenticated content ──────────────────────────── */
  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-4 sm:px-8 mb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-8 bg-primary/45" />
          <span className="text-primary/55 font-bold uppercase text-[9px]" style={{ letterSpacing: '0.3em' }}>Club Exclusivo</span>
          <div className="h-px w-8 bg-primary/45" />
        </div>
        <h2
          className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight text-center"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          La Guarida del <span className="text-gold-shimmer">Dragón</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6 gap-1.5 px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 text-xs font-bold uppercase transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-black'
                : 'text-white/45 hover:text-white'
            }`}
            style={{
              letterSpacing: '0.16em',
              border: activeTab === tab.id ? 'none' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-8">

        {/* ── Progreso tab ── */}
        {activeTab === 'progreso' && (
          <div className="space-y-5">

            {/* Stats card */}
            <div className="p-5 rounded-none" style={{ border: '1px solid rgba(212,175,55,0.18)', background: 'rgba(212,175,55,0.03)' }}>
              <div className="flex items-center gap-4 mb-5">
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${activeFrame.borderColor} ${activeFrame.glowColor} bg-background shrink-0`}>
                  {userProfile?.photoURL || currentUser?.photoURL ? (
                    <img src={userProfile?.photoURL || currentUser?.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/40">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{userProfile?.displayName || 'Dragon Player'}</h3>
                  <div className="flex items-center gap-3 text-xs mt-0.5">
                    <span className="text-primary font-bold uppercase" style={{ letterSpacing: '0.12em', fontSize: '0.6rem' }}>
                      Nivel {userProfile?.level || 1}
                    </span>
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {userProfile?.streakCount || 0} días
                    </span>
                    <span className="text-white/40 font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3 text-primary" /> {userProfile?.totalScales || 0}
                    </span>
                  </div>
                </div>
              </div>
              {/* XP bar */}
              <div className="flex items-center gap-2.5">
                <Zap className="w-3 h-3 text-primary shrink-0" />
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-primary"
                  />
                </div>
                <span className="text-white/30 text-[10px] font-bold shrink-0">
                  {userProfile?.xp || 0} XP
                </span>
              </div>
            </div>

            {/* Dragon egg */}
            <DragonEgg />

            {/* Daily quests */}
            <div>
              <p className="text-white/38 text-[10px] font-bold uppercase mb-3" style={{ letterSpacing: '0.24em' }}>
                Misiones Diarias
              </p>
              <div className="flex flex-col gap-2">
                {dailyQuests.map(quest => {
                  const timer = questTimers[quest.id];
                  const isRunning = timer !== undefined && timer > 0;
                  const Icon = quest.icon;
                  return (
                    <div
                      key={quest.id}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        border: `1px solid ${quest.completed ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        background: quest.completed ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${quest.completed ? 'bg-primary/20' : 'bg-white/5'}`}>
                          {quest.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Icon className="w-3.5 h-3.5 text-white/40" />}
                        </div>
                        <div>
                          <p className={`text-xs font-semibold ${quest.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>{quest.title}</p>
                          <p className="text-[10px] text-primary/60 font-bold">+{quest.xp} XP</p>
                        </div>
                      </div>
                      {!quest.completed && (
                        isRunning ? (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Clock className="w-3 h-3 animate-pulse" />
                            <span className="text-xs font-bold tabular-nums">{timer}s</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => startQuest(quest.id, onClose)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase text-black bg-primary px-3 py-1.5 hover:bg-primary/85 transition-colors"
                            style={{ letterSpacing: '0.14em' }}
                          >
                            {quest.link ? <><ExternalLink className="w-2.5 h-2.5" /> Ir</> : 'Completar'}
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly quests */}
            <div>
              <p className="text-white/38 text-[10px] font-bold uppercase mb-3" style={{ letterSpacing: '0.24em' }}>
                Misiones Semanales
              </p>
              <div className="flex flex-col gap-2">
                {weeklyQuests.map(quest => {
                  const isTrivia = quest.id === 'weekly_trivia';
                  const wins = userProfile?.weeklyTriviaWins || 0;
                  const progress = isTrivia ? Math.min(3, wins) : 0;
                  const Icon = quest.icon;
                  return (
                    <div
                      key={quest.id}
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        border: `1px solid ${quest.completed ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        background: quest.completed ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${quest.completed ? 'bg-primary/20' : 'bg-white/5'}`}>
                          {quest.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Icon className="w-3.5 h-3.5 text-white/40" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${quest.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>{quest.title}</p>
                          <p className="text-[10px] text-primary/60 font-bold">+{quest.xp} XP</p>
                          {isTrivia && !quest.completed && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {[0, 1, 2].map(i => (
                                <div key={i} className={`w-4 h-1 rounded-full ${i < progress ? 'bg-primary' : 'bg-white/10'}`} />
                              ))}
                              <span className="text-[9px] text-white/30">{progress}/3</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {!quest.completed && isTrivia && (
                        <button
                          onClick={() => setIsTriviaOpen(true)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase text-black bg-primary px-3 py-1.5 hover:bg-primary/85 transition-colors ml-2 shrink-0"
                          style={{ letterSpacing: '0.14em' }}
                        >
                          <Brain className="w-2.5 h-2.5" /> Jugar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trivia card */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer transition-all group"
              style={{ border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.04)' }}
              onClick={() => setIsTriviaOpen(true)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.45)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)')}
            >
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-primary" />
                <div>
                  <h4 className="text-sm font-bold text-white">Trivia de Baloncesto</h4>
                  <p className="text-[10px] text-white/35">Gana XP · Hasta 5 partidas/día con recompensas completas</p>
                </div>
              </div>
              <div className="text-primary group-hover:translate-x-1 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'tienda' && <ShopSection />}
        {activeTab === 'ranking' && <Leaderboard />}
      </div>

      <TriviaGame isOpen={isTriviaOpen} onClose={() => setIsTriviaOpen(false)} />
    </div>
  );
}
