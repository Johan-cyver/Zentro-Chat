import React, { useState, useEffect } from 'react';
import { FaUsers, FaComments, FaEye, FaUserPlus, FaSearch } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';
import FriendSearch from './FriendSearch';

const FriendsList = ({ theme, onMessageFriend, onViewProfile }) => {
  const { userProfile } = useUser();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  // Load friends list
  useEffect(() => {
    if (!userProfile?.uid) return;

    loadFriends();
  }, [userProfile?.uid]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await friendsService.getFriends(userProfile.uid);
      setFriends(friendsList);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const handleMessageFriend = (friend) => {
    if (onMessageFriend) {
      onMessageFriend(friend);
    }
  };

  const handleViewProfile = (friend) => {
    if (onViewProfile) {
      onViewProfile(friend);
    }
  };

  const handleRemoveFriend = async (friend) => {
    if (!window.confirm(`Are you sure you want to remove ${friend.displayName} from your friends?`)) {
      return;
    }

    try {
      await friendsService.removeFriend(userProfile.uid, friend.uid);
      // Refresh friends list
      loadFriends();
      alert(`${friend.displayName} has been removed from your friends.`);
    } catch (error) {
      console.error('Error removing friend:', error);
      alert(error.message || 'Failed to remove friend');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FaUsers />
          <span>Friends ({friends.length})</span>
        </h2>
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <FaUserPlus />
          <span>Add Friends</span>
        </button>
      </div>

      {/* Friends Grid */}
      {friends.length === 0 ? (
        <div className="text-center py-12">
          <FaUsers className="text-6xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
          <p className="text-gray-400 mb-6">
            Start connecting with people by searching for their user ID or name
          </p>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
          >
            <FaSearch />
            <span>Find Friends</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map(friend => (
            <div
              key={friend.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
            >
              {/* Friend Avatar and Info */}
              <div className="text-center mb-4">
                {friend.photoURL ? (
                  <img
                    src={friend.photoURL}
                    alt={friend.displayName}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-2xl font-bold">
                      {friend.displayName?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white truncate">
                  {friend.displayName || 'Unknown User'}
                </h3>

                <p className="text-gray-400 text-sm truncate">
                  {friend.email}
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  ID: {friend.id}
                </p>

                {friend.friendsSince && (
                  <p className="text-gray-500 text-xs mt-1">
                    Friends since {formatDate(friend.friendsSince)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleMessageFriend(friend)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  <FaComments />
                  <span>Message</span>
                </button>

                <button
                  onClick={() => handleViewProfile(friend)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  <FaEye />
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => handleRemoveFriend(friend)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                  title="Remove friend"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friend Search Modal */}
      {showSearch && (
        <FriendSearch
          theme={theme}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default FriendsList;
