import React, { useState, useEffect } from 'react';
import { FaUsers, FaPlus, FaSearch, FaLock, FaEyeSlash, FaRobot, FaCrown } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import groupService from '../../services/groupService';
import CreateGroupModal from './CreateGroupModal';
import JoinGroupModal from './JoinGroupModal';

const GroupList = ({ onSelectGroup, selectedGroupId, isMinimal = false }) => {
  const { userProfile } = useUser();
  const { currentTheme } = useTheme();
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user's groups
  useEffect(() => {
    if (userProfile?.uid) {
      loadGroups();
    }
  }, [userProfile?.uid]);

  const loadGroups = () => {
    setLoading(true);
    try {
      const userGroups = groupService.getUserGroups(userProfile.uid);
      setGroups(userGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [...prev, newGroup]);
  };

  const handleGroupJoined = (joinedGroup) => {
    setGroups(prev => [...prev, joinedGroup]);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGroupIcon = (group) => {
    if (group.type === 'private') return <FaLock className="text-yellow-400" />;
    if (group.type === 'secret') return <FaEyeSlash className="text-red-400" />;
    return <FaUsers className="text-green-400" />;
  };

  const getLastMessage = (groupId) => {
    try {
      const messages = groupService.getGroupMessages(groupId);
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return 'No messages yet';
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.text || !lastMessage.sender) {
        return 'No messages yet';
      }

      const preview = lastMessage.text.length > 50
        ? lastMessage.text.substring(0, 50) + '...'
        : lastMessage.text;

      return `${lastMessage.sender.name || 'Unknown'}: ${preview}`;
    } catch (error) {
      console.error('Error getting last message:', error);
      return 'No messages yet';
    }
  };

  const getLastMessageTime = (groupId) => {
    try {
      const messages = groupService.getGroupMessages(groupId);
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return '';
      }

      const lastMessage = messages[messages.length - 1];
      if (!lastMessage || !lastMessage.timestamp) {
        return '';
      }

      const date = new Date(lastMessage.timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error getting last message time:', error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: currentTheme.colors.surface }}
    >
      {/* Header - Hidden in minimal mode */}
      {!isMinimal && (
        <div
          className="p-4 border-b"
          style={{ borderColor: currentTheme.colors.borderMuted }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-bold flex items-center space-x-2"
              style={{ color: currentTheme.colors.text }}
            >
              <FaUsers />
              <span>Groups</span>
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowJoinModal(true)}
                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Join Group"
              >
                <FaSearch className="text-sm" />
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                title="Create Group"
              >
                <FaPlus className="text-sm" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{ color: currentTheme.colors.textMuted }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{
                backgroundColor: currentTheme.colors.inputBackground,
                borderColor: currentTheme.colors.borderMuted,
                color: currentTheme.colors.text
              }}
            />
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Create or join a group to start chatting with multiple people'
              }
            </p>
            {!searchQuery && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FaPlus />
                  <span>Create Group</span>
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <FaSearch />
                  <span>Join Group</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`space-y-1 ${isMinimal ? 'p-1' : 'p-2'}`}>
            {filteredGroups.map(group => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group)}
                className={`${isMinimal ? 'p-2 justify-center' : 'p-3'} rounded-lg cursor-pointer transition-all duration-200 border`}
                style={{
                  backgroundColor: selectedGroupId === group.id
                    ? currentTheme.colors.surfaceVariant
                    : 'transparent',
                  borderColor: selectedGroupId === group.id
                    ? currentTheme.colors.primary
                    : 'transparent'
                }}
                title={isMinimal ? group.name : ''}
              >
                <div className={`flex items-center ${isMinimal ? 'justify-center' : 'space-x-3'}`}>
                  {/* Group Avatar */}
                  <div className="relative">
                    <div className={`${isMinimal ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center`}>
                      <FaUsers className={`text-white ${isMinimal ? 'text-sm' : 'text-lg'}`} />
                    </div>
                    {!isMinimal && (
                      <div className="absolute -bottom-1 -right-1">
                        {getGroupIcon(group)}
                      </div>
                    )}
                    {/* Unread indicator for minimal mode */}
                    {isMinimal && selectedGroupId === group.id && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Group Info - Hidden in minimal mode */}
                  {!isMinimal && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className="font-medium truncate flex items-center space-x-2"
                          style={{ color: currentTheme.colors.text }}
                        >
                          <span>{group.name}</span>
                          {group.admins.includes(userProfile?.uid) && (
                            <FaCrown className="text-yellow-400 text-xs" title="Admin" />
                          )}
                          {(group.members.includes('zentro_bot') || group.members.includes('zenny_bot')) && (
                            <FaRobot className="text-purple-400 text-xs" title="Zenny Active" />
                          )}
                        </h3>
                        <span
                          className="text-xs"
                          style={{ color: currentTheme.colors.textMuted }}
                        >
                          {getLastMessageTime(group.id)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p
                          className="text-sm truncate"
                          style={{ color: currentTheme.colors.textMuted }}
                        >
                          {getLastMessage(group.id)}
                        </p>
                        <span
                          className="text-xs"
                          style={{ color: currentTheme.colors.textMuted }}
                        >
                          {group.members.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onGroupJoined={handleGroupJoined}
        />
      )}
    </div>
  );
};

export default GroupList;
