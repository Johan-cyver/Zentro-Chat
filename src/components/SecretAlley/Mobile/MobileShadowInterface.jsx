import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTerminal,
  FaEye,
  FaCode,
  FaUsers,
  FaBolt,
  FaShieldAlt,
  FaSkull,
  FaRocket,
  FaFire,
  FaMicrophone,
  FaMicrophoneSlash,
  FaExpand,
  FaCompress,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';

const MobileShadowInterface = ({ shadowProfile, onZoneSelect, onBack }) => {
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [activeHUD, setActiveHUD] = useState('overview');
  const [isMuted, setIsMuted] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);

  // Mobile-optimized zones
  const mobileZones = [
    {
      id: 'missions',
      name: 'SKILL MISSIONS',
      icon: FaBolt,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      participants: '∞',
      status: 'ACTIVE',
      description: 'Quick skill challenges'
    },
    {
      id: 'deception',
      name: 'DECEPTION',
      icon: FaEye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      participants: '8-12',
      status: 'LIVE',
      description: 'Social engineering game'
    },
    {
      id: 'factions',
      name: 'FACTIONS',
      icon: FaShieldAlt,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      participants: '1,247',
      status: 'WAR',
      description: 'Territory battles'
    },
    {
      id: 'projects',
      name: 'PROJECTS',
      icon: FaRocket,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      participants: '∞',
      status: 'BUILD',
      description: 'Real development'
    }
  ];

  // Quick action cards for mobile
  const mobileQuickActions = [
    { id: 'cipher', name: 'Solve Cipher', icon: FaCode, reward: '+40 XP' },
    { id: 'squad', name: 'Join Squad', icon: FaUsers, reward: '+25 XP' },
    { id: 'void', name: 'Void Mission', icon: FaSkull, reward: '+100 XP' },
    { id: 'arena', name: 'Quick Battle', icon: FaFire, reward: '+30 XP' }
  ];

  useEffect(() => {
    // Simulate mobile notifications
    const notificationInterval = setInterval(() => {
      const notifications = [
        '🎯 New cipher challenge available',
        '⚔️ Faction war starting in 5 minutes',
        '👥 Squad member online',
        '🚀 Project deadline approaching',
        '💀 Void mission unlocked'
      ];
      
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setNotifications(prev => [
        { id: Date.now(), message: randomNotification, timestamp: Date.now() },
        ...prev.slice(0, 4) // Keep only 5 notifications
      ]);
    }, 15000);

    return () => clearInterval(notificationInterval);
  }, []);

  // Handle swipe gestures
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setSwipeDirection({ startX: touch.clientX, startY: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    if (!swipeDirection) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeDirection.startX;
    const deltaY = touch.clientY - swipeDirection.startY;
    
    // Detect swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 50) {
        // Swipe right - expand terminal
        setTerminalExpanded(true);
      } else if (deltaX < -50) {
        // Swipe left - collapse terminal
        setTerminalExpanded(false);
      }
    } else {
      if (deltaY > 50) {
        // Swipe down - show quick actions
        setActiveHUD('actions');
      } else if (deltaY < -50) {
        // Swipe up - show overview
        setActiveHUD('overview');
      }
    }
    
    setSwipeDirection(null);
  };

  const renderMobileZoneCard = (zone) => {
    return (
      <motion.div
        key={zone.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onZoneSelect(zone.id)}
        className={`${zone.bgColor} border border-gray-600 rounded-lg p-4 cursor-pointer active:bg-gray-800 transition-all`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg border ${zone.color.replace('text', 'border')} bg-black/50 flex items-center justify-center`}>
              <zone.icon className={`text-lg ${zone.color}`} />
            </div>
            <div>
              <h3 className={`font-bold ${zone.color}`}>{zone.name}</h3>
              <p className="text-gray-400 text-xs">{zone.description}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-xs font-bold ${zone.color}`}>{zone.status}</div>
            <div className="text-gray-400 text-xs">{zone.participants}</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-1">
          <div className={`h-1 rounded-full ${zone.color.replace('text', 'bg')} w-${Math.floor(Math.random() * 8) + 2}/12`} />
        </div>
      </motion.div>
    );
  };

  const renderQuickActionCard = (action) => {
    return (
      <motion.div
        key={action.id}
        whileTap={{ scale: 0.95 }}
        className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-3 cursor-pointer active:bg-gray-800 transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg border border-cyan-400 bg-black/50 flex items-center justify-center">
            <action.icon className="text-sm text-cyan-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm">{action.name}</h4>
            <p className="text-green-400 text-xs">{action.reward}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden z-50"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Mobile Header */}
      <div className="p-4 border-b border-green-400/30 bg-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-cyan-400 p-2"
            >
              ←
            </motion.button>
            <div>
              <h1 className="text-lg font-bold text-cyan-400">SECRET ALLEY</h1>
              <p className="text-xs text-gray-400">Mobile Protocol</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded ${isMuted ? 'bg-red-600' : 'bg-green-600'}`}
            >
              {isMuted ? <FaMicrophoneSlash className="text-white text-sm" /> : <FaMicrophone className="text-white text-sm" />}
            </motion.button>
            
            <div className="text-right text-xs">
              <div className="text-cyan-400 font-bold">LVL {shadowProfile?.maskLevel || 1}</div>
              <div className="text-gray-400">{shadowProfile?.shadowXP || 0} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Bar */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-yellow-900/20 border-b border-yellow-400/30 p-2"
          >
            <div className="text-yellow-400 text-xs font-bold">
              {notifications[0]?.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {activeHUD === 'overview' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cyan-400">SHADOW ZONES</h2>
              <div className="text-xs text-gray-400">Swipe for actions</div>
            </div>
            
            <div className="grid gap-3">
              {mobileZones.map(renderMobileZoneCard)}
            </div>
            
            {/* Stats Overview */}
            <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4 mt-6">
              <h3 className="text-cyan-400 font-bold mb-3">SHADOW STATS</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Mask Level</div>
                  <div className="text-white font-bold">{shadowProfile?.maskLevel || 1}</div>
                </div>
                <div>
                  <div className="text-gray-400">Shadow XP</div>
                  <div className="text-yellow-400 font-bold">{shadowProfile?.shadowXP || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400">Reputation</div>
                  <div className="text-purple-400 font-bold">{shadowProfile?.reputation || 0}</div>
                </div>
                <div>
                  <div className="text-gray-400">Faction</div>
                  <div className="text-blue-400 font-bold">{shadowProfile?.faction || 'None'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeHUD === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-cyan-400">QUICK ACTIONS</h2>
              <div className="text-xs text-gray-400">Tap to execute</div>
            </div>
            
            <div className="grid gap-3">
              {mobileQuickActions.map(renderQuickActionCard)}
            </div>
            
            {/* Recent Activity */}
            <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4 mt-6">
              <h3 className="text-cyan-400 font-bold mb-3">RECENT ACTIVITY</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Cipher solved</span>
                  <span className="text-green-400">+40 XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Squad mission</span>
                  <span className="text-green-400">+25 XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Faction battle</span>
                  <span className="text-green-400">+60 XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Terminal (Bottom Docked) */}
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: terminalExpanded ? 0 : 150 }}
        className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-400/50 z-50"
        style={{ height: terminalExpanded ? '60vh' : '80px' }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <FaTerminal className="text-green-400" />
              <span className="text-green-400 font-bold text-sm">SHADOW TERMINAL</span>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTerminalExpanded(!terminalExpanded)}
              className="text-cyan-400 p-1"
            >
              {terminalExpanded ? <FaChevronDown /> : <FaChevronUp />}
            </motion.button>
          </div>
          
          {terminalExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2"
            >
              <div className="bg-gray-900 rounded border border-gray-600 p-3 h-40 overflow-y-auto text-xs">
                <div className="text-green-400">SHADOW_TERMINAL v2.0.0</div>
                <div className="text-gray-400">Type 'help' for commands</div>
                <div className="text-cyan-400">&gt; Ready for input...</div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter command..."
                  className="flex-1 bg-gray-900 border border-gray-600 rounded px-3 py-2 text-green-400 text-sm focus:outline-none focus:border-cyan-400"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-cyan-600 text-white px-4 py-2 rounded text-sm font-bold"
                >
                  EXEC
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Mobile Navigation Dots */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-40">
        {['overview', 'actions'].map(hud => (
          <motion.button
            key={hud}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveHUD(hud)}
            className={`w-3 h-3 rounded-full transition-all ${
              activeHUD === hud ? 'bg-cyan-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg z-40"
        animate={{
          boxShadow: [
            '0 0 20px rgba(0, 255, 255, 0.5)',
            '0 0 40px rgba(0, 255, 255, 0.8)',
            '0 0 20px rgba(0, 255, 255, 0.5)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FaBolt className="text-white text-xl" />
      </motion.button>

      {/* Swipe Indicators */}
      <div className="fixed top-1/2 left-2 transform -translate-y-1/2 text-gray-600 text-xs">
        <div className="writing-mode-vertical">SWIPE →</div>
      </div>
      <div className="fixed top-1/2 right-2 transform -translate-y-1/2 text-gray-600 text-xs">
        <div className="writing-mode-vertical">← SWIPE</div>
      </div>
    </div>
  );
};

export default MobileShadowInterface;
