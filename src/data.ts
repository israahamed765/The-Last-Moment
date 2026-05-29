import { MockState, Post, Comment, User, ReactionType } from './types';

const INITIAL_USERS: User[] = [
  {
    id: "user1",
    name: "سارة الأحمد",
    username: "sara_ahmad",
    email: "sara@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    bio: "أحفظ تفاصيل الوداع كأمانة، لعل الذكريات تمدنا بالدفء الذي سرقته الأيام. محبة للكتابة والتوثيق.",
    joinedAt: "2025-01-12"
  },
  {
    id: "user2",
    name: "عبد الرحمن الشريف",
    username: "abdo_shereef",
    email: "abdo@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    bio: "أبحث عن النور في الكلمات الأخيرة، وأعبر الطرقات لأشم رائحة الغائبين في ثنايا الأماكن المهجورة.",
    joinedAt: "2025-03-05"
  },
  {
    id: "user3",
    name: "نور الهدى",
    username: "nour_huda",
    email: "nour@example.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    bio: "الرسائل لا تموت حتى لو رحل أصحابها. هنا أشارك دقات القلوب التي كُتبت في هدوء اللحظات الأخيرة.",
    joinedAt: "2025-04-20"
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: "post1",
    userId: "user1",
    authorName: "سارة الأحمد",
    authorUsername: "sara_ahmad",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    title: "آخر رسالة بخط يد جدتي الحبيبة",
    content: "هذه الورقة الصغيرة كانت آخر ما خطه قلم جدتي قبل رحيلها المفاجئ بيوم واحد. كانت تطويها تحت وسادتها، وحين رتبنا غرفتها بعد غيابها، وجدناها مكتوبة بحبر مهتز: 'ارضو بما قسمه الله لكم، فكل مر سيمر، ولا تنسوا أن تذكروني بصلواتكم الدافئة'. أشعر بضمة كفّها كلما تلمست حواف هذه الورقة.",
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800",
    category: "رسائل",
    createdAt: "2026-05-28T18:30:00Z",
    reactions: { affect: 24, legacy: 45, pray: 88 },
    userReactions: {}
  },
  {
    id: "post2",
    userId: "user2",
    authorName: "عبد الرحمن الشريف",
    authorUsername: "abdo_shereef",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    title: "الزيارة الأخيرة لمقهى الروضة القديم برفقة صديق عمري",
    content: "قبل أن يحزم حقائبه مهاجراً بلا عودة، جلسنا على هذا المقعد الخشبي العتيق لقرابة خمس ساعات دون أن ينطق أي منا بكلمة واحدة لربع ساعة كاملة. شربنا قهوتنا بنكهة الوداع، والتقطنا هذه الصورة الرمادية للمقهى وهو فارغ. قال لي في النهاية: 'هنا بدأنا، وهنا تركنا جزءاً من أرواحنا'. لم نلتقِ بعدها، وبقي المقعد يئن تحت وطأة الغياب.",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800",
    category: "أماكن",
    createdAt: "2026-05-25T10:15:00Z",
    reactions: { affect: 18, legacy: 32, pray: 12 },
    userReactions: {}
  },
  {
    id: "post3",
    userId: "user3",
    authorName: "نور الهدى",
    authorUsername: "nour_huda",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    title: "آخر صورة جمعت بين أمي وأبي قبل الرحيل بأسبوع",
    content: "كان أبي يستند على كتف أمي ضاحكاً، كأن السنين ومتاعبها لم تمس قلبيهما يوماً. التقطت هذه الصورة على عجل وأنا أقول لهما: 'اضحكا لتوثيق السعادة'. كم أنا ممتنة لتلك اللحظة العفوية التي اقتنصتها من الزمن. لم أكن أعلم أن نافذة الحياة ستُغلق بعد سبعة أيام فقط إثر حادث سريع. هما الآن معاً في رحمة الله الأوسع.",
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    category: "أشخاص",
    createdAt: "2026-05-24T09:00:00Z",
    reactions: { affect: 41, legacy: 29, pray: 105 },
    userReactions: {}
  },
  {
    id: "post4",
    userId: "user1",
    authorName: "سارة الأحمد",
    authorUsername: "sara_ahmad",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    title: "المكالمة الأخيرة التي لم أرد عليها",
    content: "يظل هذا الإشعار بمكالمة فائتة الساعة 4:12 فجراً، غصة لا تفارق روحي. كان أخي يتصل بي قبل أن تسوء حالته الصحية بساعتين في المستشفى. نمت وغلبتني عيناي، ولم أرد. حين استيقظت، كان قد دخل في غيبوبة أخيرة. أثمن الكلمات هي تلك التي لم تُكتب ولم تُسمع، لكنها تظل مرسومة في ضميري على هيئة ندم نرجو له المغفرة والسكينة.",
    category: "ذكريات",
    createdAt: "2026-05-20T14:45:00Z",
    reactions: { affect: 63, legacy: 15, pray: 52 },
    userReactions: {}
  }
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "comment1",
    postId: "post1",
    userId: "user2",
    authorName: "عبد الرحمن الشريف",
    authorUsername: "abdo_shereef",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    content: "رحم الله جدتك يا سارة، خطها الدافئ يحمل بركة الزمن الجميل. هذه الكلمات رسالة حياة متكاملة تشهد على عمق روحها.",
    createdAt: "2026-05-28T19:00:00Z"
  },
  {
    id: "comment2",
    postId: "post1",
    userId: "user3",
    authorName: "نور الهدى",
    authorUsername: "nour_huda",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    content: "بكت عيناي وأنا أقرأ الكلمات... لعلها الآن في الفردوس الأعلى تنظر إليكم بحب وتدعو لكم.",
    createdAt: "2026-05-28T20:15:00Z"
  },
  {
    id: "comment3",
    postId: "post3",
    userId: "user1",
    authorName: "سارة الأحمد",
    authorUsername: "sara_ahmad",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    content: "يا لها من صورة تقشعر لها الأبدان ضحكتهما عفوية ونبيلة جداً. نسأل الله أن يجمعك بهما في جنات النعيم ونعم الأب والأم والتربية الحكيمة.",
    createdAt: "2026-05-24T12:00:00Z"
  }
];

const STORAGE_KEY = 'last_moment_state_v1';

export function getInitialState(): MockState {
  if (typeof window === 'undefined') {
    return {
      users: INITIAL_USERS,
      posts: INITIAL_POSTS,
      comments: INITIAL_COMMENTS,
      orders: [],
      currentUser: INITIAL_USERS[0], // Sara is target logged in user by default
      notifications: [],
    };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure we have fallback if parsed is corrupted
      if (parsed.users && parsed.posts && parsed.comments) {
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.notifications) parsed.notifications = [];
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing stored last moment state, overriding with defaults.', e);
    }
  }

  // Prepopulate state
  const state = {
    users: INITIAL_USERS,
    posts: INITIAL_POSTS,
    comments: INITIAL_COMMENTS,
    orders: [],
    currentUser: INITIAL_USERS[0],
    notifications: [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function saveStateToStorage(state: MockState) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
