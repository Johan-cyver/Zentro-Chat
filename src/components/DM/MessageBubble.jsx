import React, { useState } from 'react';
import { FaReply, FaTrash, FaEdit, FaDownload, FaCheck, FaCheckDouble, FaShare, FaSmile, FaRobot } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

// Message validation helper
const validateMessage = (msg) => {
  if (!msg || typeof msg !== 'object') {
    console.error('Invalid message object:', msg);
    return false;
  }

  if (msg instanceof Promise) {
    console.error('Message is a Promise:', msg);
    return false;
  }

  if (typeof msg.text !== 'string') {
    console.error('Message text is not a string:', msg);
    return false;
  }

  if (!msg.sender || typeof msg.sender !== 'object') {
    console.error('Invalid message sender:', msg);
    return false;
  }

  return true;
};

const MessageBubble = ({
  message,
  onReply = () => {},
  onDelete = () => {},
  onEdit = () => {},
  onReaction = () => {},
  onForward = () => {},
  theme = {}
}) => {
  const { userProfile } = useUser();
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message?.text || '');

  // Validation check after hooks
  if (!validateMessage(message)) {
    console.warn('Skipping invalid message:', message);
    return null;
  }

  const isOwnMessage = message.sender.id === userProfile.uid;
  const isZennyMessage = message.sender.id === 'zenny_ai' || message.isZennyMessage;
  const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleReaction = (emoji) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  // Helper function to check if a URL is a GIF
  const isGifUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.includes('giphy.com') || url.includes('tenor.com') || url.match(/\.(gif|webp)(\?|$)/i);
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img
              src={message.mediaData?.url || message.imageData}
              alt="Shared content"
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.mediaData?.url || message.imageData, '_blank')}
            />
            {message.text && (
              <p className="text-sm">{message.text}</p>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="space-y-2">
            <video
              src={message.mediaData?.url || message.videoData}
              controls
              className="max-w-xs rounded-lg"
              style={{ maxHeight: '300px' }}
            />
            {message.text && (
              <p className="text-sm">{message.text}</p>
            )}
          </div>
        );

      case 'gif':
        return (
          <div className="space-y-2">
            <img
              src={message.gifData?.url || message.text}
              alt={message.gifData?.title || 'GIF'}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              style={{ maxHeight: '200px', maxWidth: '250px' }}
              onClick={() => window.open(message.gifData?.url || message.text, '_blank')}
            />
            {message.caption && (
              <p className="text-sm">{message.caption}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-xs">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaDownload className="text-white text-sm" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.mediaData?.name || 'File'}</p>
              <p className="text-xs text-gray-500">
                {message.mediaData?.size ? (message.mediaData.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size'}
              </p>
            </div>
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = message.mediaData?.url || message.fileData;
                link.download = message.mediaData?.name || 'file';
                link.click();
              }}
              className="flex-shrink-0 text-blue-500 hover:text-blue-600"
            >
              <FaDownload />
            </button>
          </div>
        );

      default:
        // Check if the message text is a GIF URL and render it as an image
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
                className="whitespace-pre-wrap break-words text-blue-500 underline cursor-pointer"
                style={{ display: 'none' }}
                onClick={() => window.open(message.text, '_blank')}
              >
                {message.text}
              </p>
            </div>
          );
        }

        return isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-2 text-sm bg-transparent border border-gray-300 rounded resize-none focus:outline-none focus:border-blue-500"
              rows={2}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.text);
                }}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {message.replyTo && (
              <div className="text-xs opacity-70 border-l-2 border-gray-400 pl-2 mb-2">
                <div className="font-medium">{message.replyTo.sender.name}</div>
                <div className="truncate">{message.replyTo.text}</div>
              </div>
            )}
            <p className="whitespace-pre-wrap break-words">{message.text}</p>
            {message.edited && (
              <span className="text-xs opacity-50">(edited)</span>
            )}
          </div>
        );
    }
  };

  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;

    const reactionGroups = message.reactions.reduce((groups, reaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = [];
      }
      groups[reaction.emoji].push(reaction);
      return groups;
    }, {});

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
              reactions.some(r => r.userId === userProfile.uid)
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>{emoji}</span>
            <span>{reactions.length}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case 'sent':
        return <FaCheck className="text-gray-400 text-xs" />;
      case 'delivered':
        return <FaCheckDouble className="text-gray-400 text-xs" />;
      case 'read':
        return <FaCheckDouble className="text-blue-500 text-xs" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2 max-w-[70%]`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
            {isZennyMessage ? (
              <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold">
                <FaRobot />
              </div>
            ) : message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-semibold">
                {message?.sender?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div className={`relative ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
          {/* Sender name for other users */}
          {!isOwnMessage && (
            <div className={`text-xs mb-1 ml-3 flex items-center space-x-1 ${
              isZennyMessage ? 'text-purple-400 font-medium' : 'text-gray-500'
            }`}>
              {isZennyMessage && <FaRobot className="text-xs" />}
              <span>{message.sender.name}</span>
              {isZennyMessage && <span className="text-xs">• AI Assistant</span>}
            </div>
          )}

          {/* Message bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
              isOwnMessage
                ? `bg-blue-500 text-white ${isOwnMessage ? 'rounded-br-sm' : ''}`
                : isZennyMessage
                ? `bg-gradient-to-r from-purple-500 to-pink-500 text-white ${!isOwnMessage ? 'rounded-bl-sm' : ''}`
                : `bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white ${!isOwnMessage ? 'rounded-bl-sm' : ''}`
            }`}
            style={{
              backgroundColor: isOwnMessage
                ? theme?.colors?.userMessage
                : isZennyMessage
                ? undefined // Let gradient handle Zenny messages
                : theme?.colors?.otherMessage,
              color: isOwnMessage || isZennyMessage ? 'white' : theme?.colors?.text
            }}
          >
            {renderMessageContent()}

            {/* Timestamp and status */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${
              isOwnMessage || isZennyMessage ? 'text-white/70' : 'text-gray-500'
            } text-xs`}>
              <span>{messageTime}</span>
              {renderStatusIcon()}
            </div>
          </div>

          {/* Reactions */}
          {renderReactions()}

          {/* Action buttons */}
          {showActions && (
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex space-x-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-1 z-10`}>
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                title="React"
              >
                😊
              </button>
              <button
                onClick={() => onReply(message)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                title="Reply"
              >
                <FaReply />
              </button>
              <button
                onClick={() => onForward(message)}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                title="Forward"
              >
                <FaShare />
              </button>
              {isOwnMessage && message.type === 'text' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                  title="Edit"
                >
                  <FaEdit />
                </button>
              )}
              {isOwnMessage && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 text-red-500 hover:text-red-700 text-sm"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          )}

          {/* Reaction picker */}
          {showReactions && (
            <div className={`absolute top-8 ${isOwnMessage ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-20 flex space-x-1`}>
              {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
