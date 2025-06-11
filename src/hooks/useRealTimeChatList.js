import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import firebaseChatService from '../services/firebaseChat';

export const useRealTimeChatList = () => {
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to user's chats
  useEffect(() => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Add Zentro Bot immediately for faster perceived loading
    const zentroBotChat = {
      id: 'zentro_bot_chat',
      otherUser: {
        id: 'zentro_bot',
        name: 'Zentro Bot',
        avatar: null,
        online: true,
        isBot: true
      },
      lastMessage: '🤖 AI Assistant - Ask me anything!',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    // Set Zentro Bot immediately
    setChats([zentroBotChat]);
    setLoading(false);

    const unsubscribe = firebaseChatService.subscribeToUserChats(userProfile.uid, (userChats) => {
      // Update with real chats while keeping Zentro Bot first
      setChats([zentroBotChat, ...userChats]);
    });

    return () => {
      unsubscribe();
    };
  }, [userProfile?.uid]);

  // Start new chat with user
  const startNewChat = useCallback(async (otherUserId) => {
    if (!userProfile?.uid || !otherUserId) return null;

    try {
      const chatId = await firebaseChatService.createChatRoom(userProfile.uid, otherUserId);
      return chatId;
    } catch (error) {
      console.error('Error starting new chat:', error);
      return null;
    }
  }, [userProfile?.uid]);

  // Search for users to start new chats
  const searchUsers = useCallback(async (query) => {
    if (!userProfile?.uid || !query.trim()) return [];

    try {
      const users = await firebaseChatService.searchUsers(query, userProfile.uid);
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, [userProfile?.uid]);

  // Delete chat
  const deleteChat = useCallback(async (chatId) => {
    if (!userProfile?.uid || !chatId) return false;

    try {
      await firebaseChatService.deleteChat(chatId, userProfile.uid);
      // Remove from local state immediately for better UX
      setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }, [userProfile?.uid]);

  return {
    chats,
    loading,
    startNewChat,
    searchUsers,
    deleteChat
  };
};
