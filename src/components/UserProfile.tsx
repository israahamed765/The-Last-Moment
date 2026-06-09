import React, { useState, useEffect } from 'react';
import { translations, presetIllustrations } from '../i18n';
import { UserStats, Memorial } from '../types';
import { Globe, Heart, Award, Sparkles, User, Settings, CheckCircle, Flame, Users, Grid, Bookmark, Trash, ArrowUpRight, Check, LogOut, MessageSquare, MessageCircle } from 'lucide-react';

interface UserProfileProps {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  stats: UserStats;
  keeperName: string;
  setKeeperName: (name: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  keeperEmail: string;
  setKeeperEmail: (val: string) => void;
  onViewMyPublicProfile?: (creatorId: string) => void;
  memorials: Memorial[];
  keeperAvatar: string;
  setKeeperAvatar: (avatar: string) => void;
}

export default function UserProfile({
  language,
  setLanguage,
  stats,
  keeperName,
  setKeeperName,
  isLoggedIn,
  setIsLoggedIn,
  keeperEmail,
  setKeeperEmail,
  onViewMyPublicProfile,
  memorials,
  keeperAvatar,
  setKeeperAvatar
}: UserProfileProps) {
  const t = translations[language];
  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'overview' | 'followers' | 'settings'>('posts');
  
  const [nameInput, setNameInput] = useState(keeperName);
  const [emailField, setEmailField] = useState(isLoggedIn ? keeperEmail : '');
  const [passwordField, setPasswordField] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [avatarInput, setAvatarInput] = useState(keeperAvatar);
  
  // Custom user bio state for their workspace profile
  const [bioInput, setBioInput] = useState(() => {
    return language === 'ar'
      ? 'حارس للشموع والمحبة، أصون اللحظات الأخيرة للراحلين وأحفظ ذكراهم العطرة.'
      : 'Guardian of digital light, preserves the final whispers and echoes of departed loved ones.';
  });
  
  // Sync state values when outer values update from the backend
  useEffect(() => {
    setNameInput(keeperName);
    setAvatarInput(keeperAvatar);
  }, [keeperName, keeperAvatar]);

  useEffect(() => {
    const fetchUserBio = async () => {
      if (!isLoggedIn || !keeperEmail) return;
      try {
        const response = await fetch(`/api/auth/current-user`, {
          headers: { 'x-user-email': keeperEmail }
        });
        if (response.ok) {
          const uData = await response.json();
          if (uData && uData.bio) {
            setBioInput(uData.bio);
          }
        }
      } catch (err) {
        // quiet ignore
      }
    };
    fetchUserBio();
  }, [isLoggedIn, keeperEmail]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated list of followers with avatars, bios and interactive follow-back triggers
  const [followers, setFollowers] = useState([
    {
      id: 'khaled',
      nameEn: 'Khaled Jamil',
      nameAr: 'خالد جميل',
      roleEn: 'Honorary Keeper',
      roleAr: 'حارس شرفي في المحراب',
      avatar: '👨‍💼',
      bioEn: 'Dedicated to remembering those who paved the roads of literature.',
      bioAr: 'مكرّس لحفظ خطى الأدباء الراحلين ومواساة ذويهم بكلمات من نور.',
      isFollowingBack: true
    },
    {
      id: 'seham',
      nameEn: 'Seham Ali',
      nameAr: 'سهام علي',
      roleEn: 'Peace Companion',
      roleAr: 'رفيقة السكينة والمواساة',
      avatar: '👩‍⚕️',
      bioEn: 'Finding healing through soft lines of prayers and comfort.',
      bioAr: 'تجد في مزار الكلمات الصادقة شفاءً وتخفيفاً لوجع الفراق المر وبلسمة النفوس.',
      isFollowingBack: false
    },
    {
      id: 'elena',
      nameEn: 'Elena Vance',
      nameAr: 'إيلينا فانس',
      roleEn: 'Legacy Guardian',
      roleAr: 'حارسة الإرث العتيق',
      avatar: '👩',
      bioEn: 'Archivist of family echoes and silent stories.',
      bioAr: 'مؤرخة للأصداء الجميلة واللحظات الصامتة المليئة بالنقاء العاطفي.',
      isFollowingBack: true
    }
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': keeperEmail
        },
        body: JSON.stringify({
          name: nameInput,
          bio: bioInput,
          avatar: avatarInput
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setKeeperName(updatedUser.name);
      if (updatedUser.avatar) {
        setKeeperAvatar(updatedUser.avatar);
        localStorage.setItem('keeper_avatar', updatedUser.avatar);
      }
      setIsSaved(true);
      showToast(language === 'ar' ? 'تم حفظ التعديلات في ملفك الشخصي بالخلفية بنجاح!' : 'Profile settings saved permanently on the backend!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      showToast(language === 'ar' ? 'حدث خطأ أثناء حفظ الملف الشخصي.' : 'Error persisting profile updates.');
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailField.includes('@')) {
      setLoginError(language === 'ar' ? 'يرجى إدخال حساب بريد إلكتروني صالح.' : 'Please enter a valid email.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
    setKeeperEmail(emailField);
    setKeeperName(emailField.split('@')[0].toUpperCase());
    setNameInput(emailField.split('@')[0].toUpperCase());
    showToast(language === 'ar' ? 'مرحباً بك! تم تسجيل الدخول كحارس موثق.' : 'Welcome! Signed in successfully.');
  };

  const handleDemoLogin = () => {
    setLoginError('');
    setIsLoggedIn(true);
    setKeeperEmail('tsraathmd@gmail.com');
    setKeeperName(language === 'ar' ? 'أحمد حارس الذاكرة' : 'Ahmed Memory Keeper');
    setNameInput(language === 'ar' ? 'أحمد حارس الذاكرة' : 'Ahmed Memory Keeper');
    showToast(language === 'ar' ? 'تم الدخول بنجاح كحارس الذاكرة المعتمد.' : 'Demo login successful.');
  };

  const handleFollowBackToggle = (id: string) => {
    setFollowers(prev => prev.map(f => {
      if (f.id === id) {
        const nextState = !f.isFollowingBack;
        showToast(language === 'ar' 
          ? (nextState ? `لقد تابعت ${f.nameAr} الآن.` : `ألغيت متابعة ${f.nameAr}.`) 
          : (nextState ? `You are now following ${f.nameEn}.` : `Unfollowed ${f.nameEn}.`)
        );
        return { ...f, isFollowingBack: nextState };
      }
      return f;
    }));
  };

  const userId = keeperEmail.split('@')[0] || 'visitor';
  const myMemorials = memorials.filter(m => 
    m.creatorId === userId || 
    m.creatorName === keeperName ||
    (m.id === 'amin-ghandour')
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in" id="user-workspace-panel">
      
      {/* 1. TOAST NOTIFICATION CONTAINER */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 left-6 md:left-auto md:w-96 bg-stone-900/90 border border-stone-800 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <div className="bg-amber-500/10 text-amber-400 p-2 rounded-full">
            <Check className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs font-semibold leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* 2. INSTAGRAM-STYLE PROFILE HEADER CARD */}
      <div className="bg-white border border-surface-container/80 rounded-2xl p-6 md:p-8 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          {/* Circular avatar with Glowing Story Ring and Verification Emblem */}
          <div className="relative shrink-0 select-none">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[3px] bg-gradient-to-tr from-primary via-amber-600 to-amber-400 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-full bg-white p-[3px] overflow-hidden flex items-center justify-center">
                {keeperAvatar.startsWith('data:image') ? (
                  <img src={keeperAvatar} alt="Profile avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-4xl">{keeperAvatar || '✨'}</span>
                )}
              </div>
            </div>
            {isLoggedIn && (
              <span className="absolute bottom-1 right-2 bg-primary text-white text-[9px] rounded-full p-1 border-2 border-white shadow-md flex items-center justify-center font-bold" title="Verified Keeper">
                ✓
              </span>
            )}
          </div>

          {/* User particulars info and statistics panel */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 tracking-tight">
                {keeperName}
              </h2>
              <span className="text-[9px] font-mono font-bold bg-[#FAF8F5] border border-stone-200 text-stone-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {isLoggedIn ? (language === 'ar' ? 'حارس معتمد' : 'VERIFIED KEEPER') : (language === 'ar' ? 'مستذكر زائر' : 'VISITOR')}
              </span>
            </div>

            {/* Instagram Profile Followers/Statistics Bar */}
            <div className="flex justify-center md:justify-start gap-8 py-1 border-y border-stone-100 sm:border-none">
              <button onClick={() => setActiveSubTab('posts')} className="text-left py-1 hover:opacity-85 transition">
                <span className="font-bold text-slate-900 block text-base md:text-lg font-mono">{myMemorials.length}</span>
                <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">{language === 'ar' ? 'منشورات الأثر' : 'posts'}</span>
              </button>

              <button onClick={() => setActiveSubTab('followers')} className="text-left py-1 hover:opacity-85 transition">
                <span className="font-bold text-slate-900 block text-base md:text-lg font-mono">{followers.length}</span>
                <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">{language === 'ar' ? 'المتابعون' : 'followers'}</span>
              </button>

              <button onClick={() => setActiveSubTab('overview')} className="text-left py-1 hover:opacity-85 transition">
                <span className="font-bold text-slate-900 block text-base md:text-lg font-mono">
                  {stats.candlesLit + stats.prayersContributed}
                </span>
                <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">{language === 'ar' ? 'الإسهامات والشموع' : 'tributes'}</span>
              </button>
            </div>

            {/* Biography section */}
            <div className="space-y-1 font-sans text-xs text-left max-w-xl mx-auto md:mx-0">
              <p className="font-bold text-stone-800 leading-none">{language === 'ar' ? 'حارس البوابة الرقمية' : 'Digital Legacy Sanctuary Keeper'}</p>
              <p className="text-stone-600 font-light mt-1 whitespace-pre-wrap leading-relaxed">{bioInput}</p>
              <p className="text-[10px] text-stone-400 font-mono mt-1.5">{keeperEmail}</p>
            </div>

            {/* Action buttons stack */}
            <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-start pt-2">
              <button
                onClick={() => setActiveSubTab('settings')}
                className="px-5 py-2.5 bg-[#FAF8F5] border border-stone-200/80 hover:bg-stone-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer select-none active:scale-95"
              >
                {language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
              </button>

              {onViewMyPublicProfile && (
                <button
                  onClick={() => onViewMyPublicProfile(userId)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95 select-none"
                  id="btn-workspace-view-public"
                >
                  <span>{language === 'ar' ? 'عرض النصب العام' : 'Open Public Monument'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}

              {isLoggedIn && (
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setKeeperEmail('visitor.companion@sanctuary.org');
                    setKeeperName('Guest Companion');
                    setNameInput('Guest Companion');
                    showToast(language === 'ar' ? 'تم تسجيل خروجك بنجاح.' : 'Logged out successfully.');
                  }}
                  className="p-2.5 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-xl transition active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. INSTAGRAM NAV TABS BAR */}
      <div className="flex justify-center border-t border-stone-200 gap-8 md:gap-12" id="workspace-navigation-tabs">
        <button
          onClick={() => setActiveSubTab('posts')}
          className={`py-3.5 px-3 text-[10px] font-mono uppercase font-bold tracking-widest border-t-2 -mt-[2px] transition flex items-center gap-1.5 ${
            activeSubTab === 'posts'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-slate-900'
          }`}
        >
          <Grid className="w-4 h-4 shrink-0" />
          <span>{language === 'ar' ? 'المنشورات' : 'Posts'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('overview')}
          className={`py-3.5 px-3 text-[10px] font-mono uppercase font-bold tracking-widest border-t-2 -mt-[2px] transition flex items-center gap-1.5 ${
            activeSubTab === 'overview'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 shrink-0" />
          <span>{language === 'ar' ? 'اللوحة الإرشادية' : 'Overview'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('followers')}
          className={`py-3.5 px-3 text-[10px] font-mono uppercase font-bold tracking-widest border-t-2 -mt-[2px] transition flex items-center gap-1.5 ${
            activeSubTab === 'followers'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>{language === 'ar' ? 'المتابعون' : 'Followers'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`py-3.5 px-3 text-[10px] font-mono uppercase font-bold tracking-widest border-t-2 -mt-[2px] transition flex items-center gap-1.5 ${
            activeSubTab === 'settings'
              ? 'border-primary text-primary font-extrabold'
              : 'border-transparent text-stone-400 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>{language === 'ar' ? 'الإعدادات' : 'Identity'}</span>
        </button>
      </div>

      {/* 4. DETAILS STACK FOR ACTIVE SUB TAB */}
      <div className="mt-6" id="workspace-tab-viewport">

        {/* SUB TAB: POST STORIES MEDIA GRID (3-COLUMN INSTAGRAM POST LAYOUT) */}
        {activeSubTab === 'posts' && (
          <div className="animate-fade-in space-y-4">
            {myMemorials.length === 0 ? (
              <div className="bg-white border border-stone-200/60 rounded-2xl p-12 text-center text-stone-400 text-xs italic">
                {language === 'ar' 
                  ? 'لا توجد منشورات ذكرى تابعة لك حالياً. اذهب لرمز (+) لبدء نشر نصب جديد.' 
                  : 'No legacy posts found. Tap the plus icon on the navigation bars to create.'}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 md:gap-4" id="instagram-grid-container">
                {myMemorials.map((m) => {
                  const mName = language === 'ar' ? m.nameAr : m.nameEn;
                  const isHappy = m.category === 'happy';
                  const isPreset = m.image && ['sunset', 'stars', 'meadow', 'sky', 'lotus'].includes(m.image);
                  const mImageUrl = isPreset ? presetIllustrations[m.image!] : m.image;

                  return (
                    <div 
                      key={m.id}
                      onClick={() => {
                        if (onViewMyPublicProfile) onViewMyPublicProfile(m.id);
                      }}
                      className="group relative aspect-square w-full rounded-md md:rounded-lg overflow-hidden bg-stone-100 border border-stone-200/50 cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                      {/* Grid Item Image cover */}
                      {mImageUrl && mImageUrl !== 'none' ? (
                        <img 
                          src={mImageUrl} 
                          alt={mName} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FCFAF7] flex flex-col items-center justify-center p-3 text-center">
                          <span className="text-2xl mb-1">{isHappy ? '☀️' : '🕯️'}</span>
                          <span className="text-[10px] text-stone-500 font-serif font-bold line-clamp-2">{mName}</span>
                        </div>
                      )}

                      {/* Translucent overlay showing comments & likes counters upon hover (Genuine Instagram Layout Style!) */}
                      <div className="absolute inset-0 bg-stone-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 p-2 z-15">
                        {/* Name title highlight */}
                        <div className="absolute top-2.5 inset-x-2 text-center px-1">
                          <div className="text-[11px] font-sans font-extrabold truncate">{mName}</div>
                        </div>

                        {/* Likes (Candles) */}
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{m.candlesCount || 0}</span>
                        </div>

                        {/* Comments (Prayers) */}
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                          <MessageCircle className="w-4 h-4 text-white fill-white/10" />
                          <span>{m.prayers ? m.prayers.length : 0}</span>
                        </div>
                      </div>

                      {/* Category Label Pin badge */}
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/40 text-[8px] text-white font-mono uppercase tracking-widest z-10">
                        {isHappy ? 'happy' : 'memorial'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB TAB: OVERVIEW & DASHBOARD DETAILS */}
        {activeSubTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" id="tab-overview-view">
            
            {/* Left Side: Stats Cards Widget */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Statistics Counters Cards */}
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-serif font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>{language === 'ar' ? 'سجل تخليد الذكرى الخاص بنشاطك الخيّر' : 'Your Legacy Preservation Footprints'}</span>
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FAF8F5] px-2 py-4 rounded-xl border border-stone-200/50 text-center transition-all hover:scale-[1.02]">
                    <div className="text-stone-500 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider">{t.statsMemorials}</div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-primary mt-1">{stats.memorialsCreated}</div>
                  </div>

                  <div className="bg-[#FAF8F5] px-2 py-4 rounded-xl border border-stone-200/50 text-center transition-all hover:scale-[1.02]">
                    <div className="text-stone-500 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider">{t.statsCandles}</div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-secondary mt-1 flex items-center justify-center gap-1">
                      <span>🕯️</span> {stats.candlesLit}
                    </div>
                  </div>

                  <div className="bg-[#FAF8F5] px-2 py-4 rounded-xl border border-stone-200/50 text-center transition-all hover:scale-[1.02]">
                    <div className="text-stone-500 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider">{t.statsPrayers}</div>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-tertiary mt-1">{stats.prayersContributed}</div>
                  </div>
                </div>
              </div>

              {/* Core Philosophy Section on the Sanctuary */}
              <div className="bg-[#FAF8F5] border border-stone-200/60 rounded-2xl p-6 shadow-xs">
                <h3 className="text-base font-serif font-bold text-slate-900 mb-2">
                  {t.aboutSectionTitle}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed font-light">
                  {t.aboutSectionText}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-primary font-semibold font-mono">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-100" />
                  <span>{language === 'ar' ? 'رحم الله أرواحاً طاهرة غادرتنا، وأبقى لذكرهم طمأنينة وسلاماً.' : 'Dignity, Serenity, and Eternal Preservation.'}</span>
                </div>
              </div>

            </div>

            {/* Right Side: Comfort word widget */}
            <div className="space-y-6">
              <div className="bg-indigo-50/20 border border-indigo-100/40 rounded-2xl p-6 space-y-3.5">
                <div className="text-[10px] font-mono font-bold text-slate-800 uppercase tracking-widest">
                  {language === 'ar' ? 'مواساة روح الحارس' : 'Words of Hope'}
                </div>
                <blockquote className="text-sm font-serif italic text-stone-800 leading-relaxed">
                  {language === 'ar' 
                    ? '"إن الكلمات الجميلة التي نتركها رحمة ومواساة للذين عبروا خطوط الفناء هي بمثابة قبس من النور يرافق أرواحهم الطاهرة في سجلات الخلود."'
                    : '"The soft letters and comforting candles we leave behind act as warm reflections, keeping the serene wisdom of our beloved ancestors eternal."'}
                </blockquote>
                <p className="text-[9px] font-mono text-stone-400">— {language === 'ar' ? 'سجل السكينة الخالد' : 'Sanctuary Chronicle'}</p>
              </div>
            </div>
          </div>
        )}

        {/* SUB TAB: FOLLOWERS COMPANIONS */}
        {activeSubTab === 'followers' && (
          <div className="animate-fade-in space-y-4" id="tab-my-followers-view">
            <h3 className="text-base font-serif font-bold text-slate-950 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#84A59D]" />
              <span>{language === 'ar' ? 'الرفقاء وحراس الذاكرة الذين يتابعون إسهاماتك العامرة' : 'Companions Supporting Your Legacy Beacons'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {followers.map((f) => {
                const fName = language === 'ar' ? f.nameAr : f.nameEn;
                const fRole = language === 'ar' ? f.roleAr : f.roleEn;
                const fBio = language === 'ar' ? f.bioAr : f.bioEn;

                return (
                  <div
                    key={f.id}
                    className="bg-white border border-stone-200/60 rounded-xl p-4 space-y-4 transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-stone-200 text-slate-800 text-lg flex items-center justify-center">
                          {f.avatar}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-slate-950 text-xs">{fName}</h4>
                          <p className="text-[9px] text-stone-500 font-mono tracking-wide mt-0.5">{fRole}</p>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-sans">
                        {fBio}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-50">
                      <button
                        onClick={() => handleFollowBackToggle(f.id)}
                        className={`w-full py-2 rounded-lg text-xs font-bold transition active:scale-95 cursor-pointer ${
                          f.isFollowingBack
                            ? 'bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200'
                            : 'bg-primary text-white hover:bg-amber-600'
                        }`}
                      >
                        {f.isFollowingBack 
                          ? (language === 'ar' ? '✓ إلغاء المتابعة' : '✓ Following') 
                          : (language === 'ar' ? '＋ رد المتابعة' : '＋ Follow Back')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUB TAB: IDENTITY & SETTINGS PANELS */}
        {activeSubTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" id="tab-identity-settings-view">
            
            {/* Gatekeeper Authentication Credentials Panel */}
            <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-serif font-bold text-slate-950 flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" />
                <span>{t.loginModalTitle}</span>
              </h3>

              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs text-slate-800">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="font-bold text-primary font-serif">
                        {t.verifiedKeeperBadge}
                      </span>
                    </div>
                    <div className="font-bold text-sm mb-1">{keeperName}</div>
                    <div className="text-stone-500 font-mono text-[10px]">{keeperEmail}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsLoggedIn(false);
                      setKeeperEmail('visitor.companion@sanctuary.org');
                      setKeeperName('Guest Companion');
                      setNameInput('Guest Companion');
                      showToast(language === 'ar' ? 'تم تسجيل خروجك بنجاح.' : 'Logged out successfully.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition duration-200 cursor-pointer"
                  >
                    {t.logoutButton}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordLogin} className="space-y-3.5">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {t.loginModalSubtitle}
                  </p>

                  {loginError && (
                    <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded border border-red-150 font-mono">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
                      {t.loginEmailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      value={emailField}
                      onChange={(e) => setEmailField(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-stone-200 bg-[#FAF8F5] text-slate-800 outline-none focus:bg-white focus:border-stone-400"
                      placeholder="name@example.com"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
                      {t.loginPasswordLabel}
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordField}
                      onChange={(e) => setPasswordField(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-lg border border-stone-200 bg-[#FAF8F5] text-slate-800 outline-none focus:bg-white focus:border-stone-400"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold text-xs transition duration-200 active:scale-95 cursor-pointer"
                    >
                      {t.loginButton}
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoLogin}
                      className="w-full py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-150 transition duration-200 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{t.simulatedUserButton}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Language & Profile Meta Fields */}
            <div className="space-y-6">
              
              {/* Language toggler */}
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-mono font-semibold text-slate-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>{t.langButton}</span>
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed">
                  {language === 'ar' 
                    ? 'قم بتحويل لغة المنصة فوراً لتغيير محاذاة النصوص والواجهات كلياً.' 
                    : 'Instantly toggle the primary platform language to swap screen layouts.'}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold select-none cursor-pointer transition ${
                      language === 'en'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-stone-200 bg-[#FAF8F5] text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    English (LTR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold select-none cursor-pointer transition ${
                      language === 'ar'
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-stone-200 bg-[#FAF8F5] text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    العربية (RTL)
                  </button>
                </div>
              </div>

              {/* Bio customization */}
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-widest font-mono font-semibold text-slate-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-secondary" />
                  <span>{language === 'ar' ? 'تعديل السيرة والاسم' : 'Customize Bio & Identity'}</span>
                </h3>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Photo selection upload */}
                  <div className="space-y-2 pb-2 border-b border-stone-100">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block">
                      {language === 'ar' ? 'تحميل صورة شخصية جديدة' : 'Profile Avatar Picture'}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center text-2xl font-bold text-stone-600">
                        {avatarInput && avatarInput.startsWith('data:image') ? (
                          <img src={avatarInput} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <span>{avatarInput || '✨'}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          id="profile-pic-file-input"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setAvatarInput(reader.result as string || '✨');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label
                          htmlFor="profile-pic-file-input"
                          className="px-3 py-1.5 bg-[#FAF8F5] border border-stone-200 hover:bg-stone-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer text-center select-none"
                        >
                          {language === 'ar' ? 'تحميل من الملفات' : 'Upload photo'}
                        </label>
                        <button
                          type="button"
                          onClick={() => setAvatarInput('✨')}
                          className={`text-[9px] text-stone-400 hover:text-stone-600 hover:underline ${language === 'ar' ? 'text-right' : 'text-left'} block mt-0.5`}
                        >
                          {language === 'ar' ? 'إعادة تعيين' : 'Reset to default'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
                      {language === 'ar' ? 'اسمك كحافظ للذكرى' : 'Your Keeper Name'}
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-[#FAF8F5] text-slate-800 focus:bg-white focus:outline-none focus:border-stone-400"
                      placeholder={t.prayerAuthorPlaceholder}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
                      {language === 'ar' ? 'نبذة عنك / بايو' : 'Profile Bio Statement'}
                    </label>
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 bg-[#FAF8F5] text-slate-800 focus:bg-white focus:outline-none focus:border-stone-400 font-sans resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-850 text-white text-xs font-extrabold rounded-xl transition cursor-pointer select-none active:scale-95"
                  >
                    {t.saveName}
                  </button>

                  {isSaved && (
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded text-center font-mono font-medium animate-pulse">
                      {language === 'ar' ? '✓ تم حفظ تعديلات الملف الشخصي بنجاح' : '✓ Name & Avatar updated successfully'}
                    </div>
                  )}
                </form>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
