import React, { useState, useEffect, useRef } from 'react';
import { ChatConversation, ChatMessage } from '../types';
import { Search, Phone, MoreVertical, Plus, Smile, Send, Compass, UserCheck, MessageSquare, Heart } from 'lucide-react';

interface SanctuaryChatViewProps {
  language: 'en' | 'ar';
  userAvatar?: string;
}

export default function SanctuaryChatView({ language, userAvatar }: SanctuaryChatViewProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string>('elena-vance');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error('Failed to load chats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Scroll to bottom on load/update message stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeId]);

  const activeConv = conversations.find(c => c.id === activeId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const typedText = inputText;
    setInputText('');

    try {
      const res = await fetch(`/api/chats/${activeConv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textEn: typedText,
          textAr: typedText,
          sender: 'me'
        })
      });

      if (res.ok) {
        // Refetch chat list or update state locally
        const resData = await res.json();
        const updatedConv: ChatConversation = resData.conversation;
        
        setConversations(prev => prev.map(c => c.id === updatedConv.id ? updatedConv : c));

        // Auto comforting AI response simulation after 1 second to bring conversation to life!
        setTimeout(async () => {
          let replyEn = "Thank you for these serene words. Arthur would be very pleased to hear this.";
          let replyAr = "أشكرك جزيل الشكر على هذه الكلمات العطرة. كان آرثر ليسعد كثيراً بسماع هذا الأثر الدافئ.";

          if (typedText.toLowerCase().includes('yes') || typedText.includes('نعم') || typedText.includes('تم')) {
            replyEn = "Wonderful, I will compile the final chapter tonight and we can publish tomorrow morning.";
            replyAr = "رائع جداً، سأقوم بصياغة وتنسيق الفصل الختامي في السجل الليلة لنقوم بنشر المزار صباح الغد.";
          } else if (typedText.toLowerCase().includes('photo') || typedText.includes('صورة') || typedText.includes('صور')) {
            replyEn = "I agree, the photos add so much dignity and life to the timeline.";
            replyAr = "أتفق معك تماماً، فالصور الدافئة تعيد الوقار والحياة إلى خط الذكريات.";
          }

          const botRes = await fetch(`/api/chats/${activeConv.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              textEn: replyEn,
              textAr: replyAr,
              sender: 'other'
            })
          });

          if (botRes.ok) {
            const botData = await botRes.json();
            const botUpdatedConv: ChatConversation = botData.conversation;
            setConversations(prev => prev.map(c => c.id === botUpdatedConv.id ? botUpdatedConv : c));
          }
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const name = language === 'ar' ? c.userNameAr : c.userNameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-serif text-stone-500">
          {language === 'ar' ? 'جاري فتح صندوق رسائل الطمأنينة...' : 'Opening Sanctuary Letters...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in" id="sanctuary-chat-workspace">
      
      {/* Container holding sidebar & main chat box strictly styled based on visual */}
      <div className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 min-h-[680px] shadow-sm">
        
        {/* Left Sidebar holding Search & list of keepers */}
        <div className={`border-r border-stone-200/80 flex flex-col ${language === 'ar' ? 'order-last lg:border-r-0 lg:border-l' : ''}`}>
          
          {/* Header search filter input matching mockup */}
          <div className="p-5 border-b border-stone-100 space-y-4">
            <div className="relative">
              <Search className={`w-4 h-4 text-stone-400 absolute top-3.5 ${language === 'ar' ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في محادثات السكينة...' : 'Search conversations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs font-sans pl-11 pr-4 py-3 rounded-2xl bg-[#F8F6F4] border-transparent outline-none focus:bg-white focus:border-stone-200 focus:ring-1 focus:ring-stone-200 transition ${
                  language === 'ar' ? 'pl-4 pr-11' : ''
                }`}
              />
            </div>
          </div>

          {/* Conversations Stack list */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-50 max-h-[550px]" id="chat-list-sidebar">
            {filteredConversations.length === 0 ? (
              <p className="text-xs text-stone-400 italic text-center py-10 font-sans">
                {language === 'ar' ? 'لا توجد محادثات تطابق البحث.' : 'No conversations found.'}
              </p>
            ) : (
              filteredConversations.map(c => {
                const isActive = c.id === activeId;
                const name = language === 'ar' ? c.userNameAr : c.userNameEn;
                const lastMsg = language === 'ar' ? c.lastMessageAr : c.lastMessageEn;
                const status = language === 'ar' ? c.statusAr : c.statusEn;

                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`p-4 md:p-5 flex items-center gap-4 cursor-pointer transition select-none relative ${
                      isActive 
                        ? 'bg-[#A8D3E6]/10 border-s-4 border-primary' 
                        : 'hover:bg-stone-50'
                    }`}
                    id={`chat-item-${c.id}`}
                  >
                    {/* Avatar box */}
                    <div className="w-12 h-12 rounded-full bg-primary/5 text-slate-800 flex items-center justify-center text-xl shadow-inner relative">
                      <span>{c.userAvatar}</span>
                      {status === 'Active Now' && (
                        <span className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-slate-950 text-sm truncate">
                          {name}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {c.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 truncate font-sans">
                        {lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area holding chat stream and messages exactly like mockup */}
        <div className="lg:col-span-2 flex flex-col bg-[#FAF9F6]">
          {activeConv ? (
            <>
              {/* Profile Bar Header with Phone and Dot menu */}
              <div className="bg-white border-b border-stone-200/60 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/5 text-slate-800 flex items-center justify-center text-lg relative">
                    <span>{activeConv.userAvatar}</span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-950 text-base leading-none">
                      {language === 'ar' ? activeConv.userNameAr : activeConv.userNameEn}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] md:text-xs text-stone-500 font-sans">
                        {language === 'ar' ? 'نشط الآن' : 'Active Now'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Telephone & list settings actions */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(language === 'ar' ? 'الاتصال الصوتي الرقمي غير متصل الآن.' : 'Voice connection is currently silent.')}
                    className="p-2 hover:bg-stone-50 text-stone-500 hover:text-slate-950 rounded-full transition active:scale-90"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-stone-50 text-stone-500 hover:text-slate-950 rounded-full transition">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Stream Window Scrollable Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[460px]" id="message-stream-body">
                
                {/* Date separator indicator */}
                <div className="flex justify-center my-2">
                  <span className="bg-stone-200/55 text-stone-600 font-mono uppercase tracking-widest text-[9px] px-3 py-1 rounded-full">
                    {language === 'ar' ? 'الإثنين، ٢٤ أكتوبر' : 'MONDAY, OCT 24'}
                  </span>
                </div>

                {activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  const msgText = language === 'ar' ? msg.textAr : msg.textEn;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      id={`msg-line-${msg.id}`}
                    >
                      <div
                        className={`px-5 py-3 md:py-3.5 rounded-2xl max-w-[85%] text-xs md:text-sm shadow-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#A8D3E6]/30 text-slate-900 border border-[#A8D3E6]/40 rounded-tr-none'
                            : 'bg-white text-slate-900 border border-stone-200/50 rounded-tl-none'
                        }`}
                      >
                        <p>{msgText}</p>
                      </div>
                      <span className="text-[9px] text-stone-400 font-mono mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area Form at Bottom */}
              <form onSubmit={handleSendMessage} className="bg-white border-t border-stone-200/60 p-4 md:p-5">
                <div className="flex items-center gap-3">
                  
                  {/* Plus Add attachments icon */}
                  <button
                    type="button"
                    onClick={() => alert(language === 'ar' ? 'مساهمة المحتوى مقتصرة حالياً.' : 'Attachment capability is locked.')}
                    className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 transition active:scale-90"
                    id="btn-chat-plus"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Input Element */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={language === 'ar' ? 'اكتب رسالة مواساة وتذكار هادئة...' : 'Type a message of remembrance...'}
                      className="w-full text-xs md:text-sm pl-4 pr-11 py-3 border border-stone-200 rounded-2xl outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition"
                      id="input-chat-message"
                    />
                    
                    {/* Smile/Emoji selector trigger */}
                    <button
                      type="button"
                      onClick={() => setInputText(p => p + ' 🕊️')}
                      className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 transition"
                    >
                      <Smile className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Send Action Round Green Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-3 rounded-full text-white transition duration-300 active:scale-95 ${
                      inputText.trim()
                        ? 'bg-[#2C6E49] hover:bg-[#1E4D32] shadow-sm cursor-pointer'
                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    }`}
                    id="btn-chat-send"
                  >
                    <Send className={`w-4 s-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </button>

                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-10">
              <MessageSquare className="w-12 h-12 text-stone-300" />
              <p className="font-serif text-sm text-stone-400">
                {language === 'ar' ? 'اختر محادثة لعرض صندوق السكينة.' : 'Select a conversation to begin chatting.'}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
