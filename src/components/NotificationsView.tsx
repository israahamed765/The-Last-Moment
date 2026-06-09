import React, { useState, useEffect } from 'react';
import { MemorialNotification } from '../types';
import { 
  Bell, Heart, MessageSquare, BookOpen, Gift, ArrowRight, 
  HeartHandshake, Check, CheckSquare, Flame, Share2, Copy, 
  Sparkles, X, Send, Award, Calendar, ExternalLink, ShieldCheck, MailCheck 
} from 'lucide-react';

interface NotificationsViewProps {
  language: 'en' | 'ar';
  onNavigateToCreate: () => void;
}

export default function NotificationsView({
  language,
  onNavigateToCreate
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<MemorialNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals & custom interactive states
  const [activeModal, setActiveModal] = useState<'view_tribute' | 'send_thanks' | 'invite' | 'ack' | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<MemorialNotification | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [thanksSent, setThanksSent] = useState(false);
  const [customReply, setCustomReply] = useState('');
  const [selectedGift, setSelectedGift] = useState<'candle' | 'flower' | 'incense'>('candle');
  
  // Custom interactive counts inside notification modals
  const [modalCandlesList, setModalCandlesList] = useState(14);
  const [modalCandleLit, setModalCandleLit] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [customComments, setCustomComments] = useState<string[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        showToast(language === 'ar' ? 'تم تحديد جميع الإشعارات كمقروءة.' : 'All notifications marked as read.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Improved action handler that opens custom active drawers on click
  const handleActionClick = async (notif: MemorialNotification, isExtra: boolean) => {
    // 1. Mark as read on server side
    if (!notif.read) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }

    // 2. Clear state variables
    setSelectedNotif(notif);
    setThanksSent(false);
    setCustomReply('');
    setCopiedKey(false);
    setNewCommentText('');
    setCustomComments([]);
    setModalCandleLit(false);

    // 3. Set counters to realistic values based on who the notification is about
    if (notif.id === 'n1') {
      setModalCandlesList(142);
    } else if (notif.id === 'n2') {
      setModalCandlesList(83);
    } else {
      setModalCandlesList(0);
    }

    // 4. Open UI Modal overlay
    if (!isExtra) {
      // Primary Action Click
      if (notif.id === 'n1' || notif.id === 'n2' || notif.id === 'n3') {
        setActiveModal('view_tribute');
      } else if (notif.id === 'n4') {
        setActiveModal('ack');
      }
    } else {
      // Secondary Action Click
      if (notif.id === 'n1' || notif.id === 'n2') {
        setActiveModal('send_thanks');
      } else if (notif.id === 'n3') {
        setActiveModal('invite');
      }
    }
  };

  // Sub-modal submissions
  const handleSendThanksConfirm = () => {
    setThanksSent(true);
    let successMsg = '';
    if (language === 'ar') {
      successMsg = `✨ تم ارسال الرد مع رمز السكينة البشري المعبر وباقة شكر طاهرة!`;
    } else {
      successMsg = `✨ Solace reply with token sent successfully!`;
    }
    showToast(successMsg);
    setTimeout(() => {
      setActiveModal(null);
    }, 1800);
  };

  const handleCopyInviteLink = () => {
    setCopiedKey(true);
    let successMsg = '';
    if (language === 'ar') {
      successMsg = `🔗 تم نسخ رابط المزار وصيغة الدعوة المخصصة لغرف الدردشة؛ جاهز للنشر.`;
    } else {
      successMsg = `🔗 Sanctuary invitation invitation copied to your device workspace.`;
    }
    showToast(successMsg);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const handleModalTributeAddComment = () => {
    if (!newCommentText.trim()) return;
    setCustomComments(prev => [...prev, newCommentText.trim()]);
    setNewCommentText('');
    showToast(language === 'ar' ? '🙏 تمت إضافة دعائك بنجاح للمزار المحمي.' : '🙏 Your prayer has been added successfully.');
  };

  const handleModalTributeToggleCandle = () => {
    if (modalCandleLit) {
      setModalCandlesList(prev => prev - 1);
      setModalCandleLit(false);
      showToast(language === 'ar' ? '🕯️ أطفأت شعلة الشمعة' : '🕯️ Extinguished candle ignite');
    } else {
      setModalCandlesList(prev => prev + 1);
      setModalCandleLit(true);
      showToast(language === 'ar' ? '🔥 قمت بإنارة شمعة مباركة' : '🔥 Lit a tribute candle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-serif text-stone-500">
          {language === 'ar' ? 'جاري تحميل التحديثات والأصداء...' : 'Loading reflections & updates...'}
        </p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative" id="reflections-updates-section">
      
      {/* Dynamic Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 shadow-xl flex items-center gap-3 z-50 animate-slide-in">
          <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full">
            <Check className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* Hero Section Header matching mockup perfectly */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-950 flex items-center gap-2">
            <span>{language === 'ar' ? 'أصداء وتحديثات' : 'Reflections & Updates'}</span>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-bold bg-[#84A59D] text-white px-2.5 py-1 rounded-full animate-pulse">
                {unreadCount} {language === 'ar' ? 'جديد' : 'new'}
              </span>
            )}
          </h2>
          <p className="text-sm text-stone-600 mt-1 font-sans">
            {language === 'ar' ? 'ابقَ على اتصال دائم وبأثر العائلات والقصص التي ترعاها.' : 'Stay connected with the legacies you cherish.'}
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition border ${
            unreadCount > 0
              ? 'bg-white hover:bg-stone-50 border-stone-200 text-slate-900 active:scale-95 shadow-xs cursor-pointer'
              : 'bg-stone-100 border-transparent text-stone-400 cursor-not-allowed'
          }`}
          id="btn-mark-all-read"
        >
          <CheckSquare className="w-4 h-4 text-inherit" />
          <span>{language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}</span>
        </button>
      </div>

      {/* Notifications List Stack */}
      <div className="space-y-4 mb-12">
        {notifications.length === 0 ? (
          <div className="bg-white border border-stone-100 rounded-3xl p-12 text-center text-stone-400 italic">
            {language === 'ar' ? 'محراب الطمأنينة فارغ ومستقر حالياً.' : 'Your sanctuary reflects absolute peace and calm right now.'}
          </div>
        ) : (
          notifications.map((notif) => {
            // Determine icon and color mapping
            let iconElement = <Heart className="w-5 h-5" />;
            let iconBg = 'bg-stone-100 text-stone-700';
            
            if (notif.type === 'candle') {
              iconElement = <Heart className="w-5 h-5 fill-emerald-100" />;
              iconBg = 'bg-[#EBF7F2] text-[#2C6E49] border border-[#2C6E49]/15';
            } else if (notif.type === 'comment') {
              iconElement = <MessageSquare className="w-5 h-5" />;
              iconBg = 'bg-purple-50 text-purple-700 border border-purple-100';
            } else if (notif.type === 'publish') {
              iconElement = <BookOpen className="w-5 h-5" />;
              iconBg = 'bg-[#A8D3E6]/20 text-slate-800 border border-[#A8D3E6]/30';
            } else if (notif.type === 'donation') {
              iconElement = <HeartHandshake className="w-5 h-5" />;
              iconBg = 'bg-amber-50 text-amber-700 border border-amber-100';
            }

            const title = language === 'ar' ? notif.titleAr : notif.titleEn;
            const description = language === 'ar' ? notif.descriptionAr : notif.descriptionEn;
            const timeAgo = language === 'ar' ? notif.timeAr : notif.timeEn;

            return (
              <div
                key={notif.id}
                className={`bg-white border transition duration-300 rounded-2xl p-5 md:p-6 flex items-start gap-4 hover:shadow-md relative ${
                  notif.read ? 'border-stone-100' : 'border-primary/20 shadow-xs ring-1 ring-primary/5'
                }`}
                id={`notif-card-${notif.id}`}
              >
                {/* Unread dot indicator */}
                {!notif.read && (
                  <span className="absolute top-5 right-5 flex h-2 w-2 rounded-full bg-violet-600 animate-pulse"></span>
                )}

                {/* Avatar Icon Box */}
                <div className={`p-3 rounded-full flex-shrink-0 flex items-center justify-center ${iconBg}`}>
                  {iconElement}
                </div>

                {/* Body Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-serif font-bold text-slate-950 text-sm md:text-base leading-snug">
                      {title}
                    </h4>
                    <span className="text-[10px] md:text-xs text-stone-400 font-mono whitespace-nowrap self-start sm:self-center">
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-stone-600 font-sans leading-relaxed">
                    {description}
                  </p>

                  {/* Fully functional action buttons replacing trigger static toast */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => handleActionClick(notif, false)}
                      className="text-xs font-semibold text-[#84A59D] hover:text-[#5E7F77] cursor-pointer transition underline decoration-dotted underline-offset-4"
                      id={`btn-action-primary-${notif.id}`}
                    >
                      {language === 'ar' ? notif.actionLabelAr : notif.actionLabelEn}
                    </button>

                    {notif.extraActionLabelEn && (
                      <>
                        <span className="text-stone-300 text-xs">|</span>
                        <button
                          onClick={() => handleActionClick(notif, true)}
                          className="text-xs font-medium text-stone-500 hover:text-slate-800 cursor-pointer transition"
                          id={`btn-action-secondary-${notif.id}`}
                        >
                          {language === 'ar' ? notif.extraActionLabelAr : notif.extraActionLabelEn}
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* INTERACTIVE MODALS PORTAL COVERS ALL SEPARATE USECASES IN REMEMBRANCE */}
      
      {/* 1. Modal: View Tribute / View published page Detail */}
      {activeModal === 'view_tribute' && selectedNotif && (() => {
        // Find who the name relates to based on ID
        let personName = language === 'ar' ? 'كلارا ميلر' : 'Clara Miller';
        let lifespan = '1935 - 2023';
        let backgroundClass = 'from-emerald-950 via-slate-900 to-black';
        let isLilyTheme = true;
        let lastWords = language === 'ar' 
          ? 'عشت كالنور الهادئ الذي أضاء دروب الآخرين، وسأرحل وقلبي عامر بحبكم وعطائكم الأبدي.'
          : 'I lived as a quiet beacon that warmed other souls, and I departures with my core overflowing with your endless grace.';

        if (selectedNotif.id === 'n2') {
          personName = language === 'ar' ? 'آرثر ستيرلينغ' : 'Arthur Sterling';
          lifespan = '1940 - 2024';
          backgroundClass = 'from-slate-950 via-blue-950 to-[#0c0f1d]';
          isLilyTheme = false;
          lastWords = language === 'ar'
            ? 'لا تبكوا عند قبري، فأنا لست هناك، بل أنا شمس الأمل التي تشرق لتصنع مستقبلاً أفضل لقلوبكم.'
            : 'Do not stand at my grave and weep, I am not there; I am the warm hope that dawns to guide your steps.';
        } else if (selectedNotif.id === 'n3') {
          personName = language === 'ar' ? 'إلياس ثورن' : 'Elias Thorne';
          lifespan = '1962 - 2024';
          backgroundClass = 'from-amber-950 via-[#1f1915] to-black';
          isLilyTheme = false;
          lastWords = language === 'ar'
            ? 'في هدوء الغابة وسكينة الأشجار، أستريح الآن بسلام طاهر. تذكروني دائماً ببسمتكم ونقائكم.'
            : 'In the stillness of the meadows, I rest in immaculate peace. Remember me with your kindest smiles.';
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none animate-fade-in">
            <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              {/* Header Box Graphic with custom atmosphere */}
              <div className={`relative px-6 py-10 bg-gradient-to-br ${backgroundClass} text-white text-center`}>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition active:scale-95"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <span className="inline-block bg-white/10 backdrop-blur-xs text-[10px] font-mono tracking-widest text-[#D3E0EA] px-3 py-1 rounded-full uppercase mb-3">
                  {language === 'ar' ? 'أثر مبارك مخلد' : 'Eternal Sanctuary Page'}
                </span>

                <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-50 tracking-wide drop-shadow-sm">
                  {personName}
                </h3>

                <p className="text-xs text-stone-300 font-mono tracking-widest mt-1.5">
                  {lifespan}
                </p>

                {/* Sparkling symbol centered */}
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white text-emerald-800 border-2 border-[#84A59D] rounded-full p-3.5 shadow-md flex items-center justify-center">
                  {isLilyTheme ? '🌿' : '✨'}
                </div>
              </div>

              {/* Scrollable content body */}
              <div className="flex-1 overflow-y-auto px-6 pt-10 pb-6 space-y-6">
                
                {/* Last words Quote */}
                <div className="bg-stone-50 border-l-4 border-primary p-4 rounded-xl italic font-serif text-sm text-stone-700 leading-relaxed text-center">
                  "{lastWords}"
                </div>

                {/* Sub-interactive zone: Statistics and fast candle lighter */}
                <div className="bg-white border border-stone-100 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block">
                      {language === 'ar' ? 'الشموع الموقدة' : 'Active Candles'}
                    </span>
                    <span className="text-lg font-serif font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Flame className={`w-5 h-5 ${modalCandleLit ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-stone-400'}`} />
                      <span>{modalCandlesList}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleModalTributeToggleCandle}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer select-none active:scale-95 ${
                      modalCandleLit 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-xs'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{modalCandleLit ? (language === 'ar' ? 'تم التوقيد' : 'Candle Lit!') : (language === 'ar' ? 'أنر شمعة' : 'Light Candle')}</span>
                  </button>
                </div>

                {/* Say a prayer right here */}
                <div className="space-y-3.5">
                  <h4 className="font-serif font-bold text-sm text-slate-900 border-b border-stone-100 pb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#84A59D]" />
                    <span>{language === 'ar' ? 'كتابة مواساتك ودعائك في الأرشيف' : 'Add to Remembrance Wall'}</span>
                  </h4>

                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder={language === 'ar' ? 'أدخل دعاء مبارك أو كلمة رثاء طيبة...' : 'Write a loving prayer or message of legacy...'}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                    <button
                      onClick={handleModalTributeAddComment}
                      className="bg-[#2C6E49] hover:bg-[#1E4D32] text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{language === 'ar' ? 'إرسال' : 'Post'}</span>
                    </button>
                  </div>

                  {/* Render newly submitted feedback if any */}
                  {customComments.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {customComments.map((com, idx) => (
                        <div key={idx} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5 animate-slide-in">
                          <span className="text-base select-none mt-0.5">🕊️</span>
                          <div className="text-left">
                            <h5 className="text-[10px] font-mono text-[#2C6E49] font-bold">
                              {language === 'ar' ? 'محب مستذكر (أنت)' : 'Peace seeker (You)'}
                            </h5>
                            <p className="text-xs text-stone-700 mt-0.5 leading-relaxed font-sans">{com}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Default sample commentary inside wall */}
                  <div className="space-y-2 mt-2">
                    <div className="bg-stone-50 border border-stone-100 rounded-xl p-3 flex items-start gap-2.5">
                      <span className="text-sm select-none mt-0.5">🤲</span>
                      <div className="text-left font-sans">
                        <h5 className="text-[10px] font-mono text-stone-400 font-bold">Sarah Vance</h5>
                        <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                          {language === 'ar' ? 'رحم الله ذلك الوجه الباسم والأثر الطاهر الجميل.' : 'May beautiful light shine upon this wonderful soul forever.'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom bar */}
              <div className="border-t border-stone-100 px-6 py-4 bg-stone-50 md:flex md:items-center md:justify-between">
                <span className="text-[10px] text-stone-400 font-mono italic block mb-2 md:mb-0">
                  {language === 'ar' ? '🔒 مزار ذو خصوصية مشفرة بالكامل في الأثر' : '🔒 Secure immortal preservation sanctuary'}
                </span>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition active:scale-95 select-none"
                >
                  {language === 'ar' ? 'إغلاق المزار' : 'Close Sanctuary View'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 2. Modal: Send Thanks / Reply */}
      {activeModal === 'send_thanks' && selectedNotif && (() => {
        const isClaraRef = selectedNotif.id === 'n1';
        let defaultRepAr = isClaraRef 
          ? 'نشكركم من عميق قلوبنا لإنارتكم شمعة السكينة في مزار كلارا ميلر. دعاؤكم يواسينا كثيراً.'
          : 'ممتنون جداً لمشاعركم الطيبة وكلماتكم العطرة بحق آرثر الغالي، شكر الله سعيكم ودعاءكم.';
        let defaultRepEn = isClaraRef
          ? "We thank you from the bottom of our hearts for lighting a solace candle on Clara Miller's portal. Your gesture means the world to our family."
          : "We are incredibly grateful for your warm memory and sincere kind words about Arthur. Thank you for keeping his dream alive.";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none animate-fade-in">
            <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-stone-150 bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#EBF7F2] text-[#2C6E49] p-1.5 rounded-full">
                    <MailCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-950 text-base">
                    {language === 'ar' ? 'إرسال بطاقة شكر وعزاء' : 'Send Legacy Gratitude Card'}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-stone-400 hover:text-slate-700 p-1 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                
                {/* Visual feedback of who gets the thanks card */}
                <div className="bg-[#FAF8F5] border border-stone-200/50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg select-none">
                    🕊️
                  </div>
                  <div className="text-left font-sans">
                    <span className="text-[9px] uppercase font-mono text-stone-400 block tracking-wider">
                      {language === 'ar' ? 'المرسل إليه:' : 'Gratitude Card recipient:'}
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">
                      {isClaraRef ? (language === 'ar' ? 'زائر المزار المجهول' : 'Silent Sanctuary Visitor') : (language === 'ar' ? 'محب مستذكر للفقيد' : 'Arthur Sterling Legacy Contributor')}
                    </h5>
                  </div>
                </div>

                {/* Response suggestions */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block tracking-wider text-left">
                    {language === 'ar' ? 'اختر قالب الرد:' : 'Choose Response suggestions:'}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      onClick={() => setCustomReply(defaultRepAr)}
                      className="text-left px-3 py-2 text-xs rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/40 text-stone-700 truncate"
                    >
                      🇸🇦 {defaultRepAr}
                    </button>
                    <button
                      onClick={() => setCustomReply(defaultRepEn)}
                      className="text-left px-3 py-2 text-xs rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/40 text-stone-700 truncate"
                    >
                      🇬🇧 {defaultRepEn}
                    </button>
                  </div>
                </div>

                {/* Edit Message container */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block tracking-wider text-left">
                    {language === 'ar' ? 'تعديل أو صياغة كلمتك الخاصة:' : 'Customize Your Message:'}
                  </span>
                  <textarea
                    value={customReply || (language === 'ar' ? defaultRepAr : defaultRepEn)}
                    onChange={(e) => setCustomReply(e.target.value)}
                    rows={3}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-3 text-stone-700 outline-none focus:ring-1 focus:ring-[#84A59D] font-sans leading-relaxed"
                  />
                </div>

                {/* Select symbolic serene flower token to append */}
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block tracking-wider text-left">
                    {language === 'ar' ? 'أرفق رمز طمأنينة تعبيري:' : 'Attach a Pure Token Gift:'}
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedGift('candle')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedGift === 'candle' 
                          ? 'border-[#84A59D] bg-[#EBF7F2] text-slate-800' 
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-lg">🕯️</span>
                      <span className="text-[9px] font-mono font-bold">{language === 'ar' ? 'شعلة مواساة' : 'Solace Spark'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedGift('flower')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedGift === 'flower' 
                          ? 'border-[#84A59D] bg-[#EBF7F2] text-slate-800' 
                          : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-lg">🪻</span>
                      <span className="text-[9px] font-mono font-bold">{language === 'ar' ? 'لافندر نقي' : 'Pure Lavender'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedGift('incense')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedGift === 'incense' 
                          ? 'border-[#84A59D] bg-[#EBF7F2] text-slate-800' 
                          : 'border-[#FAF8F5] hover:bg-stone-50 text-stone-600'
                      }`}
                    >
                      <span className="text-lg">🌿</span>
                      <span className="text-[9px] font-mono font-bold">{language === 'ar' ? 'أغصان زيتون' : 'Olive Branch'}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Footer with success transitions */}
              <div className="px-6 py-4 border-t border-stone-100 bg-[#FAF8F5] flex justify-end gap-2.5">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-slate-800 transition rounded-xl"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  onClick={handleSendThanksConfirm}
                  disabled={thanksSent}
                  className="bg-[#2C6E49] hover:bg-[#1E4D32] text-white px-5 py-2 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                >
                  {thanksSent ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تم الإرسال...' : 'Sent...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'إرسال الرد العطر' : 'Dispatch Gratitude'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. Modal: Invite Others */}
      {activeModal === 'invite' && selectedNotif && (() => {
        const inviteAr = `ندعوكم للمشاركة بالصلاة، القراءة، وإشعال شمعة طيبة مخلدة لذكرى فقيدنا الغالي "إلياس ثورن" (Elias Thorne) من خلال الرابط الآمن لمزار العائلة الموحد في الأثر الرقمي للأبناء والأصدقاء:\nhttps://sanctuary-archive.org/tribute/elias-thorne`;
        const inviteEn = `You are cordially invited to light a virtual candle, post a private memory, and find solace inside the digital sainted sanctuary established for our dear "Elias Thorne" (1962 - 2024). Join our legacy registry here:\nhttps://sanctuary-archive.org/tribute/elias-thorne`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none animate-fade-in">
            <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              
              <div className="px-6 py-5 border-b border-stone-150 bg-[#FAF8F5] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-[#A8D3E6]/20 text-slate-800 p-1.5 rounded-full">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-950 text-base">
                    {language === 'ar' ? 'دعوة شبكة الأصدقاء والعائلة' : 'Invite Circles & Companions'}
                  </h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="text-stone-400 hover:text-slate-700 p-1 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-left font-sans">
                
                <p className="text-stone-600 text-xs leading-relaxed">
                  {language === 'ar' 
                    ? 'شارك هذا الرابط المميز وصيغة الدعوة الصادقة لتدعو العائلة، رفقاء العمل، والمحبين لتوقير ذكرى إلياس وإضاءة شموع السلام على جدار تعزيته الموصد.'
                    : 'Disseminate this unique invite template across your secure circles to invite relatives, lifetime colleagues, and friends to post prayers & memorials to Elias Thorne.'}
                </p>

                {/* Invite Ar Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    <span>🇸🇦 {language === 'ar' ? 'صيغة الدعوة العربية:' : 'Arabic format draft:'}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(inviteAr);
                        handleCopyInviteLink();
                      }}
                      className="text-primary hover:underline flex items-center gap-1 text-[9px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-stone-50 border border-stone-150 p-3 rounded-xl text-xs text-stone-600 max-h-24 overflow-y-auto leading-relaxed select-all">
                    {inviteAr}
                  </div>
                </div>

                {/* Invite En Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-stone-400">
                    <span>🇬🇧 {language === 'ar' ? 'صيغة الدعوة الإنجليزية:' : 'English format draft:'}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(inviteEn);
                        handleCopyInviteLink();
                      }}
                      className="text-primary hover:underline flex items-center gap-1 text-[9px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-stone-50 border border-stone-150 p-3 rounded-xl text-xs text-stone-600 max-h-24 overflow-y-auto leading-relaxed select-all">
                    {inviteEn}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-stone-100 bg-[#FAF8F5] flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(language === 'ar' ? inviteAr : inviteEn);
                    handleCopyInviteLink();
                  }}
                  className="bg-[#2C6E49] hover:bg-[#1E4D32] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-2 shadow-xs"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تم نسخ الرابط!' : 'Copied successfully!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'نسخ الرابط الموحد' : 'Copy Invitation Draft'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 4. Modal: Acknowledgment Certificate */}
      {activeModal === 'ack' && selectedNotif && (() => {
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs select-none animate-fade-in">
            <div className="relative w-full max-w-lg bg-emerald-950 text-stone-100 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-8 md:p-10 select-none text-center">
              
              {/* Golden Leaf corners borders simulation */}
              <div className="absolute inset-4 border border-amber-400/20 rounded-2xl pointer-events-none"></div>
              <div className="absolute inset-5 border-2 border-amber-400/40 rounded-xl pointer-events-none opacity-40"></div>

              {/* Close badge */}
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 text-stone-400 hover:text-white transition p-1 rounded-full z-20"
                title="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Symbol */}
              <div className="mx-auto mb-5 bg-amber-400/10 border border-amber-400/50 p-4 rounded-full w-14 h-14 flex items-center justify-center text-amber-400">
                <Award className="w-8 h-8 filter drop-shadow-sm animate-pulse" />
              </div>

              <span className="font-serif tracking-widest text-[10px] uppercase font-bold text-amber-400 mb-2">
                {language === 'ar' ? 'مؤسسة الغابات الخالدة للصدقة الجارية' : 'Eternal Woods Sanctuary Foundation'}
              </span>

              <h3 className="text-2xl md:text-3xl font-serif font-bold text-amber-50 leading-tight">
                {language === 'ar' ? 'شهادة شكر وصدقة جارية' : 'Legate Solace Certificate'}
              </h3>

              <div className="w-24 h-[1px] bg-amber-400/30 mx-auto my-6"></div>

              {/* Citation */}
              <div className="space-y-4 max-w-md mx-auto font-serif italic text-stone-200/90 text-sm md:text-base leading-relaxed p-2">
                
                <p>
                  {language === 'ar' 
                    ? 'بكل إجلال واحترام، تشهد إدارة الأثر ومؤسسة الغابات الخالدة باستلام وتوثيق مساهمة صدقة جارية مباركة تخليداً للأثر الأبدي المعطر للفقيدة الغالية:'
                    : 'With deep reverence and gratitude, we certify the generous and sainted contribution planted to blossom into dynamic eternal woodlands in loving memory of:'}
                </p>

                <p className="text-xl font-bold font-serif text-amber-300 not-italic tracking-wide mt-2">
                  {language === 'ar' ? 'سارة فانس (Sarah Vance)' : 'Sarah Vance'}
                </p>

                <p className="not-italic text-[11px] sm:text-xs text-stone-400 font-sans tracking-wide mt-3">
                  {language === 'ar' 
                    ? 'سيتم رعاية شتلة وارفة معمرة في ركن السكينة الخضراء وتحمل اسم الأثر الخاص بها لينتشر نقاؤها للأبد.'
                    : 'A devoted cypress legacy sapling has been planted within the quiet garden slopes carrying her eternal name.'}
                </p>

              </div>

              {/* Crest Signet */}
              <div className="mt-8 flex items-center justify-center gap-2 relative">
                <div className="w-8 h-[1px] bg-stone-500/30"></div>
                <div className="flex items-center gap-1 bg-[#1a382c] border border-stone-700 px-3 py-1 rounded-full text-[9px] font-mono text-stone-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'سجل الأرشيف المبارك' : 'Verified Archives Council'}</span>
                </div>
                <div className="w-8 h-[1px] bg-stone-500/30"></div>
              </div>

              {/* Action button */}
              <button 
                onClick={() => {
                  showToast(language === 'ar' ? '💾 تم ترحيل شهادة الوقفية بسلام لمعرض الأيقونات الخاص بك.' : '💾 Digital legacy document saved.');
                  setActiveModal(null);
                }}
                className="mt-8 bg-amber-500 hover:bg-amber-600 text-[#1a382c] font-bold text-xs py-3 px-8 rounded-full transition active:scale-95 shadow-md self-center"
              >
                {language === 'ar' ? 'تحميل وحفظ الشهادة' : 'Download Legacy Token'}
              </button>

            </div>
          </div>
        );
      })()}

      {/* Main notifications listing continue below */}
      {/* Preserve a New Memory promo card exactly matching the bottom section */}
      <div className="bg-[#FAF8F5] border border-stone-200/60 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:border-stone-200 transition duration-300">
        <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-stone-100 rounded-2xl overflow-hidden shadow-inner border border-stone-200/40 relative">
          <img
            src="https://images.unsplash.com/photo-1542044896530-05d85be9b11a?auto=format&fit=crop&w=300&q=80"
            alt="Preserve a candle"
            className="w-full h-full object-cover grayscale contrast-110"
            referrerPolicy="no-referrer"
          />
          {/* Subtle flare overlay */}
          <div className="absolute inset-0 bg-primary/5 mix-blend-color"></div>
        </div>

        <div className="flex-1 text-center md:text-start space-y-3">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-950">
            {language === 'ar' ? 'حفظ ذكرى جديدة في الأثر' : 'Preserve a new memory'}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 font-sans leading-relaxed max-w-xl">
            {language === 'ar'
              ? 'مشاركة قصة دافئة، أو صورة معبرة، أو حكاية عفوية تساعد العائلة على الوقوف مجدداً في طمأنينة ورباطة جأش خلال أوقات التأمل في الفقد.'
              : 'Sharing a story or a photo can help others find comfort during their time of reflection.'}
          </p>
          <button
            onClick={onNavigateToCreate}
            className="mt-2 inline-flex items-center gap-2 bg-[#2C6E49] hover:bg-[#1E4D32] text-white text-xs font-bold px-6 py-3 rounded-full transition active:scale-95 shadow-sm cursor-pointer"
            id="btn-promo-create"
          >
            <span>{language === 'ar' ? 'تبادل وإنشاء مزار' : 'Create Memorial'}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

    </div>
  );
}
