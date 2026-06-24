import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, RefreshCw, Paperclip, Check, X } from 'lucide-react';
import { ChatMessage } from '../types';
import { dbService } from '../lib/dbService';

interface ChatMessengerProps {
  currentUserId: string;
  senderRole: string; // 'TRAINER' | 'TRAINEE'
  onClose?: () => void;
}

const CHAT_TRAINERS = [
  { userId: 'u_sarah', name: 'Sarah Tan', discipline: 'Yoga & Pilates', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY' },
  { userId: 'u_faiz', name: 'Coach Faiz Subri', discipline: 'Strength & Conditioning', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuIdggY96cPbYkxhPMHyYSEZQVUCfWOJP3N_XjZHy2cjbfbBe8s3VMjo0eHn80_fcIMAAAF9XsmYOwUEthMnXcvB4974Gmf0oHIP2pwWjW-434vE_vl-DsdIsKv3zP1v9Qso_eKmrZoTS81FTK7orVBn9iZdZqrfXeN7X39OP9QLt2cgD0bSNT3HVELQeobUuSzw2qzsVS1XFYG5l31bH9DauPRuk-3ihxIl0wsjV28iH1BPJsDdxxTauVSBToRTmaBW0973wtxfo8' },
  { userId: 'u_rishi', name: 'Rishi Kumar', discipline: 'HIIT & Fat Loss Specialist', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADB1ZHt7ssX9NUEls5g3R-nszN8liOzwo4WalDuhO9bP9jbzDIyH69L8_9W1wh7xxOkq5xViXT__xUnRIwlOTP9aS6htvLxLii1PsQ9QqfvJU86pvcMyaiGpRo5JAk5zShen0P1a-2rZNArw-4drQpgrkn6-3A2ZpKEcKYXrZBpRCbHVwGl0l6wpq0W1LymDFOLy0wU_RYGMli3Qwxy4PQhyvx7_0nVWGuaxfO231dYzv42WIS_jvmBP1bK7dwGLiKFT2SOKYHVKo' }
];

export default function ChatMessenger({ currentUserId, senderRole, onClose }: ChatMessengerProps) {
  const [activeReceiverId, setActiveReceiverId] = useState(
    senderRole === 'TRAINER' ? 'u_ahmad' : 'u_sarah'
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // Specific Reply tagging states
  const [replyTagType, setReplyTagType] = useState<'WORKOUT' | 'NUTRITION' | null>(null);
  const [replyTagTitle, setReplyTagTitle] = useState('');
  const [replyTagId, setReplyTagId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Polling mechanism
    return () => clearInterval(interval);
  }, [currentUserId, activeReceiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const data = await dbService.getChats(currentUserId, activeReceiverId);
      setMessages(data);
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
        receiverId: activeReceiverId,
        message: inputText,
        replyToType: replyTagType || undefined,
        replyToId: replyTagId || undefined,
        replyToTitle: replyTagTitle || undefined
      };

      const res = await dbService.createChatMessage(payload);

      if (res) {
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

  const activeTrainer = CHAT_TRAINERS.find(t => t.userId === activeReceiverId);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-150 shadow-lg overflow-hidden flex flex-col h-[520px] text-slate-800">
      
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-xs shrink-0">
            💬
          </div>
          <div className="text-left">
            <h3 className="font-sans font-bold text-white text-[13px] sm:text-sm leading-tight">
              {senderRole === 'TRAINER' 
                ? 'Ahmad Bin Ibrahim (Client)' 
                : `${activeTrainer?.name || 'Sarah Tan'} (Trainer)`}
            </h3>
            <p className="text-[10px] text-teal-400 font-medium uppercase mt-0.5">
              {senderRole === 'TRAINEE' ? `Coaching: ${activeTrainer?.discipline || 'Coach'}` : 'Active Client Thread'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={fetchMessages}
            title="Refresh messages"
            className="hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              title="Close chat"
              className="hover:bg-white/10 p-1.5 rounded-lg transition"
            >
              <X className="w-3.5 h-3.5 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Top Horizontal Row of Trainer Avatars (Removes vertical sidebar for full-width layout) */}
      {senderRole === 'TRAINEE' && (
        <div className="bg-slate-50 border-b border-slate-150 p-2 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider shrink-0">Coaches:</span>
          <div className="flex gap-1.5">
            {CHAT_TRAINERS.map(t => {
              const isActive = activeReceiverId === t.userId;
              return (
                <button
                  key={t.userId}
                  type="button"
                  onClick={() => {
                    setActiveReceiverId(t.userId);
                    setReplyTagType(null);
                    setReplyTagTitle('');
                    setReplyTagId('');
                  }}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 transition-all cursor-pointer text-xs whitespace-nowrap shrink-0 ${
                    isActive 
                      ? 'bg-slate-900 text-white font-semibold shadow-xs' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img 
                    referrerPolicy="no-referrer"
                    src={t.avatarUrl} 
                    className="w-4 h-4 rounded-full object-cover shrink-0" 
                    alt={t.name}
                  />
                  <span className="text-[11px]">{t.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main chat body (Full-width Column Layout) */}
      <div className="flex flex-1 flex-col min-h-0 bg-white">
        
        {/* Preset quick tag options */}
        <div className="bg-slate-50/70 border-b border-slate-100 p-1.5 px-3.5 flex flex-wrap items-center gap-1.5 text-[10px] text-left select-none shrink-0">
          <span className="text-slate-400 font-bold block">Tags:</span>
          <button
            onClick={() => selectPresetTag('WORKOUT', 'Workout Session Log', 'w_1')}
            className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 text-[10px]"
          >
            🏋️ Tag Workout
          </button>
          <button
            onClick={() => selectPresetTag('NUTRITION', 'Malaysian Food Meal', 'n_1')}
            className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 text-[10px]"
          >
            🍛 Tag Meal
          </button>
        </div>

        {/* Messages list bubble flow */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
              <p className="font-bold text-slate-500 text-xs">No chat history yet.</p>
              <p className="text-[10px] mt-0.5">Choose preset tags or type a message below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isSentByMe = m.senderId === currentUserId;
              return (
                <div key={m.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-2.5 shadow-3xs text-[12px] relative text-left ${
                    isSentByMe 
                      ? 'bg-slate-900 text-slate-50 rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'
                  }`}>
                    {/* Labeled Feedback tag */}
                    {m.replyToType && (
                      <div className={`mb-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isSentByMe 
                          ? 'bg-white/10 text-teal-300' 
                          : 'bg-indigo-50 border border-indigo-100/50 text-[#001F3F]'
                      }`}>
                        <Check className="w-2.5 h-2.5" />
                        <span>
                          Regarding {m.replyToType}: [{m.replyToTitle}]
                        </span>
                      </div>
                    )}

                    <p className="leading-snug font-sans whitespace-pre-wrap">
                      {m.message}
                    </p>
                    
                    <div className="flex justify-end items-center gap-1 mt-1 opacity-60 text-[8px] select-none">
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isSentByMe && <span className="text-[8px] text-teal-400 font-extrabold font-mono">✓ Sent</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Form input bottom bar */}
        <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-100 p-2 flex flex-col gap-1.5 shrink-0">
          
          {/* Show currently tagged label if selected */}
          {replyTagType && (
            <div className="bg-teal-50 border border-teal-100 text-teal-800 px-2 py-0.5 rounded flex justify-between items-center text-[10px]">
              <span className="font-bold uppercase tracking-wider text-[8px]">
                📌 Tag: Replying to {replyTagType} &ldquo;{replyTagTitle}&rdquo;
              </span>
              <button 
                type="button" 
                onClick={() => {
                  setReplyTagType(null);
                  setReplyTagTitle('');
                  setReplyTagId('');
                }}
                className="font-black hover:text-teal-900 text-[10px] shrink-0"
              >
                ✕ Clear
              </button>
            </div>
          )}

          <div className="flex gap-1.5">
            <input 
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-teal-500"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold p-1.5 px-3 rounded-lg transition flex items-center justify-center shrink-0 cursor-pointer"
              id="btn-chat-send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
