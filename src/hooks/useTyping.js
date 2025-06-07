import { useState, useCallback, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

export const useTyping = (chatId) => {
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useUser();
  
  // Clear typing indicator after delay
  useEffect(() => {
    if (!isTyping) return;
    
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000); // Clear after 3 seconds of no typing
    
    return () => clearTimeout(timeout);
  }, [isTyping]);

  const startTyping = useCallback(() => {
    if (!chatId || !user?.id) return;
    setIsTyping(true);
  }, [chatId, user?.id]);

  const stopTyping = useCallback(() => {
    if (!chatId || !user?.id) return;
    setIsTyping(false);
  }, [chatId, user?.id]);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
};

export default useTyping; 