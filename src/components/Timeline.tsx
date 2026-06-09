import React, { useState, useEffect } from 'react';
import { Memorial, MemorialCategory, Prayer } from '../types';
import { translations, categories, presetIllustrations } from '../i18n';
import MemorialCard from './MemorialCard';
import { Search, Flame, AppWindow, Inbox, Sparkles, Filter, Info, Plus, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface TimelineProps {
  language: 'en' | 'ar';
  memorials: Memorial[];
  keeperName: string;
  onUpdateMemorial: (updated: Memorial) => void;
  incrementCandleCount: (offset?: number) => void;
  incrementPrayerCount: (offset?: number) => void;
  onViewCreatorProfile?: (creatorId: string) => void;
}

export default function Timeline({
  language,
  memorials,
  keeperName,
  onUpdateMemorial,
  incrementCandleCount,
  incrementPrayerCount,
  onViewCreatorProfile
}: TimelineProps) {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemorialCategory | 'all'>('all');

  // --- STORY PLAYER STATES ---
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const [storyNotification, setStoryNotification] = useState<string | null>(null);

  // Filter memorials
  const filteredMemorials = memorials.filter((m) => {
    const matchesSearch =
      m.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nameAr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Stories List: sort by createdAt descending so newly created (including user's own) show up first
  const storiesList = [...memorials]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 10);

  // --- STORIES CONTROLLER TIMER ---
  useEffect(() => {
    if (activeStoryIndex === null) return;

    // Reset progress on active story switch
    setStoryProgress(0);

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close if last
          if (activeStoryIndex < storiesList.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // Increments to 100 in 5 seconds
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStoryIndex, storiesList.length]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < storiesList.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      setStoryProgress(0);
    }
  };

  // --- STORY INTERACTIONS IN REAL-TIME ---
  const handleStoryLightCandle = async (storyMemorial: Memorial) => {
    try {
      const activeEmail = localStorage.getItem('keeper_email') || '';
      const wasLitByMe = storyMemorial.candlesLitBy?.includes(keeperName);

      const response = await fetch(`/api/memorials/${storyMemorial.id}/candle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': activeEmail
        },
        body: JSON.stringify({ userName: keeperName }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedMemorial: Memorial = {
          ...storyMemorial,
          candlesCount: data.candlesCount,
          candlesLitBy: data.candlesLitBy,
        };

        if (wasLitByMe) {
          // Unlike scenario
          incrementCandleCount(-1);
          setStoryNotification(language === 'ar' ? `🕯️ أطفأت الشمعة لـ ${storyMemorial.nameAr}` : `🕯️ extinguished candle for ${storyMemorial.nameEn}`);
        } else {
          // Like scenario
          incrementCandleCount(1);
          setShowSparkle(true);
          setTimeout(() => setShowSparkle(false), 900);
          setStoryNotification(language === 'ar' ? `🕯️ قمت بإنارة شمعة لـ ${storyMemorial.nameAr}` : `🕯️ Lit a candle for ${storyMemorial.nameEn}`);
        }

        onUpdateMemorial(updatedMemorial);
        setTimeout(() => setStoryNotification(null), 2500);
      }
    } catch (err) {
      console.error('Error toggling story candle:', err);
    }
  };

  const handleStoryFastResponse = (storyMemorial: Memorial, keyword: 'amen' | 'peace' | 'rose') => {
    incrementPrayerCount();

    // Map responses beautifully
    let commentTextAr = '';
    let commentTextEn = '';

    if (keyword === 'amen') {
      commentTextAr = 'رحمك الله برحمته الواسعة ونسأل الله لك منازل الأبرار الصالحين. 🤲 آمين';
      commentTextEn = 'May eternal light shine upon you and bless your resting soul in endless peace. 🤲 Amen.';
    } else if (keyword === 'peace') {
      commentTextAr = 'طبت في الفردوس وطاب مثواك الطاهر، ذكراك الجميلة ستبقى نابضة بقلوبنا. 🤍';
      commentTextEn = 'Resting in serenity. Your beautiful memory will always warm our hearts. 🤍';
    } else {
      commentTextAr = 'نرسل لروحك الطاهرة عبق الحب والرياحين، عشت جميلاً وبقيت بالقلوب عظيماً. 🌹';
      commentTextEn = 'Sending love and roses to your resting soul. A beautiful life remembered. 🌹';
    }

    const newComment: Prayer = {
      id: `prayer-${Date.now()}`,
      author: keeperName,
      relationship: language === 'ar' ? 'محب مستذكر' : 'Peace Seeker',
      text: language === 'ar' ? commentTextAr : commentTextEn,
      createdAt: new Date().toISOString(),
      reactions: { amen: 1, peace: 0, rose: 0 }
    };

    const updatedMemorial: Memorial = {
      ...storyMemorial,
      prayers: [...(storyMemorial.prayers || []), newComment]
    };

    onUpdateMemorial(updatedMemorial);

    setStoryNotification(language === 'ar' ? `💬 تم إرسال كلماتك لصفحة التعازي` : `💬 Response posted to remembrance wall`);
    setTimeout(() => setStoryNotification(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" id="timeline-section">

      {/* A. INSTAGRAM STORY CAROUSEL BUBBLES BAR */}
      <div className="bg-white border border-surface-container/80 rounded-2xl p-4 mb-6 shadow-xs overflow-x-auto scrollbar-none flex gap-4 items-center">
        
        {/* First bubble: Logged-in keeper "Your Story" post redirect widget */}
        <div className="flex flex-col items-center shrink-0 cursor-pointer group" onClick={() => {
          setStoryNotification(language === 'ar' 
            ? '✨ انقر على علامة (+) لنشر ذكرى جديدة وتخليد أثرهم' 
            : '✨ Click the shadow (+) tab down below to eternalize a memory of someone.');
          setTimeout(() => setStoryNotification(null), 3000);
        }}>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 p-0.5 flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center font-extrabold text-amber-800 text-lg">
                ✨
              </div>
            </div>
            {/* Added plus emblem */}
            <div className="absolute bottom-0 right-0 bg-primary border-2 border-white rounded-full p-1 text-white shadow-sm hover:bg-amber-600 transition">
              <Plus className="w-3 h-3" />
            </div>
          </div>
          <span className="text-[10px] text-stone-500 font-medium tracking-tight mt-1.5 max-w-[70px] truncate text-center">
            {language === 'ar' ? 'أثري الخاص' : 'My Beacon'}
          </span>
        </div>

        {/* Dynamic Memorial stories bubbles */}
        {storiesList.map((story, idx) => {
          const isHappy = story.category === 'happy';
          const isPreset = story.image && ['sunset', 'stars', 'meadow', 'sky', 'lotus'].includes(story.image);
          const storyImageUrl = isPreset ? presetIllustrations[story.image!] : story.image;

          return (
            <div 
              key={story.id} 
              className="flex flex-col items-center shrink-0 cursor-pointer group"
              onClick={() => setActiveStoryIndex(idx)}
            >
              {/* Instagram colored active ring (rose gold to warm amber) */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-primary via-amber-600 to-amber-400 flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95">
                  <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden flex items-center justify-center">
                    {storyImageUrl && storyImageUrl !== 'none' ? (
                      <img 
                        src={storyImageUrl} 
                        alt={story.nameEn} 
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-[#FAF8F5] flex items-center justify-center text-lg font-serif">
                        {isHappy ? '☀️' : '🕯️'}
                      </div>
                    )}
                  </div>
                </div>
                {/* Glow dot */}
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full animate-pulse"></span>
              </div>
              <span className="text-[10px] text-stone-700 font-bold tracking-tight mt-1.5 max-w-[70px] truncate text-center">
                {language === 'ar' ? story.nameAr.split(' ')[0] : story.nameEn.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* B. INSTAGRAM STORIES PLAYER CAROUSEL OVERLAY */}
      {activeStoryIndex !== null && (() => {
        const activeStory = storiesList[activeStoryIndex];
        const isHappy = activeStory.category === 'happy';
        const isPreset = activeStory.image && ['sunset', 'stars', 'meadow', 'sky', 'lotus'].includes(activeStory.image);
        const storyImageUrl = isPreset ? presetIllustrations[activeStory.image!] : activeStory.image;

        return (
          <div className="fixed inset-0 z-50 bg-stone-950/95 flex items-center justify-center p-0 select-none overflow-hidden" id="stories-player-overlay">
            
            {/* Dark abstract bg backdrop preview */}
            <div className="absolute inset-0 opacity-15 pointer-events-none blur-3xl">
              {storyImageUrl && storyImageUrl !== 'none' && (
                <img src={storyImageUrl} alt="Backdrop Blur" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Float-up real-time notifications tracker */}
            {storyNotification && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-stone-200 text-xs font-bold text-stone-800 shadow-xl z-50 animate-bounce">
                {storyNotification}
              </div>
            )}

            {/* Dynamic float-up spark animation triggers */}
            {showSparkle && (
              <div className="absolute inset-x-0 bottom-1/3 flex justify-center pointer-events-none z-40">
                <div className="animate-ping flex flex-col items-center">
                  <Flame className="w-24 h-24 text-amber-500 drop-shadow-lg fill-amber-300" />
                  <span className="text-white font-serif text-lg font-bold tracking-widest mt-2">{language === 'ar' ? 'تمت الإنارة' : 'CANDLE LIT'}</span>
                </div>
              </div>
            )}

            {/* Desktop Left navigation buttons */}
            <button 
              onClick={handlePrevStory}
              className="hidden sm:flex absolute left-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Centered immersive Story Box (Phone aspect ratio) */}
            <div className="relative w-full max-w-md h-[100vh] sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-[#181615] flex flex-col justify-between shadow-2xl border border-stone-800/50">
              
              {/* Top controls header */}
              <div className="p-4 z-40">
                {/* 1. Dynamic segmented bars */}
                <div className="flex gap-1.5 mb-4">
                  {storiesList.map((_, idx) => {
                    let widthPercent = 0;
                    if (idx < activeStoryIndex) widthPercent = 100;
                    if (idx === activeStoryIndex) widthPercent = storyProgress;
                    return (
                      <div key={idx} className="h-[3px] flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white transition-all duration-100 ease-linear rounded-full" 
                          style={{ width: `${widthPercent}%` }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* 2. User credentials & action buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                      {storyImageUrl && storyImageUrl !== 'none' ? (
                        <img src={storyImageUrl} alt={activeStory.nameEn} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-amber-50 flex items-center justify-center font-serif text-amber-800">
                          {isHappy ? '☀️' : '🕯️'}
                        </div>
                      )}
                    </div>
                    <div className="text-left font-serif">
                      <div className="text-xs font-bold text-white leading-none">
                        {language === 'ar' ? activeStory.nameAr : activeStory.nameEn}
                      </div>
                      <div className="text-[9px] text-stone-400 tracking-wider mt-0.5">
                        {activeStory.birthYear} - {activeStory.passingYear} • {isHappy ? (language === 'ar' ? 'ذكرى سعيدة' : 'Happy Memory') : (language === 'ar' ? 'أثر مبارك' : 'Memorial')}
                      </div>
                    </div>
                  </div>

                  {/* Close Stories Player */}
                  <button 
                    onClick={() => setActiveStoryIndex(null)}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Central Immersive Portrait View */}
              <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 bg-gradient-to-t from-stone-950 via-stone-900/45 to-stone-950/45 text-center sm:rounded-2xl">
                
                {/* Main image illustration */}
                {storyImageUrl && storyImageUrl !== 'none' && (
                  <img 
                    src={storyImageUrl} 
                    alt="Story backdrop theme" 
                    className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none"
                  />
                )}

                {/* Atmospheric gradient mask to secure high contrast accessibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/50 via-transparent to-stone-950 z-20 pointer-events-none"></div>

                {/* Spiritual serif quote text */}
                <div className="space-y-4 z-30 mb-20 p-2 text-center select-none">
                  {/* Category Pill */}
                  <span className="inline-block bg-primary text-white text-[9px] px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    {isHappy ? (language === 'ar' ? 'ذكرى مبهجة' : 'Happy Remembrance') : (language === 'ar' ? 'ذكرى الراحلين' : 'Sainted Memorial')}
                  </span>

                  {/* Serif quote banner */}
                  <blockquote className="font-serif italic text-base sm:text-lg text-amber-50/95 leading-relaxed tracking-wide drop-shadow-md">
                    " {language === 'ar' ? activeStory.lastWordsAr : activeStory.lastWordsEn} "
                  </blockquote>

                  {/* Relationship */}
                  <p className="text-[10px] sm:text-xs text-amber-200/90 font-sans tracking-wide">
                    — {language === 'ar' ? `نشرت بواسطة: ${activeStory.relationshipAr}` : `Bequeathed by: ${activeStory.relationshipEn}`}
                  </p>
                </div>
              </div>

              {/* Bottom interactive drawer bar */}
              <div className="p-4 bg-stone-950/90 border-t border-stone-900 z-30 space-y-3.5">
                {/* Row 1: Fast condolence reactions */}
                <div className="flex items-center justify-between bg-stone-900/60 p-2 rounded-xl border border-stone-800">
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">{language === 'ar' ? 'تعزية مستعجلة:' : 'Fast Solace:'}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStoryFastResponse(activeStory, 'amen')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition active:scale-95"
                    >
                      🤲 {language === 'ar' ? 'آمين' : 'Amen'}
                    </button>
                    <button 
                      onClick={() => handleStoryFastResponse(activeStory, 'peace')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition active:scale-95"
                    >
                      🤍 {language === 'ar' ? 'سكينة' : 'Peace'}
                    </button>
                    <button 
                      onClick={() => handleStoryFastResponse(activeStory, 'rose')}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition active:scale-95"
                    >
                      🌹 {language === 'ar' ? 'ودّ' : 'Rose'}
                    </button>
                  </div>
                </div>

                {/* Row 2: Standard triggers */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-left">
                    <span className="text-[9px] text-stone-400 font-mono tracking-wider block uppercase">{language === 'ar' ? 'مجموع أنوار الشموع' : 'CANDLES BURNING'}</span>
                    <span className="text-sm font-bold text-amber-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <Flame className="w-4 h-4 animate-pulse text-amber-500 fill-amber-500 shrink-0" />
                      <span>{activeStory.candlesCount || 0}</span>
                    </span>
                  </div>

                  {activeStory.candlesLitBy?.includes(keeperName) ? (
                    <button 
                      onClick={() => handleStoryLightCandle(activeStory)}
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-md shrink-0 animate-pulse"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'أطفئ الشمعة' : 'Extinguish' }</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleStoryLightCandle(activeStory)}
                      className="flex-1 bg-primary hover:bg-primary/95 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-md shrink-0"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'أنر شمعة' : 'Light Candle'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Right navigation buttons */}
            <button 
              onClick={handleNextStory}
              className="hidden sm:flex absolute right-8 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition active:scale-95"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );
      })()}

      {/* C. SEARCH BAR, ADAPTED STATS, AND FILTER PORTAL */}
      <div className="bg-white border border-surface-container/60 rounded-2xl p-4 mb-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search bar styled like Instagram Explore search */}
          <div className="relative w-full sm:max-w-md">
            <span className={`absolute inset-y-0 ${language === 'ar' ? 'right-3' : 'left-3'} flex items-center text-stone-400 pointer-events-none`}>
              <Search className="w-4 h-4 text-stone-400" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full text-xs ${
                language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
              } py-2 rounded-xl border border-surface-container/80 outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800`}
            />
          </div>

          {/* Quick info badges */}
          <div className="flex gap-2 text-stone-500 font-mono text-[9px] bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-stone-200/50">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{language === 'ar' ? 'تفاعل مع المحبين بالضغط مرتين لتوقيد الشموع' : 'Double tap posts to ignite peaceful tribute candles'}</span>
          </div>
        </div>

        {/* Explore filter pills - styled like Instagram category search */}
        <div className="border-t border-stone-100 pt-3 flex flex-wrap gap-1.5 scrollbar-none overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/40'
            }`}
          >
            {t.filterCategory}
          </button>

          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95 flex items-center gap-1 shrink-0 ${
                selectedCategory === cat.key
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200/40'
              }`}
            >
              <span>{language === 'ar' ? cat.ar : cat.en}</span>
            </button>
          ))}
        </div>
      </div>

      {/* D. INSTAGRAM FEED POSTS CARD LIST */}
      {filteredMemorials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-surface-container/80 p-12 text-center max-w-sm mx-auto shadow-xs">
          <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" />
          <p className="text-xs text-stone-500 italic">
            {t.emptyTimeline}
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl mx-auto" id="timeline-card-grid">
          {filteredMemorials.map((memorial) => (
            <MemorialCard
              key={memorial.id}
              memorial={memorial}
              language={language}
              keeperName={keeperName}
              onUpdate={onUpdateMemorial}
              incrementCandleCount={incrementCandleCount}
              incrementPrayerCount={incrementPrayerCount}
              onViewCreatorProfile={onViewCreatorProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
