import React, { useState } from 'react';
import { FaTrash, FaDatabase, FaUsers, FaComments, FaExclamationTriangle, FaRocket, FaEdit, FaLock } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const DataManager = ({ onClose }) => {
  const { isAdmin } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState('');

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <FaLock className="text-red-400 text-xl" />
            <h3 className="text-xl font-bold text-white">Access Denied</h3>
          </div>
          <p className="text-gray-300 mb-6">
            You don't have permission to access the Data Manager. This feature is restricted to administrators only.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('✅ localStorage cleared successfully!');
    window.location.reload();
  };

  const clearChatData = () => {
    // Clear only chat-related data, keep user and friends data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chat') || key.includes('message') || key.includes('dm'))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    alert(`✅ Cleared ${keysToRemove.length} chat-related items!`);
    window.location.reload();
  };

  const clearFriendsData = () => {
    // Clear only friends-related data
    localStorage.removeItem('zentro_registered_users');
    localStorage.removeItem('zentro_friend_requests');
    localStorage.removeItem('zentro_friendships');
    alert('✅ Friends data cleared successfully!');
    window.location.reload();
  };

  // clearZentriumDatabase function removed as requested

  const clearBlogsDatabase = () => {
    // Clear blogs database
    localStorage.removeItem('zentro_blogs');
    localStorage.removeItem('zentro_blog_posts');
    alert('✅ Blogs database cleared successfully!');
    window.location.reload();
  };

  const handleAction = (type) => {
    setActionType(type);
    setShowConfirm(true);
  };

  const confirmAction = () => {
    switch (actionType) {
      case 'all':
        clearLocalStorage();
        break;
      case 'chats':
        clearChatData();
        break;
      case 'friends':
        clearFriendsData();
        break;
      // zentrium case removed as requested
      case 'blogs':
        clearBlogsDatabase();
        break;
      default:
        break;
    }
    setShowConfirm(false);
  };

  const getActionText = () => {
    switch (actionType) {
      case 'all':
        return 'clear ALL data (localStorage + reload page)';
      case 'chats':
        return 'clear only CHAT data (keep friends)';
      case 'friends':
        return 'clear only FRIENDS data (keep chats)';
      // zentrium case removed as requested
      case 'blogs':
        return 'clear only BLOGS database (keep user data)';
      default:
        return '';
    }
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-red-400 text-xl" />
            <h3 className="text-xl font-bold text-white">Confirm Action</h3>
          </div>

          <p className="text-gray-300 mb-6">
            Are you sure you want to <span className="text-red-400 font-semibold">{getActionText()}</span>?
            <br /><br />
            <span className="text-yellow-400">This action cannot be undone!</span>
          </p>

          <div className="flex gap-3">
            <button
              onClick={confirmAction}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Yes, Clear Data
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-lg w-full p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaDatabase className="text-purple-400 text-xl" />
            <h3 className="text-xl font-bold text-white">Data Manager</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Clear All Data */}
          <div className="p-4 bg-gray-800 rounded-lg border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <FaTrash className="text-red-400" />
              <h4 className="text-white font-semibold">Clear All Data</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Clears everything: users, friends, chats, localStorage. Fresh start with new Firebase.
            </p>
            <button
              onClick={() => handleAction('all')}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              🗑️ Clear Everything
            </button>
          </div>

          {/* Clear Chat Data */}
          <div className="p-4 bg-gray-800 rounded-lg border border-orange-500/30">
            <div className="flex items-center gap-3 mb-2">
              <FaComments className="text-orange-400" />
              <h4 className="text-white font-semibold">Clear Chat Data Only</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Removes all chat messages and DM history. Keeps friends and user data.
            </p>
            <button
              onClick={() => handleAction('chats')}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              💬 Clear Chats Only
            </button>
          </div>

          {/* Clear Friends Data */}
          <div className="p-4 bg-gray-800 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <FaUsers className="text-blue-400" />
              <h4 className="text-white font-semibold">Clear Friends Data Only</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Removes all friends and friend requests. Keeps chat history and user data.
            </p>
            <button
              onClick={() => handleAction('friends')}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              👥 Clear Friends Only
            </button>
          </div>

          {/* Clear Zentrium Database - Removed as requested */}

          {/* Clear Blogs Database */}
          <div className="p-4 bg-gray-800 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <FaEdit className="text-green-400" />
              <h4 className="text-white font-semibold">Clear Blogs Database</h4>
            </div>
            <p className="text-gray-400 text-sm mb-3">
              Removes all blog posts and drafts. Keeps user and chat data.
            </p>
            <button
              onClick={() => handleAction('blogs')}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              📝 Clear Blogs
            </button>
          </div>
        </div>

        <div className="mt-6 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <strong>💡 Recommendation:</strong> Use "Clear Everything" to fix the Firebase ID mismatch issue.
            This will ensure all users have consistent Firebase user IDs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
