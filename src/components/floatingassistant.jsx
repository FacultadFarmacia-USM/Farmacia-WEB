import { useState, useEffect, useRef } from 'react';
import fotoFarmaceutico from '../assets/imagen_farmaceuta.png'; 

export default function FloatingAssistant() {
  // ==========================================
  // 1. LÓGICA DE TU COMPAÑERA (Estados y Supabase)
  // ==========================================
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy FarmaGuía 🧑‍⚕️, tu asistente virtual. ¿En qué te puedo ayudar con el sistema de pasantías hoy?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    setIsLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/chat-farmaguia`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Error reportado por la función:", data.error);
        setMessages(prev => [...prev, { role: 'bot', text: data.reply || 'Lo siento, tuve un problema interno.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      }

    } catch (error) {
      console.error("Error de red:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Ups, tuve un problema de conexión. ¿Podrías intentar de nuevo?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. RENDERIZADO VISUAL (Unión de ambos diseños)
  // ==========================================
  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end font-sans">
      
      {/* LA VENTANA DEL CHATBOT DE TU COMPAÑERA */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-[#f8f9ff] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-blue-100 mb-4" style={{ height: '520px' }}>
          
          {/* Cabecera */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/80 shadow-md bg-white flex items-center justify-center">
                <img 
                  src={fotoFarmaceutico} 
                  alt="Avatar FarmaGuía" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-base tracking-wide leading-tight">FarmaGuía</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-blue-100 text-xs font-medium">Asistente de Pasantías</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 text-white rounded-full p-1 transition-colors">
              <span className="material-symbols-outlined text-xl block">close</span>
            </button>
          </div>

          {/* Área de Mensajes */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{
              backgroundColor: '#f8f9ff',
              backgroundImage: 'linear-gradient(#e6eeff 1px, transparent 1px), linear-gradient(90deg, #e6eeff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'bot' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2 self-end border border-blue-100 bg-white shadow-sm flex-shrink-0">
                    <img src={fotoFarmaceutico} alt="FarmaGuía" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[78%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10' 
                      : 'bg-white text-slate-800 border border-blue-100/80 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 self-end border border-blue-100 bg-white shadow-sm flex-shrink-0">
                  <img src={fotoFarmaceutico} alt="FarmaGuía" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-blue-100/80 text-blue-500 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario */}
          <form onSubmit={sendMessage} className="p-3 bg-white border-t border-blue-500/10 flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe tu duda aquí..."
              className="flex-1 bg-slate-50 text-slate-800 text-sm rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-blue-600 text-white rounded-xl p-2.5 flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-600/10"
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>
      )}

      {/* TU BOTÓN FLOTANTE ORIGINAL (Con lógica de apertura integrada 🎯) */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-1 bg-surface-container-lowest rounded-full shadow-xl border-2 border-[#001c3a] hover:scale-105 transition-transform duration-200"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-surface-container-high text-primary">
          <span className="material-symbols-outlined text-3xl">
            {isOpen ? 'close' : 'smart_toy'}
          </span>
        </div>
        <div className="absolute bottom-1 right-1 w-4 h-4 bg-secondary border-2 border-surface-container-lowest rounded-full"></div>
      </button>

    </div>
  );
}