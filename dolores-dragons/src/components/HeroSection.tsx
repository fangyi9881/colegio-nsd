import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface HeroSectionProps {
  onOpenJoinForm?: () => void;
}

const GoldenDust = () => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
    size: number;
    drift: number;
    ember: boolean;
  }>>([]);

  useEffect(() => {
    const sparkles = window.innerWidth < 768 ? 14 : 32;
    const embers = window.innerWidth < 768 ? 4 : 10;
    setParticles(
      Array.from({ length: sparkles + embers }).map((_, i) => {
        const ember = i >= sparkles;
        return {
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 12,
          duration: ember ? Math.random() * 8 + 18 : Math.random() * 10 + 14,
          size: ember ? Math.random() * 4.5 + 2.5 : Math.random() * 2.5 + 0.6,
          drift: (Math.random() - 0.5) * (ember ? 110 : 80),
          ember,
        };
      })
    );
  }, []);

  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.ember ? 'rgba(212,175,55,0.75)' : 'rgba(212,175,55,0.95)',
            boxShadow: p.ember
              ? `0 0 ${p.size * 5}px rgba(212,175,55,0.5), 0 0 ${p.size * 2}px rgba(253,224,71,0.7)`
              : `0 0 ${p.size * 3}px rgba(212,175,55,0.6)`,
          }}
          animate={{
            y: ['0vh', '-115vh'],
            x: [0, p.drift],
            opacity: [0, p.ember ? 0.7 : 0.85, p.ember ? 0.7 : 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
            times: [0, 0.08, 0.92, 1],
          }}
        />
      ))}
    </div>
  );
};

