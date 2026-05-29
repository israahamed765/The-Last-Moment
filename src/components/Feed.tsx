import React, { useState } from 'react';
import { Post, Comment, ReactionType, User, Order } from '../types';
import { PostCard } from './PostCard';
import { Search, PenTool, Sparkles, Filter, X, Heart, AlertCircle, Compass, HelpCircle, Lock, Package, Clock, CreditCard, Shield, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FeedProps {
  posts: Post[];
  comments: Comment[];
  currentUser: User | null;
  orders: Order[];
  onReact: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, content: string) => void;
  onOpenCreatePost: () => void;
  onAuthorClick: (userId: string) => void;
  onOpenOrderModal: (post: Post) => void;
  onUpgradePremium: (userId: string, activate: boolean) => Promise<void>;
}

const POPULAR_TAGS = ["وداع", "الأم", "حلم", "غصة", "سفر", "الوطن", "تسامح", "ضحكة"];

export function Feed({
  posts,
  comments,
  currentUser,
  orders,
  onReact,
  onAddComment,
  onOpenCreatePost,
  onAuthorClick,
  onOpenOrderModal,
  onUpgradePremium,
}: FeedProps) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = ['الكل', 'أشخاص', 'أماكن', 'رسائل', 'ذكريات'];

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'الكل': return language === 'ar' ? 'الكل' : 'All';
      case 'أشخاص': return language === 'ar' ? 'أشخاص' : 'People';
      case 'أماكن': return language === 'ar' ? 'أماكن' : 'Places';
      case 'رسائل': return language === 'ar' ? 'رسائل' : 'Letters';
      case 'ذكريات': return language === 'ar' ? 'ذكريات' : 'Memories';
      default: return cat;
    }
  };

  const getTagLabel = (tag: string) => {
    if (language === 'ar') return tag;
    const EngTags: Record<string, string> = {
      "وداع": "Farewell",
      "الأم": "Mother",
      "حلم": "Dream",
      "غصة": "Heartache",
      "سفر": "Travel",
      "الوطن": "Homeland",
      "تسامح": "Forgiveness",
      "ضحكة": "Laughter"
    };
    return EngTags[tag] || tag;
  };

  // Filter posts based on Category, Search Query, and Popular Tags
  const filteredPosts = posts.filter((post) => {
    // 0. Privacy Filter: Only show private vault posts to their respective authors
    if (post.isPrivate && post.userId !== currentUser?.id) {
      return false;
    }

    // 1. Category Filter
    if (selectedCategory !== 'الكل' && post.category !== selectedCategory) {
      return false;
    }
    
    // 2. Clickable tag filter
    if (selectedTag) {
      const matchTag = post.content.includes(selectedTag) || post.title.includes(selectedTag);
      if (!matchTag) return false;
    }

    // 3. Text search
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(query);
      const matchContent = post.content.toLowerCase().includes(query);
      const matchAuthor = post.authorName.toLowerCase().includes(query) || post.authorUsername.toLowerCase().includes(query);
      return matchTitle || matchContent || matchAuthor;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('الكل');
    setSelectedTag(null);
  };

  const alignClass = language === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="space-y-6" id="feed-container">
      
      {/* 1. Comforting Invitation prompt banner */}
      <div className="bg-gradient-to-br from-[#FAF8F2] to-[#F1EDE2] rounded-2xl p-6 border border-accent-gold/20 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-sage/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className={`relative flex flex-col md:flex-row gap-5 justify-between items-center ${language === 'ar' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
          <div className={`${alignClass} flex-1 space-y-1.5`}>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-charcoal flex items-center gap-2">
              <Sparkles className="text-accent-gold w-5 h-5 inline" />
              {language === 'ar' ? 'خلِّد اللحظة التي تركت أثراً' : 'Immortalize the Moment that Left an Impact'}
            </h2>
            <p className="text-sm text-charcoal-light/85 max-w-2xl leading-relaxed">
              {language === 'ar' 
                ? 'هنا مساحتك الآمنة لحفظ أخر كلمات كُتبت، أو أخر صورة جمعت القلوب، أو ذكرى زيارة أخيرة لمكان تودّ لو ترحل إليه مجدداً. تذكّر أن الكلمات النبيلة لا تفنى أبداً.'
                : 'Here is your safe space to preserve the last words written, the last photo that united hearts, or the memory of a final visit to a place you wish you could visit again. Remember, noble words never die.'}
            </p>
          </div>

          <button
            onClick={onOpenCreatePost}
            id="trigger-create-post-btn"
            className="flex items-center gap-2 px-6 py-3 bg-accent-gold hover:bg-accent-gold-dark text-white font-bold rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02] focus:ring-2 focus:ring-accent-gold/30 cursor-pointer"
          >
            <PenTool size={16} />
            <span>{language === 'ar' ? 'ابدأ التدوين الآن' : 'Start Journaling Now'}</span>
          </button>
        </div>
      </div>

      {/* 2. Control center: Search and category switchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Core Posts Feed area */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Quick Categories filter */}
          <div className={`bg-white p-3 rounded-2xl border border-warm-beige shadow-xs flex flex-wrap items-center justify-between gap-3 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const catCount = cat === 'الكل' 
                  ? posts.length 
                  : posts.filter(p => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedTag(null); 
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border-0 cursor-pointer ${
                      isSelected
                        ? 'bg-accent-sage text-white'
                        : 'text-charcoal-light bg-warm-bg/40 hover:bg-warm-beige/60'
                    }`}
                  >
                    <span>{getCategoryLabel(cat)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-warm-beige text-charcoal-light/80 font-mono'}`}>
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Clear button if filters applied */}
            {(searchQuery || selectedCategory !== 'الكل' || selectedTag) && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 cursor-pointer"
              >
                <X size={12} />
                <span>{language === 'ar' ? 'إعادة تعيين وبدء عام' : 'Reset Filters'}</span>
              </button>
            )}
          </div>

          {/* Active Filter notification if any */}
          {selectedTag && (
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-accent-gold/20 flex justify-between items-center text-xs">
              <span className="text-charcoal-light/80">
                {language === 'ar' ? 'تصفية حسب الكلمة المفتاحية: ' : 'Filter by keyword: '}
                <strong className="text-accent-gold">"{getTagLabel(selectedTag)}"</strong>
              </span>
              <button onClick={() => setSelectedTag(null)} className="text-accent-gold hover:text-red-600 cursor-pointer"><X size={14} /></button>
            </div>
          )}

          {/* Posts Loop */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-warm-beige p-12 text-center shadow-xs">
              <div className="w-12 h-12 bg-warm-bg flex items-center justify-center rounded-full mx-auto mb-3">
                <AlertCircle className="text-accent-gold" />
              </div>
              <h3 className="text-lg font-bold font-serif text-charcoal mb-1">
                {language === 'ar' ? 'لم نجد ذكريات تتطابق مع بحثك' : 'We found no memories matching your search'}
              </h3>
              <p className="text-sm text-charcoal-light/70 max-w-sm mx-auto mb-4">
                {language === 'ar' 
                  ? 'حاول البحث بكلمات أخرى، أو تصفح تصنيفاً مختلفاً، أو كن البادئ بالتوثيق ونشر الكلمات الأولى الصادقة.'
                  : 'Try searching for other words, checking a different category, or be the first to document and publish the first meaningful words.'}
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-warm-beige text-charcoal text-xs font-semibold rounded-lg hover:bg-accent-gold/10 transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'الرجوع لرؤية كافة اللحظات الموثقة' : 'Go back to see all documented moments'}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  comments={comments}
                  currentUser={currentUser}
                  onReact={onReact}
                  onAddComment={onAddComment}
                  onAuthorClick={onAuthorClick}
                  onOpenOrderModal={onOpenOrderModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left Side filters (Search input, popular tags, spiritual statement) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: Text search engine */}
          <div className="bg-white rounded-2xl p-5 border border-warm-beige shadow-xs">
            <h3 className={`text-sm font-bold text-charcoal mb-3 flex items-center gap-1.5 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <Search size={15} className="text-accent-gold" />
              <span>{language === 'ar' ? 'ابحث عن رفيق، أو مكان، أو مشاعر' : 'Search for a companion, a place, or feelings'}</span>
            </h3>
            
            <div className="relative">
              <input
                type="text"
                placeholder={language === 'ar' ? 'ابحث بالاسم، كلمات الرسائل، أو المكان...' : 'Search by name, message keywords, or place...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${language === 'ar' ? 'pl-10 pr-4 text-right' : 'pr-10 pl-4 text-left'} py-2.5 rounded-xl border border-warm-beige bg-warm-bg/20 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all`}
              />
              <span className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-charcoal-light/40 pointer-events-none`}>
                <Search size={14} />
              </span>
            </div>
          </div>

          {/* Card 2: Interactive Emotional Popular Tags */}
          <div className={`bg-white rounded-2xl p-5 border border-warm-beige shadow-xs ${alignClass}`}>
            <h3 className={`text-sm font-bold text-charcoal mb-3 flex items-center gap-1.5 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <Compass size={15} className="text-accent-gold" />
              <span>{language === 'ar' ? 'الكلمات والمشاعر الأكثر تداولاً' : 'Most Common Words & Feelings'}</span>
            </h3>
            <p className="text-xs text-charcoal-light/65 mb-4 leading-relaxed">
              {language === 'ar'
                ? 'انقر على أي من المسميات والوجدانيات أدناه لتصفية ذكريات الآخرين المتصلة بها تلقائياً:'
                : 'Click on any of the terms below to automatically filter connected memories of others:'}
            </p>
            <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
              {POPULAR_TAGS.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(isActive ? null : tag);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-accent-gold text-white shadow-xs'
                        : 'bg-warm-bg/50 hover:bg-warm-bg text-charcoal hover:text-accent-gold'
                    }`}
                  >
                    {getTagLabel(tag)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Inspiring humanitarian message */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-warm-beige flex flex-col justify-between items-center text-center">
            <Heart size={20} className="text-accent-gold fill-current mb-2.5" />
            <h4 className="font-serif font-semibold text-charcoal text-sm">
              {language === 'ar' ? 'رسالة السكينة والوفاء' : 'Message of Serenity & Loyalty'}
            </h4>
            <p className="text-[11px] text-charcoal-light/80 mt-1 leading-relaxed max-w-xs">
              {language === 'ar'
                ? '"إن طعم الوداع لا يزال مراً، ولكن تذكر تلك اللمحة الإنسانية التي انقضت يجعلنا أكثر امتناناً لوجودهم العابر الرائع في مسيرتنا."'
                : '"The taste of farewell remains bitter, but remembering that brief passing human spark makes us more grateful for their wonderful, transient presence in our journey."'}
            </p>
            <span className="text-[9px] text-[#A88D65] font-serif mt-3 font-medium block">
              {language === 'ar' ? '— أسرة منصة \'اللحظة الأخيرة\'' : '— The Last Moment Team'}
            </span>
          </div>

          {/* Card 4: Premium Digital Vault Archive Activation */}
          <div className={`bg-white rounded-2xl p-5 border border-amber-200/40 shadow-xs space-y-3.5 ${alignClass}`}>
            <div className={`flex items-center gap-2 border-b border-warm-beige/60 pb-3 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <span className="p-1.5 rounded-lg bg-amber-50">
                <Lock size={15} className="text-[#C06000]" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-charcoal font-serif">
                  {language === 'ar' ? 'صندوق ذكرياتي المغلق' : 'My Closed Memory Box'}
                </h4>
                <p className="text-[10px] text-charcoal-light/60">
                  {language === 'ar' ? 'باقة الودائع والخصوصية المشفّرة' : 'Encrypted Deposits & Privacy Package'}
                </p>
              </div>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                {currentUser.isPremium ? (
                  <>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 space-y-1">
                      <p className={`text-xs font-bold text-emerald-800 flex items-center gap-1 ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{language === 'ar' ? 'خزنتك المغلقة نشطة ومحمية' : 'Your private vault is active and secured'}</span>
                      </p>
                      <p className="text-[10px] text-emerald-800/80 leading-relaxed font-sans">
                        {language === 'ar'
                          ? 'أنت قادر بالكامل على حفظ منشوراتك وصور الحميمية وتشفيرها لمنع وصول العامة أو تعقّبها بالمنصفة.'
                          : 'You have full capability to save and encrypt your posts and intimate photos to prevent public access.'}
                      </p>
                    </div>
                    <button
                      onClick={() => onUpgradePremium(currentUser.id, false)}
                      className="w-full py-2 bg-warm-bg hover:bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {language === 'ar' ? 'تعطيل رخصة الخزنة مؤقتاً' : 'Deactivate private vault temporarily'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-charcoal-light/85 leading-relaxed font-sans">
                      {language === 'ar'
                        ? 'احصل على باقة Premium Archive الخاصة بقيمة رمزية شهرياً (٩ ر.س شهرياً) لتمكين التشفير، حجب الذكريات عن بقية المنصة، وبناء مستودع آمن خاص بك.'
                        : 'Get the premium archive package for a symbolic value (9 SAR/month) to enable encryption, obscure memories from the rest of the platform, and build your own secure vault.'}
                    </p>
                    <button
                      onClick={() => onUpgradePremium(currentUser.id, true)}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles size={13} className="text-white animate-pulse" />
                      <span>{language === 'ar' ? 'تفعيل باقة الخزنة الممتازة (9 ر.س) ✨' : 'Activate Premium Vault Package (9 SAR) ✨'}</span>
                    </button>
                  </>
                )}
              </div>
            ) : (
              <p className="text-xs text-charcoal-light/75 leading-relaxed font-sans">
                {language === 'ar'
                  ? 'يرجى تسجيل الدخول أو اختيار حساب تجريبي بالعلوي للتمتع بدخول الخزنة الرقمية والحفاظ الفوري على سريتك المفرطة.'
                  : 'Please register or select a demo account from above to enjoy the digital vault access and guard your absolute privacy.'}
              </p>
            )}
          </div>

          {/* Card 5: E-commerce printed orders list */}
          {currentUser && (
            <div className={`bg-white rounded-2xl p-5 border border-warm-beige shadow-xs ${alignClass} space-y-3.5`}>
              <div className={`flex items-center gap-2 border-b border-warm-beige/60 pb-3 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                <span className="p-1.5 rounded-lg bg-accent-sage/10">
                  <Package size={15} className="text-accent-sage" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-charcoal font-serif">
                    {language === 'ar' ? 'سجل اللوحات والطلب الجداري الفاخر' : 'Luxury Printed Keepsakes Record'}
                  </h4>
                  <p className="text-[10px] text-charcoal-light/60">
                    {language === 'ar' ? 'متابعة طلباتك وتجسيد الذكريات' : 'Order progress & keepsake creation'}
                  </p>
                </div>
              </div>

              {orders.filter(o => o.userId === currentUser.id).length === 0 ? (
                <div className="text-center py-4 text-[10px] text-charcoal-light/60 font-sans border border-dashed border-warm-beige rounded-xl px-2">
                  {language === 'ar'
                    ? 'لم تطلب تحويل أي لحظات لمتجر ملموس حتى الآن. اضغط فوق "تحويل الأثر لمنتج ملموس" بأسفل منشوراتك المفضلة!'
                    : 'You have not requested to convert any moments to a keepsake artifact yet. Click "Transform legacy to a physical keepsake" at the bottom of your favorite posts!'}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {orders.filter(o => o.userId === currentUser.id).map(order => (
                    <div key={order.id} className="p-3 bg-warm-bg/30 rounded-xl border border-warm-beige/60 text-xs space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-semibold text-charcoal-light text-[10px] block truncate max-w-[120px]">{order.postTitle}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-sans font-bold leading-none ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {order.status === 'pending' 
                            ? (language === 'ar' ? '🔄 قيد الطباعة والتغليف' : '🔄 Printing & Packaging') 
                            : (language === 'ar' ? '🚚 تم الشحن لمنزلك' : '🚚 Shipped to Your House')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-charcoal-light/70 pt-1.5 border-t border-warm-beige/45">
                        <span>
                          {order.productType === 'canvas' 
                            ? (language === 'ar' ? '🖼️ لوحة جدارية ممتدة' : '🖼️ Deluxe Wall Canvas') 
                            : order.productType === 'book' 
                              ? (language === 'ar' ? '📖 ألبوم فاخر' : '📖 Gilded Book') 
                              : (language === 'ar' ? '🪵 صندوق الأثر الخشبي' : '🪵 Walnut Wood Box')}
                        </span>
                        <span className="font-bold text-accent-gold font-sans">{order.price} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
