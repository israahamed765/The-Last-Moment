import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Memorial, Prayer, MemorialCategory, MemorialTheme, SolaceMessage, CreatorProfile, ContributionEvent, MemorialNotification, ChatMessage, ChatConversation } from './src/types';

dotenv.config();

// Lazy initialization logic for Gemini API to prevent crash at startup if key is missing
let aiClient: any = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set your key in the Secrets panel.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory Creators Database matching user's visual reference
let creators: CreatorProfile[] = [
  {
    id: 'clara-windham',
    nameEn: 'Clara Windham',
    nameAr: 'كلارا ويندهام',
    roleEn: 'Legacy Guardian',
    roleAr: 'حارسة الإرث العتيق',
    bioEn: 'Archivist of family echoes and silent stories. Keeping the memories of the Windham lineage vibrant and eternal.',
    bioAr: 'أخصائية أرشفة أصداء العائلة والقصص الصامتة. أسعى لإبقاء ذكريات عائلة ويندهام نابضة بالحياة وحية في وجدان الأجيال المتعاقبة.',
    avatar: '👩‍🦳',
    memorialsCount: 3,
    contributionsCount: 142,
    remembrancesCount: 1200,
    followers: ['Ahmed Supporter', 'سهام علي'],
    contributionsHistory: [
      {
        id: 'ch1',
        type: 'memorial_created',
        descriptionEn: "You established the eternal archive for 'Prof. Amin Al-Ghandour'.",
        descriptionAr: "لقد أسستِ مزار النصب التذكاري للأستاذ الدكتور 'أمين الغندور'.",
        timeAgoEn: '2 days ago',
        timeAgoAr: 'قبل يومين'
      },
      {
        id: 'ch2',
        type: 'photo_added',
        descriptionEn: "Added 'The Old Oak' photograph to the Legacy Gallery.",
        descriptionAr: "تمت إضافة صورة 'البلوط العتيق' إلى معرض الإرث والنصب التاريخي.",
        timeAgoEn: 'Last week',
        timeAgoAr: 'الأسبوع الماضي'
      }
    ]
  },
  {
    id: 'khaled-jamil',
    nameEn: 'Khaled Jamil',
    nameAr: 'خالد جميل',
    roleEn: 'Honorary Keeper',
    roleAr: 'حارس شرفي في المحراب',
    bioEn: 'Dedicated to remembering those who paved the roads of literature and social service, helping neighbors keep their lineage safe.',
    bioAr: 'مكرّس لحفظ خطى الراحلين الذين ردموا فجوات الفقر، وساعدوا المجتمع على تجاوز الآلام بشهامة ونقاء السريرة.',
    avatar: '👨‍💼',
    memorialsCount: 1,
    contributionsCount: 48,
    remembrancesCount: 410,
    followers: ['Clara Windham'],
    contributionsHistory: [
      {
        id: 'ch3',
        type: 'candle_lit',
        descriptionEn: 'Kindled a persistent beacon on Fatima Al-Marzouqiya’s memory.',
        descriptionAr: 'أوقد شمعة تضامن أبدية لنحراب الفقيدة الحاجة فاطمة المرزوقية.',
        timeAgoEn: '3 days ago',
        timeAgoAr: 'قبل ٣ أيام'
      }
    ]
  },
  {
    id: 'seham-ali',
    nameEn: 'Seham Ali',
    nameAr: 'سهام علي',
    roleEn: 'Peace Companion',
    roleAr: 'رفيقة السكينة والمواساة',
    bioEn: 'Finding healing through soft lines of prayers and beautiful, comforting words of condolences in times of transition.',
    bioAr: 'شغوفة بنسج خيوط السكينة عبر الكلمات المؤثرة والأدعية العامة الصادقة، ساعية لتخفيف وطأة آلام الفراق الصعبة.',
    avatar: '👩‍⚕️',
    memorialsCount: 1,
    contributionsCount: 79,
    remembrancesCount: 650,
    followers: ['Khaled Jamil'],
    contributionsHistory: [
      {
        id: 'ch4',
        type: 'prayer_posted',
        descriptionEn: 'Contributed a solemn prayer of mercy for Sami Al-Haddad.',
        descriptionAr: 'كتبت دعاءً بليغاً يفيض طهرًا ونوراً لروح المهندس سامي الحداد.',
        timeAgoEn: '10 mins ago',
        timeAgoAr: 'قبل ١٠ دقائق'
      }
    ]
  }
];

