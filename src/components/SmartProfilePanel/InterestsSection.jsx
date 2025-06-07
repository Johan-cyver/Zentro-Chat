import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTags, FaPlus, FaTimes, FaGamepad, FaPalette, FaPlane, FaCode, FaCamera, FaGuitar, FaBook, FaCoffee } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * InterestsSection - A component for users to manage their interests and tags
 *
 * Features:
 * - Predefined interest categories
 * - Custom interest tags
 * - Visual tag display
 * - Easy add/remove functionality
 */
const InterestsSection = ({ user = null, isViewingOwnProfile = true }) => {
  const { userProfile, updateInterests } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newInterest, setNewInterest] = useState('');

  // Use the passed user prop if viewing someone else's profile, otherwise use current user
  const displayUser = user || userProfile;

  // Predefined interest options with icons
  const predefinedInterests = [
    { label: 'Gaming', icon: FaGamepad, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { label: 'Art & Design', icon: FaPalette, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { label: 'Travel', icon: FaPlane, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { label: 'Programming', icon: FaCode, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { label: 'Photography', icon: FaCamera, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { label: 'Music', icon: FaGuitar, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { label: 'Reading', icon: FaBook, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { label: 'Coffee', icon: FaCoffee, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
  ];

  const currentInterests = displayUser?.interests || [];

  const handleAddInterest = (interest) => {
    if (!isViewingOwnProfile) return;

    if (!currentInterests.includes(interest)) {
      const updatedInterests = [...currentInterests, interest];
      updateInterests(updatedInterests);
    }
  };

  const handleRemoveInterest = (interest) => {
    if (!isViewingOwnProfile) return;

    const updatedInterests = currentInterests.filter(item => item !== interest);
    updateInterests(updatedInterests);
  };

  const handleAddCustomInterest = () => {
    if (!isViewingOwnProfile) return;

    if (newInterest.trim() && !currentInterests.includes(newInterest.trim())) {
      const updatedInterests = [...currentInterests, newInterest.trim()];
      updateInterests(updatedInterests);
      setNewInterest('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewInterest('');
    setIsAdding(false);
  };

  // Get icon for predefined interests
  const getInterestIcon = (interest) => {
    const predefined = predefinedInterests.find(p => p.label === interest);
    return predefined ? predefined.icon : null;
  };

  // Get color for predefined interests
  const getInterestColor = (interest) => {
    const predefined = predefinedInterests.find(p => p.label === interest);
    return predefined ? predefined.color : 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaTags className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Interests & Tags</h3>
          <span className="text-xs text-gray-500">({currentInterests.length})</span>
        </div>

        {!isAdding && isViewingOwnProfile && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
            title="Add interest"
          >
            <FaPlus className="text-sm" />
          </button>
        )}
      </div>

      {/* Current Interests */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Your Interests</h4>
        <div className="flex flex-wrap gap-2 min-h-[60px]">
          <AnimatePresence>
            {currentInterests.map((interest, index) => {
              const Icon = getInterestIcon(interest);
              const colorClass = getInterestColor(interest);

              return (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${isViewingOwnProfile ? 'group cursor-pointer' : ''} ${colorClass}`}
                  onClick={isViewingOwnProfile ? () => handleRemoveInterest(interest) : undefined}
                  title={isViewingOwnProfile ? "Click to remove" : undefined}
                >
                  {Icon && <Icon className="text-xs" />}
                  <span>{interest}</span>
                  {isViewingOwnProfile && <FaTimes className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200" />}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {currentInterests.length === 0 && !isAdding && (
            <div className="text-center py-4 text-gray-500 w-full">
              <FaTags className="text-2xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No interests added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Interest */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-6 space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add a custom interest..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                maxLength={30}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCustomInterest();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleAddCustomInterest}
                disabled={!newInterest.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Predefined Interests - only show for own profile */}
      {isViewingOwnProfile && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Add</h4>
          <div className="flex flex-wrap gap-2">
            {predefinedInterests
              .filter(interest => !currentInterests.includes(interest.label))
              .map((interest) => {
                const Icon = interest.icon;

                return (
                  <button
                    key={interest.label}
                    onClick={() => handleAddInterest(interest.label)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium hover:scale-105 transition-all duration-200 ${interest.color}`}
                  >
                    <Icon className="text-xs" />
                    <span>{interest.label}</span>
                    <FaPlus className="text-xs" />
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestsSection;
