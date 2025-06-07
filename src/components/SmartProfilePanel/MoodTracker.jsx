import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSmile, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * MoodTracker - A component for users to set and display their current mood
 *
 * Features:
 * - Emoji mood selection
 * - Custom mood text
 * - Smooth animations
 * - Persistent mood storage
 */
const MoodTracker = ({ user = null, isViewingOwnProfile = true }) => {
  const { userProfile, updateMood } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMood, setSelectedMood] = useState(userProfile.mood || '');
  const [customText, setCustomText] = useState('');

  // Use the passed user prop if viewing someone else's profile, otherwise use current user
  const displayUser = user || userProfile;

  // Predefined mood options with emojis and labels
  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: '😊 Happy' },
    { emoji: '😎', label: 'Cool', value: '😎 Cool' },
    { emoji: '🤔', label: 'Thoughtful', value: '🤔 Thoughtful' },
    { emoji: '😴', label: 'Sleepy', value: '😴 Sleepy' },
    { emoji: '🔥', label: 'Motivated', value: '🔥 Motivated' },
    { emoji: '💪', label: 'Strong', value: '💪 Strong' },
    { emoji: '🎉', label: 'Excited', value: '🎉 Excited' },
    { emoji: '😌', label: 'Peaceful', value: '😌 Peaceful' },
    { emoji: '🤗', label: 'Grateful', value: '🤗 Grateful' },
    { emoji: '🎯', label: 'Focused', value: '🎯 Focused' },
    { emoji: '🌟', label: 'Inspired', value: '🌟 Inspired' },
    { emoji: '☕', label: 'Caffeinated', value: '☕ Caffeinated' }
  ];

  const handleSaveMood = () => {
    if (!isViewingOwnProfile) return;

    const finalMood = customText.trim() || selectedMood;
    updateMood(finalMood);
    setIsEditing(false);
    setCustomText('');
  };

  const handleCancel = () => {
    setSelectedMood(displayUser?.mood || '');
    setCustomText('');
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaSmile className="text-purple-400" />
          Current Mood
        </h3>

        {!isEditing && isViewingOwnProfile && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
            title="Edit mood"
          >
            <FaEdit className="text-sm" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Mood Options Grid */}
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => {
                    setSelectedMood(mood.value);
                    setCustomText('');
                  }}
                  className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1 ${
                    selectedMood === mood.value
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-gray-600 hover:border-gray-500 text-gray-300'
                  }`}
                  title={mood.label}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Mood Input */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">Or write your own:</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedMood('');
                }}
                placeholder="How are you feeling?"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                maxLength={50}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveMood}
                disabled={!selectedMood && !customText.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaSave className="text-sm" />
                Save Mood
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
              >
                <FaTimes className="text-sm" />
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {displayUser?.mood ? (
              <div className="text-center py-4">
                <div className="text-2xl mb-2">{displayUser.mood}</div>
                <p className="text-gray-400 text-sm">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FaSmile className="text-3xl mx-auto mb-2 opacity-50" />
                <p>No mood set yet</p>
                {isViewingOwnProfile && <p className="text-sm">Click edit to share how you're feeling!</p>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodTracker;
