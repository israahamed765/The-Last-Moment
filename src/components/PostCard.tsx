import React, { useState } from 'react';
import { Post, Comment, ReactionType, User } from '../types';
import { Sparkles, BookOpen, Compass, MessageCircle, Heart, Send, Calendar, Maximize2, X, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PostCardProps {
  post: Post;
  comments: Comment[];
  currentUser: User | null;
  onReact: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, content: string) => void;
  onAuthorClick: (userId: string) => void;
  onOpenOrderModal: (post: Post) => void;
}

export function PostCard({
  post,
  comments,
  currentUser,
  onReact,
  onAddComment,
  onAuthorClick,
  onOpenOrderModal,
}: PostCardProps) {
  const { language, t } = useLanguage();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);

  // Filter comments belonging to this post
  const postComments = comments.filter((c) => c.postId === post.id);

  // Active reaction from the current user
  const activeReaction = currentUser ? post.userReactions[currentUser.id] : null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const getReactionLabel = (type: ReactionType) => {
    switch (type) {
      case 'affect': return language === 'ar' ? 'أثّر فيّ' : 'Impacted';
      case 'legacy': return language === 'ar' ? 'ذكرى طيبة' : 'Legacy';
      case 'pray': return language === 'ar' ? 'دعاء ومغفرة' : 'Prayers';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'أشخاص': return language === 'ar' ? 'أشخاص' : 'People';
      case 'أماكن': return language === 'ar' ? 'أماكن' : 'Places';
      case 'رسائل': return language === 'ar' ? 'رسائل' : 'Letters';
      case 'ذكريات': return language === 'ar' ? 'ذكريات' : 'Memories';
      default: return cat;
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const alignTextClass = language === 'ar' ? 'text-right md:text-right' : 'text-left md:text-left';

  return (
    <div 
      className="bg-white rounded-2xl border border-warm-beige shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
      id={`post-card-${post.id}`}
    >
      <div>
        {/* Card Header (Author & Metadata) */}
        <div className={`flex items-center justify-between mb-5 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
          <div 
            onClick={() => onAuthorClick(post.userId)}
            className={`flex items-center gap-3 cursor-pointer group ${language === 'ar' ? '' : 'flex-row-reverse'}`}
          >
            <img
              src={post.authorAvatar}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover border border-accent-gold/20 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className={language === 'ar' ? 'text-right' : 'text-left'}>
              <h4 className="font-bold text-charcoal group-hover:text-accent-gold transition-colors text-base">
                {post.authorName}
              </h4>
              <p className="text-xs text-charcoal-light/60">@{post.authorUsername}</p>
            </div>
          </div>

          <div className={`flex items-center gap-1.5 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
            {post.isPrivate && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <Lock size={11} className="text-amber-700 font-bold" />
                <span>{language === 'ar' ? 'خزنة رقمية مشفرة' : 'Encrypted Vault'}</span>
              </span>
            )}
            <span className="text-[11px] font-semibold text-accent-sage bg-accent-sage/5 border border-accent-sage/10 px-3 py-1 rounded-full">
              # {getCategoryLabel(post.category)}
            </span>
          </div>
        </div>

        {/* Post Title */}
        <h3 className={`text-xl md:text-2xl font-bold font-serif text-charcoal mb-3 leading-tight ${alignTextClass}`}>
          {post.title}
        </h3>

        {/* Post Content (Beautiful Serif Typography) */}
        <p className={`text-charcoal-light/90 leading-relaxed font-sans text-base mb-5 whitespace-pre-line text-justify ${alignTextClass}`}>
          {post.content}
        </p>

        {/* Post Image with dynamic Lightbox Trigger */}
        {post.imageUrl && (
          <div className="relative rounded-xl overflow-hidden border border-warm-beige/60 bg-warm-bg/30 max-h-[400px] mb-5 group select-none">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-h-[400px] object-cover transition-transform duration-500 group-hover:scale-101 cursor-pointer"
              referrerPolicy="no-referrer"
              onClick={() => setShowLightbox(true)}
            />
            {/* Hover overlay hint */}
            <div 
              onClick={() => setShowLightbox(true)}
              className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-zoom-in transition-opacity duration-300"
            >
              <button className="bg-white/90 text-charcoal hover:bg-white p-2.5 rounded-full shadow flex items-center gap-1 text-xs font-semibold cursor-pointer">
                <Maximize2 size={14} />
                {language === 'ar' ? 'تكبير الصورة الأخيرة' : 'Enlarge Image'}
              </button>
            </div>
          </div>
        )}

        {/* Date string */}
        <div className={`text-[11px] text-charcoal-light/50 font-sans flex items-center gap-1 mb-4 pb-4 border-b border-warm-beige/50 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
          <Calendar size={12} className="text-accent-gold" />
          <span>{language === 'ar' ? 'تم توثيق الذكرى في ' : 'Documented on '} {formattedDate}</span>
        </div>
      </div>

      {/* Interactions Panel */}
      <div>
        {/* Empathetic Reaction System */}
        <div className={`flex flex-wrap items-center justify-between gap-4 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
          <div className={`flex items-center gap-1 bg-warm-bg/40 p-1.5 rounded-xl border border-warm-beige/60 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
            {/* React 1: أثّر فيّ */}
            <button
              onClick={() => onReact(post.id, 'affect')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeReaction === 'affect'
                  ? 'bg-[#FFEEDC] text-[#C06000] scale-102 ring-1 ring-[#FFD29D]'
                  : 'text-charcoal-light/75 hover:bg-warm-beige'
              }`}
            >
              <Sparkles size={14} className={activeReaction === 'affect' ? 'fill-current' : ''} />
              <span>{getReactionLabel('affect')}</span>
              <span className="font-mono bg-white/40 px-1.5 py-0.5 rounded text-[10px]">{post.reactions.affect}</span>
            </button>

            {/* React 2: ذكرى طيبة */}
            <button
              onClick={() => onReact(post.id, 'legacy')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeReaction === 'legacy'
                  ? 'bg-accent-sage/10 text-accent-sage-dark scale-102 ring-1 ring-accent-sage/20'
                  : 'text-charcoal-light/75 hover:bg-warm-beige'
              }`}
            >
              <BookOpen size={14} />
              <span>{getReactionLabel('legacy')}</span>
              <span className="font-mono bg-white/40 px-1.5 py-0.5 rounded text-[10px]">{post.reactions.legacy}</span>
            </button>

            {/* React 3: دعاء */}
            <button
              onClick={() => onReact(post.id, 'pray')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeReaction === 'pray'
                  ? 'bg-accent-gold/10 text-accent-gold-dark scale-102 ring-1 ring-accent-gold/20'
                  : 'text-charcoal-light/75 hover:bg-warm-beige'
              }`}
            >
              <Compass size={14} />
              <span>{language === 'ar' ? 'دعاء' : 'Prayers'}</span>
              <span className="font-mono bg-white/40 px-1.5 py-0.5 rounded text-[10px]">{post.reactions.pray}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* E-commerce product printing option */}
            <button
              onClick={() => onOpenOrderModal(post)}
              id={`print-post-btn-${post.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-accent-gold-dark bg-accent-gold/10 hover:bg-accent-gold/25 border border-accent-gold/25 transition-all shadow-xs hover:scale-101 shrink-0 cursor-pointer"
              title="تحويل الأثر إلى لوحة جدارية مطبوعة بجودة عالية أو كتاب لتخليد الذكريات"
            >
              <Sparkles size={13} className="text-accent-gold animate-pulse" />
              <span>{language === 'ar' ? 'تحويل الأثر لمنتج ملموس 🖼️' : 'Convert to Keepsake 🖼️'}</span>
            </button>

            {/* Toggle comments display */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                showComments
                  ? 'bg-accent-gold text-white shadow-sm'
                  : 'bg-warm-bg hover:bg-warm-beige text-charcoal'
              }`}
            >
              <MessageCircle size={15} />
              <span>{language === 'ar' ? 'رسائل الدعم والسكينة' : 'Comfort Messages'}</span>
              <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] ${showComments ? 'bg-white/25' : 'bg-warm-beige text-charcoal/80'}`}>
                {postComments.length}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Comments Drawer/Section */}
        {showComments && (
          <div className="mt-5 pt-5 border-t border-warm-beige/70 space-y-4">
            {/* Comment Post Form */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'ar' ? 'اكتب كلمة تعاطف أو دعاء طيب لتقديم السكينة لأصحاب الذكرى...' : 'Write supportive thoughts or prayers of comfort for the family...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold text-xs font-sans transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
              />
              <button
                type="submit"
                className="bg-accent-sage hover:bg-accent-sage-dark text-white p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title={language === 'ar' ? 'إرسال' : 'Send'}
              >
                <Send size={15} />
              </button>
            </form>

            {/* List of comments */}
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {postComments.length === 0 ? (
                <div className="text-center py-6 bg-warm-bg/25 rounded-xl border border-dashed border-warm-beige/70">
                  <p className="text-xs text-charcoal-light/60 font-sans px-4">
                    {language === 'ar' 
                      ? 'كن أول من يبعث بفيض كلماته الدافئة ليواسي ويشجع أصحاب الذكرى.' 
                      : 'Be the first to share warm comforting words to console and support.'}
                  </p>
                </div>
              ) : (
                postComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`flex gap-3 bg-warm-bg/20 p-3 rounded-xl border border-warm-beige/30 ${language === 'ar' ? '' : 'flex-row-reverse'}`}
                  >
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-8 h-8 rounded-full object-cover shadow-xs border border-white shrink-0 h-8 self-start"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center justify-between gap-2 mb-0.5 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                        <span className="font-semibold text-charcoal text-xs truncate">{comment.authorName}</span>
                        <span className="text-[9px] text-charcoal-light/40 font-mono shrink-0">
                          {new Date(comment.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`text-xs text-charcoal-light/95 leading-relaxed font-sans mt-1 whitespace-pre-wrap ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / High-respect Overlay */}
      {showLightbox && post.imageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-charcoal/90 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none"
          onClick={() => setShowLightbox(false)}
        >
          {/* Close Lightbox */}
          <button 
            onClick={() => setShowLightbox(false)}
            className="absolute top-6 left-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X size={24} />
          </button>

          <div 
            className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="max-w-full max-h-[80vh] rounded-xl object-contain border-2 border-white/20 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-center mt-4 max-w-lg text-white">
            <h4 className="font-serif font-bold text-lg text-accent-gold">{post.title}</h4>
            <p className="text-xs text-white/70 mt-1">
              {language === 'ar' ? 'بواسطة' : 'By'} {post.authorName} • {getCategoryLabel(post.category)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
