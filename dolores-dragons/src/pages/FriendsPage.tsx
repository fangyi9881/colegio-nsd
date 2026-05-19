import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc, serverTimestamp, updateDoc, or } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, Search, UserPlus, Check, X, Loader2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface UserProfile {
  uid: string;
  displayName: string;
  username?: string;
  userType?: string;
  photoURL?: string;
  level?: number;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
  userProfile?: UserProfile; // Populated client-side
}

export default function FriendsPage() {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchFriendsAndRequests();
    }
  }, [currentUser]);

  const fetchFriendsAndRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch all requests where user is sender or receiver
      const q = query(
        collection(db, 'friend_requests'),
        or(
          where('senderId', '==', currentUser.uid),
          where('receiverId', '==', currentUser.uid)
        )
      );
      
      const querySnapshot = await getDocs(q);
      const allRequests: FriendRequest[] = [];
      const friendIds = new Set<string>();
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<FriendRequest, 'id'>;
        allRequests.push({ id: doc.id, ...data });
        
        if (data.status === 'accepted') {
          friendIds.add(data.senderId === currentUser.uid ? data.receiverId : data.senderId);
        }
      });

      // Fetch profiles for friends
      const friendsData: UserProfile[] = [];
      for (const friendId of Array.from(friendIds)) {
        const friendSnap = await getDoc(doc(db, 'users', friendId));
        if (friendSnap.exists()) {
          friendsData.push(friendSnap.data() as UserProfile);
        }
      }
      setFriends(friendsData);

      // Filter pending requests received by the current user
      const pendingReceived = allRequests.filter(req => req.receiverId === currentUser.uid && req.status === 'pending');
      
      // Populate profiles for pending requests
      const populatedRequests = await Promise.all(pendingReceived.map(async (req) => {
        const senderSnap = await getDoc(doc(db, 'users', req.senderId));
        return {
          ...req,
          userProfile: senderSnap.exists() ? (senderSnap.data() as UserProfile) : undefined
        };
      }));
      
      setRequests(populatedRequests);

    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !currentUser) return;
    
    setSearching(true);
    try {
      // Search by username (simplified, exact match for now, or fetch all and filter)
      // Since we don't have a complex search index, we'll do a basic query
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', searchQuery.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      const results: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          results.push(doc.data() as UserProfile);
        }
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!currentUser) return;
    try {
      const requestId = `${currentUser.uid}_${receiverId}`;
      await setDoc(doc(db, 'friend_requests', requestId), {
        senderId: currentUser.uid,
        receiverId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      alert('Solicitud de amistad enviada');
    } catch (error) {
      console.error("Error sending request:", error);
      alert('Error al enviar solicitud');
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'friend_requests', requestId), {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Refresh list
      fetchFriendsAndRequests();
    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!currentUser) return;
    if (!window.confirm('¿Seguro que quieres eliminar a este amigo?')) return;
    
    try {
      // The request ID could be sender_receiver or receiver_sender
      const id1 = `${currentUser.uid}_${friendId}`;
      const id2 = `${friendId}_${currentUser.uid}`;
      
      try {
        await deleteDoc(doc(db, 'friend_requests', id1));
      } catch (e) {}
      try {
        await deleteDoc(doc(db, 'friend_requests', id2));
      } catch (e) {}
      
      fetchFriendsAndRequests();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>Amigos</h1>
            <p className="text-text-muted mt-1">Conecta con otros jugadores y aficionados</p>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors"
          >
            <QrCode className="w-5 h-5" />
            Mi QR
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'friends' ? 'bg-primary text-black' : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            Mis Amigos ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'requests' ? 'bg-primary text-black' : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Solicitudes {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'add' ? 'bg-primary text-black' : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
            Añadir
          </button>
        </div>

        {/* Content */}
        <div className="bg-surface border border-white/10 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'friends' && (
              <motion.div
                key="friends"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-text-muted">Aún no tienes amigos añadidos.</p>
                    <button 
                      onClick={() => setActiveTab('add')}
                      className="mt-4 text-primary font-bold hover:underline"
                    >
                      Buscar amigos
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {friends.map(friend => (
                      <div key={friend.uid} className="bg-background border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                          {friend.photoURL ? (
                            <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50">
                              <Users className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{friend.displayName}</h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-primary font-mono truncate">{friend.username || '@usuario'}</span>
                            <span className="text-text-muted truncate">• {friend.userType || 'Aficionado'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFriend(friend.uid)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                          title="Eliminar amigo"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'requests' && (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-text-muted">No tienes solicitudes pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map(req => (
                      <div key={req.id} className="bg-background border border-white/5 p-4 rounded-xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                          {req.userProfile?.photoURL ? (
                            <img src={req.userProfile.photoURL} alt={req.userProfile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/50">
                              <Users className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{req.userProfile?.displayName}</h3>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-primary font-mono truncate">{req.userProfile?.username || '@usuario'}</span>
                            <span className="text-text-muted truncate">• {req.userProfile?.userType || 'Aficionado'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button 
                            onClick={() => respondToRequest(req.id, 'accepted')}
                            className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg transition-colors"
                            title="Aceptar"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => respondToRequest(req.id, 'rejected')}
                            className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'add' && (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por @usuario..."
                      className="w-full bg-background border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchQuery.trim()}
                    className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                  </button>
                </form>

                <div className="space-y-4">
                  {searchResults.map(user => (
                    <div key={user.uid} className="bg-background border border-white/5 p-4 rounded-xl flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50">
                            <Users className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate">{user.displayName}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-primary font-mono truncate">{user.username || '@usuario'}</span>
                          <span className="text-text-muted truncate">• {user.userType || 'Aficionado'}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendFriendRequest(user.uid)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors text-sm font-bold shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        Añadir
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchQuery && !searching && (
                    <p className="text-center text-text-muted py-8">No se encontraron usuarios con ese nombre.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQR(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full relative text-center"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Añadir Amigo</h3>
              <p className="text-text-muted mb-6">Escanea este código para enviarme una solicitud de amistad.</p>
              
              <div className="bg-white p-4 rounded-xl inline-block mb-6">
                <QRCodeSVG 
                  value={`${window.location.origin}/?addFriend=${currentUser?.uid}`} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="bg-background border border-white/10 rounded-xl p-4">
                <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Tu Usuario</p>
                <p className="text-lg font-mono text-primary font-bold">{userProfile?.username || `@user_${currentUser?.uid.substring(0,6)}`}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
