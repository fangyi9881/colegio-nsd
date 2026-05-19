import { motion } from 'motion/react';
import { ShoppingBag, Star, CheckCircle2, Lock, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PROFILE_FRAMES, ProfileFrame } from '../data/frames';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { useState } from 'react';

export default function ShopSection() {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const buyFrame = async (frame: ProfileFrame) => {
    if (!currentUser || !userProfile) return;
    if (userProfile.totalScales < frame.price) return;
    if (userProfile.ownedFrames?.includes(frame.id)) return;

    setLoading(frame.id);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        totalScales: userProfile.totalScales - frame.price,
        ownedFrames: arrayUnion(frame.id)
      });
    } catch (error) {
      console.error("Error buying frame:", error);
    } finally {
      setLoading(null);
    }
  };

  const equipFrame = async (frameId: string) => {
    if (!currentUser || !userProfile) return;
    if (!userProfile.ownedFrames?.includes(frameId)) return;

    setLoading(frameId);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        activeFrame: frameId
      });
    } catch (error) {
      console.error("Error equipping frame:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Tienda de Marcos
        </h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
          <Coins className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-white">{userProfile?.totalScales || 0} Escamas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROFILE_FRAMES.map((frame, i) => {
          const isOwned = userProfile?.ownedFrames?.includes(frame.id);
          const isActive = userProfile?.activeFrame === frame.id;
          const canAfford = (userProfile?.totalScales || 0) >= frame.price;

          return (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${
                isActive 
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Preview Avatar with Frame */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-full border-4 ${frame.color} ${frame.glowColor} overflow-hidden bg-background flex-shrink-0`}>
                  <img 
                    src={userProfile?.photoURL || "https://picsum.photos/seed/dragon/200/200"} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white">{frame.name}</h4>
                  <p className="text-[10px] text-text-muted uppercase font-bold">{frame.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                {isOwned ? (
                  <button
                    onClick={() => equipFrame(frame.id)}
                    disabled={isActive || loading === frame.id}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'bg-green-500 text-white cursor-default' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isActive ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Equipado</span>
                    ) : (
                      loading === frame.id ? 'Equipando...' : 'Equipar'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => buyFrame(frame)}
                    disabled={!canAfford || loading === frame.id}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                      canAfford 
                        ? 'bg-primary text-black hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {loading === frame.id ? 'Comprando...' : (
                      <>
                        <Coins className="w-3 h-3" />
                        {frame.price} Escamas
                      </>
                    )}
                  </button>
                )}

                {!isOwned && !canAfford && (
                  <span className="text-[8px] text-red-400 uppercase font-bold flex items-center gap-1">
                    <Lock className="w-2 h-2" /> No puedes permitirte esto
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        
        {/* Coming Soon Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-3xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <Star className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
          </div>
          <h4 className="font-bold text-white mb-1">Más cosas por llegar</h4>
          <p className="text-[10px] text-text-muted uppercase font-bold">¡Mantente atento a las novedades!</p>
        </motion.div>
      </div>
    </div>
  );
}
