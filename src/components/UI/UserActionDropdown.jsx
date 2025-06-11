import React, { useState } from 'react';
import { FaEllipsisV, FaUserSlash, FaFlag, FaUserPlus, FaEnvelope, FaEye, FaTimes } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const UserActionDropdown = ({ targetUser, onClose, theme, position = 'bottom-right' }) => {
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  if (!targetUser || !userProfile) return null;

  const isOwnProfile = targetUser.id === userProfile.uid;

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleBlock = async () => {
    if (!showConfirmDialog) {
      setShowConfirmDialog('block');
      return;
    }

    setLoading(true);
    try {
      // Implement block functionality
      const blockedUsers = JSON.parse(localStorage.getItem(`zentro_blocked_users_${userProfile.uid}`) || '[]');
      if (!blockedUsers.includes(targetUser.id)) {
        blockedUsers.push(targetUser.id);
        localStorage.setItem(`zentro_blocked_users_${userProfile.uid}`, JSON.stringify(blockedUsers));
      }
      
      // Also remove from friends if they are friends
      await friendsService.removeFriend(userProfile.uid, targetUser.id);
      
      alert(`${targetUser.name} has been blocked successfully.`);
      handleClose();
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmDialog(null);
    }
  };

  const handleReport = async () => {
    if (!showConfirmDialog) {
      setShowConfirmDialog('report');
      return;
    }

    setLoading(true);
    try {
      // Implement report functionality
      const reports = JSON.parse(localStorage.getItem('zentro_user_reports') || '[]');
      const newReport = {
        id: Date.now().toString(),
        reporterId: userProfile.uid,
        reporterName: userProfile.displayName,
        reportedUserId: targetUser.id,
        reportedUserName: targetUser.name,
        timestamp: new Date().toISOString(),
        reason: 'Inappropriate behavior', // Could be expanded with a reason selector
        status: 'pending'
      };
      
      reports.push(newReport);
      localStorage.setItem('zentro_user_reports', JSON.stringify(reports));
      
      alert(`${targetUser.name} has been reported. Thank you for helping keep our community safe.`);
      handleClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to report user. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmDialog(null);
    }
  };

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      await friendsService.sendFriendRequest(userProfile.uid, targetUser.id);
      alert(`Friend request sent to ${targetUser.name}!`);
      handleClose();
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // This would trigger opening a DM with the user
    // Implementation depends on your chat system
    console.log('Send message to:', targetUser);
    handleClose();
  };

  const handleViewProfile = () => {
    // This would navigate to the user's profile
    console.log('View profile of:', targetUser);
    handleClose();
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'bottom-full left-0 mb-2';
      case 'top-right':
        return 'bottom-full right-0 mb-2';
      case 'bottom-left':
        return 'top-full left-0 mt-2';
      case 'bottom-right':
      default:
        return 'top-full right-0 mt-2';
    }
  };

  if (showConfirmDialog) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-700"
          style={{ backgroundColor: theme?.colors?.surface }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: theme?.colors?.text }}
          >
            {showConfirmDialog === 'block' ? 'Block User' : 'Report User'}
          </h3>
          <p 
            className="mb-6"
            style={{ color: theme?.colors?.textSecondary }}
          >
            {showConfirmDialog === 'block' 
              ? `Are you sure you want to block ${targetUser.name}? They won't be able to message you or see your content.`
              : `Are you sure you want to report ${targetUser.name}? This will help our moderation team review their behavior.`
            }
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowConfirmDialog(null)}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={showConfirmDialog === 'block' ? handleBlock : handleReport}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                showConfirmDialog === 'block' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Processing...' : (showConfirmDialog === 'block' ? 'Block' : 'Report')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className={`absolute ${getPositionClasses()} w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span 
            className="font-medium text-sm truncate"
            style={{ color: theme?.colors?.text }}
          >
            {targetUser.name}
          </span>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="py-1">
        {!isOwnProfile && (
          <>
            <button
              onClick={handleViewProfile}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-3"
              style={{ color: theme?.colors?.textSecondary }}
            >
              <FaEye className="text-sm" />
              <span>View Profile</span>
            </button>
            
            <button
              onClick={handleSendMessage}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-3"
              style={{ color: theme?.colors?.textSecondary }}
            >
              <FaEnvelope className="text-sm" />
              <span>Send Message</span>
            </button>
            
            <button
              onClick={handleAddFriend}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-3"
              style={{ color: theme?.colors?.textSecondary }}
              disabled={loading}
            >
              <FaUserPlus className="text-sm" />
              <span>Add Friend</span>
            </button>

            <div className="border-t border-gray-700 my-1"></div>
            
            <button
              onClick={handleBlock}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-3 text-red-400 hover:text-red-300"
              disabled={loading}
            >
              <FaUserSlash className="text-sm" />
              <span>Block User</span>
            </button>
            
            <button
              onClick={handleReport}
              className="w-full px-4 py-2 text-left hover:bg-gray-800 transition-colors flex items-center space-x-3 text-orange-400 hover:text-orange-300"
              disabled={loading}
            >
              <FaFlag className="text-sm" />
              <span>Report User</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserActionDropdown;
