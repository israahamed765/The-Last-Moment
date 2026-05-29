import React from 'react';
import { User } from '../types';
import { Heart, Compass, FileText, Sparkles, UserCheck, RefreshCw, LogOut, Globe, Bell } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'feed' | 'profile' | 'notifications';
  setActiveTab: (tab: 'feed' | 'profile' | 'notifications') => void;
  onOpenAuth: () => void;
  onSelectOwnProfile: () => void;
  onLogout: () => void;
  unreadCount?: number;
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSelectOwnProfile,
  onLogout,
  unreadCount,
}: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-warm-beige shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <span 
              onClick={() => setActiveTab('feed')} 
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent-gold/10 text-accent-gold border border-accent-gold/25 cursor-pointer shadow-xs hover:scale-102 transition-all shrink-0"
            >
              <Heart size={18} className="fill-current" />
            </span>
            <div className={`cursor-pointer ${language === 'ar' ? 'text-right' : 'text-left'} min-w-0`} onClick={() => setActiveTab('feed')}>
              <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold font-serif text-charcoal leading-tight truncate">
                {t('appName')}
              </h1>
              <p className="hidden sm:block text-[9px] md:text-[10px] text-accent-sage font-medium tracking-wide mt-0.5">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-warm-bg p-1 rounded-xl border border-warm-beige/60">
            <button
              onClick={() => setActiveTab('feed')}
              id="nav-tab-feed"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
                activeTab === 'feed'
                  ? 'bg-white text-charcoal shadow-xs'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-white/40'
              }`}
            >
              <Compass size={14} className={activeTab === 'feed' ? 'text-accent-gold' : ''} />
              <span>{t('feedTab')}</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              id="nav-tab-notifications"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all relative ${
                activeTab === 'notifications'
                  ? 'bg-white text-charcoal shadow-xs'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-white/40'
              }`}
            >
              <Bell size={14} className={activeTab === 'notifications' ? 'text-accent-gold fill-current font-semibold' : ''} />
              <span>{t('bottomNotifications')}</span>
              {unreadCount && unreadCount > 0 ? (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500 ring-1 ring-white animate-pulse" />
              ) : null}
            </button>

            <button
              onClick={onSelectOwnProfile}
              id="nav-tab-profile"
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold font-sans transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-charcoal shadow-xs'
                  : 'text-charcoal-light/70 hover:text-charcoal hover:bg-white/40'
              }`}
            >
              <FileText size={14} className={activeTab === 'profile' ? 'text-accent-gold' : ''} />
              <span>{t('profileTab')}</span>
            </button>
          </nav>

          {/* Left Auth & Profile Control + Language Switcher */}
          <div className="flex items-center gap-2">
            {/* Language Selection Button */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-warm-beige bg-warm-bg text-xs font-semibold text-charcoal hover:bg-white hover:border-accent-gold transition-all cursor-pointer"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe size={13} className="text-accent-gold" />
              <span className="font-sans font-bold">
                {language === 'ar' ? 'EN' : 'عربي'}
              </span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  id="navbar-switch-prompt"
                  className="hidden sm:flex items-center gap-1 text-[11px] text-accent-gold-dark hover:text-charcoal font-medium bg-warm-bg px-2.5 py-1.5 rounded-lg border border-warm-beige transition-colors"
                  title={t('switchUser')}
                >
                  <RefreshCw size={11} />
                  <span>{t('switchUser')}</span>
                </button>

                <button
                  onClick={onLogout}
                  id="navbar-logout-btn"
                  className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg border border-red-100 transition-colors"
                  title={t('logout')}
                >
                  <LogOut size={11} />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
                
                <div 
                  onClick={onSelectOwnProfile}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                  title={t('profileTab')}
                >
                  <div className={`hidden md:block ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <p className="text-xs font-semibold text-charcoal">{currentUser.name}</p>
                    <p className="text-[10px] text-charcoal-light/50 font-mono">@{currentUser.username}</p>
                  </div>
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow-xs focus:outline-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-gold text-white text-xs font-bold rounded-xl shadow-xs hover:bg-accent-gold-dark transition-all"
              >
                <UserCheck size={14} />
                <span>{t('loginGateway')}</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
