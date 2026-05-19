import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Trophy, Medal, Flame, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { PROFILE_FRAMES } from '../data/frames';

interface LeaderboardUser {
  uid: string;
  displayName: string;
  photoURL: string;
  totalScales: number;
  streakCount: number;
  level: number;
  activeFrame?: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          orderBy('totalScales', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(q);
        const leaderboardData: LeaderboardUser[] = [];
        querySnapshot.forEach((doc) => {
          leaderboardData.push({ uid: doc.id, ...doc.data() } as LeaderboardUser);
        });
        setUsers(leaderboardData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-white uppercase tracking-wider text-sm">Top Dragones</h3>
        </div>
        <span className="text-[10px] text-text-muted uppercase font-bold">Escamas Totales</span>
      </div>

      <div className="divide-y divide-white/5">
        {users.map((user, index) => {
          const activeFrame = PROFILE_FRAMES.find(f => f.id === (user.activeFrame || 'default')) || PROFILE_FRAMES[0];
          
          return (
            <motion.div
              key={user.uid}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 hover:bg-white/5 transition-colors ${
                index < 3 ? 'bg-primary/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-6 text-center font-bold text-sm">
                  {index === 0 ? <Medal className="w-5 h-5 text-yellow-500 mx-auto" /> :
                   index === 1 ? <Medal className="w-5 h-5 text-gray-400 mx-auto" /> :
                   index === 2 ? <Medal className="w-5 h-5 text-amber-600 mx-auto" /> :
                   <span className="text-text-muted">{index + 1}</span>}
                </div>
                
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${activeFrame.borderColor} ${activeFrame.glowColor} bg-background relative shrink-0`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/50">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-bold text-sm text-white leading-none mb-1">
                    {user.displayName || 'Anónimo'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded font-bold">LVL {user.level || 1}</span>
                    <div className="flex items-center gap-1 text-[10px] text-orange-500 font-bold">
                      <Flame className="w-3 h-3" />
                      {user.streakCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-bold text-white">{user.totalScales || 0}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {users.length === 0 && (
        <div className="p-8 text-center text-text-muted italic text-sm">
          Aún no hay dragones en el ranking.
        </div>
      )}
    </div>
  );
}
