import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, MapPin, Mail, Phone, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { LegalType } from './LegalModal';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';

interface FooterProps {
  onOpenJoinForm?: () => void;
  onOpenLegal?: (type: LegalType) => void;
}

export default function Footer({ onOpenJoinForm, onOpenLegal }: FooterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      // Check if already subscribed (this might fail due to permissions, we catch it)
      try {
        const q = query(collection(db, 'subscribers'), where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setStatus('success');
          setEmail('');
          setTimeout(() => setStatus('idle'), 5000);
          return;
        }
      } catch (err) {
        console.warn('Could not check for existing subscription (likely permissions):', err);
        // We continue to addDoc anyway
      }

      try {
        await addDoc(collection(db, 'subscribers'), {
          email: email.toLowerCase(),
          subscribedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'subscribers');
      }

      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };
  return (
    <footer id="contacto" className="bg-black pt-16 md:pt-20 pb-8 md:pb-10 relative overflow-hidden force-dark" style={{ borderTop: '1px solid rgba(212,175,55,0.18)' }}>
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0">
                <img src="https://i.imgur.com/OP6BbHs.png" alt="DD Logo" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                Dolores Dragons
              </span>
            </Link>
            <p className="text-sm md:text-base text-text-muted mb-6">
              Forjando leyendas en la cancha desde 1957. <button onClick={onOpenJoinForm} className="text-primary hover:underline">Únete al club</button> de baloncesto más exclusivo y domina el juego con nosotros.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/doloresdragons/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-white hover:bg-primary hover:text-[#000000] hover:border-primary transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/34646794962" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-white hover:bg-primary hover:text-[#000000] hover:border-primary transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-bold uppercase mb-4 md:mb-6" style={{ fontSize: '0.62rem', letterSpacing: '0.3em', fontFamily: 'var(--font-display)' }}>
              El Club
            </h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm md:text-base text-text-muted hover:text-primary transition-colors">Inicio</Link></li>
              <li><a href="#equipos" className="text-sm md:text-base text-text-muted hover:text-primary transition-colors">Nuestra Plantilla</a></li>
              <li><a href="#historia" className="text-sm md:text-base text-text-muted hover:text-primary transition-colors">Historia del Club</a></li>
              <li><a href="#calendario" className="text-sm md:text-base text-text-muted hover:text-primary transition-colors">Calendario y Resultados</a></li>
              <li><a href="#media" className="text-sm md:text-base text-text-muted hover:text-primary transition-colors">Galería Multimedia</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-bold uppercase mb-4 md:mb-6" style={{ fontSize: '0.62rem', letterSpacing: '0.3em', fontFamily: 'var(--font-display)' }}>
              Contacto
            </h4>
            <ul className="flex flex-col gap-3 md:gap-4">
              <li className="flex items-start gap-3 text-sm md:text-base text-text-muted">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                <a 
                  href="https://maps.app.goo.gl/qdZukKnonRvUNfnF9" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors hover:underline"
                >
                  DOLORES DRAGONS
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm md:text-base text-text-muted">
                <Phone className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                <a href="tel:+34646794962" className="hover:text-primary transition-colors hover:underline">
                  +34 646 794 962
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm md:text-base text-text-muted">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                <a href="https://wa.me/34646794962" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm md:text-base text-text-muted">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                <a href="mailto:basketnsd@gmail.com" className="hover:text-primary transition-colors hover:underline">
                  basketnsd@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="text-white font-bold uppercase mb-4 md:mb-6" style={{ fontSize: '0.62rem', letterSpacing: '0.3em', fontFamily: 'var(--font-display)' }}>
              Newsletter
            </h4>
            <p className="text-sm md:text-base text-text-muted mb-4">
              Suscríbete para recibir las últimas noticias, resultados y ofertas exclusivas.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  placeholder="Tu correo electrónico" 
                  className="w-full bg-background rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base text-white focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                {status === 'success' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={status !== 'idle'}
                className="bg-primary hover:bg-primary/90 text-[#000000] font-bold rounded-lg px-4 py-2.5 md:py-3 transition-all uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'success' ? (
                  '¡Suscrito!'
                ) : status === 'error' ? (
                  'Error'
                ) : (
                  'Suscribirse'
                )}
              </button>
              {status === 'success' && (
                <p className="text-[10px] text-primary uppercase tracking-widest font-bold animate-pulse">
                  ¡Bienvenido a la familia Dragons!
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left" style={{ borderTop: '1px solid rgba(212,175,55,0.1)' }}>
          <p className="text-text-muted text-xs md:text-sm">
            &copy; {new Date().getFullYear()} Dolores Dragons. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4 md:gap-6 text-xs md:text-sm text-text-muted">
            <button onClick={() => onOpenLegal?.('privacidad')} className="hover:text-primary transition-colors">Política de Privacidad</button>
            <button onClick={() => onOpenLegal?.('terminos')} className="hover:text-primary transition-colors">Términos Legales</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
