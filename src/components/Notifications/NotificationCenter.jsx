import React, { useState, useEffect } from 'react';
import { FaBell, FaUserPlus, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const NotificationCenter = ({ theme }) => {
  const { userProfile } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (!userProfile?.uid) return;

    try {
      const savedNotifications = localStorage.getItem(`zentro_notifications_${userProfile.uid}`);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, [userProfile?.uid]);

  // Subscribe to notifications and save to localStorage
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = friendsService.subscribeNotifications(userProfile.uid, (newNotifications) => {
      setNotifications(newNotifications);

      // Save to localStorage for persistence
      try {
        localStorage.setItem(`zentro_notifications_${userProfile.uid}`, JSON.stringify(newNotifications));
      } catch (error) {
        console.error('Error saving notifications to localStorage:', error);
      }
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleAcceptFriendRequest = async (notification) => {
    setLoading(true);
    try {
      await friendsService.acceptFriendRequest(notification.requestId, userProfile.uid);
      await friendsService.markNotificationAsRead(notification.id);

      // Show success message
      alert(`✅ Friend request accepted! You are now friends with ${notification.fromUserData?.displayName || 'this user'}.`);

      // Force refresh the page to ensure all components update with new friendship
      window.location.reload();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert(`❌ Failed to accept friend request: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectFriendRequest = async (notification) => {
    setLoading(true);
    try {
      await friendsService.rejectFriendRequest(notification.requestId, userProfile.uid);
      await friendsService.markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Failed to reject friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await friendsService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderNotification = (notification) => {
    switch (notification.type) {
      case 'friend_request':
        return (
          <div
            key={notification.id}
            className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notification.fromUserData?.photoURL ? (
                  <img
                    src={notification.fromUserData.photoURL}
                    alt={notification.fromUserData.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <FaUserPlus className="text-white text-sm" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    {notification.fromUserData?.displayName || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  {notification.message}
                </p>

                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => handleAcceptFriendRequest(notification)}
                    disabled={loading}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaCheck className="inline mr-1" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectFriendRequest(notification)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    <FaTimes className="inline mr-1" />
                    Decline
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'friend_request_accepted':
        return (
          <div
            key={notification.id}
            className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <FaCheck className="text-white text-sm" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    Friend Request Accepted
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  {notification.message}
                </p>

                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                >
                  Mark as read
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            key={notification.id}
            className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <FaBell className="text-white text-sm" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">
                    Notification
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-1">
                  {notification.message}
                </p>

                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                >
                  Mark as read
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <FaBell
          className="text-xl"
          style={{ color: theme?.colors?.text || '#FFFFFF' }}
        />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FaBell className="text-4xl text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No new notifications</p>
              </div>
            ) : (
              notifications.map(renderNotification)
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationCenter;