// In-memory Notifications database matching 'Reflections & Updates' visual reference
let notifications: MemorialNotification[] = [
  {
    id: 'n1',
    titleEn: 'Someone left a flower on your memorial',
    titleAr: 'قام أحدهم بوضع زهرة على نصبك التذكاري',
    descriptionEn: "A visitor placed a white lily on Clara Miller's digital sanctuary.",
    descriptionAr: "قام زائر بوضع زهرة زنبق بيضاء نقية في الملاذ الرقمي للمرحومة كلارا ميلر.",
    timeEn: 'Just now',
    timeAr: 'الآن',
    type: 'candle',
    read: false,
    actionLabelEn: 'View Tribute',
    actionLabelAr: 'عرض الإشهار',
    extraActionLabelEn: 'Send Thanks',
    extraActionLabelAr: 'إرسال شكر'
  },
  {
    id: 'n2',
    titleEn: "New comment on Arthur Sterling's legacy",
    titleAr: 'تعليق جديد على إرث الفقيد آرثر ستيرلينغ',
    descriptionEn: '"Arthur was a mentor to many. His wisdom continues to guide me every day..."',
    descriptionAr: '"لقد كان آرثر مرشداً ومعلماً لكثيرين. لا يزال ينبوع حكمته ينير طريقي في كل خطوة..."',
    timeEn: '2 hours ago',
    timeAr: 'قبل ساعتين',
    type: 'comment',
    read: false,
    actionLabelEn: 'Read More',
    actionLabelAr: 'قراءة المزيد',
    extraActionLabelEn: 'Reply',
    extraActionLabelAr: 'رد'
  },
  {
    id: 'n3',
    titleEn: 'Your memorial for Elias Thorne has been published',
    titleAr: 'تم نشر مزار الذكرى الخاص بالفقيد إلياس ثورن',
    descriptionEn: 'The legacy page is now live and ready for family and friends to contribute memories.',
    descriptionAr: 'أصبح مزار الذكرى نشطاً الآن وجاهزاً ليستقبل أدعية وصور وتذكار عائلته وأصدقائه الأوفياء.',
    timeEn: 'Yesterday',
    timeAr: 'بالأمس',
    type: 'publish',
    read: true,
    actionLabelEn: 'View Page',
    actionLabelAr: 'عرض الصفحة',
    extraActionLabelEn: 'Invite Others',
    extraActionLabelAr: 'دعوة الآخرين'
  },
  {
    id: 'n4',
    titleEn: 'Donation received in memory of Sarah Vance',
    titleAr: 'تبرع وارد تخليداً لذكرى الفقيدة سارة فانس',
    descriptionEn: "A contribution has been made to the 'Eternal Woods' foundation in Sarah's name.",
    descriptionAr: "تم تقديم مساهمة صدقة جارية باسم الفقيدة سارة لصالح مؤسسة 'الغابات الخالدة' الخيرية.",
    timeEn: '2 days ago',
    timeAr: 'قبل يومين',
    type: 'donation',
    read: true,
    actionLabelEn: 'Acknowledgment',
    actionLabelAr: 'بطاقة شكر وعرفان'
  }
];

// In-memory Sanctuary Chat conversations database matching 'Sanctuary Chat' visual reference
let conversations: ChatConversation[] = [
  {
    id: 'elena-vance',
    userNameEn: 'Elena Vance',
    userNameAr: 'إيلينا فانس',
    userAvatar: '👩',
    statusEn: 'Active Now',
    statusAr: 'نشط الآن',
    lastMessageEn: 'The legacy gallery is almost complete. Should we publish the final chapter tomorrow?',
    lastMessageAr: 'معرض الذكريات شارف على الاكتمال. هل نقوم بنشر الفصل الختامي الطاهر غداً؟',
    lastMessageTime: '12:45 PM',
    messages: [
      {
        id: 'msg1',
        sender: 'other',
        textEn: "I was just looking through the guestbook today. The words people wrote about Arthur are so incredibly moving. Have you seen the latest entries?",
        textAr: "كنت أتصفح سجل الزوار الخالد اليوم. الكلمات المكتوبة في حق آرثر تفيض بالمشاعر والصدق وتحرك النفوس. هل قرأت الإدخالات الأخيرة؟",
        time: '11:20 AM'
      },
      {
        id: 'msg2',
        sender: 'me',
        textEn: "I haven't had a chance this morning. It's heartening to see how many lives he touched. The memorial looks beautiful with the new photos you added.",
        textAr: "لم تسنح لي الفرصة هذا الصباح بعد. إنه لأمر يثلج الصدر أن نرى كم النفوس التي لامسها نبل أخلاقه. المزار يبدو رائعاً الجمال بالصور الجديدة التي أضفتها.",
        time: '11:25 AM'
      },
      {
        id: 'msg3',
        sender: 'other',
        textEn: "I'm so glad. I wanted it to feel like a quiet garden where people could just sit and reflect. It's a sanctuary for us now.",
        textAr: "أنا سعيدة جداً بسماع ذلك. أردت دوماً أن يكون المزار كحديقة وارفة الظلال يستريح فيها العابر وينهل السكينة والتفكر. إنه ملاذنا الآمن الآن.",
        time: '11:30 AM'
      },
      {
        id: 'msg4',
        sender: 'other',
        textEn: "The legacy gallery is almost complete. Should we publish the final chapter tomorrow?",
        textAr: "معرض الذكريات شارف على الاكتمال. هل نقوم بنشر الفصل الختامي الطاهر غداً؟",
        time: '12:45 PM'
      }
    ]
  },
  {
    id: 'thomas-wright',
    userNameEn: 'Thomas Wright',
    userNameAr: 'توماس رايت',
    userAvatar: '👴',
    statusEn: 'Yesterday',
    statusAr: 'بالأمس',
    lastMessageEn: 'Thank you for sharing those photos.',
    lastMessageAr: 'شكراً لك على مشاركة تلك الصور الدافئة.',
    lastMessageTime: 'Yesterday',
    messages: [
      {
        id: 'msg_t1',
        sender: 'other',
        textEn: "Thank you for sharing those photos. They remind us of the golden days.",
        textAr: "شكراً لك على مشاركة تلك الصور الدافئة. لقد نفضت الغبار عن أيامنا الذهبية وحنين السنين.",
        time: 'Yesterday'
      }
    ]
  },
  {
    id: 'marcus-legacy',
    userNameEn: 'Marcus Legacy Fund',
    userNameAr: 'صندوق ماركوس للخيرات',
    userAvatar: '🏛️',
    statusEn: 'Tue',
    statusAr: 'الثلاثاء',
    lastMessageEn: 'The scholarship has been finalized.',
    lastMessageAr: 'تم تأكيد واعتماد المنحة التعليمية الخيرية.',
    lastMessageTime: 'Tue',
    messages: [
      {
        id: 'msg_m1',
        sender: 'other',
        textEn: "The scholarship has been finalized. It is now open in Arthur Windham's name.",
        textAr: "تم إنهاء وتأكيد المنحة التعليمية الخيرية باسم الفقيد الغالي آرثر ويندهام. البوابة مفتوحة ومستعدة لتلقي طلبات النابغين.",
        time: 'Tue'
      }
    ]
  }
];

