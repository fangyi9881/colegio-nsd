import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Home, Newspaper, Users, Calendar, Instagram, MessageCircle, ChevronRight, Phone, LogIn, User as UserIcon, Flame } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBackToClose } from '../hooks/useBackToClose';
import { useAuth } from '../contexts/AuthContext';
import UserProfileModal from './UserProfileModal';
import GuaridaModal from './GuaridaModal';
import { PROFILE_FRAMES } from '../data/frames';

interface NavbarProps {
  onOpenJoinForm?: () => void;
}

export default function Navbar({ onOpenJoinForm }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGuaridaOpen, setIsGuaridaOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile, signInWithGoogle, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  const activeFrame = PROFILE_FRAMES.find(f => f.id === (userProfile?.activeFrame || 'default')) || PROFILE_FRAMES[0];

  useEffect(() => {
    if (location.hash === '#guarida') {
      setIsGuaridaOpen(true);
      // Optional: clear hash to prevent re-opening on refresh if that's not desired
      // navigate(location.pathname, { replace: true });
    }
  }, [location.hash]);

  useEffect(() => {
    if (currentUser && !loading) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, loading]);

  // Handle native back button to close mobile menu
  useBackToClose(isOpen, () => setIsOpen(false));

  const navLinks = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Noticias', href: '/#noticias', icon: Newspaper },
    { name: 'Calendario', href: '/#calendario', icon: Calendar },
    { name: 'Plantilla', href: '/#equipos', icon: Users },
    { name: 'Guarida', href: '/#guarida', icon: Flame, isModal: true },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    // Close the menu first
    setIsOpen(false);

    if (link.isModal) {
      e.preventDefault();
      setIsGuaridaOpen(true);
      return;
    }

    const href = link.href;

    // Use a timeout to allow the menu closing animation and overflow reset to happen
    // before attempting to scroll, ensuring smooth scrolling works on mobile.
    setTimeout(() => {
      if (href.startsWith('/#')) {
        const id = href.substring(2);
        if (location.pathname === '/') {
          e.preventDefault();
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else if (href === '/') {
        if (location.pathname === '/') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (href === location.pathname) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <>
      <nav className="fixed top-[34px] left-0 right-0 z-50 bg-background/80 backdrop-blur-md force-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" onClick={(e) => { if (location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <img src="https://i.imgur.com/OP6BbHs.png" alt="DD Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" referrerPolicy="no-referrer" />
            </div>
            <span className="text-base sm:text-xl font-bold text-white uppercase tracking-wider block leading-tight whitespace-nowrap" style={{ fontFamily: 'var(--font-display)' }}>
              Dolores Dragons
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={(e) => handleNavClick(e, link)}
                className={`transition-colors font-medium text-sm uppercase tracking-wider ${
                  location.pathname === link.href ? 'text-primary' : 'text-text-muted hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-3 border-l border-white/10 pl-6 ml-2">
              <a href="https://www.instagram.com/doloresdragons/" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-primary transition-colors p-2">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/34646794962" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-primary transition-colors p-2">
                <MessageCircle className="w-5 h-5" />
              </a>
              <button 
                onClick={onOpenJoinForm}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-[#000000] rounded-full font-bold text-sm transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] ml-2"
              >
                Únete
              </button>
              
              {loading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : currentUser ? (
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {showWelcome && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="hidden lg:block text-right"
                      >
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">¡Hola de nuevo!</p>
                        <p className="text-xs font-bold text-white truncate max-w-[100px]">{userProfile?.displayName?.split(' ')[0] || currentUser.displayName?.split(' ')[0]}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="hidden lg:flex flex-col items-end mr-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Nivel {userProfile?.level || 1}</span>
                    <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${((userProfile?.xp || 0) / ((userProfile?.level || 1) * 500)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 ${activeFrame.borderColor} ${activeFrame.glowColor} hover:scale-110 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 relative bg-background shadow-lg`}
                  >
                    {userProfile?.photoURL || currentUser.photoURL ? (
                      <img src={userProfile?.photoURL || currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-surface flex items-center justify-center text-primary">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-primary bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10"
                  title="Iniciar Sesión"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Entrar</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button & Profile */}
          <div className="flex items-center gap-3 md:hidden">
            {loading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : currentUser ? (
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className={`w-8 h-8 rounded-full overflow-hidden border-2 ${activeFrame.borderColor} ${activeFrame.glowColor} bg-background relative`}
              >
                {userProfile?.photoURL || currentUser.photoURL ? (
                  <img src={userProfile?.photoURL || currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-surface flex items-center justify-center text-primary">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-white/70 hover:text-primary bg-white/5 rounded-full border border-white/10"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Entrar</span>
              </button>
            )}
            <button
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl shadow-2xl overflow-y-auto"
            style={{ height: 'auto', maxHeight: 'calc(100vh - 80px)' }}
          >
            <div className="container mx-auto px-6 py-6 flex flex-col">
              {/* Links */}
              <div className="flex flex-col gap-2">
                {/* Profile Link in Mobile Menu */}
                {currentUser && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0 }}
                    onClick={() => {
                      setIsOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="flex items-center gap-4 py-4 text-white/70 hover:text-primary group"
                  >
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {userProfile?.photoURL || currentUser.photoURL ? (
                        <img src={userProfile?.photoURL || currentUser.photoURL} alt="Profile" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                      Mi Perfil
                    </span>
                  </motion.button>
                )}

                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (i + 1) * 0.05 }}
                    >
                      <Link
                        to={link.href}
                        className={`flex items-center justify-between py-4 group ${
                          location.pathname === link.href ? 'text-primary' : 'text-white/70 hover:text-primary'
                        }`}
                        onClick={(e) => handleNavClick(e, link)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full transition-colors ${
                            location.pathname === link.href 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-transparent text-white/40 group-hover:text-primary'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                            {link.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer / Socials */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 pt-6"
              >
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    onOpenJoinForm?.();
                  }}
                  className="w-full py-4 border border-primary/30 hover:bg-primary hover:text-[#000000] text-primary rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all mb-8"
                >
                  Únete al Club
                </button>
                
                <div className="flex items-center justify-center gap-6 text-white/40">
                  <a href="https://www.instagram.com/doloresdragons/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><Instagram className="w-5 h-5" /></a>
                  <a href="https://wa.me/34646794962" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:scale-110 transform"><MessageCircle className="w-5 h-5" /></a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    {/* User Profile Modal */}
    <UserProfileModal 
      isOpen={isProfileModalOpen} 
      onClose={() => setIsProfileModalOpen(false)} 
    />

    {/* Guarida Modal */}
    <GuaridaModal
      isOpen={isGuaridaOpen}
      onClose={() => setIsGuaridaOpen(false)}
    />
    </>
  );
}
