export interface User {
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

export type ReactionType = 'affect' | 'legacy' | 'pray';

export interface ReactionDetail {
  affect: number; // أثّر فيّ
  legacy: number; // ذكرى طيبة
  pray: number;   // دعاء
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string; // e.g., "أشخاص" | "أماكن" | "رسائل" | "ذكريات"
  createdAt: string;
  reactions: ReactionDetail;
  userReactions: { [key: string]: ReactionType | null }; // track current user's reaction to this post
  isPrivate?: boolean;
  isEncrypted?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  postId: string;
  postTitle: string;
  productType: 'canvas' | 'book' | 'wooden_box'; // لوحة جدارية، كتاب الذكريات الباقية، صندوق خشبي منقوش
  customTextOption: string;
  customerName: string;
  shippingAddress: string;
  phoneNumber: string;
  price: number;
  createdAt: string;
  status: 'pending' | 'shipped';
}

export interface Notification {
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
  reactionType?: ReactionType;
  createdAt: string;
  read: boolean;
}

export interface MockState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  orders: Order[];
  currentUser: User | null;
  notifications: Notification[];
}

