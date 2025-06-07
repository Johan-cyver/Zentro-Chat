import React, { useState, useEffect } from 'react';
import RealTimeDMSidebar from './RealTimeDMSidebar';
import RealTimeDMChatRoom from './RealTimeDMChatRoom';
import ZentroBotChat from './ZentroBotChat';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../Notifications/CustomNotificationSystem';
import notificationService from '../../services/notificationService';

const RealTimeDMView = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { currentTheme, changeTheme, isLoading: themeLoading } = useTheme();

  // Initialize notification service
  const notificationHandler = useNotifications();

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize(notificationHandler);
  }, [notificationHandler]);

  // Handle theme changes
  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToSidebar = () => {
    setSelectedChat(null);
  };

  // Check if this is Zentro Bot chat
  const isZentroBotChat = selectedChat?.otherUser?.id === 'zentro_bot' ||
                         selectedChat?.otherUser?.isBot ||
                         selectedChat?.id === 'zentro_bot_chat' ||
                         selectedChat?.name === 'Zentro Bot';

  return (
    <div
      className="flex h-screen"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Sidebar - Always visible with minimal theme */}
      <div className="flex flex-shrink-0">
        <RealTimeDMSidebar
          onSelectChat={handleSelectChat}
          selectedChat={selectedChat}
          currentTheme={currentTheme}
          isMinimal={selectedChat !== null}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          isZentroBotChat ? (
            <ZentroBotChat
              theme={currentTheme}
              onBack={handleBackToSidebar}
            />
          ) : (
            <RealTimeDMChatRoom
              chatUser={selectedChat.otherUser}
              chatId={selectedChat.id}
              onBack={handleBackToSidebar}
            />
          )
        ) : (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="text-center max-w-md mx-auto p-8">
              <div
                className="text-6xl mb-6"
                style={{ color: currentTheme.colors.textMuted }}
              >
                💬
              </div>
              <h2
                className="text-2xl font-bold mb-4"
                style={{ color: currentTheme.colors.text }}
              >
                Welcome to Zentro Messages
              </h2>
              <p
                className="text-lg mb-6"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Select a conversation from the sidebar to start chatting with friends in real-time,
                share media, and enjoy our beautiful themes.
              </p>
              <div className="space-y-3 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                <div className="flex items-center justify-center space-x-2">
                  <span>🔄</span>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>📸</span>
                  <span>Share photos and videos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🎨</span>
                  <span>Multiple beautiful themes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🤖</span>
                  <span>AI assistant (Zentro Bot)</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>😊</span>
                  <span>Reactions and replies</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeDMView;
