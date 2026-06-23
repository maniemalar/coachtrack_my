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
    <div className="w-full bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden flex flex-col h-[580px] sm:h-[650px] text-slate-800">
      
      {/* Header */}
      <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">
            💬
          </div>
          <div className="text-left">
            <h3 className="font-display font-black text-white text-sm sm:text-base leading-tight">
              {senderRole === 'TRAINER' 
                ? 'Ahmad Bin Ibrahim (Client)' 
                : `${activeTrainer?.name || 'Sarah Tan'} (Trainer)`}
            </h3>
            <p className="text-[10px] text-teal-400 font-bold tracking-wider uppercase mt-1">
              {senderRole === 'TRAINEE' ? `Chatting with ${activeTrainer?.discipline || 'Coach'}` : 'Active Client Thread'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchMessages}
            title="Refresh messages"
            className="hover:bg-white/10 p-2 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              title="Close chat"
              className="hover:bg-white/10 p-2 rounded-lg transition"
            >
              <X className="w-4 h-4 text-slate-300" />
            </button>
          )}
        </div>
      </div>

      {/* Main chat body with optional selection sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* Sidebar of Trainers (Only visible to Trainee) */}
        {senderRole === 'TRAINEE' && (
          <div className="w-56 sm:w-64 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0 text-left">
            <div className="p-3 border-b border-slate-200 bg-white shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Trainer</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {CHAT_TRAINERS.map(t => {
                const isActive = activeReceiverId === t.userId;
                return (
                  <button
                    key={t.userId}
                    onClick={() => {
                      setActiveReceiverId(t.userId);
                      setReplyTagType(null);
                      setReplyTagTitle('');
                      setReplyTagId('');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-md font-semibold' 
                        : 'hover:bg-slate-250 hover:bg-slate-200/50 text-slate-750'
                    }`}
                  >
                    <img 
                      referrerPolicy="no-referrer"
                      src={t.avatarUrl} 
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" 
                      alt={t.name}
                    />
                    <div className="min-w-0">
                      <p className="text-xs truncate font-black leading-tight">{t.name}</p>
                      <p className={`text-[9px] truncate ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>
                        {t.discipline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messaging Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          
          {/* Preset quick tag options */}
          <div className="bg-slate-50 border-b border-slate-100 p-2 px-4 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-left">
            <span className="text-slate-400 font-bold block">Preset Contexts:</span>
            <button
              onClick={() => selectPresetTag('WORKOUT', 'Workout Session Log', 'w_1')}
              className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-700 shrink-0"
            >
              🏋️ Tag Workout Log
            </button>
            <button
              onClick={() => selectPresetTag('NUTRITION', 'Malaysian Food Meal', 'n_1')}
              className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-700 shrink-0"
            >
              🍛 Tag Nasi Lemak
            </button>
          </div>

          {/* Messages list bubble flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-55/40 bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                <MessageCircle className="w-10 h-10 text-slate-350 mx-auto mb-2" />
                <p className="font-bold text-slate-500 text-xs">No chat history with this coach.</p>
                <p className="text-[11px] mt-0.5">Select tags or type to initiate direct communication.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isSentByMe = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm text-xs relative text-left ${
                      isSentByMe 
                        ? 'bg-slate-900 text-slate-50 rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-150 rounded-tl-none'
                    }`}>
                      {/* Labeled Feedback tag */}
                      {m.replyToType && (
                        <div className={`mb-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          isSentByMe 
                            ? 'bg-white/10 text-teal-300' 
                            : 'bg-indigo-50 border border-indigo-100/50 text-[#001F3F]'
                        }`}>
                          <Check className="w-3 h-3" />
                          <span>
                            Regarding {m.replyToType}: [{m.replyToTitle}]
                          </span>
                        </div>
                      )}

                      <p className="leading-relaxed font-sans text-xs whitespace-pre-wrap">
                        {m.message}
                      </p>
                      
                      <div className="flex justify-end items-center gap-1 mt-1.5">
                        <span className="text-[8px] opacity-60">
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
          <form onSubmit={handleSendMessage} className="bg-white border-t border-slate-100 p-3.5 flex flex-col gap-2 shrink-0">
            
            {/* Show currently tagged label if selected */}
            {replyTagType && (
              <div className="bg-teal-50 border border-teal-100 text-teal-805 px-3 py-1 rounded-lg flex justify-between items-center text-[10px]">
                <span className="font-bold uppercase tracking-wider text-[9px]">
                  📌 Active Tag: Replying to {replyTagType} &ldquo;{replyTagTitle}&rdquo;
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setReplyTagType(null);
                    setReplyTagTitle('');
                    setReplyTagId('');
                  }}
                  className="font-black hover:text-teal-900 text-xs shrink-0"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-teal-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-teal-400 font-bold p-2.5 px-3.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer"
                id="btn-chat-send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
