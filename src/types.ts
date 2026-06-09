export interface Prayer {
  id: string;
  author: string;
  relationship: string;
  text: string;
  createdAt: string;
  reactions?: {
    amen: number;
    peace: number;
    rose: number;
  };
}

export type MemorialCategory = 'wisdom' | 'legacy' | 'farewell' | 'grace' | 'happy';

export type MemorialTheme = 'starry' | 'meadow' | 'sunset' | 'lavender' | 'misty';

export interface Memorial {
  id: string;
  nameEn: string;
  nameAr: string;
  relationshipEn: string;
  relationshipAr: string;
  birthYear: string;
  passingYear: string;
  category: MemorialCategory;
  lastWordsEn: string;
  lastWordsAr: string;
  storyEn: string;
  storyAr: string;
  theme: MemorialTheme;
  image?: string; // Base64 image, or generic illustration name/URL
  candlesCount: number;
  candlesLitBy: string[]; // List of session ids or names
  prayers: Prayer[];
  createdAt: string;
  creatorId?: string;
  creatorName?: string;
}

export interface UserStats {
  memorialsCreated: number;
  candlesLit: number;
  prayersContributed: number;
}

export interface ContributionEvent {
  id: string;
  type: 'memorial_created' | 'photo_added' | 'candle_lit' | 'prayer_posted';
  descriptionEn: string;
  descriptionAr: string;
  timeAgoEn: string;
  timeAgoAr: string;
}

export interface CreatorProfile {
  id: string;
  nameEn: string;
  nameAr: string;
  roleEn: string;
  roleAr: string;
  bioEn: string;
  bioAr: string;
  avatar: string; // emoji or character image reference
  memorialsCount: number;
  contributionsCount: number;
  remembrancesCount: number;
  followers: string[]; // keeperNames following this user
  contributionsHistory: ContributionEvent[];
}

export interface SolaceMessage {
  id: string;
  author: string;
  relationship: string;
  text: string;
  createdAt: string;
  likes: number;
  creatorId?: string;
  likedBy?: string[];
}

export interface MemorialNotification {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  timeEn: string;
  timeAr: string;
  type: 'candle' | 'comment' | 'publish' | 'donation';
  read: boolean;
  actionLabelEn: string;
  actionLabelAr: string;
  extraActionLabelEn?: string;
  extraActionLabelAr?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'me' | 'other';
  textEn: string;
  textAr: string;
  time: string;
}

export interface ChatConversation {
  id: string;
  userNameEn: string;
  userNameAr: string;
  userAvatar: string;
  statusEn: string;
  statusAr: string;
  lastMessageEn: string;
  lastMessageAr: string;
  lastMessageTime: string;
  messages: ChatMessage[];
}

