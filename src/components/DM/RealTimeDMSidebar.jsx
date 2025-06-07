import React, { useState } from 'react';
import { FaSearch, FaRobot, FaTimes, FaUserPlus, FaSpinner, FaTrash } from 'react-icons/fa';
import { useRealTimeChatList } from '../../hooks/useRealTimeChatList';
import ConversationSearch from './ConversationSearch';
import FriendSuggestions from '../Friends/FriendSuggestions';

const RealTimeDMSidebar = ({ onSelectChat, selectedChat, currentTheme, isMinimal = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationSearch, setShowConversationSearch] = useState(false);

  const { chats, loading, startNewChat, deleteChat } = useRealTimeChatList();

  const filteredChats = chats.filter(chat =>
    chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    chat.otherUser.name !== 'Unknown User' &&
    chat.otherUser.name.trim() !== ''
  );

  // Temporary function to clear localStorage and start fresh
  const clearAllData = () => {
    if (window.confirm('Clear all localStorage data and start fresh? This will remove all friends, chats, and user data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };



  const handleStartNewChat = async (user) => {
    try {
      const chatId = await startNewChat(user.id);
      if (chatId) {
        // The chat will appear in the list automatically due to real-time subscription
        console.log('New chat started:', chatId);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
    }
  };

  const handleDeleteChat = async (chatId, chatName, e) => {
    e.stopPropagation(); // Prevent chat selection

    if (window.confirm(`Are you sure you want to delete the conversation with ${chatName}? This action cannot be undone.`)) {
      try {
        if (deleteChat) {
          await deleteChat(chatId);
        }
        // If this was the selected chat, clear selection
        if (selectedChat?.id === chatId) {
          onSelectChat(null);
        }
      } catch (error) {
        console.error('Error deleting chat:', error);
        alert('Failed to delete chat. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div
        className="w-80 h-full flex items-center justify-center border-r"
        style={{
          backgroundColor: currentTheme?.colors?.surface || '#1F2937',
          borderColor: currentTheme?.colors?.borderMuted || '#374151'
        }}
      >
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin" style={{ color: currentTheme?.colors?.primary }} />
          <span style={{ color: currentTheme?.colors?.text }}>Loading chats...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${isMinimal ? 'w-16' : 'w-80'} h-full flex flex-col border-r transition-all duration-300`}
      style={{
        backgroundColor: currentTheme?.colors?.surface || '#1F2937',
        borderColor: currentTheme?.colors?.borderMuted || '#374151'
      }}
    >
      {/* Header */}
      {!isMinimal && (
        <div className="p-4 border-b" style={{ borderColor: currentTheme?.colors?.borderMuted }}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-bold"
              style={{ color: currentTheme?.colors?.text || '#FFFFFF' }}
            >
              Messages
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConversationSearch(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Find people & chat requests"
              >
                <FaUserPlus style={{ color: currentTheme?.colors?.primary || '#8B5CF6' }} />
              </button>
              <button
                onClick={clearAllData}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Clear All Data (Debug)"
              >
                <FaTrash style={{ color: '#EF4444' }} />
              </button>
            </div>
          </div>

        {/* Search */}
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"
            style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: currentTheme?.colors?.inputBackground || '#FFFFFF',
              borderColor: currentTheme?.colors?.borderMuted || '#D1D5DB',
              color: currentTheme?.colors?.text || '#1F2937'
            }}
          />
        </div>


      </div>
      )}

      {/* Friend Suggestions Section - Hidden in minimal mode */}
      {!isMinimal && (
        <div className="border-b" style={{ borderColor: currentTheme?.colors?.borderMuted }}>
          <FriendSuggestions />
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className={`flex items-center justify-center h-32 ${isMinimal ? 'px-2' : ''}`}>
            {!isMinimal && (
              <p style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}>
                No conversations found
              </p>
            )}
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`group flex items-center ${isMinimal ? 'p-2 justify-center' : 'p-4'} cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              style={{
                backgroundColor: selectedChat?.id === chat.id
                  ? currentTheme?.colors?.surfaceVariant
                  : 'transparent'
              }}
              title={isMinimal ? chat.otherUser.name : ''}
            >
              {/* Avatar */}
              <div className={`relative flex-shrink-0 ${isMinimal ? 'mr-0' : 'mr-3'}`}>
                <div className={`${isMinimal ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden bg-gray-300`}>
                  {chat.otherUser.isBot ? (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: currentTheme?.colors?.primary || '#8B5CF6' }}
                    >
                      <FaRobot className="text-lg" />
                    </div>
                  ) : chat.otherUser.avatar ? (
                    <img
                      src={chat.otherUser.avatar}
                      alt={chat.otherUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white bg-gray-500 font-medium">
                      {chat.otherUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {chat.otherUser.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content - Hidden in minimal mode */}
              {!isMinimal && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="font-medium truncate"
                      style={{ color: currentTheme?.colors?.text || '#1F2937' }}
                    >
                      {chat.otherUser.isBot ? 'Zenny' : chat.otherUser.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className="text-xs"
                        style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
                      >
                        {formatTime(chat.lastMessageTime)}
                      </span>
                      {chat.unreadCount > 0 && (
                        <div
                          className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ backgroundColor: currentTheme?.colors?.primary || '#8B5CF6' }}
                        >
                          {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                        </div>
                      )}
                      {/* Delete Chat Button - Removed as requested */}
                    </div>
                  </div>
                  <p
                    className="text-sm truncate"
                    style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
                  >
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
              )}

              {/* Unread indicator for minimal mode */}
              {isMinimal && chat.unreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                  style={{ backgroundColor: currentTheme?.colors?.primary || '#8B5CF6' }}
                >
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Conversation Search Modal */}
      {showConversationSearch && (
        <ConversationSearch
          onSelectUser={(user) => {
            handleStartNewChat(user);
            setShowConversationSearch(false);
          }}
          onClose={() => setShowConversationSearch(false)}
          currentTheme={currentTheme}
        />
      )}
    </div>
  );
};

export default RealTimeDMSidebar;
