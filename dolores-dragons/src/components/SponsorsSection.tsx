import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Link as LinkIcon, Image as ImageIcon, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sponsor } from '../types';

const defaultSponsors: Sponsor[] = [
  { id: '1', name: 'NSD', logo: 'https://image2url.com/r2/default/images/1773275081572-81fef10c-b0a5-453b-9e30-c7aa468d543d.png', url: 'https://www.colegionsdolores.es/' },
  { id: '2', name: 'Fan Tastiko', logo: 'https://image2url.com/r2/default/images/1773275111246-eae6afa4-88b8-425f-ad94-8c22cf137ec9.png', url: 'https://www.instagram.com/fan_tastiko/' },
];

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const savedSponsors = localStorage.getItem('dd_sponsors_v5');
    if (savedSponsors && savedSponsors !== 'undefined') {
      try {
        setSponsors(JSON.parse(savedSponsors));
      } catch (e) {
        setSponsors(defaultSponsors);
      }
    } else {
      setSponsors(defaultSponsors);
      localStorage.setItem('dd_sponsors_v5', JSON.stringify(defaultSponsors));
    }
  }, []);

  const saveSponsors = (newSponsors: Sponsor[]) => {
    setSponsors(newSponsors);
    localStorage.setItem('dd_sponsors_v5', JSON.stringify(newSponsors));
  };

  const handleOpenModal = (sponsor?: Sponsor) => {
    if (sponsor) {
      setEditingSponsor(sponsor);
      setName(sponsor.name);
      setLogo(sponsor.logo);
      setUrl(sponsor.url || '');
    } else {
      setEditingSponsor(null);
      setName('');
      setLogo('');
      setUrl('');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSponsor(null);
  };

  const handleSaveSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logo) return;

    if (editingSponsor) {
      const updatedSponsors = sponsors.map(s => 
        s.id === editingSponsor.id ? { ...s, name, logo, url } : s
      );
      saveSponsors(updatedSponsors);
    } else {
      const newSponsor: Sponsor = {
        id: Date.now().toString(),
        name,
        logo,
        url
      };
      saveSponsors([...sponsors, newSponsor]);
    }
    handleCloseModal();
  };

  const handleDeleteSponsor = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar este patrocinador?')) {
      saveSponsors(sponsors.filter(s => s.id !== id));
    }
  };

  return (
    <section id="sponsors" className="py-16 md:py-20 bg-black relative overflow-hidden force-dark" style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10 md:mb-14">
          <div className="flex-1" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center flex-1 flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-primary/40" />
              <span className="text-primary/60 font-bold uppercase" style={{ fontSize: '0.57rem', letterSpacing: '0.34em' }}>
                Patrocinadores Oficiales
              </span>
              <div className="h-px w-8 bg-primary/40" />
            </div>
          </motion.div>
          <div className="flex-1 flex justify-end" />
        </div>

        {isEditMode ? (
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 transition-all duration-500">
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative group"
              >
                <div 
                  className="w-20 h-20 md:w-32 md:h-32 flex items-center justify-center p-3 md:p-4 transition-all duration-300 opacity-100 grayscale-0 border border-dashed border-white/20 rounded-lg"
                  title={`Editar ${sponsor.name}`}
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="max-w-full max-h-full object-contain transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.8)] theme-invert"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(sponsor)}
                    className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSponsor(sponsor.id, e)}
                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleOpenModal()}
              className="w-20 h-20 md:w-32 md:h-32 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-white/50 hover:text-primary hover:border-primary/50 transition-colors"
            >
              <Plus className="w-5 h-5 md:w-6 md:h-6 mb-1" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Añadir</span>
            </motion.button>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {sponsors.map((sponsor) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="group"
              >
                <a 
                  href={sponsor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-24 h-24 md:w-40 md:h-40 flex items-center justify-center p-2 md:p-4 transition-all duration-300 hover:scale-110"
                >
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className="max-w-full max-h-full object-contain transition-all duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] theme-invert"
                    referrerPolicy="no-referrer"
                  />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background rounded-2xl p-6 md:p-8 max-w-md w-full relative shadow-2xl cursor-default"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {editingSponsor ? 'Editar Sponsor' : 'Nuevo Sponsor'}
              </h3>

              <form onSubmit={handleSaveSponsor} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                    Nombre del Patrocinador *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Ej. Nike, Adidas..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                    URL del Logo (Imagen) *
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="url"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="https://ejemplo.com/logo.png"
                    />
                  </div>
                  {logo && (
                    <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center h-24">
                      <img src={logo} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/200x100?text=Error+de+Imagen')} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                    Enlace Web (Opcional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-[#000000] rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
