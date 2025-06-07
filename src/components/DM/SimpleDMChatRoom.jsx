import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaSmile, FaCircle } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const SimpleDMChatRoom = ({ chatUser, onBack, theme }) => {
  const { userProfile } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages from localStorage
  useEffect(() => {
    if (chatUser?.id && userProfile?.uid) {
      loadMessages();
    }
  }, [chatUser?.id, userProfile?.uid]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    try {
      const chatKey = `zentro_chat_${getChatId()}`;
      const savedMessages = localStorage.getItem(chatKey);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        // Initialize with welcome message for new chats
        if (!chatUser.isBot) {
          const welcomeMessage = {
            id: Date.now(),
            text: `👋 Say hello to ${chatUser.name}!`,
            sender: {
              id: 'system',
              name: 'System',
              avatar: null
            },
            timestamp: new Date().toISOString(),
            type: 'system'
          };
          setMessages([welcomeMessage]);
          saveMessages([welcomeMessage]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessages = (messagesToSave) => {
    try {
      const chatKey = `zentro_chat_${getChatId()}`;
      localStorage.setItem(chatKey, JSON.stringify(messagesToSave));
      
      // Update recent chats
      updateRecentChat(messagesToSave[messagesToSave.length - 1]);
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const updateRecentChat = (lastMessage) => {
    try {
      const recentChatsKey = `zentro_recent_chats_${userProfile.uid}`;
      const savedChats = localStorage.getItem(recentChatsKey);
      let recentChats = savedChats ? JSON.parse(savedChats) : [];

      // Update or add chat
      const chatIndex = recentChats.findIndex(chat => chat.otherUser.id === chatUser.id);
      const updatedChat = {
        id: `chat_${chatUser.id}`,
        otherUser: chatUser,
        lastMessage: lastMessage.text,
        lastMessageTime: lastMessage.timestamp,
        unreadCount: 0
      };

      if (chatIndex >= 0) {
        recentChats[chatIndex] = updatedChat;
      } else {
        recentChats.unshift(updatedChat);
      }

      // Keep only last 20 chats
      recentChats = recentChats.slice(0, 20);
      localStorage.setItem(recentChatsKey, JSON.stringify(recentChats));
    } catch (error) {
      console.error('Error updating recent chat:', error);
    }
  };

  const getChatId = () => {
    if (chatUser.isBot) return 'zentro_bot';
    const ids = [userProfile.uid, chatUser.id].sort();
    return ids.join('_');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage.trim(),
      sender: {
        id: userProfile.uid,
        name: userProfile.displayName || 'You',
        avatar: userProfile.photoURL
      },
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage('');

    // Simulate other user typing and response (for demo)
    if (!chatUser.isBot) {
      simulateResponse(updatedMessages);
    }
  };

  const simulateResponse = (currentMessages) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "Hey! How's it going?",
        "Nice to meet you!",
        "Thanks for reaching out!",
        "What's up?",
        "Hello there! 👋",
        "Great to hear from you!",
        "How are you doing today?",
        "Thanks for the message!"
      ];

      const response = {
        id: Date.now() + 1,
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: {
          id: chatUser.id,
          name: chatUser.name,
          avatar: chatUser.avatar
        },
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      const newMessages = [...currentMessages, response];
      setMessages(newMessages);
      saveMessages(newMessages);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!chatUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: theme?.colors?.textMuted }}>Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div 
        className="flex items-center p-4 border-b"
        style={{ 
          backgroundColor: theme?.colors?.surface,
          borderColor: theme?.colors?.borderMuted 
        }}
      >
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FaArrowLeft style={{ color: theme?.colors?.text }} />
        </button>

        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
              {chatUser.isBot ? (
                <div 
                  className="w-full h-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: theme?.colors?.primary || '#8B5CF6' }}
                >
                  🤖
                </div>
              ) : chatUser.avatar ? (
                <img 
                  src={chatUser.avatar} 
                  alt={chatUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white bg-purple-600 font-medium">
                  {chatUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {chatUser.online && !chatUser.isBot && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div>
            <h3 className="font-medium" style={{ color: theme?.colors?.text }}>
              {chatUser.name}
            </h3>
            <div className="flex items-center gap-1">
              <FaCircle 
                className={`text-xs ${chatUser.online ? 'text-green-500' : 'text-gray-500'}`} 
              />
              <span className="text-xs" style={{ color: theme?.colors?.textMuted }}>
                {chatUser.isBot ? 'AI Assistant' : chatUser.online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender.id === userProfile.uid ? 'justify-end' : 'justify-start'
            } ${message.type === 'system' ? 'justify-center' : ''}`}
          >
            {message.type === 'system' ? (
              <div className="text-center">
                <span 
                  className="text-xs px-3 py-1 rounded-full bg-gray-600 text-gray-300"
                >
                  {message.text}
                </span>
              </div>
            ) : (
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.id === userProfile.uid
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div 
        className="p-4 border-t"
        style={{ 
          backgroundColor: theme?.colors?.surface,
          borderColor: theme?.colors?.borderMuted 
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                backgroundColor: theme?.colors?.inputBackground || '#374151',
                borderColor: theme?.colors?.borderMuted || '#4B5563',
                color: theme?.colors?.text || '#FFFFFF'
              }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaPaperPlane className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDMChatRoom;
