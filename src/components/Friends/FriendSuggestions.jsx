import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUsers, FaSpinner } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const FriendSuggestions = () => {
  const { userProfile } = useUser();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequests, setSendingRequests] = useState(new Set());

  useEffect(() => {
    loadSuggestions();
  }, [userProfile?.uid]);

  const loadSuggestions = async () => {
    if (!userProfile?.uid) return;

    setLoading(true);
    try {
      // Get all registered users from multiple sources
      let allUsers = await friendsService.getRegisteredUsers();

      // If no users found, try alternative storage
      if (!Array.isArray(allUsers) || allUsers.length === 0) {
        console.warn('[FriendSuggestions] No users from getRegisteredUsers or it returned non-array. Trying localStorage fallback.');
        allUsers = JSON.parse(localStorage.getItem('zentro_all_users') || '[]');
      }

      console.log('🔍 Found users for suggestions:', allUsers.length);

      // Get current user's friends
      const friends = await friendsService.getUserFriends(userProfile.uid);
      const friendIds = Array.isArray(friends) ? friends.map(friend => friend.uid || friend.id) : [];

      // Get pending friend requests
      let pendingRequests = await friendsService.getPendingRequests(userProfile.uid);
      
      // Ensure pendingRequests is an array before filtering/mapping
      if (!Array.isArray(pendingRequests)) {
        console.warn('[FriendSuggestions] getPendingRequests did not return an array. Defaulting to empty.');
        pendingRequests = [];
      }

      const pendingUserIds = pendingRequests
        .filter(req => req.senderId === userProfile.uid || req.receiverId === userProfile.uid)
        .map(req => req.senderId === userProfile.uid ? req.receiverId : req.senderId);

      // Get admin-hidden users
      const hiddenFromSuggestions = JSON.parse(localStorage.getItem('zentro_hidden_from_suggestions') || '[]');

      // Filter out current user, friends, users with pending requests, and admin-hidden users
      const validAllUsers = Array.isArray(allUsers) ? allUsers : [];
      const finalSuggestions = validAllUsers
        .filter(user =>
          user.uid !== userProfile.uid &&
          !friendIds.includes(user.uid) &&
          !pendingUserIds.includes(user.uid) &&
          !hiddenFromSuggestions.includes(user.uid) &&
          user.displayName &&
          user.displayName !== 'Unknown User' &&
          user.displayName.trim() !== ''
        )
        .slice(0, 5); // Limit to 5 suggestions for better UI

      console.log('✅ Friend suggestions loaded:', finalSuggestions.length);
      setSuggestions(finalSuggestions);
    } catch (error) {
      console.error('Error loading friend suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    if (sendingRequests.has(targetUser.uid)) return;

    setSendingRequests(prev => new Set(prev).add(targetUser.uid));

    try {
      await friendsService.sendFriendRequest(userProfile.uid, targetUser.uid, userProfile);

      // Remove from suggestions after sending request
      setSuggestions(prev => prev.filter(user => user.uid !== targetUser.uid));

      alert(`✅ Friend request sent to ${targetUser.displayName}!`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(`❌ Failed to send friend request: ${error.message}`);
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser.uid);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <FaSpinner className="animate-spin text-purple-400 text-xl mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Loading suggestions...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center">
        <FaUsers className="text-gray-600 text-3xl mx-auto mb-2" />
        <p className="text-gray-400 text-sm">No new friend suggestions</p>
        <p className="text-gray-500 text-xs mt-1">Check back later for more users!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <FaUsers className="text-purple-400" />
        Friend Suggestions
      </h3>

      <div className="space-y-3">
        {suggestions.map(user => (
          <div
            key={user.uid || user.id}
            className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">
                {user.displayName || 'Unknown User'}
              </h4>
              {user.bio && (
                <p className="text-gray-400 text-xs truncate">
                  {user.bio}
                </p>
              )}
              {user.location && (
                <p className="text-gray-500 text-xs truncate">
                  📍 {user.location}
                </p>
              )}
            </div>

            {/* Add Friend Button */}
            <button
              onClick={() => handleSendFriendRequest(user)}
              disabled={sendingRequests.has(user.uid)}
              className="flex-shrink-0 p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
              title="Send friend request"
            >
              {sendingRequests.has(user.uid) ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaUserPlus className="text-sm" />
              )}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={loadSuggestions}
        className="w-full mt-3 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
      >
        🔄 Refresh Suggestions
      </button>
    </div>
  );
};

export default FriendSuggestions;
