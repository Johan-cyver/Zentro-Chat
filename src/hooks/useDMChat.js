import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export const useDMChat = (chatId) => {
  const { userProfile } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  // Load messages from localStorage
  useEffect(() => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const savedMessages = localStorage.getItem(`dm_chat_${chatId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Save messages to localStorage
  const saveMessages = useCallback((newMessages) => {
    if (!chatId) return;
    
    try {
      localStorage.setItem(`dm_chat_${chatId}`, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [chatId]);

  // Send a text message
  const sendMessage = useCallback((text, type = 'text', mediaData = null) => {
    if (!text.trim() && !mediaData) return;

    const newMessage = {
      id: Date.now() + Math.random(),
      text: text.trim(),
      type, // 'text', 'image', 'video', 'file'
      mediaData,
      sender: {
        id: userProfile.uid,
        name: userProfile.displayName || 'You',
        avatar: userProfile.photoURL
      },
      timestamp: new Date().toISOString(),
      status: 'sent', // 'sent', 'delivered', 'read'
      reactions: [],
      replyTo: null
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    // Simulate message delivery after a short delay
    setTimeout(() => {
      updateMessageStatus(newMessage.id, 'delivered');
    }, 1000);

    return newMessage;
  }, [messages, userProfile, saveMessages]);

  // Send media message
  const sendMediaMessage = useCallback((file, caption = '') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
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

        const message = sendMessage(caption, messageType, mediaData);
        resolve(message);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }, [sendMessage]);

  // Update message status
  const updateMessageStatus = useCallback((messageId, status) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      );
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // Add reaction to message
  const addReaction = useCallback((messageId, emoji) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => 
            r.userId === userProfile.uid && r.emoji === emoji
          );

          if (existingReaction) {
            // Remove reaction if it already exists
            return {
              ...msg,
              reactions: msg.reactions.filter(r => r !== existingReaction)
            };
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...msg.reactions, {
                userId: userProfile.uid,
                userName: userProfile.displayName,
                emoji,
                timestamp: new Date().toISOString()
              }]
            };
          }
        }
        return msg;
      });
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [userProfile, saveMessages]);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.filter(msg => msg.id !== messageId);
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // Edit message
  const editMessage = useCallback((messageId, newText) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: newText, edited: true, editedAt: new Date().toISOString() }
          : msg
      );
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // Reply to message
  const replyToMessage = useCallback((originalMessageId, replyText) => {
    const originalMessage = messages.find(msg => msg.id === originalMessageId);
    if (!originalMessage) return;

    const replyMessage = {
      id: Date.now() + Math.random(),
      text: replyText.trim(),
      type: 'text',
      sender: {
        id: userProfile.uid,
        name: userProfile.displayName || 'You',
        avatar: userProfile.photoURL
      },
      timestamp: new Date().toISOString(),
      status: 'sent',
      reactions: [],
      replyTo: {
        id: originalMessage.id,
        text: originalMessage.text,
        sender: originalMessage.sender
      }
    };

    const updatedMessages = [...messages, replyMessage];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);

    return replyMessage;
  }, [messages, userProfile, saveMessages]);

  // Simulate typing indicator
  const setTypingStatus = useCallback((isTyping) => {
    setTyping(isTyping);
    
    // In a real app, this would send typing status to other users
    // For now, we'll simulate the other user typing occasionally
    if (isTyping && Math.random() > 0.7) {
      setOtherUserTyping(true);
      setTimeout(() => setOtherUserTyping(false), 2000);
    }
  }, []);

  // Search messages
  const searchMessages = useCallback((query) => {
    if (!query.trim()) return messages;
    
    return messages.filter(msg => 
      msg.text.toLowerCase().includes(query.toLowerCase()) ||
      msg.sender.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [messages]);

  // Get message statistics
  const getStats = useCallback(() => {
    return {
      totalMessages: messages.length,
      mediaMessages: messages.filter(msg => ['image', 'video', 'file'].includes(msg.type)).length,
      myMessages: messages.filter(msg => msg.sender.id === userProfile.uid).length,
      otherMessages: messages.filter(msg => msg.sender.id !== userProfile.uid).length
    };
  }, [messages, userProfile.uid]);

  return {
    messages,
    loading,
    typing,
    otherUserTyping,
    sendMessage,
    sendMediaMessage,
    updateMessageStatus,
    addReaction,
    deleteMessage,
    editMessage,
    replyToMessage,
    setTypingStatus,
    searchMessages,
    getStats
  };
};
