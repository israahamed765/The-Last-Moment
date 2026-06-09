import React, { useState } from 'react';
import { Memorial, Prayer, MemorialTheme } from '../types';
import { translations, themes, presetIllustrations } from '../i18n';
import { Sparkles, Send, User, MessageCircle, Heart, Flame, Share2, Copy } from 'lucide-react';

interface MemorialCardProps {
  key?: string;
  memorial: Memorial;
  language: 'en' | 'ar';
  keeperName: string;
  onUpdate: (updated: Memorial) => void;
  incrementCandleCount: (offset?: number) => void;
  incrementPrayerCount: (offset?: number) => void;
  onViewCreatorProfile?: (creatorId: string) => void;
}

export default function MemorialCard({
  memorial,
  language,
  keeperName,
  onUpdate,
  incrementCandleCount,
  incrementPrayerCount,
  onViewCreatorProfile
}: MemorialCardProps) {
  const t = translations[language];
  const [isLighting, setIsLighting] = useState(false);
  const [authorName, setAuthorName] = useState(keeperName || '');
  const [visitorRelation, setVisitorRelation] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState(false);
  const [isGeneratingAIPrayer, setIsGeneratingAIPrayer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showCandlesList, setShowCandlesList] = useState(false);
  
  // Custom Instagram caption truncation
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Double-tap pulse variables
  const [lastTap, setLastTap] = useState(0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Find theme meta
  const themeMeta = themes.find(th => th.key === memorial.theme) || themes[themes.length - 1];

  // Resolve localized textfields
  const name = language === 'ar' ? memorial.nameAr : memorial.nameEn;
  const relationship = language === 'ar' ? memorial.relationshipAr : memorial.relationshipEn;
  const lastWords = language === 'ar' ? memorial.lastWordsAr : memorial.lastWordsEn;
  const story = language === 'ar' ? memorial.storyAr : memorial.storyEn;

  // Render Preset Image Atmosphere description or custom
  const isPresetImage = memorial.image && ['sunset', 'stars', 'meadow', 'sky', 'lotus'].includes(memorial.image);
  const imageUrl = isPresetImage ? presetIllustrations[memorial.image!] : memorial.image;

  // Handle lighting or toggling a virtual candle (Liking & Unliking)
  const handleLightCandle = async () => {
    if (isLighting) return;
    setIsLighting(true);
    try {
      const activeEmail = localStorage.getItem('keeper_email') || '';
      const wasLitByMe = memorial.candlesLitBy?.includes(keeperName);

      const response = await fetch(`/api/memorials/${memorial.id}/candle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeEmail
        },
        body: JSON.stringify({ userName: keeperName }),
      });

      if (!response.ok) {
        throw new Error('Failed to light candle');
      }

      const data = await response.json();
      onUpdate({
        ...memorial,
        candlesCount: data.candlesCount,
        candlesLitBy: data.candlesLitBy,
      });

      if (wasLitByMe) {
        incrementCandleCount(-1);
      } else {
        incrementCandleCount(1);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLighting(false);
    }
  };

  // Double tap to light tribute candle
  const handleDoubleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      // Fire double tap trigger!
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 900);
      handleLightCandle();
    }
    setLastTap(now);
  };

  // Copy shareable link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/memorial/${memorial.id}`;
    navigator.clipboard.writeText(url);
    setToastMsg(language === 'ar' ? '✓ تم نسخ الرابط لنشره مع العائلة والمحبين' : '✓ Copied remembrance link to share');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Submit comment/prayer
  const handleAddPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerText.trim()) return;

    setIsSubmittingPrayer(true);
    setErrorMsg('');
    try {
      const activeEmail = localStorage.getItem('keeper_email') || '';
      const response = await fetch(`/api/memorials/${memorial.id}/prayers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeEmail
        },
        body: JSON.stringify({
          author: authorName || (language === 'ar' ? 'فاعل خير' : 'Anonymous Visitor'),
          relationship: visitorRelation || (language === 'ar' ? 'زائر مُستذكر' : 'Rememberer'),
          text: prayerText,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not submit prayer');
      }

      const newPrayer: Prayer = await response.json();
      onUpdate({
        ...memorial,
        prayers: [...memorial.prayers, newPrayer],
      });
      setPrayerText('');
      setVisitorRelation('');
      incrementPrayerCount();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving prayer');
    } finally {
      setIsSubmittingPrayer(false);
    }
  };

  // React to a specific comment/prayer (Toggle support!)
  const handleReactToComment = async (prayerId: string, reactionType: 'amen' | 'peace' | 'rose') => {
    const savedKey = `react_${memorial.id}_${prayerId}_${reactionType}`;
    const alreadyReacted = localStorage.getItem(savedKey) === 'true';

    try {
      const response = await fetch(`/api/memorials/${memorial.id}/prayers/${prayerId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reactionType, undo: alreadyReacted }),
      });

      if (response.ok) {
        const updatedPrayer = await response.json();
        onUpdate({
          ...memorial,
          prayers: memorial.prayers.map(p => p.id === prayerId ? updatedPrayer : p),
        });

        if (alreadyReacted) {
          localStorage.removeItem(savedKey);
        } else {
          localStorage.setItem(savedKey, 'true');
        }
      }
    } catch (err) {
      console.error('Error reacting to comment:', err);
    }
  };

  // Gemini AI - Generate a Custom Comforting Prayer
  const handleGenerateAIPrayer = async () => {
    if (isGeneratingAIPrayer) return;
    setIsGeneratingAIPrayer(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/gemini/suggest-prayer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          category: memorial.category,
          language: language,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gemini error');
      }

      const data = await response.json();
      if (data.prayer) {
        setPrayerText(data.prayer);
      }
    } catch (err: any) {
      setErrorMsg(language === 'ar' ? 'لم تتوفر الصياغة التلقائية لعدم تهيئة مفتاح جيميناي.' : 'Could not fetch AI advice (Check if GEMINI_API_KEY is configured).');
    } finally {
      setIsGeneratingAIPrayer(false);
    }
  };

  const isHappy = memorial.category === 'happy';

  return (
    <div
      className="bg-white border border-surface-container/80 rounded-2xl overflow-hidden shadow-xs relative max-w-full md:max-w-2xl mx-auto"
      id={`memorial-card-${memorial.id}`}
    >
      {/* Dynamic inline floating links alert */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white font-semibold text-xs py-2 px-4 rounded-full shadow-lg z-50 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* 1. INSTAGRAM FEED HEADER BLOCK */}
      <div className="p-3.5 flex items-center justify-between border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          {/* Round Creator Avatar Capsule */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-[1.5px] flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-serif font-black text-amber-800">
              {memorial.creatorName ? memorial.creatorName.trim().charAt(0).toUpperCase() : '✨'}
            </div>
          </div>
          {/* Author Name and relation Details */}
          <div className="text-left font-sans">
            <button
              onClick={() => {
                if (onViewCreatorProfile && memorial.creatorId) onViewCreatorProfile(memorial.creatorId);
              }}
              className="text-xs font-extrabold text-slate-800 hover:underline inline-flex items-center gap-0.5"
            >
              <span>{language === 'ar' ? (memorial.creatorId === 'clara-windham' ? 'كلارا ويندهام' : memorial.creatorId === 'khaled-jamil' ? 'خالد جميل' : memorial.creatorName) : memorial.creatorName}</span>
              <span className="text-[8px] bg-primary/15 text-primary rounded px-1 py-0.2 font-black">✓</span>
            </button>
            <p className="text-[9px] text-stone-400 font-medium">
              {relationship} • {isHappy ? (language === 'ar' ? 'سعيد' : 'Happy Occasion') : (language === 'ar' ? 'غادرنا' : 'Departed')}
            </p>
          </div>
        </div>

        {/* Category Pill Tag */}
        <span className="bg-stone-100 border border-stone-200/55 rounded-full text-[9px] font-mono tracking-wider font-extrabold text-stone-500 px-2.5 py-0.5 uppercase shrink-0">
          {language === 'ar' ? (isHappy ? 'ذكرى سعيدة' : 'أثر مبارك') : (isHappy ? 'Joyous Memorial' : 'Legacy')}
        </span>
      </div>

      {/* 2. DUAL-TAP-TO-LIKE COMPATIBLE PHOTO PORTAL */}
      <div 
        onClick={handleDoubleTap}
        className="relative overflow-hidden cursor-pointer select-none bg-stone-900 flex items-center justify-center min-h-[280px] sm:min-h-[380px]"
      >
        {/* Real photo image background */}
        {imageUrl && imageUrl !== 'none' ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover max-h-[500px]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`absolute inset-0 p-8 flex flex-col justify-center items-center text-center ${themeMeta.cardClass}`}>
            <span className="text-5xl mb-3 animate-pulse">{isHappy ? '☀️' : '🕯️'}</span>
            <h3 className="text-xl sm:text-2xl font-serif font-serif font-black">{name}</h3>
            {lastWords && (
              <blockquote className="text-xs sm:text-sm font-serif italic opacity-90 leading-relaxed max-w-sm mt-3 border-l-2 border-white/20 pl-3">
                "{lastWords}"
              </blockquote>
            )}
          </div>
        )}

        {/* Giant spring heart/sparkle overlay upon Double Key Tap */}
        {showHeartOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-40 animate-ping pointer-events-none">
            <div className="p-6 rounded-full bg-stone-950/45 backdrop-blur-xs">
              <Flame className="w-20 h-20 text-amber-500 fill-amber-400 drop-shadow-2xl" />
            </div>
          </div>
        )}

        {/* Absolute Bottom date tag strip on image */}
        {imageUrl && imageUrl !== 'none' && (
          <div className={`absolute bottom-3 ${language === 'ar' ? 'right-3' : 'left-3'} bg-black/45 text-white text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded backdrop-blur-xs`}>
            {isHappy ? (
              <span>✨ {language === 'ar' ? 'سنة اللحظة السعيدة:' : 'Happy Year:'} {memorial.birthYear}</span>
            ) : (
              <span>🕯️ {memorial.birthYear} - {memorial.passingYear}</span>
            )}
          </div>
        )}
      </div>

      {/* 3. INSTAGRAM FEED TOOLBAR */}
      <div className="p-3.5 flex items-center justify-between border-t border-stone-100">
        <div className="flex items-center gap-4">
          
          {/* Flame Like Trigger */}
          <button 
            onClick={handleLightCandle}
            disabled={isLighting}
            className={`transition active:scale-90 hover:scale-[1.03] outline-none ${isLighting ? 'animate-pulse' : ''}`}
            title="Light/Toggle Tribute Candle"
          >
            <Flame className={`w-6 h-6 ${memorial.candlesLitBy?.includes(keeperName) ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-700'}`} />
          </button>

          {/* Comment scrolling scroll trigger */}
          <button 
            onClick={() => {
              const el = document.getElementById(`comment-form-box-${memorial.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="transition active:scale-90 hover:scale-[1.03] outline-none"
            title="Add Solace Comment"
          >
            <MessageCircle className="w-6 h-6 text-slate-700" />
          </button>

          {/* Legacy Share Clipboard */}
          <button 
            onClick={handleCopyLink}
            className="transition active:scale-90 hover:scale-[1.03]"
            title="Copy Public Remembrance Link"
          >
            <Share2 className="w-5.5 h-5.5 text-slate-700" />
          </button>
        </div>

        {/* Expand candles book */}
        <button
          onClick={() => setShowCandlesList(!showCandlesList)}
          className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-amber-600 hover:underline"
        >
          🕯️ {memorial.candlesCount} {language === 'ar' ? 'شمعة مضاءة' : 'lights ignited'}
        </button>
      </div>

      {/* Candles Keepers Inline drawer */}
      {showCandlesList && (
        <div className="px-4 py-2.5 bg-amber-50/40 border-y border-amber-100 text-[10px] text-stone-600 animate-fade-in flex flex-wrap gap-1 items-center">
          <span className="font-bold mr-1">{t.candleListHeader}:</span>
          {memorial.candlesLitBy.length === 0 ? (
            <span className="italic">{language === 'ar' ? 'أنر المحراب لتكون أول حارس لهذه الذاكرة.' : 'Ignite candle to be primary guardian.'}</span>
          ) : (
            memorial.candlesLitBy.map((n, i) => (
              <span key={i} className="bg-white px-2 py-0.5 rounded border border-stone-200 font-semibold text-slate-800">
                🕯️ {n}
              </span>
            ))
          )}
        </div>
      )}

      {/* 4. DETAILS, CAPTIONS & STORY BLOCK */}
      <div className="px-4 pb-4 font-sans text-xs space-y-1.5 text-left">
        
        {/* Caption Name & Quote matching Instagram bold style */}
        <p className="leading-relaxed">
          <span className="font-extrabold text-slate-900 mr-1.5 inline-block">
            {name}
          </span>
          {lastWords && (
            <span className="font-serif italic text-stone-700 pr-1 select-all">
              " {lastWords} "
            </span>
          )}
        </p>

        {/* Detailed Story: Truncated caption style inside fee */}
        {story && (
          <div className="text-stone-600 font-light text-[11.5px] leading-relaxed">
            {isExpanded ? (
              <p className="whitespace-pre-wrap">{story}</p>
            ) : (
              <p>
                {story.slice(0, 120)}
                {story.length > 120 && (
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="text-stone-400 font-bold hover:underline ml-1 cursor-pointer"
                  >
                    ... {language === 'ar' ? 'المزيد' : 'more'}
                  </button>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 5. INSTAGRAM-Style INLINE COMMENTS WALL */}
      <div className="px-4 py-3 bg-stone-50/50 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">
            {language === 'ar' ? 'التعليقات والأدعية' : 'Solace ledger comments'} ({memorial.prayers.length})
          </span>

          {memorial.prayers.length > 2 && (
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-[10px] font-sans font-bold text-primary hover:underline"
            >
              {showAllComments 
                ? (language === 'ar' ? 'إخفاء الردود' : 'Hide thread') 
                : (language === 'ar' ? `عرض الكل (${memorial.prayers.length})` : `View all ${memorial.prayers.length}`)}
            </button>
          )}
        </div>

        {/* List of comments */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-none">
          {memorial.prayers.length === 0 ? (
            <p className="text-[11px] text-stone-400 italic py-1 text-center">
              {t.noPrayersYet}
            </p>
          ) : (
            (() => {
              const shownComments = showAllComments ? memorial.prayers : memorial.prayers.slice(-2);
              return shownComments.map((pr) => (
                <div key={pr.id} className="bg-white p-2.5 rounded-xl border border-stone-200/50 text-[11px] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4.5 h-4.5 rounded-full bg-stone-100 flex items-center justify-center text-[9px] font-extrabold text-[#84A59D] border border-stone-200/50">
                        {pr.author ? pr.author.trim().charAt(0).toUpperCase() : 'G'}
                      </span>
                      <span className="font-extrabold text-slate-800">{pr.author}</span>
                    </div>
                    <span className="text-[9px] text-stone-400 font-mono italic">{pr.relationship}</span>
                  </div>

                  <p className="text-stone-600 font-light font-sans pl-1 leading-relaxed">
                    {pr.text}
                  </p>

                  {/* Comments support buttons */}
                  <div className="flex items-center gap-3 pt-1 border-t border-stone-50 text-[8.5px] font-mono text-stone-400">
                    <button 
                      onClick={() => handleReactToComment(pr.id, 'amen')}
                      className={`flex items-center gap-1 hover:text-amber-600 transition px-1 py-0.5 rounded ${
                        localStorage.getItem(`react_${memorial.id}_${pr.id}_amen`) === 'true'
                          ? 'text-amber-600 font-bold bg-amber-50/70 border border-amber-200/50'
                          : ''
                      }`}
                    >
                      <span>🤲 {language === 'ar' ? 'آمين' : 'Amen'}</span>
                      <span className="bg-stone-50 px-1 py-0.2 rounded font-extrabold">{pr.reactions?.amen || 0}</span>
                    </button>

                    <button 
                      onClick={() => handleReactToComment(pr.id, 'peace')}
                      className={`flex items-center gap-1 hover:text-indigo-600 transition px-1 py-0.5 rounded ${
                        localStorage.getItem(`react_${memorial.id}_${pr.id}_peace`) === 'true'
                          ? 'text-indigo-600 font-bold bg-indigo-50/70 border border-indigo-200/50'
                          : ''
                      }`}
                    >
                      <span>🤍 {language === 'ar' ? 'سكينة' : 'Peace'}</span>
                      <span className="bg-stone-50 px-1 py-0.2 rounded font-extrabold">{pr.reactions?.peace || 0}</span>
                    </button>

                    <button 
                      onClick={() => handleReactToComment(pr.id, 'rose')}
                      className={`flex items-center gap-1 hover:text-emerald-600 transition px-1 py-0.5 rounded ${
                        localStorage.getItem(`react_${memorial.id}_${pr.id}_rose`) === 'true'
                          ? 'text-emerald-600 font-bold bg-emerald-50/70 border border-emerald-200/50'
                          : ''
                      }`}
                    >
                      <span>🌹 {language === 'ar' ? 'ودّ' : 'Rose'}</span>
                      <span className="bg-stone-50 px-1 py-0.2 rounded font-extrabold">{pr.reactions?.rose || 0}</span>
                    </button>
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* 6. Form styled like Instagram Comment bar input */}
        <form 
          id={`comment-form-box-${memorial.id}`}
          onSubmit={handleAddPrayer} 
          className="space-y-2 mt-2 pt-2 border-t border-stone-100"
        >
          {/* Quick sender credentials inside comment tray */}
          <div className="grid grid-cols-2 gap-1.5">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder={t.prayerAuthorPlaceholder}
              className="px-2.5 py-1 text-[10px] text-slate-800 bg-stone-100 border border-stone-200 rounded-lg outline-none focus:bg-white"
            />
            <input
              type="text"
              value={visitorRelation}
              onChange={(e) => setVisitorRelation(e.target.value)}
              placeholder={t.relationshipPlaceholder}
              className="px-2.5 py-1 text-[10px] text-slate-800 bg-stone-100 border border-stone-200 rounded-lg outline-none focus:bg-white"
            />
          </div>

          <div className="relative flex items-center bg-stone-100 border border-stone-200 rounded-xl px-2">
            <textarea
              rows={1}
              value={prayerText}
              onChange={(e) => setPrayerText(e.target.value)}
              placeholder={t.prayerPlaceholder}
              className="flex-1 text-[11px] p-2 bg-transparent text-slate-800 outline-none resize-none pr-7 placeholder:text-stone-400"
              required
            />

            {/* AI WHISPER Sparks */}
            <button
              type="button"
              onClick={handleGenerateAIPrayer}
              disabled={isGeneratingAIPrayer}
              className="text-stone-400 hover:text-amber-500 p-1 rounded transition shrink-0"
              title={t.aiGenerateComment}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAIPrayer ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            {/* Submit Arrow */}
            <button
              type="submit"
              disabled={isSubmittingPrayer}
              className="p-1 px-2 text-primary hover:text-amber-600 transition shrink-0 font-extrabold text-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-[9px] text-rose-600 font-mono text-center">
              ⚠️ {errorMsg}
            </p>
          )}
        </form>
      </div>

    </div>
  );
}
