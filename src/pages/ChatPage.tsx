import { useState, useRef, useEffect } from 'react';
import { manufacturers } from '../data';
import type { Page } from '../types';

interface ChatPageProps {
  manufacturerId: string;
  onNavigate: (page: Page, extra?: Record<string, string>) => void;
}

interface Message {
  id: string;
  sender: 'customer' | 'manufacturer';
  text: string;
  time: string;
  type?: 'product';
}

const initialMessages: Message[] = [
  { id: '1', sender: 'manufacturer', text: 'Namaste! Welcome to our store. How may I assist you today? I am happy to answer any questions about our Paithani collection.', time: '10:32 AM' },
  { id: '2', sender: 'customer', text: 'Hello! I am interested in the Royal Peacock Paithani. Could you share more details about the zari quality?', time: '10:35 AM' },
  { id: '3', sender: 'manufacturer', text: 'Of course! The Royal Peacock uses 22-karat gold zari imported from Surat. Each metre of zari contains approximately 2.5 grams of gold. This gives the saree its distinctive warm lustre that does not tarnish.', time: '10:37 AM' },
  { id: '4', sender: 'manufacturer', text: 'Would you like me to send a close-up photograph of the pallu motif? I can also arrange a video call so you can see the silk texture.', time: '10:37 AM' },
  { id: '5', sender: 'customer', text: 'Yes please, that would be wonderful! Also, can you do customisation for the border colour?', time: '10:40 AM' },
  { id: '6', sender: 'manufacturer', text: 'Absolutely. Border customisation is available for orders above ₹40,000. We can match the border to your blouse or preferred colour. The additional weaving time is approximately 3–4 weeks.', time: '10:42 AM' },
];

const quickReplies = [
  'What is the weaving time?',
  'Can I customise the motif?',
  'Is EMI available?',
  'What about delivery time?',
  'Can I see more photos?',
];

export default function ChatPage({ manufacturerId, onNavigate }: ChatPageProps) {
  const m = manufacturers.find((x) => x.id === manufacturerId) ?? manufacturers[0];
  const allManufacturers = manufacturers;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'manufacturer',
          text: 'Thank you for your question. I will get back to you with detailed information shortly. Please feel free to browse our collection in the meantime.',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <div className="border-b border-gold/15 bg-ivory px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => onNavigate('manufacturers')} className="text-warm-gray hover:text-purple transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg text-charcoal font-semibold" style={{ fontFamily: 'var(--font-display)' }}>Messages</h2>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar — conversation list */}
        <aside className="hidden md:flex w-72 flex-col border-r border-gold/15 bg-white">
          <div className="p-4 border-b border-gold/15">
            <div className="flex items-center gap-2 bg-ivory rounded-lg px-3 py-2 border border-gold/20">
              <svg className="w-4 h-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input placeholder="Search messages…" className="bg-transparent text-xs outline-none text-charcoal placeholder-warm-gray flex-1" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {allManufacturers.map((man) => (
              <button
                key={man.id}
                onClick={() => onNavigate('chat', { manufacturerId: man.id })}
                className={`w-full flex items-center gap-3 p-4 border-b border-gold/8 hover:bg-ivory transition-colors text-left ${man.id === manufacturerId ? 'bg-purple/5 border-l-2 border-l-purple' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <img src={man.avatar} alt={man.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${man.id === 'm1' || man.id === 'm2' ? 'bg-emerald' : 'bg-warm-gray-light'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-charcoal truncate">{man.name}</p>
                    <p className="text-[10px] text-warm-gray flex-shrink-0">2h</p>
                  </div>
                  <p className="text-[11px] text-warm-gray truncate">Click to open conversation</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Chat header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gold/15 bg-white">
            <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-charcoal text-sm" style={{ fontFamily: 'var(--font-display)' }}>{m.name}</p>
                {m.verified && (
                  <svg className="w-4 h-4 text-emerald" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" />
                  </svg>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-warm-gray">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald" />
                Online · Responds in {m.responseTime}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('manufacturer-profile', { id: m.id })}
                className="text-xs border border-gold/25 px-4 py-2 rounded text-warm-gray hover:text-purple hover:border-purple/30 transition-colors"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald/5 border-b border-emerald/15">
            <svg className="w-3.5 h-3.5 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
            </svg>
            <span className="text-xs text-emerald">End-to-end encrypted · Secure conversation · Paithani Royale protected</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'manufacturer' && (
                  <img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div
                  className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-3 ${
                    msg.sender === 'customer'
                      ? 'bg-purple text-ivory rounded-br-sm'
                      : 'bg-white border border-gold/15 text-charcoal rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1.5 ${msg.sender === 'customer' ? 'text-ivory/60' : 'text-warm-gray'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <img src={m.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div className="bg-white border border-gold/15 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-warm-gray animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-6 py-2 flex gap-2 overflow-x-auto border-t border-gold/10">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap text-xs border border-gold/25 text-warm-gray px-3 py-1.5 rounded-full hover:border-gold/50 hover:text-charcoal transition-colors flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gold/15 px-6 py-4 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1 border border-gold/25 rounded-xl px-4 py-3 focus-within:border-gold/50 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message…"
                  rows={1}
                  className="w-full bg-transparent text-sm text-charcoal placeholder-warm-gray outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(input);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="w-10 h-10 bg-purple text-ivory rounded-xl flex items-center justify-center hover:bg-purple-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
