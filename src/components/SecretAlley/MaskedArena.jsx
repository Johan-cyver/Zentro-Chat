import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaFighterJet,
  FaCode,
  FaBolt,
  FaSkull,
  FaEye,
  FaCrown,
  FaFire
} from 'react-icons/fa';

const MaskedArena = ({ shadowProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('battles');
  const [activeBattles, setActiveBattles] = useState([]);
  const [battleHistory, setBattleHistory] = useState([]);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [showCreateBattle, setShowCreateBattle] = useState(false);

  useEffect(() => {
    loadArenaData();
  }, []);

  const loadArenaData = () => {
    // Mock data for now - will connect to Firebase later
    setActiveBattles([
      {
        id: 'battle_001',
        type: 'CODE_DUEL',
        challenger: 'PHANTOM_BLADE_777',
        stakes: 50,
        difficulty: 'HARD',
        timeLimit: 300,
        status: 'WAITING',
        participants: 1,
        maxParticipants: 2,
        description: 'Algorithm optimization challenge'
      },
      {
        id: 'battle_002',
        type: 'LOGIC_PUZZLE',
        challenger: 'CIPHER_MIND_404',
        stakes: 25,
        difficulty: 'MEDIUM',
        timeLimit: 180,
        status: 'IN_PROGRESS',
        participants: 2,
        maxParticipants: 2,
        description: 'Binary tree traversal'
      },
      {
        id: 'battle_003',
        type: 'SQUAD_WAR',
        challenger: 'SHADOW_COLLECTIVE',
        stakes: 200,
        difficulty: 'EXTREME',
        timeLimit: 600,
        status: 'FORMING',
        participants: 6,
        maxParticipants: 10,
        description: 'Multi-stage coding tournament'
      }
    ]);

    setBattleHistory([
      {
        id: 'hist_001',
        opponent: 'VOID_HUNTER_123',
        result: 'WON',
        stakes: 30,
        type: 'CODE_DUEL',
        duration: 240,
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'hist_002',
        opponent: 'GLITCH_STORM_999',
        result: 'LOST',
        stakes: 15,
        type: 'LOGIC_PUZZLE',
        duration: 180,
        timestamp: '2024-01-14T15:45:00Z'
      }
    ]);
  };

  const getBattleTypeIcon = (type) => {
    switch (type) {
      case 'CODE_DUEL': return FaCode;
      case 'LOGIC_PUZZLE': return FaBolt;
      case 'SQUAD_WAR': return FaFighterJet;
      default: return FaShieldAlt;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HARD': return 'text-orange-400';
      case 'EXTREME': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING': return 'text-blue-400';
      case 'IN_PROGRESS': return 'text-green-400';
      case 'FORMING': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const renderBattleCard = (battle) => {
    const TypeIcon = getBattleTypeIcon(battle.type);
    
    return (
      <motion.div
        key={battle.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4 cursor-pointer hover:border-cyan-400 transition-all"
        onClick={() => setSelectedBattle(battle)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <TypeIcon className="text-cyan-400 text-xl" />
            <div>
              <h3 className="text-white font-bold">{battle.type.replace('_', ' ')}</h3>
              <p className="text-gray-400 text-sm">{battle.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getStatusColor(battle.status)}`}>
              {battle.status}
            </div>
            <div className="text-gray-400 text-sm">
              {battle.participants}/{battle.maxParticipants}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Challenger:</span>
              <span className="text-cyan-400 ml-1">{battle.challenger}</span>
            </div>
            <div className={`text-sm ${getDifficultyColor(battle.difficulty)}`}>
              {battle.difficulty}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaSkull className="text-yellow-400" />
            <span className="text-yellow-400 font-bold">{battle.stakes}</span>
            <span className="text-gray-400 text-sm">XP</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderHistoryCard = (battle) => {
    return (
      <motion.div
        key={battle.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              battle.result === 'WON' ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <div>
              <div className="text-white font-medium">{battle.opponent}</div>
              <div className="text-gray-400 text-sm">{battle.type.replace('_', ' ')}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${
              battle.result === 'WON' ? 'text-green-400' : 'text-red-400'
            }`}>
              {battle.result}
            </div>
            <div className="text-gray-400 text-sm">
              {Math.floor(battle.duration / 60)}:{(battle.duration % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            ⚔️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-red-400/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ← BACK
            </motion.button>
            <FaShieldAlt className="text-3xl text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-red-400">MASKED ARENA</h1>
              <p className="text-sm opacity-70">Anonymous battles • No mercy</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-red-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
              <div className="text-xs opacity-70">BATTLES WON: {shadowProfile?.battlesWon || 0}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateBattle(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              🗡️ CREATE BATTLE
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 p-6">
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'battles', label: 'ACTIVE BATTLES', icon: FaFighterJet },
            { id: 'history', label: 'BATTLE HISTORY', icon: FaCrown },
            { id: 'leaderboard', label: 'ARENA LEGENDS', icon: FaFire }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <TabIcon />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'battles' && (
            <div className="grid gap-4">
              {activeBattles.map(renderBattleCard)}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="grid gap-3">
              {battleHistory.map(renderHistoryCard)}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="text-center text-gray-400 py-20">
              <FaFire className="text-6xl mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2">ARENA LEGENDS</h3>
              <p>Coming in Phase 3...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaskedArena;
