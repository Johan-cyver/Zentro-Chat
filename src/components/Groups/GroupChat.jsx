import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaUsers, FaCog, FaRobot, FaArrowLeft, FaSmile, FaReply, FaTrash, FaShare, FaTimes, FaUserShield, FaPhone, FaVideo, FaDesktop, FaPalette, FaPhoneSlash } from 'react-icons/fa';
import { MdGif } from 'react-icons/md';
import Picker from 'emoji-picker-react';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import groupService from '../../services/groupService';
import zentroGeminiAI from '../../services/geminiAI';
import GifPicker from '../DM/GifPicker';
import userDataSync from '../../utils/userDataSync';
import RoleManagement from './RoleManagement';
import EnhancedThemeSelector from '../DM/EnhancedThemeSelector';
import callService from '../../services/callService';

const GroupChat = ({ group, onBack, onShowMembers, onShowSettings }) => {
  const { userProfile } = useUser();
  const { currentTheme, getGroupTheme, setGroupTheme } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMessageActions, setShowMessageActions] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  // Get group-specific theme
  const [groupTheme, setGroupThemeState] = useState(() => getGroupTheme(group.id));
  const activeTheme = groupTheme || currentTheme;

  // Update group theme when group changes
  useEffect(() => {
    if (group?.id) {
      const theme = getGroupTheme(group.id);
      setGroupThemeState(theme);
    }
  }, [group?.id, getGroupTheme]);

  // Listen for call events
  useEffect(() => {
    const unsubscribe = callService.addCallListener((event, data) => {
      switch (event) {
        case 'call_started':
          if (data.callee.id === group.id || data.caller.id === userProfile.uid) {
            setActiveCall(data);
          }
          break;
        case 'call_accepted':
          if (data.callee.id === group.id || data.caller.id === userProfile.uid) {
            setActiveCall(data);
          }
          break;
        case 'call_ended':
        case 'call_declined':
          setActiveCall(null);
          setCallDuration(0);
          break;
        case 'call_timer_update':
          if (activeCall && data.callId === activeCall.id) {
            setCallDuration(data.duration);
          }
          break;
        default:
          // Handle unknown events
          break;
      }
    });

    return unsubscribe;
  }, [group.id, userProfile.uid, activeCall]);
  const messagesEndRef = useRef(null);

  // Load group messages
  useEffect(() => {
    if (group?.id) {
      const groupMessages = groupService.getGroupMessages(group.id);
      setMessages(groupMessages);
    }
  }, [group?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to resolve user name from ID
  const resolveUserName = (userId) => {
    console.log('🔍 Resolving user name for ID:', userId);

    if (userId === userProfile?.uid) {
      console.log('✅ Current user detected:', userProfile.displayName || userProfile.email);
      return userProfile.displayName || userProfile.email || 'You';
    }

    if (userId === 'zentro_bot' || userId === 'zenny_bot') {
      console.log('🤖 Bot detected');
      return 'Zenny';
    }

    // Use the utility to get user name
    const resolvedName = userDataSync.getUserDisplayName(userId);
    console.log('✅ Resolved name using utility:', resolvedName);

    // Also run debug to see what's in storage
    userDataSync.debugUserData();

    return resolvedName;
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !group?.id) return;

    try {
      // Create user message
      const userMessage = {
        text: text.trim(),
        sender: {
          id: userProfile.uid,
          name: userProfile.displayName || userProfile.email || 'You',
          avatar: userProfile.photoURL
        },
        type: 'text',
        replyTo: replyingTo
      };

      // Send message to group
      const savedMessage = groupService.sendGroupMessage(group.id, userMessage);

      // Update local messages
      const updatedMessages = [...messages, savedMessage];
      setMessages(updatedMessages);

      // Clear reply state
      setReplyingTo(null);

      // Check if message is for Zenny
      if (text.toLowerCase().includes('zenny')) {
        await handleZennyMessage(text, updatedMessages);
      }

    } catch (error) {
      console.error('Error sending group message:', error);
    }
  };

  const handleZennyMessage = async (text, currentMessages) => {
    if (!group.members.includes('zenny_bot')) {
      // Auto-add Zenny if mentioned
      try {
        await groupService.addZennyToGroup(group.id);
        // Reload messages to include bot's welcome message
        const updatedMessages = groupService.getGroupMessages(group.id);
        setMessages(updatedMessages);
      } catch (error) {
        console.error('Error adding Zenny:', error);
        return;
      }
    }

    setIsTyping(true);

    try {
      let botResponse;

      // Check for specific commands first
      const command = groupService.handleZennyCommand(group.id, text, userProfile.uid);
      if (command) {
        botResponse = command;
      } else {
        // Use AI for general responses
        try {
          const aiResponse = await zentroGeminiAI.sendMessage(userProfile.uid, text, {
            userProfile: userProfile,
            context: `Group chat: ${group.name}`,
            isGroupChat: true,
            groupMembers: group.members?.length || 1
          });

          // Extract text from AI response object
          if (typeof aiResponse === 'string') {
            botResponse = aiResponse;
          } else if (aiResponse && typeof aiResponse === 'object') {
            botResponse = aiResponse.response || aiResponse.text || aiResponse.message ||
                        (aiResponse.success ? "Hey there! 👋 I'm Zenny, your AI assistant!" : "Sorry, I couldn't process that request.");
          } else {
            botResponse = "Hey there! 👋 I'm Zenny, your AI assistant!";
          }

          // Ensure we have a string response
          if (typeof botResponse !== 'string') {
            botResponse = "Hey there! 👋 I'm Zenny, your AI assistant!";
          }

        } catch (aiError) {
          console.error('AI Error:', aiError);
          botResponse = "Hey there! 👋 I'm Zenny, your AI assistant. I can help with group management, answer questions, and chat with you all! Just mention 'zenny' and ask me anything!";
        }
      }

      // Create bot message
      const botMessage = {
        text: botResponse,
        sender: {
          id: 'zenny_bot',
          name: 'Zenny',
          avatar: null
        },
        type: 'text'
      };

      // Send bot message to group
      const savedBotMessage = groupService.sendGroupMessage(group.id, botMessage);

      // Update local messages
      setMessages(prev => [...prev, savedBotMessage]);

    } catch (error) {
      console.error('Error handling Zentro Bot message:', error);

      // Send error message
      const errorMessage = {
        text: "🤖 Sorry, I'm having trouble responding right now. Please try again later!",
        sender: {
          id: 'zentro_bot',
          name: 'Zenny',
          avatar: null
        },
        type: 'text'
      };

      const savedErrorMessage = groupService.sendGroupMessage(group.id, errorMessage);
      setMessages(prev => [...prev, savedErrorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        // Send message with Enter
        e.preventDefault();
        if (inputMessage.trim()) {
          sendMessage(inputMessage);
          setInputMessage('');
        }
      }
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInputMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleGifSend = async (gif) => {
    try {
      // Send GIF as a special message type
      const gifMessage = {
        text: gif.url,
        sender: {
          id: userProfile.uid,
          name: userProfile.displayName || 'You',
          avatar: userProfile.photoURL
        },
        type: 'gif',
        gifData: { url: gif.url, title: gif.title },
        replyTo: replyingTo
      };

      const savedMessage = groupService.sendGroupMessage(group.id, gifMessage);
      setMessages(prev => [...prev, savedMessage]);
      setReplyingTo(null);
      setShowGifPicker(false);
    } catch (error) {
      console.error('Error sending GIF:', error);
    }
  };

  // Handle message reply
  const handleReply = (message) => {
    setReplyingTo(message);
    setShowMessageActions(null);
  };

  // Handle message delete
  const handleDeleteMessage = (messageId) => {
    try {
      groupService.deleteGroupMessage(group.id, messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setShowMessageActions(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Handle message share
  const handleShareMessage = (message) => {
    if (navigator.share) {
      navigator.share({
        title: `Message from ${message.sender.name}`,
        text: message.text,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(message.text);
      alert('Message copied to clipboard!');
    }
    setShowMessageActions(null);
  };

  // Handle message reactions
  const handleReaction = (messageId, emoji) => {
    try {
      const updatedMessages = messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const existingReaction = reactions.find(r => r.userId === userProfile.uid && r.emoji === emoji);

          if (existingReaction) {
            // Remove reaction
            return {
              ...msg,
              reactions: reactions.filter(r => !(r.userId === userProfile.uid && r.emoji === emoji))
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: [...reactions, { userId: userProfile.uid, emoji, userName: userProfile.displayName }]
            };
          }
        }
        return msg;
      });

      setMessages(updatedMessages);
      groupService.updateGroupMessage(group.id, messageId, updatedMessages.find(m => m.id === messageId));
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  // Handle clear chat (admin only)
  const handleClearChat = () => {
    if (group.adminId === userProfile.uid) {
      try {
        groupService.clearGroupMessages(group.id);
        setMessages([]);
        setShowClearConfirm(false);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  // Handle group call
  const handleStartGroupCall = async (type) => {
    try {
      const currentUserData = {
        id: userProfile.uid,
        name: userProfile.displayName,
        avatar: userProfile.photoURL,
        email: userProfile.email
      };

      const callTypeText = type === 'voice' ? 'Voice Call' :
                          type === 'video' ? 'Video Call' : 'Screen Share';

      // Confirm before starting group call
      const confirmed = window.confirm(
        `Start ${callTypeText} for group "${group.name}"?\n\nThis will notify all ${group.members?.length || 0} members.`
      );

      if (!confirmed) return;

      // For group calls, we'll simulate calling all members
      // In a real implementation, this would use WebRTC for multiple participants
      let callId;

      // Create a group target user object
      const groupTarget = {
        id: group.id,
        name: group.name,
        avatar: null,
        email: null,
        isGroup: true,
        memberCount: group.members?.length || 0
      };

      switch (type.toLowerCase()) {
        case 'voice':
          callId = await callService.startVoiceCall(groupTarget, currentUserData);
          break;
        case 'video':
          callId = await callService.startVideoCall(groupTarget, currentUserData);
          break;
        case 'screen':
          callId = await callService.startScreenShare(groupTarget, currentUserData);
          break;
        default:
          throw new Error('Invalid call type');
      }

      console.log(`✅ Group ${type} call initiated:`, callId);

      // Store the call ID for hanging up later
      setActiveCall({ id: callId, type, status: 'calling' });

      // Send a message to the group about the call
      const callMessage = {
        text: `📞 ${userProfile.displayName || 'Someone'} started a ${callTypeText.toLowerCase()} for the group`,
        sender: {
          id: 'system',
          name: 'System',
          avatar: null
        },
        type: 'system'
      };

      const savedMessage = groupService.sendGroupMessage(group.id, callMessage);
      setMessages(prev => [...prev, savedMessage]);

    } catch (error) {
      console.error(`Error starting group ${type} call:`, error);
      alert(`Failed to start group ${type} call. Please check your permissions and try again.`);
    }
  };

  // Handle hanging up call
  const handleHangUp = () => {
    if (activeCall) {
      callService.endCall(activeCall.id);
      setActiveCall(null);
      setCallDuration(0);

      // Send a message to the group about ending the call
      const endCallMessage = {
        text: `📞 ${userProfile.displayName || 'Someone'} ended the call`,
        sender: {
          id: 'system',
          name: 'System',
          avatar: null
        },
        type: 'system'
      };

      const savedMessage = groupService.sendGroupMessage(group.id, endCallMessage);
      setMessages(prev => [...prev, savedMessage]);
    }
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if user is admin
  const isAdmin = group.adminId === userProfile.uid;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputMessage);
    setInputMessage('');
  };

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FaUsers className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Group Selected</h3>
          <p className="text-gray-400">Select a group to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: activeTheme.colors.background }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          backgroundColor: activeTheme.colors.surface,
          borderColor: activeTheme.colors.borderMuted
        }}
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaArrowLeft />
          </button>

          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <FaUsers className="text-white" />
          </div>

          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: activeTheme.colors.text }}
            >
              {group.name}
            </h2>
            <p
              className="text-sm"
              style={{ color: activeTheme.colors.textMuted }}
            >
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
              {group.secretCode && (
                <span className="ml-2 px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                  Secret: {group.secretCode}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Active Call Status */}
          {activeCall ? (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center space-x-1">
                {activeCall.type === 'voice' && <FaPhone className="text-green-400 text-sm" />}
                {activeCall.type === 'video' && <FaVideo className="text-blue-400 text-sm" />}
                {activeCall.type === 'screen' && <FaDesktop className="text-purple-400 text-sm" />}
                <span className="text-green-400 text-sm font-medium">
                  {activeCall.status === 'calling' ? 'Calling...' :
                   activeCall.status === 'connected' ? formatDuration(callDuration) :
                   activeCall.status}
                </span>
              </div>
              <button
                onClick={handleHangUp}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                title="Hang Up"
              >
                <FaPhoneSlash className="text-sm" />
              </button>
            </div>
          ) : (
            <>
              {/* Call Options */}
              <button
                onClick={() => handleStartGroupCall('voice')}
                className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                title="Start Group Voice Call"
              >
                <FaPhone />
              </button>

              <button
                onClick={() => handleStartGroupCall('video')}
                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                title="Start Group Video Call"
              >
                <FaVideo />
              </button>

              <button
                onClick={() => handleStartGroupCall('screen')}
                className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                title="Start Screen Share"
              >
                <FaDesktop />
              </button>
            </>
          )}

          {/* Theme Selector */}
          <button
            onClick={() => setShowThemeSelector(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Change Theme"
          >
            <FaPalette />
          </button>

          {group.settings.allowZentroBot && !group.members.includes('zenny_bot') && (
            <button
              onClick={() => groupService.addZennyToGroup(group.id).then(() => {
                const updatedMessages = groupService.getGroupMessages(group.id);
                setMessages(updatedMessages);
              })}
              className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
              title="Add Zenny"
            >
              <FaRobot />
            </button>
          )}

          {/* Role Management - Owner and Admin only */}
          {(group.ownerId === userProfile?.uid || isAdmin) && (
            <button
              onClick={() => setShowRoleManagement(true)}
              className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
              title="Manage Roles"
            >
              <FaUserShield />
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
              title="Clear chat (Admin only)"
            >
              <FaTrash />
            </button>
          )}

          <button
            onClick={onShowMembers}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="View Members"
          >
            <FaUsers />
          </button>

          {group.admins.includes(userProfile?.uid) && (
            <button
              onClick={onShowSettings}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Group Settings"
            >
              <FaCog />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((message, index) => {
            const isOwn = message.sender.id === userProfile?.uid;
            const isBot = message.sender.id === 'zentro_bot' || message.sender.id === 'zenny_bot';
            const showAvatar = !isOwn;
            const showName = !isOwn && (index === 0 || messages[index - 1]?.sender.id !== message.sender.id);

            // Resolve the actual user name
            const resolvedName = resolveUserName(message.sender.id);

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative`}
                onMouseEnter={() => setShowMessageActions(message.id)}
                onMouseLeave={() => setShowMessageActions(null)}
              >
                <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[85%] sm:max-w-[70%]`}>
                  {/* Avatar */}
                  {showAvatar && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {message.sender.avatar ? (
                        <img
                          src={message.sender.avatar}
                          alt={message.sender.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {isBot ? '🤖' : resolvedName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${showAvatar ? '' : 'ml-10'} relative`}>
                    {/* Sender name */}
                    {showName && (
                      <div className={`text-xs text-gray-400 mb-1 px-3 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {isBot ? '🤖 Zenny' : resolvedName}
                      </div>
                    )}

                    {/* Reply indicator */}
                    {message.replyTo && (
                      <div className="text-xs opacity-70 border-l-2 border-gray-400 pl-2 mb-2 max-w-xs">
                        <div className="font-medium">{message.replyTo.sender.name}</div>
                        <div className="truncate">{message.replyTo.text}</div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      className={`relative px-4 py-3 rounded-2xl shadow-lg max-w-full break-words ${
                        isOwn
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-br-md'
                          : isBot
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-bl-md border border-purple-500/30'
                          : 'bg-gray-700 text-white rounded-bl-md border border-gray-600'
                      } hover:shadow-xl transition-all duration-200`}
                    >
                      {/* Bot indicator */}
                      {isBot && (
                        <div className="flex items-center space-x-1 mb-2 text-xs text-purple-200">
                          <FaRobot className="text-xs" />
                          <span>AI Assistant</span>
                        </div>
                      )}

                      {/* Message Content */}
                      {message.type === 'gif' ? (
                        <div className="space-y-2">
                          <img
                            src={message.gifData?.url || message.text}
                            alt={message.gifData?.title || 'GIF'}
                            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '200px', maxWidth: '250px' }}
                            onClick={() => window.open(message.gifData?.url || message.text, '_blank')}
                          />
                        </div>
                      ) : (
                        // Check if message text is a GIF URL
                        (() => {
                          const isGifUrl = (url) => {
                            if (!url || typeof url !== 'string') return false;
                            return url.includes('giphy.com') || url.includes('tenor.com') || url.match(/\.(gif|webp)(\?|$)/i);
                          };

                          if (message.text && isGifUrl(message.text)) {
                            return (
                              <div className="space-y-2">
                                <img
                                  src={message.text}
                                  alt="GIF"
                                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  style={{ maxHeight: '200px', maxWidth: '250px' }}
                                  onClick={() => window.open(message.text, '_blank')}
                                  onError={(e) => {
                                    // Fallback to text if image fails to load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <p
                                  className="whitespace-pre-wrap break-words text-blue-300 underline cursor-pointer"
                                  style={{ display: 'none' }}
                                  onClick={() => window.open(message.text, '_blank')}
                                >
                                  {message.text}
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div className="whitespace-pre-wrap break-words leading-relaxed">
                              {typeof message.text === 'string' ? message.text : 'Message could not be displayed'}
                            </div>
                          );
                        })()
                      )}

                      {/* Timestamp */}
                      <div className={`flex items-center mt-2 text-xs opacity-60 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(
                          message.reactions.reduce((groups, reaction) => {
                            if (!groups[reaction.emoji]) {
                              groups[reaction.emoji] = [];
                            }
                            groups[reaction.emoji].push(reaction);
                            return groups;
                          }, {})
                        ).map(([emoji, reactions]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              reactions.some(r => r.userId === userProfile.uid)
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{reactions.length}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    {showMessageActions === message.id && (
                      <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex space-x-1 bg-gray-800 rounded-lg shadow-lg p-1 z-10`}>
                        <button
                          onClick={() => handleReaction(message.id, '👍')}
                          className="p-1 text-gray-400 hover:text-yellow-400 text-sm"
                          title="React"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => handleReaction(message.id, '❤️')}
                          className="p-1 text-gray-400 hover:text-red-400 text-sm"
                          title="Love"
                        >
                          ❤️
                        </button>
                        <button
                          onClick={() => handleReply(message)}
                          className="p-1 text-gray-400 hover:text-blue-400 text-sm"
                          title="Reply"
                        >
                          <FaReply />
                        </button>
                        <button
                          onClick={() => handleShareMessage(message)}
                          className="p-1 text-gray-400 hover:text-green-400 text-sm"
                          title="Share"
                        >
                          <FaShare />
                        </button>
                        {(isOwn || isAdmin) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="p-1 text-gray-400 hover:text-red-400 text-sm"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400">
            <FaRobot className="text-purple-400" />
            <span className="text-sm">Zenny is typing...</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50 backdrop-blur-sm relative">
        {/* Reply indicator */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-gray-800 rounded-lg border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs text-purple-400 font-medium">Replying to {replyingTo.sender.name}</div>
                <div className="text-sm text-gray-300 truncate">{replyingTo.text}</div>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-gray-400 hover:text-white ml-2"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          {/* Media and GIF buttons */}
          <div className="flex flex-col space-y-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Add emoji"
            >
              <FaSmile />
            </button>
            <button
              type="button"
              onClick={() => setShowGifPicker(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Send GIF"
            >
              <MdGif />
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${group.name}... (Shift+Enter for new line)`}
              rows={1}
              className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none transition-all duration-200 hover:bg-gray-800 min-h-[48px] max-h-32"
              style={{
                height: 'auto',
                minHeight: '48px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
              }}
            />

            {/* Helper text */}
            <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
              💡 Try: '/zentro help' for bot commands, '@zentro' to mention bot
            </div>
          </div>

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </form>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
            <Picker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* GIF Picker */}
        {showGifPicker && (
          <GifPicker
            onGifSelect={handleGifSend}
            onClose={() => setShowGifPicker(false)}
            theme={activeTheme}
          />
        )}
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Clear Chat History</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to clear all messages in this group? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Management Modal */}
      {showRoleManagement && (
        <RoleManagement
          group={group}
          onClose={() => setShowRoleManagement(false)}
          onRoleUpdate={() => {
            // Refresh group data if needed
            console.log('Roles updated for group:', group.id);
          }}
        />
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <EnhancedThemeSelector
          currentTheme={activeTheme}
          chatId={group.id}
          onThemeChange={(newTheme) => {
            // Set group-specific theme
            setGroupTheme(group.id, newTheme);
            setGroupThemeState(newTheme);
            setShowThemeSelector(false);
          }}
          onClose={() => setShowThemeSelector(false)}
        />
      )}
    </div>
  );
};

export default GroupChat;
