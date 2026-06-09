import React, { useState, useEffect } from 'react';
import { CreatorProfile, Memorial, ContributionEvent } from '../types';
import { Sparkles, Calendar, Eye, Heart, Plus, Edit, ArrowLeft, UserPlus, UserMinus, LayoutGrid, List, Check, Award, BookOpen } from 'lucide-react';
import { translations } from '../i18n';
import MemorialCard from './MemorialCard';

interface CreatorProfileViewProps {
  creatorId: string;
  language: 'en' | 'ar';
  loggedInUserEmail: string;
  loggedInUserName: string;
  isLoggedIn: boolean;
  onBack: () => void;
  onGoToCreateTab: () => void;
  incrementPrayerCount: () => void;
  incrementCandleCount: () => void;
}

export default function CreatorProfileView({
  creatorId,
  language,
  loggedInUserEmail,
  loggedInUserName,
  isLoggedIn,
  onBack,
  onGoToCreateTab,
  incrementPrayerCount,
  incrementCandleCount
}: CreatorProfileViewProps) {
  const t = translations[language];
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [memorials, setMemorials] = useState<Memorial[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch creator details and memorials
  const fetchCreatorData = async () => {
    setIsLoading(true);
    try {
      const pRes = await fetch(`/api/creators/${creatorId}`);
      if (pRes.ok) {
        const pData: CreatorProfile = await pRes.json();
        setProfile(pData);
        // Is followed by me?
        setIsFollowing(pData.followers.includes(loggedInUserName));
      }

      const mRes = await fetch('/api/memorials');
      if (mRes.ok) {
        const mData: Memorial[] = await mRes.json();
        // filter memorials created by this user
        const owned = mData.filter(m => m.creatorId === creatorId);
        setProfile(p => {
          if (!p) return p;
          return {
            ...p,
            memorialsCount: owned.length || p.memorialsCount
          };
        });
        setMemorials(owned);
      }
    } catch (err) {
      console.error('Failed to load creator data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [creatorId, loggedInUserName]);

  const handleFollowChange = async () => {
    if (!profile) return;
    try {
      const response = await fetch(`/api/creators/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerName: loggedInUserName })
      });
      if (response.ok) {
        const updatedProfile: CreatorProfile = await response.json();
        setProfile(updatedProfile);
        setIsFollowing(updatedProfile.followers.includes(loggedInUserName));
      }
    } catch (err) {
      console.error('Follow request error:', err);
    }
  };

  const handleUpdateMemorialLocal = (updated: Memorial) => {
    setMemorials(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-serif text-sm text-stone-600">
          {language === 'ar' ? 'جاري استحضار مزار الحارس...' : 'Loading Guardian Chronicle...'}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4 p-8 bg-white rounded-2xl border border-surface-container">
        <p className="text-sm text-stone-500 italic">
          {language === 'ar' ? 'عذراً، لم نتمكن من العثور على ملف هذا الحارس.' : 'Could not find this keeper profile.'}
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2 text-xs bg-primary text-white rounded-full font-semibold transition"
        >
          {language === 'ar' ? 'العودة للخلف' : 'Back to Sanctuary'}
        </button>
      </div>
    );
  }

  // Determine actual values from Arabic or English
  const name = language === 'ar' ? profile.nameAr : profile.nameEn;
  const role = language === 'ar' ? profile.roleAr : profile.roleEn;
  const bio = language === 'ar' ? profile.bioAr : profile.bioEn;

  // Let's formatting large numbers to sound like Clara's (e.g., "1.2k")
  const formatNum = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };

  // Check if this profiles belongs to the current viewer
  const isMe = isLoggedIn && (loggedInUserName === profile.nameEn || loggedInUserName === profile.nameAr || loggedInUserEmail.split('@')[0] === profile.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in" id={`creator-profile-${profile.id}`}>
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="group mb-6 flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-slate-900 transition-colors"
        id="btn-back-to-sanctuary"
      >
        <ArrowLeft className={`w-4 h-4 transition-transform group-hover:translate-x-[-2px] ${language === 'ar' ? 'rotate-180 group-hover:translate-x-[2px]' : ''}`} />
        <span>{language === 'ar' ? 'العودة إلى محراب الذكريات' : 'Back to Sanctuary'}</span>
      </button>

      {/* 1. Header Hero Card matching UI image */}
      <div className="bg-surface-lowest border border-surface-container/80 rounded-3xl p-6 md:p-10 mb-10 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-10">
          
          {/* Large Avatar Circle with Edit Badge indicator */}
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-primary/5 border-2 border-primary/20 rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-inner transition duration-500 hover:scale-[1.03]">
              {profile.avatar}
            </div>
            {isMe && (
              <div className="absolute bottom-1 right-1 bg-white border border-surface-container p-2 rounded-full text-slate-700 shadow-md hover:scale-110 active:scale-95 cursor-pointer">
                <Edit className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>

          {/* Description & Bio details */}
          <div className="flex-1 text-center lg:text-start space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-950">
                  {name}
                </h2>
                <span className="bg-[#EBF7F2] text-[#2C6E49] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border border-[#2C6E49]/15 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#2C6E49]" />
                  {role}
                </span>
                {isMe && (
                  <span className="bg-slate-100 text-slate-600 text-[9px] font-mono px-2 py-0.5 rounded uppercase">
                    {language === 'ar' ? 'حسابك' : 'Your Workspace'}
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-stone-600 font-sans mt-3 leading-relaxed max-w-2xl">
                {bio}
              </p>
            </div>

            {/* Core Counts Metrics Row */}
            <div className="grid grid-cols-3 gap-3 md:gap-8 max-w-sm mx-auto lg:mx-0 pt-2 border-t border-surface-container/60">
              <div className="text-center lg:text-start">
                <p className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-none">
                  {formatNum(memorials.length)}
                </p>
                <p className="text-[9px] md:text-[10px] text-stone-500 font-mono tracking-widest uppercase mt-1">
                  {language === 'ar' ? 'صبغ ذكريات' : 'MEMORIALS'}
                </p>
              </div>
              <div className="text-center lg:text-start">
                <p className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-none">
                  {formatNum(profile.contributionsCount)}
                </p>
                <p className="text-[9px] md:text-[10px] text-stone-500 font-mono tracking-widest uppercase mt-1">
                  {language === 'ar' ? 'مساهمات' : 'CONTRIBUTIONS'}
                </p>
              </div>
              <div className="text-center lg:text-start">
                <p className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-none">
                  {formatNum(profile.remembrancesCount)}
                </p>
                <p className="text-[9px] md:text-[10px] text-stone-500 font-mono tracking-widest uppercase mt-1">
                  {language === 'ar' ? 'مستذكرون' : 'REMEMBRANCES'}
                </p>
              </div>
            </div>
            
            {/* Followers count tracker */}
            <div className="text-[10px] text-stone-500 font-mono bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-100 inline-block">
              {language === 'ar' ? 'يتابعه ' : 'Followed by '}
              <span className="font-bold text-slate-800">{profile.followers.length}</span>
              {language === 'ar' ? ' من حراس الضياء' : ' memorial keepers'}
            </div>
          </div>

          {/* Quick Action buttons on right aligning with image */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-48 self-center lg:self-start">
            <button
              onClick={onGoToCreateTab}
              className="flex-1 flex items-center justify-center gap-2 bg-[#A8D3E6]/30 hover:bg-[#A8D3E6]/50 text-slate-950 px-4 py-3 rounded-2xl text-xs font-bold border border-[#A8D3E6]/50 transition duration-300 active:scale-95 shadow-xs"
              id="profile-action-create-mem"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إنشاء ذكرى جديدة' : 'Create New Memory'}</span>
            </button>

            {!isMe ? (
              <button
                onClick={handleFollowChange}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold border transition duration-300 active:scale-95 ${
                  isFollowing
                    ? 'bg-[#EBF7F2] border-[#2C6E49]/30 text-[#2C6E49]'
                    : 'bg-primary hover:bg-primary-dark border-transparent text-white shadow-sm'
                }`}
                id="profile-action-follow"
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تابعت الحارس' : 'Following'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'متابعة الحارس' : 'Follow'}</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onGoToCreateTab}
                className="flex-1 bg-white hover:bg-surface-low text-slate-700 px-4 py-3 rounded-2xl text-xs font-bold border border-surface-container transition shadow-xs"
                id="profile-action-edit-work"
              >
                <span>{language === 'ar' ? 'إدارة لوحتك' : 'Manage Account'}</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. My Shared Memories section matching image grid layout */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center justify-between border-b border-surface-container/60 pb-3">
          <h3 className="text-xl font-serif font-bold text-slate-950">
            {language === 'ar' ? 'باقة الذكريات المشتركة' : 'My Shared Memories'}
          </h3>
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-slate-950 shadow-xs' : 'text-stone-500 hover:text-slate-900'}`}
              id="toggle-shared-mem-grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-slate-950 shadow-xs' : 'text-stone-500 hover:text-slate-900'}`}
              id="toggle-shared-mem-list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="creator-memories-grid">
            {memorials.map(memorial => (
              <MemorialCard
                key={memorial.id}
                memorial={memorial}
                language={language}
                keeperName={loggedInUserName}
                onUpdate={handleUpdateMemorialLocal}
                incrementCandleCount={incrementCandleCount}
                incrementPrayerCount={incrementPrayerCount}
              />
            ))}

            {/* Clickable Add New Chapter Box aligning with images */}
            <div
              onClick={onGoToCreateTab}
              className="group border-2 border-dashed border-primary/20 hover:border-primary/50 bg-white hover:bg-[#A8D3E6]/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[350px]"
              id="btn-shortcut-add-chapter"
            >
              <div className="bg-[#A8D3E6]/20 p-4 rounded-full text-slate-800 mb-4 transition-transform group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-serif font-bold text-slate-900 text-lg group-hover:text-primary transition-colors">
                {language === 'ar' ? 'إضافة فصل طاهر جديد' : 'Add New Chapter'}
              </p>
              <p className="text-xs text-stone-500 font-sans mt-2 max-w-[200px] leading-relaxed">
                {language === 'ar' ? 'استمر بمد خيوط وحبال الذكرى والوفاء الطاهر.' : 'Continue the thread of remembrance.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4" id="creator-memories-list">
            {memorials.map(m => (
              <div
                key={m.id}
                className="bg-white border border-surface-container rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                    {m.image === 'lily' ? '🪷' : m.image === 'forest' ? '🌲' : '📚'}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-950 text-base">
                      {language === 'ar' ? m.nameAr : m.nameEn}
                    </h4>
                    <p className="text-xs text-stone-500 font-mono">
                      {m.birthYear} — {m.passingYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-primary fill-primary/15" />
                    {m.candlesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    {new Date(m.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Journey of Contributions vertical timeline matching image */}
      <div className="bg-surface-lowest border border-surface-container rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-slate-950 border-b border-surface-container/60 pb-3 mb-8">
          {language === 'ar' ? 'مسيرة العطاء والمواساة' : 'Journey of Contributions'}
        </h3>

        {profile.contributionsHistory.length === 0 ? (
          <p className="text-xs text-stone-400 italic font-sans py-4 text-center">
            {language === 'ar' ? 'لم يسجّل الحارس أي مسيرات مساهمة عامة بعد.' : 'No contributions registered on the chronicle yet.'}
          </p>
        ) : (
          <div className="relative border-l-2 border-stone-200/80 ms-4 md:ms-8 pl-6 md:pl-10 space-y-8" id="contribution-timeline">
            {profile.contributionsHistory.map((event, index) => (
              <div key={event.id || index} className="relative group">
                
                {/* Visual Circle Indicator Node */}
                <span className="absolute -left-[31px] md:-left-[47px] top-1.5 flex h-4 w-4 rounded-full border-2 border-primary bg-white ring-8 ring-stone-100/10 transition group-hover:scale-110 group-hover:bg-primary"></span>
                
                {/* Card Container holding dynamic activities log details */}
                <div className="bg-white border border-stone-100 p-4 rounded-2xl hover:border-primary/20 transition-all duration-300 shadow-xs flex flex-col md:flex-row justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 font-sans">
                        {language === 'ar' 
                          ? (event.type === 'memorial_created' ? 'تأسيس مزار ذكرى' : event.type === 'photo_added' ? 'إضافة وسام وصورة' : event.type === 'candle_lit' ? 'إيقاد سراج الضياء' : 'كتابة دعاء طاهر')
                          : (event.type === 'memorial_created' ? 'Memorial Created' : event.type === 'photo_added' ? 'Photo Contributed' : event.type === 'candle_lit' ? 'Candle Beacon Kindled' : 'Prayer Contributed')
                        }
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-sans leading-relaxed">
                      {language === 'ar' ? event.descriptionAr : event.descriptionEn}
                    </p>
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono whitespace-nowrap self-end md:self-start bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                    {language === 'ar' ? event.timeAgoAr : event.timeAgoEn}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
