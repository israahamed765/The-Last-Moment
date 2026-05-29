import React, { useState } from 'react';
import { User, Post } from '../types';
import { Calendar, Mail, FileText, Heart, MessageSquare, Edit2, Check, X, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProfileViewProps {
  user: User;
  isCurrentUser: boolean;
  userPosts: Post[];
  totalReactionsCount: number;
  onUpdateBio: (newName: string, newBio: string) => void;
  onViewPost: (post: Post) => void;
  currentUser?: User | null;
  onFollowUser?: (targetId: string) => void;
}

export function ProfileView({
  user,
  isCurrentUser,
  userPosts,
  totalReactionsCount,
  onUpdateBio,
  onViewPost,
  currentUser,
  onFollowUser,
}: ProfileViewProps) {
  const { language, t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user.name);
  const [editedBio, setEditedBio] = useState(user.bio);

  // Security - password change states
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  const handleSave = () => {
    if (!editedName.trim()) return;
    onUpdateBio(editedName.trim(), editedBio.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(user.name);
    setEditedBio(user.bio);
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (newPassword !== confirmNewPassword) {
      setSecurityError(t('passwordMismatchError'));
      return;
    }

    if (newPassword.length < 5) {
      setSecurityError(t('passwordRequirements'));
      return;
    }

    try {
      setSecurityLoading(true);
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setSecuritySuccess(t('passwordChangeSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setSecurityError(data.error || (language === 'ar' ? 'عذراً، كلمة المرور الحالية غير مطابقة للكلمة المسجّلة.' : 'Sorry, the current password does not match.'));
      }
    } catch (err) {
      setSecurityError(t('networkError'));
    } finally {
      setSecurityLoading(false);
    }
  };

  const alignClass = language === 'ar' ? 'text-right' : 'text-left';
  const flexDirClass = language === 'ar' ? 'md:flex-row' : 'md:flex-row-reverse';

  return (
    <div className="space-y-6 animate-fadeIn" id={`profile-view-${user.username}`}>
      {/* Profile Cover Card with soft cream background */}
      <div className="bg-white rounded-2xl border border-warm-beige shadow-sm overflow-hidden p-6 md:p-8 relative">
        {/* Soft background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-warm-bg/60 via-transparent to-accent-gold/5 pointer-events-none" />

        <div className={`relative flex flex-col gap-6 items-center md:items-start ${alignClass}`}>
          {/* Avatar Area */}
          <div className="relative shrink-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-md object-cover"
            />
            {isCurrentUser && (
              <span className={`absolute bottom-1 bg-accent-gold text-white p-1.5 rounded-full shadow border border-white hover:scale-105 transition-all text-[10px] ${
                language === 'ar' ? 'right-1' : 'left-1'
              }`}>
                <Camera size={14} />
              </span>
            )}
          </div>

          {/* User Meta Data & Dynamic Bio Edit */}
          <div className="flex-1 min-w-0 w-full">
            {!isEditing ? (
              <div className="space-y-2">
                <div className={`flex flex-col md:flex-row md:items-center gap-3 justify-center ${language === 'ar' ? 'md:justify-start' : 'md:justify-end'}`}>
                  <h2 className="text-2xl font-bold font-serif text-charcoal">{user.name}</h2>
                  <span className="text-xs text-charcoal-light/50 font-mono">@{user.username}</span>
                  {isCurrentUser && (
                    <button
                      onClick={() => setIsEditing(true)}
                      id="edit-profile-btn"
                      className="inline-flex items-center gap-1.5 text-xs text-accent-gold hover:text-accent-gold-dark font-semibold px-2.5 py-1 rounded-lg bg-warm-bg/50 border border-warm-beige cursor-pointer transition-all shrink-0"
                    >
                      <Edit2 size={12} /> {t('btnEditBio')}
                    </button>
                  )}
                  {!isCurrentUser && currentUser && onFollowUser && (
                    <button
                      onClick={() => onFollowUser(user.id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer transition-all shrink-0 ${
                        currentUser.followingIds?.includes(user.id)
                          ? 'bg-accent-sage/10 text-accent-sage border-accent-sage/20'
                          : 'bg-accent-gold text-white border-accent-gold hover:bg-accent-gold-dark shadow'
                      }`}
                    >
                      <span>{currentUser.followingIds?.includes(user.id) ? t('btnFollowing') : t('btnFollow')}</span>
                    </button>
                  )}
                </div>

                <p className="text-sm text-charcoal-light/80 leading-relaxed font-sans max-w-2xl">
                  {user.bio}
                </p>

                <div className={`flex flex-wrap gap-x-4 gap-y-1 justify-center pt-2 text-xs text-charcoal-light/60 ${language === 'ar' ? 'md:justify-start' : 'md:justify-end'}`}>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-accent-gold" />
                    <span>
                      {language === 'ar' ? 'انضم في ' : 'Joined '}
                      {new Date(user.joinedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long' })}
                    </span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail size={14} className="text-accent-gold" />
                    <span>{user.email}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 w-full max-w-xl bg-warm-bg/45 p-4 rounded-xl border border-warm-beige mx-auto md:mx-0">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">{t('fullNameLabel')}</label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-warm-beige text-charcoal bg-white focus:outline-none focus:ring-1 focus:ring-accent-gold font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">{t('bioLabel')}</label>
                  <textarea
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-1.5 rounded-lg border border-warm-beige text-charcoal bg-white focus:outline-none focus:ring-1 focus:ring-accent-gold font-sans resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSave}
                    id="save-profile-btn"
                    className="bg-accent-sage text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={12} /> {t('btnSave')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-warm-beige text-charcoal/80 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} /> {t('btnCancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bento Stats Panel */}
        <div className={`grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-warm-beige/60 max-w-md ${language === 'ar' ? 'ml-auto text-right' : 'mr-auto text-left'}`}>
          <div className="bg-warm-bg/45 p-3 rounded-xl border border-warm-beige/50 text-center">
            <span className="block text-xl font-bold text-accent-gold font-mono">{userPosts.length}</span>
            <span className="text-[10px] text-charcoal-light/70 font-medium">{t('statDocumented')}</span>
          </div>

          <div className="bg-warm-bg/45 p-3 rounded-xl border border-warm-beige/50 text-center">
            <span className="block text-xl font-bold text-accent-sage font-mono">{totalReactionsCount}</span>
            <span className="text-[10px] text-charcoal-light/70 font-medium">{t('statImpact')}</span>
          </div>

          <div className="bg-warm-bg/45 p-3 rounded-xl border border-warm-beige/50 text-center">
            <span className="block text-xl font-bold text-accent-gold font-mono">
              {userPosts.reduce((acc, p)=> acc + (p.imageUrl ? 1 : 0), 0)}
            </span>
            <span className="text-[10px] text-charcoal-light/70 font-medium">{t('statPhotos')}</span>
          </div>
        </div>
      </div>

      {/* Account Security - Change Password Settings Card */}
      {isCurrentUser && (
        <div className="bg-white rounded-2xl border border-warm-beige shadow-xs overflow-hidden p-6 space-y-4">
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${alignClass}`}>
            <div>
              <h3 className="font-serif font-bold text-base text-charcoal flex items-center gap-2">
                <span>🔐 {t('securityHeader')}</span>
              </h3>
              <p className="text-xs text-charcoal-light/100 mt-0.5">{t('securitySub')}</p>
            </div>
            <button
              onClick={() => {
                setShowSecurityForm(!showSecurityForm);
                setSecurityError('');
                setSecuritySuccess('');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              className="text-xs py-1.5 px-3 bg-warm-bg border border-warm-beige hover:border-accent-gold text-charcoal hover:text-accent-gold-dark font-bold rounded-xl transition-all self-start sm:self-center cursor-pointer"
            >
              {showSecurityForm ? (language === 'ar' ? "إخفاء لوحة الأمان ×" : "Hide Security Panel ×") : (language === 'ar' ? "إظهار نموذج التغيير 🔑" : "Show Change Password 🔑")}
            </button>
          </div>

          {showSecurityForm && (
            <form onSubmit={handlePasswordChange} className={`mt-4 space-y-4 max-w-md border-t border-warm-beige/35 pt-4 animate-fadeIn ${alignClass} ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
              {securityError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 block shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}
              {securitySuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block shrink-0" />
                  <span>{securitySuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">{t('currentPasswordLabel')}</label>
                <input
                  type="password"
                  required
                  placeholder={language === 'ar' ? 'الافتراضية: 123456' : 'Default: 123456'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border border-warm-beige bg-warm-bg/20 text-xs text-charcoal font-sans focus:outline-none focus:ring-1 focus:ring-accent-gold ${alignClass}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">{t('newPasswordLabel')}</label>
                  <input
                    type="password"
                    required
                    placeholder={language === 'ar' ? 'رمز حماية جديد' : 'New secret code'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border border-warm-beige bg-warm-bg/20 text-xs text-charcoal font-sans focus:outline-none focus:ring-1 focus:ring-accent-gold ${alignClass}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">{t('confirmPassLabel')}</label>
                  <input
                    type="password"
                    required
                    placeholder={language === 'ar' ? 'كرر كتابه الرمز السري' : 'Repeat password confirmation'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full px-4 py-2 rounded-xl border border-warm-beige bg-warm-bg/20 text-xs text-charcoal font-sans focus:outline-none focus:ring-1 focus:ring-accent-gold ${alignClass}`}
                  />
                </div>
              </div>

              {/* Real-time validation cues */}
              {newPassword && confirmNewPassword && (
                <div className="text-xs">
                  {newPassword === confirmNewPassword ? (
                    <span className="text-emerald-600 font-bold">{t('passwordsMatch')}</span>
                  ) : (
                    <span className="text-rose-600 font-bold">{t('passwordsMismatch')}</span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={securityLoading}
                className={`py-2 px-5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  language === 'ar' ? 'mr-auto' : 'ml-auto'
                }`}
              >
                {securityLoading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('saving')}</span>
                  </>
                ) : (
                  <span>{t('btnSave')} 🔒</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* User's documented posts feed */}
      <div>
        <h3 className={`text-lg font-bold font-serif text-charcoal mb-4 flex items-center gap-2 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
          <FileText size={18} className="text-accent-gold" />
          <span>{t('archiveTitle')} ({userPosts.length})</span>
        </h3>

        {userPosts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-warm-beige p-6">
            <p className="text-charcoal-light/60">{t('noPosts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPosts.map((post) => {
              const reactionsSum = post.reactions.affect + post.reactions.legacy + post.reactions.pray;
              return (
                <div
                  key={post.id}
                  id={`profile-post-card-${post.id}`}
                  onClick={() => onViewPost(post)}
                  className="bg-white rounded-xl border border-warm-beige p-5 hover:border-accent-gold/50 cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className={alignClass}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-semibold text-accent-gold bg-warm-bg px-2.5 py-1 rounded-full border border-warm-beige">
                        # {language === 'ar' ? post.category : (post.category === 'وداع' ? 'Farewell' : post.category === 'ذكرى' ? 'Memorial' : 'Kind Word')}
                      </span>
                      <span className="text-[10px] text-charcoal-light/50 font-mono">
                        {new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h4 className="font-bold text-charcoal group-hover:text-accent-gold transition-colors font-serif text-base mb-2">
                      {post.title}
                    </h4>

                    <p className="text-xs text-charcoal-light/80 line-clamp-3 leading-relaxed mb-4">
                      {post.content}
                    </p>
                  </div>

                  {post.imageUrl && (
                    <div className="h-28 rounded-lg overflow-hidden mb-4 border border-warm-beige">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className={`flex items-center gap-4 text-xs text-charcoal-light/60 border-t border-warm-beige/40 pt-3 mt-auto ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-accent-gold" />
                      <span>{reactionsSum} {t('interactionCount')}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
