import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaImage, FaSmile, FaPalette, FaSearch, FaEllipsisV, FaArrowLeft, FaPhone, FaVideo, FaRobot } from 'react-icons/fa';
import { MdGif } from 'react-icons/md';
import Picker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';
import { useRealTimeDM } from '../../hooks/useRealTimeDM';
import { useMobileBehavior } from '../../hooks/useResponsive';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import MessageBubble from './MessageBubble';
import MediaUploader from './MediaUploader';
import EnhancedThemeSelector from './EnhancedThemeSelector';
import GifPicker from './GifPicker';
import firebaseChatService from '../../services/firebaseChat';
import notificationService from '../../services/notificationService';
import callService from '../../services/callService';
import zentroGeminiAI from '../../services/geminiAI';

const RealTimeDMChatRoom = ({ chatUser, chatId, onBack }) => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [zennyMode, setZennyMode] = useState(false);
  const [zennyTyping, setZennyTyping] = useState(false);

  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Use global theme context with per-DM theme support
  const { currentTheme, getDMTheme, setDMTheme } = useTheme();
  const [dmTheme, setDmTheme] = useState(() => getDMTheme(chatId));

  // Mobile behavior hook
  const { getEmojiPickerSize, shouldShowMobileLayout } = useMobileBehavior();

  // Add debugging
  useEffect(() => {
    console.log('🏠 RealTimeDMChatRoom props:', {
      chatUser,
      chatId,
      chatUserId: chatUser?.id,
      hookParam: chatId || chatUser?.id
    });
  }, [chatUser, chatId]);

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
    setTypingStatus,
    markAsRead
  } = useRealTimeDM(chatUser?.id); // Always use the friend's ID, never the chatId

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when component mounts or messages change
  useEffect(() => {
    markAsRead();
  }, [messages, markAsRead]);

  // Auto-resize textarea
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = messageInputRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() && !replyingTo) return;

    try {
      // Check if message starts with @zenny to invoke Zenny
      if (message.trim().toLowerCase().startsWith('@zenny')) {
        await handleZennyMessage(message.trim().substring(6).trim());
        return;
      }

      await sendMessage(message);
      setMessage('');
      setReplyingTo(null);
      setTypingStatus(false);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle Zenny AI integration in DMs
  const handleZennyMessage = async (zennyQuery) => {
    if (!zennyQuery.trim()) {
      // Show help message if no query provided
      const helpMessage = {
        id: Date.now(),
        text: `Hey! 👋 I'm Zenny, your AI assistant! You can ask me anything by typing @zenny followed by your question.\n\nFor example:\n• @zenny what's gravity?\n• @zenny help me with coding\n• @zenny explain quantum physics\n• @zenny tell me a joke\n• @zenny help with Zentro Chat features\n\nI can help with science, math, coding, general knowledge, and much more! 🤖`,
        type: 'text',
        sender: {
          id: 'zenny_ai',
          name: 'Zenny',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
        reactions: [],
        isZennyMessage: true
      };

      // Add Zenny help message to the DM
      await sendMessage('', 'zenny_response', { zennyMessage: helpMessage });
      setMessage('');
      return;
    }

    // Show user's Zenny query
    const userQuery = `@zenny ${zennyQuery}`;
    await sendMessage(userQuery);
    setMessage('');
    setZennyTyping(true);

    try {
      // Get AI response from Zenny
      const aiResponse = await zentroGeminiAI.sendMessage(userProfile.uid, zennyQuery, {
        userProfile: userProfile,
        dmContext: {
          chatUser: chatUser,
          isDirectMessage: true
        }
      });

      // Create Zenny response message
      const zennyMessage = {
        id: Date.now() + 1,
        text: aiResponse.response,
        type: 'text',
        sender: {
          id: 'zenny_ai',
          name: 'Zenny',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
        reactions: [],
        isZennyMessage: true
      };

      // Send Zenny's response to the DM
      await sendMessage('', 'zenny_response', { zennyMessage: zennyMessage });

    } catch (error) {
      console.error('Error getting Zenny response:', error);

      // Send error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now 🤖 Please try again in a moment!",
        type: 'text',
        sender: {
          id: 'zenny_ai',
          name: 'Zenny',
          avatar: null
        },
        timestamp: new Date().toISOString(),
        status: 'delivered',
        reactions: [],
        isZennyMessage: true
      };

      await sendMessage('', 'zenny_response', { zennyMessage: errorMessage });
    } finally {
      setZennyTyping(false);
    }
  };

  const handleKeyDown = (e) => {
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

  const handleReply = (messageToReply) => {
    setReplyingTo(messageToReply);
    messageInputRef.current?.focus();
  };

  const handleMediaSend = async (file, caption) => {
    try {
      await sendMediaMessage(file, caption);
    } catch (error) {
      console.error('Error sending media:', error);
    }
  };

  const handleGifSend = async (gif) => {
    try {
      // Send GIF as a special message type with proper format
      await sendMessage('', 'gif', {
        gifData: {
          url: gif.url,
          title: gif.title,
          webp: gif.webp,
          mp4: gif.mp4
        }
      });
      setShowGifPicker(false);
    } catch (error) {
      console.error('Error sending GIF:', error);
    }
  };

  const handleForward = (message) => {
    alert('Forward feature coming soon! You can forward this message to other chats.');
  };

  const handleViewProfile = () => {
    navigate(`/profile`, {
      state: {
        viewUser: {
          uid: chatUser.id,
          displayName: chatUser.name,
          photoURL: chatUser.avatar,
          email: chatUser.email
        },
        viewMode: 'personal',
        fromDM: true
      }
    });
  };

  const handleBlockUser = async () => {
    try {
      await firebaseChatService.blockUser(userProfile.uid, chatUser.id);
      alert(`User ${chatUser.name} has been blocked.`);
      setShowBlockConfirm(false);
      setShowOptionsMenu(false);
      // Navigate back to DM list
      onBack();
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    }
  };

  const handleReportUser = async (reason) => {
    try {
      await firebaseChatService.reportUser(userProfile.uid, chatUser.id, reason);
      alert(`User ${chatUser.name} has been reported for: ${reason}`);
      setShowReportModal(false);
      setShowOptionsMenu(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to report user. Please try again.');
    }
  };

  const handleStartCall = async (type) => {
    try {
      const targetUser = {
        id: chatUser.id,
        name: chatUser.name,
        avatar: chatUser.avatar,
        email: chatUser.email
      };

      const currentUserData = {
        id: userProfile.uid,
        name: userProfile.displayName,
        avatar: userProfile.photoURL,
        email: userProfile.email
      };

      let callId;
      switch (type.toLowerCase()) {
        case 'voice':
          callId = await callService.startVoiceCall(targetUser, currentUserData);
          break;
        case 'video':
          callId = await callService.startVideoCall(targetUser, currentUserData);
          break;
        case 'screen':
          callId = await callService.startScreenShare(targetUser, currentUserData);
          break;
        default:
          throw new Error('Invalid call type');
      }

      console.log(`✅ ${type} call started:`, callId);
    } catch (error) {
      console.error(`Error starting ${type.toLowerCase()} call:`, error);
    }
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg =>
        msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

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

  // Filter out "Unknown User" entries
  if (chatUser?.name === 'Unknown User' || !chatUser?.name) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500">User data unavailable</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Use DM-specific theme if available, otherwise use global theme
  const activeTheme = dmTheme || currentTheme;

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden relative"
      style={{
        backgroundColor: activeTheme.customBackground ? 'transparent' : activeTheme.colors.background,
        color: activeTheme.colors.text
      }}
    >
      {/* Custom Background */}
      {activeTheme.customBackground && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${activeTheme.customBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      )}
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 lg:p-4 border-b shadow-sm flex-shrink-0 relative z-10"
        style={{
          backgroundColor: activeTheme.colors.surface,
          borderColor: activeTheme.colors.borderMuted
        }}
      >
        <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
          >
            <FaArrowLeft />
          </button>

          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-gray-300">
                {chatUser.avatar ? (
                  <img
                    src={chatUser.avatar}
                    alt={chatUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white bg-gray-500 text-xs lg:text-sm">
                    {chatUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>
              {chatUser.online && (
                <div className="absolute bottom-0 right-0 w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-sm lg:text-base truncate cursor-pointer hover:text-purple-400 transition-colors"
                style={{ color: activeTheme.colors.text }}
                onClick={handleViewProfile}
                title="View profile"
              >
                {chatUser?.name || 'Unknown User'}
              </h3>
              <p
                className="text-xs lg:text-sm truncate"
                style={{ color: activeTheme.colors.textMuted }}
              >
                {zennyTyping ? (
                  <span className="flex items-center space-x-1">
                    <FaRobot className="text-purple-400" />
                    <span className="text-purple-400">Zenny is thinking...</span>
                  </span>
                ) : otherUserTyping ? 'typing...' : chatUser?.online ? 'online' : 'offline'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
          <button
            onClick={() => {
              setMessage('@zenny ');
              messageInputRef.current?.focus();
            }}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
            title="Ask Zenny (AI Assistant)"
          >
            <FaRobot className="text-sm lg:text-base text-purple-500 hover:text-purple-400" />
          </button>
          <button
            onClick={() => handleStartCall('voice')}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
            title="Start voice call"
          >
            <FaPhone className="text-sm lg:text-base text-green-500 hover:text-green-400" />
          </button>
          <button
            onClick={() => handleStartCall('video')}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
            title="Start video call"
          >
            <FaVideo className="text-sm lg:text-base text-blue-500 hover:text-blue-400" />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Search messages"
          >
            <FaSearch className="text-sm lg:text-base" style={{ color: activeTheme.colors.textMuted }} />
          </button>
          <button
            onClick={() => setShowThemeSelector(true)}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Change theme"
          >
            <FaPalette className="text-sm lg:text-base" style={{ color: activeTheme.colors.textMuted }} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="More options"
            >
              <FaEllipsisV className="text-sm lg:text-base" style={{ color: activeTheme.colors.textMuted }} />
            </button>

            {/* Options Dropdown Menu */}
            {showOptionsMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
                style={{ backgroundColor: activeTheme.colors.surface }}
              >
                <button
                  onClick={handleViewProfile}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
                  style={{ color: activeTheme.colors.text }}
                >
                  <span>👤</span>
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowBlockConfirm(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm text-red-400"
                >
                  <span>🚫</span>
                  <span>Block User</span>
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(true);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm text-orange-400"
                >
                  <span>🚩</span>
                  <span>Report User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div
          className="p-4 border-b relative z-10"
          style={{
            backgroundColor: activeTheme.colors.surfaceVariant,
            borderColor: activeTheme.colors.borderMuted
          }}
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: activeTheme.colors.inputBackground,
              borderColor: activeTheme.colors.borderMuted,
              color: activeTheme.colors.text
            }}
          />
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1 relative z-10">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="text-6xl mb-4"
                style={{ color: activeTheme.colors.textMuted }}
              >
                💬
              </div>
              <p
                className="text-lg font-medium mb-2"
                style={{ color: activeTheme.colors.text }}
              >
                Start a conversation
              </p>
              <p
                className="text-sm"
                style={{ color: activeTheme.colors.textMuted }}
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
                onForward={handleForward}
                theme={activeTheme}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div
          className="px-4 py-2 border-t border-b relative z-10"
          style={{
            backgroundColor: activeTheme.colors.surfaceVariant,
            borderColor: activeTheme.colors.borderMuted
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p
                className="text-sm font-medium"
                style={{ color: activeTheme.colors.text }}
              >
                Replying to {replyingTo.sender.name}
              </p>
              <p
                className="text-sm truncate"
                style={{ color: activeTheme.colors.textMuted }}
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
        className="p-2 lg:p-4 border-t flex-shrink-0 relative z-10"
        style={{
          backgroundColor: activeTheme.colors.surface,
          borderColor: activeTheme.colors.borderMuted
        }}
      >
        <div className="flex items-end space-x-1 lg:space-x-2">
          {/* Media Button */}
          <button
            onClick={() => setShowMediaUploader(true)}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            title="Send media"
          >
            <FaImage className="text-sm lg:text-base" style={{ color: activeTheme.colors.primary }} />
          </button>

          {/* GIF Button */}
          <button
            onClick={() => setShowGifPicker(true)}
            className="p-1.5 lg:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            title="Send GIF"
          >
            <MdGif className="text-sm lg:text-base" style={{ color: activeTheme.colors.primary }} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={messageInputRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${chatUser?.name || 'user'}... (Type @zenny to ask AI)`}
              className="w-full px-3 lg:px-4 py-2 pr-10 lg:pr-12 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32 text-sm lg:text-base"
              style={{
                backgroundColor: activeTheme.colors.inputBackground,
                borderColor: activeTheme.colors.borderMuted,
                color: activeTheme.colors.text
              }}
              rows={1}
            />

            {/* Emoji Button */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <FaSmile className="text-sm lg:text-base" style={{ color: activeTheme.colors.textMuted }} />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && !replyingTo}
            className="p-1.5 lg:p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              backgroundColor: activeTheme.colors.primary,
              color: 'white'
            }}
          >
            <FaPaperPlane className="text-sm lg:text-base" />
          </button>
        </div>

        {/* Typing Indicator */}
        {typing && (
          <p
            className="text-xs mt-2"
            style={{ color: activeTheme.colors.textMuted }}
          >
            You are typing...
          </p>
        )}
      </div>

      {/* Emoji Picker - Improved positioning */}
      {showEmojiPicker && (
        <div className={`absolute bottom-20 z-50 lg:bottom-24 ${shouldShowMobileLayout ? 'left-2 right-2' : 'right-4 lg:right-8'}`}>
          <div className={shouldShowMobileLayout ? '' : 'transform -translate-x-full lg:translate-x-0'}>
            <Picker
              onEmojiClick={handleEmojiClick}
              {...getEmojiPickerSize()}
            />
          </div>
        </div>
      )}

      {/* Media Uploader Modal */}
      {showMediaUploader && (
        <MediaUploader
          onSendMedia={handleMediaSend}
          onClose={() => setShowMediaUploader(false)}
          theme={activeTheme}
        />
      )}

      {/* GIF Picker Modal */}
      {showGifPicker && (
        <GifPicker
          onGifSelect={handleGifSend}
          onClose={() => setShowGifPicker(false)}
          theme={activeTheme}
        />
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <EnhancedThemeSelector
          currentTheme={activeTheme}
          chatId={chatId}
          onThemeChange={(newTheme) => {
            // Set DM-specific theme
            setDMTheme(chatId, newTheme);
            setDmTheme(newTheme);
            setShowThemeSelector(false);
          }}
          onClose={() => setShowThemeSelector(false)}
        />
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Block User</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to block {chatUser.name}? You won't receive messages from them anymore.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Report User</h3>
            <p className="text-gray-300 mb-4">Why are you reporting {chatUser.name}?</p>
            <div className="space-y-2 mb-6">
              {['Spam', 'Harassment', 'Inappropriate Content', 'Fake Profile', 'Other'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => handleReportUser(reason)}
                  className="w-full px-4 py-2 text-left bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeDMChatRoom;
