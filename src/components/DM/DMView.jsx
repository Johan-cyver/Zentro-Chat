import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RealTimeDMSidebar from './RealTimeDMSidebar';
import RealTimeDMChatRoom from './RealTimeDMChatRoom';
import ZentroBotChat from './ZentroBotChat';
import DataManager from '../Debug/DataManager';
import { getTheme, applyTheme, defaultTheme } from '../../styles/themes';
import { useUser } from '../../contexts/UserContext';

const DMView = () => {
  const location = useLocation();
  const userContext = useUser();
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('dm_theme');
    return savedTheme ? getTheme(savedTheme) : defaultTheme;
  });
  const [showDataManager, setShowDataManager] = useState(false);

  // Check for selectedChat from navigation state
  useEffect(() => {
    if (location.state?.selectedChat) {
      console.log('DMView: Setting selected chat from navigation:', location.state.selectedChat);
      setSelectedChat(location.state.selectedChat);
    }
  }, [location.state]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleBackToSidebar = () => {
    setSelectedChat(null);
  };

  return (
    <div
      className="flex w-full h-screen overflow-hidden"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Sidebar - Fixed width, always visible */}
      <div className="flex-shrink-0 w-80 h-full">
        <RealTimeDMSidebar
          onSelectChat={handleSelectChat}
          selectedChat={selectedChat}
          currentTheme={currentTheme}
        />
      </div>

      {/* Chat Area - Takes remaining space */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedChat ? (
          selectedChat?.otherUser?.id === 'zentro_bot' || selectedChat?.otherUser?.isBot || selectedChat.id === 'zentro_bot_chat' || selectedChat.name === 'Zenny' || selectedChat?.otherUser?.name === 'Zenny' ? (
            <ZentroBotChat
              theme={currentTheme}
              onBack={handleBackToSidebar}
            />
          ) : (
            <RealTimeDMChatRoom
              chatUser={selectedChat.otherUser || selectedChat}
              chatId={selectedChat.id}
              onBack={handleBackToSidebar}
              theme={currentTheme}
            />
          )
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto"
            style={{ backgroundColor: currentTheme.colors.surface }}
          >
            <div className="text-center w-full max-w-2xl">
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
                className="text-lg mb-4"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Select a conversation from the sidebar to start chatting with friends,
                share media, and enjoy our beautiful themes.
              </p>
              <div
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4 mb-6"
              >
                <p
                  className="text-sm"
                  style={{ color: currentTheme.colors.textSecondary }}
                >
                  🤖 <strong>AI Assistants Available:</strong> Chat with Zentro Bot for general assistance or Augment Agent for advanced code development, data analysis, and problem-solving!
                </p>
              </div>
              <div className="space-y-3 text-sm" style={{ color: currentTheme.colors.textSecondary }}>
                <div className="flex items-center justify-center space-x-2">
                  <span>📸</span>
                  <span>Share photos and videos</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🎨</span>
                  <span>Multiple beautiful themes</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>💬</span>
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>😊</span>
                  <span>Reactions and replies</span>
                </div>
              </div>

              {/* Debug Data Manager Button - Admin Only */}
              {userContext && userContext.canAccessDataManager && userContext.canAccessDataManager() && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowDataManager(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    🗑️ Data Manager (Admin)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Manager Modal */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
    </div>
  );
};

export default DMView;
