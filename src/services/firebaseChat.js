// Firebase Real-time Chat Service
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit
} from 'firebase/firestore';
import { db } from '../firebase'; // Your existing Firebase config

class FirebaseChatService {
  constructor() {
    this.activeListeners = new Map();
    this.userCache = new Map(); // Cache user profiles
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes

    // Periodic cache cleanup every 10 minutes
    setInterval(() => {
      this.clearExpiredCache();
    }, 10 * 60 * 1000);
  }

  // Get user profile with caching
  async getUserProfile(userId) {
    const cached = this.userCache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : {
        displayName: 'Unknown User',
        photoURL: null,
        online: false
      };

      // Cache the result
      this.userCache.set(userId, {
        data: userData,
        timestamp: Date.now()
      });

      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        displayName: 'Unknown User',
        photoURL: null,
        online: false
      };
    }
  }

  // Batch fetch multiple user profiles
  async batchGetUserProfiles(userIds) {
    const profiles = new Map();
    const uncachedIds = [];

    // Check cache first
    for (const userId of userIds) {
      const cached = this.userCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        profiles.set(userId, cached.data);
      } else {
        uncachedIds.push(userId);
      }
    }

    // Fetch uncached profiles in parallel
    if (uncachedIds.length > 0) {
      const fetchPromises = uncachedIds.map(async (userId) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userData = userDoc.exists() ? userDoc.data() : {
            displayName: 'Unknown User',
            photoURL: null,
            online: false
          };

          // Cache the result
          this.userCache.set(userId, {
            data: userData,
            timestamp: Date.now()
          });

          return [userId, userData];
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          return [userId, {
            displayName: 'Unknown User',
            photoURL: null,
            online: false
          }];
        }
      });

      const results = await Promise.all(fetchPromises);
      results.forEach(([userId, userData]) => {
        profiles.set(userId, userData);
      });
    }

    return profiles;
  }

  // Create or get chat room between two users
  async createChatRoom(user1Id, user2Id) {
    // Create consistent chat ID regardless of user order
    const chatId = [user1Id, user2Id].sort().join('_');
    console.log('🔥 Creating/Getting chat room:', { user1Id, user2Id, chatId });

    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      console.log('📝 Creating new chat room:', chatId);
      // Create new chat room
      await setDoc(chatRef, {
        participants: [user1Id, user2Id],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null,
        unreadCount: {
          [user1Id]: 0,
          [user2Id]: 0
        }
      });
    } else {
      console.log('✅ Chat room already exists:', chatId);
    }

    return chatId;
  }

  // Send message to chat room
  async sendMessage(chatId, senderId, messageData) {
    try {
      console.log('💬 Sending message:', { chatId, senderId, messageData });
      const messagesRef = collection(db, 'chats', chatId, 'messages');

      const messageDoc = {
        ...messageData,
        senderId,
        timestamp: serverTimestamp(),
        status: 'sent',
        reactions: []
      };

      // Add message to subcollection
      const docRef = await addDoc(messagesRef, messageDoc);
      console.log('✅ Message sent successfully:', docRef.id);

      // Update chat room with last message info
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: messageData.text || 'Media',
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${senderId}`]: 0 // Reset sender's unread count
      });

      return docRef.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  // Listen to messages in real-time (with pagination)
  subscribeToMessages(chatId, callback, limitCount = 50) {
    console.log('👂 Subscribing to messages for chat:', chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'), // Get newest first
      limit(limitCount) // Limit initial load
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('📨 Messages snapshot received:', snapshot.size, 'messages');
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
        });
      });

      // Reverse to show oldest first in UI
      messages.reverse();
      console.log('📋 Processed messages:', messages.length);
      callback(messages);
    });

    this.activeListeners.set(chatId, unsubscribe);
    return unsubscribe;
  }

  // Get user's chat rooms (optimized with batch fetching)
  subscribeToUserChats(userId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }

      // Extract all other user IDs first
      const chatDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));

      const otherUserIds = chatDocs.map(chat =>
        chat.data.participants.find(id => id !== userId)
      ).filter(Boolean);

      // Batch fetch all user profiles
      const userProfiles = await this.batchGetUserProfiles(otherUserIds);

      // Build chat objects
      const chats = chatDocs.map(chat => {
        const otherUserId = chat.data.participants.find(id => id !== userId);
        const otherUser = userProfiles.get(otherUserId) || {
          displayName: 'Unknown User',
          photoURL: null,
          online: false
        };

        return {
          id: chat.id,
          ...chat.data,
          otherUser: {
            id: otherUserId,
            name: otherUser.displayName,
            avatar: otherUser.photoURL,
            online: otherUser.online || false
          },
          lastMessageTime: chat.data.lastMessageTime?.toDate()?.toISOString(),
          unreadCount: chat.data.unreadCount?.[userId] || 0
        };
      });

      // Sort by last message time
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
        return timeB - timeA;
      });

      callback(chats);
    });

    return unsubscribe;
  }

  // Update message status (delivered, read)
  async updateMessageStatus(chatId, messageId, status) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, { status });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  // Add reaction to message
  async addReaction(chatId, messageId, userId, emoji) {
    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (messageDoc.exists()) {
        const reactions = messageDoc.data().reactions || [];
        const existingReaction = reactions.find(r => r.userId === userId && r.emoji === emoji);

        if (existingReaction) {
          // Remove reaction
          await updateDoc(messageRef, {
            reactions: arrayRemove(existingReaction)
          });
        } else {
          // Add reaction
          await updateDoc(messageRef, {
            reactions: arrayUnion({
              userId,
              emoji,
              timestamp: serverTimestamp()
            })
          });
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  // Sync user profile to Firebase
  async syncUserProfile(userProfile) {
    if (!userProfile || !userProfile.uid) {
      console.error('Invalid user profile provided to syncUserProfile');
      return null;
    }

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      const userDoc = await getDoc(userRef);

      // Create normalized user data object
      const userData = {
        displayName: userProfile.displayName || 'Unknown User',
        email: userProfile.email || '',
        photoURL: userProfile.photoURL || null,
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        professional: userProfile.professional || {},
        visibility: userProfile.visibility || 'public',
        online: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Merge with existing data to preserve any fields not included in update
      if (userDoc.exists()) {
        const existingData = userDoc.data();
        await updateDoc(userRef, {
          ...userData,
          createdAt: existingData.createdAt || serverTimestamp(),
          // Preserve certain fields that should not be overwritten
          friends: existingData.friends || [],
          blockedUsers: existingData.blockedUsers || [],
          notifications: existingData.notifications || []
        });
      } else {
        // Create new user document
        await setDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          friends: [],
          blockedUsers: [],
          notifications: []
        });
      }

      // Clear cache for this user
      this.userCache.delete(userProfile.uid);
      
      // Store success flag in localStorage
      localStorage.setItem(`zentro_firebase_sync_${userProfile.uid}`, Date.now().toString());

      return userData;
    } catch (error) {
      console.error('Error syncing user profile:', error);
      throw error;
    }
  }

  // Update user online status
  async updateUserStatus(userId, online) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        online,
        lastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, userId) {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Search users for new chats
  async searchUsers(query, currentUserId) {
    try {
      // This would typically be a more sophisticated search
      // For now, we'll implement a simple name-based search
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const users = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id !== currentUserId &&
            userData.displayName?.toLowerCase().includes(query.toLowerCase())) {
          users.push({
            id: doc.id,
            name: userData.displayName,
            avatar: userData.photoURL,
            online: userData.online || false
          });
        }
      });

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Get all professional profiles for directory
  async getProfessionalProfiles(currentUserId = null) {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);

      const professionals = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        // Include users with professional data and role, or create default professional data
        if (userData.professional?.role || userData.displayName) {
          const professionalData = userData.professional || {};

          professionals.push({
            uid: doc.id,
            displayName: userData.displayName || 'Unknown User',
            email: userData.email || '',
            photoURL: userData.photoURL,
            location: userData.location || 'Remote',
            bio: userData.bio || 'Professional user on Zentro Chat',
            professional: {
              role: professionalData.role || 'Professional',
              industry: professionalData.industry || 'Technology',
              skills: professionalData.skills || ['Communication', 'Problem Solving'],
              bio: professionalData.bio || userData.bio || 'Professional user on Zentro Chat',
              ...professionalData
            },
            visibility: userData.visibility || 'public',
            online: userData.online || false,
            lastSeen: userData.lastSeen
          });
        }
      });

      return professionals;
    } catch (error) {
      console.error('Error fetching professional profiles:', error);
      return [];
    }
  }

  // Delete chat for a user (removes from their chat list)
  async deleteChat(chatId, userId) {
    try {
      console.log('🗑️ Deleting chat:', { chatId, userId });

      // For now, we'll implement a soft delete by removing the user from participants
      // In a production app, you might want to implement a more sophisticated approach
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);

      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const participants = chatData.participants || [];

        if (participants.length === 2) {
          // If only 2 participants, we can delete the entire chat
          // Delete all messages first
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const messagesSnapshot = await getDocs(messagesRef);

          const deletePromises = messagesSnapshot.docs.map(messageDoc =>
            deleteDoc(messageDoc.ref)
          );
          await Promise.all(deletePromises);

          // Then delete the chat document
          await deleteDoc(chatRef);
          console.log('✅ Chat completely deleted');
        } else {
          // If more than 2 participants (group chat), just remove this user
          const updatedParticipants = participants.filter(id => id !== userId);
          await updateDoc(chatRef, {
            participants: updatedParticipants
          });
          console.log('✅ User removed from chat');
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
      throw error;
    }
  }

  // Clean up listeners
  unsubscribeFromMessages(chatId) {
    const unsubscribe = this.activeListeners.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.activeListeners.delete(chatId);
    }
  }

  // Clean up all listeners
  unsubscribeAll() {
    this.activeListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.activeListeners.clear();
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [userId, cached] of this.userCache.entries()) {
      if (now - cached.timestamp > this.cacheExpiry) {
        this.userCache.delete(userId);
      }
    }
  }

  // Block user
  async blockUser(currentUserId, targetUserId) {
    try {
      // Add to Firebase if available
      try {
        const userRef = doc(db, 'users', currentUserId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const blockedUsers = userData.blockedUsers || [];

          if (!blockedUsers.includes(targetUserId)) {
            await updateDoc(userRef, {
              blockedUsers: arrayUnion(targetUserId)
            });
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase not available, using localStorage:', firebaseError);
      }

      // Always save to localStorage as backup
      const blockedUsers = JSON.parse(localStorage.getItem('zentro_blocked_users') || '[]');
      if (!blockedUsers.includes(targetUserId)) {
        blockedUsers.push(targetUserId);
        localStorage.setItem('zentro_blocked_users', JSON.stringify(blockedUsers));
      }

      // Remove from friends if they are friends
      const friends = JSON.parse(localStorage.getItem('zentro_friends') || '[]');
      const updatedFriends = friends.filter(friend => friend.uid !== targetUserId && friend.id !== targetUserId);
      localStorage.setItem('zentro_friends', JSON.stringify(updatedFriends));

      // Remove any pending friend requests
      const friendRequests = JSON.parse(localStorage.getItem('zentro_friend_requests') || '[]');
      const updatedRequests = friendRequests.filter(req =>
        req.fromUserId !== targetUserId && req.toUserId !== targetUserId
      );
      localStorage.setItem('zentro_friend_requests', JSON.stringify(updatedRequests));

      console.log('✅ User blocked:', targetUserId);
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  // Unblock user
  async unblockUser(currentUserId, targetUserId) {
    try {
      const userRef = doc(db, 'users', currentUserId);
      await updateDoc(userRef, {
        blockedUsers: arrayRemove(targetUserId)
      });

      console.log('✅ User unblocked:', targetUserId);
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  // Report user
  async reportUser(reporterId, targetUserId, reason, details = '') {
    try {
      const reportData = {
        id: Date.now().toString(),
        reporterId,
        targetUserId,
        reason,
        details,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Try to save to Firebase if available
      try {
        const reportsRef = collection(db, 'reports');
        await addDoc(reportsRef, reportData);
      } catch (firebaseError) {
        console.warn('Firebase not available, using localStorage:', firebaseError);
      }

      // Always save to localStorage as backup
      const reports = JSON.parse(localStorage.getItem('zentro_user_reports') || '[]');
      reports.push(reportData);
      localStorage.setItem('zentro_user_reports', JSON.stringify(reports));

      // Also save to admin reports for review
      const adminReports = JSON.parse(localStorage.getItem('zentro_admin_reports') || '[]');
      adminReports.push({
        ...reportData,
        reporterName: reporterId, // In real app, would fetch user name
        targetName: targetUserId,  // In real app, would fetch user name
        reviewed: false
      });
      localStorage.setItem('zentro_admin_reports', JSON.stringify(adminReports));

      console.log('✅ User reported:', targetUserId, 'for:', reason);
      return true;
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // Check if user is blocked
  async isUserBlocked(currentUserId, targetUserId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUserId));
      if (userDoc.exists()) {
        const blockedUsers = userDoc.data().blockedUsers || [];
        return blockedUsers.includes(targetUserId);
      }
      return false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  // Clear all cache
  clearCache() {
    this.userCache.clear();
  }
}

// Create singleton instance
const firebaseChatService = new FirebaseChatService();

export default firebaseChatService;
