import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, User as UserIcon, Settings, Flame, Shield, Star, Share2, Copy, Check, Users, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useBackToClose } from '../hooks/useBackToClose';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp, writeBatch, doc, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';
import { PROFILE_FRAMES } from '../data/frames';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Timestamp;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<'main' | 'share' | 'notifications'>('main');
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useBackToClose(isOpen, onClose);

  useEffect(() => {
    if (!currentUser || !isOpen || view !== 'notifications') return;

    setLoadingNotifications(true);
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notifs);
      setLoadingNotifications(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
      setLoadingNotifications(false);
    });

    return () => unsubscribe();
  }, [currentUser, isOpen, view]);

  const markAllAsRead = async () => {
    if (!currentUser || notifications.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      const unreadNotifs = notifications.filter(n => !n.read);
      
      if (unreadNotifs.length === 0) return;

      unreadNotifs.forEach(notif => {
        const notifRef = doc(db, 'notifications', notif.id);
        batch.update(notifRef, { read: true });
      });

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const goToProfile = () => {
    onClose();
    navigate('/perfil');
  };

  const handleClose = () => {
    setView('main');
    onClose();
  };

  const referralLink = `${window.location.origin}?ref=${currentUser.uid}`;
  const activeFrame = PROFILE_FRAMES.find(f => f.id === (userProfile?.activeFrame || 'default')) || PROFILE_FRAMES[0];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full relative shadow-2xl overflow-hidden"
          >
            <button 
              onClick={view !== 'main' ? () => setView('main') : handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {view === 'main' ? (
                <motion.div 
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center text-center mt-4"
                >
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-4 ${activeFrame.borderColor} ${activeFrame.glowColor} mb-4 bg-background flex items-center justify-center transition-all duration-500`}>
                    {userProfile?.photoURL || currentUser.photoURL ? (
                      <img 
                        src={userProfile?.photoURL || currentUser.photoURL} 
                        alt={userProfile?.displayName || currentUser.displayName || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="w-12 h-12 text-primary/50" />
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {userProfile?.displayName || currentUser.displayName || 'Usuario Jugador'}
                  </h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary text-black text-[9px] font-bold rounded-full uppercase tracking-wider">{userProfile?.userType || 'Aficionado'}</span>
                    <p className="text-xs text-primary font-mono">{userProfile?.username || `@user_${currentUser.uid.substring(0,6)}`}</p>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary text-black text-[9px] font-bold rounded-full uppercase tracking-wider">Nivel {userProfile?.level || 1}</span>
                    <p className="text-xs text-text-muted">{userProfile?.email || currentUser.email}</p>
                  </div>

                  {/* XP Bar in Modal */}
                  <div className="w-full max-w-[200px] mt-2 mb-6">
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-text-muted mb-1 px-1">
                      <span>XP</span>
                      <span>{userProfile?.xp || 0} / {(userProfile?.level || 1) * 500}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${((userProfile?.xp || 0) / ((userProfile?.level || 1) * 500)) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Streak and Scales Summary */}
                  <div className="grid grid-cols-3 gap-2 w-full mb-6">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <Flame className="w-4 h-4 text-orange-500 mb-1" />
                      <p className="text-[8px] text-text-muted uppercase font-bold tracking-tighter">Racha</p>
                      <p className="text-sm font-bold text-white leading-none">{userProfile?.streakCount || 0}</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <Shield className="w-4 h-4 text-primary mb-1" />
                      <p className="text-[8px] text-text-muted uppercase font-bold tracking-tighter">Escamas</p>
                      <p className="text-sm font-bold text-white leading-none">{userProfile?.totalScales || 0}</p>
                    </div>
                    <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 flex flex-col items-center justify-center text-center">
                      <Star className="w-4 h-4 text-primary mb-1" />
                      <p className="text-[8px] text-primary uppercase font-bold tracking-tighter">Especiales</p>
                      <p className="text-sm font-bold text-primary leading-none">{userProfile?.specialScales || 0}</p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/10 mb-6" />

                  <div className="w-full flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          onClose();
                          navigate('/amigos');
                        }}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                      >
                        <Users className="w-5 h-5" />
                        Amigos
                      </button>

                      <button
                        onClick={() => setView('notifications')}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors relative"
                      >
                        <Bell className="w-5 h-5" />
                        Notis
                        {notifications.some(n => !n.read) && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => setView('share')}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-black hover:bg-primary/90 rounded-xl font-bold transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      Invitar Amigos (+500 XP)
                    </button>

                    <button
                      onClick={goToProfile}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Mi Perfil
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar Sesión
                    </button>
                  </div>
                </motion.div>
              ) : view === 'share' ? (
                <motion.div
                  key="share"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center text-center mt-4"
                >
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Invita y Gana
                  </h3>
                  <p className="text-sm text-text-muted mb-6">
                    Comparte tu código QR o enlace. Si un amigo se registra, ¡ambos ganáis <span className="text-primary font-bold">500 XP</span> y <span className="text-primary font-bold">5 Escamas</span>!
                  </p>

                  <div className="bg-white p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <QRCodeSVG 
                      value={referralLink} 
                      size={200}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"H"}
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full bg-background rounded-xl p-3 flex items-center justify-between border border-white/10 mb-6">
                    <span className="text-xs text-text-muted truncate mr-2">{referralLink}</span>
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    onClick={() => setView('main')}
                    className="w-full py-3 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                  >
                    Volver
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col items-center w-full mt-4"
                >
                  <div className="flex items-center justify-between w-full mb-6">
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
                      Notificaciones
                    </h3>
                    {notifications.some(n => !n.read) && (
                      <button 
                        onClick={markAllAsRead}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors flex items-center gap-1.5"
                        title="Marcar todas como leídas"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Leídas</span>
                      </button>
                    )}
                  </div>

                  <div className="w-full max-h-[350px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                    {loadingNotifications ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-text-muted uppercase font-bold tracking-widest">Cargando...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            notif.read ? 'bg-white/5 border-white/5 opacity-60' : 'bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-full shrink-0 ${
                              notif.type === 'success' ? 'bg-green-500/20 text-green-500' :
                              notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                              notif.type === 'error' ? 'bg-red-500/20 text-red-500' :
                              'bg-primary/20 text-primary'
                            }`}>
                              {notif.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                               notif.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                               notif.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                               <Info className="w-4 h-4" />}
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-white mb-0.5">{notif.title}</p>
                              <p className="text-xs text-text-muted leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] text-text-muted mt-2 font-mono">
                                {notif.createdAt?.toDate().toLocaleString('es-ES', { 
                                  day: '2-digit', 
                                  month: '2-digit', 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="w-12 h-12 text-white/10 mb-4" />
                        <p className="text-sm text-text-muted">No tienes notificaciones aún.</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setView('main')}
                    className="w-full mt-6 py-3 px-4 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-colors"
                  >
                    Volver
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
