import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaTrophy, FaLock, FaUnlock } from 'react-icons/fa';
import zentroBotAI from '../../services/geminiAI'; // Assuming path is correct

const AchievementItem = ({ achievement, theme }) => {
  const isEarned = achievement.isEarned;
  const iconColor = isEarned ? theme.colors.primary : theme.colors.textMuted;
  const bgColor = isEarned ? theme.colors.surfaceVariant : theme.colors.surface;
  const borderColor = isEarned ? theme.colors.primaryMuted : theme.colors.borderMuted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 rounded-lg border mb-3 shadow-sm"
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isEarned ? theme.colors.primaryMuted : theme.colors.border, color: iconColor }}>
          {achievement.secret && !isEarned ? <FaLock /> : <FaTrophy /> }
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-md" style={{ color: isEarned ? theme.colors.text : theme.colors.textMuted }}>
            {achievement.title} {isEarned && <FaUnlock className="inline ml-1 text-green-500" />}
          </h4>
          <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
            {achievement.description}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.border, color: theme.colors.textMuted }}>
              {achievement.points} XP
            </span>
            {isEarned && achievement.dateAchieved && (
              <span className="text-xs" style={{ color: theme.colors.textMuted }}>
                Unlocked: {new Date(achievement.dateAchieved).toLocaleDateString()}
              </span>
            )}
          </div>
          {achievement.level && (
             <span className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
                achievement.level === 'Bronze' ? 'bg-yellow-700 text-yellow-100' :
                achievement.level === 'Silver' ? 'bg-gray-400 text-gray-800' :
                achievement.level === 'Gold' ? 'bg-yellow-500 text-yellow-800' :
                achievement.level === 'Platinum' ? 'bg-blue-300 text-blue-800' :
                'bg-gray-500 text-white'
             }`}>
                {achievement.level}
             </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AchievementsLogModal = ({ userId, theme, onClose }) => {
  const [userStats, setUserStats] = useState(null);
  const [achievementsLog, setAchievementsLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      const stats = zentroBotAI.getUserStats(userId);
      setUserStats(stats);
      const log = zentroBotAI.getAchievementsForLog(userId);
      
      // Group achievements by category
      const grouped = log.reduce((acc, ach) => {
        const category = ach.category || 'Miscellaneous';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(ach);
        return acc;
      }, {});
      setAchievementsLog(grouped);
      setLoading(false);
    }
  }, [userId]);

  if (!userId) return null;

  const xpEarnedInCurrentLevel = userStats ? userStats.xp - (userStats.currentLevelXpThreshold || 0) : 0;
  const xpNeededForNextLevel = userStats ? (userStats.nextLevelXp || Infinity) - (userStats.currentLevelXpThreshold || 0) : 100;
  const progressPercentage = xpNeededForNextLevel > 0 && userStats ? (xpEarnedInCurrentLevel / xpNeededForNextLevel) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        style={{ backgroundColor: theme.colors.surface }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: theme.colors.border }}>
          <div className="flex items-center space-x-3">
            <FaTrophy className="text-2xl" style={{color: theme.colors.primary}}/>
            <h2 className="text-xl font-semibold" style={{ color: theme.colors.text }}>
              Your Achievements & Journey
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700/20 transition-colors"
            style={{ color: theme.colors.textMuted }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center py-10" style={{ color: theme.colors.textMuted }}>Loading your progress...</div>
          ) : (
            <>
              {/* User Stats Summary */}
              {userStats && (
                <div className="mb-6 p-4 rounded-lg" style={{backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.borderMuted}}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold" style={{color: theme.colors.text}}>Level {userStats.level}</h3>
                    <span className="text-sm" style={{color: theme.colors.textMuted}}>
                      Total XP: {userStats.xp}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full mb-1" style={{ backgroundColor: theme.colors.border }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="text-xs text-right" style={{color: theme.colors.textMuted}}>
                     {xpEarnedInCurrentLevel} / {xpNeededForNextLevel === Infinity ? 'MAX' : xpNeededForNextLevel} XP to next level
                  </div>
                   {xpNeededForNextLevel === Infinity && (
                   <p className="text-xs text-center mt-1 font-semibold" style={{color: theme.colors.primary}}>Max Level Reached! 🎉</p>
                 )}
                </div>
              )}

              {/* Achievements List by Category */}
              {Object.entries(achievementsLog).map(([category, achievementsInCategory]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2" style={{ color: theme.colors.text, borderColor: theme.colors.borderMuted }}>
                    {category} <span className="text-sm font-normal">({achievementsInCategory.filter(a=>a.isEarned).length}/{achievementsInCategory.length})</span>
                  </h3>
                  {achievementsInCategory.map(ach => (
                    <AchievementItem key={ach.id} achievement={ach} theme={theme} />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AchievementsLogModal; 