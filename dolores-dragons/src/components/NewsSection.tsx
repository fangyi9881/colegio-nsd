import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Calendar, User, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { newsArticles } from '../data/news';
import { NewsArticle } from '../types';
import MatchCard from './MatchCard';

export default function NewsSection() {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>('Todos');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (selectedArticle) {
      setEditTitle(selectedArticle.title);
      setEditContent(selectedArticle.content);
    } else {
      setIsEditing(false);
    }
  }, [selectedArticle]);

  const categories = ['Todos', 'Club', 'Escuelas'];

  const scrollToArticle = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('article')?.offsetWidth || 350;
      const gap = 24; // gap-6
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const nextArticle = () => {
    const nextIndex = (currentIndex + 1) % filteredArticles.length;
    scrollToArticle(nextIndex);
  };

  const prevArticle = () => {
    const prevIndex = (currentIndex - 1 + filteredArticles.length) % filteredArticles.length;
    scrollToArticle(prevIndex);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('article')?.offsetWidth || 350;
      const gap = 24;
      const index = Math.round(container.scrollLeft / (cardWidth + gap));
      if (index !== currentIndex && index >= 0 && index < filteredArticles.length) {
        setCurrentIndex(index);
      }
    }
  };

  const sortedArticles = [...newsArticles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredArticles = sortedArticles.filter(article => {
    const matchesCategory = filter === 'Todos' || article.category === filter;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="noticias" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary/40" />
              <span className="text-primary/60 font-bold uppercase" style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}>
                Actualidad del Club
              </span>
            </div>
            <h3
              className="text-white font-black uppercase"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 3rem)', letterSpacing: '0.12em', fontFamily: 'var(--font-display)' }}
            >
              Últimas Noticias
            </h3>
          </motion.div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentIndex(0); if(scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0); }}
              className="bg-surface text-white border border-white/10 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-primary"
            />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentIndex(0); if(scrollContainerRef.current) scrollContainerRef.current.scrollTo(0, 0); }}
              className="bg-surface text-white border border-white/10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-primary cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {/* Navigation Buttons */}
            <div className="hidden md:flex gap-2">
              <button onClick={prevArticle} className="p-2 rounded-full bg-surface border border-white/10 text-white hover:border-primary transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextArticle} className="p-2 rounded-full bg-surface border border-white/10 text-white hover:border-primary transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/3 border border-white/8 overflow-hidden hover:border-primary/25 transition-all duration-500 flex flex-col min-w-[300px] md:min-w-[350px] max-w-[350px] snap-start shrink-0 cursor-pointer"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
              onClick={() => setSelectedArticle(article)}
            >
              <div className="block relative aspect-[16/9] overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-primary text-[#000000] text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {article.category}
                  </span>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full animate-pulse">
                      Nuevo
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5 md:p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-[10px] text-white/40 uppercase tracking-widest mb-3 md:mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {new Date(article.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {article.author}
                  </div>
                </div>

                <h4 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h4>

                <p className="text-white/60 text-xs md:text-sm mb-5 md:mb-6 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                <div className="mt-auto pt-4 md:pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-2">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[9px] text-white/30 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-2 h-2" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 group/btn">
                    Leer más
                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {filteredArticles.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToArticle(idx)}
              className={`h-1.5 rounded-full transition-all ${
                currentIndex === idx ? 'bg-primary w-8' : 'bg-white/10 w-4'
              }`}
              aria-label={`Ir a la noticia ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      </div>

      {/* News Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-surface border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-primary text-white hover:text-black rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto flex-1 hide-scrollbar">
                <div className="relative h-64 md:h-80 w-full shrink-0">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
                    <span className="inline-block px-3 py-1 bg-primary text-[#000000] text-[10px] font-bold uppercase tracking-wider rounded-full mb-4">
                      {selectedArticle.category}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {selectedArticle.title}
                    </h2>
                  </div>
                </div>

                <div className="p-6 md:p-10">
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-surface border border-white/20 rounded-lg p-2 text-white"
                      />
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-64 bg-surface border border-white/20 rounded-lg p-2 text-white"
                      />
                      <button
                        onClick={() => {
                          console.log('Nuevo título:', editTitle);
                          console.log('Nuevo contenido:', editContent);
                          alert('Por favor, copia el nuevo contenido de la consola y envíamelo para actualizarlo.');
                          setIsEditing(false);
                        }}
                        className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Guardar (Copiar de consola)
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-white/50 uppercase tracking-widest mb-8 pb-8 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedArticle.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {selectedArticle.author}
                        </div>
                      </div>

                      {selectedArticle.match && (
                        <div className="mb-8 max-w-md mx-auto">
                          <MatchCard match={selectedArticle.match} />
                        </div>
                      )}

                      <div className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:text-white prose-a:text-primary prose-strong:text-white prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-th:bg-white/10 prose-th:p-4 prose-th:text-left prose-th:border-b prose-th:border-white/20 prose-td:p-4 prose-td:border-b prose-td:border-white/10 prose-tr:transition-colors hover:prose-tr:bg-white/5 prose-blockquote:border-l-primary prose-blockquote:bg-white/5 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:my-6 prose-ul:list-disc prose-ul:pl-6 prose-li:my-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedArticle.content}
                        </ReactMarkdown>
                      </div>
                    </>
                  )}

                  {selectedArticle.downloadUrl && (
                    <div className="mt-8">
                      <a
                        href={selectedArticle.downloadUrl}
                        download
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Descargar Hoja de Inscripción
                      </a>
                      <p className="text-[10px] text-white/40 mt-2 italic">
                        * Nota: Este enlace es temporal (blob). Asegúrate de que el archivo esté disponible permanentemente en producción.
                      </p>
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-white/10 flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white/5 text-white/60 text-xs uppercase tracking-wider rounded-full border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <img src="https://i.imgur.com/OP6BbHs.png" alt="Logo" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
