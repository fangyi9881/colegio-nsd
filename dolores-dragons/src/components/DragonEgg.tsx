import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Sparkles } from 'lucide-react';

export default function DragonEgg() {
  const { userProfile } = useAuth();
  
  if (!userProfile) return null;

  const level = userProfile.level || 1;
  const streak = userProfile.streakCount || 0;

  // Determine dragon stage based on level
  const getStage = () => {
    if (level >= 10) return 'dragon';
    if (level >= 5) return 'hatchling';
    return 'egg';
  };

  const stage = getStage();

  const stageData = {
    egg: {
      image: "/images/dragon-logo.png", // Using logo as base for now or a placeholder
      label: "Huevo de Dragón",
      desc: "Sigue entrando para que eclosione"
    },
    hatchling: {
      image: "/images/dragon-logo.png",
      label: "Cría de Dragón",
      desc: "¡Tu dragón está creciendo!"
    },
    dragon: {
      image: "/images/dragon-logo.png",
      label: "Dragón Adulto",
      desc: "¡Eres un maestro de la guarida!"
    }
  };

  return (
    <div className="bg-surface/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Sparkles className="w-16 h-16 text-primary" />
      </div>

      <motion.div
        animate={{ 
          y: [0, -10, 0],
          scale: streak > 0 ? [1, 1.05, 1] : 1
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
        className="w-24 h-24 mb-4 relative"
      >
        <img 
          src={stageData[stage].image} 
          alt={stageData[stage].label}
          className={`w-full h-full object-contain ${stage === 'egg' ? 'grayscale opacity-50' : ''}`}
          referrerPolicy="no-referrer"
        />
        {streak > 0 && (
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"
          />
        )}
      </motion.div>

      <h4 className="text-lg font-bold text-white mb-1">{stageData[stage].label}</h4>
      <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-3">{stageData[stage].desc}</p>
      
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(level / 10) * 100}%` }}
          className="h-full bg-primary"
        />
      </div>
      <p className="text-[9px] text-primary font-bold mt-2 uppercase tracking-tighter">Progreso Evolución: {Math.min(level, 10)}/10</p>
    </div>
  );
}
