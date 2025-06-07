import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaStar, FaTimes } from 'react-icons/fa';

/**
 * AchievementNotification - Component for displaying achievement notifications
 * 
 * Features:
 * - Animated achievement popup
 * - XP gain display
 * - Auto-dismiss functionality
 * - Multiple achievement queue
 */
const AchievementNotification = ({ achievements, onDismiss, theme }) => {
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setQueue(prev => [...prev, ...achievements]);
    }
  }, [achievements]);

  useEffect(() => {
    if (queue.length > 0 && !currentAchievement) {
      const nextAchievement = queue[0];
      setCurrentAchievement(nextAchievement);
      setQueue(prev => prev.slice(1));
      setIsVisible(true);

      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [queue, currentAchievement]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentAchievement(null);
      if (onDismiss) {
        onDismiss();
      }
    }, 300);
  };

  const getAchievementIcon = (achievementId) => {
    if (achievementId.includes('chat')) return '💬';
    if (achievementId.includes('first')) return '🎉';
    if (achievementId.includes('topic')) return '🔍';
    if (achievementId.includes('curious')) return '🤔';
    return '🏆';
  };

  const getAchievementColor = (achievementId) => {
    if (achievementId.includes('first')) return 'from-green-400 to-green-600';
    if (achievementId.includes('chat_5')) return 'from-blue-400 to-blue-600';
    if (achievementId.includes('chat_10')) return 'from-purple-400 to-purple-600';
    if (achievementId.includes('chat_25')) return 'from-orange-400 to-orange-600';
    if (achievementId.includes('chat_50')) return 'from-red-400 to-red-600';
    if (achievementId.includes('chat_100')) return 'from-yellow-400 to-yellow-600';
    if (achievementId.includes('topic')) return 'from-indigo-400 to-indigo-600';
    if (achievementId.includes('curious')) return 'from-pink-400 to-pink-600';
    return 'from-gray-400 to-gray-600';
  };

  if (!currentAchievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div
            className="rounded-2xl p-6 shadow-2xl border backdrop-blur-sm"
            style={{
              backgroundColor: theme.colors.surface + 'F0', // Add transparency
              borderColor: theme.colors.borderMuted
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FaTrophy className="text-yellow-400 text-lg" />
                <span
                  className="font-bold text-sm"
                  style={{ color: theme.colors.text }}
                >
                  ACHIEVEMENT UNLOCKED!
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                style={{ color: theme.colors.textMuted }}
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Achievement Content */}
            <div className="flex items-center space-x-4">
              {/* Achievement Icon */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${getAchievementColor(currentAchievement.id)} shadow-lg`}
              >
                {getAchievementIcon(currentAchievement.id)}
              </div>

              {/* Achievement Details */}
              <div className="flex-1">
                <h3
                  className="font-bold text-lg mb-1"
                  style={{ color: theme.colors.text }}
                >
                  {currentAchievement.title}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{ color: theme.colors.textMuted }}
                >
                  {currentAchievement.description}
                </p>
                
                {/* XP Gain */}
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.colors.primary }}
                  >
                    +{currentAchievement.xp} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar Animation */}
            <motion.div
              className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
              />
            </motion.div>

            {/* Queue Indicator */}
            {queue.length > 0 && (
              <div className="mt-3 text-center">
                <span
                  className="text-xs"
                  style={{ color: theme.colors.textMuted }}
                >
                  +{queue.length} more achievement{queue.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Celebration Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i]
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementNotification;
