import React, { useState, useRef } from 'react';
import { User } from '../types';
import { 
  Sparkles, 
  Heart, 
  Camera, 
  Mail, 
  User as UserIcon, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  UploadCloud, 
  KeyRound,
  Eye,
  EyeOff,
  Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AuthOnboardingProps {
  users: User[];
  onSelectUser: (user: User) => void;
  onRegisterUser: (user: {
    name: string;
    username: string;
    email: string;
    password?: string;
    bio: string;
    avatar: string;
  }) => Promise<boolean>;
  onLoginUser: (loginQuery: string, password?: string) => Promise<User | null>;
}

// Pre-configured warm avatars for selection
const AVATAR_TEMPLATES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
];

export function AuthOnboarding({
  users,
  onSelectUser,
  onRegisterUser,
  onLoginUser
}: AuthOnboardingProps) {
  const { language, setLanguage, t } = useLanguage();
  
  // Screens: 'welcome' | 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup' | 'forgot'>('welcome');
  
  // Login State
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up Multi-Step
  const [signupStep, setSignupStep] = useState(1);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [signupName, setSignupName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken'>('idle');
  
  const [signupBio, setSignupBio] = useState('');
  const [signupAvatar, setSignupAvatar] = useState(AVATAR_TEMPLATES[0]);
  const [customAvatarBase64, setCustomAvatarBase64] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // 1. Live Username Uniqueness validation over API
  const handleCheckUsername = async (uName: string) => {
    const formatted = uName.toLowerCase().trim().replace(/\s+/g, '_');
    setSignupUsername(formatted);
    
    if (formatted.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    try {
      setCheckingUsername(true);
      const res = await fetch('/api/users/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formatted })
      });
      const data = await res.json();
      if (data.success) {
        setUsernameStatus(data.available ? 'available' : 'taken');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingUsername(false);
    }
  };

  // 2. Custom photo upload converter with drag and drop
  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPhoto(e.dataTransfer.files[0]);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPhoto(e.target.files[0]);
    }
  };

  const processPhoto = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى سحب أو اختيار ملف صور صالح فقط.' : 'Please drag or select a valid image file only.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomAvatarBase64(event.target.result as string);
        setSignupAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Form Submission Handlers
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginQuery.trim() || !loginPassword) {
      setLoginError(t('fieldsRequired'));
      return;
    }

    try {
      setLoginLoading(true);
      const user = await onLoginUser(loginQuery, loginPassword);
      if (!user) {
        setLoginError(t('loginFailed'));
      }
    } catch (err) {
      setLoginError(t('networkError'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupStep < 3) {
      // Step validators before incrementing
      if (signupStep === 1) {
        if (!signupEmail || !signupPassword) {
          setSignupError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter your email and password.');
          return;
        }
        if (signupPassword !== signupConfirmPassword) {
          setSignupError(t('passwordMismatchError'));
          return;
        }
        if (signupPassword.length < 5) {
          setSignupError(t('passwordRequirements'));
          return;
        }
        setSignupStep(2);
      } else if (signupStep === 2) {
        if (!signupName.trim() || !signupUsername.trim()) {
          setSignupError(language === 'ar' ? 'يرجى كتابة الاسم الكريم واسم المستخدم لمواصلة التسجيل.' : 'Please write your name and username to continue registration.');
          return;
        }
        if (usernameStatus === 'taken') {
          setSignupError(language === 'ar' ? 'اسم المستخدم هذا مستخدم بالفعل؛ اختر اسماً آخر.' : 'This username is already taken; choose another.');
          return;
        }
        setSignupStep(3);
      }
      return;
    }

    // Step 3 registration trigger
    try {
      setSignupLoading(true);
      const success = await onRegisterUser({
        name: signupName.trim(),
        username: signupUsername.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        bio: signupBio.trim() || (language === 'ar' ? 'هاوٍ لتوثيق اللحظات الطيبة وحفظ الأثر الصادق لممرات الذاكرة.' : 'An amateur chronicler of warm moments and lasting loyal echoes.'),
        avatar: signupAvatar
      });

      if (!success) {
        setSignupError(t('registerUsernameTaken'));
      }
    } catch (err) {
      setSignupError(t('registerError'));
    } finally {
      setSignupLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim()) {
      setForgotError(t('emailRequired'));
      return;
    }

    try {
      setForgotLoading(true);
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setRecoverySent(true);
      } else {
        setForgotError(data.error || (language === 'ar' ? 'هذا البريد الإلكتروني غير مرتبط بأي حساب أثر.' : 'This email is not associated with any legacy account.'));
      }
    } catch (err) {
      setForgotError(t('networkError'));
    } finally {
      setForgotLoading(false);
    }
  };

  const alignTextClass = language === 'ar' ? 'text-right' : 'text-left';
  const forceDirClass = language === 'ar' ? 'text-right' : 'text-left';
  const reverseArrow = language === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />;
  const forwardArrow = language === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 font-sans text-charcoal relative">
      
      {/* Decorative Warm Top Ambient Accent */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-accent-gold via-accent-sage to-accent-gold" />
      
      {/* Language Switcher Floating Button on Onboarding Screen */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-warm-beige bg-white shadow-xs text-xs font-semibold text-charcoal hover:border-accent-gold transition-all cursor-pointer"
        >
          <Globe size={13} className="text-accent-gold" />
          <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-warm-beige overflow-hidden">
        
        {/* Visual Brand Header Banner */}
        <div className="p-8 pb-4 text-center space-y-3 bg-gradient-to-b from-[#FDFBF7]/60 to-white border-b border-warm-beige/35">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent-gold/10 flex items-center justify-center border border-accent-gold/25 shadow-xs">
            <Heart size={26} className="text-accent-gold fill-accent-gold/20 animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black text-[#2C2523] tracking-tight">{t('appName')}</h1>
            <p className="text-xs text-charcoal-light/80 mt-1 max-w-sm mx-auto leading-relaxed">
              {t('appDescription')}
            </p>
          </div>
        </div>

        {/* Dynamic View Card Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* 1. Welcome View */}
          {mode === 'welcome' && (
            <div className={`space-y-6 ${alignTextClass}`}>
              <div className="space-y-1.5 text-center">
                <h2 className="text-lg font-serif font-bold text-[#2C2523]">{t('welcomeTitle')}</h2>
                <p className="text-xs text-charcoal-light/75">{t('welcomeSubtitle')}</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="w-full py-3.5 bg-accent-gold hover:bg-accent-gold-dark text-white font-bold rounded-2xl shadow-md transition-all hover:scale-101 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} className="animate-pulse text-white" />
                  <span>{t('btnSignup')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full py-3.5 bg-white hover:bg-warm-bg/75 text-charcoal hover:text-accent-gold-dark border border-warm-beige font-semibold rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound size={15} className="text-accent-gold" />
                  <span>{t('btnLogin')}</span>
                </button>
              </div>

              {/* Cozy divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-warm-beige/60"></div>
                <span className="flex-shrink mx-4 text-[10px] text-charcoal-light/45 font-semibold">{t('demoAccountTitle')}</span>
                <div className="flex-grow border-t border-warm-beige/60"></div>
              </div>

              {/* Demo Accounts Slider */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#2C2523]">{t('demoAccountLabel')}</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {users.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                      }}
                      className="w-full p-3 bg-warm-bg/30 hover:bg-warm-bg border border-warm-beige/65 hover:border-accent-gold/45 rounded-xl transition-all flex items-center gap-3.5 group cursor-pointer"
                    >
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform" 
                      />
                      <div className={`flex-1 min-w-0 ${alignTextClass}`}>
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-charcoal">{u.name}</h4>
                          <span className="text-[9px] text-accent-gold font-medium bg-white px-2 py-0.5 rounded-full border border-warm-beige/60">
                            {t('visitDemo')}
                          </span>
                        </div>
                        <p className="text-[10px] text-charcoal-light/50">@{u.username}</p>
                        <p className="text-[10px] text-charcoal-light/75 truncate mt-0.5">{u.bio}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-center text-[10px] text-charcoal-light/45 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-accent-sage" />
                <span>{t('sslShield')}</span>
              </div>
            </div>
          )}

          {/* 2. Login View */}
          {mode === 'login' && (
            <div className={`space-y-4 ${alignTextClass}`}>
              <div className="flex items-center justify-between border-b border-warm-beige/50 pb-3">
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="text-xs text-charcoal-light hover:text-charcoal flex items-center gap-1 transition-colors"
                >
                  {reverseArrow}
                  <span>{t('backBtn')}</span>
                </button>
                <h2 className="text-lg font-serif font-bold text-charcoal">{t('loginHeader')}</h2>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-1.5 leading-relaxed font-sans">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">{t('emailOrUsername')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('emailOrUsernamePlaceholder')}
                      value={loginQuery}
                      onChange={(e) => setLoginQuery(e.target.value)}
                      required
                      className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                        language === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                      }`}
                    />
                    <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                      language === 'ar' ? 'right-3.5' : 'left-3.5'
                    }`}>
                      <Mail size={14} />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold text-accent-gold-dark hover:underline"
                    >
                      {t('forgotPassLink')}
                    </button>
                    <label className="block text-xs font-bold text-charcoal">{t('passwordLabel')}</label>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder={t('passwordPlaceholder')}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                        language === 'ar' ? 'pl-10 pr-10 text-right' : 'pr-10 pl-10 text-left'
                      }`}
                    />
                    <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                      language === 'ar' ? 'right-3.5' : 'left-3.5'
                    }`}>
                      <Lock size={14} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 hover:text-charcoal transition-colors p-1 ${
                        language === 'ar' ? 'left-3' : 'right-3'
                      }`}
                    >
                      {showLoginPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-101 flex items-center justify-center gap-1.5 cursor-pointer animate-fadeIn"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin text-white" />
                      <span>{t('verifyIdentity')}</span>
                    </>
                  ) : (
                    <span>{t('btnConfirmLogin')}</span>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-charcoal-light">
                <span>{t('noAccount')} </span>
                <button
                  onClick={() => setMode('signup')}
                  className="text-accent-gold-dark font-bold hover:underline"
                >
                  {t('openAccountBtn')}
                </button>
              </div>
            </div>
          )}

          {/* 3. Multi-Step Sign-Up View */}
          {mode === 'signup' && (
            <div className={`space-y-4 ${alignTextClass}`}>
              {/* Progress Stepper indicators */}
              <div className="flex items-center justify-between border-b border-warm-beige/50 pb-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (signupStep > 1) {
                      setSignupStep((s) => s - 1);
                    } else {
                      setMode('welcome');
                    }
                  }}
                  className="text-xs text-charcoal-light hover:text-charcoal flex items-center gap-1 transition-colors"
                >
                  {reverseArrow}
                  <span>{signupStep > 1 ? (language === 'ar' ? 'السابق' : 'Back') : (language === 'ar' ? 'إلغاء' : 'Cancel')}</span>
                </button>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${signupStep === 3 ? 'bg-accent-gold text-white' : 'bg-warm-bg text-charcoal-light/60'}`}>
                    {language === 'ar' ? '٣. النبذة والصورة' : '3. Photo & Bio'}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${signupStep === 2 ? 'bg-accent-gold text-white' : 'bg-warm-bg text-charcoal-light/60'}`}>
                    {language === 'ar' ? '٢. الهوية' : '2. Identity'}
                  </span>
                  <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${signupStep === 1 ? 'bg-accent-gold text-white' : 'bg-warm-bg text-charcoal-light/60'}`}>
                    {language === 'ar' ? '١. الحساب' : '1. Account'}
                  </span>
                </div>
              </div>

              {signupError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-1.5 leading-relaxed font-sans">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                
                {/* STEP 1: Account Credentials */}
                {signupStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">{t('emailLabel')}</label>
                      <div className="relative">
                        <input
                          type="email"
                          placeholder="pioneer@example.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                          className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans ltr focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                            language === 'ar' ? 'pl-3 pr-10 text-left' : 'pr-3 pl-10 text-left'
                          }`}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                          language === 'ar' ? 'right-3.5' : 'left-3.5'
                        }`}>
                          <Mail size={14} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">{t('signupPassLabel')}</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          placeholder={t('signupPassPlaceholder')}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                            language === 'ar' ? 'pl-10 pr-10 text-right' : 'pr-10 pl-10 text-left'
                          }`}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                          language === 'ar' ? 'right-3.5' : 'left-3.5'
                        }`}>
                          <Lock size={14} />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 hover:text-charcoal transition-colors p-1 ${
                            language === 'ar' ? 'left-3' : 'right-3'
                          }`}
                        >
                          {showSignupPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C2523] mb-1">{t('confirmPassLabel')}</label>
                      <div className="relative">
                        <input
                          type={showSignupPassword ? "text" : "password"}
                          placeholder={t('confirmPassPlaceholder')}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                            language === 'ar' ? 'pl-10 pr-10 text-right' : 'pr-10 pl-10 text-left'
                          }`}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                          language === 'ar' ? 'right-3.5' : 'left-3.5'
                        }`}>
                          <Lock size={14} />
                        </div>
                      </div>
                      {signupPassword && signupConfirmPassword && (
                        <div className="mt-1 text-[10px]">
                          {signupPassword === signupConfirmPassword ? (
                            <span className="text-emerald-600 font-bold">{t('passwordsMatch')}</span>
                          ) : (
                            <span className="text-rose-600 font-bold">{t('passwordsMismatch')}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Identity Profile */}
                {signupStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-[#2C2523] mb-1">{t('fullNameLabel')}</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('fullNamePlaceholder')}
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                          className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans text-right focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                            language === 'ar' ? 'pl-3 pr-10 text-right' : 'pr-3 pl-10 text-left'
                          }`}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                          language === 'ar' ? 'right-3.5' : 'left-3.5'
                        }`}>
                          <UserIcon size={14} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1 gap-2">
                        <div className="flex items-center gap-1 shrink-0">
                          {checkingUsername ? (
                            <span className="text-[10px] text-accent-gold flex items-center gap-1">
                              <Loader2 size={10} className="animate-spin" /> {t('usernameChecking')}
                            </span>
                          ) : usernameStatus === 'available' ? (
                            <span className="text-[10px] text-emerald-600 font-bold">{t('usernameAvailable')}</span>
                          ) : usernameStatus === 'taken' ? (
                            <span className="text-[10px] text-rose-600 font-bold">{t('usernameTaken')}</span>
                          ) : null}
                        </div>
                        <label className="block text-xs font-bold text-charcoal">{t('usernameLabel')}</label>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('usernamePlaceholder')}
                          value={signupUsername}
                          onChange={(e) => handleCheckUsername(e.target.value)}
                          required
                          className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans ltr focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                            language === 'ar' ? 'pl-3 pr-10 text-left' : 'pr-3 pl-10 text-left'
                          }`}
                        />
                        <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                          language === 'ar' ? 'right-3.5' : 'left-3.5'
                        }`}>
                          <UserIcon size={14} />
                        </div>
                      </div>
                      <p className="text-[10px] text-charcoal-light/60 mt-1">{t('usernameHint')}</p>
                    </div>
                  </div>
                )}

                {/* STEP 3: Bio & Profile Picture */}
                {signupStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1.5">{t('uploadPhotoLabel')}</label>
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handlePhotoDrop}
                        className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                          dragActive 
                            ? 'border-accent-gold bg-accent-gold/5' 
                            : 'border-warm-beige bg-[#FAF9F5] hover:border-accent-gold/40 hover:bg-white'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <div className="flex items-center justify-center gap-4">
                          <img
                            src={signupAvatar}
                            alt="avatar preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-accent-gold shrink-0"
                          />
                          <div className={alignTextClass}>
                            <p className="text-xs font-bold text-charcoal flex items-center gap-1 justify-start">
                              <UploadCloud size={13} className="text-accent-gold" />
                              <span>{t('dragDropPhoto')}</span>
                            </p>
                            <p className="text-[10px] text-charcoal-light/60 mt-0.5">{t('photoHint')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pre-configured avatars quick list */}
                    <div>
                      <label className="block text-[10px] font-bold text-charcoal-light mb-1.5">{t('avatarPickSubtitle')}</label>
                      <div className="flex gap-2.5 justify-center py-1">
                        {AVATAR_TEMPLATES.map((url, i) => {
                          const isSelected = signupAvatar === url && !customAvatarBase64;
                          return (
                            <button
                              type="button"
                              key={i}
                              onClick={() => {
                                setSignupAvatar(url);
                                setCustomAvatarBase64('');
                              }}
                              className={`relative rounded-full border-2 transition-transform cursor-pointer ${
                                isSelected ? 'border-accent-gold scale-110 shadow-sm' : 'border-transparent p-0.5 opacity-55 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt={`Option ${i}`} className="w-10 h-10 rounded-full object-cover" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-accent-gold/15 flex items-center justify-center rounded-full">
                                  <Check size={11} className="text-white font-bold" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Short Empathic Bio */}
                    <div>
                      <label className="block text-xs font-bold text-charcoal mb-1">{t('bioLabel')}</label>
                      <textarea
                        placeholder={t('bioPlaceholder')}
                        value={signupBio}
                        onChange={(e) => setSignupBio(e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-2 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all text-right resize-none font-sans ${forceDirClass}`}
                      />
                    </div>
                  </div>
                )}

                {/* Footer Buttons Step control */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="flex-1 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-101 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {signupLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-white" />
                        <span>{t('signingUp')}</span>
                      </>
                    ) : (
                      <span>{signupStep === 3 ? t('btnSaveAndLogin') : t('btnNextStep')}</span>
                    )}
                  </button>
                  {signupStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setSignupStep((s) => s - 1)}
                      className="px-5 py-2.5 bg-warm-beige text-charcoal text-xs font-semibold rounded-xl hover:bg-accent-gold/5 transition-colors cursor-pointer"
                    >
                      {t('btnPrev')}
                    </button>
                  )}
                </div>

              </form>

              <div className="pt-2 text-center text-xs text-charcoal-light">
                <span>{t('alreadyHaveAccount')} </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-accent-gold-dark font-bold hover:underline"
                >
                  {t('loginHere')}
                </button>
              </div>
            </div>
          )}

          {/* 4. Forgot Password View */}
          {mode === 'forgot' && (
            <div className={`space-y-4 ${alignTextClass}`}>
              <div className="flex items-center justify-between border-b border-warm-beige/50 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setRecoverySent(false);
                    setMode('login');
                  }}
                  className="text-xs text-charcoal-light hover:text-charcoal flex items-center gap-1 transition-colors"
                >
                  {reverseArrow}
                  <span>{t('backToLogin')}</span>
                </button>
                <h2 className="text-lg font-serif font-bold text-charcoal">{t('forgotHeader')}</h2>
              </div>

              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs flex items-center gap-1.5 leading-relaxed font-sans">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{forgotError}</span>
                </div>
              )}

              {recoverySent ? (
                <div className="p-6 bg-emerald-50/45 border border-emerald-100 rounded-2xl text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <Check className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-md text-[#2C2523]">{t('recoverySentTitle')}</h3>
                    <p className="text-xs text-charcoal-light/80 mt-1.5 leading-relaxed font-sans">
                      {t('recoverySentBody')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRecoverySent(false);
                      setMode('login');
                    }}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    {t('confirmRecoveryGoToLogin')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-charcoal-light/85 leading-relaxed font-sans">
                    {t('forgotInstructions')}
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">{t('emailLabel')}</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="faisal@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className={`w-full py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans text-left ltr focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold transition-all ${
                          language === 'ar' ? 'pl-3 pr-10 text-left' : 'pr-3 pl-10 text-left'
                        }`}
                      />
                      <div className={`absolute top-1/2 -translate-y-1/2 text-charcoal-light/45 ${
                        language === 'ar' ? 'right-3.5' : 'left-3.5'
                      }`}>
                        <Mail size={14} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-101 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-white" />
                        <span>{t('sendingRecoveryCode')}</span>
                      </>
                    ) : (
                      <span>{t('btnSendRecovery')}</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
