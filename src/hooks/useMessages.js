import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';

export const useMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Load messages from localStorage
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const savedMessages = localStorage.getItem(`chat_messages_${chatId}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Save messages to localStorage
  const saveMessages = useCallback((newMessages) => {
    if (!chatId) return;
    try {
      localStorage.setItem(`chat_messages_${chatId}`, JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [chatId]);

  // Send a new message
  const sendMessage = useCallback((messageData) => {
    if (!chatId || !user?.id) return;

    const newMessage = {
      id: Date.now().toString(),
      ...messageData,
      senderId: user.id,
      timestamp: Date.now()
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [chatId, user?.id, saveMessages]);

  return {
    messages,
    isLoading,
    sendMessage
  };
};

export default useMessages; 