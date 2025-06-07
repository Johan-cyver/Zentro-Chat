import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaTimes, FaSync, FaPaperPlane } from 'react-icons/fa';
import zentroBotAI from '../../services/geminiAI';

/**
 * DailyPrompts - Component for displaying daily conversation prompts
 *
 * Features:
 * - Mood and interest-based prompts
 * - Daily refresh system
 * - Quick send functionality
 * - Animated prompt cards
 */
const DailyPrompts = ({ userId, userProfile, onSendPrompt, onClose, theme }) => {
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDailyContent = async () => {
    try {
      // Get daily prompt for initial display
      const initialDailyPrompt = await zentroBotAI.generateDailyPrompt(userId, userProfile);
      if (typeof initialDailyPrompt === 'string') {
        setDailyPrompt(initialDailyPrompt);
      } else {
        console.error('Invalid daily prompt received:', initialDailyPrompt);
        setDailyPrompt('What would you like to discuss today?');
      }

      // Fetch suggestions
      const fetchedSuggestions = await zentroBotAI.getSuggestions(userId, userProfile);
      if (Array.isArray(fetchedSuggestions)) {
        setSuggestions(fetchedSuggestions);
      } else {
        console.error('Invalid suggestions received:', fetchedSuggestions);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error loading daily content:', error);
      setDailyPrompt('What would you like to discuss today?');
      setSuggestions([]);
    }
  };

  useEffect(() => {
    loadDailyContent();
  }, [userId, userProfile]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Get a new, different prompt for the "Today's Prompt" section
      const newRefreshedPrompt = await zentroBotAI.getAFreshThoughtProvokingPrompt();
      setDailyPrompt(newRefreshedPrompt); // Update the main prompt display

      // Also refresh interest-based suggestions
      const newInterestSuggestions = await zentroBotAI.generateInterestBasedSuggestions(userId, userProfile);
      setSuggestions(newInterestSuggestions);
    } catch (error) {
      console.error("Error refreshing prompts or suggestions:", error);
    } finally {
      // Simulate refresh delay for better UX
      setTimeout(() => {
        setIsRefreshing(false);
      }, 300); // Reduced delay a bit
    }
  };

  const handleSendPrompt = (promptText) => {
    onSendPrompt(promptText);
    onClose();
  };

  const getSuggestionActionText = (suggestion) => {
    switch (suggestion.type) {
      case 'blog':
        return 'Get blog ideas';
      case 'music':
        return 'Discover music';
      case 'group_chat':
        return 'Find community';
      default:
        return 'Explore';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderMuted
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <FaLightbulb className="text-white text-lg" />
            </div>
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: theme.colors.text }}
              >
                Daily Inspiration
              </h2>
              <p
                className="text-sm"
                style={{ color: theme.colors.textMuted }}
              >
                Personalized prompts just for you
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              style={{ color: theme.colors.textMuted }}
              title="Refresh prompts"
            >
              <FaSync className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              style={{ color: theme.colors.textMuted }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Daily Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h3
            className="text-lg font-semibold mb-3 flex items-center space-x-2"
            style={{ color: theme.colors.text }}
          >
            <span>🌟</span>
            <span>Today's Prompt</span>
          </h3>
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              borderColor: theme.colors.borderMuted
            }}
          >
            {dailyPrompt && (
              <p
                className="mb-4"
                style={{ color: theme.colors.text }}
              >
                {dailyPrompt}
              </p>
            )}
            <button
              onClick={() => handleSendPrompt(dailyPrompt)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: theme.colors.primary,
                color: 'white'
              }}
            >
              <FaPaperPlane className="text-sm" />
              <span>Start Conversation</span>
            </button>
          </div>
        </motion.div>

        {/* Interest-Based Suggestions */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3
              className="text-lg font-semibold mb-3 flex items-center space-x-2"
              style={{ color: theme.colors.text }}
            >
              <span>💡</span>
              <span>Based on Your Interests</span>
            </h3>
            <div className="space-y-3">
              <AnimatePresence>
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200"
                    style={{
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.borderMuted
                    }}
                    onClick={() => handleSendPrompt(`Help me ${getSuggestionActionText(suggestion).toLowerCase()} for ${suggestion.title}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <div className="flex-1">
                        <h4
                          className="font-medium"
                          style={{ color: theme.colors.text }}
                        >
                          {suggestion.title}
                        </h4>
                        <p
                          className="text-sm"
                          style={{ color: theme.colors.textMuted }}
                        >
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* User Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 p-4 rounded-lg"
          style={{
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: theme.colors.borderMuted
          }}
        >
          <h4
            className="font-medium mb-2"
            style={{ color: theme.colors.text }}
          >
            Your ZentroBot Journey
          </h4>
          {(userId => {
            const stats = zentroBotAI.getUserStats(userId);
            const xpEarnedInCurrentLevel = stats.xp - (stats.currentLevelXpThreshold || 0);
            const xpNeededForNextLevel = (stats.nextLevelXp || Infinity) - (stats.currentLevelXpThreshold || 0);
            const progressPercentage = xpNeededForNextLevel > 0 ? (xpEarnedInCurrentLevel / xpNeededForNextLevel) * 100 : 0;

            return (
              <div>
                <div className="grid grid-cols-3 gap-4 text-center mb-3">
            <div>
              <div
                className="text-lg font-bold"
                style={{ color: theme.colors.primary }}
              >
                      {stats.level}
              </div>
              <div
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Level
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold"
                style={{ color: theme.colors.primary }}
              >
                      {xpEarnedInCurrentLevel} <span className="text-sm" style={{color: theme.colors.textMuted}}>/ {xpNeededForNextLevel === Infinity ? 'MAX' : xpNeededForNextLevel}</span>
              </div>
              <div
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                XP
              </div>
            </div>
            <div>
              <div
                className="text-lg font-bold"
                style={{ color: theme.colors.primary }}
              >
                      {stats.achievements}
              </div>
              <div
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                Achievements
              </div>
            </div>
          </div>
                {/* XP Progress Bar */}
                {xpNeededForNextLevel !== Infinity && (
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: theme.colors.border }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                )}
                 {xpNeededForNextLevel === Infinity && (
                   <p className="text-xs text-center mt-1" style={{color: theme.colors.primary}}>Max Level Reached! 🎉</p>
                 )}
              </div>
            );
          })(userId)}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DailyPrompts;
