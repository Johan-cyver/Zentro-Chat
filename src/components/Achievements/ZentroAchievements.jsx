import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaMedal, 
  FaStar, 
  FaCrown,
  FaLock,
  FaUnlock,
  FaFire,
  FaGem,
  FaRocket,
  FaShieldAlt
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import realAchievementService from '../../services/realAchievementService';

const ZentroAchievements = () => {
  const userContext = useUser();
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const { userProfile } = userContext || {};

  useEffect(() => {
    if (userProfile?.uid) {
      loadAchievements();
    }
  }, [userProfile]);

  // Handle loading state - return early if no user context
  if (!userContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const userAchievementData = await realAchievementService.getUserAchievements(userProfile.uid);
      setUserAchievements(userAchievementData);
      
      // Get all available achievements
      const allAchievements = Object.values(realAchievementService.ACHIEVEMENTS);
      setAchievements(allAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze': return <FaMedal className="text-amber-600" />;
      case 'silver': return <FaMedal className="text-gray-400" />;
      case 'gold': return <FaTrophy className="text-yellow-400" />;
      case 'platinum': return <FaCrown className="text-purple-400" />;
      case 'diamond': return <FaGem className="text-cyan-400" />;
      default: return <FaStar className="text-gray-400" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'battle': return <FaShieldAlt />;
      case 'social': return <FaFire />;
      case 'progression': return <FaRocket />;
      default: return <FaStar />;
    }
  };

  const isAchievementUnlocked = (achievementId) => {
    return userAchievements?.unlockedAchievements?.some(a => a.id === achievementId) || false;
  };

  const getAchievementProgress = (achievement) => {
    const userStats = userAchievements?.stats || {};
    const { type, value } = achievement.condition;
    const currentValue = userStats[type] || 0;
    return Math.min((currentValue / value) * 100, 100);
  };

  const categories = ['all', 'battle', 'social', 'progression', 'special'];

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category.toLowerCase() === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Achievements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Hall of Fame
          </h1>
          <p className="text-gray-300">Your journey through Zentro's challenges</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-800/30 to-cyan-800/30 rounded-xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <FaTrophy className="text-3xl text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userAchievements?.unlockedAchievements?.length || 0}</p>
              <p className="text-sm text-gray-300">Unlocked</p>
            </div>
            <div className="text-center">
              <FaFire className="text-3xl text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userAchievements?.totalPoints || 0}</p>
              <p className="text-sm text-gray-300">Points</p>
            </div>
            <div className="text-center">
              <FaRocket className="text-3xl text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userAchievements?.level || 1}</p>
              <p className="text-sm text-gray-300">Level</p>
            </div>
            <div className="text-center">
              <FaGem className="text-3xl text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round(((userAchievements?.unlockedAchievements?.length || 0) / achievements.length) * 100)}%
              </p>
              <p className="text-sm text-gray-300">Complete</p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all capitalize ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category !== 'all' && getCategoryIcon(category)}
              <span>{category}</span>
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAchievements.map((achievement, index) => {
              const isUnlocked = isAchievementUnlocked(achievement.id);
              const progress = getAchievementProgress(achievement);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={`relative bg-gray-800/50 rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
                    isUnlocked 
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-800/20 to-cyan-800/20' 
                      : 'border-gray-700/50'
                  }`}
                >
                  {/* Lock/Unlock Icon */}
                  <div className="absolute top-4 right-4">
                    {isUnlocked ? (
                      <FaUnlock className="text-green-400" />
                    ) : (
                      <FaLock className="text-gray-500" />
                    )}
                  </div>

                  {/* Achievement Icon */}
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">
                      {getTierIcon(achievement.tier)}
                    </div>
                    <div>
                      <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">{achievement.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm mb-4 ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Reward: {achievement.reward.coins} coins, {achievement.reward.xp} XP
                    </div>
                    <div className="text-xs text-purple-400 font-semibold">
                      {achievement.points} pts
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Achievement Detail Modal */}
        <AnimatePresence>
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedAchievement(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">
                    {getTierIcon(selectedAchievement.tier)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedAchievement.name}</h2>
                  <p className="text-gray-300 mb-4">{selectedAchievement.description}</p>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Rewards</h3>
                    <p className="text-sm text-gray-300">
                      {selectedAchievement.reward.coins} Coins • {selectedAchievement.reward.xp} XP • {selectedAchievement.points} Points
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ZentroAchievements;
