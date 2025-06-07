import React, { useState, useEffect } from 'react';
import { FaRocket, FaCoins, FaStar, FaGem, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import spotlightAuctionService from '../../services/spotlightAuctionService';
import zennyCoinsService from '../../services/zennyCoinsService';

const BoostSystem = ({ appId, currentBoost, onBoostApplied, onClose }) => {
  const { userProfile } = useUser();
  const [selectedBoost, setSelectedBoost] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const boostLevels = [
    {
      id: 'bronze',
      name: 'Bronze Boost',
      icon: FaStar,
      cost: 10,
      priority: 1,
      duration: '2 days',
      color: 'from-orange-600 to-yellow-600',
      benefits: ['Basic visibility boost', 'Appears in boosted section', '+10% discovery rate']
    },
    {
      id: 'silver',
      name: 'Silver Boost',
      icon: FaGem,
      cost: 25,
      priority: 2,
      duration: '3 days',
      color: 'from-gray-400 to-gray-600',
      benefits: ['Enhanced visibility', 'Priority in search results', '+25% discovery rate', 'Silver badge']
    },
    {
      id: 'gold',
      name: 'Gold Boost',
      icon: FaCrown,
      cost: 50,
      priority: 3,
      duration: '4 days',
      color: 'from-yellow-400 to-yellow-600',
      benefits: ['High visibility boost', 'Featured in trending', '+50% discovery rate', 'Gold badge', 'Analytics insights']
    },
    {
      id: 'platinum',
      name: 'Platinum Boost',
      icon: FaRocket,
      cost: 100,
      priority: 4,
      duration: '5 days',
      color: 'from-purple-400 to-purple-600',
      benefits: ['Premium visibility', 'Top of category', '+75% discovery rate', 'Platinum badge', 'Detailed analytics', 'Priority support']
    },
    {
      id: 'diamond',
      name: 'Diamond Boost',
      icon: FaGem,
      cost: 200,
      priority: 5,
      duration: '7 days',
      color: 'from-cyan-400 to-blue-600',
      benefits: ['Maximum visibility', 'Homepage featured', '+100% discovery rate', 'Diamond badge', 'Full analytics suite', 'VIP support', 'Custom promotion']
    }
  ];

  useEffect(() => {
    if (userProfile?.uid) {
      loadUserBalance();
    }
  }, [userProfile?.uid]);

  const loadUserBalance = async () => {
    if (userProfile?.uid) {
      const balance = await zennyCoinsService.getUserBalance(userProfile.uid);
      setUserBalance(balance);
    }
  };

  const handleApplyBoost = async () => {
    if (!selectedBoost || !userProfile?.uid || !appId) return;

    try {
      setLoading(true);
      const result = await spotlightAuctionService.applyBoost(
        userProfile.uid,
        appId,
        selectedBoost.id
      );

      if (result.success) {
        await loadUserBalance();
        onBoostApplied && onBoostApplied(result.boost);
        alert(`${selectedBoost.name} applied successfully!`);
        onClose && onClose();
      } else {
        alert(`Boost failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error applying boost:', error);
      alert('Failed to apply boost');
    } finally {
      setLoading(false);
    }
  };

  const canAfford = (cost) => userBalance >= cost;

  const isCurrentBoost = (boostId) => currentBoost?.level === boostId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaRocket className="text-yellow-400 text-2xl" />
              <div>
                <h2 className="text-2xl font-bold text-white">App Boost System</h2>
                <p className="text-purple-200">Increase your app's visibility and discovery</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* User Balance */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaCoins className="text-yellow-400" />
                <span className="text-white font-semibold">Your Balance:</span>
                <span className="text-yellow-400 font-bold">{userBalance.toLocaleString()} Zenny</span>
              </div>
              {currentBoost && (
                <div className="text-green-400 text-sm">
                  Current Boost: <span className="font-semibold capitalize">{currentBoost.level}</span>
                </div>
              )}
            </div>
          </div>

          {/* Boost Levels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {boostLevels.map((boost) => {
              const IconComponent = boost.icon;
              const isSelected = selectedBoost?.id === boost.id;
              const affordable = canAfford(boost.cost);
              const isCurrent = isCurrentBoost(boost.id);

              return (
                <motion.div
                  key={boost.id}
                  whileHover={{ scale: affordable ? 1.02 : 1 }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-900/20' 
                      : affordable
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-700 opacity-60'
                  } ${!affordable ? 'cursor-not-allowed' : ''}`}
                  onClick={() => affordable && setSelectedBoost(boost)}
                >
                  {/* Current Boost Badge */}
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ACTIVE
                    </div>
                  )}

                  {/* Boost Header */}
                  <div className={`bg-gradient-to-r ${boost.color} text-white p-3 rounded-lg mb-3`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="text-xl" />
                        <span className="font-bold">{boost.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{boost.cost}</div>
                        <div className="text-xs opacity-90">Zenny</div>
                      </div>
                    </div>
                  </div>

                  {/* Boost Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-semibold">{boost.duration}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Priority:</span>
                      <span className="text-yellow-400 font-semibold">Level {boost.priority}</span>
                    </div>

                    {/* Benefits */}
                    <div className="mt-3">
                      <div className="text-gray-400 text-xs mb-2">Benefits:</div>
                      <div className="space-y-1">
                        {boost.benefits.map((benefit, index) => (
                          <div key={index} className="text-xs text-gray-300 flex items-center space-x-1">
                            <span className="text-green-400">•</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Affordability Indicator */}
                  {!affordable && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <div className="text-red-400 text-sm font-semibold">Insufficient Funds</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Apply Boost Button */}
          {selectedBoost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Apply {selectedBoost.name}</h3>
                  <p className="text-gray-400">Cost: {selectedBoost.cost} Zenny Coins</p>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">After purchase:</div>
                  <div className="text-yellow-400 font-bold">
                    {(userBalance - selectedBoost.cost).toLocaleString()} Zenny
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedBoost(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyBoost}
                  disabled={loading || !canAfford(selectedBoost.cost)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Applying...' : `Apply Boost (${selectedBoost.cost} Zenny)`}
                </button>
              </div>

              <div className="mt-4 text-gray-400 text-sm">
                <p>• Boost will be active for {selectedBoost.duration}</p>
                <p>• Higher priority boosts appear first in listings</p>
                <p>• You can upgrade to a higher boost level anytime</p>
                <p>• Boosts are non-refundable once applied</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BoostSystem;
