import React, { useState } from 'react';
import { FaArrowLeft, FaCog, FaLock, FaEyeSlash, FaUsers, FaRobot, FaTrash, FaSave } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import groupService from '../../services/groupService';

const GroupSettings = ({ group, onBack, onGroupUpdated, onLeaveGroup }) => {
  const { userProfile } = useUser();
  const [groupName, setGroupName] = useState(group.name || '');
  const [groupDescription, setGroupDescription] = useState(group.description || '');
  const [groupType, setGroupType] = useState(group.type || 'public');
  const [allowZentroBot, setAllowZentroBot] = useState(group.settings?.allowZentroBot || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = group.admins?.includes(userProfile?.uid);
  const isOwner = group.ownerId === userProfile?.uid;

  const handleSaveSettings = async () => {
    if (!isAdmin) return;
    
    setSaving(true);
    try {
      const updatedGroup = {
        ...group,
        name: groupName,
        description: groupDescription,
        type: groupType,
        settings: {
          ...group.settings,
          allowZentroBot
        }
      };
      
      await groupService.updateGroup(group.id, updatedGroup);
      onGroupUpdated(updatedGroup);
    } catch (error) {
      console.error('Error updating group:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isOwner) return;
    
    try {
      await groupService.deleteGroup(group.id);
      onBack();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'private': return <FaLock className="text-yellow-400" />;
      case 'secret': return <FaEyeSlash className="text-red-400" />;
      default: return <FaUsers className="text-green-400" />;
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case 'public': return 'Anyone can find and join this group';
      case 'private': return 'Only invited members can join';
      case 'secret': return 'Invitation only, hidden from search';
      default: return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FaCog />
              <span>Group Settings</span>
            </h2>
            <p className="text-sm text-gray-400">Manage group preferences</p>
          </div>
        </div>
        
        {isAdmin && (
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <FaSave />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        )}
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={!isAdmin}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                placeholder="Enter group name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                disabled={!isAdmin}
                rows={3}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 resize-none"
                placeholder="Describe your group"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Privacy & Access</h3>
          
          <div className="space-y-3">
            {['public', 'private', 'secret'].map(type => (
              <label
                key={type}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  groupType === type
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                } ${!isAdmin ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="groupType"
                  value={type}
                  checked={groupType === type}
                  onChange={(e) => setGroupType(e.target.value)}
                  disabled={!isAdmin}
                  className="sr-only"
                />
                <div className="flex items-center space-x-3 flex-1">
                  {getTypeIcon(type)}
                  <div>
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-sm text-gray-400">{getTypeDescription(type)}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bot Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Bot Integration</h3>
          
          <label className="flex items-center justify-between p-3 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors">
            <div className="flex items-center space-x-3">
              <FaRobot className="text-purple-400" />
              <div>
                <div className="font-medium">Allow Zenny Bot</div>
                <div className="text-sm text-gray-400">Enable AI assistant in this group</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={allowZentroBot}
              onChange={(e) => setAllowZentroBot(e.target.checked)}
              disabled={!isAdmin}
              className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 disabled:opacity-50"
            />
          </label>
        </div>

        {/* Group Info */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Group Information</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span>{new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Members:</span>
              <span>{group.members?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Group ID:</span>
              <span className="font-mono text-xs">{group.id}</span>
            </div>
            {group.secretCode && (
              <div className="flex justify-between">
                <span className="text-gray-400">Secret Code:</span>
                <span className="font-mono text-xs">{group.secretCode}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="p-4 border-t border-gray-700">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-300 mb-4">
              Once you delete a group, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FaTrash />
              <span>Delete Group</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Delete Group</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "{group.name}"? This action cannot be undone and all messages will be lost.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSettings;
