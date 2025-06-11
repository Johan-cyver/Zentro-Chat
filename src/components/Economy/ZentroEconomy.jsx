import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCoins, 
  FaChartLine, 
  FaExchangeAlt, 
  FaHistory,
  FaTrophy,
  FaGift,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zennyEconomyService from '../../services/zennyEconomyService';

const ZentroEconomy = () => {
  const userContext = useUser();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { userProfile } = userContext || {};

  useEffect(() => {
    if (userProfile?.uid) {
      loadWalletData();
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

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const walletData = await zennyEconomyService.getWallet(userProfile.uid);
      setWallet(walletData);
      
      // Get recent transactions
      const recentTransactions = walletData.transactions?.slice(-10) || [];
      setTransactions(recentTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      await zennyEconomyService.claimDailyBonus(userProfile.uid);
      await loadWalletData(); // Refresh data
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Economy...</div>
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
            Zentro Economy
          </h1>
          <p className="text-gray-300">Manage your digital assets and track your progress</p>
        </motion.div>

        {/* Wallet Overview */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-800/30 to-cyan-800/30 rounded-xl p-6 mb-8 border border-purple-500/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaCoins className="text-4xl text-yellow-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-300">Current Balance</h3>
              <p className="text-3xl font-bold text-white">{wallet?.balance || 0}</p>
            </div>
            <div className="text-center">
              <FaArrowUp className="text-4xl text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-300">Total Earned</h3>
              <p className="text-3xl font-bold text-green-400">{wallet?.totalEarned || 0}</p>
            </div>
            <div className="text-center">
              <FaArrowDown className="text-4xl text-red-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-gray-300">Total Spent</h3>
              <p className="text-3xl font-bold text-red-400">{wallet?.totalSpent || 0}</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'transactions', label: 'Transactions', icon: FaHistory },
            { id: 'rewards', label: 'Rewards', icon: FaGift },
            { id: 'exchange', label: 'Exchange', icon: FaExchangeAlt }
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/50 rounded-xl p-6"
        >
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Economy Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Daily Streak</h4>
                  <p className="text-2xl font-bold text-purple-400">{wallet?.dailyStreak || 0} days</p>
                  <button
                    onClick={claimDailyBonus}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Claim Daily Bonus
                  </button>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Betting Stats</h4>
                  <p className="text-sm text-gray-300">Total Bets: {wallet?.bettingStats?.totalBets || 0}</p>
                  <p className="text-sm text-gray-300">Win Rate: {
                    wallet?.bettingStats?.totalBets > 0 
                      ? Math.round((wallet.bettingStats.totalWon / wallet.bettingStats.totalBets) * 100)
                      : 0
                  }%</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map((transaction, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{transaction.description}</p>
                      <p className="text-sm text-gray-400">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                    </div>
                    <div className={`text-lg font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-center py-8">No transactions yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Available Rewards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <FaTrophy className="text-2xl text-yellow-400 mb-2" />
                  <h4 className="font-semibold">Achievement Rewards</h4>
                  <p className="text-sm text-gray-300">Complete achievements to earn coins</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <FaGift className="text-2xl text-purple-400 mb-2" />
                  <h4 className="font-semibold">Daily Bonuses</h4>
                  <p className="text-sm text-gray-300">Login daily for streak bonuses</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exchange' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Exchange Center</h3>
              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <FaExchangeAlt className="text-4xl text-cyan-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Coming Soon</h4>
                <p className="text-gray-300">Exchange features will be available in future updates</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ZentroEconomy;
