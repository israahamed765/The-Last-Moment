import React, { useState } from 'react';
import { Post, User } from '../types';
import { X, Sparkles, Truck, ShieldCheck, Heart, FileText, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  currentUser: User | null;
  onAddOrder: (orderData: {
    userId: string;
    postId: string;
    productType: 'canvas' | 'book' | 'wooden_box';
    customTextOption: string;
    customerName: string;
    shippingAddress: string;
    phoneNumber: string;
    price: number;
  }) => Promise<boolean>;
}

const PRODUCTS_INFO = [
  { id: 'canvas' as const, price: 140 },
  { id: 'book' as const, price: 195 },
  { id: 'wooden_box' as const, price: 240 }
];

const PRODUCTS_AR: Record<string, Record<string, string>> = {
  canvas: {
    name: 'لوحة جدارية ممتدة على إطار خشبي فاخر',
    desc: 'طباعة كرتونية بجودة مذهلة مقاومة للزمن، ممتدة على خشب سويدي طبيعي لتعليقها بالمنزل لتبقى حاضرة في ناظريك.',
    tag: 'الأكثر مبيعاً 🖼️',
    time: 'شحن سريع خلال ٣-٥ أيام'
  },
  book: {
    name: 'كتاب الذكريات المطبوع بغلاف مخملي مقوى',
    desc: 'ألبوم فاخر يضم هذه الذكرى مع تصميم مخصص وتفاصيل وكلمات أصحابها، مطبوع بلمسة ناعمة وألوان دافئة مريحة ومهدئة.',
    tag: 'إصدار فاخر 📖',
    time: 'تنسيق وتجهيز وشحن خلال ٥-٧ أيام'
  },
  wooden_box: {
    name: 'صندوق الأثر التذكاري من الخشب الطبيعي المنقوش',
    desc: 'صندوق خشبي فاخر صُنع ومُنقش يدوياً بالليزر، لحفظ الأغراض الصغيرة، الصورة الأخيرة والرسائل المكتوبة بخط يد الراحلين بكرامة.',
    tag: 'صياغة يدوية دافئة 🪵',
    time: 'نحت يدوي مخصص وشحن تالٍ'
  }
};

const PRODUCTS_EN: Record<string, Record<string, string>> = {
  canvas: {
    name: 'Gilded Deluxe Wall Canvas Frame',
    desc: 'Museum-grade long-lasting printing stretched over natural Swiss pine wood blocks, making their noble smile permanent on your home walls.',
    tag: 'Best Seller 🖼️',
    time: 'Delivery in 3–5 business days'
  },
  book: {
    name: 'Gilded Velvet Soft-Touch Keepsake Book',
    desc: 'A gorgeous album containing documented details, pictures, and comforting words, crafted with extreme love and safe colors.',
    tag: 'Premium Edition 📖',
    time: 'Designed and shipped in 5–7 days'
  },
  wooden_box: {
    name: 'Laser-Engraved Walnut Wood Legacy Chest',
    desc: 'A premium wooden box handcrafted and laser-engraved for keeping small personal belonging, final letters, and comfort cards with high dignity.',
    tag: 'Artisanal Woodcraft 🪵',
    time: 'Custom carved & shipped soon'
  }
};

