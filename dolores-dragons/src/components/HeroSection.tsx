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
  }>>([]);

  useEffect(() => {
    const count = window.innerWidth < 768 ? 10 : 22;
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 10,
        duration: Math.random() * 10 + 14,
        size: Math.random() * 2.5 + 0.6,
        drift: (Math.random() - 0.5) * 80,
      }))
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
            background: 'rgba(212,175,55,0.95)',
            boxShadow: `0 0 ${p.size * 3}px rgba(212,175,55,0.6)`,
          }}
          animate={{
            y: ['0vh', '-115vh'],
            x: [0, p.drift],
            opacity: [0, 0.85, 0.85, 0],
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
        <div className="absolute inset-0 bg-black/82 z-10" />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-3/5 z-10"
          style={{
            background:
              'radial-gradient(ellipse at 50% -5%, rgba(212,175,55,0.13) 0%, transparent 62%)',
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

      <GoldenDust />

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
          <div className="h-px w-14 bg-primary/45" />
          <span
            className="text-primary/65 font-bold uppercase"
            style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}
          >
            Colegio NSD · Madrid · Temporada 25/26
          </span>
          <div className="h-px w-14 bg-primary/45" />
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
                'radial-gradient(circle, rgba(212,175,55,0.22) 0%, transparent 65%)',
              transform: 'scale(2.4)',
              filter: 'blur(28px)',
            }}
          />
          <motion.img
            src="https://i.imgur.com/OP6BbHs.png"
            alt="Dolores Dragons"
            className="relative z-10 h-auto"
            style={{ width: 'clamp(120px, 20vw, 190px)' }}
            animate={{
              filter: [
                'drop-shadow(0 0 16px rgba(212,175,55,0.22))',
                'drop-shadow(0 0 44px rgba(212,175,55,0.58))',
                'drop-shadow(0 0 16px rgba(212,175,55,0.22))',
              ],
            }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Club name */}
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-black text-white uppercase"
          style={{
            fontSize: 'clamp(1.9rem, 5.5vw, 4.8rem)',
            letterSpacing: '0.2em',
            textShadow: '0 0 100px rgba(212,175,55,0.12)',
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
          className="text-white/40 font-semibold uppercase"
          style={{ fontSize: '0.65rem', letterSpacing: '0.3em', maxWidth: '28rem' }}
        >
          Solo los mejores llevan el escudo
        </motion.p>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.7 }}
          className="flex items-stretch mt-12 mb-12"
          style={{ border: '1px solid rgba(212,175,55,0.14)' }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="px-8 sm:px-12 py-5 text-center"
              style={{
                borderRight:
                  i < stats.length - 1 ? '1px solid rgba(212,175,55,0.14)' : 'none',
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
                className="text-white/28 font-bold uppercase mt-1"
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
            className="group relative overflow-hidden bg-primary text-black font-bold uppercase transition-all duration-500 hover:shadow-[0_0_55px_rgba(212,175,55,0.35)] hover:bg-white"
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
            className="text-white/45 font-semibold uppercase hover:text-white/75 transition-colors duration-300"
            style={{
              padding: '1rem 2.2rem',
              letterSpacing: '0.15em',
              fontSize: '0.68rem',
              border: '1px solid rgba(255,255,255,0.1)',
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
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}
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
