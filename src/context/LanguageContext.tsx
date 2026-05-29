import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    appName: "اللحظة الأخيرة",
    appSubtitle: "توثيق الذكريات والكلمات الطيبة ممتدة الأثر",
    appDescription: "منصة وجدانية ناعمة لحفظ وداعات الراحلين، ذكرياتهم الأخيرة، دقات قلوبهم، وصدى كلماتهم الطيبة بكرامة تامة.",
    feedTab: "ساحة الذكريات",
    profileTab: "أرشيفي الشخصي",
    switchUser: "تغيير الحساب",
    logout: "خروج",
    loginGateway: "بوابة الدخول",
    
    // AuthOnboarding / Register / Login
    welcomeTitle: "أهلاً بك في فترات الذاكرة الدافئة",
    welcomeSubtitle: "يرجى تسجيل الدخول أو إثبات هويتك لحفظ مناداة الغائبين وتصفح الذكرى.",
    btnSignup: "البدء بإنشاء حساب جديد ✨",
    btnLogin: "تسجيل الدخول لحساب موجود بالفعل",
    demoAccountTitle: "أو تصفح سريعاً عبر الحسابات التجريبية للمنصة",
    demoAccountLabel: "انقر للدخول بحساب أحد الرواد في التوثيق:",
    visitDemo: "زيارة كرواد 👥",
    sslShield: "جميع الهويات والملفات تخضع لتشفير SSL دائم وحفظ مأمون.",
    loginHeader: "بوابة تسجيل الدخول",
    backBtn: "العودة للخلف",
    backToLogin: "العودة للدخول",
    emailOrUsername: "اسم المستخدم أو البريد الإلكتروني",
    emailOrUsernamePlaceholder: "أدخل بريدك الإلكتروني أو اسم المستخدم (مثال: sara_ahmad)",
    passwordLabel: "كلمة مرور الأثر الكرامي",
    passwordPlaceholder: "أدخل كلمة المرور السرية الخاصة بك",
    forgotPassLink: "هل نسيت كلمة المرور؟",
    btnConfirmLogin: "تأكيد تسجيل الدخول والولوج 🚪",
    noAccount: "ليس لديك حساب بعد؟",
    openAccountBtn: "افتح حساباً مشهوداً الآن",
    verifyIdentity: "جاري تأكيد الهوية...",
    
    // Signup
    signupSteps: "خطوة",
    emailLabel: "البريد الإلكتروني المعتمر",
    signupPassLabel: "كلمة مرور الأثر الكرامي (5 أحرف أو أكثر)",
    signupPassPlaceholder: "ادخل كلمة مرور غليظة مأمنة",
    confirmPassLabel: "تأكيد كلمة المرور",
    confirmPassPlaceholder: "كرر كتابة كلمة مرورك للتأمين",
    passwordsMatch: "✓ كلمات المرور متطابقة تماماً.",
    passwordsMismatch: "✗ كلمات المرور غير متوافقة حتى الآن.",
    fullNameLabel: "اسمك الكامل (بالعربية)",
    fullNamePlaceholder: "مثال: صالح الخالدي",
    usernameLabel: "اسم المستخدم الحصري (English/شرطات)",
    usernamePlaceholder: "saleh_99",
    usernameHint: "يستفاد منه في تعريف حسابك لزملائك (بأرقام وأحرف صغيرة وشرطة سفلية فقط).",
    usernameChecking: "جاري تدقيق الاسم...",
    usernameAvailable: "🟢 متاح ومميز للمنصة",
    usernameTaken: "🔴 هذا الاسم محجوز بالفعل",
    uploadPhotoLabel: "تحميل صورتك الشخصية الصادقة",
    dragDropPhoto: "اسحب صورتك هنا أو تصفح ملفاتك",
    photoHint: "الملف يجب أن يكون صورة صغيرة ويفضل مربّعة",
    avatarPickSubtitle: "أو حدد سريعاً أحد الشخصيات التعبيرية الدافئة للمنصة:",
    bioLabel: "اكتب نبذة وجدانية قصيرة عن روحك",
    bioPlaceholder: "نبذة تعبر عن حبك لتخليد اللحظات وحفظ الوفاء... (مثال: الوفاء هو عهد لا يزول بزوال الأجساد)",
    btnNextStep: "التقدم للخطوة التالية ➔",
    btnSaveAndLogin: "حفظ تسجيل الدخول والولوج 🌸",
    btnPrev: "خلف",
    alreadyHaveAccount: "تذكرت حسابك بالفعل؟",
    loginHere: "تسجيل الدخول هنا مباشر",
    signingUp: "جاري صياغة سجلّك...",
    
    // Forgot Password
    forgotHeader: "استعادة كلمة المرور المنسية",
    forgotInstructions: "اكتب بريدك الإلكتروني المسجل لدينا وسنرسل لك رابطاً مشفراً لإعادة صياغة كلمة مرورك الجديدة لتتمكن من الرجوع لتفاصيل الخزنة والآثار مستقبلاً.",
    btnSendRecovery: "إرسال رابط توثيق الاستعادة 📨",
    recoverySentTitle: "تم إرسال رابط التغيير بنجاح!",
    recoverySentBody: "أرسلنا للتو رابط إعادة تعيين مشفر بالبريد الإلكتروني. تفقد صندوقك البريدي الرئيسي والرسائل الترويجية لاستكمال التحديث وتأمين ذكرياتك.",
    confirmRecoveryGoToLogin: "تأكيد والذهاب لتسجيل الدخول",
    sendingRecoveryCode: "جاري إرسال رابط الأمان...",
    
    // Errors
    fieldsRequired: "يرجى ملء جميع الحقول المطلوبة.",
    loginFailed: "بيانات الدخول غير مطابقة؛ تحقق من صحة اسم الحساب والرمز.",
    networkError: "فشل الدخول؛ يرجى المحاولة لاحقاً.",
    passwordRequirements: "كلمة المرور يجب أن تكون ٥ أحرف أو أكثر لتأمين حسابك.",
    registerFieldsRequired: "يرجى ملء جميع الحقول ورفع صور صالحة.",
    registerUsernameTaken: "اسم المستخدم أو البريد الإلكتروني مستخدمين مسبقاً بالمنصة.",
    registerError: "حدث خطأ فني أثناء إنشاء الحساب، يرجى تكرار المحاولة.",
    passwordMismatchError: "كلمات المرور غير متوافقة؛ يرجى التحقق منها.",
    emailRequired: "الرجاء إدخال بريدك الإلكتروني أولاً.",
    forgotSuccess: "تم إرسال رابط إعادة التعيين بنجاح إلى بريدك الإلكتروني",
    
    // Feed Screen & Categories
    feedTitle: "آثار ممتدة عبر الزمن",
    feedSubtitle: "أوراق مطوية، نبرات دافئة، وصور غلّفها غياب الجسد وهطول الأثر الطيب.",
    btnWriteMemory: "كيف تود توثيق أثر وعهد اليوم؟ ✍️",
    createPostPlaceholder: "شاركنا ذكرى، رسالة، أو شعور طيب...",
    categories: {
      all: "الكل",
      people: "أشخاص",
      places: "أماكن",
      letters: "رسائل",
      memories: "ذكريات"
    },
    noPosts: "لم يتم تخليد أي آثر هنا في هذا التصنيف بعد. بادر بتدوين السجل الأول!",
    commentsCount: "رسائل المواساة والأثر الطيب ({count})",
    reactionTypes: {
      affect: "أثّر فيّ",
      legacy: "ذكرى طيبة",
      pray: "دعاء للراحلين"
    },
    isPrivatePost: "خزانة أثر حصرية مشفرة 🔒",
    premiumArchiveAlert: "لقد طلبت تخليد هذا الأثر في الخواتيم السرية المشفرة. الرجاء تفعيل ترقية الأرشيف الذهبي الممتد من القائمة الجانبية لتتمكن من تصفح خزانتك الخاصة الحصرية!",
    printMerchandiseBtn: "طباعة الأثر على مقتنيات ملموسة 🖼️",
    addCommentPlaceholder: "اكتب رسالة مواساة وربط دافئة وتفاعل مع الأثر...",
    addCommentBtn: "نشر كلمات الأثر الطيب والوفاء",
    premiumActiveBadge: "ميثاق الدائرة الذهبية 👑",
    premiumInActiveBadge: "مُوثق أثر قياسي",
    upgradeToPremiumBtn: "تفعيل الخزنة المشفرة والعضوية الفاخرة الممتدة 🔒",
    
    // Sidebar & Orders
    sidebarTitle: "الاشتراكات وتجسيم الآثار الجنائزية",
    premiumBoxTitle: "الخزانة الوجدانية المشفرة (فاخر)",
    premiumBoxDesc: "مأمن وجداني فائق الخصوصية لحفظ وصايا الراحلين ورسائلهم السرية بتشفير تام وفتح مبرمج ومؤجل.",
    checkoutSidebarTitle: "آخر الآثار المجسمة والطلبات الملموسة",
    noOrdersYet: "لم تقم بتمثيل أي لوحة أثر ملموسة بعد.",
    orderItemText: "تجسيم لوحة الأثر '{title}' إلى مقتنى {product}",
    orderStatusPending: "تحت مراجعة المصمم والخطاط اليدوي",
    orderStatusShipped: "تم الشحن مع وسيط التوصيل المأمون دائم الأثر",
    
    // CheckoutModal / Print Service
    checkoutTitle: "مَحْبِس صياغة الأثر الملموس واللوحات",
    checkoutSubtitle: "مبادرة وجدانية كريمة لتحويل آثار الراحلين والوصايا الرقمية إلى دفت ملموسة مذهّبة أو ألواح منقوشة بالخط العربي الفاخر.",
    selectProduct: "اختر شكل تجسيم الأثر الملموس:",
    productTypes: {
      canvas: "لوحة جدارية فاخرة بإطار برونزي (٣٥٠ ر.س)",
      book: "كتاب الذكريات الباقية مغلف بالقطيفة المذهبة (٤٩٠ ر.س)",
      wooden_box: "صندوق خشبي عتيق محفور بالليزر من خشب الجوز (٥٥٠ ر.س)"
    },
    customTextOptionLabel: "العبارة المطلوب خطها يدوياً بالذهب على الأثر الملموس:",
    customTextPlaceholder: "مثال: اللهم ارحم تلك الوجوه الطيبة، وأجمعنا بها في مستقر رحمتك.",
    shippingAddressLabel: "عنوان الشحن التفصيلي وبلد المستلم:",
    shippingAddressPlaceholder: "مثال: الرياض، حي حطين، شارع الوفاء الأبدي، منزل رقم ٧",
    customerNameLabel: "الاسم الكامل لمتلقي الأثر والطلب:",
    customerNamePlaceholder: "اكتب اسمك أو اسم من تود إرسال الهدية مجهولة المصدر له",
    phoneNumberLabel: "رقم جوال للتنسيق ومطابقة التسليم الوجداني:",
    phoneNumberPlaceholder: "مثال: +966500000000",
    orderPrice: "كلفة الأثر واللوحة (تشمل تخطيط الخطاط اليدوي الحصري):",
    btnSubmitOrder: "تأكيد الطلب ودفع رسوم صياغة الأثر 📦",
    orderSuccess: "تم تقديم طلب الأثر اليدوي بنجاح فائق! سنتصل بك لترتيب المعاينة قريباً.",
    orderFail: "عذراً، تعذّر قيد الطلب الفني في الوقت الحالي.",
    
    // CreatePostModal
    createPostTitle: "تخليد أثر أو وصية جديدة",
    createPostSubtitle: "اصنع نداءً ممتداً وبصمة طيبة ليخلّدها الزوار ويواسيها القادمون.",
    postTitleLabel: "عنوان الأثر أو الوصية المقامة",
    postTitlePlaceholder: "مثال: تأبين المربي الفاضل الأستاذ صالح الخالدي",
    postContentLabel: "متن الأثر بالتفصيل أو الوصية المباركة",
    postContentPlaceholder: "صِغ تفاصيل الأثر هنا بكلمات وجدانية صادقة ومأثورة...",
    postCategoryLabel: "تصنيف الأثر البشري أو المكاني والذكريات",
    postImageLabel: "رابط غلاف تعبيري دافئ (مثال: Unsplash أو رابط مباشر)",
    postImagePlaceholder: "ضع رابط صورة صلة دافئة (اختياري)",
    postPrivateLabel: "حفظ في الخزنة السرية المغلّقة 🔒",
    postPrivateHint: "لن يتمكن أحد من تصفحه أو الاطلاع عليه إلا بتفويض مشفر من ورثة العهد.",
    btnPublishPost: "نشر الأثر وتدوينه في لوح الخلود 🌸",
    
    // ProfileView Additions
    btnEditBio: "تعديل النبذة والهوية ✍️",
    statDocumented: "الآثار المخلدة",
    statImpact: "الأثر الوجداني",
    statPhotos: "الصور المحفوظة",
    btnSave: "حفظ التغييرات",
    btnCancel: "إلغاء",
    saving: "جاري حفظ ونقش التعديلات...",
    securityHeader: "إعدادات أمان الأثر وتغيير كلمة المرور",
    securitySub: "حدّث شفرة دخولك لتأمين أسرارك ووصاياك وخزائن ذكرياتك الممتدة.",
    passwordChangeSuccess: "تم تأمين وتحديث كلمة المرور بنجاح!",
    archiveTitle: "خزانة ذكرياتي السرية",
    interactionCount: "التفاعلات الصادقة",
    totalImpact: "مجموع الأثر الوجداني الملموس للراحلين",
    memoriesDocumented: "الآثار والودائع المخلدة بالمنصة",
    joinedAtLabel: "انضم لسجل التعازي بتاريخ:",
    editProfileBtn: "تعديل النبذة والهوية ✍️",
    personalIdentityBox: "أوراق الهوية والنبذة الوجدانية لـ {name}",
    saveChangesBtn: "حفظ التعديلات والتأصيل بالسجل 💾",
    viewPostAlt: "عرض وتدبر تفاصيل الأثر والرسائل المتاحة لـ",
    securityTitle: "🔐 إعدادات أمان الأثر وتحديث كلمة الدخول",
    securitySubtitle: "تحديث رمز الأثر السري لتأمين الوصايا والخزائن والودائع الرقمية الخاصة بك.",
    showPasswordForm: "إظهار بوابة تغيير كلمة المرور 🔑",
    hidePasswordForm: "إغلاق إطار الأمان ×",
    currentPasswordLabel: "كلمة المرور الحالية",
    currentPasswordPlaceholder: "الافتراضية: 123456",
    newPasswordLabel: "كلمة المرور الجديدة",
    newPasswordPlaceholder: "كلمة المرور الجديدة",
    confirmNewPasswordLabel: "تأكيد كلمة المرور الجديدة",
    confirmNewPasswordPlaceholder: "كرر كتابة كلمة المرور الجديدة",
    passwordMatchSuccess: "✓ الرموز الجديدة متطابقة بنسبة ١٠٠٪.",
    passwordMatchFail: "✗ الرموز مدخلة بشكل غير مطابق.",
    btnUpdatePassword: "حفظ وتأصيل التغيير 🔒",
    passwordUpdateSuccess: "تم تغيير وتأصيل كلمة المرور بنجاح تام وحمايتها بأمان!",
    passwordUpdateFail: "عذراً، كلمة المرور الحالية غير مطابقة للكلمة المسجّلة.",
    passwordRequirementsFail: "كلمة المرور الجديدة يجب أن تكون ٥ رموز على الأقل لحماية ملفاتك.",
    loadingProgress: "جاري استعادة سجل النداء الخالد...",
    appFooter: "اللحظة الأخيرة — مشروع إنساني لتخليد الأثر وحفظ دقات القلوب وصدى الكلمات.",
    appCopyright: "جميع الحقوق محفوظة © ٢٠٢٦. مصمم بعناية فائقة لتهدئة النفس وربط أواصر المحبة والذكريات.",
    loaderSubtitle: "يرجى الانتظار قليلاً بينما نفتح خزائن الأثر ونسترجع الكلمات الطيبة المتبقية...",
    
    // Bottom Nav & Notifications & UI Switch
    switchPrompt: "أو تصفح سريعاً عبر الحسابات التجريبية للمنصة",
    bottomHome: "الرئيسية",
    bottomNotifications: "الإشعارات",
    bottomCreate: "إضافة ذكرى",
    bottomProfile: "الملف الشخصي",
    notifTitle: "سجل الأثر والوارد الحاضر",
    notifSubtitle: "تتبع تفاعلات الزوار، رسائل المؤازرة، وعهود المتابعة لملف الذاكرة الخاص بك.",
    btnMarkAllRead: "تأكيد قراءة الكل ✓",
    btnClearAll: "تصفية السجل بالكامل 🗑️",
    notifEmptyState: "سجل تفاعلاتك فارغ تماماً حالياً. انشر المزيد من الآثار ليتفاعل معها الأحبة والمواسون.",
    notifJoinedPlatform: "انضم إلى سجل الذاكرة والعهد الخالد كعضو جديد.",
    notifFollowedYou: "بدأ بمتابعة أثرك وملفك الوجداني الآن.",
    notifReacted: "وضع تفاعل بـ ({react}) على أثرك المخلد:",
    notifCommented: "ترك رسالة مؤازرة دافئة على أثرك:",
    textJustNow: "الآن",
    textMinutesAgo: "منذ {count} دقيقة",
    textHoursAgo: "منذ {count} ساعة",
    textDaysAgo: "منذ {count} يوم",
    toastNewNotif: "تفاعل وجداني جديد وارد 🌟",
    btnFollow: "متابعة الأثر 👤",
    btnFollowing: "متابع للعهد ✓"
  },
  en: {
    appName: "The Last Moment",
    appSubtitle: "Documenting Memories & Lifelong Kind Echoes",
    appDescription: "An empathetic digital sanctuary to preserve the parting words, memories, heartbeats, and echoes of loved ones with absolute dignity.",
    feedTab: "Memory Square",
    profileTab: "My Archive",
    switchUser: "Switch Account",
    logout: "Log Out",
    loginGateway: "Access Gateway",
    
    // AuthOnboarding / Register / Login
    welcomeTitle: "Welcome to Warm Memory Lanes",
    welcomeSubtitle: "Please sign in or identify yourself to preserve the echoes of those who passed and browse the memories.",
    btnSignup: "Start with a New Account ✨",
    btnLogin: "Login to an Existing Account",
    demoAccountTitle: "Or quickly browse via demo accounts of the platform",
    demoAccountLabel: "Click to sign in with one of our pioneer chroniclers:",
    visitDemo: "Enter as Pioneer 👥",
    sslShield: "All identities and files are protected with continuous SSL encryption and safe storage.",
    loginHeader: "Login Gate",
    backBtn: "Go Back",
    backToLogin: "Back to Login",
    emailOrUsername: "Username or Email Address",
    emailOrUsernamePlaceholder: "Enter your email or username (e.g., sara_ahmad)",
    passwordLabel: "Echo Security Password",
    passwordPlaceholder: "Enter your secure secret password",
    forgotPassLink: "Forgot Password?",
    btnConfirmLogin: "Confirm & Enter Pathway 🚪",
    noAccount: "Don't have an account yet?",
    openAccountBtn: "Open an Account Now",
    verifyIdentity: "Verifying credentials...",
    
    // Signup
    signupSteps: "Step",
    emailLabel: "Registered Email Address",
    signupPassLabel: "Echo Security Password (5 characters minimum)",
    signupPassPlaceholder: "Enter a strong, secure password",
    confirmPassLabel: "Confirm Password",
    confirmPassPlaceholder: "Repeat password for reassurance",
    passwordsMatch: "✓ Passwords match perfectly.",
    passwordsMismatch: "✗ Passwords do not match yet.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Example: Saleh Al-Khalidi",
    usernameLabel: "Unique Username (lowercase, underscores)",
    usernamePlaceholder: "saleh_99",
    usernameHint: "Used to define your account for colleagues (lowercase letters, numbers, and underscores only).",
    usernameChecking: "Verifying availability...",
    usernameAvailable: "🟢 Available on the platform",
    usernameTaken: "🔴 This username is already taken",
    uploadPhotoLabel: "Upload Your Faithful Public Photo",
    dragDropPhoto: "Drag your picture here or browse your files",
    photoHint: "The file must be a small image, preferably square",
    avatarPickSubtitle: "Or quickly select one of the warm expressive characters:",
    bioLabel: "Write a short soulful biography of your spirit",
    bioPlaceholder: "A short bio expressing your appreciation for preserving the memories... (e.g., Loyalty is a covenant that never expires)",
    btnNextStep: "Next Step ➔",
    btnSaveAndLogin: "Save Details & Enter 🌸",
    btnPrev: "Back",
    alreadyHaveAccount: "Remembered your account already?",
    loginHere: "Login here directly",
    signingUp: "Drafting your record...",
    
    // Forgot Password
    forgotHeader: "Recover Forgot Password",
    forgotInstructions: "Write your registered email and we will send you an encrypted link to reset your password so you can return to your vault and archives later.",
    btnSendRecovery: "Send Recovery Link 📨",
    recoverySentTitle: "Recovery Link Sent Successfully!",
    recoverySentBody: "We have just sent an encrypted reset link to your email. Check your primary inbox and spam folder to complete the update.",
    confirmRecoveryGoToLogin: "Confirm & Go to Login",
    sendingRecoveryCode: "Sending security link...",
    
    // Errors
    fieldsRequired: "Please fill in all requested fields.",
    loginFailed: "Credentials do not match; verify spelling of username and password.",
    networkError: "Connection failed; please try again later.",
    passwordRequirements: "Password must be at least 5 characters to secure your account.",
    registerFieldsRequired: "Please fill in all required fields and upload a valid image.",
    registerUsernameTaken: "Username or Email address already registered on the platform.",
    registerError: "Technical error while registering; please try again.",
    passwordMismatchError: "Passwords do not match; please check them.",
    emailRequired: "Please enter your email address first.",
    forgotSuccess: "A recovery link has been safely dispatched to your email address.",
    
    // Feed Screen & Categories
    feedTitle: "Enduring Echoes over Time",
    feedSubtitle: "Folded letters, warm sounds, and photographs enveloped in physical absence but glowing with gentle legacies.",
    btnWriteMemory: "How do you wish to document today's echo & legacy? ✍️",
    createPostPlaceholder: "Share a memory, a message, or a kind feeling with us...",
    categories: {
      all: "All",
      people: "People",
      places: "Places",
      letters: "Letters",
      memories: "Memories"
    },
    noPosts: "No legacy has been documented under this category yet. Be the first to start the record!",
    commentsCount: "Comfort & Support Letters ({count})",
    reactionTypes: {
      affect: "Impacted Me",
      legacy: "Noble Legacy",
      pray: "Pray for Departed"
    },
    isPrivatePost: "Encrypted Digital Private Vault 🔒",
    premiumArchiveAlert: "You requested to save this memory in the encrypted private vault. Please activate the Premium Archive from the sidebar to browse and inspect your exclusive vault!",
    printMerchandiseBtn: "Print echo on physical keepsakes 🖼️",
    addCommentPlaceholder: "Write a kind support message of comfort...",
    addCommentBtn: "Post Supportive Words",
    premiumActiveBadge: "Golden Circle Covenant 👑",
    premiumInActiveBadge: "Standard Legacy User",
    upgradeToPremiumBtn: "Activate Digital Vault & Premium Membership 🔒",
    
    // Sidebar & Orders
    sidebarTitle: "Membership & Elegant Printing",
    premiumBoxTitle: "Encrypted Empathetic Vault (Premium)",
    premiumBoxDesc: "A secure sanctuary to save wills of the departed and secret messages with full encryption and delayed opening.",
    checkoutSidebarTitle: "Recent Printed Empathic Orders",
    noOrdersYet: "No printed wall keepsakes requested yet.",
    orderItemText: "Transform memory '{title}' into physical {product}",
    orderStatusPending: "Under designer review & fine manual calligraphy",
    orderStatusShipped: "Shipped with secure courier",
    
    // CheckoutModal / Print Service
    checkoutTitle: "Physical Keepsake Printing Forge",
    checkoutSubtitle: "An empathetic initiative to transform digital memories and parting words into premium wooden carvings or gilded books with hand-drawn gold Arabic calligraphy.",
    selectProduct: "Choose the type of physical keepsake product:",
    productTypes: {
      canvas: "Deluxe framed wall canvas (350 SAR)",
      book: "Gilded velvet-covered memory book (490 SAR)",
      wooden_box: "Laser-engraved vintage walnut wood box (550 SAR)"
    },
    customTextOptionLabel: "Desired engraved text in premium gold Arabic calligraphy:",
    customTextPlaceholder: "Example: May God embrace their gentle souls, and unite us in eternal chambers.",
    shippingAddressLabel: "Detailed shipping address and recipient country:",
    shippingAddressPlaceholder: "Example: Riyadh, Hittin District, Legacy St, House No. 7",
    customerNameLabel: "Pioneer Recipient Full Name:",
    customerNamePlaceholder: "Write your name or the actual shipment recipient name",
    phoneNumberLabel: "Contact Phone Number for delivery coordination:",
    phoneNumberPlaceholder: "Example: +966500000000",
    orderPrice: "Total Keep value (includes master handmade calligraphy):",
    btnSubmitOrder: "Confirm Order & Pay Legacy Printing 📦",
    orderSuccess: "Empathetic order submitted successfully! We will contact you soon with delivery details.",
    orderFail: "Sorry, we could not complete your printed order at this time.",
    
    // CreatePostModal
    createPostTitle: "Immortalize a New Memory or Will",
    createPostSubtitle: "Create an enduring echo to be read and cherished by comforting visitors.",
    postTitleLabel: "Title of the Echo or Will",
    postTitlePlaceholder: "Example: A tribute to teacher of generations Saleh",
    postContentLabel: "Detailed text of the echo, testament, or parting thoughts",
    postContentPlaceholder: "Draft the details of the chronicle here in beautiful words...",
    postCategoryLabel: "Category of the Human or Spatial Echo",
    postImageLabel: "Warm expressive cover photo link (Unsplash or direct URL)",
    postImagePlaceholder: "Provide a warm image URL (optional)",
    postPrivateLabel: "Lock in premium encrypted private vault 🔒",
    postPrivateHint: "No one will be able to view it except through authenticated digital authorization from the family.",
    btnPublishPost: "Publish Echo & Imprint on Log of Eternity 🌸",
    
    // ProfileView Additions
    btnEditBio: "Edit Bio & Details ✍️",
    statDocumented: "Documented Memories",
    statImpact: "Empathetic Impact",
    statPhotos: "Preserved Images",
    btnSave: "Save Changes",
    btnCancel: "Cancel",
    saving: "Saving changes...",
    securityHeader: "Legacy Security Settings & Password Update",
    securitySub: "Update your echo password to secure your digital vaults and testaments.",
    passwordChangeSuccess: "Password updated and safely sealed!",
    archiveTitle: "Private Memory Archive",
    interactionCount: "Overwhelming Reactions",
    totalImpact: "Total Impressive Legacy Impact",
    memoriesDocumented: "Immortal Legacies Documented",
    joinedAtLabel: "Joined the record on:",
    editProfileBtn: "Edit Bio & Details ✍️",
    personalIdentityBox: "Identity details and empathetic bio for {name}",
    saveChangesBtn: "Save Changes & Commit to Record 💾",
    viewPostAlt: "View and explore details of this memory",
    securityTitle: "🔐 Legacy Security Settings & Password Update",
    securitySubtitle: "Update your echo password to secure your digital vaults and testaments.",
    showPasswordForm: "Show Password Reset Gate 🔑",
    hidePasswordForm: "Hide Security Frame ×",
    currentPasswordLabel: "Current Password",
    currentPasswordPlaceholder: "Default: 123456",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "New secret gate code",
    confirmNewPasswordLabel: "Confirm New Password",
    confirmNewPasswordPlaceholder: "Repeat your secret code",
    passwordMatchSuccess: "✓ New passwords match 100%.",
    passwordMatchFail: "An object error has occurred: Passwords mismatch.",
    btnUpdatePassword: "Save & Lock Changes 🔒",
    passwordUpdateSuccess: "Password updated and safely sealed!",
    passwordUpdateFail: "Sorry, the current password does not match.",
    passwordRequirementsFail: "New password must be at least 5 characters to secure your biography.",
    loadingProgress: "Restoring the everlasting calling log...",
    appFooter: "The Last Moment — A social humanistic project to immortalize echoes, heartbeats, and parting memoirs.",
    appCopyright: "All rights reserved © 2026. Designed with extreme devotion to comfort spirits and bridges of memory.",
    loaderSubtitle: "Please wait a moment while we retrieve the legacy archives and compile the kind remaining words...",
    
    // Bottom Nav & Notifications & UI Switch
    switchPrompt: "Or browse in trial mode via demo chroniclers:",
    bottomHome: "Home",
    bottomNotifications: "Notifications",
    bottomCreate: "Add Memory",
    bottomProfile: "Profile",
    notifTitle: "Incoming Impact & Echoes",
    notifSubtitle: "Explore interactions, kind supportive comments, and following covenants on your digital memorial.",
    btnMarkAllRead: "Mark all as read ✓",
    btnClearAll: "Clear entire log 🗑️",
    notifEmptyState: "Your notification logs are empty. Share more memories to draw compassionate responses.",
    notifJoinedPlatform: "joined the memorial as a new companion chronicler.",
    notifFollowedYou: "started following your soulful profile and memory lane.",
    notifReacted: "shared a ({react}) reaction on your documented memory:",
    notifCommented: "left a warm comforting message on your legacy:",
    textJustNow: "Just now",
    textMinutesAgo: "{count}m ago",
    textHoursAgo: "{count}h ago",
    textDaysAgo: "{count}d ago",
    toastNewNotif: "New compassionate response received 🌟",
    btnFollow: "Follow Legacy 👤",
    btnFollowing: "Following ✓"
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['ar']) => any;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('last_moment_lang');
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
    } else {
      setLanguageState('ar');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('last_moment_lang', lang);
  };

  const t = (key: keyof typeof translations['ar']): any => {
    const translationSet = translations[language] || translations['ar'];
    return translationSet[key] ?? translations['ar'][key] ?? key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Dynamic document properties for accessibility layout
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Set appropriate font family
    if (language === 'ar') {
      document.body.style.fontFamily = "'Cairo', 'Inter', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
