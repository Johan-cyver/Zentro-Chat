import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import friendsService from '../../services/friendsService';

const FriendRequests = () => {
  const userContext = useUser();
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userProfile } = userContext || {};

  useEffect(() => {
    if (userProfile?.uid) {
      loadFriendRequests();
    }
  }, [userProfile]);

  // Handle loading state - return early if no user context
  if (!userContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const loadFriendRequests = async () => {
    try {
      setLoading(true);
      const requests = await friendsService.getFriendRequests(userProfile.uid);
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsService.acceptFriendRequest(userProfile.uid, requestId);
      await loadFriendRequests(); // Refresh the list
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsService.rejectFriendRequest(userProfile.uid, requestId);
      await loadFriendRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Friend Requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Friend Requests
          </h1>
          <p className="text-gray-300">Manage your incoming friend requests</p>
        </motion.div>

        {/* Friend Requests List */}
        <div className="space-y-4">
          {friendRequests.length > 0 ? (
            friendRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <FaUserPlus className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{request.senderName || 'Unknown User'}</h3>
                      <p className="text-gray-400 text-sm">Wants to be your friend</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FaCheck />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <FaUserPlus className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Friend Requests</h3>
              <p className="text-gray-500">You don't have any pending friend requests at the moment.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
