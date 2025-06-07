import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaSearch, FaLock, FaEyeSlash, FaKey } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import groupService from '../../services/groupService';

const JoinGroupModal = ({ onClose, onGroupJoined }) => {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('search'); // search, code
  const [searchQuery, setSearchQuery] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [publicGroups, setPublicGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(null);
  const [error, setError] = useState('');

  // Load public groups when search tab is active
  useEffect(() => {
    if (activeTab === 'search') {
      loadPublicGroups();
    }
  }, [activeTab]);

  const loadPublicGroups = () => {
    setLoading(true);
    try {
      const groups = groupService.searchPublicGroups(searchQuery);
      // Filter out groups user is already in
      const userGroups = groupService.getUserGroups(userProfile.uid);
      const userGroupIds = userGroups.map(g => g.id);
      const availableGroups = groups.filter(g => !userGroupIds.includes(g.id));
      setPublicGroups(availableGroups);
    } catch (error) {
      console.error('Error loading public groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search groups when query changes
  useEffect(() => {
    if (activeTab === 'search') {
      const timeoutId = setTimeout(() => {
        loadPublicGroups();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

  const handleJoinGroup = async (group) => {
    setJoining(group.id);
    setError('');

    try {
      const joinedGroup = await groupService.joinGroup(group.id, userProfile.uid);
      onGroupJoined(joinedGroup);
      onClose();
    } catch (error) {
      console.error('Error joining group:', error);
      setError(error.message || 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  const handleJoinByCode = async (e) => {
    e.preventDefault();
    
    if (!secretCode.trim()) {
      setError('Please enter a secret code');
      return;
    }

    setJoining('code');
    setError('');

    try {
      const joinedGroup = await groupService.joinGroup(secretCode.trim().toUpperCase(), userProfile.uid);
      onGroupJoined(joinedGroup);
      onClose();
    } catch (error) {
      console.error('Error joining group by code:', error);
      setError(error.message || 'Invalid secret code');
    } finally {
      setJoining(null);
    }
  };

  const getGroupIcon = (group) => {
    if (group.type === 'private') return <FaLock className="text-yellow-400" />;
    if (group.type === 'secret') return <FaEyeSlash className="text-red-400" />;
    return <FaUsers className="text-green-400" />;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full max-h-[80vh] border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Join Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaSearch />
            <span>Browse Groups</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
              activeTab === 'code'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaKey />
            <span>Secret Code</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search public groups..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
              </div>

              {/* Groups List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : publicGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="text-4xl text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">
                      {searchQuery ? 'No groups found' : 'No public groups available'}
                    </p>
                  </div>
                ) : (
                  publicGroups.map(group => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <FaUsers className="text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1">
                            {getGroupIcon(group)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{group.name}</h3>
                          <p className="text-sm text-gray-400">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </p>
                          {group.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinGroup(group)}
                        disabled={joining === group.id}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
                      >
                        {joining === group.id ? 'Joining...' : 'Join'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <FaKey className="text-4xl text-purple-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-1">Join Secret Group</h3>
                <p className="text-sm text-gray-400">
                  Enter the secret code shared by the group admin
                </p>
              </div>

              <form onSubmit={handleJoinByCode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Secret Code
                  </label>
                  <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                    placeholder="Enter 8-character code..."
                    maxLength={8}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 text-center text-lg font-mono tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={joining === 'code' || !secretCode.trim()}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {joining === 'code' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <FaKey />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGroupModal;
