import React, { useState, useRef } from 'react';
import { Post, ReactionDetail, User } from '../types';
import { X, Image as ImageIcon, Sparkles, Tag, Check, HelpCircle, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAddPost: (title: string, content: string, category: string, imageUrl?: string, isPrivate?: boolean) => void;
}

const CATEGORIES = ["أشخاص", "أماكن", "رسائل", "ذكريات"];

const MEMORY_PRESETS = [
  {
    name: "مغيب هادئ",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "شجرة وياسمين",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "رسالة قديمة",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "مقهى هادئ",
    url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800"
  }
];

export function CreatePostModal({ isOpen, onClose, currentUser, onAddPost }: CreatePostModalProps) {
  const { language, t } = useLanguage();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handles drag & drop or file selection
  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(language === 'ar' ? 'يرجى تحميل ملف صورة صالح فقط.' : 'Please upload a valid image file only.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setImageUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = () => {
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAddPost(
      title.trim(),
      content.trim(),
      category,
      imageUrl || undefined,
      isPrivate
    );

    // Reset status
    setTitle('');
    setContent('');
    setCategory(CATEGORIES[0]);
    setImageUrl('');
    setIsPrivate(false);
    onClose();
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

  const getPresetName = (name: string) => {
    if (language === 'ar') return name;
    const presets: Record<string, string> = {
      "مغيب هادئ": "Calm Sunset",
      "شجرة وياسمين": "Deluxe Jasmine",
      "رسالة قديمة": "Old Letter",
      "مقهى هادئ": "Cozy Café"
    };
    return presets[name] || name;
  };

  const alignClass = language === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-warm-beige overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        id="create-post-modal-card"
      >
        {/* Banner strip */}
        <div className="h-2 bg-gradient-to-r from-accent-gold via-accent-sage to-accent-gold" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-create-post-modal"
          className="absolute top-4 left-4 p-2 text-charcoal/60 hover:text-charcoal hover:bg-warm-bg rounded-full transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          <div className={`mb-6 ${alignClass}`}>
            <h3 className="text-xl md:text-2xl font-bold font-serif text-charcoal">{t('createPostTitle')}</h3>
            <p className="text-charcoal-light/70 text-xs md:text-sm mt-1 leading-relaxed">
              {t('createPostSubtitle')}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Context Title Input */}
            <div className={alignClass}>
              <label className="block text-xs font-bold text-charcoal mb-1">
                {t('postTitleLabel')} <span className="text-accent-gold font-normal text-[10px]">({language === 'ar' ? 'مثلاً: آخر صورة له، آخر حديث بيننا، وداع رصيف المحطة' : 'e.g. His last photograph, Our last talk, Goodbye at the station'})</span>
              </label>
              <input
                type="text"
                required
                placeholder={t('postTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all text-xs font-sans ${alignClass}`}
              />
            </div>

            {/* Content Text Area */}
            <div className={alignClass}>
              <label className="block text-xs font-bold text-charcoal mb-1">
                {t('postContentLabel')}
              </label>
              <textarea
                required
                rows={5}
                placeholder={t('postContentPlaceholder')}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border border-warm-beige bg-warm-bg/30 text-charcoal focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all text-xs leading-relaxed resize-none font-sans ${alignClass}`}
              />
            </div>

            {/* Category Select Radio/Tag buttons */}
            <div className={alignClass}>
              <label className="block text-xs font-bold text-charcoal mb-2">
                {t('postCategoryLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-accent-gold border-accent-gold text-white shadow-sm'
                          : 'bg-white border-warm-beige text-charcoal-light hover:border-accent-gold/40 hover:bg-warm-bg/30'
                      }`}
                    >
                      # {getCategoryLabel(cat)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image attachment / preset selection */}
            <div className={alignClass}>
              <label className="block text-xs font-bold text-charcoal mb-1.5">
                {language === 'ar' ? 'إرفاق صورة أو خلفية للذكرى (اختياري)' : 'Attach Image or Aesthetic Preset Backdrop (Optional)'}
              </label>
              
              <div 
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] ${
                  dragActive 
                    ? 'border-accent-gold bg-warm-bg/50' 
                    : imageUrl 
                    ? 'border-accent-sage/40 bg-accent-sage/5' 
                    : 'border-warm-beige hover:border-accent-gold/50 bg-warm-bg/20'
                }`}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="w-full">
                    <img 
                      src={imageUrl} 
                      alt="Uploaded preview" 
                      className="max-h-[120px] rounded-lg mx-auto object-cover border border-warm-beige"
                    />
                    <div className="mt-2 flex gap-4 justify-center">
                      <p className="text-xs text-accent-sage font-medium">
                        {language === 'ar' ? 'تم إرفاق الصورة المكتملة بنجاح' : 'Comfort image attached successfully'}
                      </p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageUrl('');
                        }}
                        className="text-xs text-red-500 underline hover:text-red-700 font-bold"
                      >
                        {language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={28} className="text-accent-gold mb-2 animate-pulse" />
                    <p className="text-xs font-semibold text-charcoal">
                      {language === 'ar' ? 'اسحب وأفلت صورتك هنا، أو انقر للتصفح' : 'Drag and drop your image here, or click to browse'}
                    </p>
                    <p className="text-[10px] text-charcoal-light/60 mt-1">
                      {language === 'ar' ? 'يدعم صيغ الصور المعتادة (JPG, PNG)' : 'Supports regular image formats (JPG, PNG)'}
                    </p>
                  </>
                )}
              </div>

              {/* Memory Presets Helper so user can click to include a lovely image instantly */}
              {!imageUrl && (
                <div className="mt-3">
                  <p className="text-[11px] text-charcoal-light/70 mb-2">
                    {language === 'ar' ? 'أو اختر خلفية دافئة معبّرة تناسب المنشور بضغطة واحدة:' : 'Or pick an elegant comforting background preset instantly:'}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {MEMORY_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.name}
                        onClick={() => setImageUrl(preset.url)}
                        className="group relative h-14 rounded-lg overflow-hidden border border-warm-beige hover:border-accent-gold transition-all"
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-charcoal/35 flex items-center justify-center p-1">
                          <span className="text-[10px] text-white font-medium text-center">{getPresetName(preset.name)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Private Vault Selector Option */}
            <div className={`bg-[#FAF8F5] rounded-xl p-4 border border-[#C06000]/20 space-y-2 mt-4 ${alignClass}`}>
              <label className={`flex items-center gap-2.5 cursor-pointer select-none ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  id="private-vault-checkbox"
                  className="w-4 h-4 text-[#C06000] border-warm-beige rounded focus:ring-[#C06000] accent-[#C06000] focus:outline-none"
                />
                <span className="font-semibold text-charcoal text-xs flex items-center gap-1">
                  <Lock size={13} className="text-[#C06000]" />
                  {t('postPrivateLabel')}
                </span>
              </label>
              <p className={`text-[10.5px] text-charcoal-light/80 leading-relaxed pr-6 ${language === 'ar' ? '' : 'pl-6 pr-0'}`}>
                {t('postPrivateHint')}
                {!currentUser?.isPremium && (
                  <span className="block mt-1 font-bold text-[#C06000]">
                    {language === 'ar' 
                      ? '* حسابك الحالي ليس ترقية خزنة مشفرة نشطة. بتحديد هذا الخيار، سيصنف المنشور كذكرى مشفرة وسنوجهك بعد النشر لتفعيل الباقة المميزة بقيمة شهرية بسيطة لفتحها والولوج لخزنتك متى تشاء!'
                      : '* Your current account has not activated the encrypted private vault license. By choosing this, the post will be saved securely but hidden; we suggest upgrading to Premium Archive afterwards for complete independent access anytime!'}
                  </span>
                )}
              </p>
            </div>

            {/* Buttons form footer */}
            <div className={`flex gap-3 justify-end pt-3 border-t border-warm-beige ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
              <button
                type="submit"
                id="submit-create-post"
                className="px-6 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl transition-all shadow shadow-amber-300/30 flex items-center gap-1.5 focus:ring-2 focus:ring-accent-gold/40 cursor-pointer"
              >
                <span>{isPrivate ? (language === 'ar' ? 'تشفير وحفظ بالخزنة 🔒' : 'Encrypt & Save in Vault 🔒') : (language === 'ar' ? 'نشر وتوثيق الأثر 🌸' : 'Publish & Document Memory 🌸')}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-warm-beige hover:bg-accent-gold/10 text-charcoal/80 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء التوثيق' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
