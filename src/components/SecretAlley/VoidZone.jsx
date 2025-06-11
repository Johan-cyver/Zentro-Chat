import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSkull,
  FaEye,
  FaShieldAlt,
  FaCode,
  FaBolt,
  FaFire,
  FaGhost,
  FaLock,
  FaUnlock,
  FaClock,
  FaTrophy,
  FaExclamationTriangle
} from 'react-icons/fa';

const VoidZone = ({ shadowProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('missions');
  const [voidMissions, setVoidMissions] = useState([]);
  const [activeMission, setActiveMission] = useState(null);
  const [voidLevel, setVoidLevel] = useState(1);
  const [voidXP, setVoidXP] = useState(0);
  const [showMissionBrief, setShowMissionBrief] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);

  useEffect(() => {
    loadVoidData();
  }, []);

  const loadVoidData = () => {
    // Generate advanced void missions
    const missions = [
      {
        id: 'void_001',
        title: 'SHADOW INFILTRATION',
        description: 'Penetrate the corporate firewall and extract classified data without detection',
        difficulty: 'EXTREME',
        reward: 500,
        duration: '45 min',
        requirements: ['Mask Level 3+', 'Cipher Mastery', 'Stealth Protocol'],
        status: 'available',
        type: 'stealth',
        participants: 1,
        maxParticipants: 1,
        successRate: 15
      },
      {
        id: 'void_002',
        title: 'NEURAL HACK',
        description: 'Interface directly with AI systems to corrupt their decision matrices',
        difficulty: 'LEGENDARY',
        reward: 1000,
        duration: '90 min',
        requirements: ['Mask Level 5+', 'Neural Interface', 'Code Mastery'],
        status: 'locked',
        type: 'hacking',
        participants: 0,
        maxParticipants: 2,
        successRate: 8
      },
      {
        id: 'void_003',
        title: 'PHANTOM PROTOCOL',
        description: 'Become completely invisible to all tracking systems for 24 hours',
        difficulty: 'NIGHTMARE',
        reward: 2000,
        duration: '24 hours',
        requirements: ['Mask Level 7+', 'Ghost Certification', 'Void Mastery'],
        status: 'locked',
        type: 'survival',
        participants: 0,
        maxParticipants: 1,
        successRate: 3
      },
      {
        id: 'void_004',
        title: 'REALITY BREACH',
        description: 'Access forbidden knowledge from parallel shadow networks',
        difficulty: 'MYTHIC',
        reward: 5000,
        duration: '???',
        requirements: ['Mask Level 10', 'Void Walker Status', 'Reality Anchor'],
        status: 'legendary',
        type: 'exploration',
        participants: 0,
        maxParticipants: 3,
        successRate: 1
      }
    ];

    setVoidMissions(missions);
    setVoidLevel(shadowProfile?.voidLevel || 1);
    setVoidXP(shadowProfile?.voidXP || 0);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EXTREME': return 'text-red-400 border-red-400';
      case 'LEGENDARY': return 'text-purple-400 border-purple-400';
      case 'NIGHTMARE': return 'text-pink-400 border-pink-400';
      case 'MYTHIC': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'stealth': return FaGhost;
      case 'hacking': return FaCode;
      case 'survival': return FaShieldAlt;
      case 'exploration': return FaEye;
      default: return FaSkull;
    }
  };

  const canAccessMission = (mission) => {
    const maskLevel = shadowProfile?.maskLevel || 1;
    const requiredLevel = parseInt(mission.requirements[0]?.match(/\d+/)?.[0] || '1');
    return maskLevel >= requiredLevel;
  };

  const handleMissionClick = (mission) => {
    if (!canAccessMission(mission)) {
      alert(`🔒 INSUFFICIENT CLEARANCE\nRequired: ${mission.requirements.join(', ')}`);
      return;
    }
    
    setSelectedMission(mission);
    setShowMissionBrief(true);
  };

  const handleStartMission = () => {
    if (!selectedMission) return;
    
    // Simulate mission start
    setActiveMission(selectedMission);
    setShowMissionBrief(false);
    
    // Start mission timer
    setTimeout(() => {
      const success = Math.random() * 100 < selectedMission.successRate;
      if (success) {
        alert(`🎉 MISSION COMPLETE!\nReward: +${selectedMission.reward} Void XP`);
        setVoidXP(prev => prev + selectedMission.reward);
      } else {
        alert(`💀 MISSION FAILED\nYour shadow signature was detected...`);
      }
      setActiveMission(null);
    }, 5000); // 5 second demo
  };

  const renderMissionCard = (mission) => {
    const TypeIcon = getTypeIcon(mission.type);
    const accessible = canAccessMission(mission);
    
    return (
      <motion.div
        key={mission.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: accessible ? 1.02 : 1 }}
        className={`border rounded-lg p-4 transition-all ${
          accessible 
            ? `cursor-pointer hover:border-red-400 ${getDifficultyColor(mission.difficulty)}`
            : 'opacity-50 cursor-not-allowed border-gray-600'
        } bg-black/60`}
        onClick={() => accessible && handleMissionClick(mission)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg border-2 ${getDifficultyColor(mission.difficulty)} bg-black/80 flex items-center justify-center`}>
              <TypeIcon className="text-xl" />
            </div>
            <div>
              <h3 className="text-white font-bold">{mission.title}</h3>
              <p className="text-gray-400 text-sm">{mission.type.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getDifficultyColor(mission.difficulty).split(' ')[0]}`}>
              {mission.difficulty}
            </div>
            <div className="text-gray-400 text-sm">
              {mission.successRate}% Success
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-3">{mission.description}</p>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <span className="text-green-400">+{mission.reward} XP</span>
            <span className="text-cyan-400">{mission.duration}</span>
            <span className="text-purple-400">{mission.participants}/{mission.maxParticipants} Shadows</span>
          </div>
          {!accessible && <FaLock className="text-red-400" />}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <strong>Requirements:</strong> {mission.requirements.join(' • ')}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Void background effects */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [1, 1.5, 1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          >
            💀
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-red-400/30 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              ← ESCAPE VOID
            </motion.button>
            
            <div className="flex items-center space-x-3">
              <FaSkull className="text-red-400 text-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-red-400">VOID ZONE</h1>
                <p className="text-gray-400 text-sm">Advanced Shadow Operations</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-red-400 font-bold">VOID LEVEL: {voidLevel}</div>
              <div className="text-xs opacity-70">VOID XP: {voidXP}</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaSkull className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative z-10 p-6 border-b border-red-400/30 bg-black/60">
        <div className="flex space-x-4">
          {[
            { id: 'missions', label: 'VOID MISSIONS', icon: FaSkull },
            { id: 'archives', label: 'FORBIDDEN ARCHIVES', icon: FaLock },
            { id: 'leaderboard', label: 'VOID WALKERS', icon: FaTrophy }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 p-6 overflow-y-auto">
        {activeTab === 'missions' && (
          <div className="space-y-4">
            {activeMission && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-400 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <FaClock className="text-red-400 animate-pulse" />
                  <div>
                    <h3 className="text-red-400 font-bold">MISSION IN PROGRESS</h3>
                    <p className="text-gray-400">{activeMission.title}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="grid gap-4">
              {voidMissions.map(renderMissionCard)}
            </div>
          </div>
        )}

        {activeTab === 'archives' && (
          <div className="text-center text-gray-400 py-20">
            <FaLock className="text-6xl mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold mb-2">FORBIDDEN ARCHIVES</h3>
            <p>Access restricted to Void Level 5+</p>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="text-center text-gray-400 py-20">
            <FaTrophy className="text-6xl mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-bold mb-2">VOID WALKERS</h3>
            <p>Only the most elite shadows appear here...</p>
          </div>
        )}
      </div>

      {/* Mission Brief Modal */}
      <AnimatePresence>
        {showMissionBrief && selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border border-red-400 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <FaExclamationTriangle className="text-red-400 text-xl" />
                <h2 className="text-red-400 font-bold text-lg">MISSION BRIEFING</h2>
              </div>

              <div className="space-y-4 text-white">
                <div>
                  <h3 className="font-bold text-xl">{selectedMission.title}</h3>
                  <p className="text-gray-400">{selectedMission.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Difficulty:</span>
                    <div className={`font-bold ${getDifficultyColor(selectedMission.difficulty).split(' ')[0]}`}>
                      {selectedMission.difficulty}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Success Rate:</span>
                    <div className="font-bold text-red-400">{selectedMission.successRate}%</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <div className="font-bold text-cyan-400">{selectedMission.duration}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Reward:</span>
                    <div className="font-bold text-green-400">+{selectedMission.reward} XP</div>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-400/30 rounded p-3">
                  <div className="text-red-400 font-bold text-sm mb-2">⚠️ WARNING</div>
                  <div className="text-xs text-gray-300">
                    Failure may result in shadow signature exposure, reputation loss, or temporary void ban.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartMission}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  💀 ACCEPT MISSION
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMissionBrief(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  ABORT
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoidZone;
