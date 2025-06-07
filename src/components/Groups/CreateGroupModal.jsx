import React, { useState } from 'react';
import { FaTimes, FaUsers, FaLock, FaEyeSlash, FaRobot } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import groupService from '../../services/groupService';

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const { userProfile } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public', // public, private, secret
    allowZentroBot: true,
    maxMembers: 50
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Group name is required');
      return;
    }

    if (formData.name.length < 3) {
      setError('Group name must be at least 3 characters');
      return;
    }

    if (formData.name.length > 50) {
      setError('Group name must be less than 50 characters');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const groupData = {
        ...formData,
        settings: {
          allowInvites: true,
          allowZentroBot: formData.allowZentroBot,
          maxMembers: parseInt(formData.maxMembers)
        }
      };

      const newGroup = groupService.createGroup(groupData, userProfile.uid);

      // Auto-add Zenny if enabled
      if (formData.allowZentroBot) {
        try {
          await groupService.addZennyToGroup(newGroup.id);
        } catch (error) {
          console.warn('Could not add Zenny to group:', error);
        }
      }

      onGroupCreated(newGroup);
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'public': return <FaUsers className="text-green-400" />;
      case 'private': return <FaLock className="text-yellow-400" />;
      case 'secret': return <FaEyeSlash className="text-red-400" />;
      default: return <FaUsers />;
    }
  };

  const getTypeDescription = (type) => {
    switch (type) {
      case 'public': return 'Anyone can find and join this group';
      case 'private': return 'Only invited members can join';
      case 'secret': return 'Hidden group with secret code access';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Create Group</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this group about?"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 resize-none"
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Group Type
            </label>
            <div className="space-y-3">
              {['public', 'private', 'secret'].map(type => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={formData.type === type}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 focus:ring-purple-500"
                  />
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(type)}
                    <div>
                      <div className="text-white font-medium capitalize">{type}</div>
                      <div className="text-sm text-gray-400">{getTypeDescription(type)}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Members
            </label>
            <select
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              <option value={10}>10 members</option>
              <option value={25}>25 members</option>
              <option value={50}>50 members</option>
              <option value={100}>100 members</option>
              <option value={250}>250 members</option>
            </select>
          </div>

          {/* Zenny */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <FaRobot className="text-purple-400 text-xl" />
              <div>
                <div className="text-white font-medium">Include Zenny</div>
                <div className="text-sm text-gray-400">AI assistant for your group</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allowZentroBot"
                checked={formData.allowZentroBot}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.name.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <FaUsers />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
