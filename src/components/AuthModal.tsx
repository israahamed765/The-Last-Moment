import React, { useState } from 'react';
import { User } from '../types';
import { X, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onSelectUser: (user: User) => void;
  onRegisterUser: (name: string, username: string, bio: string, avatar: string) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onRegisterUser,
}: AuthModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  if (!isOpen) return null;

  // Pre-configured avatars for user selection during sign up
  const AVATAR_TEMPLATES = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;
    
    // Fallback avatar if empty
    const finalAvatar = avatarUrl || AVATAR_TEMPLATES[0];
    onRegisterUser(
      name.trim(),
      username.trim().toLowerCase().replace(/\s+/g, '_'),
      bio.trim() || "هاوٍ لتوثيق اللحظات الطيبة وحفظ الأثر الصادق لممرات الذاكرة.",
      finalAvatar
    );
    setIsRegistering(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setBio('');
    setAvatarUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-warm-beige overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        id="auth-modal-card"
      >
        {/* Header decoration */}
        <div className="h-2 bg-gradient-to-r from-accent-gold via-accent-sage to-accent-gold" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-auth-modal"
          className="absolute top-4 left-4 p-2 text-charcoal/60 hover:text-charcoal hover:bg-warm-bg rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold font-serif text-charcoal">بوابة الهوية الصادقة</h3>
            <p className="text-charcoal-light/70 text-sm mt-1">
              الرجاء اختيار أحد الحسابات لاستعراض المنصة، أو إنشاء سجل جديد لحفظ ذكرياتك الخاصة.
            </p>
          </div>

          {!isRegistering ? (
            <div className="space-y-6">
              {/* Profile switcher list */}
              <div>
                <label className="block text-md font-medium text-charcoal mb-3">
                  تصفح كأحد المستخدمين الموجودين:
                </label>
                <div className="space-y-3">
                  {users.map((user) => {
                    const isSelected = currentUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        id={`switch-user-${user.username}`}
                        onClick={() => {
                          onSelectUser(user);
                          onClose();
                        }}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border text-right transition-all duration-200 ${
                          isSelected
                            ? 'border-accent-gold bg-warm-bg/50 ring-2 ring-accent-gold/20'
                            : 'border-warm-beige hover:border-accent-gold/40 hover:bg-warm-bg/30'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-charcoal text-base truncate">{user.name}</h4>
                            {isSelected && (
                              <span className="flex items-center gap-1 text-xs text-accent-gold font-medium bg-white px-2 py-0.5 rounded-full border border-accent-gold/20">
                                <Check size={12} /> النشط الآن
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-charcoal-light/60">@{user.username}</p>
                          <p className="text-xs text-charcoal-light/75 truncate mt-1">{user.bio}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-warm-beige"></div>
                <span className="flex-shrink mx-4 text-xs text-charcoal-light/40 font-medium">أو</span>
                <div className="flex-grow border-t border-warm-beige"></div>
              </div>

              {/* Toggle registering button */}
              <button
                type="button"
                id="toggle-register"
                onClick={() => setIsRegistering(true)}
                className="w-full py-3 bg-accent-sage hover:bg-accent-sage-dark text-white font-medium rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-accent-sage/30"
              >
                إنشاء حساب جديد بالكامل
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل اسمك الكريم (مثال: فيصل الحربي)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-right transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">اسم المستخدم الحصري (English)</label>
                <input
                  type="text"
                  required
                  pattern="^[a-zA-Z0-9_]{3,15}$"
                  title="اسم مستخدم بالإنجليزية يحتوي على أحرف وأرقام وشرطة سفلية فقط، من ٣ إلى ١٥ حرفًا"
                  placeholder="مثال: faysal_9"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold ltr text-left transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">نبذة شخصية دافئة عنك</label>
                <textarea
                  placeholder="صف كيف تنظر للذكريات واللحظات الباقية كأثر..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-right transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">اختر صورة تعبيرية لشخصيتك:</label>
                <div className="flex gap-3 justify-center items-center py-2">
                  {AVATAR_TEMPLATES.map((url, i) => {
                    const isSelected = avatarUrl === url || (i === 0 && !avatarUrl);
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setAvatarUrl(url)}
                        className={`relative rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected ? 'border-accent-gold scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={`Avatar option ${i}`} className="w-12 h-12 rounded-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-accent-gold/25 flex items-center justify-center rounded-full">
                            <Check size={14} className="text-white font-bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  id="submit-register"
                  className="flex-1 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white font-semibold rounded-xl transition-all shadow-sm"
                >
                  حفظ وتسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 bg-warm-beige hover:bg-accent-gold/10 text-charcoal/80 font-medium rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
