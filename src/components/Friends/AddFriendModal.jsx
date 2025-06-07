import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaSpinner, FaTimes, FaUsers, FaCheck, FaClock } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const AddFriendModal = ({ isOpen, onClose }) => {
  const { userProfile } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState(new Map());
  const [loading, setLoading] = useState(false);

  // Search for users
  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const users = await friendsService.searchUsers(query);

      // Filter out current user
      const filteredUsers = users.filter(user => user.uid !== userProfile.uid);

      setSearchResults(filteredUsers);

      // Check friendship status for each user
      const statusMap = new Map();
      for (const user of filteredUsers) {
        const status = await friendsService.checkFriendshipStatus(userProfile.uid, user.uid);
        statusMap.set(user.uid, status);
      }
      setFriendshipStatuses(statusMap);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Send friend request
  const handleSendFriendRequest = async (targetUser) => {
    setLoading(true);
    try {
      await friendsService.sendFriendRequest(userProfile.uid, targetUser.uid, userProfile);
      setFriendshipStatuses(prev => new Map(prev.set(targetUser.uid, 'pending')));

      // Show success message
      alert(`Friend request sent to ${targetUser.displayName}!`);
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert(error.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  // Cancel friend request
  const handleCancelFriendRequest = async (targetUser) => {
    setLoading(true);
    try {      // Find the request ID for this user
      const requests = await friendsService.getFriendRequests(userProfile.uid);
      const request = requests.find(req =>
        req.senderId === userProfile.uid && req.receiverId === targetUser.uid
      );

      if (request) {
        await friendsService.cancelFriendRequest(request.id, userProfile.uid);
        setFriendshipStatuses(prev => new Map(prev.set(targetUser.uid, 'none')));
        alert('Friend request cancelled!');
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      alert(error.message || 'Failed to cancel friend request');
    } finally {
      setLoading(false);
    }
  };

  // Get status button for user
  const getStatusButton = (user) => {
    const status = friendshipStatuses.get(user.uid);

    switch (status) {
      case 'friends':
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-900/30 border border-green-500/50 rounded-full text-green-400 text-xs">
            <FaCheck />
            Friends
          </span>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-900/30 border border-yellow-500/50 rounded-full text-yellow-400 text-xs">
              <FaClock />
              Pending
            </span>
            <button
              onClick={() => handleCancelFriendRequest(user)}
              disabled={loading}
              className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-full text-white text-xs transition-colors"
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
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-full text-white text-xs transition-colors"
          >
            <FaUserPlus />
            Add Friend
          </button>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaUsers className="text-purple-400" />
              Add Friends
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Search for people who have joined Zentro Chat and send them friend requests
          </p>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-800">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searching && (
              <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 animate-spin" />
            )}
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Type at least 2 characters to search
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchTerm.length < 2 ? (
            <div className="text-center py-12">
              <FaSearch className="text-4xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Search for Friends</h3>
              <p className="text-gray-400 text-sm">
                Enter a name, email, or username to find people on Zentro Chat
              </p>
            </div>
          ) : searching ? (
            <div className="text-center py-12">
              <FaSpinner className="text-4xl text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-400">Searching for users...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">😔</div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No users found</h3>
              <p className="text-gray-400 text-sm">
                Try searching with a different name or email
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-white mb-3">
                Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
              </h4>
              {searchResults.map(user => (
                <div
                  key={user.uid}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {user.photoURL && user.photoURL !== 'null' && user.photoURL !== '' ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center"
                      style={{ display: (user.photoURL && user.photoURL !== 'null' && user.photoURL !== '') ? 'none' : 'flex' }}
                    >
                      <span className="text-white font-medium text-lg">
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {user.displayName || 'Unknown User'}
                      </h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      {user.location && (
                        <p className="text-gray-500 text-xs">{user.location}</p>
                      )}
                    </div>
                  </div>
                  {getStatusButton(user)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFriendModal;
