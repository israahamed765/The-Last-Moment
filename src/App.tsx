import React, { useState, useEffect } from 'react';
import { MockState, Post, Comment, User, ReactionType, Order, Notification } from './types';
import { Navbar } from './components/Navbar';
import { Feed } from './components/Feed';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AuthOnboarding } from './components/AuthOnboarding';
import { CreatePostModal } from './components/CreatePostModal';
import { CheckoutModal } from './components/CheckoutModal';
import { BottomNavigation } from './components/BottomNavigation';
import { NotificationsFeed } from './components/NotificationsFeed';
import { Heart, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { language, t } = useLanguage();
  const [session, setSession] = useState<MockState>({
    users: [],
    posts: [],
    comments: [],
    orders: [],
    currentUser: null,
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'profile' | 'notifications'>('feed');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Real-time supportive notifications & companion stats
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeToasts, setActiveToasts] = useState<{ id: string; text: string; avatar: string }[]>([]);

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPostForCheckout, setSelectedPostForCheckout] = useState<Post | null>(null);

  // Load dataset from backend on load
  const loadDataset = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to load database from server');
      const data = await response.json();

      let activeUser = null;
      if (typeof window !== 'undefined') {
        const storedUserId = localStorage.getItem('last_moment_current_user_id');
        if (storedUserId) {
          activeUser = data.users.find((u: User) => u.id === storedUserId) || null;
        }
      }

      setSession({
        users: data.users || [],
        posts: data.posts || [],
        comments: data.comments || [],
        orders: data.orders || [],
        currentUser: activeUser,
        notifications: data.notifications || [],
      });
    } catch (err) {
      console.error("Error loading server-side memory records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataset();
  }, []);

  const currentUser = session.currentUser;

  // Fetch companion interaction logs
  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications((prev) => {
          const fresh = data.notifications;
          // Trigger slide-in toasts for any fresh, unread notification that we haven't seen in our current list
          const newUnreads = fresh.filter((fn: any) => {
            const isUnread = !fn.read;
            const alreadyExists = prev.some((o) => o.id === fn.id);
            return isUnread && !alreadyExists;
          });

          newUnreads.forEach((un: any) => {
            const toastId = `toast_${Date.now()}_${Math.random()}`;
            const alertText = language === 'ar'
              ? un.type === 'comment'
                ? `${un.sender.name} ترك رسالة مؤازرة على أثرك`
                : un.type === 'reaction'
                ? `${un.sender.name} تفاعل مع أثرك الخالد`
                : `${un.sender.name} بدأ بمتابعتك الآن`
              : un.type === 'comment'
              ? `${un.sender.name} left a word of support on your legacy`
              : un.type === 'reaction'
              ? `${un.sender.name} reacted to your immortal memory`
              : `${un.sender.name} started following you now`;

            setActiveToasts((t) => [...t, { id: toastId, text: alertText, avatar: un.sender.avatar }]);
            setTimeout(() => {
              setActiveToasts((t) => t.filter((item) => item.id !== toastId));
            }, 4500);
          });

          return fresh;
        });
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications(currentUser.id);
      const interval = setInterval(() => {
        fetchNotifications(currentUser.id);
      }, 6000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [currentUser?.id]);

  // 1. Empathy reactions switcher logic calling the Express backend
  const handleReact = async (postId: string, reactionType: ReactionType) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/posts/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          reactionType
        })
      });
      const resData = await response.json();
      if (resData.success && resData.post) {
        setSession((prev) => {
          const updatedPosts = prev.posts.map((p) => p.id === postId ? resData.post : p);
          return { ...prev, posts: updatedPosts };
        });
      }
    } catch (err) {
      console.error("Error setting reaction:", err);
    }
  };

  // 2. Add custom support comment calling the Express backend
  const handleAddComment = async (postId: string, content: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
          content
        })
      });
      const resData = await response.json();
      if (resData.success && resData.comment) {
        setSession((prev) => ({
          ...prev,
          comments: [resData.comment, ...prev.comments]
        }));
      }
    } catch (err) {
      console.error("Error adding support message:", err);
    }
  };

  // 3. Document a new Last Moment memory calling the Express backend
  const handleAddPost = async (title: string, content: string, category: string, imageUrl?: string, isPrivate?: boolean) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title,
          content,
          category,
          imageUrl,
          isPrivate
        })
      });
      const resData = await response.json();
      if (resData.success && resData.post) {
        setSession((prev) => ({
          ...prev,
          posts: [resData.post, ...prev.posts]
        }));

        // If user submitted it as private but is not premium yet, direct them to upgrade premium!
        if (isPrivate && !currentUser.isPremium) {
          alert("لقد قمت باختيار حفظ الذكرى في الخزنة الرقمية المشفرة. يرجى تفعيل باقة الاشتراك المميزة (Premium Archive) الآن من الشريط الجانبي لتصفح وتأكيد خزنتك الحصرية!");
        }
      }
    } catch (err) {
      console.error("Error uploading post:", err);
    }
  };

  // 3.5 Upgrade user premium vault subscription
  const handleUpgradePremium = async (userId: string, activate: boolean) => {
    try {
      const response = await fetch('/api/users/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activate })
      });
      const resData = await response.json();
      if (resData.success && resData.user) {
        // Update both user list & current selection state
        setSession((prev) => {
          const updatedUsers = prev.users.map(u => u.id === userId ? resData.user : u);
          const updatedCurrentUser = prev.currentUser?.id === userId ? resData.user : prev.currentUser;
          return {
            ...prev,
            users: updatedUsers,
            currentUser: updatedCurrentUser
          };
        });
      }
    } catch (err) {
      console.error("Error setting premium subscription state:", err);
    }
  };

  // 3.6 Create a printed merchandise canvas order
  const handleCreateOrder = async (orderData: {
    userId: string;
    postId: string;
    productType: 'canvas' | 'book' | 'wooden_box';
    customTextOption: string;
    customerName: string;
    shippingAddress: string;
    phoneNumber: string;
    price: number;
  }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const resData = await response.json();
      if (resData.success && resData.order) {
        setSession((prev) => ({
          ...prev,
          orders: [resData.order, ...prev.orders]
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error committing printed merchandise order:", err);
      return false;
    }
  };

  // 4. Custom user sign-up / register calling the Express backend
  const handleRegisterUser = async (userData: {
    name: string;
    username: string;
    email: string;
    password?: string;
    bio: string;
    avatar: string;
  }): Promise<boolean> => {
    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const resData = await response.json();
      if (resData.success && resData.user) {
        localStorage.setItem('last_moment_current_user_id', resData.user.id);
        setSession((prev) => ({
          ...prev,
          users: [...prev.users, resData.user],
          currentUser: resData.user
        }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error registering user with backend:", err);
      return false;
    }
  };

  // 4.5. Custom system login calling the Express backend
  const handleLoginUser = async (loginQuery: string, password?: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginQuery, password })
      });
      const resData = await response.json();
      if (resData.success && resData.user) {
        localStorage.setItem('last_moment_current_user_id', resData.user.id);
        setSession((prev) => ({
          ...prev,
          currentUser: resData.user
        }));
        return resData.user;
      }
      return null;
    } catch (err) {
      console.error("Error logging in user with backend:", err);
      return null;
    }
  };

  // 5. Select/Switch active user session
  const handleSelectUser = (user: User) => {
    localStorage.setItem('last_moment_current_user_id', user.id);
    setSession((prev) => ({
      ...prev,
      currentUser: user
    }));
  };

  // 6. Logout / Sign-out action
  const handleLogout = () => {
    localStorage.removeItem('last_moment_current_user_id');
    setSession((prev) => ({
      ...prev,
      currentUser: null
    }));
    setIsAuthOpen(true);
  };

  // 6.2 Mark notification list as read
  const handleMarkNotificationsRead = async (notificationId?: string) => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          notificationId
        })
      });
      const data = await response.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error marking status as read:", err);
    }
  };

  // 6.4 Clear entire notification register
  const handleClearNotifications = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      const data = await response.json();
      if (data.success) {
        setNotifications([]);
      }
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // 6.6 Toggle follow/unfollow companion chronicler relationship
  const handleFollowUser = async (targetId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const response = await fetch('/api/users/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetId
        })
      });
      const data = await response.json();
      if (data.success && data.user) {
        // update follow state in session dataset
        setSession((prev) => {
          const updatedUsers = prev.users.map(u => u.id === currentUser.id ? data.user : u);
          return {
            ...prev,
            users: updatedUsers,
            currentUser: data.user
          };
        });
        // fetch notifications immediately
        fetchNotifications(currentUser.id);
      }
    } catch (err) {
      console.error("Error toggling follow relationship:", err);
    }
  };

  // 7. User profile card edit calling the Express backend
  const handleUpdateBio = async (newName: string, newBio: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: newName,
          bio: newBio
        })
      });
      const resData = await response.json();
      if (resData.success && resData.user) {
        const updatedUser = resData.user;
        const updatedUsersList = session.users.map((u) => u.id === currentUser.id ? updatedUser : u);
        
        // Reflect profile change dynamically on prior posts and comments displayed in client
        const updatedPosts = session.posts.map((post) => {
          if (post.userId === currentUser.id) {
            return {
              ...post,
              authorName: newName
            };
          }
          return post;
        });

        const updatedComments = session.comments.map((comm) => {
          if (comm.userId === currentUser.id) {
            return {
              ...comm,
              authorName: newName
            };
          }
          return comm;
        });

        setSession((prev) => ({
          ...prev,
          users: updatedUsersList,
          currentUser: updatedUser,
          posts: updatedPosts,
          comments: updatedComments
        }));
      }
    } catch (err) {
      console.error("Error setting user modifications:", err);
    }
  };

  // Nav helpers
  const handleViewPostDetails = (post: Post) => {
    setActiveTab('feed');
    setTimeout(() => {
      const element = document.getElementById(`post-card-${post.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-accent-gold/40');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-accent-gold/40');
        }, 1500);
      }
    }, 100);
  };

  const handleSelectOwnProfile = () => {
    if (currentUser) {
      setSelectedProfileId(currentUser.id);
      setActiveTab('profile');
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleAuthorClick = (userId: string) => {
    setSelectedProfileId(userId);
    setActiveTab('profile');
  };

  // Fetch profiles stats
  const profileToView = session.users.find((u) => u.id === (selectedProfileId || currentUser?.id)) || currentUser;
  const profilePosts = session.posts.filter((p) => p.userId === profileToView?.id);
  const totalReactions = profilePosts.reduce((acc, p) => p.reactions.affect + p.reactions.legacy + p.reactions.pray + acc, 0);

  // Elegant cozy Arabic loader state
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="relative inline-flex items-center justify-center">
            {/* Soft breathing halo design */}
            <span className="absolute w-16 h-16 rounded-full bg-accent-gold/10 animate-ping" />
            <span className="w-12 h-12 rounded-full bg-accent-gold/15 flex items-center justify-center border border-accent-gold/20">
              <Heart size={22} className="text-accent-gold fill-current animate-pulse" />
            </span>
          </div>
          
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal">اللحظة الأخيرة</h3>
            <p className="text-xs text-charcoal-light/70 mt-1 max-w-xs mx-auto leading-relaxed">
              يرجى الانتظار قليلاً بينما نفتح خزائن الأثر ونسترجع الكلمات الطيبة المتبقية...
            </p>
          </div>
          
          <div className="flex justify-center items-center gap-1.5 text-xs text-accent-sage font-medium">
            <Loader2 size={14} className="animate-spin text-accent-gold" />
            <span>جاري استعادة سجل النداء الخالد...</span>
          </div>
        </div>
      </div>
    );
  }

  // App Protected Checkpoint: Redirect to custom Onboarding & Auth flow if unauthenticated
  if (!currentUser) {
    return (
      <AuthOnboarding
        users={session.users}
        onSelectUser={handleSelectUser}
        onRegisterUser={handleRegisterUser}
        onLoginUser={handleLoginUser}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg font-sans text-charcoal">
      
      {/* Premium Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectOwnProfile={handleSelectOwnProfile}
        onLogout={handleLogout}
        unreadCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-20 md:pb-10">
        
        {activeTab === 'feed' ? (
          <Feed
            posts={session.posts}
            comments={session.comments}
            currentUser={currentUser}
            orders={session.orders}
            onReact={handleReact}
            onAddComment={handleAddComment}
            onOpenCreatePost={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
            onAuthorClick={handleAuthorClick}
            onOpenOrderModal={(post) => {
              if (!currentUser) {
                setIsAuthOpen(true);
              } else {
                setSelectedPostForCheckout(post);
                setIsCheckoutOpen(true);
              }
            }}
            onUpgradePremium={handleUpgradePremium}
          />
        ) : activeTab === 'notifications' ? (
          <NotificationsFeed
            notifications={notifications}
            onMarkRead={handleMarkNotificationsRead}
            onClearAll={handleClearNotifications}
            onViewPost={(postId) => {
              const post = session.posts.find((p) => p.id === postId);
              if (post) handleViewPostDetails(post);
            }}
            onAuthorClick={handleAuthorClick}
          />
        ) : (
          profileToView && (
            <ProfileView
              user={profileToView}
              isCurrentUser={profileToView.id === currentUser?.id}
              userPosts={profilePosts}
              totalReactionsCount={totalReactions}
              onUpdateBio={handleUpdateBio}
              onViewPost={handleViewPostDetails}
              currentUser={currentUser}
              onFollowUser={handleFollowUser}
            />
          )
        )}

      </main>

      {/* Comforting Humanistic Footer */}
      <footer className="bg-white border-t border-warm-beige py-6 mt-12 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-charcoal-light/65 font-serif font-semibold">
            {t('appFooter')}
          </p>
          <p className="text-[10px] text-charcoal-light/40 font-sans">
            {t('appCopyright')}
          </p>
        </div>
      </footer>

      {/* Bottom Sticky Mobile Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={notifications.filter(n => !n.read).length}
        onOpenCreate={() => (currentUser ? setIsCreateOpen(true) : setIsAuthOpen(true))}
        avatarUrl={currentUser?.avatar}
        userName={currentUser?.name}
      />

      {/* Dynamic Slide-in Supportive Toasts */}
      <div className="fixed bottom-20 md:bottom-6 left-6 right-6 md:left-auto md:w-96 z-50 space-y-3 pointer-events-none">
        {activeToasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#2C2523] text-stone-100 rounded-2xl shadow-xl border border-charcoal/20 flex items-center gap-3 p-4 select-none animate-fadeIn"
            dir={document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'}
          >
            <img
              src={toast.avatar}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-accent-gold font-bold font-serif">
                {document.documentElement.lang === 'ar' ? 'اللحظة الأخيرة • إشارة وجدانية' : 'The Last Moment • Compassionate Echo'}
              </p>
              <p className="text-xs text-stone-200 mt-1 font-sans leading-relaxed">
                {toast.text}
              </p>
            </div>
            <button
              onClick={() => setActiveToasts((toastList) => toastList.filter((item) => item.id !== toast.id))}
              className="text-stone-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold px-2 py-1 rounded hover:bg-white/10"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Interactivity Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        users={session.users}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onRegisterUser={(name, username, bio, avatar) => {
          handleRegisterUser({
            name,
            username,
            email: `${username}@lastmoment.com`,
            password: '123456',
            bio,
            avatar
          });
        }}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUser={currentUser}
        onAddPost={handleAddPost}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        post={selectedPostForCheckout}
        currentUser={currentUser}
        onAddOrder={handleCreateOrder}
      />

    </div>
  );
}
