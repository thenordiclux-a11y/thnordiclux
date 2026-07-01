'use client'

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, MessageCircle, ChevronRight } from 'lucide-react';

const WHATSAPP_NUMBER = '94770130299';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'What products do you have for acne?',
  'How much is the Niacinamide serum?',
  "What's good for dry skin?",
  'Do you have CeraVe products?',
  "What's available in stock?",
];

type View = 'menu' | 'ai' | 'whatsapp';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! 👋 I'm the Nordic Lux AI assistant. I can help you find the perfect skincare products, check prices and availability, or answer any questions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && view === 'ai') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, view]);

  useEffect(() => {
    if (view === 'ai') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, view]);

  const openWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isLoading) return;
    setInput('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Please reach us on WhatsApp at +94770130299 😊",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setView('menu');
    } else {
      setIsOpen(true);
      setView('menu');
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={toggle} />
      )}

      {/* Popup panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: view === 'ai' ? '520px' : 'auto', fontFamily: 'inherit' }}
          onClick={e => e.stopPropagation()}
        >
          {/* ── MENU VIEW ── */}
          {view === 'menu' && (
            <>
              {/* Header */}
              <div className="px-4 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Nordic Lux Support</p>
                    <p className="text-white/60 text-xs">Choose how to reach us</p>
                  </div>
                </div>
                <button onClick={toggle} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="bg-white p-4 flex flex-col gap-3">
                {/* AI Chat option */}
                <button
                  onClick={() => setView('ai')}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-all duration-200 text-left group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold text-sm">AI Assistant</p>
                    <p className="text-gray-500 text-xs">Instant answers about products, prices & skincare tips</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                </button>

                {/* WhatsApp option */}
                <button
                  onClick={() => setView('whatsapp')}
                  className="flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200 text-left group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#25D366' }}>
                    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold text-sm">WhatsApp</p>
                    <p className="text-gray-500 text-xs">Chat directly with our team on WhatsApp</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0" />
                </button>
              </div>
            </>
          )}

          {/* ── AI CHAT VIEW ── */}
          {view === 'ai' && (
            <>
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
                <button onClick={() => setView('menu')} className="text-white/60 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">AI Assistant</p>
                  <p className="text-white/60 text-xs">Powered by GPT-4o-mini</p>
                </div>
                <button onClick={toggle} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 bg-gray-50 space-y-3" style={{ minHeight: '300px', maxHeight: '340px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-300' : ''}`}
                      style={msg.role === 'assistant' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}>
                      {msg.role === 'assistant'
                        ? <Bot className="w-3.5 h-3.5 text-white" />
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-gray-600"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      }
                    </div>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm shadow-sm'
                    }`}
                      style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' } : {}}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length === 1 && (
                <div className="bg-white px-3 py-2 border-t border-gray-100 flex gap-1.5 overflow-x-auto">
                  {SUGGESTED_QUESTIONS.slice(0, 3).map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="flex-shrink-0 text-xs px-2.5 py-1.5 rounded-full border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors whitespace-nowrap">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="bg-white px-3 py-3 border-t border-gray-100 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about products, prices..."
                  className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </>
          )}

          {/* ── WHATSAPP VIEW ── */}
          {view === 'whatsapp' && (
            <>
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#25D366' }}>
                <button onClick={() => setView('menu')} className="text-white/80 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">WhatsApp</p>
                  <p className="text-white/80 text-xs">Typically replies instantly</p>
                </div>
                <button onClick={toggle} className="text-white/80 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="bg-white px-4 py-4">
                <p className="text-gray-600 text-xs mb-3">👋 Hi! Choose a topic to start chatting:</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: '🛍️ Product availability', text: "Hi! I'd like to know about product availability." },
                    { label: '💰 Price inquiry', text: "Hi! I'd like to know the price of a product." },
                    { label: '✨ Skincare suggestion', text: 'Hi! Can you suggest a skincare product for me?' },
                    { label: '📦 Order status', text: "Hi! I'd like to check my order status." },
                    { label: '💬 General question', text: 'Hi! I have a question about Nordic Lux.' },
                  ].map(msg => (
                    <button key={msg.label} onClick={() => openWhatsApp(msg.text)}
                      className="text-left text-sm px-3 py-2 rounded-full border border-[#25D366] text-[#128C7E] hover:bg-[#25D366] hover:text-white transition-all duration-200 font-medium">
                      {msg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                <button onClick={() => openWhatsApp('Hi! I have a question.')}
                  className="w-full text-white text-sm font-semibold py-2.5 rounded-full transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366' }}>
                  <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Start Chat on WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Single floating button */}
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: isOpen ? '#374151' : 'linear-gradient(135deg, #1a1a2e 0%, #4a1a6e 100%)' }}
        aria-label="Chat with Nordic Lux"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute w-14 h-14 rounded-full animate-ping opacity-25"
            style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }} />
        )}
      </button>
    </>
  );
}
