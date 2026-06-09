import React, { useState } from 'react';
import { translations, categories, themes, presetIllustrations } from '../i18n';
import { Memorial, MemorialCategory, MemorialTheme } from '../types';
import { Sparkles, HelpCircle, Eye, Check, X, FileText, Feather, Heart } from 'lucide-react';

interface CreateFormProps {
  language: 'en' | 'ar';
  onPublish: (newMemorial: Memorial) => void;
  incrementMemorialStats: () => void;
  goToTimeline: () => void;
}

export default function CreateForm({
  language,
  onPublish,
  incrementMemorialStats,
  goToTimeline
}: CreateFormProps) {
  const t = translations[language];

  // Forms states
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [relationshipAr, setRelationshipAr] = useState('');
  const [relationshipEn, setRelationshipEn] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [category, setCategory] = useState<MemorialCategory>('legacy');
  const [lastWordsAr, setLastWordsAr] = useState('');
  const [lastWordsEn, setLastWordsEn] = useState('');
  const [storyAr, setStoryAr] = useState('');
  const [storyEn, setStoryEn] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<MemorialTheme>('misty');
  const [selectedIllustration, setSelectedIllustration] = useState('sky');
  const [customImageBase64, setCustomImageBase64] = useState('');

  // AI Refine Assist state
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');
  const [aiRefiningLang, setAiRefiningLang] = useState<'ar' | 'en'>(language);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedOutput, setRefinedOutput] = useState('');
  const [showAiConsole, setShowAiConsole] = useState(false);
  const [aiError, setAiError] = useState('');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Invoke server-side Gemini to polish raw notes
  const handleAiRefinement = async () => {
    if (!aiDraftPrompt.trim()) return;
    setIsRefining(true);
    setAiError('');
    setRefinedOutput('');
    try {
      const response = await fetch('/api/gemini/refine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDraft: aiDraftPrompt,
          language: aiRefiningLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server Gemini module returned errors');
      }

      const data = await response.json();
      setRefinedOutput(data.refinedText);
    } catch (err: any) {
      console.error(err);
      setAiError(
        language === 'ar'
          ? 'عذراً، لم تنجح الصياغة. تأكد من إعداد مفتاح بيئة GEMINI_API_KEY بنجاح من قائمة الأسرار.'
          : 'AI refinement service failed. Ensure GEMINI_API_KEY is configured in your Secrets.'
      );
    } finally {
      setIsRefining(false);
    }
  };

  // Adopt refined words
  const handleAcceptRefinement = () => {
    if (aiRefiningLang === 'ar') {
      setLastWordsAr(refinedOutput);
    } else {
      setLastWordsEn(refinedOutput);
    }
    // Clean assistant state
    setRefinedOutput('');
    setAiDraftPrompt('');
    setShowAiConsole(false);
  };

  // Submit the formal memorial
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const isDeceasedMode = category !== 'happy';
    if (isDeceasedMode && (!birthYear || !passingYear)) {
      setSubmitError(language === 'ar' ? 'يرجى تحديد سنوات العمر.' : 'Please define lifespan birth and passing years.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEn: nameEn || nameAr,
          nameAr: nameAr || nameEn,
          relationshipEn: relationshipEn || relationshipAr || 'Family',
          relationshipAr: relationshipAr || relationshipEn || 'قريب غالي',
          birthYear: category === 'happy' ? (birthYear || new Date().getFullYear().toString()) : birthYear,
          passingYear: category === 'happy' ? (birthYear || new Date().getFullYear().toString()) : passingYear,
          category,
          lastWordsEn,
          lastWordsAr,
          storyEn,
          storyAr,
          theme: selectedTheme,
          image: customImageBase64 || (selectedIllustration === 'none' ? 'none' : selectedIllustration),
        }),
      });

      if (!response.ok) {
        throw new Error('Could not publish. Please check connection parameters.');
      }

      const createdMemorial: Memorial = await response.json();
      onPublish(createdMemorial);
      incrementMemorialStats();
      goToTimeline();
    } catch (err: any) {
      setSubmitError(err.message || 'Error occurred while publishing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="memorial-create-flow">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-slate-800 font-medium mb-3 flex items-center justify-center gap-2">
          <Feather className="w-6 h-6 text-primary" />
          {t.formHeading}
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          {t.formSub}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Main Form Fields */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-xl text-xs font-mono">
              ⚠️ {submitError}
            </div>
          )}

          {/* Section A: Identities & Dates */}
          <div className="bg-surface-lowest border border-surface-container rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-stone-700 tracking-wider uppercase border-b border-surface-low pb-2 font-serif">
              {category === 'happy'
                ? (language === 'ar' ? '١. معلومات الذكرى السعيدة الأساسية' : '1. Core Memory Identity')
                : (language === 'ar' ? '١. معلومات الفقيد الأساسية' : '1. Core Identity & Lifespan')}
            </h3>

            {/* Names Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'عنوان الذكرى أو الاسم (عربي)' : 'Memory Title / Name (Arabic)')
                    : t.formNameAr}
                </label>
                <input
                  type="text"
                  required
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? (language === 'ar' ? 'مثال: يوم تخرجنا السعيد...' : 'e.g. Graduation Day...') : "محمد أحمد الغامدي..."}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'عنوان الذكرى أو الاسم (إنجليزي)' : 'Memory Title / Name (English)')
                    : t.formNameEn}
                </label>
                <input
                  type="text"
                  required
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? "e.g. Graduation Day..." : "e.g. Mahmoud Ahmed..."}
                />
              </div>
            </div>

            {/* Relations input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'الواصف / المناسبة بالعرية (مثال: حفل عائلي)' : 'Context / Occasion in Arabic (e.g. Spring Trip)')
                    : t.formRelationshipAr}
                </label>
                <input
                  type="text"
                  required
                  value={relationshipAr}
                  onChange={(e) => setRelationshipAr(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? (language === 'ar' ? 'رحلة ترفيهية، حفل التخرج...' : 'Joyful trip, family gather...') : "مثال: والدي العزيز، أستاذ الأجيال..."}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'الواصف / المناسبة بالإنجليزية' : 'Context / Occasion in English')
                    : t.formRelationshipEn}
                </label>
                <input
                  type="text"
                  required
                  value={relationshipEn}
                  onChange={(e) => setRelationshipEn(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder="e.g. Family Gathering, Childhood Joy..."
                />
              </div>
            </div>

            {/* Born and Died years / Simple Date */}
            {category !== 'happy' ? (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">{t.formBirth}</label>
                  <input
                    type="number"
                    required
                    min="1800"
                    max="2030"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800 font-mono"
                    placeholder="1945"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">{t.formPassing}</label>
                  <input
                    type="number"
                    required
                    min="1800"
                    max="2030"
                    value={passingYear}
                    onChange={(e) => setPassingYear(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800 font-mono"
                    placeholder="2024"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1 animate-fade-in">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {language === 'ar' ? 'سنة الذكرى أو تاريخ المناسبة (اختياري)' : 'Year / Date of Memory (Optional)'}
                </label>
                <input
                  type="text"
                  value={birthYear}
                  onChange={(e) => {
                    setBirthYear(e.target.value);
                    setPassingYear(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800 font-mono"
                  placeholder={language === 'ar' ? 'مثال: 2026، عطلة الصيف...' : 'e.g. 2026, Summer trip...'}
                />
              </div>
            )}
          </div>

          {/* Section B: Memorial Aesthetic styling */}
          <div className="bg-surface-lowest border border-surface-container rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-stone-700 tracking-wider uppercase border-b border-surface-low pb-2 font-serif">
              {language === 'ar' ? '٢. النبرة والجمالية البصرية' : '2. Aesthetic Tone & Theme'}
            </h3>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">{t.formCategory}</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`py-3 px-3 rounded-xl border text-[11px] font-medium text-left transition-all ${
                      category === cat.key
                        ? 'bg-primary/5 border-primary text-slate-900 shadow-sm'
                        : 'bg-bg-serene border-surface-container hover:bg-surface-low text-stone-600'
                    }`}
                  >
                    <div className="font-semibold block">{language === 'ar' ? cat.ar : cat.en}</div>
                    <div className="text-[9px] text-stone-400 font-light mt-0.5 whitespace-normal">
                      {language === 'ar' ? cat.descriptionAr : cat.descriptionEn}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Visual atmospheric theme picker */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">{t.formTheme}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {themes.map((th) => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setSelectedTheme(th.key)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      selectedTheme === th.key
                        ? 'border-secondary bg-secondary/5 font-semibold text-slate-900 shadow-sm'
                        : 'border-surface-container bg-bg-serene hover:bg-surface-low text-stone-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${th.cardClass.split(' ')[1]} border border-stone-300`} />
                    <span className="text-[10px] text-center mt-1 scale-90 tracking-tight block">
                      {language === 'ar' ? th.nameAr : th.nameEn}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Illustration select presets */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">{t.orSelectPresetIllustration}</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(presetIllustrations).map(([key, url]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedIllustration(key);
                      setCustomImageBase64(''); // Clear custom upload if preset is chosen
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                      selectedIllustration === key && !customImageBase64
                        ? 'border-primary ring-2 ring-primary/20 scale-102 shadow-md hover:brightness-100'
                        : 'border-surface-container hover:opacity-90 opacity-70'
                    }`}
                  >
                    <img src={url} alt={key} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                      {t.illustrations[key as keyof typeof t.illustrations]}
                    </div>
                  </button>
                ))}

                {/* Explicit Text Only option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIllustration('none');
                    setCustomImageBase64('');
                  }}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedIllustration === 'none' && !customImageBase64
                      ? 'border-amber-600 bg-amber-50 text-amber-800 font-semibold shadow-sm'
                      : 'border-surface-container bg-bg-serene hover:bg-surface-low text-stone-650'
                  }`}
                >
                  <p className="text-[10px] text-center font-sans">
                    {language === 'ar' ? 'بدون صورة' : 'No Photo'}
                  </p>
                  <span className="text-[8px] opacity-60">({language === 'ar' ? 'نص فقط' : 'Text-only'})</span>
                </button>
              </div>
            </div>

            {/* Custom Image Upload Option */}
            <div className="space-y-2 pt-2 border-t border-surface-low/80">
              <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider block">
                {language === 'ar' ? 'أو ارفع صورة خاصة فريدة للمنشور:' : 'Or upload a custom photo for the post:'}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCustomImageBase64(reader.result as string || '');
                        setSelectedIllustration(''); // Clear preset if local upload selected
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="custom-memorial-photo-file-picker"
                />
                <label
                  htmlFor="custom-memorial-photo-file-picker"
                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-semibold cursor-pointer transition select-none inline-flex items-center gap-1.5 active:scale-95 animate-fade-in"
                >
                  {language === 'ar' ? 'اختر صورة من جهازك 🖼️' : 'Upload custom photo 🖼️'}
                </label>
                {customImageBase64 && (
                  <div className="flex items-center gap-2 bg-[#F8F6F4] p-1.5 rounded-xl border border-stone-200 animate-scale-in">
                    <img
                      src={customImageBase64}
                      alt="Uploaded preview"
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomImageBase64('')}
                      className="text-xs text-red-500 hover:underline font-semibold pr-2 pl-2"
                    >
                      {language === 'ar' ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section C: Final Message / Wisdom */}
          <div className="bg-surface-lowest border border-surface-container rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-surface-low pb-2">
              <h3 className="text-sm font-semibold text-stone-700 tracking-wider uppercase font-serif">
                {language === 'ar' ? '٣. الأثر والكلمات الأخيرة' : '3. Final Words & Memorial Story'}
              </h3>

              {/* Toggle AI polishing helper banner */}
              <button
                type="button"
                onClick={() => setShowAiConsole(!showAiConsole)}
                className="text-xs text-secondary hover:text-secondary-focus flex items-center gap-1 font-mono hover:underline px-2.5 py-1 rounded-full bg-secondary/5 border border-purple-200/40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'الاستعانة بالذكاء الاصطناعي (Gemini)' : 'Use Gemini AI Assist'}</span>
              </button>
            </div>

            {/* AI Refining Interface Box */}
            {showAiConsole && (
              <div className="bg-purple-50/50 border border-purple-200/40 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-serif font-bold text-secondary flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {language === 'ar' ? 'مساعد تدوين الوصية الهادئ من جيميناي' : 'Gemini Elegant Memoirist'}
                  </span>

                  <div className="flex gap-1 text-[9px] font-mono">
                    <button
                      type="button"
                      onClick={() => setAiRefiningLang('ar')}
                      className={`px-1.5 py-0.5 rounded ${aiRefiningLang === 'ar' ? 'bg-secondary text-white' : 'bg-surface-low text-stone-600'}`}
                    >
                      Ar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiRefiningLang('en')}
                      className={`px-1.5 py-0.5 rounded ${aiRefiningLang === 'en' ? 'bg-secondary text-white' : 'bg-surface-low text-stone-600'}`}
                    >
                      En
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed font-light">
                  {t.aiPromptHelp}
                </p>

                <div className="space-y-1">
                  <textarea
                    rows={2}
                    value={aiDraftPrompt}
                    onChange={(e) => setAiDraftPrompt(e.target.value)}
                    placeholder={
                      aiRefiningLang === 'ar'
                        ? 'اكتب مسودة غير مرتبة (مثال: جدي كان طيب، كان يحب الشجر، آخر كلمة قالها هي أحبوا أولادكم ودائما تصدقوا بالخبز)'
                        : 'Write raw, unpolished bullet points of what they shared, their final message, or advice...'
                    }
                    className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-secondary/40"
                  />
                </div>

                {aiError && (
                  <p className="text-[10px] text-red-600 font-mono">
                    ⚠️ {aiError}
                  </p>
                )}

                {refinedOutput && (
                  <div className="bg-white border border-secondary/40 p-3 rounded-lg space-y-2">
                    <div className="text-[10px] text-stone-400 font-semibold uppercase font-mono tracking-wider flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-stone-400" />
                      {t.aiPolishedPreview}
                    </div>
                    <blockquote className="text-xs font-serif italic text-slate-800 bg-slate-50 p-2 border-l-2 border-primary">
                      "{refinedOutput}"
                    </blockquote>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={handleAcceptRefinement}
                        className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {t.usePolished}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRefinedOutput('')}
                        className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded text-[11px] font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {t.cancelAI}
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleAiRefinement}
                    disabled={isRefining || !aiDraftPrompt.trim()}
                    className="px-4 py-1.5 bg-secondary hover:bg-secondary/90 text-white text-xs rounded-lg font-semibold flex items-center gap-1.5 ml-auto disabled:opacity-50 active:scale-95"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isRefining ? 'animate-spin' : ''}`} />
                    {isRefining ? t.aiRefining : t.polishWithAI}
                  </button>
                </div>
              </div>
            )}

            {/* Last Words Inputs */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'عبارة مختصرة أو خاطرة دافئة بخصوص الذكرى السعيدة (بالعربية)' : 'Brief thought or lovely text highlight (Arabic)')
                    : t.formWordsAr}
                </label>
                <textarea
                  rows={2}
                  value={lastWordsAr}
                  onChange={(e) => setLastWordsAr(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? (language === 'ar' ? 'مثال: جمعت عائلتي والضحكات تملأ الأرجاء...' : 'e.g. Joyful gathering with the family...') : "وصيتهم أو نصيحتهم الأخيرة باللغة العربية..."}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'عبارة مختصرة أو خاطرة دافئة بخصوص الذكرى السعيدة (بالإنجليزية)' : 'Brief thought or lovely text highlight (English)')
                    : t.formWordsEn}
                </label>
                <textarea
                  rows={2}
                  value={lastWordsEn}
                  onChange={(e) => setLastWordsEn(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? "e.g. Laughing together around the fireplace..." : "Their last words or wise advice in English..."}
                />
              </div>
            </div>

            {/* Detailed Stories */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'قصة الذكرى السعيدة وتفاصيلها المبهجة (بالعربية - اختياري)' : 'Detailed happy memory story (Arabic - Optional)')
                    : t.formStoryAr}
                </label>
                <textarea
                  rows={3}
                  value={storyAr}
                  onChange={(e) => setStoryAr(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? (language === 'ar' ? 'اكتب ما تذكره عن تفاصيل ذلك اليوم والبهجة التي احتويناها...' : 'Share what you remember most from that beautiful event...') : "سيرة مبسطة عن أيامهم الأخيرة أو أثرهم الممتد..."}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600 font-mono tracking-wider">
                  {category === 'happy'
                    ? (language === 'ar' ? 'قصة الذكرى السعيدة وتفاصيلها المبهجة (بالإنجليزية - اختياري)' : 'Detailed happy memory story (English - Optional)')
                    : t.formStoryEn}
                </label>
                <textarea
                  rows={3}
                  value={storyEn}
                  onChange={(e) => setStoryEn(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-surface-container focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-bg-serene text-slate-800"
                  placeholder={category === 'happy' ? "Share what you remember most from that beautiful event..." : "Write a brief paragraph on their final days or their everlasting impact..."}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="text-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold tracking-wide transition shadow-md active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="animate-pulse">{language === 'ar' ? 'جاري التخليد في السجلات...' : 'Recording in Eternity...'}</span>
              ) : (
                t.formSubmitButton
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Simple Live Preview Card */}
        <div className="space-y-4">
          <div className="sticky top-6 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold px-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              {language === 'ar' ? 'معاينة حية فورية' : 'Live Preview'}
            </h4>

            {/* Mock Card Preview */}
            <div className="rounded-2xl border border-surface-container overflow-hidden bg-white shadow-sm opacity-95">
              {(customImageBase64 || (selectedIllustration && selectedIllustration !== 'none')) ? (
                <div className="h-28 bg-slate-800 relative">
                  <img
                    src={customImageBase64 || presetIllustrations[selectedIllustration] || presetIllustrations.sky}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-70"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 text-[10px] uppercase font-mono px-2 py-0.5 rounded-full text-slate-800">
                    {category === 'happy' ? (language === 'ar' ? 'آخر ذكرى سعيدة' : 'Happy Memory') : (birthYear || '????') + ' — ' + (passingYear || '????')}
                  </div>
                </div>
              ) : (
                <div className="h-2 bg-gradient-to-r from-primary via-secondary to-tertiary"></div>
              )}

              {/* Theming Preview */}
              <div className={`p-5 ${themes.find(t => t.key === selectedTheme)?.cardClass || 'text-stone-900'} min-h-36`}>
                <span className="text-[9px] uppercase tracking-widest opacity-80 font-mono">
                  {relationshipEn || relationshipAr || (language === 'ar' ? 'قريب غالي' : 'Relationship')}
                </span>

                <h3 className="text-lg font-serif font-bold mt-1">
                  {language === 'ar' ? nameAr || 'اسم الغالي' : nameEn || 'Beloved Name'}
                </h3>

                {(lastWordsAr || lastWordsEn) && (
                  <blockquote className="text-[11px] italic font-serif mt-3 border-l pb-1 border-primary/20 bg-black/5 p-1.5 rounded">
                    "{language === 'ar' ? lastWordsAr || 'العبارة الأخيرة...' : lastWordsEn || 'The last message...'}"
                  </blockquote>
                )}
              </div>
            </div>

            {/* Supportive tip */}
            <div className="bg-surface-low p-4 rounded-xl text-[11px] text-stone-500 border border-surface-container leading-relaxed">
              <span className="font-semibold block mb-1">💡 {language === 'ar' ? 'فلسفة التصميم الشامل' : 'Serene Architecture Design'}</span>
              {language === 'ar'
                ? 'ندعم في منصة اللحظة الأخيرة اللغتين بشكل كامل ومتوازٍ. حتى لو كتبت اسماً بالإنجليزية، يمكنك الاستفادة من الصياغة العربية وعرض قالب هادئ خالي تماماً من الألوان الصارخة أو القاتمة.'
                : 'All fields dynamically sync. We strictly support off-white soothing tones and quiet typography pairings to construct a unified digital sanctuary.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
