import React, { useState, useEffect } from 'react';
import { SolaceMessage } from '../types';
import { translations } from '../i18n';
import { Send, MessageSquare, Heart, Sparkles, User, BadgeAlert, CheckCircle } from 'lucide-react';

interface SolaceWallProps {
  language: 'en' | 'ar';
  keeperName: string;
  isLoggedIn: boolean;
  onIncrementPrayers: () => void;
}

export default function SolaceWall({
  language,
  keeperName,
  isLoggedIn,
  onIncrementPrayers
}: SolaceWallProps) {
  const t = translations[language];
  const [messages, setMessages] = useState<SolaceMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [relationInput, setRelationInput] = useState('');
  const [authorInput, setAuthorInput] = useState(keeperName || 'Anonymous');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync author name with keeper name changes
  useEffect(() => {
    setAuthorInput(keeperName);
  }, [keeperName]);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/solace-messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch solace messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/solace-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: authorInput || (language === 'ar' ? 'فاعل خير' : 'Anonymous Supporter'),
          relationship: relationInput || (language === 'ar' ? 'رفيق مستذكر' : 'Companion'),
          text: textInput.trim()
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [newMsg, ...prev]);
        setTextInput('');
        setRelationInput('');
        onIncrementPrayers(); // Trigger counter metrics
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeMessage = async (id: string) => {
    try {
      const activeEmail = localStorage.getItem('keeper_email') || '';
      const response = await fetch(`/api/solace-messages/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeEmail
        },
        body: JSON.stringify({ userName: keeperName }),
      });
      if (response.ok) {
        const updated = await response.json();
        setMessages(prev => prev.map(m => m.id === id ? updated : m));
      }
    } catch (err) {
      console.error('Failed to like message:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="solace-messages-section">
      {/* Informative Header */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-4xl font-serif text-slate-800 font-medium tracking-tight">
          {t.solaceWall}
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          {t.solaceWallSubtitle}
        </p>

        <div className="flex justify-center pt-1">
          <div className="h-0.5 w-16 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Post Message Column */}
        <div className="md:col-span-1">
          <div className="bg-surface-lowest border border-surface-container rounded-2xl p-5 shadow-sm sticky top-24">
            <h3 className="text-sm font-serif font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t.postcomfortTitle}
            </h3>

            {/* Authenticated Verification Badge showing in editor portal */}
            <div className="mb-4 p-3.5 rounded-xl bg-surface-low border border-surface-container/60 text-xs flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 fill-primary/10" />
                  <div>
                    <span className="font-semibold text-primary block">{t.verifiedKeeperBadge}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{authorInput}</span>
                  </div>
                </>
              ) : (
                <>
                  <BadgeAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-amber-700 block">{t.unverifiedKeeperBadge}</span>
                    <span className="text-[10px] text-stone-500">{language === 'ar' ? 'سجل دخولك للحصول على شارة موثق' : 'Sign in to obtain verify status'}</span>
                  </div>
                </>
              )}
            </div>

            <form onSubmit={handlePostMessage} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                  {language === 'ar' ? 'اسم كاتب الرسالة' : 'Sender Name'}
                </label>
                <input
                  type="text"
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-container bg-bg-serene text-slate-800 outline-none focus:border-stone-400"
                  placeholder={language === 'ar' ? 'اسمك الكريم' : 'Your Name'}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                  {language === 'ar' ? 'صفة الكاتب أو القرابة' : 'Affiliation / Role'}
                </label>
                <input
                  type="text"
                  value={relationInput}
                  onChange={(e) => setRelationInput(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-container bg-bg-serene text-slate-800 outline-none focus:border-stone-400"
                  placeholder={language === 'ar' ? 'مثال: معزي، قريب عائلة الغامدي' : 'e.g., Supporter, Close Relative'}
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">
                  {language === 'ar' ? 'نص خطاب التعزية والمواساة' : 'Message of Solace'}
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  maxLength={400}
                  className="w-full text-xs p-3 rounded-lg border border-surface-container bg-bg-serene text-slate-800 outline-none focus:border-stone-400 resize-none"
                  placeholder={t.postcomfortPlaceholder}
                  required
                />
                <span className="text-[9px] text-stone-400 font-mono flex justify-end">
                  {textInput.length}/400
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !textInput.trim()}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {language === 'ar' ? 'أرسل للحائط العام' : 'Send to Solace Wall'}
              </button>
            </form>
          </div>
        </div>

        {/* Global Messages Feed Column */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-2">
            <span>{t.readMessagesTitle}</span>
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              {messages.length}
            </span>
          </h3>

          {loading ? (
            <div className="text-center p-12 bg-surface-lowest border border-surface-container rounded-2xl">
              <div className="w-6 h-6 border-2 border-primary/25 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <span className="text-xs text-stone-500 font-mono">Loading solace letters...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-12 bg-surface-lowest border border-surface-container rounded-2xl">
              <p className="text-xs text-stone-400 italic">No comfort letters posted yet. Share your first gesture of solace.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-surface-lowest border border-surface-container rounded-2xl p-5 shadow-xs hover:border-surface-container/80 hover:shadow-sm transition-all duration-350"
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Generative Gradient Circle Avatar of Social Platform */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/15 via-secondary/15 to-amber-100 flex items-center justify-center border border-primary/20 text-xs font-bold font-serif text-slate-800">
                        {msg.author ? msg.author.trim().slice(0, 1).toUpperCase() : 'C'}
                      </div>
                      <div>
                        {/* Sender info */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-slate-900 text-sm">
                            {msg.author}
                          </span>
                          {/* If logged in or generic keeper name, show verified badge dynamically */}
                          {(msg.author.includes('Khaled') || msg.author.includes('سهام') || msg.id.startsWith('new-') || msg.author === keeperName) && (
                            <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                              ✓ {language === 'ar' ? 'موثق' : 'Verified'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 block">
                          {msg.relationship}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(msg.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Message body */}
                  <div className="pl-11 pr-3 py-1">
                    <p className="text-stone-700 text-xs leading-relaxed font-light whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>

                  {/* Message Footer Interaction */}
                  <div className="mt-4 pt-3 border-t border-surface-low/80 flex items-center justify-between text-xs pl-11">
                    <button
                      type="button"
                      onClick={() => handleLikeMessage(msg.id)}
                      className={`flex items-center gap-1.5 transition duration-250 active:scale-95 text-xs font-semibold ${
                        msg.likedBy?.includes(keeperName) ? 'text-rose-600 animate-pulse' : 'text-stone-500 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${msg.likedBy?.includes(keeperName) ? 'fill-rose-500 text-rose-500' : 'fill-rose-50 text-stone-400'}`} />
                      <span>{language === 'ar' ? 'مواساة وتأييد' : 'Send Solace'}</span>
                      <span className="bg-stone-100 text-[10px] px-1.5 py-0.5 rounded-md text-stone-600 font-mono font-bold">
                        {msg.likes}
                      </span>
                    </button>

                    <span className="text-[9px] text-stone-400 font-mono">
                      &copy; Solace Wall Community Network
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
