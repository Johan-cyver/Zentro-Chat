import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, 
  FaTrophy, 
  FaQuestionCircle, 
  FaFire, 
  FaGift,
  FaChartLine,
  FaCrown,
  FaRocket,
  FaGem,
  FaBolt,
  FaCalendarCheck,
  FaGamepad,
  FaUsers,
  FaCode
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zennyEconomyService from '../../services/zennyEconomyService';
import realAchievementService from '../../services/realAchievementService';
import worldQuestService from '../../services/worldQuestService';
import zentroIdService from '../../services/zentroIdService';

const ZentroDashboard = () => {
  const { userProfile } = useUser();
  const [wallet, setWallet] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [questProgress, setQuestProgress] = useState(null);
  const [zentroId, setZentroId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (userProfile?.uid) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all user data
      const [walletData, achievementData, questData, zentroData] = await Promise.all([
        zennyEconomyService.getWallet(userProfile.uid),
        realAchievementService.getUserAchievements(userProfile.uid),
        worldQuestService.getUserQuestProgress(userProfile.uid),
        zentroIdService.getZentroId(userProfile.uid)
      ]);

      setWallet(walletData);
      setAchievements(achievementData);
      setQuestProgress(questData);
      setZentroId(zentroData);

      // Subscribe to real-time updates
      zennyEconomyService.subscribeToWallet(userProfile.uid, setWallet);
      realAchievementService.subscribeToAchievements(userProfile.uid, setAchievements);
      worldQuestService.subscribeToQuestProgress(userProfile.uid, setQuestProgress);
      zentroIdService.subscribeToZentroId(userProfile.uid, setZentroId);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const result = await zennyEconomyService.claimDailyBonus(userProfile.uid);
      alert(`Daily bonus claimed! +${result.bonus} coins (${result.streak} day streak)`);
    } catch (error) {
      alert(error.message);
    }
  };

  const canClaimDaily = () => {
    if (!wallet?.lastDailyBonus) return true;
    const lastBonus = wallet.lastDailyBonus.toDate ? wallet.lastDailyBonus.toDate() : new Date(wallet.lastDailyBonus);
    const now = new Date();
    return lastBonus.toDateString() !== now.toDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4">
            ZENTRO COMMAND CENTER
          </h1>
          <p className="text-xl text-gray-300">
            Welcome back, {zentroId?.displayName || userProfile?.displayName || 'Developer'}!
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {/* Zenny Coins */}
          <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaCoins className="text-3xl text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">COINS</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{wallet?.balance || 0}</div>
            <div className="text-gray-400 text-sm">
              Streak: {wallet?.dailyStreak || 0} days
            </div>
            {canClaimDaily() && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={claimDailyBonus}
                className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg text-sm"
              >
                <FaGift className="inline mr-2" />
                Claim Daily
              </motion.button>
            )}
          </div>

          {/* Level & XP */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaRocket className="text-3xl text-blue-400" />
              <span className="text-blue-400 text-sm font-semibold">LEVEL</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{zentroId?.level || 1}</div>
            <div className="text-gray-400 text-sm">
              {zentroId?.xp || 0} XP
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaTrophy className="text-3xl text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">ACHIEVEMENTS</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {achievements?.unlockedAchievements?.length || 0}
            </div>
            <div className="text-gray-400 text-sm">
              Unlocked
            </div>
          </div>

          {/* Active Quests */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <FaQuestionCircle className="text-3xl text-green-400" />
              <span className="text-green-400 text-sm font-semibold">QUESTS</span>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {questProgress?.activeQuests?.length || 0}
            </div>
            <div className="text-gray-400 text-sm">
              Active
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 flex space-x-2 border border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartLine },
              { id: 'achievements', label: 'Achievements', icon: FaTrophy },
              { id: 'quests', label: 'Quests', icon: FaQuestionCircle },
              { id: 'economy', label: 'Economy', icon: FaCoins }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Recent Activity */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaFire className="mr-3 text-red-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {wallet?.transactions?.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <div className="text-white text-sm">{transaction.description}</div>
                        <div className="text-gray-400 text-xs">
                          {new Date(transaction.timestamp?.toDate ? transaction.timestamp.toDate() : transaction.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      <FaRocket className="text-3xl mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Start your journey to see activity here!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <FaBolt className="mr-3 text-yellow-400" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/battle'}
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-4 px-4 rounded-xl flex flex-col items-center space-y-2"
                  >
                    <FaGamepad className="text-2xl" />
                    <span className="text-sm">Start Battle</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/squads'}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 px-4 rounded-xl flex flex-col items-center space-y-2"
                  >
                    <FaUsers className="text-2xl" />
                    <span className="text-sm">Join Squad</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-4 px-4 rounded-xl flex flex-col items-center space-y-2"
                  >
                    <FaCode className="text-2xl" />
                    <span className="text-sm">Code Challenge</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-4 rounded-xl flex flex-col items-center space-y-2"
                  >
                    <FaGem className="text-2xl" />
                    <span className="text-sm">Premium</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Achievement Gallery</h2>
                <p className="text-gray-400">Showcase your accomplishments and unlock new challenges</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(realAchievementService.ACHIEVEMENTS).map((achievement) => {
                  const isUnlocked = achievements?.unlockedAchievements?.some(a => a.id === achievement.id);
                  const progress = realAchievementService.getAchievementProgress(achievements?.stats || {}, achievement);
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`rounded-2xl p-6 border transition-all ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-500/50' 
                          : 'bg-gray-800/30 border-gray-700'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-3 ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${isUnlocked ? 'text-yellow-400' : 'text-gray-300'}`}>
                          {achievement.name}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4">{achievement.description}</p>
                        
                        {!isUnlocked && (
                          <div className="mb-4">
                            <div className="bg-gray-700 rounded-full h-2 mb-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress.progress}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400">
                              {progress.current} / {progress.target}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-center space-x-4 text-xs">
                          <span className="text-yellow-400">+{achievement.reward.coins} coins</span>
                          <span className="text-blue-400">+{achievement.reward.xp} XP</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ZentroDashboard;
