import React, { useState, useEffect } from 'react';
import { FaCoins, FaTrophy, FaRocket, FaGavel, FaShoppingCart, FaHistory, FaGift } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import ZennyCoinsWidget from './ZennyCoinsWidget';
import SpotlightAuction from '../Spotlight/SpotlightAuction';
import BoostSystem from '../Boost/BoostSystem';
import zennyCoinsService from '../../services/zennyCoinsService';
import zennyCoinsInitializer from '../../utils/zennyCoinsInitializer';

const ZennyCoinsDemo = () => {
  const { userProfile } = useUser();
  const [showSpotlightAuction, setShowSpotlightAuction] = useState(false);
  const [showBoostSystem, setShowBoostSystem] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (userProfile?.uid) {
      loadUserData();
    }
  }, [userProfile?.uid]);

  const loadUserData = async () => {
    try {
      const balance = await zennyCoinsService.getUserBalance(userProfile.uid);
      setUserBalance(balance);
      
      const transactions = await zennyCoinsService.getTransactionHistory(userProfile.uid, 5);
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleTestActivity = async (activityType) => {
    if (!userProfile?.uid) {
      alert('Please log in to test activities');
      return;
    }

    try {
      const result = await zennyCoinsInitializer.awardActivityCoins(userProfile.uid, activityType);
      if (result?.success) {
        alert(`🎉 Earned ${result.transaction.amount} Zenny coins for ${activityType.replace('_', ' ')}!`);
        await loadUserData(); // Refresh data
      } else {
        alert(`Failed to award coins: ${result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error testing activity:', error);
      alert('Error testing activity');
    }
  };

  const activities = [
    { id: 'daily_login', name: 'Daily Login', reward: 5, icon: FaGift },
    { id: 'send_message', name: 'Send Message', reward: 1, icon: FaCoins },
    { id: 'create_post', name: 'Create Post', reward: 10, icon: FaCoins },
    { id: 'app_upload', name: 'Upload App', reward: 50, icon: FaRocket },
    { id: 'win_auction', name: 'Win Auction', reward: 25, icon: FaTrophy }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🪙 Zentro Zenny Coins
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            The revolutionary economy system for Zentro Apps Marketplace
          </p>
          <div className="flex justify-center">
            <ZennyCoinsWidget className="scale-125" />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Earn Coins */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <FaCoins className="text-yellow-400 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Earn Coins</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Earn Zenny coins through various activities on the platform
            </p>
            <div className="space-y-2">
              {activities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <button
                    key={activity.id}
                    onClick={() => handleTestActivity(activity.id)}
                    className="w-full flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <IconComponent className="text-yellow-400 mr-2" />
                      <span className="text-sm">{activity.name}</span>
                    </div>
                    <span className="text-yellow-400 font-semibold">+{activity.reward}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Spotlight Auction */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <FaGavel className="text-purple-400 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">Spotlight Auction</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Bid for premium spotlight positions every Saturday at 7 PM IST
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                • 7 spotlight positions available
              </div>
              <div className="text-sm text-gray-400">
                • 15 minutes per position
              </div>
              <div className="text-sm text-gray-400">
                • 1 week of premium visibility
              </div>
              <button
                onClick={() => setShowSpotlightAuction(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
              >
                View Auction
              </button>
            </div>
          </motion.div>

          {/* Boost System */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <FaRocket className="text-green-400 text-2xl mr-3" />
              <h3 className="text-xl font-semibold">App Boost System</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Boost your apps for increased visibility and discovery
            </p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-orange-400">Bronze</span>
                <span>10 Zenny</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Silver</span>
                <span>25 Zenny</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">Gold</span>
                <span>50 Zenny</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">Platinum</span>
                <span>100 Zenny</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-cyan-400">Diamond</span>
                <span>200 Zenny</span>
              </div>
            </div>
            <button
              onClick={() => setShowBoostSystem(true)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all"
            >
              View Boosts
            </button>
          </motion.div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center mb-4">
              <FaHistory className="text-blue-400 text-xl mr-3" />
              <h3 className="text-xl font-semibold">Recent Transactions</h3>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{tx.description}</div>
                    <div className="text-gray-400 text-xs">
                      {tx.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'}
                    </div>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Current Balance Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl inline-block">
            <div className="text-lg font-semibold mb-2">Your Current Balance</div>
            <div className="text-3xl font-bold">{userBalance.toLocaleString()} Zenny Coins</div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showSpotlightAuction && (
        <SpotlightAuction
          isOpen={showSpotlightAuction}
          onClose={() => setShowSpotlightAuction(false)}
        />
      )}

      {showBoostSystem && (
        <BoostSystem
          appId="demo_app"
          onClose={() => setShowBoostSystem(false)}
          onBoostApplied={(boost) => {
            console.log('Boost applied:', boost);
            setShowBoostSystem(false);
          }}
        />
      )}
    </div>
  );
};

export default ZennyCoinsDemo;
