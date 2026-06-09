import React, { useState } from 'react';
import { translations } from '../i18n';
import { Heart, User, Mail, Lock, Check, Sparkles, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthScreensProps {
  language: 'en' | 'ar';
  onLoginSuccess: (email: string, name: string, bio: string, stats: any, avatar?: string) => void;
  onSetLanguage: (lang: 'en' | 'ar') => void;
}

export default function AuthScreens({ language, onLoginSuccess, onSetLanguage }: AuthScreensProps) {
  // Screen views: 'signup' | 'signin' | 'recover'
  const [view, setView] = useState<'signup' | 'signin' | 'recover'>('signup');
  const t = translations[language];

  // Forms inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status indicators
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg(language === 'ar' ? 'يرجى ملء كافة الحقول.' : 'Please fill all required inputs.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمات المرور غير متطابقة.' : 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const bio = language === 'ar'
        ? 'حارس للشموع والمحبة، أصون اللحظات الأخيرة للراحلين وأحفظ ذكراهم العطرة.'
        : 'Guardian of digital light, preserves original memories.';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, bio }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Registration failed');
      }

      const userData = await response.json();
      setSuccessMsg(language === 'ar' ? 'تم إنشاء مزارك بنجاح! جاري تسجيل دخولك...' : 'Created successfully! Entering...');
      
      // Auto-login upon registration success
      setTimeout(() => {
        onLoginSuccess(userData.email, userData.name, userData.bio, userData.stats, userData.avatar);
      }, 1500);

    } catch (err: any) {
      setErrorMsg(
        language === 'ar' 
          ? `حدث خطأ أثناء التسجيل: ${err.message}` 
          : `Registration Error: ${err.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال الحساب والرمز السري.' : 'Please input email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Authentication rejected');
      }

      const userData = await response.json();
      setSuccessMsg(language === 'ar' ? 'تم التحقق من بياناتك! مرحباً بك ثانية.' : 'Verified! Welcome back to sanctuary.');
      
      setTimeout(() => {
        onLoginSuccess(userData.email, userData.name, userData.bio, userData.stats, userData.avatar);
      }, 1200);

    } catch (err: any) {
      setErrorMsg(
        language === 'ar' 
          ? 'خطأ: البريد الإلكتروني أو رمز المرور الذي أدخلته غير صحيح.' 
          : `Error: The credentials you provided are invalid.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال حساب بريدك الإلكتروني.' : 'Email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Could not request link reset');
      }

      setSuccessMsg(
        language === 'ar' 
          ? 'تم إرسال رابط استعادة الاتصال إلى بريدك الإلكتروني بنجاح.' 
          : 'Recovery reference link was dispatched safely.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Sign-in quick assist
  const handleQuickDemoAccess = () => {
    onLoginSuccess(
      'tsraathmd@gmail.com',
      language === 'ar' ? 'أحمد حارس الذاكرة' : 'Ahmed Memory Keeper',
      language === 'ar' ? 'حارس موثق للشموع وفاء للراحلين.' : 'Verified guardian lit with persistent light.',
      { memorialsCreated: 2, candlesLit: 15, prayersContributed: 8 }
    );
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col justify-between text-slate-800"
         style={{
           backgroundImage: 'linear-gradient(rgba(254, 249, 239, 0.55), rgba(214, 226, 219, 0.65)), url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}
    >
      {/* Top utility action bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-1">
          <Heart className="w-5 h-5 text-primary fill-primary/30" />
          <span className="font-serif font-bold text-slate-900 tracking-tight text-sm">
            The Last Moment
          </span>
        </div>

        {/* Dynamic English / Arabic Toggle */}
        <button
          onClick={() => onSetLanguage(language === 'ar' ? 'en' : 'ar')}
          className="text-xs font-mono font-bold tracking-wider px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/50 hover:bg-white text-stone-700 transition"
        >
          {language === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}
        </button>
      </div>

      {/* Main Authentication container */}
      <div className="flex-1 flex items-center justify-center p-4 z-10 my-4">
        {view === 'signup' && (
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in relative transition-all">
            <div className="text-center space-y-1">
              <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold tracking-tight">
                {language === 'ar' ? 'منصة اللحظة الأخيرة' : 'The Last Moment'}
              </h1>
              <p className="text-sm text-[#356668] font-sans font-medium">
                {language === 'ar' ? 'انضم إلى ملاذ الذكرى الطاهرة' : 'Join the Sanctuary'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200/40 font-mono flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200/40 font-mono flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                  {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'إلياس ثورن' : 'Elias Thorne'}
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="legacy@sanctuary.com"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                  {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Join / Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/95 shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                {isSubmitting 
                  ? (language === 'ar' ? 'جاري تهيئة مزارك...' : 'Preparing Sanctuary...') 
                  : (language === 'ar' ? 'إنشاء مزار النصب التذكاري الخاص بي' : 'Create My Memorial')}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono uppercase tracking-widest text-stone-400">{language === 'ar' ? 'أو' : 'OR'}</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            {/* Quick Demo and Google signup mimics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleQuickDemoAccess}
                className="py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/50 font-bold text-[11px] hover:bg-indigo-50 text-indigo-700 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'دخول بحساب تجريبي' : 'Developer Access'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoAccess}
                className="py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-slate-700 text-[11px] font-medium transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="font-bold text-red-500 font-mono">G</span>
                <span>{language === 'ar' ? 'تسجيل عبر جوجل' : 'Join with Google'}</span>
              </button>
            </div>

            <p className="text-center text-xs text-stone-600">
              {language === 'ar' ? 'لديك مساحة بالفعل؟ ' : 'Already have a space? '}
              <button
                onClick={() => { clearForm(); setView('signin'); }}
                className="text-[#356668] font-bold hover:underline"
              >
                {language === 'ar' ? 'تم تسجيل الدخول' : 'Sign In'}
              </button>
            </p>

            <span className="block text-center text-[9px] text-stone-500 leading-normal pt-1 font-light">
              {language === 'ar' 
                ? 'بانضمامك، فإنك توافق على شروط النعمة العام وسياسة الخصوصية الخاصة بنا. نحن نصون بياناتك مثل إرثك تماماً.'
                : 'By joining, you agree to our Terms of Grace and Privacy Policy. We honor your data as much as your legacy.'}
            </span>
          </div>
        )}

        {view === 'signin' && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-fade-in relative transition-all">
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-serif text-slate-900 font-bold tracking-tight">
                The Last Moment
              </h1>
              <p className="text-xs text-stone-500 font-mono tracking-wide">
                {language === 'ar' ? 'محراب للذكرى الطاهرة والخلود' : 'A sanctuary for eternal remembrance'}
              </p>
            </div>

            <div className="border border-stone-200/50 bg-[#FAF8F5] rounded-2xl p-4 space-y-1">
              <h3 className="font-serif font-bold text-slate-950 text-md">
                {language === 'ar' ? 'أهلاً بك مجدداً' : 'Welcome Back'}
              </h3>
              <p className="text-stone-600 text-[11.5px]">
                {language === 'ar' ? 'سجل الدخول إلى مساحة محرابك المعتمد' : 'Sign in to your sanctuary workspace'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200/40 font-mono flex items-start gap-2 animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200/40 font-mono flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                  {language === 'ar' ? 'حساب البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-stone-500 block">
                    {language === 'ar' ? 'رمز السري' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => { clearForm(); setView('recover'); }}
                    className="text-[#356668] text-[10px] hover:underline"
                  >
                    {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/95 shadow-md active:scale-[0.98] transition cursor-pointer"
              >
                {isSubmitting 
                  ? (language === 'ar' ? 'جاري التحقق...' : 'Signing In...') 
                  : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
              </button>
            </form>

            <p className="text-center text-xs text-stone-600">
              {language === 'ar' ? 'جديد في المحراب الهادئ؟ ' : 'New to the sanctuary? '}
              <button
                type="button"
                onClick={() => { clearForm(); setView('signup'); }}
                className="text-[#356668] font-bold hover:underline"
              >
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
              </button>
            </p>

            <button
              onClick={handleQuickDemoAccess}
              className="w-full py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/20 text-indigo-700 font-bold text-[11px] hover:bg-indigo-50 transition text-center cursor-pointer flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تسجيل دخول سريع كمطور' : 'Bypass with Dev Access'}</span>
            </button>
          </div>
        )}

        {view === 'recover' && (
          <div className="bg-white/95 backdrop-blur-xl border border-white/60 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in relative transition-all">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#356668] font-bold">
                {language === 'ar' ? 'استعادة كلمة المرور' : 'Password Recovery'}
              </span>
              <button
                onClick={() => { clearForm(); setView('signin'); }}
                className="text-stone-500 hover:text-slate-900 text-xs font-semibold flex items-center gap-1"
              >
                {language === 'ar' ? '← العودة للدخول' : 'Back to Login'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-950">
                {language === 'ar' ? 'استعادة الاتصال الروحي' : 'Restore Your Connection'}
              </h2>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                {language === 'ar' 
                  ? 'سنرسل لك رابطاً مشفراً لإعادة تعيين كلمة المرور والعودة بأمان لمساحتك المقدسة.' 
                  : 'We will send you a link to reset your password and return to your sanctuary.'}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200/40 font-mono">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200/40 font-mono">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider text-stone-500 block mb-1">
                  {language === 'ar' ? 'حساب البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sanctuary@legacy.com"
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:border-stone-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/95 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition cursor-pointer"
              >
                <span>{language === 'ar' ? 'إرسال رابط الاسترداد' : 'Send Recovery Link'}</span>
                {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center text-xs text-stone-500">
              {language === 'ar' ? 'هل تحتاج لمساعدة أخرى؟ ' : 'Need more help? '}
              <a href="#" className="text-stone-850 font-bold hover:underline">
                {language === 'ar' ? 'تواصل مع الدعم الفني للمحراب' : 'Contact Sanctuary Support'}
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Modern responsive simple footer */}
      <footer className="w-full py-6 bg-white/40 backdrop-blur-md border-t border-stone-200/40 text-center space-y-1.5 z-20">
        <p className="font-serif text-xs font-medium text-stone-800">
          منصة اللحظة الأخيرة • The Last Moment
        </p>
        <p className="text-[9px] text-stone-500 font-mono max-w-md mx-auto px-4">
          {language === 'ar' 
            ? '© ٢٠٢٦ منصة اللحظة الأخيرة. محراب رقمي هادئ لحفظ شواهد وعبر الراحلين.' 
            : '© 2026 The Last Moment. A sanctuary for eternal remembrance and beautiful family legacies.'}
        </p>
      </footer>
    </div>
  );
}
