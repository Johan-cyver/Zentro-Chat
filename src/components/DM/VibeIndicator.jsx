import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import zentroBotAI from '../../services/geminiAI';

/**
 * VibeIndicator - Component for displaying user's communication vibe
 * 
 * Features:
 * - Shows current energy level and communication style
 * - Detailed vibe breakdown on click
 * - Real-time vibe updates
 * - Visual indicators for different vibe aspects
 */
const VibeIndicator = ({ userId, theme, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const userVibe = zentroBotAI.getUserVibe(userId);

  const getVibeColor = (energyLevel) => {
    const colors = {
      'high': '#ff6b6b',
      'medium': '#4ecdc4',
      'low': '#95a5a6'
    };
    return colors[energyLevel] || colors['medium'];
  };

  const getVibeEmoji = (energyLevel) => {
    const emojis = {
      'high': '⚡',
      'medium': '😊',
      'low': '😌'
    };
    return emojis[energyLevel] || '😊';
  };

  const getStyleEmoji = (style) => {
    const emojis = {
      'casual': '😎',
      'formal': '🎩',
      'neutral': '🙂'
    };
    return emojis[style] || '🙂';
  };

  const getEmojiUsageEmoji = (usage) => {
    const emojis = {
      'high': '🎉',
      'moderate': '🙂',
      'low': '😐'
    };
    return emojis[usage] || '🙂';
  };

  if (compact) {
    return (
      <div 
        className="flex items-center space-x-1 cursor-pointer"
        onClick={() => setShowDetails(true)}
        title="Click to see vibe details"
      >
        <span>{getVibeEmoji(userVibe.energyLevel)}</span>
        <span 
          className="text-xs"
          style={{ color: getVibeColor(userVibe.energyLevel) }}
        >
          {userVibe.energyLevel}
        </span>
      </div>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer"
        style={{
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: theme.colors.borderMuted
        }}
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-center space-x-1">
          <span className="text-lg">{getVibeEmoji(userVibe.energyLevel)}</span>
          <div>
            <div 
              className="text-sm font-medium"
              style={{ color: theme.colors.text }}
            >
              {userVibe.energyLevel.charAt(0).toUpperCase() + userVibe.energyLevel.slice(1)} Energy
            </div>
            <div 
              className="text-xs"
              style={{ color: theme.colors.textMuted }}
            >
              {userVibe.communicationStyle} style
            </div>
          </div>
        </div>
        <FaInfoCircle 
          className="text-xs"
          style={{ color: theme.colors.textMuted }}
        />
      </motion.div>

      {/* Detailed Vibe Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl p-6 max-w-md w-full"
              style={{
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.borderMuted
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: getVibeColor(userVibe.energyLevel) }}
                  >
                    {getVibeEmoji(userVibe.energyLevel)}
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{ color: theme.colors.text }}
                    >
                      Your Communication Vibe
                    </h2>
                    <p
                      className="text-sm"
                      style={{ color: theme.colors.textMuted }}
                    >
                      How ZentroBot sees your style
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  style={{ color: theme.colors.textMuted }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Vibe Details */}
              <div className="space-y-4">
                {/* Energy Level */}
                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: theme.colors.surfaceVariant }}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getVibeEmoji(userVibe.energyLevel)}</span>
                    <div>
                      <div className="font-medium" style={{ color: theme.colors.text }}>
                        Energy Level
                      </div>
                      <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                        How energetic your messages are
                      </div>
                    </div>
                  </div>
                  <span 
                    className="font-bold"
                    style={{ color: getVibeColor(userVibe.energyLevel) }}
                  >
                    {userVibe.energyLevel.toUpperCase()}
                  </span>
                </div>

                {/* Communication Style */}
                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: theme.colors.surfaceVariant }}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStyleEmoji(userVibe.communicationStyle)}</span>
                    <div>
                      <div className="font-medium" style={{ color: theme.colors.text }}>
                        Communication Style
                      </div>
                      <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                        Your conversation approach
                      </div>
                    </div>
                  </div>
                  <span 
                    className="font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {userVibe.communicationStyle.toUpperCase()}
                  </span>
                </div>

                {/* Emoji Usage */}
                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: theme.colors.surfaceVariant }}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getEmojiUsageEmoji(userVibe.emojiUsage)}</span>
                    <div>
                      <div className="font-medium" style={{ color: theme.colors.text }}>
                        Emoji Usage
                      </div>
                      <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                        How much you use emojis
                      </div>
                    </div>
                  </div>
                  <span 
                    className="font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {userVibe.emojiUsage.toUpperCase()}
                  </span>
                </div>

                {/* Enthusiasm */}
                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: theme.colors.surfaceVariant }}>
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="font-medium" style={{ color: theme.colors.text }}>
                        Enthusiasm Level
                      </div>
                      <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                        Your excitement in conversations
                      </div>
                    </div>
                  </div>
                  <span 
                    className="font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    {userVibe.enthusiasm.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div 
                className="mt-6 p-3 rounded-lg"
                style={{ backgroundColor: theme.colors.primaryMuted }}
              >
                <p 
                  className="text-sm text-center"
                  style={{ color: theme.colors.primary }}
                >
                  💡 ZentroBot adapts its responses to match your communication style and energy level!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VibeIndicator;
