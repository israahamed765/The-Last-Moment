import React from 'react';
import { Home, Bell, Plus, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavigationProps {
  activeTab: 'feed' | 'profile' | 'notifications';
  setActiveTab: (tab: 'feed' | 'profile' | 'notifications') => void;
  unreadCount: number;
  onOpenCreate: () => void;
  avatarUrl?: string;
  userName?: string;
}

export function BottomNavigation({
  activeTab,
  setActiveTab,
  unreadCount,
  onOpenCreate,
  avatarUrl,
  userName,
}: BottomNavigationProps) {
  const { t } = useLanguage();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warm-beige shadow-lg pb-safe-bottom">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        
        {/* Home Tab */}
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none transition-all cursor-pointer ${
            activeTab === 'feed'
              ? 'text-accent-gold scale-105 font-semibold'
              : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <Home size={20} className={activeTab === 'feed' ? 'fill-current bg-accent-gold/5 rounded-full p-0.5' : ''} />
          <span className="text-[10px] mt-0.5 font-sans whitespace-nowrap">
            {t('bottomHome')}
          </span>
        </button>

        {/* Notifications Tab */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'text-accent-gold scale-105 font-semibold'
              : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          <Bell size={20} className={activeTab === 'notifications' ? 'fill-current bg-accent-gold/5 rounded-full p-0.5' : ''} />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-6 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-1 ring-white animate-pulse">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5 font-sans whitespace-nowrap">
            {t('bottomNotifications')}
          </span>
        </button>

        {/* Center Floating Create Memory Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenCreate}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-gold text-white shadow-md hover:bg-accent-gold-dark hover:shadow-lg transition-all border-4 border-white transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-accent-gold/10"
            title={t('bottomCreate')}
          >
            <Plus size={24} className="stroke-[2.5]" />
          </button>
        </div>

        {/* Profile Tab */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center select-none transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-accent-gold scale-105 font-semibold'
              : 'text-charcoal-light/60 hover:text-charcoal'
          }`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName || "profile"}
              className={`w-5 h-5 rounded-full object-cover border transition-all ${
                activeTab === 'profile' ? 'border-accent-gold ring-2 ring-accent-gold/10 scale-105' : 'border-gray-200'
              }`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <User size={20} />
          )}
          <span className="text-[10px] mt-0.5 font-sans whitespace-nowrap">
            {t('bottomProfile')}
          </span>
        </button>

      </div>
    </div>
  );
}
