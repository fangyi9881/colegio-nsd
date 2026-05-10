import { motion } from 'motion/react';
import { useRef } from 'react';

const stats = [
  { value: '1.500+', label: 'Jugadores', sublabel: 'Formados' },
  { value: '48',     label: 'Títulos',   sublabel: 'Ganados'  },
  { value: '60',     label: 'Años',      sublabel: 'Historia' },
  { value: '100%',   label: 'Pasión',    sublabel: 'Dragons'  },
];

export default function StatsSection() {
  const ref = useRef(null);

  return (
    <section
      id="estadisticas"
      ref={ref}
      className="relative py-24 md:py-32 bg-black overflow-hidden force-dark"
    >
      {/* Ambient gold glow from center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(212,175,55,0.07) 0%, transparent 65%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col items-center text-center mb-16 md:mb-20"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-12 bg-primary/40" />
            <span
              className="text-primary/60 font-bold uppercase"
              style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}
            >
              El Club · Por los Números
            </span>
            <div className="h-px w-12 bg-primary/40" />
          </div>
          <h2
            className="text-white font-black uppercase"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
              letterSpacing: '0.14em',
              fontFamily: 'var(--font-display)',
            }}
          >
            Nuestra Leyenda
          </h2>
        </motion.div>

        {/* Stats strip */}
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderTop: '1px solid rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="flex flex-col items-center justify-center py-10 md:py-14 text-center relative"
              style={{
                borderRight:
                  i < stats.length - 1 ? '1px solid rgba(212,175,55,0.15)' : 'none',
              }}
            >
              {/* Number */}
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                className="font-black text-primary block"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </motion.span>

              {/* Hairline */}
              <div className="w-8 h-px bg-primary/30 my-4" />

              {/* Label */}
              <span
                className="text-white/80 font-bold uppercase block"
                style={{ fontSize: '0.68rem', letterSpacing: '0.22em' }}
              >
                {stat.label}
              </span>
              <span
                className="text-white/30 font-semibold uppercase block mt-0.5"
                style={{ fontSize: '0.55rem', letterSpacing: '0.18em' }}
              >
                {stat.sublabel}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
