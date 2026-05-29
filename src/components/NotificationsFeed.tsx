import React from 'react';
import { Notification, ReactionType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, Heart, UserPlus, Trash2, CheckCheck, Compass, ArrowRight } from 'lucide-react';

interface NotificationsFeedProps {
  notifications: Notification[];
  onMarkRead: (notificationId?: string) => void;
  onClearAll: () => void;
  onViewPost: (postId: string) => void;
  onAuthorClick: (userId: string) => void;
}

export function formatRelativeTime(dateStr: string, lang: 'ar' | 'en'): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return lang === 'ar' ? 'الآن' : 'Just now';
  } else if (diffMin < 60) {
    if (lang === 'ar') {
      if (diffMin === 1) return 'منذ دقيقة';
      if (diffMin === 2) return 'منذ دقيقتين';
      if (diffMin <= 10) return `منذ ${diffMin} دقائق`;
      return `منذ ${diffMin} دقيقة`;
    }
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    if (lang === 'ar') {
      if (diffHour === 1) return 'منذ ساعة';
      if (diffHour === 2) return 'منذ ساعتين';
      if (diffHour <= 10) return `منذ ${diffHour} ساعات`;
      return `منذ ${diffHour} ساعة`;
    }
    return `${diffHour}h ago`;
  } else {
    if (lang === 'ar') {
      if (diffDay === 1) return 'منذ يوم';
      if (diffDay === 2) return 'منذ يومين';
      if (diffDay <= 10) return `منذ ${diffDay} أيام`;
      return `منذ ${diffDay} يوم`;
    }
    return `${diffDay}d ago`;
  }
}

export function NotificationsFeed({
  notifications,
  onMarkRead,
  onClearAll,
  onViewPost,
  onAuthorClick,
}: NotificationsFeedProps) {
  const { t, language, dir } = useLanguage();

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) {
      onMarkRead(n.id);
    }
    if (n.post && n.post.id) {
      onViewPost(n.post.id);
    } else {
      onAuthorClick(n.sender.id);
    }
  };

  const getReactionLabel = (type?: ReactionType) => {
    if (!type) return '';
    return language === 'ar' 
      ? t(`reactionTypes` as any)?.[type] || type
      : t(`reactionTypes` as any)?.[type] || type;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Feed Header */}
      <div className="bg-white rounded-2xl p-6 border border-warm-beige/85 shadow-xs flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h2 className="text-xl font-bold font-serif text-charcoal">{t('notifTitle')}</h2>
          <p className="text-xs text-charcoal-light/65 mt-1 leading-relaxed">{t('notifSubtitle')}</p>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2 self-start sm:self-center">
            <button
              onClick={() => onMarkRead()}
              className="flex items-center gap-1 text-[11px] font-bold text-accent-gold hover:text-accent-gold-dark bg-accent-gold/5 hover:bg-accent-gold/10 px-3 py-1.5 rounded-lg border border-accent-gold/15 transition-all cursor-pointer"
            >
              <CheckCheck size={13} />
              <span>{t('btnMarkAllRead')}</span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              <span>{t('btnClearAll')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-warm-beige p-10 text-center space-y-4">
            <div className="w-12 h-12 bg-warm-bg rounded-full flex items-center justify-center mx-auto text-charcoal-light/40">
              <Compass size={24} />
            </div>
            <p className="text-sm text-charcoal-light/75 max-w-sm mx-auto leading-relaxed">
              {t('notifEmptyState')}
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const isRead = n.read;
            
            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group relative bg-white border rounded-xl p-4 flex gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer ${
                  isRead ? 'border-warm-beige/70 opacity-90' : 'border-accent-gold/25 ring-1 ring-accent-gold/5 bg-accent-gold/[0.01]'
                }`}
              >
                {/* Active Unread Bullet Indicator */}
                {!isRead && (
                  <span className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} h-2.5 w-2.5 rounded-full bg-accent-gold animate-pulse`} />
                )}

                {/* Sender Avatar */}
                <img
                  src={n.sender.avatar}
                  alt={n.sender.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick(n.sender.id);
                  }}
                  className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border border-warm-beige flex-shrink-0 hover:scale-102 transition-transform cursor-pointer"
                  referrerPolicy="no-referrer"
                />

                {/* Notification Content */}
                <div className="flex-1 space-y-1 pr-6 pl-6">
                  {/* Sender Name, Username and Action Time */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAuthorClick(n.sender.id);
                      }}
                      className="text-xs font-bold font-sans text-charcoal hover:text-accent-gold transition-colors cursor-pointer"
                    >
                      {n.sender.name}
                    </span>
                    <span className="text-[10px] text-charcoal-light/45 font-mono">@{n.sender.username}</span>
                    <span className="text-[10px] text-charcoal-light/40 font-serif font-medium flex items-center gap-1">
                      <span>•</span>
                      <span>{formatRelativeTime(n.createdAt, language)}</span>
                    </span>
                  </div>

                  {/* Context and Texts */}
                  <div className="text-xs text-charcoal-light leading-relaxed">
                    {n.type === 'comment' && (
                      <div>
                        <span>{t('notifCommented')}</span>
                        {n.post && (
                          <span className="font-semibold text-charcoal mx-1 font-serif">
                            "{n.post.title}"
                          </span>
                        )}
                        {n.commentContent && (
                          <div className="mt-2 text-[11px] p-2 bg-warm-bg rounded-lg italic text-charcoal/80 border-r-2 border-accent-gold/30">
                            "{n.commentContent}"
                          </div>
                        )}
                      </div>
                    )}

                    {n.type === 'reaction' && (
                      <div>
                        <span>
                          {language === 'ar' 
                            ? `أبدى تفاعل (${getReactionLabel(n.reactionType)}) مع منشورك` 
                            : `reacted with (${getReactionLabel(n.reactionType)}) to your post`}
                        </span>
                        {n.post && (
                          <span className="font-semibold text-charcoal mx-1 font-serif">
                            "{n.post.title}"
                          </span>
                        )}
                      </div>
                    )}

                    {n.type === 'follow' && (
                      <span>{t('notifFollowedYou')}</span>
                    )}
                  </div>

                  {/* Trigger Detail Hover Navigation */}
                  <span className="text-[10px] font-bold text-accent-gold hover:text-accent-gold-dark inline-flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{n.post ? t('viewPostAlt') : t('profileTab')}</span>
                    <ArrowRight size={10} className={`transform ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                  </span>
                </div>

                {/* Icon Type Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  n.type === 'comment' ? 'bg-indigo-50 text-indigo-600' :
                  n.type === 'reaction' ? 'bg-amber-50 text-amber-600' :
                  'bg-teal-50 text-teal-600'
                }`}>
                  {n.type === 'comment' && <MessageSquare size={14} />}
                  {n.type === 'reaction' && <Heart size={14} className="fill-current" />}
                  {n.type === 'follow' && <UserPlus size={14} />}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