// In-memory Database with touching, realistic memorial posts in English & Arabic
let memorials: Memorial[] = [
  {
    id: 'amin-ghandour',
    nameEn: 'Prof. Amin Al-Ghandour',
    nameAr: 'أ.د. أمين الغندور',
    relationshipEn: 'Academic Mentor & Scholar',
    relationshipAr: 'أستاذ ومربي دكتور',
    birthYear: '1948',
    passingYear: '2023',
    category: 'wisdom',
    lastWordsEn: 'Protect the sacred spark of knowledge in your hearts, and let love guide how you teach. Your students are your eternal garden.',
    lastWordsAr: 'احموا شعلة العلم المقدسة في قلوبكم، واجعلوا المحبة دليلكم في التعليم. طلابكم هم بستانكم الأبدي المورق بالدعوات.',
    storyEn: 'A devoted professor of classical literature for 45 years. He lectured until his very last week, leaving behind generations of thinkers, writers, and change-makers whom he treated as his own children.',
    storyAr: 'أستاذ الأدب الكلاسيكي الملهم لأكثر من 45 عاماً. واصل محاضراته بشغف حتى أسبوعه الأخير، تاركاً إرثاً عظيماً من المثقفين والكتاب الذين كان يعاملهم كأبنائه وبناته بكل عطف وأبوة.',
    theme: 'starry',
    image: 'stars',
    candlesCount: 142,
    candlesLitBy: ['Yousef', 'Leila', 'Dr. Miriam', 'Amir', 'Tariq', 'Sarah'],
    prayers: [
      {
        id: 'p1',
        author: 'Sarah Q.',
        relationship: 'Former Student',
        text: 'May your light continue to guide us from the eternal skies. You did not just teach us grammar; you taught us how to live with grand honesty.',
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'p2',
        author: 'طارق غسان',
        relationship: 'زميل وباحث',
        text: 'رحمك الله يا معلم الأجيال. غبت عنا جسداً، وبقيت غراسك يانعة في عقول آلاف الباحثين في أصقاع الأرض.',
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString(),
    creatorId: 'clara-windham',
    creatorName: 'Clara Windham'
  },
  {
    id: 'fatima-marzouq',
    nameEn: 'Fatima Al-Marzouqiya',
    nameAr: 'الحاجة فاطمة المرزوقية',
    relationshipEn: 'Beloved Grandmother & Matriarch',
    relationshipAr: 'جدة وأم العائلة الحنونة',
    birthYear: '1935',
    passingYear: '2024',
    category: 'grace',
    lastWordsEn: 'Always make sure the bread on your table is shared with neighbors, and never go to sleep harbor-holding heavy grudges in your chests.',
    lastWordsAr: 'احرصوا دائماً على أن يكون الخبز على مائدتكم مشتركاً مع جيرانكم ومحبيكم، ولا تناموا وفي صدروكم غلّ أو عتب على أحد.',
    storyEn: 'The heartbeat of our family in the old quarter. Famous for her massive wooden kneading bowl, she baked fresh bread for neighbors every single Friday morning for 50 years with absolute grace.',
    storyAr: 'نبض العائلة والحي القديم بأكمله. اشتهرت بوعائها الخشبي الكبير للعجين، وكانت تخبز الخبز الساخن وتوزعه على جيرانها كل صباح جمعة بلا كلل طوال 50 عاماً بابتسامة تفيض محبة وسلاماً.',
    theme: 'meadow',
    image: 'lotus',
    candlesCount: 231,
    candlesLitBy: ['Rawan', 'Farid', 'Jamil', 'Fatma Junior', 'Amina'],
    prayers: [
      {
        id: 'p3',
        author: 'عادل السعيد',
        relationship: 'جار قديم',
        text: 'كانت رائحة خبزها توقظ نفوس الحي وتداوي قلوبنا المتعبة قبل أجسادنا. نسأل الله لها فراديس الرحمة ونوراً دائماً لا ينطفئ.',
        createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    creatorId: 'khaled-jamil',
    creatorName: 'Khaled Jamil'
  },
  {
    id: 'sami-haddad',
    nameEn: 'Sami Al-Haddad',
    nameAr: 'المهندس سامي الحداد',
    relationshipEn: 'Architect of Compassion',
    relationshipAr: 'مصمم صروح السكينة',
    birthYear: '1970',
    passingYear: '2024',
    category: 'legacy',
    lastWordsEn: 'Build spaces of peace and shelter, not structure towers of prestige. True beauty of design is measured by the protection it gives the poor.',
    lastWordsAr: 'ابنوا مساحات للسكينة والتعلم، لا صروحاً خاوية لعلامات التباهي والرفعة. جمال الهندسة الحقيقي يُقاس بمقدار الدفء الذي تحمله للمحتاجين والفقراء.',
    storyEn: 'An award-winning architect who walked away from corporate high-rises to establish a humanitarian studio. He designed and built over twenty thermal mud schools and public clinics in marginalized villages.',
    storyAr: 'مهندس دؤوب نال جوائز مرموقة لكنه هجر ناطحات السحاب التجارية ليؤسس مرسماً للعمارة الإنسانية. صمم وشيد أكثر من عشرين مدرسة طينية وصحية معزولة حرارياً في القرى النائية والمنسية.',
    theme: 'sunset',
    image: 'sunset',
    candlesCount: 97,
    candlesLitBy: ['Faisal', 'Zuhair', 'Eng. Omar', 'Mariam Khaled'],
    prayers: [],
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    creatorId: 'seham-ali',
    creatorName: 'Seham Ali'
  },
  {
    id: 'highclere',
    nameEn: 'The Summer at Highclere',
    nameAr: 'الصيف في هايكلير',
    relationshipEn: 'Cherished Family Estate',
    relationshipAr: 'إرث العائلة العتيق',
    birthYear: '1920',
    passingYear: '2023',
    category: 'grace',
    lastWordsEn: 'Let the conservatory be filled with the scent of lilies every summer.',
    lastWordsAr: 'اجعلوا شرفة الزهور تمتزج دوماً برائحة الزنابق الرقيقة عبيراً يخلد الصيف.',
    storyEn: 'Remembering the way the light hit the conservatory glass every August evening. A sanctuary of peace and laughter.',
    storyAr: 'مستذكرين تلك اللحظات الساحرة التي تداعب فيها أشعة شمس آب زجاج الممر الشتوي، تاركةً خلفها ظلالاً من البهجة والسلام العائلي الدافئ.',
    theme: 'meadow',
    image: 'lily',
    candlesCount: 452,
    candlesLitBy: ['Clara Windham', 'Arthur', 'Edward', 'Robert'],
    prayers: [],
    createdAt: new Date('2023-10-12').toISOString(),
    creatorId: 'clara-windham',
    creatorName: 'Clara Windham'
  },
  {
    id: 'arthur-voyage',
    nameEn: "Arthur's Final Voyage",
    nameAr: 'رحلة آرثر الأخيرة',
    relationshipEn: 'Arthur Windham',
    relationshipAr: 'آرثر ويندهام',
    birthYear: '1945',
    passingYear: '2023',
    category: 'farewell',
    lastWordsEn: 'Rest in the eternal tide of peace.',
    lastWordsAr: 'أرقد الآن في ملكوت البحار المسترخية وسكينة الموج الأبدي.',
    storyEn: "Captain Windham's love for the sea wasn't just a career, it was his soul. Rest in the eternal tide.",
    storyAr: 'لم يكن حب القبطان آرثر للبحر ومسافاته مجرد مهنة طارئة، بل كان النبض الأعمق لروحه السامية. نرجو له السلام الدائم بين أحضان الأبدية.',
    theme: 'misty',
    image: 'forest',
    candlesCount: 1100,
    candlesLitBy: ['Clara Windham', 'Richard', 'Sarah', 'Yousef'],
    prayers: [],
    createdAt: new Date('2023-09-28').toISOString(),
    creatorId: 'clara-windham',
    creatorName: 'Clara Windham'
  },
  {
    id: 'correspondence-1942',
    nameEn: 'The 1942 Correspondence',
    nameAr: 'مراسلات عام ١٩٤٢',
    relationshipEn: 'Ancestorial Letters',
    relationshipAr: 'رسائل الأجداد الضائعة',
    birthYear: '1942',
    passingYear: '1945',
    category: 'legacy',
    lastWordsEn: 'Letters found in the attic that reveal a secret kindness in the midst of hardship.',
    lastWordsAr: 'رسائل دافئة عثرنا عليها في خبايا علية المنزل، تكشف عن نبضات خفية من الرحمة والإحسان في قلب الظروف العصيبة.',
    storyEn: "Letters found in the attic that reveal a secret kindness in the midst of hardship. A family's true heritage.",
    storyAr: 'سجلات ومخاطبات مكتوبة بخط اليد من علّية الأجداد تروي فصول اللطف المتبادل والتعاون الإنساني النبيل كإرث ثمين يضيء أيامنا.',
    theme: 'sunset',
    image: 'book',
    candlesCount: 823,
    candlesLitBy: ['Clara Windham', 'Victoria', 'Amina'],
    prayers: [],
    createdAt: new Date('2023-08-05').toISOString(),
    creatorId: 'clara-windham',
    creatorName: 'Clara Windham'
  }
];

let solaceMessages: SolaceMessage[] = [
  {
    id: 'sm1',
    author: 'Khaled J.',
    relationship: 'Family Supporter',
    text: 'Sending continuous light and prayers to all who are grieving today. Your loved ones are not forgotten; their voices are sacred in our hearts.',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    likes: 24,
    creatorId: 'khaled-jamil'
  },
  {
    id: 'sm2',
    author: 'سهام علي',
    relationship: 'حارسة ذكرى الغامدي',
    text: 'رحم الله كل نفسٍ صعدت إليه وبقي أثرها يفوح طيباً وطمأنينة. صلاتي ومواساتي لجميع حراس الذاكرة في هذا المحراب الهادئ.',
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    likes: 41,
    creatorId: 'seham-ali'
  }
];

interface UserStats {
  memorialsCreated: number;
  candlesLit: number;
  prayersContributed: number;
}

interface UserAccount {
  email: string;
  password?: string;
  name: string;
  bio: string;
  avatar?: string;
  stats: UserStats;
}

let users: UserAccount[] = [
  {
    email: 'tsraathmd@gmail.com',
    password: 'password123',
    name: 'أحمد حارس الذاكرة',
    bio: 'حارس للشموع والمحبة، أصون اللحظات الأخيرة للراحلين وأحفظ ذكراهم العطرة.',
    avatar: '✨',
    stats: {
      memorialsCreated: 2,
      candlesLit: 15,
      prayersContributed: 8
    }
  },
  {
    email: 'visitor.companion@sanctuary.org',
    password: 'password123',
    name: 'Guest Rememberer',
    bio: 'Preserving quiet echoes in the digital shelter.',
    avatar: '✨',
    stats: {
      memorialsCreated: 1,
      candlesLit: 3,
      prayersContributed: 2
    }
  }
];

// Helper to get or initialize chat conversations for a specific user to ensure data is strictly isolated!
let userConversationsMap: { [email: string]: ChatConversation[] } = {};

function getUserConversations(email: string): ChatConversation[] {
  const cleanEmail = email.trim().toLowerCase();
  if (!userConversationsMap[cleanEmail]) {
    // Deep copy initial seed conversations so each user gets their own interactive experience without mixing up!
    userConversationsMap[cleanEmail] = [
      {
        id: 'elena-vance',
        userNameEn: 'Elena Vance',
        userNameAr: 'إيلينا فانس',
        userAvatar: '👩',
        statusEn: 'Active Now',
        statusAr: 'نشط الآن',
        lastMessageEn: 'The legacy gallery is almost complete. Should we publish the final chapter tomorrow?',
        lastMessageAr: 'معرض الذكريات شارف على الاكتمال. هل نقوم بنشر الفصل الختامي الطاهر غداً؟',
        lastMessageTime: '12:45 PM',
        messages: [
          {
            id: 'msg1',
            sender: 'other',
            textEn: "I was just looking through the guestbook today. The words people wrote about Arthur are so incredibly moving. Have you seen the latest entries?",
            textAr: "كنت أتصفح سجل الزوار الخالد اليوم. الكلمات المكتوبة في حق آرثر تفيض بالمشاعر والصدق وتحرك النفوس. هل قرأت الإدخالات الأخيرة؟",
            time: '11:20 AM'
          },
          {
            id: 'msg2',
            sender: 'me',
            textEn: "I haven't had a chance this morning. It's heartening to see how many lives he touched. The memorial looks beautiful with the new photos you added.",
            textAr: "لم تسنح لي الفرصة هذا الصباح بعد. إنه لأمر يثلج الصدر أن نرى كم النفوس التي لامسها نبل أخلاقه. المزار يبدو رائعاً الجمال بالصور الجديدة التي أضفتها.",
            time: '11:25 AM'
          },
          {
            id: 'msg3',
            sender: 'other',
            textEn: "I'm so glad. I wanted it to feel like a quiet garden where people could just sit and reflect. It's a sanctuary for us now.",
            textAr: "أنا سعيدة جداً بسماع ذلك. أردت دوماً أن يكون المزار كحديقة وارفة الظلال يستريح فيها العابر وينهل السكينة والتفكر. إنه ملاذنا الآمن الآن.",
            time: '11:30 AM'
          },
          {
            id: 'msg4',
            sender: 'other',
            textEn: "The legacy gallery is almost complete. Should we publish the final chapter tomorrow?",
            textAr: "معرض الذكريات شارف على الاكتمال. هل نقوم بنشر الفصل الختامي الطاهر غداً؟",
            time: '12:45 PM'
          }
        ]
      },
      {
        id: 'thomas-wright',
        userNameEn: 'Thomas Wright',
        userNameAr: 'توماس رايت',
        userAvatar: '👴',
        statusEn: 'Yesterday',
        statusAr: 'بالأمس',
        lastMessageEn: 'Thank you for sharing those photos.',
        lastMessageAr: 'شكراً لك على مشاركة تلك الصور الدافئة.',
        lastMessageTime: 'Yesterday',
        messages: [
          {
            id: 'msg_t1',
            sender: 'other',
            textEn: "Thank you for sharing those photos. They remind us of the golden days.",
            textAr: "شكراً لك على مشاركة تلك الصور الدافئة. لقد نفضت الغبار عن أيامنا الذهبية وحنين السنين.",
            time: 'Yesterday'
          }
        ]
      }
    ];
  }
  return userConversationsMap[cleanEmail];
}


async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  const PORT = 3000;

  // Real Backend Auth APIs to isolate users
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, bio } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: 'Please enter all required fields.' });
      }
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: 'This email is already registered.' });
      }

      const newUser: UserAccount = {
        email: email.trim().toLowerCase(),
        password: password,
        name: name.trim(),
        bio: bio || 'Guardian of digital light, preserves original memories.',
        stats: {
          memorialsCreated: 0,
          candlesLit: 0,
          prayersContributed: 0
        }
      };

      users.push(newUser);
      // Pre-create dynamic creator profile likewise
      const cid = newUser.email.split('@')[0];
      const existingCreator = creators.find(c => c.id === cid);
      if (!existingCreator) {
        creators.push({
          id: cid,
          nameEn: newUser.name,
          nameAr: newUser.name,
          roleEn: 'Verified Memory Keeper',
          roleAr: 'حارس ذاكرة موثق',
          bioEn: newUser.bio,
          bioAr: newUser.bio,
          avatar: '✨',
          memorialsCount: 0,
          contributionsCount: 0,
          remembrancesCount: 0,
          followers: [],
          contributionsHistory: []
        });
      }

      res.status(201).json(newUser);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email address or passcode.' });
      }
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }
      // Simulate recovery link delivery
      res.json({ success: true, message: 'Recovery link dispatched.' });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/auth/current-user', (req, res) => {
    try {
      const email = req.headers['x-user-email'] as string || req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: 'Header x-user-email is required' });
      }
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        // Fallback auto-provision to avoid any errors during preview
        const newUser: UserAccount = {
          email: email.toLowerCase(),
          name: email.split('@')[0].toUpperCase(),
          bio: 'حارس للشموع والمحبة، أصون اللحظات الأخيرة للراحلين وأحفظ ذكراهم العطرة.',
          avatar: '✨',
          stats: { memorialsCreated: 0, candlesLit: 0, prayersContributed: 0 }
        };
        users.push(newUser);
        return res.json(newUser);
      }
      if (!user.avatar) {
        user.avatar = '✨';
      }
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/auth/update-profile', (req, res) => {
    try {
      const email = req.headers['x-user-email'] as string;
      const { name, bio, avatar } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Header x-user-email is required' });
      }
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (name) user.name = name;
      if (bio) user.bio = bio;
      if (avatar !== undefined) user.avatar = avatar;

      // Update creator profile correspondingly
      const cid = user.email.split('@')[0];
      const creator = creators.find(c => c.id === cid);
      if (creator) {
        if (name) {
          creator.nameEn = name;
          creator.nameAr = name;
        }
        if (bio) {
          creator.bioEn = bio;
          creator.bioAr = bio;
        }
        if (avatar !== undefined) {
          creator.avatar = avatar;
        }
      }

      res.json(user);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 1. API - Get all memorials
  app.get('/api/memorials', (req, res) => {
    try {
      res.json(memorials);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 2. API - Create a new memorial
  app.post('/api/memorials', (req, res) => {
    try {
      const {
        nameEn,
        nameAr,
        relationshipEn,
        relationshipAr,
        birthYear,
        passingYear,
        category,
        lastWordsEn,
        lastWordsAr,
        storyEn,
        storyAr,
        theme,
        image,
        creatorId,
        creatorName
      } = req.body;

      // Extract user email context from header to link correctly
      const userEmailHeader = req.headers['x-user-email'] as string;

      // Server-side basic validation
      if (!nameEn && !nameAr) {
        return res.status(400).json({ error: 'Please submit a name in at least one language.' });
      }

      const activeCreatorId = creatorId || userEmailHeader || 'visitor';
      const activeCreatorName = creatorName || activeCreatorId.split('@')[0].toUpperCase();

      const newMemorial: Memorial = {
        id: Math.random().toString(36).substring(2, 11),
        nameEn: nameEn || nameAr || '',
        nameAr: nameAr || nameEn || '',
        relationshipEn: relationshipEn || relationshipAr || 'Loved One',
        relationshipAr: relationshipAr || relationshipEn || 'قريب غالي',
        birthYear: birthYear || '????',
        passingYear: passingYear || new Date().getFullYear().toString(),
        category: (category as MemorialCategory) || 'legacy',
        lastWordsEn: lastWordsEn || '',
        lastWordsAr: lastWordsAr || '',
        storyEn: storyEn || '',
        storyAr: storyAr || '',
        theme: (theme as MemorialTheme) || 'misty',
        image: image || 'sky',
        candlesCount: 0,
        candlesLitBy: [],
        prayers: [],
        createdAt: new Date().toISOString(),
        creatorId: activeCreatorId,
        creatorName: activeCreatorName
      };

      // Handle contribution registration on Creator Profile
      let creator = creators.find(c => c.id === activeCreatorId || c.id === activeCreatorId.split('@')[0]);
      if (creator) {
        creator.memorialsCount += 1;
        creator.contributionsHistory.unshift({
          id: Math.random().toString(36).substring(2, 9),
          type: 'memorial_created',
          descriptionEn: `Established the eternal archive for '${newMemorial.nameEn || newMemorial.nameAr}'`,
          descriptionAr: `أسس السجل الأبدي للمرحوم '${newMemorial.nameAr || newMemorial.nameEn}'`,
          timeAgoEn: 'Just now',
          timeAgoAr: 'الآن'
        });
      }

      // Increment stats on the real user account as requested
      if (userEmailHeader) {
        const user = users.find(u => u.email.toLowerCase() === userEmailHeader.toLowerCase());
        if (user) {
          user.stats.memorialsCreated += 1;
        }
      }

      memorials.unshift(newMemorial);
      res.status(201).json(newMemorial);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. API - Light/Toggle a virtual candle in their memory
  app.post('/api/memorials/:id/candle', (req, res) => {
    try {
      const { id } = req.params;
      const { userName } = req.body; // Visitor name
      const userEmailHeader = req.headers['x-user-email'] as string;

      const memorial = memorials.find(m => m.id === id);

      if (!memorial) {
        return res.status(404).json({ error: 'Memorial post not found.' });
      }

      const cleanUser = userName ? userName.trim() : 'Anonymous Visitor';
      const userIndex = memorial.candlesLitBy.indexOf(cleanUser);
      const hasUserLitBefore = userIndex >= 0;

      if (hasUserLitBefore) {
        // User already lit -> Toggle OFF (Unlike)
        memorial.candlesLitBy.splice(userIndex, 1);
        memorial.candlesCount = Math.max(0, memorial.candlesCount - 1);

        // Decrement stats for active user
        if (userEmailHeader) {
          const user = users.find(u => u.email.toLowerCase() === userEmailHeader.toLowerCase());
          if (user && user.stats.candlesLit > 0) {
            user.stats.candlesLit -= 1;
          }
        }
      } else {
        // User hasn't lit -> Toggle ON (Like)
        memorial.candlesLitBy.push(cleanUser);
        memorial.candlesCount += 1;

        // Increment stats for active user
        if (userEmailHeader) {
          const user = users.find(u => u.email.toLowerCase() === userEmailHeader.toLowerCase());
          if (user) {
            user.stats.candlesLit += 1;
          }
        }
      }

      res.json({ candlesCount: memorial.candlesCount, candlesLitBy: memorial.candlesLitBy });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. API - Add a prayer/condolence text
  app.post('/api/memorials/:id/prayers', (req, res) => {
    try {
      const { id } = req.params;
      const { author, text, relationship } = req.body;
      const userEmailHeader = req.headers['x-user-email'] as string;

      const memorial = memorials.find(m => m.id === id);
      if (!memorial) {
        return res.status(404).json({ error: 'Memorial post not found.' });
      }

      if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Prayer text cannot be empty.' });
      }

      const newPrayer: Prayer = {
        id: Math.random().toString(36).substring(2, 9),
        author: author ? author.trim() : 'Anonymous',
        relationship: relationship ? relationship.trim() : 'Stood by to remember',
        text: text.trim(),
        createdAt: new Date().toISOString()
      };

      memorial.prayers.push(newPrayer);

      // Increment stats for active user
      if (userEmailHeader) {
        const user = users.find(u => u.email.toLowerCase() === userEmailHeader.toLowerCase());
        if (user) {
          user.stats.prayersContributed += 1;
        }
      }

      res.json(newPrayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - React with a serene emoji to a specific comment/prayer
  app.post('/api/memorials/:memorialId/prayers/:prayerId/react', (req, res) => {
    try {
      const { memorialId, prayerId } = req.params;
      const { reactionType, undo } = req.body; // 'amen' | 'peace' | 'rose'
      
      if (!['amen', 'peace', 'rose'].includes(reactionType)) {
        return res.status(400).json({ error: 'Invalid reaction type' });
      }

      const memorial = memorials.find(m => m.id === memorialId);
      if (!memorial) {
        return res.status(404).json({ error: 'Memorial not found.' });
      }

      const prayer = memorial.prayers.find(p => p.id === prayerId);
      if (!prayer) {
        return res.status(404).json({ error: 'Comment/Prayer not found.' });
      }

      if (!prayer.reactions) {
        prayer.reactions = { amen: 0, peace: 0, rose: 0 };
      }

      const increment = undo ? -1 : 1;
      const currentCount = prayer.reactions[reactionType as 'amen' | 'peace' | 'rose'] || 0;
      prayer.reactions[reactionType as 'amen' | 'peace' | 'rose'] = Math.max(0, currentCount + increment);
      res.json(prayer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Get all solace wall messages
  app.get('/api/solace-messages', (req, res) => {
    try {
      res.json(solaceMessages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Post a new solace message
  app.post('/api/solace-messages', (req, res) => {
    try {
      const { author, relationship, text } = req.body;
      if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }

      const newMessage: SolaceMessage = {
        id: Math.random().toString(36).substring(2, 11),
        author: author ? author.trim() : 'Anonymous Supporter',
        relationship: relationship ? relationship.trim() : 'Companion',
        text: text.trim(),
        createdAt: new Date().toISOString(),
        likes: 0
      };

      solaceMessages.unshift(newMessage);
      res.status(201).json(newMessage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API - Like a solace message
  app.post('/api/solace-messages/:id/like', (req, res) => {
    try {
      const { id } = req.params;
      const { userName } = req.body;
      const userKey = userName ? userName.trim() : 'Anonymous Visitor';

      const message = solaceMessages.find(m => m.id === id);
      if (!message) {
        return res.status(404).json({ error: 'Solace message not found.' });
      }

      if (!message.likedBy) {
        message.likedBy = [];
      }

      const userIndex = message.likedBy.indexOf(userKey);
      if (userIndex >= 0) {
        // Already liked -> Toggle off
        message.likedBy.splice(userIndex, 1);
        message.likes = Math.max(0, message.likes - 1);
      } else {
        // Not liked -> Toggle on
        message.likedBy.push(userKey);
        message.likes += 1;
      }

      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 5. API - AI Prompt Assist: Polishing last words with Gemini AI
  app.post('/api/gemini/refine', async (req, res) => {
    try {
      const { userDraft, language } = req.body;
      if (!userDraft || userDraft.trim() === '') {
        return res.status(400).json({ error: 'Please enter initial words to refine.' });
      }

      const ai = getGeminiClient();

      let systemPrompt = '';
      if (language === 'ar') {
        systemPrompt = `أنت مساعد رثاء ذكي ومحترم للغاية في تطبيق تذكاري هادئ ومقدس يسمى "منصة اللحظة الأخيرة".
مهمتك إخراج صياغة بليغة، دافئة، روحانية ومؤثرة جداً للوصية الأخيرة أو الكلمات الأخيرة لشخص متوفى بناءً على الملاحظات والمسودة البسيطة التي كتبها أقرباؤه.
الخطوط العريضة:
- حافظ على النبرة الجليلة، الودودة، الهادئة والشاعرية اللطيفة.
- تجنب العبارات المبتذلة، بل ركز على السكينة والجمال والمشاعر الإنسانية الصادقة.
- أخرج فقرة واحدة قصيرة متماسكة تتراوح بين 20 إلى 40 كلمة فقط كأقصى حد.
- لا تضف أي نصوص توضيحية أخرى أو تفسيرات خارج الإطار، فقط النص النهائي المصاغ مباشرة بدون تكلّف.`;
      } else {
        systemPrompt = `You are a deeply respectful, compassionate, and elegant AI memoirist for an online virtual sanctuary called "The Last Moment".
Your goal is to parse raw, simple notes about a deceased loved one's final thoughts, last words, or philosophies, and refine them into a beautiful, dignified, poetic, and comfort-giving statement.
Guidelines:
- Keep the tone dignified, soft, spiritual, comforting, and authentic. Avoid overly tragic jargon. Focus instead on legacy, peaceful transition, and lasting advice.
- Output exactly one concise paragraph consisting of 15 to 35 words.
- Provide only the clean refined quote directly—no introductory chat, greeting remarks, or enclosing quotation marks.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: userDraft,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const refinedText = response.text ? response.text.trim() : userDraft;
      res.json({ refinedText });
    } catch (error: any) {
      console.error('Gemini refinement failed:', error);
      res.status(500).json({ error: error.message || 'Error occurred while communicating with Gemini.' });
    }
  });

  // 6. API - AI Suggest comfort prayer / condolences based on category
  app.post('/api/gemini/suggest-prayer', async (req, res) => {
    try {
      const { name, category, language } = req.body;
      const ai = getGeminiClient();

      let prompt = '';
      if (language === 'ar') {
        prompt = `اكتب دعاءً أو عبارة مواساة قصيرة جداً ومؤثرة تليق بتعزية عائلة الفقيد "${name}" ذي القصة التي تنتمي لتصنيف "${category}". اجعله قصيراً جداً (عبارة واحدة تفيض بالسكينة) ومكثفاً في الرحمة والدعاء بالجنة ونزول السكينة على أهله. اكتب النص النهائي مباشرة بدون علامات اقتباس أو مقدمات.`;
      } else {
        prompt = `Write a very brief, comforting prayer or single sentence of authentic condolence to honor "${name}" whose legacy corresponds to "${category}". Keep it incredibly simple, gentle, and peaceful. Do not include quotes or surrounding metadata, just of comforting peace.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a compassionate companion offering peaceful support to grieving users. Speak from the heart but stay concise (10-20 words).',
          temperature: 0.8,
        },
      });

      const prayer = response.text ? response.text.trim() : '';
      res.json({ prayer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notifications Endpoints
  app.get('/api/notifications', (req, res) => {
    try {
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications/read-all', (req, res) => {
    try {
      notifications = notifications.map(notif => ({ ...notif, read: true }));
      res.json({ success: true, notifications });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    try {
      const { id } = req.params;
      const notif = notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
      }
      res.json({ success: true, notif });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Chats Endpoints
  app.get('/api/chats', (req, res) => {
    try {
      const email = req.headers['x-user-email'] as string || 'visitor.companion@sanctuary.org';
      const userConvs = getUserConversations(email);
      res.json(userConvs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/chats/:conversationId/messages', (req, res) => {
    try {
      const { conversationId } = req.params;
      const { textEn, textAr, sender } = req.body;
      const email = req.headers['x-user-email'] as string || 'visitor.companion@sanctuary.org';
      
      const userConvs = getUserConversations(email);
      const conv = userConvs.find(c => c.id === conversationId);
      if (!conv) {
        return res.status(404).json({ error: 'Conversation not found.' });
      }

      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: sender || 'me',
        textEn: textEn || '',
        textAr: textAr || textEn || '',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };

      conv.messages.push(newMessage);
      conv.lastMessageEn = textEn || '';
      conv.lastMessageAr = textAr || textEn || '';
      conv.lastMessageTime = newMessage.time;

      res.status(201).json({ success: true, conversation: conv, message: newMessage });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Creators & Following API Endpoints
  // Get all registered creators
  app.get('/api/creators', (req, res) => {
    try {
      res.json(creators);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get specific creator by id
  app.get('/api/creators/:id', (req, res) => {
    try {
      const { id } = req.params;
      const creator = creators.find(c => c.id === id);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found.' });
      }
      res.json(creator);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle follow status for a creator
  app.post('/api/creators/:id/follow', (req, res) => {
    try {
      const { id } = req.params;
      const { followerName } = req.body;
      if (!followerName) {
        return res.status(400).json({ error: 'Follower name is required.' });
      }

      const creator = creators.find(c => c.id === id);
      if (!creator) {
        return res.status(404).json({ error: 'Creator not found.' });
      }

      const index = creator.followers.indexOf(followerName);
      if (index > -1) {
        creator.followers.splice(index, 1); // unfollow
      } else {
        creator.followers.push(followerName); // follow
      }

      res.json(creator);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upsert creator profile
  app.post('/api/creators', (req, res) => {
    try {
      const { id, nameEn, nameAr, roleEn, roleAr, bioEn, bioAr, avatar } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'ID is required to upsert creator profile.' });
      }

      let creator = creators.find(c => c.id === id);
      if (creator) {
        if (nameEn) creator.nameEn = nameEn;
        if (nameAr) creator.nameAr = nameAr;
        if (roleEn) creator.roleEn = roleEn;
        if (roleAr) creator.roleAr = roleAr;
        if (bioEn) creator.bioEn = bioEn;
        if (bioAr) creator.bioAr = bioAr;
        if (avatar) creator.avatar = avatar;
        return res.json(creator);
      }

      const newCreator: CreatorProfile = {
        id,
        nameEn: nameEn || id,
        nameAr: nameAr || nameEn || id,
        roleEn: roleEn || 'Companion',
        roleAr: roleAr || 'مستذكر مرافق',
        bioEn: bioEn || 'Preserving quiet echoes in the digital shelter.',
        bioAr: bioAr || 'أحافظ على الأصداء والذكريات الهادئة في الملاذ الافتراضي.',
        avatar: avatar || '👤',
        memorialsCount: 0,
        contributionsCount: 0,
        remembrancesCount: 0,
        followers: [],
        contributionsHistory: []
      };

      creators.push(newCreator);
      res.status(201).json(newCreator);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 7. Mounting Vite middleware & production files serving
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start Server on host 0.0.0.0 to cooperate with reverse proxy ingress
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Last Moment Server successfully running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
