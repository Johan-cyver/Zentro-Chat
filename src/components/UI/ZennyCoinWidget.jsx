import React, { useState, useEffect } from 'react';
import { FaPlus, FaInfoCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ZennyCoinIcon from './ZennyCoinIcon';

const ZennyCoinWidget = ({ 
  balance = 0, 
  size = "default", // mini, default, large
  showAddButton = false,
  showTooltip = true,
  position = "header", // header, sidebar, card
  onAddCoins,
  className = ""
}) => {
  const [showTooltipState, setShowTooltipState] = useState(false);
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [isGlowing, setIsGlowing] = useState(false);

  // Trigger glow animation when balance increases
  useEffect(() => {
    if (balance > previousBalance && previousBalance > 0) {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000);
    }
    setPreviousBalance(balance);
  }, [balance, previousBalance]);

  const sizeClasses = {
    mini: "text-xs px-2 py-1",
    default: "text-sm px-3 py-1.5",
    large: "text-lg px-4 py-2"
  };

  const positionClasses = {
    header: "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-black shadow-xl border border-yellow-400/50",
    sidebar: "bg-gradient-to-r from-yellow-600/20 to-orange-600/20 text-yellow-300 border border-yellow-500/30",
    card: "bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-black shadow-lg"
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Main Coin Widget */}
      <motion.div
        className={`
          flex items-center space-x-2 rounded-full font-bold backdrop-blur-sm
          ${sizeClasses[size]} 
          ${positionClasses[position]}
          ${isGlowing ? 'animate-pulse' : ''}
          transition-all duration-300 hover:scale-105 cursor-pointer
        `}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        whileHover={{ scale: 1.05 }}
        animate={isGlowing ? { 
          boxShadow: [
            "0 0 0px rgba(255, 215, 0, 0)",
            "0 0 20px rgba(255, 215, 0, 0.8)",
            "0 0 0px rgba(255, 215, 0, 0)"
          ]
        } : {}}
        transition={{ duration: 0.6, repeat: isGlowing ? 3 : 0 }}
      >
        <ZennyCoinIcon 
          variant={size} 
          animated={isGlowing}
          glowing={isGlowing}
        />
        <span className="font-bold">
          {balance.toFixed(1)}
        </span>
        
        {showAddButton && (
          <button
            onClick={onAddCoins}
            className="ml-1 p-1 rounded-full hover:bg-white/20 transition-colors"
            title="Get more Zenny Coins"
          >
            <FaPlus className="text-xs" />
          </button>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && showTooltipState && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
          >
            <div className="bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700/50 max-w-xs">
              <div className="flex items-start space-x-2">
                <FaInfoCircle className="text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-yellow-400 mb-1">Zenny Coins</div>
                  <div className="text-gray-300 leading-relaxed">
                    Earn more by:
                    <ul className="mt-1 space-y-0.5 text-xs">
                      <li>• Writing blogs & articles</li>
                      <li>• Winning spotlight auctions</li>
                      <li>• Completing challenges</li>
                      <li>• Getting skill endorsements</li>
                      <li>• Receiving tips from others</li>
                    </ul>
                  </div>
                </div>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900/95"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating +1 animation when balance increases */}
      <AnimatePresence>
        {isGlowing && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
          >
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              +{(balance - previousBalance).toFixed(1)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ZennyCoinWidget;