export function CheckoutModal({ isOpen, onClose, post, currentUser, onAddOrder }: CheckoutModalProps) {
  const { language, t } = useLanguage();
  const [productType, setProductType] = useState<'canvas' | 'book' | 'wooden_box'>('canvas');
  const [customTextOption, setCustomTextOption] = useState('');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen || !post) return null;

  const activeProductInfo = PRODUCTS_INFO.find(p => p.id === productType) || PRODUCTS_INFO[0];
  const activeProductLabel = language === 'ar' ? PRODUCTS_AR[productType] : PRODUCTS_EN[productType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert(language === 'ar' ? 'يرجى تسجيل الدخول أولاً لإتمام طلبك.' : 'Please sign in first to submit your order.');
      return;
    }
    if (!customerName || !shippingAddress || !phoneNumber) {
      alert(language === 'ar' ? 'يرجى ملء كافة تفاصيل المستلم وعنوان الشحن.' : 'Please fill all fields of recipient details and address.');
      return;
    }

    try {
      setSubmitting(true);
      const success = await onAddOrder({
        userId: currentUser.id,
        postId: post.id,
        productType,
        customTextOption: customTextOption || `نفس الأثر: ${post.title}`,
        customerName,
        shippingAddress,
        phoneNumber,
        price: activeProductInfo.price
      });

      if (success) {
        setDone(true);
        setTimeout(() => {
          setDone(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert(language === 'ar' ? 'حدث خطأ أثناء معالجة تفاصيل الطلب، يرجى المحاولة لاحقاً.' : 'A technical error occurred while placing order. Try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const alignClass = language === 'ar' ? 'text-right' : 'text-left';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/55 backdrop-blur-md transition-all">
      <div 
        className={`relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-warm-beige overflow-y-auto max-h-[95vh] ${alignClass}`}
        onClick={(e) => e.stopPropagation()}
        id="checkout-modal-card"
      >
        {/* Banner */}
        <div className="h-2.5 bg-gradient-to-r from-accent-gold via-accent-sage to-accent-gold" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-checkout-modal"
          className="absolute top-4 left-4 p-2 text-charcoal/60 hover:text-charcoal hover:bg-warm-bg rounded-full transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="p-10 text-center space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="text-emerald-600" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-charcoal">
                {language === 'ar' ? 'تم تسجيل طلب تخليد الأثر بنجاح!' : 'Keepsake order registered successfully!'}
              </h3>
              <p className="text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
                {language === 'ar' ? (
                  <>
                    شكراً لثقتكم بنا. لقد استلمنا طلب تحويل ذكرى <span className="font-semibold text-accent-gold">"{post.title}"</span> إلى منتج فيزيائي فاخر. فريق الصياغة والطباعة لدينا سيبدأ العمل بشغف مفرط وسهولة فائقة لشحنها لمنزلك قريباً.
                  </>
                ) : (
                  <>
                    Thank you. We have received your order to convert the memory of <span className="font-semibold text-accent-gold">"{post.title}"</span> to a printed keepsake. Our team will start crafting with highest passion and ship to your door soon.
                  </>
                )}
              </p>
            </div>
            <div className="bg-[#FAF8F2] p-4 rounded-xl border border-accent-gold/20 text-xs text-charcoal-light inline-block">
              🚚 {language === 'ar' 
                ? `سيتم إرسال تفاصيل الشحن ورمز التتبع لـ ${phoneNumber} فورا بعد تسليمها لشركة النقل.`
                : `Shipping details and tracker code will be dispatched to ${phoneNumber} once submitted to the post runner.`}
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-accent-gold/10 text-accent-gold-dark text-[10px] font-bold rounded-full mb-2 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                <Sparkles size={11} className="animate-spin" />
                <span>{language === 'ar' ? 'متجر تخليد الأثر المادي الإلكتروني' : 'Printed Legacy & Keepsake Marketplace'}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold font-serif text-charcoal">
                {language === 'ar' ? 'تحويل الذكرى اللطيفة إلى منتج ملموس' : 'Materialising Memories to Keepsakes'}
              </h3>
              <p className="text-charcoal-light/75 text-xs mt-1">
                {language === 'ar' ? (
                  <>
                    حول "أخر صورة" أو "أخر كلمات" لذكرى <strong className="text-charcoal font-semibold">({post.title})</strong> إلى هدية جدارية أو كتاب ذكريات فيزيائي فاخر يزيّن منزلك ويحافظ على دفء أثر الراحلين بوقار.
                  </>
                ) : (
                  <>
                    Convert the "last words" or "photograph" of <strong className="text-charcoal font-semibold">({post.title})</strong> to a custom gold-framed canvas or physical memory chest to remember them with dignity and warmth.
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Selection List */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-charcoal">
                  {language === 'ar' ? '١. اختر نوع المنتج المادي المفضل:' : '1. Choose your preferred physical item type:'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PRODUCTS_INFO.map((prod) => {
                    const isSelected = productType === prod.id;
                    const labels = language === 'ar' ? PRODUCTS_AR[prod.id] : PRODUCTS_EN[prod.id];
                    return (
                      <button
                        type="button"
                        key={prod.id}
                        onClick={() => setProductType(prod.id)}
                        className={`p-4 rounded-xl text-right border transition-all flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/40 border-accent-gold ring-1 ring-accent-gold/55'
                            : 'bg-white border-warm-beige hover:border-accent-gold/30'
                        }`}
                      >
                        <div className={`space-y-1 ${alignClass}`}>
                          <span className="text-[9px] font-bold text-accent-gold-dark block bg-accent-gold/5 px-2 py-0.5 rounded-full w-max mb-1">
                            {labels.tag}
                          </span>
                          <h4 className="text-xs font-bold text-charcoal leading-snug">{labels.name}</h4>
                          <p className="text-[10px] text-charcoal-light/80 leading-relaxed font-sans">{labels.desc}</p>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-warm-beige/60 flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-accent-gold font-serif">{prod.price} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                          <span className="text-[9px] text-charcoal-light/50 font-sans">{labels.time}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customizable Engraving Option */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  {language === 'ar' ? '٢. العبارة المراد نقشها/طباعتها على الأثر الملموس (اختياري):' : '2. Text or dedication to engrave on keepsake (optional):'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? `تلقائياً: "${post.title}" أو اكتب عبارة إهداء خاصة...` : `Default: "${post.title}" or write custom dedication...`}
                  value={customTextOption}
                  onChange={(e) => setCustomTextOption(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border border-warm-beige bg-warm-bg/25 text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/40 focus:border-accent-gold transition-all ${alignClass}`}
                />
              </div>

              {/* Shipping Form Grid */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-warm-beige space-y-4">
                <p className={`text-xs font-bold text-charcoal flex items-center gap-1 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <Truck size={14} className="text-accent-gold" />
                  <span>{language === 'ar' ? '٣. تفاصيل مستلم الشحنة والعنوان الدقيق للتوصيل:' : '3. Recipient details & precise shipping address:'}</span>
                </p>

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-3.5 ${alignClass}`}>
                  <div>
                    <label className="block text-[10px] font-semibold text-charcoal-light mb-1">
                      {language === 'ar' ? 'اسم المستلم ثلاثياً:' : 'Full name of recipient:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'ar' ? 'عبد الرحمن الشريف، سارة...' : 'e.g. Sarah J. Al-Mansoori'}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border border-warm-beige bg-white text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/20 ${alignClass}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-charcoal-light mb-1">
                      {language === 'ar' ? 'رقم جوال المستلم للتنسيق:' : 'Contact phone number:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={language === 'ar' ? '05xxxxxxxx أو +966...' : '+966-50-000-0000'}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border border-warm-beige bg-white text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/20 font-mono ${alignClass}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-charcoal-light mb-1">
                    {language === 'ar' ? 'عنوان الشحن وملاحظات التوصيل بالتفصيل:' : 'Detail address and city:'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ar' ? 'المدينة، الحي العائلي، الشارع، مبنى رقم... ' : 'City, Neighborhood, Street name, House number'}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border border-[#F1E0C5] bg-white text-charcoal text-xs font-sans focus:outline-none focus:ring-2 focus:ring-accent-gold/20 ${alignClass}`}
                  />
                </div>
              </div>

              <div className={`flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-warm-beige pt-4 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                <div className={`flex items-center gap-2 text-[10.5px] text-charcoal-light/70 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>{language === 'ar' ? 'بوابة دفع آمنة ومحمية بدعم الضمان الفضي.' : 'Secure connection. Payments backed by Silver Guarantee.'}</span>
                </div>

                <div className={`flex gap-2 w-full sm:w-auto ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-101 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{submitting ? (language === 'ar' ? 'جاري توثيق الدفع والشحن...' : 'Safeguarding transactions...') : (language === 'ar' ? `تأكيد شراء الأثر مقابل ${activeProductInfo.price} ر.س 💳` : `Confirm Keepsake at ${activeProductInfo.price} SAR 💳`)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-warm-beige text-charcoal/80 text-xs font-bold rounded-xl hover:bg-accent-gold/5 cursor-pointer"
                  >
                    {language === 'ar' ? 'تراجع' : 'Go Back'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
