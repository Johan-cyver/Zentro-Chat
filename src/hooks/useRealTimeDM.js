import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '../contexts/UserContext';
import firebaseChatService from '../services/firebaseChat';
import { db } from '../firebase';

export const useRealTimeDM = (otherUserId) => {
  const { userProfile } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Initialize chat room
  useEffect(() => {
    if (!userProfile?.uid || !otherUserId) return;

    console.log('🔥 useRealTimeDM initializing chat:', {
      currentUser: userProfile.uid,
      otherUserId: otherUserId,
      areTheSame: userProfile.uid === otherUserId
    });

    const initializeChat = async () => {
      try {
        const newChatId = await firebaseChatService.createChatRoom(userProfile.uid, otherUserId);
        console.log('✅ Chat room created/found:', newChatId);
        setChatId(newChatId);
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initializeChat();
  }, [userProfile?.uid, otherUserId]);

  // Subscribe to messages
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);

    const unsubscribe = firebaseChatService.subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    // Mark messages as read when component mounts
    firebaseChatService.markMessagesAsRead(chatId, userProfile.uid);

    return () => {
      unsubscribe();
      firebaseChatService.unsubscribeFromMessages(chatId);
    };
  }, [chatId, userProfile?.uid]);

  // Update user online status
  useEffect(() => {
    if (!userProfile?.uid) return;

    // Set user as online
    firebaseChatService.updateUserStatus(userProfile.uid, true);

    // Set user as offline when component unmounts
    return () => {
      firebaseChatService.updateUserStatus(userProfile.uid, false);
    };
  }, [userProfile?.uid]);

  // Send message
  const sendMessage = useCallback(async (text, type = 'text', mediaData = null) => {
    if (!chatId || (!text.trim() && !mediaData && type !== 'zenny_response')) return;

    try {
      let messageData;

      // Handle Zenny response messages
      if (type === 'zenny_response' && mediaData?.zennyMessage) {
        messageData = {
          ...mediaData.zennyMessage,
          isZennyMessage: true
        };
      } else {
        // Regular message
        messageData = {
          text: text.trim(),
          type,
          sender: {
            id: userProfile.uid,
            name: userProfile.displayName || 'You',
            avatar: userProfile.photoURL
          }
        };

        // Handle different types of media data
        if (mediaData) {
          if (type === 'gif' && mediaData.gifData) {
            messageData.gifData = mediaData.gifData;
            messageData.text = mediaData.gifData.url; // Set text to GIF URL for fallback
          } else {
            messageData.mediaData = mediaData;
          }
        }
      }

      const messageId = await firebaseChatService.sendMessage(chatId, userProfile.uid, messageData);

      // Simulate message delivery (skip for Zenny messages as they're already delivered)
      if (type !== 'zenny_response') {
        setTimeout(() => {
          firebaseChatService.updateMessageStatus(chatId, messageId, 'delivered');
        }, 1000);
      }

      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [chatId, userProfile]);

  // Send media message
  const sendMediaMessage = useCallback(async (file, caption = '') => {
    if (!chatId) return;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const mediaData = {
            url: e.target.result,
            name: file.name,
            size: file.size,
            type: file.type
          };

          let messageType = 'file';
          if (file.type.startsWith('image/')) {
            messageType = 'image';
          } else if (file.type.startsWith('video/')) {
            messageType = 'video';
          }

          const messageId = await sendMessage(caption, messageType, mediaData);
          resolve(messageId);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }, [chatId, sendMessage]);

  // Add reaction
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!chatId) return;

    try {
      await firebaseChatService.addReaction(chatId, messageId, userProfile.uid, emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }, [chatId, userProfile?.uid]);

  // Delete message (only for sender)
  const deleteMessage = useCallback(async (messageId) => {
    if (!chatId) return;

    try {
      // In a real implementation, you'd add a 'deleted' flag or remove the message
      // For now, we'll just update the message text
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        text: 'This message was deleted',
        deleted: true
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [chatId]);

  // Edit message (only for sender)
  const editMessage = useCallback(async (messageId, newText) => {
    if (!chatId) return;

    try {
      const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
      await updateDoc(messageRef, {
        text: newText,
        edited: true,
        editedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  }, [chatId]);

  // Set typing status
  const setTypingStatus = useCallback((isTyping) => {
    setTyping(isTyping);

    // In a real implementation, you'd send typing status to other users
    // This could be done through Firebase Realtime Database for instant updates
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    if (!chatId) return;
    firebaseChatService.markMessagesAsRead(chatId, userProfile.uid);
  }, [chatId, userProfile?.uid]);

  return {
    messages,
    loading,
    typing,
    otherUserTyping,
    sendMessage,
    sendMediaMessage,
    addReaction,
    deleteMessage,
    editMessage,
    setTypingStatus,
    markAsRead,
    chatId
  };
};
