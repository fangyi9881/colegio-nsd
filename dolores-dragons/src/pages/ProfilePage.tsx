import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';
import { Save, User as UserIcon, Shield, Loader2, Key, CheckCircle, Plus, Users, X, Camera, Palette, ShoppingBag } from 'lucide-react';
import { Flame, Star, Zap } from 'lucide-react';
import { PROFILE_FRAMES } from '../data/frames';
import { getTotalXPForLevel, getXPForNextLevel } from '../utils/gamification';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  phone?: string;
  category?: string;
  position?: string;
  height?: string;
  isVerifiedPlayer?: boolean;
  teamCode?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  birthDate?: string;
  weight?: string;
  jerseyNumber?: string;
  username?: string;
  userType?: string;
  // Child data (for parents)
  childFirstName?: string;
  childLastName?: string;
  childDni?: string;
  childBirthDate?: string;
  childCategory?: string;
  childPosition?: string;
  childJerseyNumber?: string;
  childHeight?: string;
  childWeight?: string;
  streakCount?: number;
  totalScales?: number;
  specialScales?: number;
  xp?: number;
  level?: number;
  ownedFrames?: string[];
  activeFrame?: string;
}

interface TeamCode {
  id: string;
  category: string;
  role: string;
}

export default function ProfilePage() {
  const { currentUser, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [teamCode, setTeamCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [codeMessage, setCodeMessage] = useState({ text: '', type: '' });

  // Admin state
  const [adminCodes, setAdminCodes] = useState<TeamCode[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newCodeCategory, setNewCodeCategory] = useState('');
  const [newCodeRole, setNewCodeRole] = useState('player');
  const [creatingCode, setCreatingCode] = useState(false);
  
  // Photo state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFrameSelector, setShowFrameSelector] = useState(false);

  const activeFrame = PROFILE_FRAMES.find(f => f.id === (profile?.activeFrame || 'default')) || PROFILE_FRAMES[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfile(prev => prev ? { ...prev, photoURL: dataUrl } : null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          // Backfill firstName/lastName from fullName for existing users
          if (!data.firstName && !data.lastName && data.fullName) {
            const parts = data.fullName.trim().split(/\s+/);
            data.firstName = parts[0] || '';
            data.lastName = parts.slice(1).join(' ') || '';
          }
          setProfile(data);

          // Backfill public profile if verified but doesn't exist
          if (data.isVerifiedPlayer) {
            const publicRef = doc(db, 'public_profiles', currentUser.uid);
            const publicSnap = await getDoc(publicRef);
            if (!publicSnap.exists()) {
              await setDoc(publicRef, {
                uid: currentUser.uid,
                displayName: data.displayName || '',
                fullName: data.fullName || '',
                photoURL: data.photoURL || '',
                category: data.category || '',
                position: data.position || '',
                height: data.height || '',
                weight: data.weight || '',
                birthDate: data.birthDate || '',
                jerseyNumber: data.jerseyNumber || '',
                isVerifiedPlayer: true,
                teamCode: data.teamCode || ''
              });
            }
          }

          // If admin, fetch existing codes
          if (currentUser.email === 'basketnsd@gmail.com') {
            const codesSnapshot = await getDocs(collection(db, 'team_codes'));
            const codes: TeamCode[] = [];
            codesSnapshot.forEach(doc => {
              codes.push({ id: doc.id, ...doc.data() } as TeamCode);
            });
            setAdminCodes(codes);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profile) return;

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const firstName = profile.firstName || '';
      const lastName = profile.lastName || '';
      const isParent = profile.userType === 'Padre/Madre';
      const profileData = {
        phone: profile.phone || '',
        category: profile.category || '',
        position: profile.position || '',
        height: profile.height || '',
        displayName: profile.displayName || '',
        firstName,
        lastName,
        fullName: [firstName, lastName].filter(Boolean).join(' ') || profile.fullName || '',
        dni: profile.dni || '',
        birthDate: profile.birthDate || '',
        weight: profile.weight || '',
        jerseyNumber: profile.jerseyNumber || '',
        photoURL: profile.photoURL || '',
        username: profile.username || '',
        userType: profile.userType || '',
        ...(isParent && {
          childFirstName: profile.childFirstName || '',
          childLastName: profile.childLastName || '',
          childDni: profile.childDni || '',
          childBirthDate: profile.childBirthDate || '',
          childCategory: profile.childCategory || '',
          childPosition: profile.childPosition || '',
          childJerseyNumber: profile.childJerseyNumber || '',
          childHeight: profile.childHeight || '',
          childWeight: profile.childWeight || '',
        }),
      };
      await updateDoc(userRef, profileData);

      // Sync with public_profiles if verified
      if (profile.isVerifiedPlayer) {
        const publicRef = doc(db, 'public_profiles', currentUser.uid);
        await setDoc(publicRef, {
          uid: currentUser.uid,
          displayName: profile.displayName || '',
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          fullName: profileData.fullName,
          photoURL: profile.photoURL || '',
          category: profile.category || '',
          position: profile.position || '',
          height: profile.height || '',
          weight: profile.weight || '',
          birthDate: profile.birthDate || '',
          jerseyNumber: profile.jerseyNumber || '',
          isVerifiedPlayer: true,
          teamCode: profile.teamCode || ''
        });
      }

      // Also update Firebase Auth profile
      await updateUserProfile({
        displayName: profile.displayName || currentUser.displayName || '',
        photoURL: profile.photoURL || currentUser.photoURL || ''
      });

      setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      setMessage({ text: 'Error al actualizar el perfil', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !teamCode.trim()) return;

    setVerifyingCode(true);
    setCodeMessage({ text: '', type: '' });

    try {
      const codeRef = doc(db, 'team_codes', teamCode.trim().toUpperCase());
      const codeSnap = await getDoc(codeRef);

      if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        const userRef = doc(db, 'users', currentUser.uid);
        
        const updates = {
          isVerifiedPlayer: true,
          teamCode: teamCode.trim().toUpperCase(),
          category: codeData.category,
          role: codeData.role || 'player'
        };

        await updateDoc(userRef, updates);
        
        // Sync with public_profiles
        const publicRef = doc(db, 'public_profiles', currentUser.uid);
        await setDoc(publicRef, {
          uid: currentUser.uid,
          displayName: profile.displayName || '',
          fullName: profile.fullName || '',
          photoURL: profile.photoURL || '',
          category: codeData.category,
          position: profile.position || '',
          height: profile.height || '',
          weight: profile.weight || '',
          birthDate: profile.birthDate || '',
          jerseyNumber: profile.jerseyNumber || '',
          isVerifiedPlayer: true,
          teamCode: teamCode.trim().toUpperCase()
        });

        setProfile(prev => prev ? { ...prev, ...updates } : null);
        setCodeMessage({ text: `¡Código verificado! Te has unido a ${codeData.category}`, type: 'success' });
        setTeamCode('');
      } else {
        setCodeMessage({ text: 'Código de equipo inválido o expirado.', type: 'error' });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      setCodeMessage({ text: 'Error al verificar el código.', type: 'error' });
    } finally {
      setVerifyingCode(false);
    }
  };

  const [adminMessage, setAdminMessage] = useState({ text: '', type: '' });

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newCodeCategory) return;

    setCreatingCode(true);
    setAdminMessage({ text: '', type: '' });
    try {
      const codeId = newCode.trim().toUpperCase();
      await setDoc(doc(db, 'team_codes', codeId), {
        category: newCodeCategory,
        role: newCodeRole
      });
      
      setAdminCodes(prev => [...prev, { id: codeId, category: newCodeCategory, role: newCodeRole }]);
      setNewCode('');
      setNewCodeCategory('');
      setAdminMessage({ text: 'Código creado correctamente', type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `team_codes/${newCode.trim().toUpperCase()}`);
      setAdminMessage({ text: 'Error al crear el código', type: 'error' });
    } finally {
      setCreatingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser || !profile) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <p className="text-white">Debes iniciar sesión para ver esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto space-y-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Close Button */}
          <button 
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors z-20 flex items-center gap-2 group"
            title="Volver al inicio"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Cerrar</span>
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-white/5 px-6 py-8 sm:p-10 border-b border-white/10 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 ${activeFrame.borderColor} ${activeFrame.glowColor} bg-background flex items-center justify-center shrink-0 transition-all duration-500`}>
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-primary/50" />
                )}
              </div>
              
              {/* Photo Edit Overlay */}
              <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  title="Subir foto"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => setShowFrameSelector(!showFrameSelector)}
                  className="p-2 bg-primary/20 hover:bg-primary/40 rounded-full text-primary transition-colors"
                  title="Cambiar Marco"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              {/* Frame Selector Dropdown */}
              {showFrameSelector && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-surface border border-white/10 rounded-2xl shadow-2xl p-4 z-30"
                >
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Tus Marcos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {PROFILE_FRAMES.filter(f => profile.ownedFrames?.includes(f.id)).map(frame => (
                      <button
                        key={frame.id}
                        onClick={async () => {
                          if (!currentUser) return;
                          try {
                            const userRef = doc(db, 'users', currentUser.uid);
                            await updateDoc(userRef, { activeFrame: frame.id });
                            setProfile(prev => prev ? { ...prev, activeFrame: frame.id } : null);
                            setShowFrameSelector(false);
                          } catch (err) {
                            console.error("Error updating frame:", err);
                          }
                        }}
                        className={`w-10 h-10 rounded-full border-2 ${frame.borderColor} ${frame.glowColor} overflow-hidden bg-background relative group/frame`}
                        title={frame.name}
                      >
                        <img src={profile.photoURL || "https://picsum.photos/seed/dragon/50/50"} className="w-full h-full object-cover opacity-50 group-hover/frame:opacity-100 transition-opacity" />
                        {profile.activeFrame === frame.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                    <button 
                      onClick={() => navigate('/#guarida')}
                      className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 hover:text-primary hover:border-primary transition-all"
                      title="Ir a la tienda"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {profile.displayName || 'Usuario'}
              </h1>
              <p className="text-text-muted">{profile.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5" />
                  {profile.role === 'admin' ? 'Administrador' : profile.role === 'player' ? 'Jugador' : profile.role === 'coach' ? 'Entrenador' : 'Usuario'}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-black text-xs font-bold uppercase tracking-wider">
                  Nivel {profile.level || 1}
                </div>
                {profile.isVerifiedPlayer && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium uppercase tracking-wider">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Plantilla: {profile.category}
                  </div>
                )}
              </div>

              {/* Gamification Stats */}
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                    <Flame className="w-5 h-5 text-orange-500 mb-1" />
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Racha</span>
                    <span className="text-lg font-bold text-white leading-none">{profile.streakCount || 0}</span>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
                    <Shield className="w-5 h-5 text-primary mb-1" />
                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Escamas</span>
                    <span className="text-lg font-bold text-white leading-none">{profile.totalScales || 0}</span>
                  </div>
                  <div className="bg-primary/5 rounded-2xl p-3 border border-primary/20 flex flex-col items-center justify-center text-center">
                    <Star className="w-5 h-5 text-primary mb-1 animate-pulse" />
                    <span className="text-[10px] text-primary uppercase font-bold tracking-tighter">Especiales</span>
                    <span className="text-lg font-bold text-primary leading-none">{profile.specialScales || 0}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Experiencia</span>
                    <span>{profile.xp || 0} / {getTotalXPForLevel((profile.level || 1) + 1)} XP</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, Math.max(0, 
                          ((profile.xp || 0) - getTotalXPForLevel(profile.level || 1)) / 
                          getXPForNextLevel(profile.level || 1) * 100
                        ))}%` 
                      }}
                      className="h-full bg-primary shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                    />
                  </div>
                  <p className="text-[9px] text-text-muted text-right italic px-1">
                    {getXPForNextLevel(profile.level || 1) - ((profile.xp || 0) - getTotalXPForLevel(profile.level || 1))} XP para el siguiente nivel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Usuario (@)</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username || ''}
                  onChange={handleChange}
                  placeholder="Ej: @juanperez"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">¿Quién eres?</label>
                <select
                  name="userType"
                  value={profile.userType || ''}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Jugador">Jugador/a</option>
                  <option value="Padre/Madre">Padre / Madre</option>
                  <option value="Entrenador">Entrenador/a</option>
                  <option value="Aficionado">Aficionado/a</option>
                  <option value="Directivo">Directivo/a</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Nombre</label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName || ''}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Apellidos</label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName || ''}
                  onChange={handleChange}
                  placeholder="Ej: Pérez García"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Apodo / Nombre en el club</label>
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName || ''}
                  onChange={handleChange}
                  placeholder="Ej: Juanpe"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">DNI / NIE</label>
                <input
                  type="text"
                  name="dni"
                  value={profile.dni || ''}
                  onChange={handleChange}
                  placeholder="Ej: 12345678A"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Correo Electrónico</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed"
                />
                <p className="text-xs text-white/30">El correo está vinculado a tu cuenta de acceso.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Fecha de Nacimiento</label>
                <input
                  type="date"
                  name="birthDate"
                  value={profile.birthDate || ''}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  placeholder="+34 600 000 000"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Categoría</label>
                <select
                  name="category"
                  value={profile.category || ''}
                  onChange={handleChange}
                  disabled={profile.isVerifiedPlayer} // Disabled if verified
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Cadete Femenino">Cadete Femenino</option>
                  <option value="Alevín Mixto">Alevín Mixto</option>
                  <option value="Senior Masculino">Senior Masculino</option>
                  <option value="Senior Femenino">Senior Femenino</option>
                  <option value="Junior">Junior</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Benjamín">Benjamín</option>
                  <option value="Aficionado">Aficionado / Fan</option>
                </select>
                {profile.isVerifiedPlayer && (
                  <p className="text-xs text-green-400 mt-1">Categoría verificada por el club.</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Posición en la cancha</label>
                <select
                  name="position"
                  value={profile.position || ''}
                  onChange={handleChange}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Selecciona tu posición</option>
                  <option value="Base">Base (PG)</option>
                  <option value="Escolta">Escolta (SG)</option>
                  <option value="Alero">Alero (SF)</option>
                  <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                  <option value="Pívot">Pívot (C)</option>
                  <option value="N/A">No juego</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Dorsal</label>
                <input
                  type="number"
                  name="jerseyNumber"
                  value={profile.jerseyNumber || ''}
                  onChange={handleChange}
                  placeholder="Ej: 23"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={profile.height || ''}
                  onChange={handleChange}
                  placeholder="Ej: 185"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={profile.weight || ''}
                  onChange={handleChange}
                  placeholder="Ej: 80"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Child data section — only for parents */}
            {profile.userType === 'Padre/Madre' && (
              <div className="border border-primary/20 rounded-2xl p-6 space-y-6 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">H</div>
                  <div>
                    <h3 className="text-base font-bold text-white">Datos del/la hijo/a</h3>
                    <p className="text-xs text-white/40">Datos del jugador/a que representa en el club</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Nombre</label>
                    <input
                      type="text"
                      name="childFirstName"
                      value={profile.childFirstName || ''}
                      onChange={handleChange}
                      placeholder="Ej: Carlos"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Apellidos</label>
                    <input
                      type="text"
                      name="childLastName"
                      value={profile.childLastName || ''}
                      onChange={handleChange}
                      placeholder="Ej: Pérez García"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">DNI / NIE</label>
                    <input
                      type="text"
                      name="childDni"
                      value={profile.childDni || ''}
                      onChange={handleChange}
                      placeholder="Ej: 12345678A"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="childBirthDate"
                      value={profile.childBirthDate || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Categoría</label>
                    <select
                      name="childCategory"
                      value={profile.childCategory || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="Benjamín">Benjamín</option>
                      <option value="Alevín Mixto">Alevín Mixto</option>
                      <option value="Infantil">Infantil</option>
                      <option value="Cadete Femenino">Cadete Femenino</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior Masculino">Senior Masculino</option>
                      <option value="Senior Femenino">Senior Femenino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Posición</label>
                    <select
                      name="childPosition"
                      value={profile.childPosition || ''}
                      onChange={handleChange}
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                      <option value="">Selecciona posición</option>
                      <option value="Base">Base (PG)</option>
                      <option value="Escolta">Escolta (SG)</option>
                      <option value="Alero">Alero (SF)</option>
                      <option value="Ala-Pívot">Ala-Pívot (PF)</option>
                      <option value="Pívot">Pívot (C)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Dorsal</label>
                    <input
                      type="number"
                      name="childJerseyNumber"
                      value={profile.childJerseyNumber || ''}
                      onChange={handleChange}
                      placeholder="Ej: 10"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Altura (cm)</label>
                    <input
                      type="number"
                      name="childHeight"
                      value={profile.childHeight || ''}
                      onChange={handleChange}
                      placeholder="Ej: 155"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">Peso (kg)</label>
                    <input
                      type="number"
                      name="childWeight"
                      value={profile.childWeight || ''}
                      onChange={handleChange}
                      placeholder="Ej: 50"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-[#000000] rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>

        {/* Team Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Código de Plantilla</h2>
              <p className="text-sm text-text-muted">Si eres jugador o entrenador, introduce el código proporcionado por el club.</p>
            </div>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            {codeMessage.text && (
              <div className={`p-4 rounded-xl text-sm font-medium ${
                codeMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {codeMessage.text}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Ej: CADETE-FEM-25"
                className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={verifyingCode || !teamCode.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {verifyingCode ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verificar Código'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Admin Section */}
        {currentUser.email === 'basketnsd@gmail.com' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface border border-primary/30 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
                <p className="text-sm text-text-muted">Gestiona los códigos de acceso para las plantillas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Create Code Form */}
              <form onSubmit={handleCreateCode} className="space-y-4 bg-background p-5 rounded-xl border border-white/5">
                <h3 className="font-bold text-white mb-4">Crear Nuevo Código</h3>
                
                {adminMessage.text && (
                  <div className={`p-3 rounded-lg text-xs font-medium ${
                    adminMessage.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {adminMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Código (ej: CADETE-25)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary uppercase"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Categoría Asignada</label>
                  <select
                    value={newCodeCategory}
                    onChange={(e) => setNewCodeCategory(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Cadete Femenino">Cadete Femenino</option>
                    <option value="Alevín Mixto">Alevín Mixto</option>
                    <option value="Senior Masculino">Senior Masculino</option>
                    <option value="Senior Femenino">Senior Femenino</option>
                    <option value="Junior">Junior</option>
                    <option value="Infantil">Infantil</option>
                    <option value="Benjamín">Benjamín</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Rol Asignado</label>
                  <select
                    value={newCodeRole}
                    onChange={(e) => setNewCodeRole(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary"
                  >
                    <option value="player">Jugador</option>
                    <option value="coach">Entrenador</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingCode || !newCode || !newCodeCategory}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-[#000000] rounded-lg text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {creatingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Crear Código
                </button>
              </form>

              {/* Existing Codes */}
              <div>
                <h3 className="font-bold text-white mb-4">Códigos Activos</h3>
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                  {adminCodes.length === 0 ? (
                    <p className="text-sm text-text-muted italic">No hay códigos creados.</p>
                  ) : (
                    adminCodes.map(code => (
                      <div key={code.id} className="bg-background border border-white/5 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-mono text-primary font-bold text-sm">{code.id}</p>
                          <p className="text-xs text-text-muted">{code.category} • {code.role === 'coach' ? 'Entrenador' : 'Jugador'}</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const { deleteDoc, doc } = await import('firebase/firestore');
                              await deleteDoc(doc(db, 'team_codes', code.id));
                              setAdminCodes(prev => prev.filter(c => c.id !== code.id));
                              setAdminMessage({ text: 'Código eliminado', type: 'success' });
                            } catch (error) {
                              console.error('Error deleting code:', error);
                              setAdminMessage({ text: 'Error al eliminar', type: 'error' });
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Eliminar código"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
