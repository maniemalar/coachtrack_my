import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, RefreshCw, Paperclip, Check } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatMessengerProps {
  currentUserId: string;
  senderRole: string; // 'TRAINER' | 'TRAINEE'
}

export default function ChatMessenger({ currentUserId, senderRole }: ChatMessengerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Specific Reply tagging states
  const [replyTagType, setReplyTagType] = useState<'WORKOUT' | 'NUTRITION' | null>(null);
  const [replyTagTitle, setReplyTagTitle] = useState('');
  const [replyTagId, setReplyTagId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Targets
  const receiverId = currentUserId === 'u_sarah' ? 'u_ahmad' : 'u_sarah';

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Polling mechanism
    return () => clearInterval(interval);
  }, [currentUserId, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats?userA=${currentUserId}&userB=${receiverId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const payload = {
        senderId: currentUserId,
        receiverId,
        message: inputText,
        replyToType: replyTagType || undefined,
        replyToId: replyTagId || undefined,
        replyToTitle: replyTagTitle || undefined
      };

      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setInputText('');
        setReplyTagType(null);
        setReplyTagTitle('');
        setReplyTagId('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectPresetTag = (type: 'WORKOUT' | 'NUTRITION', title: string, id: string) => {
    setReplyTagType(type);
    setReplyTagTitle(title);
    setReplyTagId(id);
    setInputText(`Regarding the logged ${type.toLowerCase()} [${title}]: `);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6 text-left">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Messenger Container Box */}
        <div className="bg-white rounded-2xl border border-slate-105 shadow-md overflow-hidden flex flex-col h-[650px]">
          
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                💬
              </div>
              <div>
                <h3 className="font-display font-black text-white leading-tight">
                  {currentUserId === 'u_sarah' ? 'Ahmad Ibrahim (Trainee)' : 'Sarah Tan (Coaching Direct)'}
                </h3>
                <p className="text-[10px] text-teal-400 font-bold tracking-wider uppercase mt-1">
                  Active Thread • Labeled Feedback Contexts enabled
                </p>
              </div>
            </div>

            <button 
              onClick={fetchMessages}
              title="Refresh messages"
              className="hover:bg-white/10 p-2 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Quick Annotation tagging panel */}
          <div className="bg-slate-50 border-b border-slate-100 p-2.5 px-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-bold block">Tag Context:</span>
            <button
              onClick={() => selectPresetTag('WORKOUT', 'Strength & Core', 'w_1')}
              className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-teal-500 shrink-0"
            >
              🏋️ Reply to Workout [Strength & Core]
            </button>
            <button
              onClick={() => selectPresetTag('NUTRITION', 'Nasi Lemak with Fried Egg', 'n_1')}
              className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2.5 py-1 text-[11px] font-bold text-slate-700 focus:outline-teal-500 shrink-0"
            >
              🍛 Reply to Nutrition [Nasi Lemak]
            </button>
          </div>

          {/* Messages list bubble flow */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-bold text-slate-500">No chat history found.</p>
                <p>Choose a quick tag or type a greeting to start your conversation.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isSentByMe = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-xs relative text-left ${
                      isSentByMe 
                        ? 'bg-slate-900 text-slate-50 rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                    }`}>
                      {/* Annotation message markup flag */}
                      {m.replyToType && (
                        <div className={`mb-2 px-2.5 py-1 rounded text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 ${
                          isSentByMe 
                            ? 'bg-white/10 text-teal-300' 
                            : 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            Replying to {m.replyToType === 'WORKOUT' ? 'Workout Log' : 'Nutrition Tracker'}: [{m.replyToTitle}]
                          </span>
                        </div>
                      )}

                      <p className="leading-relaxed font-sans text-xs sm:text-sm whitespace-pre-wrap">
                        {m.message}
                      </p>
                      
                      <div className="flex justify-end items-center gap-1.5 mt-2">
                        <span className={`text-[9px] block ${isSentByMe ? 'text-slate-400' : 'text-slate-400'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isSentByMe && <span className="text-[10px] text-teal-400 font-bold">✓ Sent</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input bottom bar */}
          <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-100 p-4 flex flex-col gap-3">
            
            {/* Show currently tagged label if selected */}
            {replyTagType && (
              <div className="bg-teal-50 border border-teal-100 text-teal-800 px-3 py-1.5 rounded-lg flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[10px]">
                  📌 Active Tag: Replying to {replyTagType === 'WORKOUT' ? 'Workout Log' : 'Nutrition'} &ldquo;{replyTagTitle}&rdquo;
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setReplyTagType(null);
                    setReplyTagTitle('');
                    setReplyTagId('');
                  }}
                  className="font-black hover:text-teal-900 text-sm shrink-0"
                >
                  ✕ Clear Tag
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type your fitness updates or coach recommendation reviews..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-teal-500"
              />
              <button
                type="submit"
                className="bg-indigo-950 hover:bg-slate-900 text-teal-400 font-bold p-3.5 rounded-xl transition flex items-center justify-center shrink-0"
                id="btn-chat-send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
