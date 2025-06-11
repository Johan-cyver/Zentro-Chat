import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaLock, 
  FaShieldAlt, 
  FaCode, 
  FaSkull,
  FaExclamationTriangle,
  FaCheck,
  FaTimes
} from 'react-icons/fa';

const ShadowEntryPortal = ({ userProfile, onEntry, onReject }) => {
  const [entryPhase, setEntryPhase] = useState('scanning'); // scanning, clearance, invite, approved, rejected
  const [inviteCode, setInviteCode] = useState('');
  const [clearanceLevel, setClearanceLevel] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessages, setScanMessages] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [showInviteInput, setShowInviteInput] = useState(false);

  // Valid invite codes (in real implementation, these would be from database)
  const VALID_INVITE_CODES = [
    'SHADOW_RECRUIT_2024',
    'ELITE_DEVELOPER_ACCESS',
    'CIPHER_MASTER_INVITE',
    'VOID_WALKER_PROTOCOL',
    'UNDERGROUND_ELITE'
  ];

  // Scanning sequence messages
  const SCAN_SEQUENCE = [
    'SCANNING USER PROFILE...',
    'ANALYZING SKILL METRICS...',
    'CHECKING ZENTRO ACTIVITY...',
    'EVALUATING XP LEVELS...',
    'ASSESSING COMMUNITY STANDING...',
    'CALCULATING CLEARANCE LEVEL...',
    'DETERMINING ACCESS RIGHTS...',
    'SCAN COMPLETE'
  ];

  useEffect(() => {
    startUserScan();
  }, [userProfile]);

  const startUserScan = async () => {
    // Simulate scanning user profile
    for (let i = 0; i < SCAN_SEQUENCE.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanMessages(prev => [...prev, SCAN_SEQUENCE[i]]);
      setScanProgress((i + 1) / SCAN_SEQUENCE.length * 100);
    }

    // Calculate user stats and clearance
    const stats = calculateUserStats(userProfile);
    setUserStats(stats);
    setClearanceLevel(stats.clearanceLevel);

    // Determine entry phase based on clearance
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (stats.clearanceLevel >= 3) {
      setEntryPhase('approved');
      setTimeout(() => onEntry(stats), 2000);
    } else if (stats.clearanceLevel >= 1) {
      setEntryPhase('clearance');
    } else {
      setEntryPhase('invite');
    }
  };

  const calculateUserStats = (profile) => {
    // Calculate clearance based on user activity
    let clearanceLevel = 0;
    let skillScore = 0;
    let activityScore = 0;

    if (profile) {
      // Base clearance for registered users
      clearanceLevel = 1;
      
      // Add points for various activities
      const zentroXP = profile.zentroXP || 0;
      const achievements = profile.achievements?.length || 0;
      const networkConnections = profile.networkConnections || 0;
      
      skillScore = Math.min(zentroXP / 1000, 5); // Max 5 points from XP
      activityScore = Math.min(achievements * 0.5 + networkConnections * 0.1, 3); // Max 3 points
      
      clearanceLevel = Math.floor(skillScore + activityScore);
      clearanceLevel = Math.max(1, Math.min(clearanceLevel, 5)); // Clamp between 1-5
    }

    return {
      clearanceLevel,
      skillScore: Math.round(skillScore * 10) / 10,
      activityScore: Math.round(activityScore * 10) / 10,
      totalScore: Math.round((skillScore + activityScore) * 10) / 10,
      zentroXP: profile?.zentroXP || 0,
      achievements: profile?.achievements?.length || 0,
      networkConnections: profile?.networkConnections || 0
    };
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    const code = inviteCode.toUpperCase().trim();
    
    if (VALID_INVITE_CODES.includes(code)) {
      // Valid invite code - grant access
      const enhancedStats = {
        ...userStats,
        clearanceLevel: Math.max(userStats.clearanceLevel, 3),
        inviteCode: code,
        inviteAccess: true
      };
      setUserStats(enhancedStats);
      setEntryPhase('approved');
      setTimeout(() => onEntry(enhancedStats), 2000);
    } else {
      // Invalid code - show error
      setInviteCode('');
      // Add glitch effect or error animation
    }
  };

  const getClearanceColor = (level) => {
    switch (level) {
      case 1: return 'text-gray-400';
      case 2: return 'text-green-400';
      case 3: return 'text-blue-400';
      case 4: return 'text-purple-400';
      case 5: return 'text-red-400';
      default: return 'text-gray-600';
    }
  };

  const getClearanceName = (level) => {
    switch (level) {
      case 1: return 'BASIC';
      case 2: return 'ELEVATED';
      case 3: return 'CONFIDENTIAL';
      case 4: return 'SECRET';
      case 5: return 'TOP SECRET';
      default: return 'NONE';
    }
  };

  // Scanning phase
  if (entryPhase === 'scanning') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        {/* Scanning grid background */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border border-cyan-400"
              style={{
                left: `${(i % 5) * 20}%`,
                top: `${Math.floor(i / 5) * 25}%`,
                width: '20%',
                height: '25%'
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                borderColor: ['rgba(0, 255, 255, 0.3)', 'rgba(255, 0, 255, 0.6)', 'rgba(0, 255, 255, 0.3)']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
          {/* Scanning eye */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
              boxShadow: [
                '0 0 30px rgba(0, 255, 255, 0.5)',
                '0 0 60px rgba(255, 0, 255, 0.8)',
                '0 0 30px rgba(0, 255, 255, 0.5)'
              ]
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              boxShadow: { duration: 3, repeat: Infinity }
            }}
            className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <FaEye className="text-6xl text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-cyan-400 mb-4 font-mono"
          >
            SECURITY SCAN IN PROGRESS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-300 mb-8 font-mono"
          >
            Analyzing your digital footprint...
          </motion.p>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-800 rounded-full h-4 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-cyan-400 font-mono text-sm">
              {Math.round(scanProgress)}% COMPLETE
            </div>
          </div>

          {/* Scan messages */}
          <div className="h-32 overflow-hidden">
            <AnimatePresence>
              {scanMessages.slice(-4).map((message, index) => (
                <motion.div
                  key={`${message}-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="text-green-400 font-mono text-sm mb-2"
                >
                  &gt; {message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Clearance assessment phase
  if (entryPhase === 'clearance') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        <div className="relative z-10 text-center max-w-4xl mx-auto p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.5 }}
            className="mb-8"
          >
            <FaShieldAlt className={`text-8xl mx-auto mb-4 ${getClearanceColor(clearanceLevel)}`} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-cyan-400 mb-4 font-mono"
          >
            CLEARANCE ASSESSMENT
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-8 mb-8"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">USER METRICS</h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zentro XP:</span>
                    <span className="text-green-400">{userStats?.zentroXP || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Achievements:</span>
                    <span className="text-green-400">{userStats?.achievements || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Connections:</span>
                    <span className="text-green-400">{userStats?.networkConnections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skill Score:</span>
                    <span className="text-blue-400">{userStats?.skillScore || 0}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Activity Score:</span>
                    <span className="text-blue-400">{userStats?.activityScore || 0}/3.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">CLEARANCE RESULT</h3>
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getClearanceColor(clearanceLevel)}`}>
                    LEVEL {clearanceLevel}
                  </div>
                  <div className={`text-2xl font-bold mb-4 ${getClearanceColor(clearanceLevel)}`}>
                    {getClearanceName(clearanceLevel)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Total Score: {userStats?.totalScore || 0}/8.0
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {clearanceLevel >= 3 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-2 text-green-400 text-xl font-bold">
                <FaCheck />
                <span>ACCESS GRANTED</span>
              </div>
              <p className="text-gray-300">Welcome to the underground, operative.</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center space-x-2 text-yellow-400 text-xl font-bold">
                <FaExclamationTriangle />
                <span>INSUFFICIENT CLEARANCE</span>
              </div>
              <p className="text-gray-300 mb-4">
                You need Level 3+ clearance or a valid invite code.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowInviteInput(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                🔑 ENTER INVITE CODE
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Invite code phase
  if (entryPhase === 'invite' || showInviteInput) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-8"
          >
            <FaLock className="text-8xl text-purple-400 mx-auto mb-4" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-purple-400 mb-4 font-mono"
          >
            INVITE REQUIRED
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg text-gray-300 mb-8"
          >
            This is an invite-only underground network. <br />
            Enter your invitation code to proceed.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onSubmit={handleInviteSubmit}
            className="space-y-6"
          >
            <div>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ENTER INVITE CODE"
                className="w-full bg-black border-2 border-purple-400 rounded-lg px-6 py-4 text-purple-400 font-mono text-center text-xl focus:outline-none focus:border-cyan-400 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                🔓 VERIFY CODE
              </motion.button>
              
              {showInviteInput && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInviteInput(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  BACK
                </motion.button>
              )}
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 text-sm text-gray-500 space-y-2"
          >
            <p>💡 Hint: Invite codes are distributed to elite developers</p>
            <p>🔍 Check your email or ask a current member</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Approved phase
  if (entryPhase === 'approved') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <motion.div
              animate={{
                rotate: 360,
                boxShadow: [
                  '0 0 30px rgba(0, 255, 0, 0.5)',
                  '0 0 60px rgba(0, 255, 0, 0.8)',
                  '0 0 30px rgba(0, 255, 0, 0.5)'
                ]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
              className="w-32 h-32 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto"
            >
              <FaCheck className="text-6xl text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-6xl font-bold text-green-400 mb-4 font-mono"
          >
            ACCESS GRANTED
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xl text-gray-300 mb-8"
          >
            Welcome to the underground, operative. <br />
            Initializing shadow protocols...
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-cyan-400 font-mono"
          >
            Clearance Level: {getClearanceName(clearanceLevel)}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default ShadowEntryPortal;
