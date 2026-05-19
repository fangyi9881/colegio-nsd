import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, ChevronRight } from 'lucide-react';
import { useBackToClose } from '../hooks/useBackToClose';

export type LegalType = 'privacidad' | 'terminos';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalType;
  setType: (type: LegalType) => void;
}

const legalContent = {
  privacidad: {
    title: 'Política de Privacidad',
    icon: <Shield className="w-6 h-6 text-primary" />,
    sections: [
      {
        subtitle: '1. Responsable del Tratamiento',
        text: 'El responsable del tratamiento de sus datos personales es el Club de Baloncesto Dolores Dragons, con domicilio social en Dolores, Alicante, y correo electrónico de contacto basketnsd@gmail.com.'
      },
      {
        subtitle: '2. Finalidad del Tratamiento',
        text: 'Tratamos la información que nos facilita con el fin de gestionar la relación deportiva y administrativa con el club, enviarle comunicaciones sobre eventos, resultados y noticias relevantes, así como gestionar sus consultas a través de nuestro sitio web y chatbot.'
      },
      {
        subtitle: '3. Legitimación',
        text: 'La base legal para el tratamiento de sus datos es el consentimiento del interesado al inscribirse o contactar con nosotros, así como el interés legítimo del club en mantener informados a sus miembros y seguidores.'
      },
      {
        subtitle: '4. Conservación de Datos',
        text: 'Los datos personales proporcionados se conservarán mientras se mantenga la relación con el club o durante los años necesarios para cumplir con las obligaciones legales.'
      },
      {
        subtitle: '5. Derechos del Usuario',
        text: 'Usted tiene derecho a obtener confirmación sobre si estamos tratando sus datos personales, por tanto tiene derecho a acceder a sus datos personales, rectificar los datos inexactos o solicitar su supresión cuando los datos ya no sean necesarios.'
      }
    ]
  },
  terminos: {
    title: 'Términos Legales',
    icon: <FileText className="w-6 h-6 text-primary" />,
    sections: [
      {
        subtitle: '1. Condiciones de Uso',
        text: 'El acceso y uso de este sitio web atribuye la condición de usuario, que acepta, desde dicho acceso y/o uso, las presentes condiciones de uso. El sitio web proporciona acceso a multitud de informaciones, servicios o datos pertenecientes a Dolores Dragons.'
      },
      {
        subtitle: '2. Propiedad Intelectual e Industrial',
        text: 'Dolores Dragons por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (imágenes, logotipos, textos, etc.).'
      },
      {
        subtitle: '3. Exclusión de Responsabilidad',
        text: 'Dolores Dragons no se hace responsable de los daños y perjuicios que pudieran ocasionar errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus, a pesar de haber adoptado medidas tecnológicas.'
      },
      {
        subtitle: '4. Legislación y Jurisdicción',
        text: 'La relación entre Dolores Dragons y el usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Elche/Alicante.'
      }
    ]
  }
};

export default function LegalModal({ isOpen, onClose, type, setType }: LegalModalProps) {
  useBackToClose(isOpen, onClose);

  const content = legalContent[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-2xl relative overflow-hidden shadow-2xl flex flex-col max-h-[85vh] cursor-default"
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-surface sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {content.icon}
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  {content.title}
                </h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-8">
                {content.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-3" style={{ fontFamily: 'var(--font-display)' }}>
                      {section.subtitle}
                    </h3>
                    <p className="text-text-muted leading-relaxed text-sm md:text-base">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Navigation between legal types */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-4 font-bold">Otras secciones legales</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(legalContent) as LegalType[]).map((key) => {
                    if (key === type) return null;
                    const item = legalContent[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setType(key)}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all group text-left"
                      >
                        <span className="text-sm font-bold text-white/70 group-hover:text-primary transition-colors uppercase tracking-wider">
                          {item.title}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-bold">
                Dolores Dragons Basketball Club &copy; {new Date().getFullYear()}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
