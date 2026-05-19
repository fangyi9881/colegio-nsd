import { motion } from 'motion/react';
import { Trophy, Wrench } from 'lucide-react';

export default function HallOfFameSection() {
  return (
    <section id="hall-of-fame" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(234,88,12,0.05)_0%,transparent_70%)] rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center gap-6 mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 text-primary mb-4"
          >
            <Trophy className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Hall of <span className="text-primary">Fame</span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-surface/50 border border-white/10 rounded-2xl p-8 md:p-12 max-w-2xl w-full flex flex-col items-center justify-center mt-8 backdrop-blur-sm"
          >
            <Wrench className="w-12 h-12 text-text-muted mb-6 animate-pulse" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Sección en Construcción</h3>
            <p className="text-text-muted text-lg">
              Estamos preparando el espacio para honrar a las verdaderas leyendas de los Dolores Dragons. ¡Vuelve pronto para descubrir quiénes formarán parte de nuestra historia!
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
