import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useBackToClose } from '../hooks/useBackToClose';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-errors';

interface JoinFormProps {
  onClose: () => void;
}

export default function JoinForm({ onClose }: JoinFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    prefix: '+34',
    phone: '',
    category: '',
    message: ''
  });

  // Handle native back button to close
  useBackToClose(true, onClose);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert('Por favor, introduce un correo electrónico válido (ej. usuario@dominio.com)');
      return;
    }

    setStatus('submitting');

    try {
      console.log('Submitting join request with data:', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email.toLowerCase(),
        phone: `${formData.prefix} ${formData.phone}`,
        category: formData.category,
        message: formData.message,
        status: 'pending',
        createdAt: 'serverTimestamp()'
      });

      try {
        await addDoc(collection(db, 'join_requests'), {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email.toLowerCase(),
          phone: `${formData.prefix} ${formData.phone}`,
          category: formData.category,
          message: formData.message,
          status: 'pending',
          createdAt: serverTimestamp()
        });

        // Send email via Resend API
        try {
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #D4AF37; text-transform: uppercase;">Nueva solicitud de inscripción</h2>
              <p>Has recibido una nueva solicitud a través de la web de <strong>Dolores Dragons</strong>:</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p><strong>Nombre:</strong> ${formData.firstName} ${formData.lastName}</p>
              <p><strong>Email:</strong> ${formData.email}</p>
              <p><strong>Teléfono:</strong> ${formData.prefix} ${formData.phone}</p>
              <p><strong>Categoría:</strong> ${formData.category}</p>
              <p><strong>Mensaje:</strong> ${formData.message || 'Sin mensaje adicional'}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">Este es un mensaje automático enviado desde el sistema de inscripciones.</p>
            </div>
          `;

          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: 'basketnsd@gmail.com',
              subject: `Nueva solicitud de inscripción - ${formData.firstName} ${formData.lastName}`,
              html: emailHtml,
            }),
          });

          if (!response.ok) {
            console.warn('Resend API failed, falling back to mailto');
            throw new Error('Resend API failed');
          }
          
          console.log('Email sent successfully via Resend');
        } catch (emailErr) {
          console.error('Error sending email via API:', emailErr);
          // Fallback to mailto link for free email sending if API fails
          const subject = encodeURIComponent(`Nueva solicitud de inscripción - ${formData.firstName} ${formData.lastName}`);
          const body = encodeURIComponent(
            `Hola Dolores Dragons,\n\n` +
            `He recibido una nueva solicitud de inscripción a través de la web:\n\n` +
            `Nombre: ${formData.firstName} ${formData.lastName}\n` +
            `Email: ${formData.email}\n` +
            `Teléfono: ${formData.prefix} ${formData.phone}\n` +
            `Categoría: ${formData.category}\n` +
            `Mensaje: ${formData.message || 'Sin mensaje adicional'}\n\n` +
            `Saludos.`
          );
          
          const mailtoUrl = `mailto:basketnsd@gmail.com?subject=${subject}&body=${body}`;
          window.location.href = mailtoUrl;
        }

      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'join_requests');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting join request:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
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
        className="bg-background rounded-2xl w-full max-w-lg relative overflow-hidden shadow-2xl flex flex-col max-h-[90vh] cursor-default"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />
        
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between relative z-10 bg-background shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Únete a los <span className="text-primary">Dragons</span>
            </h2>
            <p className="text-text-muted text-xs md:text-sm mt-1">Inscripciones abiertas</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-muted hover:text-white bg-white/5 md:bg-transparent shrink-0 ml-4"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 relative z-10 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 flex flex-col items-center text-center space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                  ¡Solicitud Enviada!
                </h3>
                <p className="text-text-muted max-w-xs">
                  Hemos recibido tus datos. El equipo técnico se pondrá en contacto contigo muy pronto.
                </p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handleSubmit} 
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-medium text-text-muted">Nombre</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-sm font-medium text-text-muted">Apellidos</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors"
                      placeholder="Tus apellidos"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-text-muted">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-text-muted">Teléfono</label>
                  <div className="flex gap-2">
                    <div className="relative w-1/3 md:w-1/4">
                      <select 
                        id="prefix"
                        value={formData.prefix}
                        onChange={handleChange}
                        className="w-full px-2 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors appearance-none cursor-pointer"
                      >
                        <option value="+34">🇪🇸 +34</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+52">🇲🇽 +52</option>
                        <option value="+54">🇦🇷 +54</option>
                        <option value="+57">🇨🇴 +57</option>
                        <option value="+56">🇨🇱 +56</option>
                        <option value="+51">🇵🇪 +51</option>
                        <option value="+58">🇻🇪 +58</option>
                        <option value="+593">🇪🇨 +593</option>
                        <option value="+502">🇬🇹 +502</option>
                        <option value="+53">🇨🇺 +53</option>
                        <option value="+591">🇧🇴 +591</option>
                        <option value="+504">🇭🇳 +504</option>
                        <option value="+503">🇸🇻 +503</option>
                        <option value="+595">🇵🇾 +595</option>
                        <option value="+506">🇨🇷 +506</option>
                        <option value="+507">🇵🇦 +507</option>
                        <option value="+598">🇺🇾 +598</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+49">🇩🇪 +49</option>
                        <option value="+33">🇫🇷 +33</option>
                        <option value="+39">🇮🇹 +39</option>
                        <option value="+351">🇵🇹 +351</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    <input 
                      type="tel" 
                      id="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-2/3 md:w-3/4 px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className="text-sm font-medium text-text-muted">Categoría de Interés</label>
                  <div className="relative">
                    <select 
                      id="category" 
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      <optgroup label="Minibasket (Canasta Pequeña)" className="bg-surface text-white">
                        <option value="Babybasket">Babybasket (4-5 años)</option>
                        <option value="Prebenjamín">Prebenjamín (6-7 años)</option>
                        <option value="Benjamín">Benjamín (8-9 años)</option>
                        <option value="Alevín">Alevín (10-11 años)</option>
                      </optgroup>
                      <optgroup label="Baloncesto (Canasta Grande)" className="bg-surface text-white">
                        <option value="Infantil">Infantil (12-13 años)</option>
                        <option value="Cadete">Cadete (14-15 años)</option>
                        <option value="Júnior">Júnior (16-17 años)</option>
                        <option value="Sub-22">Sub-22 (18-21 años)</option>
                        <option value="Senior">Senior (+22 años)</option>
                      </optgroup>
                      <optgroup label="Otros" className="bg-surface text-white">
                        <option value="Veteranos">Veteranos</option>
                        <option value="Entrenador/Staff">Entrenador / Staff</option>
                        <option value="Otra">Otra / No estoy seguro</option>
                      </optgroup>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-text-muted">Mensaje Adicional</label>
                  <textarea 
                    id="message" 
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-white transition-colors resize-none"
                    placeholder="Cuéntanos un poco sobre tu experiencia (opcional)"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-[#000000] rounded-xl font-bold text-lg transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <>Enviando... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Enviar Solicitud <Send className="w-5 h-5" /></>
                  )}
                </button>
                {status === 'error' && (
                  <p className="text-xs text-red-500 text-center font-bold uppercase tracking-widest mt-2">
                    Hubo un error al enviar. Inténtalo de nuevo.
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
