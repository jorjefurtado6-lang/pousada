import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FAQ } from '../types';
import ReactMarkdown from 'react-markdown';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Olá! Sou o assistente virtual da Pousada Premium. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Fetch FAQs for context
      const faqSnap = await getDocs(collection(db, 'faqs'));
      const faqs = faqSnap.docs.map(doc => doc.data() as FAQ);
      const faqContext = faqs.map(f => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = 'gemini-3-flash-preview';
      
      const systemInstruction = `
        Você é o assistente virtual da Pousada Premium. 
        Seu objetivo é ajudar os hóspedes com dúvidas sobre a pousada, quartos, preços e reservas.
        
        Informações da Pousada:
        - Nome: Pousada Premium
        - Localização: Serra Gaúcha, RS
        - Check-in: 14:00
        - Check-out: 12:00
        - Café da manhã incluso em todas as diárias.
        - Aceitamos Pets (taxa única de R$ 50).
        - Estacionamento gratuito.
        - Wi-fi gratuito em toda a propriedade.
        
        FAQs da Pousada:
        ${faqContext}
        
        Instruções:
        - Seja sempre educado, acolhedor e profissional.
        - Responda de forma concisa e direta.
        - Se não souber a resposta, sugira falar com um atendente humano pelo WhatsApp (11 99999-9999).
        - Use Markdown para formatar as respostas quando necessário.
        - Se o usuário quiser reservar, direcione-o para a página de Reservas (/reservar).
      `;

      const chat = ai.chats.create({
        model,
        config: { systemInstruction },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: userMessage });
      const botResponse = result.text || 'Desculpe, não consegui processar sua solicitação.';
      
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Ops! Tive um problema técnico. Pode tentar novamente em instantes ou falar conosco pelo WhatsApp.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden transition-all duration-300 ${
              isMinimized ? 'h-16 w-72' : 'h-[500px] w-[350px] sm:w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-stone-900" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Assistente Premium</h3>
                  <p className="text-[10px] text-stone-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Online agora
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                          msg.role === 'user' ? 'bg-stone-200' : 'bg-amber-100'
                        }`}>
                          {msg.role === 'user' ? <User size={14} className="text-stone-600" /> : <Bot size={14} className="text-amber-700" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-stone-900 text-white rounded-tr-none' 
                            : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'
                        }`}>
                          <div className="markdown-body">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center bg-white border border-stone-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                        <Loader2 size={16} className="animate-spin text-amber-600" />
                        <span className="text-xs text-stone-500">Digitando...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-stone-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Como posso ajudar?"
                      className="flex-grow bg-stone-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="bg-amber-600 text-white p-2 rounded-xl hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-stone-400 mt-3">
                    Atendimento humano disponível: Seg-Sex, 08h às 20h.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 group"
        >
          <div className="relative">
            <MessageSquare size={24} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 border-2 border-stone-900 rounded-full"></span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 font-medium whitespace-nowrap">
            Falar com Assistente
          </span>
        </motion.button>
      )}
    </div>
  );
};

export default Chatbot;
