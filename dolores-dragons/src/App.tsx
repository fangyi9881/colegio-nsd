import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JoinForm from './components/JoinForm';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import PlayerStatsPage from './pages/PlayerStatsPage';
import FriendsPage from './pages/FriendsPage';
import Chatbot from './components/Chatbot';
import LegalModal, { LegalType } from './components/LegalModal';
import StreakDisplay from './components/StreakDisplay';
import CustomCursor from './components/CustomCursor';
import SchoolTopbar from './components/SchoolTopbar';

import { AuthProvider } from './contexts/AuthContext';
import { GamificationProvider } from './contexts/GamificationContext';

export default function App() {
  const [isJoinFormOpen, setIsJoinFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [legalModal, setLegalModal] = useState<{ isOpen: boolean; type: LegalType }>({
    isOpen: false,
    type: 'privacidad'
  });

  const openLegal = (type: LegalType) => {
    setLegalModal({ isOpen: true, type });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GamificationProvider>
      <Router basename="/baloncesto-nsd">
        <SchoolTopbar />
        <CustomCursor />
        <ScrollToTop />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="preloader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: "-100%" }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-[99997] bg-black flex items-center justify-center"
              style={{ willChange: "transform, opacity" }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative flex items-center justify-center"
              >
                {/* Optimized glow effect using radial gradient instead of expensive CSS blur */}
                <div className="absolute w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.25)_0%,transparent_70%)] rounded-full pointer-events-none" />
                
                <motion.div 
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
                  className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center relative z-10"
                  style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                >
                  <img 
                    src="https://i.imgur.com/OP6BbHs.png" 
                    alt="DD Logo" 
                    className="w-full h-full object-contain"
                    style={{ willChange: "transform" }}
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="min-h-screen bg-background text-text overflow-hidden">
          <Navbar onOpenJoinForm={() => setIsJoinFormOpen(true)} />
          
          <Routes>
            <Route path="/" element={<HomePage onOpenJoinForm={() => setIsJoinFormOpen(true)} />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/estadisticas" element={<PlayerStatsPage />} />
            <Route path="/amigos" element={<FriendsPage />} />
          </Routes>

          <Footer 
            onOpenJoinForm={() => setIsJoinFormOpen(true)} 
            onOpenLegal={openLegal}
          />
          <StreakDisplay />
          <Chatbot />

          <LegalModal 
            isOpen={legalModal.isOpen}
            type={legalModal.type}
            onClose={() => setLegalModal(prev => ({ ...prev, isOpen: false }))}
            setType={(type) => setLegalModal(prev => ({ ...prev, type }))}
          />

          <AnimatePresence>
            {isJoinFormOpen && <JoinForm onClose={() => setIsJoinFormOpen(false)} />}
          </AnimatePresence>
        </main>
      </Router>
    </GamificationProvider>
  );
}
