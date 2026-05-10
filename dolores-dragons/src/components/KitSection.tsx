import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { ShoppingBag, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const KITS = [
  {
    id: 'primera',
    title: 'Primera Equipación',
    image: '/images/1773444457996-29fa9f29-a365-4885-beb9-396db682d27f.png',
    description: 'Nuestra armadura principal. Negro profundo con detalles dorados que representan la fuerza y el prestigio de los Dragons.',
    details: [
      'Tejido transpirable de alto rendimiento',
      'Escudo bordado en alta definición',
      'Corte ergonómico para máxima movilidad',
      'Detalles dorados reflectantes'
    ]
  },
  {
    id: 'segunda',
    title: 'Segunda Equipación',
    image: '/images/1773444438442-d08254e0-a581-4339-ad74-47e532f1de1a.png',
    description: 'La alternativa perfecta. Diseño limpio y elegante para destacar en cualquier cancha visitante.',
    details: [
      'Tecnología de secado rápido',
      'Costuras planas anti-rozaduras',
      'Diseño ultraligero',
      'Cuello en V reforzado'
    ]
  }
];

export default function KitSection() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToKit = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = container.offsetWidth;
      container.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
      setFlippedCards({});
    }
  };

  const nextKit = () => {
    const nextIndex = (currentIndex + 1) % KITS.length;
    scrollToKit(nextIndex);
  };

  const prevKit = () => {
    const prevIndex = (currentIndex - 1 + KITS.length) % KITS.length;
    scrollToKit(prevIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const index = Math.round(container.scrollLeft / container.offsetWidth);
      if (index !== currentIndex) {
        setCurrentIndex(index);
        setFlippedCards({});
      }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden" id="equipacion">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 text-white uppercase tracking-tight" 
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Nuestras <span className="text-primary">Equipaciones</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-lg text-text-muted max-w-2xl mx-auto"
          >
            Conoce la armadura oficial de los Dolores Dragons para la temporada actual. Haz clic para ver los detalles.
          </motion.p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Mobile Carousel Navigation - Removed */}

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-2 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar gap-8 md:gap-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {KITS.map((kit) => (
              <div
                key={kit.id}
                className="w-full shrink-0 snap-center"
              >
                <div 
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => toggleFlip(kit.id)}
                >
                  <div className="w-full relative h-[400px] md:h-[550px] perspective-1000">
                    <div 
                      className={`w-full h-full relative preserve-3d transition-transform duration-700 ${flippedCards[kit.id] ? 'rotate-y-180' : ''}`}
                    >
                      {/* Front of card */}
                      <div className="absolute inset-0 backface-hidden bg-surface/30 rounded-3xl border border-white/5 p-6 md:p-10 overflow-hidden transition-colors hover:border-primary/30 hover:bg-surface/50 flex flex-col items-center justify-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] rounded-full group-hover:bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.2)_0%,transparent_70%)] transition-colors duration-500 pointer-events-none" />
                        
                        <img 
                          src={kit.image} 
                          alt={kit.title} 
                          className="w-full h-auto max-h-[90%] object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="absolute bottom-4 right-4 bg-primary/20 text-primary p-2 md:p-3 rounded-full backdrop-blur-sm border border-primary/30">
                          <Info className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Back of card */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-surface rounded-3xl border border-primary/30 p-6 md:p-10 overflow-hidden flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                        
                        <h3 className="text-xl md:text-3xl font-bold text-white mb-4 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                          {kit.title}
                        </h3>
                        
                        <p className="text-text-muted text-sm md:text-base mb-6 leading-relaxed">
                          {kit.description}
                        </p>
                        
                        <div className="w-full max-w-sm">
                          <h4 className="text-primary font-bold uppercase tracking-widest text-[10px] mb-3 border-b border-white/10 pb-2">Características</h4>
                          <ul className="text-left space-y-2">
                            {kit.details.map((detail, i) => (
                              <li key={i} className="text-white/80 text-xs md:text-sm flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center px-4 mt-4 transition-opacity duration-300" style={{ opacity: flippedCards[kit.id] ? 0 : 1 }}>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                      {kit.title}
                    </h3>
                    <p className="text-primary text-xs md:text-sm uppercase tracking-widest font-bold">
                      Toca para ver detalles
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Dots Indicator */}
          <div className="md:hidden flex justify-center gap-2 mt-6">
            {KITS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => scrollToKit(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-primary w-6' : 'bg-white/20'
                }`}
                aria-label={`Ir a equipación ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
