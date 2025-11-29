import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSendMessage, isProcessing }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-100 rounded-lg">
             <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Intake Assistant</h3>
            <p className="text-[10px] text-slate-500 font-medium">Powered by Annie's Protocol Engine</p>
          </div>
        </div>
        <div className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold uppercase tracking-wider">
          Online
        </div>
      </div>
      
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/30"
      >
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium text-sm mb-1">No data yet</p>
            <p className="text-xs text-slate-400 max-w-[200px]">Paste client details to begin configuration.</p>
          </div>
        )}
        
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-white border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
            </div>
            
            {/* Bubble */}
            <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-sm' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
               <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type client details (e.g., '2200 kcal, no fish')..."
            className="w-full pl-5 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md hover:shadow-indigo-200"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;