import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuestionCircle,
  FaGamepad,
  FaMapMarkedAlt,
  FaClock,
  FaCheckCircle,
  FaLock,
  FaStar,
  FaGem,
  FaScroll,
  FaFire,
  FaShieldAlt
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import worldQuestService from '../../services/worldQuestService';

const ZentroQuests = () => {
  const userContext = useUser();
  const [quests, setQuests] = useState([]);
  const [userQuests, setUserQuests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  const { userProfile } = userContext || {};

  const loadQuests = async () => {
    try {
      setLoading(true);
      const userQuestData = await worldQuestService.getUserQuests(userProfile.uid);
      setUserQuests(userQuestData);

      // Get all available quests
      const allQuests = Object.values(worldQuestService.WORLD_QUESTS);
      setQuests(allQuests);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) {
      loadQuests();
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return <FaShieldAlt className="text-green-400" />;
      case 'intermediate': return <FaGamepad className="text-yellow-400" />;
      case 'advanced': return <FaFire className="text-orange-400" />;
      case 'expert': return <FaGem className="text-red-400" />;
      case 'legendary': return <FaStar className="text-purple-400" />;
      default: return <FaQuestionCircle className="text-gray-400" />;
    }
  };

  const isQuestCompleted = (questId) => {
    return userQuests?.completedQuests?.includes(questId) || false;
  };

  const isQuestAvailable = (quest) => {
    // Check if quest requirements are met
    const userStats = userQuests?.stats || {};
    return worldQuestService.checkQuestRequirements(quest.requirements, userStats);
  };

  const getQuestProgress = (quest) => {
    const userStats = userQuests?.stats || {};
    const requirements = quest.requirements;
    
    let totalProgress = 0;
    let completedRequirements = 0;
    
    Object.entries(requirements).forEach(([key, value]) => {
      const currentValue = userStats[key] || 0;
      const progress = Math.min(currentValue / value, 1);
      totalProgress += progress;
      if (progress >= 1) completedRequirements++;
    });
    
    return {
      percentage: (totalProgress / Object.keys(requirements).length) * 100,
      completed: completedRequirements,
      total: Object.keys(requirements).length
    };
  };

  const getFilteredQuests = () => {
    switch (activeTab) {
      case 'available':
        return quests.filter(quest => !isQuestCompleted(quest.id) && isQuestAvailable(quest));
      case 'completed':
        return quests.filter(quest => isQuestCompleted(quest.id));
      case 'locked':
        return quests.filter(quest => !isQuestCompleted(quest.id) && !isQuestAvailable(quest));
      default:
        return quests;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Quests...</div>
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
            World Quests
          </h1>
          <p className="text-gray-300">Epic adventures await in the digital realm</p>
        </motion.div>

        {/* Quest Stats */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-800/30 to-cyan-800/30 rounded-xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userQuests?.completedQuests?.length || 0}</p>
              <p className="text-sm text-gray-300">Completed</p>
            </div>
            <div className="text-center">
              <FaMapMarkedAlt className="text-3xl text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{quests.filter(q => isQuestAvailable(q) && !isQuestCompleted(q.id)).length}</p>
              <p className="text-sm text-gray-300">Available</p>
            </div>
            <div className="text-center">
              <FaScroll className="text-3xl text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userQuests?.totalXP || 0}</p>
              <p className="text-sm text-gray-300">Quest XP</p>
            </div>
            <div className="text-center">
              <FaStar className="text-3xl text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{userQuests?.currentChapter || 1}</p>
              <p className="text-sm text-gray-300">Chapter</p>
            </div>
          </div>
        </motion.div>

        {/* Quest Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'available', label: 'Available', icon: FaMapMarkedAlt },
            { id: 'completed', label: 'Completed', icon: FaCheckCircle },
            { id: 'locked', label: 'Locked', icon: FaLock },
            { id: 'all', label: 'All Quests', icon: FaScroll }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {getFilteredQuests().map((quest, index) => {
              const isCompleted = isQuestCompleted(quest.id);
              const isAvailable = isQuestAvailable(quest);
              const progress = getQuestProgress(quest);
              
              return (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedQuest(quest)}
                  className={`relative bg-gray-800/50 rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
                    isCompleted 
                      ? 'border-green-500/50 bg-gradient-to-br from-green-800/20 to-emerald-800/20' 
                      : isAvailable
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-800/20 to-cyan-800/20'
                      : 'border-gray-700/50 opacity-60'
                  }`}
                >
                  {/* Status Icon */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <FaCheckCircle className="text-green-400" />
                    ) : isAvailable ? (
                      <FaMapMarkedAlt className="text-purple-400" />
                    ) : (
                      <FaLock className="text-gray-500" />
                    )}
                  </div>

                  {/* Quest Header */}
                  <div className="flex items-start mb-4">
                    <div className="text-2xl mr-3">
                      {getDifficultyIcon(quest.difficulty)}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${isCompleted ? 'text-green-400' : isAvailable ? 'text-white' : 'text-gray-400'}`}>
                        {quest.title}
                      </h3>
                      <p className={`text-sm capitalize ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty} • Chapter {quest.chapter}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-sm mb-4 ${isCompleted || isAvailable ? 'text-gray-300' : 'text-gray-500'}`}>
                    {quest.description}
                  </p>

                  {/* Narrative */}
                  {quest.narrative && (
                    <div className="bg-gray-700/30 rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-400 italic">"{quest.narrative}"</p>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {!isCompleted && isAvailable && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress ({progress.completed}/{progress.total})</span>
                        <span>{Math.round(progress.percentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-400">
                      Rewards: {quest.rewards.coins} coins • {quest.rewards.xp} XP
                      {quest.rewards.title && ` • "${quest.rewards.title}"`}
                    </div>
                    {quest.timeLimit && (
                      <div className="flex items-center text-orange-400">
                        <FaClock className="mr-1" />
                        <span className="text-xs">Timed</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quest Detail Modal */}
        <AnimatePresence>
          {selectedQuest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedQuest(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">
                    {getDifficultyIcon(selectedQuest.difficulty)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedQuest.title}</h2>
                  <p className={`text-sm capitalize ${getDifficultyColor(selectedQuest.difficulty)}`}>
                    {selectedQuest.difficulty} Quest • Chapter {selectedQuest.chapter}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-300">{selectedQuest.description}</p>
                  </div>

                  {selectedQuest.narrative && (
                    <div>
                      <h3 className="font-semibold mb-2">Story</h3>
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <p className="text-gray-300 italic">"{selectedQuest.narrative}"</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      {Object.entries(selectedQuest.requirements).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Rewards</h3>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Coins: {selectedQuest.rewards.coins}</div>
                        <div>XP: {selectedQuest.rewards.xp}</div>
                        {selectedQuest.rewards.title && (
                          <div className="col-span-2">Title: "{selectedQuest.rewards.title}"</div>
                        )}
                      </div>
                    </div>
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

export default ZentroQuests;
