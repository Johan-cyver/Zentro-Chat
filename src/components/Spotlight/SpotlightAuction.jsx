import React, { useState, useEffect } from 'react';
import { FaTrophy, FaGavel, FaClock, FaCoins, FaFire, FaUsers } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import spotlightAuctionService from '../../services/spotlightAuctionService';
import zennyCoinsService from '../../services/zennyCoinsService';

const SpotlightAuction = ({ isOpen, onClose }) => {
  const { userProfile } = useUser();
  const [currentAuction, setCurrentAuction] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [bidAmount, setBidAmount] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAuctionData();
      loadUserBalance();
    }
  }, [isOpen, userProfile?.uid]);

  useEffect(() => {
    if (currentAuction) {
      const timer = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(timer);
    }
  }, [currentAuction]);

  const loadAuctionData = async () => {
    try {
      setLoading(true);
      const auction = await spotlightAuctionService.getCurrentAuction();
      setCurrentAuction(auction);
    } catch (error) {
      console.error('Error loading auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBalance = async () => {
    if (userProfile?.uid) {
      const balance = await zennyCoinsService.getUserBalance(userProfile.uid);
      setUserBalance(balance);
    }
  };

  const updateTimeRemaining = () => {
    if (!currentAuction) return;

    const now = new Date();
    const remaining = {};

    currentAuction.positions.forEach((position, index) => {
      const endTime = position.endTime.toDate ? position.endTime.toDate() : new Date(position.endTime);
      const diff = endTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        remaining[index + 1] = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        remaining[index + 1] = 'Ended';
      }
    });

    setTimeRemaining(remaining);
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || !userProfile?.uid || !currentAuction) return;

    const amount = parseInt(bidAmount);
    if (amount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    if (amount > userBalance) {
      alert('Insufficient Zenny coins');
      return;
    }

    try {
      setLoading(true);
      const result = await spotlightAuctionService.placeBid(
        currentAuction.id,
        selectedPosition,
        userProfile.uid,
        'user_app_id', // This would be the actual app ID
        amount
      );

      if (result.success) {
        setBidAmount('');
        await loadAuctionData();
        await loadUserBalance();
        alert('Bid placed successfully!');
      } else {
        alert(`Bid failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      alert('Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  const getPositionStatus = (position) => {
    const now = new Date();
    const startTime = position.startTime.toDate ? position.startTime.toDate() : new Date(position.startTime);
    const endTime = position.endTime.toDate ? position.endTime.toDate() : new Date(position.endTime);

    if (now < startTime) return 'upcoming';
    if (now > endTime) return 'ended';
    return 'active';
  };

  const getCurrentHighestBid = (position) => {
    if (!position.bids || position.bids.length === 0) return 0;
    return Math.max(...position.bids.map(bid => bid.amount));
  };

  const getPositionColor = (index) => {
    const colors = [
      'from-yellow-500 to-orange-500', // Position 1 - Gold
      'from-gray-400 to-gray-600',     // Position 2 - Silver
      'from-orange-600 to-red-600',    // Position 3 - Bronze
      'from-purple-500 to-pink-500',   // Position 4 - Purple
      'from-blue-500 to-cyan-500',     // Position 5 - Blue
      'from-green-500 to-teal-500',    // Position 6 - Green
      'from-red-500 to-pink-500'       // Position 7 - Red
    ];
    return colors[index] || 'from-gray-500 to-gray-700';
  };

  if (!isOpen) return null;

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
        className="bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaTrophy className="text-yellow-400 text-2xl" />
              <div>
                <h2 className="text-2xl font-bold text-white">Zentro Apps Spotlight Auction</h2>
                <p className="text-purple-200">Weekly Saturday Auctions - 7 PM IST</p>
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
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading auction data...</div>
          ) : !currentAuction ? (
            <div className="text-center text-gray-400 py-12">No active auction found</div>
          ) : (
            <div className="space-y-6">
              {/* User Balance */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCoins className="text-yellow-400" />
                    <span className="text-white font-semibold">Your Balance:</span>
                    <span className="text-yellow-400 font-bold">{userBalance.toLocaleString()} Zenny</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Next Auction: {new Date(currentAuction.startTime.toDate()).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Auction Positions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentAuction.positions.map((position, index) => {
                  const status = getPositionStatus(position);
                  const highestBid = getCurrentHighestBid(position);
                  const isSelected = selectedPosition === position.position;

                  return (
                    <motion.div
                      key={position.position}
                      whileHover={{ scale: 1.02 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-900/20' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedPosition(position.position)}
                    >
                      {/* Position Header */}
                      <div className={`bg-gradient-to-r ${getPositionColor(index)} text-white p-3 rounded-lg mb-3`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FaTrophy />
                            <span className="font-bold">Position #{position.position}</span>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            status === 'active' ? 'bg-green-500' :
                            status === 'upcoming' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>
                            {status.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      {/* Position Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Current Bid:</span>
                          <span className="text-yellow-400 font-semibold">
                            {highestBid > 0 ? `${highestBid} Zenny` : 'No bids'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Time Left:</span>
                          <span className={`font-semibold ${
                            timeRemaining[position.position] === 'Ended' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {timeRemaining[position.position] || 'Calculating...'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Total Bids:</span>
                          <span className="text-blue-400">{position.bids?.length || 0}</span>
                        </div>
                      </div>

                      {/* Winner Display */}
                      {position.winner && (
                        <div className="mt-3 p-2 bg-green-900/30 rounded border border-green-500">
                          <div className="text-green-400 text-xs font-semibold">WINNER</div>
                          <div className="text-white text-sm">Bid: {position.winner.amount} Zenny</div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Bidding Interface */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <FaGavel className="text-purple-400" />
                  <span>Place Your Bid</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Selected Position</label>
                    <div className="bg-gray-700 p-3 rounded-lg text-white font-semibold">
                      Position #{selectedPosition}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Bid Amount (Zenny)</label>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter bid amount"
                      className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
                      min="1"
                      max={userBalance}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handlePlaceBid}
                      disabled={loading || !bidAmount || parseInt(bidAmount) <= 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-gray-400 text-sm">
                  <p>• Auctions run every Saturday from 7:00 PM IST</p>
                  <p>• Each position auction lasts 15 minutes</p>
                  <p>• Highest bidder wins the spotlight position for 1 week</p>
                  <p>• Losing bids are automatically refunded</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpotlightAuction;
