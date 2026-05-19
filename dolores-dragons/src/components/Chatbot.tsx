import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { matchesData } from '../data/matches';
import { matchStats } from '../data/matchStats';
import { useBackToClose } from '../hooks/useBackToClose';
import MatchCard from './MatchCard';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  matchData?: any;
}

const getSystemInstruction = () => {
  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
Eres el asistente virtual oficial del club de baloncesto "Dolores Dragons".
Tu objetivo es responder preguntas sobre el club basándote ÚNICAMENTE en la información proporcionada a continuación.
Si te preguntan algo que no está en esta información, debes responder amablemente que no tienes esa información y sugerir que contacten al club directamente.
No inventes información, no hables de otros temas, y mantén un tono amigable, deportivo y profesional.

FECHA ACTUAL: Hoy es ${today}. Usa esta fecha como referencia absoluta para saber qué partidos son en el futuro ("próximos partidos") y cuáles ya se han jugado ("últimos resultados").

INFORMACIÓN DEL CLUB:
- Nombre: Dolores Dragons
- Lema: "Forjando leyendas en la cancha"
- Ubicación: Colegio Ntra. Sra. de los Dolores, Carabanchel, Madrid.
- Contacto: Teléfono/WhatsApp: +34 646 794 962, Email: basketnsd@gmail.com.
- Categorías disponibles: 
  - Minibasket: Babybasket (4-5 años), Prebenjamín (6-7 años), Benjamín (8-9 años), Alevín (10-11 años).
  - Baloncesto: Infantil (12-13 años), Cadete (14-15 años), Júnior (16-17 años), Sub-22 (18-21 años), Senior (+22 años).
  - Otros: Veteranos, Entrenador/Staff.
- Equipos destacados actuales: Cadete Femenino y Alevín Mixto.
- Historia: Nacimiento de los Dolores Dragons con la visión de dominar el baloncesto regional.
- Valores: Disciplina, Pasión, Desarrollo Integral, "Más que un equipo, una familia".
- Equipación: Camiseta y pantalón negros con detalles dorados.
- Inscripciones: Abiertas. Se puede rellenar el formulario en la web o contactar por WhatsApp/Email.

HORARIOS DE ENTRENAMIENTO:
- Alevín Mixto: Martes y Jueves de 17:00 a 18:00 en el Colegio Ntra. Sra. de los Dolores.
- Cadete Femenino: Martes y Jueves de 17:00 a 19:00 en el Colegio Ntra. Sra. de los Dolores.
(Días lectivos según el calendario escolar de la Comunidad de Madrid).

DATOS DE PARTIDOS (CALENDARIO Y RESULTADOS):
A continuación se muestran los datos exactos del calendario. Usa esta información para responder preguntas sobre partidos.
${JSON.stringify(matchesData, null, 2)}

ESTADÍSTICAS DETALLADAS DE PARTIDOS:
Aquí tienes estadísticas individuales de jugadores para partidos específicos:
${JSON.stringify(matchStats, null, 2)}
`;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: '¡Hola! Soy el asistente de los Dolores Dragons 🐉. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle back button to close
  useBackToClose(isOpen, () => setIsOpen(false));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Format history for generateContent
      const contents = messages.slice(1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMsg }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          systemInstruction: getSystemInstruction(),
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              text: { type: "string" },
              matchData: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  opponent: { type: "string" },
                  location: { type: "string" },
                  result: { type: "string" }
                }
              }
            },
            required: ["text"]
          }
        }
      });

      const responseObj = JSON.parse(response.text || '{}');

      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: responseObj.text || 'Lo siento, no pude procesar tu solicitud.',
        matchData: responseObj.matchData
      }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: 'Lo siento, ha ocurrido un error al conectar con el servidor. Por favor, inténtalo más tarde.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-[#000000] rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center hover:scale-110 transition-transform ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Abrir chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay for closing on outside click */}
            <div 
              className="fixed inset-0 z-[45] bg-black/20" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
            {/* Header */}
            <div className="bg-black/50 p-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Asistente Dragons</h3>
                  <p className="text-xs text-primary">En línea</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-background/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-primary/20 text-primary'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div 
                    className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-[#000000] rounded-tr-none' 
                        : 'bg-surface border border-white/10 text-white rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                    {msg.matchData && <MatchCard match={msg.matchData} />}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-surface border border-white/10 text-white rounded-tl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs text-text-muted">Escribiendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 bg-black/50 border-t border-white/10 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="w-full bg-background border border-white/10 rounded-full pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 p-2 bg-primary text-[#000000] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
