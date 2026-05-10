import { motion } from 'motion/react';

const milestones = [
  {
    year: '1957',
    title: 'Fundación del Colegio',
    description:
      'Se funda el Colegio Nuestra Señora de los Dolores, sentando las bases de nuestra comunidad educativa y deportiva en Madrid.',
  },
  {
    year: '1957 – 2025',
    title: 'Era NS Dolores',
    description:
      'Décadas de competición y formación bajo el nombre histórico de NS Dolores, forjando nuestra identidad en las canchas madrileñas y construyendo un legado de 48 títulos.',
  },
  {
    year: '2025',
    title: 'Nueva Era Dragons',
    description:
      'En la temporada 2025-2026 marcamos un hito histórico: nuevo nombre, nuevo escudo, nueva equipación. Los Dolores Dragons nacen para dominar la siguiente era.',
  },
];

export default function HistorySection() {
  return (
    <section id="historia" className="py-24 md:py-32 bg-black relative overflow-hidden force-dark">
      {/* Ambient side glow */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 100% 50%, rgba(212,175,55,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="flex flex-col items-center text-center mb-16 md:mb-24"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px w-12 bg-primary/40" />
            <span
              className="text-primary/60 font-bold uppercase"
              style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}
            >
              Desde 1957
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
            Nuestra Historia
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto relative">
          {/* Vertical gold line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[7.5rem] md:left-48 top-0 bottom-0 w-px bg-primary/20"
            style={{ originY: 0 }}
          />

          <div className="flex flex-col gap-16 md:gap-20">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="flex items-start gap-0"
              >
                {/* Year column */}
                <div
                  className="shrink-0 text-right pr-8"
                  style={{ width: '7.5rem', minWidth: '7.5rem' }}
                >
                  <span
                    className="font-black text-primary block"
                    style={{
                      fontSize: 'clamp(0.75rem, 2vw, 1rem)',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.05em',
                      lineHeight: 1.2,
                    }}
                  >
                    {m.year}
                  </span>
                </div>

                {/* Dot on the line */}
                <div className="relative flex flex-col items-center" style={{ width: '1px' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                    className="w-3 h-3 rounded-full bg-primary absolute"
                    style={{
                      top: '0.3rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 0 10px rgba(212,175,55,0.5)',
                    }}
                  />
                </div>

                {/* Content column */}
                <div className="pl-10 pb-2">
                  <h3
                    className="text-white font-bold uppercase mb-3"
                    style={{
                      fontSize: 'clamp(0.85rem, 2vw, 1.1rem)',
                      letterSpacing: '0.16em',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {m.title}
                  </h3>
                  <p
                    className="text-white/40 leading-relaxed"
                    style={{ fontSize: '0.85rem', maxWidth: '34rem' }}
                  >
                    {m.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
