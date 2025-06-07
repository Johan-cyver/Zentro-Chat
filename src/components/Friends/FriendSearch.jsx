import React, { useState } from 'react';
import { FaSearch, FaUserPlus, FaCheck, FaClock, FaUsers } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const FriendSearch = ({ theme, onClose }) => {
  const { userProfile } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friendshipStatuses, setFriendshipStatuses] = useState(new Map());

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
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
      alert('Failed to search users');
    } finally {
      setLoading(false);
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusButton = (user) => {
    const status = friendshipStatuses.get(user.uid);

    switch (status) {
      case 'friends':
        return (
          <div className="flex items-center space-x-1 text-green-400 text-sm">
            <FaCheck />
            <span>Friends</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-yellow-400 text-sm">
            <FaClock />
            <span>Pending</span>
          </div>
        );
      case 'none':
      default:
        return (
          <button
            onClick={() => handleSendFriendRequest(user)}
            className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            <FaUserPlus />
            <span>Add Friend</span>
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: theme?.colors?.surface || '#1F2937' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <FaUsers />
              <span>Find Friends</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by user ID, name, or email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center">
              <FaUsers className="text-4xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? 'No users found' : 'Search for users to add as friends'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {searchResults.map(user => (
                <div
                  key={user.uid}
                  className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {user.displayName || 'Unknown User'}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      {user.email}
                    </p>
                    <p className="text-gray-500 text-xs">
                      ID: {user.uid}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {getStatusButton(user)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <p className="text-gray-400 text-sm text-center">
            Search by exact user ID, display name, or email address
          </p>
        </div>
      </div>
    </div>
  );
};

export default FriendSearch;
