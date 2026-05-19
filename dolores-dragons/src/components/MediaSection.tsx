import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Instagram, Heart, MessageCircle, Send, Bookmark, ChevronLeft, ChevronRight, MoreHorizontal, Settings } from 'lucide-react';
import { useBackToClose } from '../hooks/useBackToClose';

export default function MediaSection() {
  const [selectedPost, setSelectedPost] = useState<any>(null);
  
  // Widget Integration State
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [tempWidgetId, setTempWidgetId] = useState('');

  const handleSaveWidget = () => {
    if (tempWidgetId.trim()) {
      // Extract ID if user pasted the whole div or script
      let finalId = tempWidgetId.trim();
      const match = finalId.match(/elfsight-app-([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        finalId = match[1];
      }
      
      localStorage.setItem('dolores_ig_widget_id', finalId);
      setIsSetupOpen(false);
    }
  };

  const handleRemoveWidget = () => {
    localStorage.removeItem('dolores_ig_widget_id');
    setIsSetupOpen(false);
  };

  useBackToClose(!!selectedPost, () => setSelectedPost(null));
  useBackToClose(isSetupOpen, () => setIsSetupOpen(false));

  const instagramPosts = [
    { 
      id: 1, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1000', 
      caption: '¡Gran victoria en el derbi de hoy! 🐉🔥 Increíble esfuerzo de todo el equipo. Gracias a la afición por el apoyo incondicional. #DoloresDragons #Baloncesto #Victoria',
      likes: '342',
      comments: '28',
      date: 'HACE 2 DÍAS'
    },
    { 
      id: 2, 
      type: 'video', 
      url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&q=80&w=600', 
      videoUrl: 'https://cdn.pixabay.com/video/2020/05/25/40144-424917419_large.mp4',
      caption: 'Highlights de la Jornada 7 🎬. Seguimos trabajando duro para el próximo partido. 💪🏀 #GoDragons #Highlights',
      likes: '512',
      comments: '45',
      date: 'HACE 5 DÍAS'
    },
    { 
      id: 3, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=600', 
      caption: 'Sesión de tiro matutina. La preparación es la clave del éxito. 🎯 #Entrenamiento #Focus',
      likes: '289',
      comments: '12',
      date: 'HACE 1 SEMANA'
    },
    { 
      id: 4, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=800', 
      caption: 'Nuestra afición, nuestro sexto jugador. ¡Gracias por llenar las gradas! 🏟️🙌 #FamiliaDragons',
      likes: '675',
      comments: '56',
      date: 'HACE 2 SEMANAS'
    },
    { 
      id: 5, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1574629810360-7efbb1925536?auto=format&fit=crop&q=80&w=800', 
      caption: 'Concentración máxima antes del salto inicial. 🧠⚡ #Gameday',
      likes: '421',
      comments: '19',
      date: 'HACE 2 SEMANAS'
    },
    { 
      id: 6, 
      type: 'video', 
      url: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&q=80&w=600', 
      videoUrl: 'https://cdn.pixabay.com/video/2019/03/21/22138-324586022_large.mp4',
      caption: '¡La jugada del mes! 🤯 Asistencia sin mirar y mate espectacular. #TopPlay #Baloncesto',
      likes: '890',
      comments: '102',
      date: 'HACE 3 SEMANAS'
    },
    { 
      id: 7, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1627627256672-027a4613d028?auto=format&fit=crop&q=80&w=800', 
      caption: 'El futuro está asegurado. Gran papel de nuestra cantera este fin de semana. 👶🏀 #CanteraDragons',
      likes: '534',
      comments: '31',
      date: 'HACE 1 MES'
    },
    { 
      id: 8, 
      type: 'image', 
      url: 'https://images.unsplash.com/photo-1519861155730-0b5fbf8dd88a?auto=format&fit=crop&q=80&w=800', 
      caption: 'Celebrando juntos. Más que un equipo, una familia. 🐉❤️ #TeamWork',
      likes: '723',
      comments: '48',
      date: 'HACE 1 MES'
    }
  ];

  return (
    <section id="media" className="py-16 md:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center md:text-left px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Galería <span className="text-primary">Dragón</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted max-w-xl"
          >
            Momentos épicos, intensidad en la cancha y la pasión de nuestra familia.
          </motion.p>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Navigation Buttons - Desktop */}
        <div className="absolute right-4 -top-20 flex gap-2 hidden md:flex px-4">
          <button 
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const container = e.currentTarget.parentElement?.parentElement?.querySelector('.overflow-x-auto');
              container?.scrollBy({ left: -400, behavior: 'smooth' });
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              const container = e.currentTarget.parentElement?.parentElement?.querySelector('.overflow-x-auto');
              container?.scrollBy({ left: 400, behavior: 'smooth' });
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pl-4">
          {instagramPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="w-[85vw] sm:w-[400px] shrink-0 snap-center relative group overflow-hidden rounded-2xl border border-white/10 cursor-pointer aspect-square"
              onClick={() => setSelectedPost(post)}
            >
              {post.type === 'video' ? (
                <video
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                >
                  <source src={post.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={post.url}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium line-clamp-2">{post.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Post Modal (Kept for functionality) */}
      <AnimatePresence>
        {selectedPost && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md cursor-pointer"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl flex flex-col md:flex-row bg-background border border-white/10 rounded-xl overflow-hidden max-h-[90vh] cursor-default"
            >
              <button 
                onClick={() => setSelectedPost(null)} 
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50 bg-black/50 p-2 rounded-full backdrop-blur-sm md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Media Side */}
              <div className="w-full md:w-3/5 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-[500px]">
                {selectedPost.type === 'video' ? (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    <source src={selectedPost.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={selectedPost.url}
                    alt="Post"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Info Side */}
              <div className="w-full md:w-2/5 flex flex-col bg-surface h-full max-h-[50vh] md:max-h-none">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-background border border-white/10 overflow-hidden p-0.5">
                      <img src="/images/dragon-logo.png" alt="Logo" className="w-full h-full object-contain rounded-full bg-black" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-sm font-bold text-white">doloresdragons</span>
                  </div>
                  <button 
                    onClick={() => setSelectedPost(null)} 
                    className="text-text-muted hover:text-white transition-colors hidden md:block"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption */}
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                  <p className="text-sm text-white">
                    <span className="font-bold mr-2">doloresdragons</span>
                    {selectedPost.caption}
                  </p>
                  <p className="text-xs text-text-muted mt-2">{selectedPost.date}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
