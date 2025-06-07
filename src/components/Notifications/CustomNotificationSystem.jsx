import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBell, FaUserPlus, FaComment, FaHeart, FaTrophy, FaRobot } from 'react-icons/fa';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Individual Notification Toast Component
const NotificationToast = ({ notification, onRemove }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'friend_request':
        return <FaUserPlus className="text-blue-400" />;
      case 'message':
        return <FaComment className="text-green-400" />;
      case 'like':
        return <FaHeart className="text-red-400" />;
      case 'achievement':
        return <FaTrophy className="text-yellow-400" />;
      case 'bot':
        return <FaRobot className="text-purple-400" />;
      default:
        return <FaBell className="text-gray-400" />;
    }
  };

  const getBrandedTitle = () => {
    return notification.title || 'ZentroChat';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 mb-3 max-w-sm w-full backdrop-blur-sm"
      style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
        borderColor: notification.color || '#8B5CF6',
        boxShadow: `0 10px 25px rgba(0, 0, 0, 0.3), 0 0 20px ${notification.color || '#8B5CF6'}20`,
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white truncate">
              {getBrandedTitle()}
            </h4>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>

          <p className="text-sm text-gray-300 mb-2">
            {notification.message}
          </p>

          {/* Actions */}
          {notification.actions && (
            <div className="flex space-x-2">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onRemove(notification.id);
                  }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    action.primary
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-gray-500 mt-2">
            {notification.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {notifications.slice(0, 5).map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper functions for common notification types
export const createFriendRequestNotification = (fromUser, onAccept, onDecline) => ({
  type: 'friend_request',
  title: 'ZentroChat',
  message: `${fromUser.name} sent you a friend request`,
  color: '#3B82F6',
  duration: 0, // Don't auto-dismiss
  actions: [
    {
      label: 'Accept',
      primary: true,
      onClick: onAccept,
    },
    {
      label: 'Decline',
      primary: false,
      onClick: onDecline,
    },
  ],
});

export const createMessageNotification = (fromUser, message) => ({
  type: 'message',
  title: 'ZentroChat',
  message: `${fromUser.name}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
  color: '#10B981',
  duration: 4000,
});

export const createAchievementNotification = (achievement) => ({
  type: 'achievement',
  title: 'Achievement Unlocked!',
  message: achievement.title,
  color: '#F59E0B',
  duration: 6000,
});

export default NotificationProvider;