const AmbientOrbs = () => {
  const [orbs, setOrbs] = useState<Array<{
    id: number; left: number; top: number; size: number; duration: number; delay: number;
  }>>([]);

  useEffect(() => {
    const count = window.innerWidth < 768 ? 3 : 5;
    setOrbs(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: 10 + Math.random() * 80,
        top: 10 + Math.random() * 60,
        size: Math.random() * 220 + 100,
        duration: Math.random() * 10 + 14,
        delay: Math.random() * 8,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {orbs.map((o) => (
        <motion.div
          key={o.id}
          className="absolute rounded-full"
          style={{
            left: `${o.left}%`,
            top: `${o.top}%`,
            width: o.size,
            height: o.size,
            background: 'radial-gradient(circle, rgba(212,175,55,0.058) 0%, transparent 68%)',
            filter: 'blur(38px)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: o.duration, repeat: Infinity, delay: o.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

const stats = [
  { value: '68', label: 'Temporadas' },
  { value: '2', label: 'Equipos' },
  { value: 'Élite', label: 'Nivel' },
];

export default function HeroSection({ onOpenJoinForm }: HeroSectionProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black force-dark"
    >
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/78 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-3/5 z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% -5%, rgba(212,175,55,0.20) 0%, transparent 65%)',
          }}
        />
        <div className="w-full h-full scale-110">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source
              src="https://cdn.pixabay.com/video/2021/08/11/84683-587858348_large.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </motion.div>

      <AmbientOrbs />
      <GoldenDust />

      {/* Luxury corner frames — desktop only */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 3.2 }}
        className="absolute top-6 left-6 z-20 pointer-events-none hidden sm:block"
        style={{ width: 50, height: 50, borderTop: '1px solid rgba(212,175,55,0.42)', borderLeft: '1px solid rgba(212,175,55,0.42)' }}
      />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 3.2 }}
        className="absolute top-6 right-6 z-20 pointer-events-none hidden sm:block"
        style={{ width: 50, height: 50, borderTop: '1px solid rgba(212,175,55,0.42)', borderRight: '1px solid rgba(212,175,55,0.42)' }}
      />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 3.2 }}
        className="absolute bottom-[4rem] left-6 z-20 pointer-events-none hidden sm:block"
        style={{ width: 50, height: 50, borderBottom: '1px solid rgba(212,175,55,0.42)', borderLeft: '1px solid rgba(212,175,55,0.42)' }}
      />
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 3.2 }}
        className="absolute bottom-[4rem] right-6 z-20 pointer-events-none hidden sm:block"
        style={{ width: 50, height: 50, borderBottom: '1px solid rgba(212,175,55,0.42)', borderRight: '1px solid rgba(212,175,55,0.42)' }}
      />

      <motion.div
        style={{ opacity, marginTop: 'clamp(5rem, 10vw, 7rem)' }}
        className="container mx-auto px-6 z-20 relative flex flex-col items-center justify-center text-center"
      >
        {/* Editorial badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-4 mb-10"
        >
          <div className="h-px w-14 bg-primary/60" />
          <span
            className="text-primary/75 font-bold uppercase"
            style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}
          >
            Colegio NSD · Madrid · Temporada 25/26
          </span>
          <div className="h-px w-14 bg-primary/60" />
        </motion.div>

        {/* Logo with breathing glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-8"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 65%)',
              transform: 'scale(2.6)',
              filter: 'blur(30px)',
            }}
          />
          <motion.img
            src="/images/dragon-logo.png"
            alt="Dolores Dragons"
            className="relative z-10 h-auto"
            style={{ width: 'clamp(120px, 20vw, 190px)' }}
            animate={{
              filter: [
                'drop-shadow(0 0 16px rgba(212,175,55,0.25))',
                'drop-shadow(0 0 50px rgba(212,175,55,0.65))',
                'drop-shadow(0 0 16px rgba(212,175,55,0.25))',
              ],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Club name — gold shimmer */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-black uppercase text-gold-shimmer"
          style={{
            fontSize: 'clamp(1.9rem, 5.5vw, 4.8rem)',
            letterSpacing: '0.2em',
          }}
        >
          Dolores Dragons
        </motion.h1>

        {/* Gold hairline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.9, ease: [0.16, 1, 0.3, 1] }}
          className="bg-primary my-5"
          style={{ width: '4.5rem', height: '1px', originX: 0.5 }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 2.3 }}
          className="font-semibold uppercase"
          style={{ fontSize: '0.65rem', letterSpacing: '0.3em', maxWidth: '28rem', color: 'rgba(212,175,55,0.55)' }}
        >
          Solo los mejores llevan el escudo
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.7 }}
          className="flex items-stretch mt-12 mb-12"
          style={{ border: '1px solid rgba(212,175,55,0.18)' }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="px-8 sm:px-12 py-5 text-center"
              style={{
                borderRight:
                  i < stats.length - 1 ? '1px solid rgba(212,175,55,0.18)' : 'none',
              }}
            >
              <div
                className="font-black text-primary"
                style={{
                  fontSize: 'clamp(1.4rem, 2.8vw, 2.1rem)',
                  letterSpacing: '0.04em',
                }}
              >
                {stat.value}
              </div>
              <div
                className="font-bold uppercase mt-1"
                style={{ fontSize: '0.52rem', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)' }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 3.1 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onOpenJoinForm}
            className="group relative overflow-hidden bg-primary text-black font-bold uppercase transition-all duration-500 hover:shadow-[0_0_65px_rgba(212,175,55,0.45)] hover:bg-white"
            style={{ padding: '1rem 2.6rem', letterSpacing: '0.16em', fontSize: '0.72rem' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
              style={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                repeatDelay: 4,
                ease: 'easeInOut',
              }}
            />
            <span className="relative flex items-center gap-3">
              Solicitar Ingreso
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>

          <button
            onClick={() =>
              document.getElementById('calendario')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="font-semibold uppercase hover:text-white/75 transition-colors duration-300"
            style={{
              padding: '1rem 2.2rem',
              letterSpacing: '0.15em',
              fontSize: '0.68rem',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            Ver Próximos Partidos
          </button>
        </motion.div>
      </motion.div>

      {/* Bottom marquee — refined */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 3.6 }}
        className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
        style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}
      >
        <div
          className="py-2.5"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, duration: 32, ease: 'linear' }}
            className="flex whitespace-nowrap"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="mx-8 font-bold uppercase"
                style={{
                  fontSize: '0.52rem',
                  letterSpacing: '0.32em',
                  color: 'rgba(212,175,55,0.42)',
                }}
              >
                Dolores Dragons &nbsp;·&nbsp; Colegio NSD &nbsp;·&nbsp; Madrid &nbsp;·&nbsp;
                Élite Escolar &nbsp;·&nbsp; Temporada 25/26 &nbsp;·&nbsp;
              </span>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
