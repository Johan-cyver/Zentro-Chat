import React, { useState, useEffect, useCallback } from 'react';
import { FaCoins, FaPlus, FaHistory, FaTimes, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import zennyCoinsService from '../../services/zennyCoinsService';

const ZennyCoinsWidget = ({ className = '' }) => {
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  const updateUserProfile = userContext?.updateProfile;
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBalance = useCallback(async () => {
    try {
      const userBalance = await zennyCoinsService.getUserBalance(userProfile.uid);
      setBalance(userBalance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  }, [userProfile.uid]);

  // Load user's Zenny coin balance
  useEffect(() => {
    if (userProfile?.uid) {
      loadBalance();
    }
  }, [userProfile?.uid, loadBalance]);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const history = await zennyCoinsService.getTransactionHistory(userProfile.uid);
      setTransactions(history);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (usdAmount) => {
    try {
      setLoading(true);
      const result = await zennyCoinsService.purchaseCoins(userProfile.uid, usdAmount);
      
      if (result.success) {
        setBalance(result.newBalance);
        setShowPurchaseModal(false);
        // Show success notification
        alert(`Successfully purchased ${Math.floor(usdAmount * 0.5)} Zenny coins!`);
      } else {
        alert(`Purchase failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earn': return '💰';
      case 'spend': return '💸';
      case 'purchase': return '🛒';
      case 'refund': return '↩️';
      default: return '💫';
    }
  };

  return (
    <>
      {/* Premium Zenny Coins Widget */}
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="relative group">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Main Widget */}
          <div className="relative flex items-center space-x-2 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border border-yellow-400/50">
            {/* Custom Zenny Logo */}
            <div className="relative">
              <div className="w-5 h-5 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">Z</span>
                </div>
              </div>
              {/* Sparkle Effect */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full opacity-80 animate-ping"></div>
            </div>

            <span className="text-white font-extrabold tracking-wide">
              {balance.toLocaleString()}
            </span>

            {/* Premium Badge */}
            <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-yellow-100 font-medium">
              ZENNY
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="relative group flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg"
          title="Purchase Zenny Coins"
        >
          <FaPlus className="text-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
        </button>
        
        <button
          onClick={() => {
            setShowHistoryModal(true);
            loadTransactionHistory();
          }}
          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full text-xs transition-colors"
          title="Transaction History"
        >
          <FaHistory />
        </button>
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
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
              className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FaShoppingCart className="text-green-400 text-xl" />
                  <h2 className="text-xl font-bold text-white">Purchase Zenny Coins</h2>
                </div>
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-300 text-sm mb-4">
                  Exchange Rate: <span className="text-yellow-400 font-semibold">1 USD = 0.5 Zenny Coins</span>
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { usd: 5, zenny: 2.5 },
                    { usd: 10, zenny: 5 },
                    { usd: 20, zenny: 10 },
                    { usd: 50, zenny: 25 },
                    { usd: 100, zenny: 50 },
                    { usd: 200, zenny: 100 }
                  ].map((option) => (
                    <button
                      key={option.usd}
                      onClick={() => handlePurchase(option.usd)}
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      <div className="text-lg font-bold">${option.usd}</div>
                      <div className="text-xs opacity-90">{option.zenny} Zenny</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-400 text-xs">
                <FaCreditCard />
                <span>Secure payment processing</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
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
              className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <FaHistory className="text-blue-400 text-xl" />
                  <h2 className="text-xl font-bold text-white">Transaction History</h2>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No transactions yet</div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{getTransactionIcon(tx.type)}</span>
                          <div>
                            <div className="text-white font-medium">{tx.description}</div>
                            <div className="text-gray-400 text-xs">{formatDate(tx.timestamp)}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZennyCoinsWidget;
