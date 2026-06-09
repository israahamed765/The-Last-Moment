import React, { useState, useEffect } from 'react';
import { translations } from './i18n';
import { Memorial, UserStats } from './types';
import Timeline from './components/Timeline';
import CreateForm from './components/CreateForm';
import UserProfile from './components/UserProfile';
import SolaceWall from './components/SolaceWall';
import CreatorProfileView from './components/CreatorProfileView';
import NotificationsView from './components/NotificationsView';
import SanctuaryChatView from './components/SanctuaryChatView';
import AuthScreens from './components/AuthScreens';
import { GlassWater, BookOpen, User, Sparkles, Feather, Heart, MailOpen, Bell, MessageSquare, Settings, Home, Compass, PlusSquare, LogOut, Globe } from 'lucide-react';

export default function App() {
  // Global states
  const [language, setLanguage] = useState<'en' | 'ar'>('ar'); // Default to Arabic for native showcase representation
  const [activeTab, setActiveTab] = useState<'timeline' | 'solace-wall' | 'create' | 'profile' | 'notifications' | 'messages'>('timeline');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  
  // Real login persistence from User request
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });

  const [keeperEmail, setKeeperEmail] = useState(() => {
    return localStorage.getItem('keeper_email') || 'visitor.companion@sanctuary.org';
  });

  const [keeperName, setKeeperName] = useState(() => {
    const local = localStorage.getItem('keeper_name');
    return local || 'Guest Rememberer';
  });

  const [keeperAvatar, setKeeperAvatar] = useState(() => {
    return localStorage.getItem('keeper_avatar') || '✨';
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const stored = localStorage.getItem('keeper_stats');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    return {
      memorialsCreated: 2,
      candlesLit: 15,
      prayersContributed: 8
    };
  });

  const [isLoading, setIsLoading] = useState(true);

  // Apply Document Direction based on selected language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Handle localstorage credentials saving
  useEffect(() => {
    localStorage.setItem('keeper_name', keeperName);
    localStorage.setItem('is_logged_in', isLoggedIn ? 'true' : 'false');
    localStorage.setItem('keeper_email', keeperEmail);
  }, [keeperName, isLoggedIn, keeperEmail]);

  // Sync stats updates
  useEffect(() => {
    localStorage.setItem('keeper_stats', JSON.stringify(stats));
  }, [stats]);

  // Fetch current user details and stats from the backend to ensure absolute synchronization & prevent mix-ups!
  useEffect(() => {
    const fetchCurrentUserStats = async () => {
      if (!isLoggedIn || !keeperEmail) return;
      try {
        const response = await fetch(`/api/auth/current-user`, {
          headers: {
            'x-user-email': keeperEmail
          }
        });
        if (response.ok) {
          const userData = await response.json();
          if (userData && userData.stats) {
            setStats(userData.stats);
            if (userData.name) setKeeperName(userData.name);
            if (userData.avatar) {
              setKeeperAvatar(userData.avatar);
              localStorage.setItem('keeper_avatar', userData.avatar);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching current user stats:', err);
      }
    };
    
    fetchCurrentUserStats();
  }, [isLoggedIn, keeperEmail]);

  // Fetch initial memorials from our Express + Vite API
  const fetchMemorials = async () => {
    try {
      const response = await fetch('/api/memorials', {
        headers: {
          'x-user-email': keeperEmail
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMemorials(data);
      }
    } catch (err) {
      console.error('API connection err:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchMemorials();
    }
  }, [isLoggedIn, keeperEmail]);

  const handleLoginSuccess = (email: string, name: string, bio: string, userStats: any, avatar?: string) => {
    setKeeperEmail(email);
    setKeeperName(name);
    if (userStats) {
      setStats(userStats);
    }
    if (avatar) {
      setKeeperAvatar(avatar);
      localStorage.setItem('keeper_avatar', avatar);
    } else {
      setKeeperAvatar('✨');
      localStorage.setItem('keeper_avatar', '✨');
    }
    setIsLoggedIn(true);
    localStorage.setItem('is_logged_in', 'true');
    localStorage.setItem('keeper_email', email);
    localStorage.setItem('keeper_name', name);
    if (userStats) {
      localStorage.setItem('keeper_stats', JSON.stringify(userStats));
    }
  };

  // Update a single memorial inside list
  const handleUpdateMemorial = (updated: Memorial) => {
    setMemorials(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  // Add new memorial and prepend to the feed
  const handlePublishMemorial = (newMemorial: Memorial) => {
    setMemorials(prev => [newMemorial, ...prev]);
  };

  // Stats increment helpers
  const incrementCandleCount = (offset: number = 1) => {
    setStats(prev => ({ ...prev, candlesLit: Math.max(0, prev.candlesLit + offset) }));
  };

  const incrementPrayerCount = (offset: number = 1) => {
    setStats(prev => ({ ...prev, prayersContributed: Math.max(0, prev.prayersContributed + offset) }));
  };

  const incrementMemorialStats = () => {
    setStats(prev => ({ ...prev, memorialsCreated: prev.memorialsCreated + 1 }));
  };

  const handleTabClick = (tab: 'timeline' | 'solace-wall' | 'create' | 'profile' | 'notifications' | 'messages') => {
    setActiveTab(tab);
    setSelectedCreatorId(null);
  };

  const t = translations[language];

  // Auth Guard Gatekeeper
  if (!isLoggedIn) {
    return (
      <AuthScreens
        language={language}
        onLoginSuccess={handleLoginSuccess}
        onSetLanguage={setLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg-serene text-slate-800 flex flex-col md:flex-row transition-all duration-300">
      
      {/* 1. INSTAGRAM WEB-STYLE DESKTOP LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 start-0 w-64 lg:w-72 bg-white border-e border-surface-container/80 p-6 z-40 justify-between">
        <div className="space-y-8">
          {/* Brand Lettering Signature (Instagram Calligraphy Style but Serif Cozy) */}
          <div className="cursor-pointer py-2 px-1" onClick={() => handleTabClick('timeline')}>
            <h1 className="text-2xl font-serif font-black tracking-tight bg-gradient-to-r from-primary to-amber-700 bg-clip-text text-transparent">
              {language === 'ar' ? 'اللحظة الأخيرة' : 'The Last Moment'}
            </h1>
            <span className="text-[9px] text-stone-400 font-mono tracking-widest block mt-0.5 uppercase">
              {t.appSubtitle}
            </span>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1.5 font-sans">
            {/* Home / Feed */}
            <button
              onClick={() => handleTabClick('timeline')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'timeline'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
            </button>

            {/* Explore / Solace Wall */}
            <button
              onClick={() => handleTabClick('solace-wall')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'solace-wall'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-sm">{language === 'ar' ? 'اكتشاف السكينة' : 'Explore Solace'}</span>
            </button>

            {/* Direct Messages */}
            <button
              onClick={() => handleTabClick('messages')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                activeTab === 'messages'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm">{language === 'ar' ? 'الرسائل' : 'Messages'}</span>
              <span className="absolute end-4 top-3.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            {/* Alerts / Notifications */}
            <button
              onClick={() => handleTabClick('notifications')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'notifications'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
            </button>

            {/* Create Memorial Monument */}
            <button
              onClick={() => handleTabClick('create')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <PlusSquare className="w-5 h-5" />
              <span className="text-sm">{language === 'ar' ? 'نشر ذكرى جديدة' : 'Create Memorial'}</span>
            </button>

            {/* Keeper Profile Custom Bubble link */}
            <button
              onClick={() => handleTabClick('profile')}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-primary/10 text-primary scale-102 font-extrabold'
                  : 'text-stone-600 hover:bg-surface-low hover:text-slate-900'
              }`}
            >
              <div className={`w-6 h-6 rounded-full overflow-hidden border flex items-center justify-center text-xs ${
                activeTab === 'profile' ? 'border-primary ring-2 ring-primary/20' : 'border-stone-300'
              }`}>
                {keeperAvatar.startsWith('data:image') ? (
                  <img src={keeperAvatar} alt="Mini Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{keeperAvatar || '✨'}</span>
                )}
              </div>
              <span className="text-sm">{language === 'ar' ? 'ملفي الشخصي' : 'My Profile'}</span>
            </button>
          </nav>
        </div>

        {/* Desktop Sidebar Bottom Accessories */}
        <div className="space-y-4 pt-4 border-t border-surface-container/60 col-span-1">
          {/* Quick Info & User check */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 text-xs flex items-center justify-center font-bold">
              ✓
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold text-slate-800 line-clamp-1">{keeperName}</div>
              <div className="text-[9px] text-stone-400 font-mono tracking-wider">VERIFIED KEEPER</div>
            </div>
          </div>

          {/* Quick Layout Language switch */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="w-full flex items-center justify-between text-[11px] font-mono text-stone-500 hover:text-slate-900 bg-[#FAF8F5] border border-stone-200/50 p-2.5 rounded-xl transition"
          >
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" />
              <span>{language === 'ar' ? 'Layout: Arabic (RTL)' : 'Layout: English (LTR)'}</span>
            </span>
            <span className="font-bold underline text-primary">⇅</span>
          </button>
        </div>
      </aside>

      {/* 2. INSTAGRAM-STYLE MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-container/60 px-4 py-3.5 flex items-center justify-between">
        {/* Mobile Left Logo calligraphy style */}
        <div className="cursor-pointer" onClick={() => handleTabClick('timeline')}>
          <h1 className="text-xl font-serif font-black tracking-tight text-slate-900 bg-gradient-to-r from-primary to-amber-700 bg-clip-text text-transparent">
            {language === 'ar' ? 'اللحظة الأخيرة' : 'The Last Moment'}
          </h1>
        </div>

        {/* Mobile Right accessories: Message DM & Alerts */}
        <div className="flex items-center gap-3">
          {/* Language trigger */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="p-1.5 rounded-full hover:bg-stone-50 text-stone-500 active:scale-95 transition"
            title="Switch Language"
          >
            <Globe className="w-4 h-4 text-primary" />
          </button>

          {/* DM Messenger Icon shortcut */}
          <button
            onClick={() => handleTabClick('messages')}
            className={`p-1.5 rounded-full hover:bg-stone-50 transition relative ${
              activeTab === 'messages' ? 'text-primary bg-primary/5' : 'text-stone-600'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </button>

          {/* Notifications Alerts Icon */}
          <button
            onClick={() => handleTabClick('notifications')}
            className={`p-1.5 rounded-full hover:bg-stone-50 transition ${
              activeTab === 'notifications' ? 'text-primary bg-primary/5' : 'text-stone-600'
            }`}
          >
            <Heart className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* 3. INSTAGRAM-STYLE MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-surface-container/60 flex items-center justify-around py-2.5 px-4 z-40 shadow-lg">
        {/* Home option */}
        <button
          onClick={() => handleTabClick('timeline')}
          className={`flex flex-col items-center p-2 rounded-full transition active:scale-95 ${
            activeTab === 'timeline' ? 'text-primary font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5.5 h-5.5" />
        </button>

        {/* Compass Solace explore option */}
        <button
          onClick={() => handleTabClick('solace-wall')}
          className={`flex flex-col items-center p-2 rounded-full transition active:scale-95 ${
            activeTab === 'solace-wall' ? 'text-primary' : 'text-stone-500'
          }`}
        >
          <Compass className="w-5.5 h-5.5" />
        </button>

        {/* PlusSquare Option */}
        <button
          onClick={() => handleTabClick('create')}
          className={`flex flex-col items-center p-2 rounded-full transition active:scale-95 ${
            activeTab === 'create' ? 'text-primary' : 'text-stone-500'
          }`}
        >
          <PlusSquare className="w-5.5 h-5.5" />
        </button>

        {/* Chat messenger option */}
        <button
          onClick={() => handleTabClick('messages')}
          className={`flex flex-col items-center p-2 rounded-full transition active:scale-95 ${
            activeTab === 'messages' ? 'text-primary' : 'text-stone-500'
          }`}
        >
          <MessageSquare className="w-5.5 h-5.5" />
        </button>

        {/* Live profile bubble option */}
        <button
          onClick={() => handleTabClick('profile')}
          className="flex flex-col items-center p-1 rounded-full transition active:scale-95"
          id="mobile-nav-btn-profile"
        >
          <div className={`w-6 h-6 rounded-full overflow-hidden border flex items-center justify-center text-xs ${
            activeTab === 'profile' ? 'border-primary ring-2 ring-primary/35' : 'border-stone-300'
          }`}>
            {keeperAvatar.startsWith('data:image') ? (
              <img src={keeperAvatar} alt="My Avatar Bubble" className="w-full h-full object-cover" />
            ) : (
              <span>{keeperAvatar || '✨'}</span>
            )}
          </div>
        </button>
      </nav>

      {/* 4. MAIN CENTRAL SANCTUARY PORTAL VIEWPORT AREA */}
      <div className="flex-1 flex flex-col min-h-screen md:ps-64 lg:ps-72 pb-16 md:pb-0 transition-all">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs text-stone-500 font-mono">
                {language === 'ar' ? 'تهيئة محراب الذكرى الهادئ...' : 'Entering the digital sanctuary...'}
              </p>
            </div>
          ) : (
            <div className="opacity-100 transition-opacity duration-300">
              {selectedCreatorId ? (
                <CreatorProfileView
                  creatorId={selectedCreatorId}
                  language={language}
                  loggedInUserEmail={keeperEmail}
                  loggedInUserName={keeperName}
                  isLoggedIn={isLoggedIn}
                  onBack={() => setSelectedCreatorId(null)}
                  onGoToCreateTab={() => {
                    setSelectedCreatorId(null);
                    setActiveTab('create');
                  }}
                  incrementCandleCount={incrementCandleCount}
                  incrementPrayerCount={incrementPrayerCount}
                />
              ) : (
                <>
                  {activeTab === 'timeline' && (
                    <Timeline
                      language={language}
                      memorials={memorials}
                      keeperName={keeperName}
                      onUpdateMemorial={handleUpdateMemorial}
                      incrementCandleCount={incrementCandleCount}
                      incrementPrayerCount={incrementPrayerCount}
                      onViewCreatorProfile={(id) => setSelectedCreatorId(id)}
                    />
                  )}

                  {activeTab === 'solace-wall' && (
                    <SolaceWall
                      language={language}
                      keeperName={keeperName}
                      isLoggedIn={isLoggedIn}
                      onIncrementPrayers={incrementPrayerCount}
                    />
                  )}

                  {activeTab === 'create' && (
                    <CreateForm
                      language={language}
                      onPublish={handlePublishMemorial}
                      incrementMemorialStats={incrementMemorialStats}
                      goToTimeline={() => setActiveTab('timeline')}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <UserProfile
                      language={language}
                      setLanguage={setLanguage}
                      stats={stats}
                      keeperName={keeperName}
                      setKeeperName={setKeeperName}
                      isLoggedIn={isLoggedIn}
                      setIsLoggedIn={setIsLoggedIn}
                      keeperEmail={keeperEmail}
                      setKeeperEmail={setKeeperEmail}
                      memorials={memorials}
                      keeperAvatar={keeperAvatar}
                      setKeeperAvatar={setKeeperAvatar}
                      onViewMyPublicProfile={async (id) => {
                        try {
                          await fetch('/api/creators', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              id: id,
                              nameEn: keeperName,
                              nameAr: keeperName,
                              roleEn: 'Verified Memory Keeper',
                              roleAr: 'حارس ذاكرة موثق',
                              bioEn: 'Keeper of digital light, preserves the final moments and echoes of our loved ones.',
                              bioAr: 'حارس لشموع المحبة والوفاء، أصون اللحظات الأخيرة وأحفظ الذكرى الطاهرة للراحلين عبر الزمان.',
                              avatar: keeperAvatar || '✨',
                              memorialsCount: stats.memorialsCreated,
                              contributionsCount: stats.candlesLit + stats.prayersContributed,
                              remembrancesCount: stats.candlesLit * 3
                            })
                          });
                        } catch (err) {
                           console.error('Error auto-syncing:', err);
                        }
                        setSelectedCreatorId(id);
                      }}
                    />
                  )}

                  {activeTab === 'notifications' && (
                    <NotificationsView
                      language={language}
                      onNavigateToCreate={() => setActiveTab('create')}
                    />
                  )}

                  {activeTab === 'messages' && (
                    <SanctuaryChatView
                      language={language}
                      userAvatar={keeperAvatar}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </main>

        {/* Serene Footer */}
        <footer className="bg-surface-low py-8 border-t border-surface-container mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
            <p className="font-serif text-sm font-medium text-stone-700">
              منصة اللحظة الأخيرة • {t.appTitle}
            </p>
            <p className="text-[10px] text-stone-500 font-mono tracking-widest leading-relaxed">
              {language === 'ar' 
                ? 'إن غابوا جَسَداً، بقيت أرواحهم الطاهرة وكلماتهم الجميلة منارات تضيء قلوب المحبين.'
                : 'Though departed in physical presence, their beautiful words and echoes persist as eternal beacons of peace.'}
            </p>
            <div className="text-[9px] text-stone-400 font-mono">
              &copy; {new Date().getFullYear()} The Last Moment Sanctuary. Complete bilingual LTR & RTL layouts preserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
