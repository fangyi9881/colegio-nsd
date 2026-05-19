import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57C21.36 18.1 22.56 15.4 22.56 12.25z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);


const ERRORS: Record<string, string> = {
  'auth/user-not-found': 'No existe cuenta con ese correo.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ese correo ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'Formato de correo inválido.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
  'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo. Prueba otro método.',
  'auth/operation-not-allowed': 'Método no habilitado. Contacta al administrador.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
};

const inputBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const {
    signInWithGoogle,
    signInWithEmail, signUpWithEmail, sendResetEmail,
  } = useAuth();

  const clear = () => {
    setEmail(''); setPassword(''); setName('');
    setError(''); setLoading(false); setResetSent(false);
  };

  const close = () => { clear(); setMode('login'); onClose(); };

  const err = (code: string) => ERRORS[code] ?? 'Error al acceder. Inténtalo de nuevo.';

  const social = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithGoogle();
      close();
    } catch (e: any) {
      const msg = err(e.code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'reset') {
        await sendResetEmail(email);
        setResetSent(true);
      } else if (mode === 'login') {
        await signInWithEmail(email, password);
        close();
      } else {
        if (!name.trim()) { setError('El nombre es requerido.'); setLoading(false); return; }
        await signUpWithEmail(email, password, name.trim());
        close();
      }
    } catch (e: any) {
      setError(err(e.code));
    } finally {
      setLoading(false);
    }
  };

  const SOCIAL = [
    { label: 'Continuar con Google', Icon: GoogleIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(18px)' }}
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm force-dark"
            style={{
              background: '#0b0b0b',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 0 90px rgba(212,175,55,0.07), 0 32px 72px rgba(0,0,0,0.75)',
            }}
          >
            {/* Gold hairlines */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.75),transparent)' }} />
            <button onClick={close} className="absolute top-4 right-4 p-1.5 text-white/25 hover:text-white/65 transition-colors z-10">
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-8 pb-7">
              {/* Logo + title */}
              <div className="flex flex-col items-center mb-7">
                <div className="relative mb-3.5">
                  <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle,rgba(212,175,55,0.25) 0%,transparent 70%)', transform: 'scale(2.6)', filter: 'blur(15px)' }} />
                  <img src="/images/dragon-logo.png" alt="Dragons" className="relative w-11 h-11 object-contain" referrerPolicy="no-referrer" style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))' }} />
                </div>
                <h2 className="text-white font-black uppercase text-sm mb-0.5" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.2em' }}>
                  {mode === 'reset' ? 'Recuperar Acceso' : mode === 'register' ? 'Unirse al Club' : 'Acceder'}
                </h2>
                <p className="text-white/25 text-[9px] font-semibold uppercase" style={{ letterSpacing: '0.26em' }}>Guarida del Dragón</p>
              </div>

              {/* ── Reset sent confirmation ── */}
              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1">Correo enviado</p>
                  <p className="text-white/40 text-xs mb-5">Revisa tu bandeja de entrada para restablecer la contraseña.</p>
                  <button onClick={() => { setMode('login'); setResetSent(false); }} className="text-primary text-xs hover:underline">Volver al inicio de sesión</button>
                </div>

              ) : mode !== 'reset' ? (
                <>
                  {/* ── Social buttons ── */}
                  <div className="flex flex-col gap-2 mb-5">
                    {SOCIAL.map(({ label, Icon }) => (
                      <button
                        key={label}
                        onClick={() => social()}
                        disabled={loading}
                        className="flex items-center gap-3 w-full py-2.5 px-4 text-white/65 hover:text-white text-[13px] font-medium transition-all duration-200 disabled:opacity-40 group"
                        style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.38)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                      >
                        <Icon />
                        <span style={{ letterSpacing: '0.02em' }}>{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Divider ── */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    <span className="text-[9px] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>o con correo</span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  </div>

                  {/* ── Email form ── */}
                  <form onSubmit={submit} className="flex flex-col gap-2.5">
                    {mode === 'register' && (
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="Tu nombre"
                          className="w-full pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-white/22"
                          style={inputBase}
                          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                        />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="Correo electrónico" required
                        className="w-full pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-white/22"
                        style={inputBase}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                      <input
                        type={showPw ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Contraseña" required
                        className="w-full pl-9 pr-10 py-2.5 text-[13px] text-white placeholder-white/22"
                        style={inputBase}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                      />
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/22 hover:text-white/55 transition-colors">
                        {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {error && <p className="text-red-400/80 text-[11px] text-center">{error}</p>}

                    <button
                      type="submit" disabled={loading}
                      className="w-full py-3 bg-primary hover:bg-primary/85 text-black font-bold uppercase text-[11px] transition-all duration-200 hover:shadow-[0_0_28px_rgba(212,175,55,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 mt-0.5"
                      style={{ letterSpacing: '0.18em' }}
                    >
                      {loading
                        ? <span className="w-3.5 h-3.5 border-2 border-black/25 border-t-black rounded-full animate-spin" />
                        : <>{mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}<ArrowRight className="w-3.5 h-3.5" /></>
                      }
                    </button>
                  </form>

                  {mode === 'login' && (
                    <button onClick={() => { setMode('reset'); setError(''); }} className="block mt-3 w-full text-center text-[11px] transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(212,175,55,0.8)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </>

              ) : (
                /* ── Reset form ── */
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <p className="text-white/38 text-xs text-center mb-1">Introduce tu correo para recibir el enlace de restablecimiento.</p>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/22 pointer-events-none" />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Correo electrónico" required
                      className="w-full pl-9 pr-4 py-2.5 text-[13px] text-white placeholder-white/22"
                      style={inputBase}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                  </div>
                  {error && <p className="text-red-400/80 text-[11px] text-center">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-3 bg-primary hover:bg-primary/85 text-black font-bold uppercase text-[11px] transition-all disabled:opacity-50" style={{ letterSpacing: '0.18em' }}>
                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                  </button>
                  <button type="button" onClick={() => setMode('login')} className="text-[11px] text-center transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }} onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')} onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}>
                    Volver al inicio de sesión
                  </button>
                </form>
              )}

              {/* Mode toggle */}
              {!resetSent && mode !== 'reset' && (
                <p className="text-center mt-5 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                  <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} className="text-primary hover:text-primary/75 font-bold transition-colors">
                    {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                  </button>
                </p>
              )}
            </div>

            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.75),transparent)' }} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
