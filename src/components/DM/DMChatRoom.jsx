import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaImage, FaSmile, FaPalette, FaSearch, FaPhone, FaVideo, FaEllipsisV, FaArrowLeft, FaMicrophone } from 'react-icons/fa';
import Picker from 'emoji-picker-react';
import { useDMChat } from '../../hooks/useDMChat';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import MessageBubble from './MessageBubble';
import MediaUploader from './MediaUploader';
import DMThemeSelector from './DMThemeSelector';
import ZentroBotChat from './ZentroBotChat';

const DMChatRoom = ({ chatUser, onBack }) => {
  const { userProfile } = useUser();
  const { currentTheme, changeTheme } = useTheme();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatId = `${userProfile?.uid || 'unknown'}_${chatUser?.id || 'unknown'}`.split('').sort().join('');

  const {
    messages,
    loading,
    typing,
    otherUserTyping,
    sendMessage,
    sendMediaMessage,
    addReaction,
    deleteMessage,
    editMessage,
    replyToMessage,
    setTypingStatus,
    searchMessages
  } = useDMChat(chatId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() && !replyingTo) return;

    if (replyingTo) {
      replyToMessage(replyingTo.id, message);
      setReplyingTo(null);
    } else {
      sendMessage(message);
    }

    setMessage('');
    setTypingStatus(false);
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    setTypingStatus(e.target.value.length > 0);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleThemeChange = (theme) => {
    changeTheme(theme);
  };

  const handleReply = (messageToReply) => {
    setReplyingTo(messageToReply);
    messageInputRef.current?.focus();
  };

  const filteredMessages = searchQuery ? searchMessages(searchQuery) : messages;

  // Safety check for chatUser - after all hooks
  if (!chatUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">No chat selected</p>
        </div>
      </div>
    );
  }

  // Check if this is Zenny chat
  const isZentroBotChat = chatUser?.id === 'zentro_bot' || chatUser?.name === 'Zenny' || chatUser?.isBot;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Render Zenny specialized chat interface
  if (isZentroBotChat) {
    return <ZentroBotChat theme={currentTheme} onBack={onBack} />;
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b shadow-sm"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.borderMuted
        }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaArrowLeft />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
                {chatUser.avatar ? (
                  <img
                    src={chatUser.avatar}
                    alt={chatUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-500">
                    {chatUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              {chatUser.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <div>
              <h3
                className="font-semibold"
                style={{ color: currentTheme.colors.text }}
              >
                {chatUser?.name || 'Unknown User'}
              </h3>
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.textMuted }}
              >
                {otherUserTyping ? 'typing...' : chatUser?.online ? 'online' : 'offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Search messages"
          >
            <FaSearch style={{ color: currentTheme.colors.textMuted }} />
          </button>
          <button
            onClick={() => setShowThemeSelector(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Change theme"
          >
            <FaPalette style={{ color: currentTheme.colors.textMuted }} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FaPhone style={{ color: currentTheme.colors.textMuted }} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FaVideo style={{ color: currentTheme.colors.textMuted }} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FaEllipsisV style={{ color: currentTheme.colors.textMuted }} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div
          className="p-4 border-b"
          style={{
            backgroundColor: currentTheme.colors.surfaceVariant,
            borderColor: currentTheme.colors.borderMuted
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: currentTheme.colors.inputBackground,
              borderColor: currentTheme.colors.borderMuted,
              color: currentTheme.colors.text
            }}
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="text-6xl mb-4"
                style={{ color: currentTheme.colors.textMuted }}
              >
                💬
              </div>
              <p
                className="text-lg font-medium mb-2"
                style={{ color: currentTheme.colors.text }}
              >
                Start a conversation
              </p>
              <p
                className="text-sm"
                style={{ color: currentTheme.colors.textMuted }}
              >
                Send a message to {chatUser?.name || 'this user'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {filteredMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onReply={handleReply}
                onDelete={deleteMessage}
                onEdit={editMessage}
                onReaction={addReaction}
                theme={currentTheme}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div
          className="px-4 py-2 border-t border-b"
          style={{
            backgroundColor: currentTheme.colors.surfaceVariant,
            borderColor: currentTheme.colors.borderMuted
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-sm font-medium"
                style={{ color: currentTheme.colors.text }}
              >
                Replying to {replyingTo.sender.name}
              </p>
              <p
                className="text-sm truncate"
                style={{ color: currentTheme.colors.textMuted }}
              >
                {replyingTo.text}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div
        className="p-4 border-t"
        style={{
          backgroundColor: currentTheme.colors.surface,
          borderColor: currentTheme.colors.borderMuted
        }}
      >
        <div className="flex items-end space-x-2">
          {/* Media Button */}
          <button
            onClick={() => setShowMediaUploader(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Send media"
          >
            <FaImage style={{ color: currentTheme.colors.primary }} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${chatUser?.name || 'user'}...`}
              className="w-full px-4 py-2 pr-12 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
              style={{
                backgroundColor: currentTheme.colors.inputBackground,
                borderColor: currentTheme.colors.borderMuted,
                color: currentTheme.colors.text
              }}
              rows={1}
            />

            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaSmile style={{ color: currentTheme.colors.textMuted }} />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && !replyingTo}
            className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentTheme.colors.primary,
              color: 'white'
            }}
          >
            <FaPaperPlane />
          </button>
        </div>

        {/* Typing Indicator */}
        {typing && (
          <p
            className="text-xs mt-2"
            style={{ color: currentTheme.colors.textMuted }}
          >
            You are typing...
          </p>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50">
          <Picker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Media Uploader Modal */}
      {showMediaUploader && (
        <MediaUploader
          onSendMedia={sendMediaMessage}
          onClose={() => setShowMediaUploader(false)}
          theme={currentTheme}
        />
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <DMThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          onClose={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};

export default DMChatRoom;
