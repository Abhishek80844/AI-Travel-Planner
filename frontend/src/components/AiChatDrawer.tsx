import React, { useState, useRef, useEffect } from 'react';
import { sendTripChatMessage, getGeneralTravelAdvice } from '../api/trips';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AiChatDrawerProps {
  tripId?: number;
  destination?: string;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ tripId, destination }) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayDest = destination || 'Global Travel Assistant';
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: tripId
        ? `Hello! I'm your AI Travel Assistant powered by Google Gemini API. Ask me for recommendations, hidden gems, or advice grounded in your ${destination} trip!`
        : `Hello! I'm your AI Travel Assistant powered by Google Gemini API. Ask me any travel questions, route advice, or recommendations for any destination!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      let res: { reply: string; timestamp: string };
      if (tripId) {
        res = await sendTripChatMessage(tripId, userText);
      } else {
        res = await getGeneralTravelAdvice(userText);
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I ran into an issue connecting to Gemini AI assistant. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold shadow-2xl shadow-sky-500/40 transition-all hover:scale-110 active:scale-95 flex items-center space-x-2 border border-sky-400/30 cursor-pointer pointer-events-auto"
      >
        <Sparkles className="w-5 h-5 text-white animate-pulse" />
        <span className="hidden sm:inline">Gemini AI Assistant</span>
      </button>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed bottom-6 right-6 z-[100] w-[90vw] sm:w-[420px] h-[580px] glass-panel rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Gemini AI Assistant</h4>
                  <p className="text-[11px] text-sky-400 font-medium">Powered by Google Gemini • {displayDest}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sky-500 text-white font-medium rounded-br-none'
                        : 'glass-card border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card border border-slate-800 p-3 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-sky-400 rounded-full animate-ping" />
                    <span>Gemini AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                placeholder={destination ? `Ask about ${destination}...` : "Ask Gemini anything about travel..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
