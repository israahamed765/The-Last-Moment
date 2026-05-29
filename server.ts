import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  isPremium?: boolean;
  password?: string;
  followingIds?: string[];
}

interface ReactionDetail {
  affect: number;
  legacy: number;
  pray: number;
}

interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  createdAt: string;
  reactions: ReactionDetail;
  userReactions: { [key: string]: string | null };
  isPrivate?: boolean;
  isEncrypted?: boolean;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

interface Order {
  id: string;
  userId: string;
  postId: string;
  postTitle: string;
  productType: 'canvas' | 'book' | 'wooden_box';
  customTextOption: string;
  customerName: string;
  shippingAddress: string;
  phoneNumber: string;
  price: number;
  createdAt: string;
  status: 'pending' | 'shipped';
}

interface Notification {
  id: string;
  recipientId: string;
  type: 'comment' | 'reaction' | 'follow';
  sender: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  post?: {
    id: string;
    title: string;
  };
  commentContent?: string;
  reactionType?: string;
  createdAt: string;
  read: boolean;
}

interface DatabaseState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  orders: Order[];
  notifications?: Notification[];
}

const DB_FILE = path.join(process.cwd(), "database.json");

const DEFAULT_USERS: User[] = [
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

const DEFAULT_POSTS: Post[] = [
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

const DEFAULT_COMMENTS: Comment[] = [
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

// Helper to read database
function readDB(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content) as DatabaseState;
      if (!parsed.orders) {
        parsed.orders = [];
      }
      if (!parsed.notifications) {
        parsed.notifications = [];
      }
      // Ensure all users have standard passwords & followingIds
      let updated = false;
      parsed.users = parsed.users.map(u => {
        let changed = false;
        if (!u.password) {
          u.password = "123456";
          changed = true;
        }
        if (!u.followingIds) {
          u.followingIds = [];
          changed = true;
        }
        if (changed) {
          updated = true;
        }
        return u;
      });
      if (updated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
      return parsed;
    }
  } catch (error) {
    console.error("Error reading database file, using defaults:", error);
  }
  
  // Seed initial DB state
  const state: DatabaseState = {
    users: DEFAULT_USERS.map(u => ({ ...u, password: "123456", followingIds: [] })),
    posts: DEFAULT_POSTS,
    comments: DEFAULT_COMMENTS,
    orders: [],
    notifications: [
      {
        id: "notif_seed_1",
        recipientId: "user1",
        type: "comment",
        sender: {
          id: "user2",
          name: "عبد الرحمن الشريف",
          username: "abdo_shereef",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
        },
        post: {
          id: "post1",
          title: "آخر رسالة بخط يد جدتي الحبيبة"
        },
        commentContent: "رحم الله جدتك يا سارة، خطها الدافئ يحمل بركة الزمن الجميل. هذه الكلمات رسالة حياة متكاملة تشهد على عمق روحها.",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        read: false
      },
      {
        id: "notif_seed_2",
        recipientId: "user1",
        type: "reaction",
        sender: {
          id: "user3",
          name: "نور الهدى",
          username: "nour_huda",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"
        },
        post: {
          id: "post1",
          title: "آخر رسالة بخط يد جدتي الحبيبة"
        },
        reactionType: "legacy",
        createdAt: new Date(Date.now() - 60000 * 15).toISOString(), // 15 minutes ago
        read: false
      },
      {
        id: "notif_seed_3",
        recipientId: "user1",
        type: "follow",
        sender: {
          id: "user2",
          name: "عبد الرحمن الشريف",
          username: "abdo_shereef",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
        },
        createdAt: new Date(Date.now() - 60000 * 45).toISOString(), // 45 minutes ago
        read: true
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  return state;
}

// Helper to write database
function writeDB(state: DatabaseState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

// Helper to create notifications
function createNotification(
  db: DatabaseState,
  recipientId: string,
  type: 'comment' | 'reaction' | 'follow',
  senderId: string,
  postId?: string,
  commentContent?: string,
  reactionType?: string
) {
  // If notifying oneself, ignore
  if (recipientId === senderId) return;

  const sender = db.users.find(u => u.id === senderId);
  if (!sender) return;

  let postInfo = undefined;
  if (postId) {
    const post = db.posts.find(p => p.id === postId);
    if (post) {
      postInfo = { id: post.id, title: post.title };
    }
  }

  const newNotif: Notification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    recipientId,
    type,
    sender: {
      id: sender.id,
      name: sender.name,
      username: sender.username,
      avatar: sender.avatar
    },
    post: postInfo,
    commentContent,
    reactionType,
    createdAt: new Date().toISOString(),
    read: false
  };

  if (!db.notifications) {
    db.notifications = [];
  }
  db.notifications.unshift(newNotif);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Setup JSON parsing limit for custom base64 encoded images
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API 1: Get full dataset
  app.get("/api/data", (req, res) => {
    const db = readDB();
    res.json(db);
  });

  // API 1.8: Check if username is available
  app.post("/api/users/check-username", (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "اسم المستخدم مطلوب" });
    }
    const db = readDB();
    const taken = db.users.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
    res.json({ success: true, available: !taken });
  });

  // API 1.9: Login a user with password validation
  app.post("/api/users/login", (req, res) => {
    const { loginQuery, password } = req.body;
    if (!loginQuery || !password) {
      return res.status(400).json({ error: "اسم المستخدم/البريد الإلكتروني وكلمة المرور مطلوبان" });
    }

    const db = readDB();
    const normalizedQuery = loginQuery.toLowerCase().trim();
    const user = db.users.find(u => 
      u.username.toLowerCase() === normalizedQuery || 
      u.email.toLowerCase() === normalizedQuery
    );

    if (!user) {
      return res.json({ success: false, error: "المستخدم غير موجود بالمنصة، تحقق من كتابة الاسم أو البريد" });
    }

    if (user.password !== password) {
      return res.json({ success: false, error: "كلمة المرور غير صحيحة، يرجى كتابتها بعناية" });
    }

    res.json({ success: true, user });
  });

  // API 2: Register a new user
  app.post("/api/users/register", (req, res) => {
    const { name, username, email, password, bio, avatar } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "الرجاء توفير جميع الحقول وملاءمتها بالكامل" });
    }

    const db = readDB();
    
    // Check if username taken
    const existingUsername = db.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (existingUsername) {
      return res.json({ success: false, error: "اسم المستخدم هذا مسجل مسبقاً، يرجى اختيار اسم مستخدم مغاير" });
    }

    // Check if email taken
    const existingEmail = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existingEmail) {
      return res.json({ success: false, error: "البريد الإلكتروني هذا مسجل مسبقاً، يرجى استخدام بريد آخر أو تسجيل الدخول" });
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: password,
      avatar: avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
      bio: bio.trim() || "هاوٍ لتوثيق اللحظات الطيبة وحفظ الأثر الصادق لممرات الذاكرة.",
      joinedAt: new Date().toISOString().split("T")[0]
    };

    db.users.push(newUser);
    writeDB(db);

    res.json({ success: true, user: newUser });
  });

  // API 2.5: Forgot password simulation
  app.post("/api/users/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "البريد الإلكتروني مطلوب" });
    }

    const db = readDB();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.json({ success: false, error: "هذا البريد الإلكتروني غير مسجل في سجلات الأثر للأسف" });
    }

    // Simulate sending recovery link
    console.log(`[PASSWORD RECOVERY] Recovery link requested for user ${user.name} (${user.email})`);
    res.json({ success: true, message: "تم إرسال رابط إعادة التعيين بنجاح إلى بريدك الإلكتروني" });
  });

  // API 2.6: Change Password API 
  app.post("/api/users/change-password", (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: "مدخلات تغيير كلمة المرور منقوصة" });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "المستخدم غير موجود بالمنصة" });
    }

    const user = db.users[userIndex];
    if (currentPassword && user.password !== currentPassword) {
      return res.json({ success: false, error: "كلمة المرور الحالية غير مطابقة للكلمة المسجلة" });
    }

    db.users[userIndex].password = newPassword;
    writeDB(db);

    res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
  });

  // API 3: Update user bio details
  app.post("/api/users/update", (req, res) => {
    const { userId, name, bio } = req.body;
    if (!userId || !name) {
      return res.status(400).json({ error: "معلومات منقوصة لتعديل الملف" });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    db.users[userIndex].name = name;
    db.users[userIndex].bio = bio;

    // Update names on their posts as well for data consistency
    db.posts = db.posts.map(p => {
      if (p.userId === userId) {
        return { ...p, authorName: name };
      }
      return p;
    });

    // Update names on their comments too
    db.comments = db.comments.map(c => {
      if (c.userId === userId) {
        return { ...c, authorName: name };
      }
      return c;
    });

    writeDB(db);
    res.json({ success: true, user: db.users[userIndex] });
  });

  // API 4: Create a dynamic Last Moment post
  app.post("/api/posts", (req, res) => {
    const { userId, title, content, category, imageUrl, isPrivate } = req.body;
    if (!userId || !title || !content || !category) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة لنشر الذكرى" });
    }

    const db = readDB();
    const author = db.users.find(u => u.id === userId);
    if (!author) {
      return res.status(404).json({ error: "كاتب المنشور غير موجود في قاعده البيانات" });
    }

    const newPost: Post = {
      id: `post_${Date.now()}`,
      userId: author.id,
      authorName: author.name,
      authorUsername: author.username,
      authorAvatar: author.avatar,
      title,
      content,
      imageUrl,
      category,
      createdAt: new Date().toISOString(),
      reactions: { affect: 0, legacy: 0, pray: 0 },
      userReactions: {},
      isPrivate: !!isPrivate,
      isEncrypted: !!isPrivate
    };

    db.posts.unshift(newPost); // Add at beginning of list
    writeDB(db);

    res.json({ success: true, post: newPost });
  });

  // API 4.5: Subscribe/Toggle Premium Digital Vault status
  app.post("/api/users/premium", (req, res) => {
    const { userId, activate } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب للاشتراك" });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    db.users[userIndex].isPremium = activate !== false;
    writeDB(db);

    res.json({ success: true, user: db.users[userIndex] });
  });

  // API 4.6: Store checkout for physical memory book or wall canvas
  app.post("/api/orders", (req, res) => {
    const { userId, postId, productType, customTextOption, customerName, shippingAddress, phoneNumber, price } = req.body;
    if (!userId || !postId || !productType || !customerName || !shippingAddress || !phoneNumber) {
      return res.status(400).json({ error: "جميع حقول الطلب مطلوبة لإتمام الشحن وتحويل الذكرى" });
    }

    const db = readDB();
    const matchedPost = db.posts.find(p => p.id === postId);
    const postTitle = matchedPost ? matchedPost.title : "أثر مخلد";

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      userId,
      postId,
      postTitle,
      productType,
      customTextOption: customTextOption || "",
      customerName,
      shippingAddress,
      phoneNumber,
      price: price || 120, // default price in absolute values
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    if (!db.orders) {
      db.orders = [];
    }
    db.orders.unshift(newOrder);
    writeDB(db);

    res.json({ success: true, order: newOrder });
  });

  // API 5: Add message overlay comment
  app.post("/api/comments", (req, res) => {
    const { postId, userId, content } = req.body;
    if (!postId || !userId || !content) {
      return res.status(400).json({ error: "محتوى التعليق مطلوب متبوعاً بمعرف المنشور" });
    }

    const db = readDB();
    const author = db.users.find(u => u.id === userId);
    if (!author) {
      return res.status(404).json({ error: "المعلق غير موجود" });
    }

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: author.id,
      authorName: author.name,
      authorAvatar: author.avatar,
      authorUsername: author.username,
      content,
      createdAt: new Date().toISOString()
    };

    db.comments.unshift(newComment);

    // Notify post owner
    const matchedPost = db.posts.find(p => p.id === postId);
    if (matchedPost) {
      createNotification(db, matchedPost.userId, 'comment', userId, postId, content);
    }

    writeDB(db);

    res.json({ success: true, comment: newComment });
  });

  // API 6: Empathetic reactions toggler
  app.post("/api/posts/react", (req, res) => {
    const { postId, userId, reactionType } = req.body;
    if (!postId || !userId || !reactionType) {
      return res.status(400).json({ error: "بيانات التفاعل غير مكتملة" });
    }

    const db = readDB();
    const postIndex = db.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "المنشور غير متوفر" });
    }

    const post = db.posts[postIndex];
    if (!post.userReactions) {
      post.userReactions = {};
    }

    const currentReaction = post.userReactions[userId];
    const reactions = { ...post.reactions };
    let triggeredNotification = false;

    // Case 1: Toggle Off
    if (currentReaction === reactionType) {
      reactions[reactionType] = Math.max(0, (reactions[reactionType] || 0) - 1);
      post.userReactions[userId] = null;
    } 
    // Case 2: Switch
    else if (currentReaction) {
      reactions[currentReaction] = Math.max(0, (reactions[currentReaction] || 0) - 1);
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      post.userReactions[userId] = reactionType;
      triggeredNotification = true;
    } 
    // Case 3: Set
    else {
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      post.userReactions[userId] = reactionType;
      triggeredNotification = true;
    }

    post.reactions = reactions;
    db.posts[postIndex] = post;

    if (triggeredNotification) {
      createNotification(db, post.userId, 'reaction', userId, postId, undefined, reactionType);
    }

    writeDB(db);

    res.json({ success: true, post });
  });

  // API 7: Follow/Unfollow user
  app.post("/api/users/follow", (req, res) => {
    const { userId, targetId } = req.body;
    if (!userId || !targetId) {
      return res.status(400).json({ error: "معرفات المتابعة منقوصة" });
    }

    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    const targetIndex = db.users.findIndex(u => u.id === targetId);

    if (userIndex === -1 || targetIndex === -1) {
      return res.status(404).json({ error: "المستخدمين غير موجودين" });
    }

    const user = db.users[userIndex];
    if (!user.followingIds) {
      user.followingIds = [];
    }

    const alreadyFollowing = user.followingIds.includes(targetId);
    if (alreadyFollowing) {
      // Unfollow
      user.followingIds = user.followingIds.filter(id => id !== targetId);
    } else {
      // Follow
      user.followingIds.push(targetId);
      // Trigger live notification
      createNotification(db, targetId, 'follow', userId);
    }

    db.users[userIndex] = user;
    writeDB(db);

    res.json({ success: true, following: !alreadyFollowing, user });
  });

  // API 8: Get notification list for a user
  app.get("/api/notifications", (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب" });
    }

    const db = readDB();
    if (!db.notifications) db.notifications = [];
    const list = db.notifications.filter(n => n.recipientId === userId);
    res.json({ success: true, notifications: list });
  });

  // API 9: Mark notifications as read
  app.post("/api/notifications/read", (req, res) => {
    const { userId, notificationId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب" });
    }

    const db = readDB();
    if (!db.notifications) db.notifications = [];

    db.notifications = db.notifications.map(n => {
      if (n.recipientId === userId && (notificationId ? n.id === notificationId : true)) {
        return { ...n, read: true };
      }
      return n;
    });

    writeDB(db);
    const list = db.notifications.filter(n => n.recipientId === userId);
    res.json({ success: true, notifications: list });
  });

  // API 10: Clear notifications list
  app.post("/api/notifications/clear", (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "معرف المستخدم مطلوب" });
    }

    const db = readDB();
    if (!db.notifications) db.notifications = [];

    db.notifications = db.notifications.filter(n => n.recipientId !== userId);
    writeDB(db);

    res.json({ success: true, notifications: [] });
  });

  // Integrate Vite dev server middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static files paths setup
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running perfectly on http://localhost:${PORT}`);
  });
}

startServer();
