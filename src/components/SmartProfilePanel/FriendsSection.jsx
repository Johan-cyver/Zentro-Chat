import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaUserPlus, FaComments, FaEye, FaSpinner } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import friendsService from '../../services/friendsService';
import firebaseChatService from '../../services/firebaseChat';
import AddFriendModal from '../Friends/AddFriendModal';

const FriendsSection = () => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState(new Map());

  // Load friends on component mount
  useEffect(() => {
    if (userProfile?.uid) {
      loadFriends();
    }
  }, [userProfile?.uid]);

  // Load friends list
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

  // Search users as user types
  useEffect(() => {
    if (searchTerm.trim() && searchTerm.length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
      setFriendshipStatuses(new Map());
    }
  }, [searchTerm]);

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    try {
      const results = await friendsService.searchUsers(searchTerm);
      // Filter out current user
      const filteredResults = results.filter(user => user.uid !== userProfile.uid);
      setSearchResults(filteredResults);

      // Check friendship status for each result
      const statusMap = new Map();
      for (const user of filteredResults) {
        const status = await friendsService.checkFriendshipStatus(userProfile.uid, user.uid);
        statusMap.set(user.uid, status);
      }
      setFriendshipStatuses(statusMap);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (targetUser) => {
    try {
      await friendsService.sendFriendRequest(userProfile.uid, targetUser.uid, userProfile);
      setFriendshipStatuses(prev => new Map(prev.set(targetUser.uid, 'pending')));
      alert('Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.message || 'Failed to send friend request');
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

  const handleCancelFriendRequest = async (targetUser) => {
    try {
      // Find the request ID for this user
      const requests = await friendsService.getFriendRequests();
      const request = requests.find(req =>
        req.fromUserId === userProfile.uid && req.toUserId === targetUser.uid
      );

      if (request) {
        await friendsService.cancelFriendRequest(request.id, userProfile.uid);
        setFriendshipStatuses(prev => new Map(prev.set(targetUser.uid, 'none')));
        alert('Friend request cancelled!');
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      alert(error.message || 'Failed to cancel friend request');
    }
  };

  // Temporary function to clear localStorage and start fresh
  const clearAllData = () => {
    if (window.confirm('Clear all localStorage data and start fresh? This will remove all friends, chats, and user data.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleMessageFriend = async (friend) => {
    try {
      console.log('🤝 Starting chat with friend:', {
        currentUser: userProfile.uid,
        friendUID: friend.uid,
        friendData: friend,
        allFriendKeys: Object.keys(friend),
        areTheSame: userProfile.uid === friend.uid
      });

      // Ensure both users are synced to Firebase
      await firebaseChatService.syncUserProfile(userProfile);
      await firebaseChatService.syncUserProfile({
        uid: friend.uid,
        displayName: friend.displayName,
        email: friend.email,
        photoURL: friend.photoURL,
        location: friend.location || '',
        bio: friend.bio || ''
      });

      // Create or get the chat room
      const chatId = await firebaseChatService.createChatRoom(userProfile.uid, friend.uid);

      // Format the chat data for the real-time system
      const selectedChat = {
        id: chatId,
        otherUser: {
          id: friend.uid,
          name: friend.displayName,
          avatar: friend.photoURL,
          email: friend.email,
          online: true
        },
        participants: [userProfile.uid, friend.uid]
      };

      navigate('/chat', { state: { selectedChat } });
    } catch (error) {
      console.error('Error starting chat with friend:', error);
      // Fallback to basic navigation
      const chatUser = {
        id: friend.uid,
        name: friend.displayName,
        avatar: friend.photoURL,
        email: friend.email,
        online: true
      };
      navigate('/chat', { state: { selectedChat: chatUser } });
    }
  };

  const handleViewProfile = (friend) => {
    // Navigate to friend's profile
    navigate('/profile', { state: { viewUser: friend } });
  };

  const getStatusButton = (user) => {
    const status = friendshipStatuses.get(user.uid);

    switch (status) {
      case 'friends':
        return (
          <span className="text-green-400 text-xs">✓ Friends</span>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xs">⏳ Pending</span>
            <button
              onClick={() => handleCancelFriendRequest(user)}
              className="text-red-400 hover:text-red-300 text-xs"
              title="Cancel request"
            >
              ✕
            </button>
          </div>
        );
      case 'none':
      default:
        return (
          <button
            onClick={() => handleSendFriendRequest(user)}
            className="text-purple-400 hover:text-purple-300 text-xs"
          >
            <FaUserPlus className="inline mr-1" />
            Add
          </button>
        );
    }
  };

  return (
    <>
      {/* Friends Section */}
      <div className="flex items-center gap-2">
        <FaUsers className="text-purple-400" />
        <span className="text-gray-300 text-sm">Friends:</span>
        <button
          onClick={() => setShowFriendsModal(true)}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          {friends.length} friends
        </button>
        <button
          onClick={() => setShowAddFriendModal(true)}
          className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1"
          title="Add Friends"
        >
          <FaUserPlus />
          Add
        </button>
        <button
          onClick={clearAllData}
          className="text-red-400 hover:text-red-300 text-sm font-medium"
          title="Clear All Data (Temporary Debug)"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaUsers />
                  Friends ({friends.length})
                </h3>
                <button
                  onClick={() => setShowFriendsModal(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-4 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for friends by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searching && (
                  <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Search Results */}
              {searchTerm.trim() && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Search Results</h4>
                  {searchResults.length === 0 ? (
                    <p className="text-gray-400">
                      {searching ? 'Searching...' : 'No users found'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map(user => (
                        <div
                          key={user.uid}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">{user.displayName || 'Unknown User'}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                          {getStatusButton(user)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Friends List */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Your Friends</h4>
                {friends.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="text-4xl text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No friends yet</p>
                    <p className="text-gray-500 text-sm">Search above to find and add friends</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map(friend => (
                      <div
                        key={friend.uid || friend.id}
                        className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {friend.photoURL ? (
                            <img
                              src={friend.photoURL}
                              alt={friend.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium">
                                {friend.displayName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{friend.displayName || 'Unknown User'}</h3>
                            <p className="text-gray-400 text-sm">{friend.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMessageFriend(friend)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <FaComments />
                            Message
                          </button>
                          <button
                            onClick={() => handleViewProfile(friend)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <FaEye />
                            View
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => {
          setShowAddFriendModal(false);
          loadFriends(); // Refresh friends list when modal closes
        }}
      />
    </>
  );
};

export default FriendsSection;
