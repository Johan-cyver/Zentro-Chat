import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEye,
  FaTerminal,
  FaShieldAlt,
  FaCode,
  FaUsers,
  FaBolt,
  FaSkull,
  FaRocket
} from 'react-icons/fa';
import ShadowTerminal from './ShadowTerminal';
import MaskedArena from './MaskedArena';
import CipherBoard from './CipherBoard';
import WhisperNet from './WhisperNet';
import SquadForge from './SquadForge';
import NetworkMap from './NetworkMap';
import VoidZone from './VoidZone';
import SkillMissionSystem from './SkillMissionSystem';
import DeceptionGameEngine from './DeceptionProtocol/DeceptionGameEngine';
import FactionSystem from './FactionWars/FactionSystem';
import ShadowProjectHub from './ProjectMode/ShadowProjectHub';
import ShadowInfiltrationProtocol from './ShadowInfiltration/ShadowInfiltrationProtocol';

const ShadowDashboard = ({ shadowProfile }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeZone, setActiveZone] = useState(null);
  const [userSecretId, setUserSecretId] = useState(null);
  const [showSecretIdGenerator, setShowSecretIdGenerator] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);
  const shadowStats = {
    maskLevel: shadowProfile?.maskLevel || 1,
    shadowXP: shadowProfile?.shadowXP || 0,
    reputation: shadowProfile?.reputation || 0,
    battlesWon: shadowProfile?.battlesWon || 0,
    ciphersSolved: shadowProfile?.ciphersSolved || 0,
    suspicionLevel: 15,
    accessLevel: 'BASIC'
  };

  // Available zones - ALL UNLOCKED for exploration
  const zones = [
    {
      id: 'infiltration',
      name: 'INFILTRATION',
      code: 'INF',
      description: 'Deception Protocol - Core Feature',
      icon: FaEye,
      status: 'ACTIVE',
      participants: '8/12',
      clearance: 0,
      xpBonus: '+50 XP per game'
    },
    {
      id: 'arena',
      name: 'ARENA',
      code: 'PVP',
      description: 'Anonymous PvP Battles',
      icon: FaShieldAlt,
      status: 'LIVE',
      participants: '24',
      clearance: 0,
      xpBonus: '+30 XP per win'
    },
    {
      id: 'cipher',
      name: 'CIPHER',
      code: 'CRY',
      description: 'Cryptography Challenges',
      icon: FaCode,
      status: 'ACTIVE',
      participants: '15',
      clearance: 0,
      xpBonus: '+40 XP per solve'
    },
    {
      id: 'whispers',
      name: 'WHISPERS',
      code: 'MSG',
      description: 'Encrypted Communications',
      icon: FaUsers,
      status: 'SECURE',
      participants: '42',
      clearance: 0,
      xpBonus: '+10 XP per message'
    },
    {
      id: 'forge',
      name: 'FORGE',
      code: 'SQD',
      description: 'Squad Building',
      icon: FaBolt,
      status: 'ACTIVE',
      participants: '18',
      clearance: 0,
      xpBonus: '+25 XP per recruit'
    },
    {
      id: 'network',
      name: 'NETWORK',
      code: 'NET',
      description: 'Shadow Connections',
      icon: FaTerminal,
      status: 'ACTIVE',
      participants: '33',
      clearance: 0,
      xpBonus: '+20 XP per connection'
    },
    {
      id: 'void',
      name: 'VOID',
      code: 'VXX',
      description: 'Advanced Shadow Operations',
      icon: FaSkull,
      status: 'ELITE',
      participants: '7',
      clearance: 0,
      xpBonus: '+100 XP per mission'
    },
    {
      id: 'missions',
      name: 'SKILL MISSIONS',
      code: 'SKL',
      description: 'Prove Your Abilities',
      icon: FaBolt,
      status: 'TRAINING',
      participants: '∞',
      clearance: 0,
      xpBonus: '+50 XP per challenge'
    },
    {
      id: 'factions',
      name: 'FACTION WARS',
      code: 'FAC',
      description: 'Territory Control & Alliances',
      icon: FaShieldAlt,
      status: 'ACTIVE',
      participants: '1,247',
      clearance: 2,
      xpBonus: '+200 XP per territory'
    },
    {
      id: 'deception',
      name: 'DECEPTION PROTOCOL',
      code: 'DCP',
      description: 'Social Engineering Simulation',
      icon: FaEye,
      status: 'BETA',
      participants: '8-12',
      clearance: 3,
      xpBonus: '+300 XP per game'
    },
    {
      id: 'projects',
      name: 'PROJECT MODE',
      code: 'PRJ',
      description: 'Build Real Applications',
      icon: FaRocket,
      status: 'ELITE',
      participants: '∞',
      clearance: 4,
      xpBonus: '+1000 XP per project'
    }
  ];

  // Initialize Secret Alley
  useEffect(() => {
    const savedSecretId = localStorage.getItem('zentro_secret_id');
    if (savedSecretId) {
      setUserSecretId(savedSecretId);
    } else {
      setShowSecretIdGenerator(true);
    }
  }, []);

  // Force fullscreen
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (e) {
        console.log('Fullscreen not supported');
      }
    };

    setTimeout(enterFullscreen, 100);
    setTimeout(enterFullscreen, 1000);

    const handleClick = () => {
      enterFullscreen();
      document.removeEventListener('click', handleClick);
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Glitch effects and system monitoring
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance of glitch
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 200);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Generate Secret ID
  const generateSecretId = () => {
    const prefixes = ['SHADOW', 'GHOST', 'PHANTOM', 'VOID', 'CIPHER', 'NEON', 'DARK', 'QUANTUM'];
    const suffixes = ['HUNTER', 'WALKER', 'BLADE', 'STORM', 'PULSE', 'ECHO', 'MIND', 'CORE'];
    const numbers = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}_${suffix}_${numbers}`;
  };

  const createSecretId = () => {
    const newId = generateSecretId();
    setUserSecretId(newId);
    localStorage.setItem('zentro_secret_id', newId);
    setShowSecretIdGenerator(false);
  };

  // Handle terminal commands
  const handleTerminalCommand = (command, args) => {
    switch (command) {
      case 'navigate':
        if (args && zones.find(z => z.id === args)) {
          handleZoneClick(zones.find(z => z.id === args));
        }
        break;
      case 'exit':
        window.location.href = '/';
        break;
      default:
        console.log('Unknown command:', command, args);
    }
  };

  const handleZoneClick = (zone) => {
    if (!userSecretId) {
      alert('🔒 ACCESS DENIED: Generate your Secret ID first!');
      return;
    }

    if (zone.clearance > shadowStats.maskLevel) {
      alert(`🔒 CLEARANCE LEVEL ${zone.clearance} REQUIRED\nYour current mask level: ${shadowStats.maskLevel}`);
      return;
    }

    setActiveZone(zone.id);
    setTimeout(() => {
      setCurrentView(zone.id);
    }, 1500);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveZone(null);
  };

  // Render specific zone views
  if (currentView === 'infiltration') {
    return (
      <ShadowInfiltrationProtocol
        shadowProfile={shadowProfile}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'arena') {
    return <MaskedArena shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'cipher') {
    return <CipherBoard shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'whispers') {
    return <WhisperNet shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'forge') {
    return <SquadForge shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'void') {
    return <VoidZone shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'missions') {
    return (
      <SkillMissionSystem
        shadowProfile={shadowProfile}
        onMissionComplete={(results) => {
          // Update shadow profile with mission results
          console.log('Mission completed:', results);
        }}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'factions') {
    return <FactionSystem shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'deception') {
    return (
      <DeceptionGameEngine
        shadowProfile={shadowProfile}
        gameSession={{ id: 'demo_session', players: 8 }}
        onGameEnd={(results) => {
          console.log('Deception game ended:', results);
          handleBackToDashboard();
        }}
      />
    );
  }

  if (currentView === 'projects') {
    return <ShadowProjectHub shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  if (currentView === 'network') {
    return <NetworkMap shadowProfile={shadowProfile} onBack={handleBackToDashboard} />;
  }

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden z-50"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {/* CRT-style scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
        }} />
      </div>

      {/* Matrix Background with enhanced effects */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 text-xs font-mono"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              y: [0, -100, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: Math.random() * 6 + 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          >
            {Math.random() > 0.7 ? '🕳️' : Math.random() > 0.5 ? '01' : '10'}
          </motion.div>
        ))}
      </div>

      {/* Cyber grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Floating cyber particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
              x: [0, Math.random() * 200 - 100],
              y: [0, Math.random() * 200 - 100]
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Glitch effects */}
      <motion.div
        className={`absolute inset-0 pointer-events-none ${glitchEffect ? 'opacity-100' : 'opacity-0'}`}
        animate={{
          background: glitchEffect ? [
            'linear-gradient(45deg, transparent 98%, rgba(255, 0, 0, 0.3) 100%)',
            'linear-gradient(45deg, transparent 98%, rgba(0, 255, 255, 0.3) 100%)',
            'linear-gradient(45deg, transparent 98%, rgba(255, 0, 255, 0.3) 100%)'
          ] : [
            'linear-gradient(45deg, transparent 98%, rgba(255, 0, 0, 0.1) 100%)',
            'linear-gradient(45deg, transparent 98%, rgba(0, 255, 255, 0.1) 100%)',
            'linear-gradient(45deg, transparent 98%, rgba(255, 0, 255, 0.1) 100%)'
          ]
        }}
        transition={{
          duration: 0.1,
          repeat: Infinity,
          repeatDelay: 5
        }}
      />

      {/* Enhanced Cyber Header */}
      <div className="relative z-10 p-4 border-b border-green-400/30 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(0, 255, 255, 0.5)',
                  '0 0 40px rgba(0, 255, 255, 0.8)',
                  '0 0 20px rgba(0, 255, 255, 0.5)'
                ]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <FaTerminal className="text-3xl text-cyan-400" />
            </motion.div>
            <div>
              <motion.h1
                className="text-2xl font-bold text-cyan-400 flex items-center"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(0, 255, 255, 0.8)',
                    '2px 0 0 rgba(255, 0, 0, 0.8), -2px 0 0 rgba(0, 255, 255, 0.8)',
                    '0 0 10px rgba(0, 255, 255, 0.8)'
                  ]
                }}
                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 4 }}
              >
                SECRET ALLEY
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-2 text-red-400"
                >
                  ●
                </motion.span>
              </motion.h1>
              <p className="text-sm opacity-70">UNDERGROUND PROTOCOL v4.0.0 | ENCRYPTED | LIVE</p>
              <div className="flex items-center space-x-4 mt-1 text-xs">
                <div className="flex items-center space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-green-400">
                    ID: {userSecretId || 'UNAUTHORIZED'}
                  </span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-yellow-400">
                  MASK LVL: {shadowStats.maskLevel}
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-purple-400">
                  XP: {shadowStats.shadowXP}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right text-xs opacity-70">
              <motion.div
                className="text-red-400 font-bold"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                EXIT: Type 'exit' in terminal
              </motion.div>
              <div className="text-cyan-400">HELP: Type 'help' for commands</div>
              <div className="text-gray-400">TERMINAL: Ready for input</div>
            </div>

            <motion.div
              className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center relative"
              animate={{
                rotate: [0, 360],
                boxShadow: [
                  '0 0 20px rgba(139, 92, 246, 0.5)',
                  '0 0 40px rgba(139, 92, 246, 0.8)',
                  '0 0 20px rgba(139, 92, 246, 0.5)'
                ]
              }}
              transition={{
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <FaSkull className="text-white text-xl" />
              <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content - Rich Scrollable Dashboard */}
      <div className="flex-1 overflow-y-auto custom-scrollbar" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#00ffff #000000'
      }}>
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #00ffff, #ff00ff);
            border-radius: 4px;
            border: 1px solid rgba(0, 255, 255, 0.3);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #00ffff, #ff00ff);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
          }
        `}</style>

        <div className="p-4 space-y-4">
          {/* Top Row - System Overview */}
          <div className="grid grid-cols-12 gap-4">

            {/* Shadow Terminal - Left Side */}
            <motion.div
              className="col-span-5 bg-black/80 border border-green-400/30 rounded-lg overflow-hidden"
              style={{ height: '400px' }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ShadowTerminal
                shadowProfile={shadowProfile}
                onCommand={handleTerminalCommand}
                embedded={true}
                className="h-full"
                userSecretId={userSecretId}
              />
            </motion.div>

            {/* Shadow Metrics - Top Center */}
            <motion.div
              className="col-span-4 bg-black/60 border border-purple-400/30 rounded-lg p-4"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-purple-400 font-bold text-sm mb-3 flex items-center">
                <FaSkull className="mr-2" />
                SHADOW METRICS
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-900/20 rounded p-2">
                  <div className="text-gray-400">Battles Won</div>
                  <div className="text-green-400 font-bold text-lg">{shadowStats.battlesWon}</div>
                </div>
                <div className="bg-purple-900/20 rounded p-2">
                  <div className="text-gray-400">Ciphers Solved</div>
                  <div className="text-purple-400 font-bold text-lg">{shadowStats.ciphersSolved}</div>
                </div>
                <div className="bg-purple-900/20 rounded p-2">
                  <div className="text-gray-400">Reputation</div>
                  <div className="text-yellow-400 font-bold text-lg">{shadowStats.reputation}</div>
                </div>
                <div className="bg-purple-900/20 rounded p-2">
                  <div className="text-gray-400">Suspicion</div>
                  <div className="text-red-400 font-bold text-lg">{shadowStats.suspicionLevel}%</div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-black/40 rounded">
                <div className="text-xs text-gray-400 mb-1">Shadow Level Progress</div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(shadowStats.shadowXP % 100)}%` }}
                    transition={{ duration: 2, delay: 1 }}
                  />
                </div>
                <div className="text-xs text-cyan-400 mt-1">{shadowStats.shadowXP} / {(Math.floor(shadowStats.shadowXP / 100) + 1) * 100} XP</div>
              </div>
            </motion.div>

            {/* System Status - Top Right */}
            <motion.div
              className="col-span-3 bg-black/60 border border-cyan-400/30 rounded-lg p-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-cyan-400 font-bold text-sm mb-3 flex items-center">
                <FaTerminal className="mr-2" />
                SYSTEM STATUS
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <motion.span
                    className="text-green-400"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ONLINE
                  </motion.span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Encryption</span>
                  <span className="text-green-400">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shadows</span>
                  <span className="text-cyan-400">127 ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Threat Level</span>
                  <span className="text-yellow-400">MODERATE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Breach</span>
                  <span className="text-red-400">3h ago</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-black/40 rounded">
                <div className="text-xs text-gray-400 mb-1">Server Load</div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-yellow-500 h-1 rounded-full"
                    animate={{ width: ['45%', '65%', '45%'] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Zone Grid - Full Width */}
          <motion.div
            className="grid grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {zones.map((zone, index) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)',
                  borderColor: 'rgba(0, 255, 255, 0.8)'
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleZoneClick(zone)}
                className={`relative bg-black/60 border border-cyan-400/30 rounded-lg p-4 cursor-pointer overflow-hidden group ${
                  activeZone === zone.id ? 'border-cyan-400' : ''
                }`}
              >
                {/* Cyber background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  zone.id === 'infiltration' ? 'from-red-900/20 to-orange-900/20' :
                  zone.id === 'arena' ? 'from-purple-900/20 to-pink-900/20' :
                  zone.id === 'cipher' ? 'from-blue-900/20 to-cyan-900/20' :
                  zone.id === 'whispers' ? 'from-green-900/20 to-teal-900/20' :
                  zone.id === 'forge' ? 'from-yellow-900/20 to-orange-900/20' :
                  zone.id === 'network' ? 'from-cyan-900/20 to-blue-900/20' :
                  'from-gray-900/20 to-black/20'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Animated border effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-lg border border-cyan-400/50 animate-pulse" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.5 }}
                    >
                      <zone.icon className="text-cyan-400 text-2xl" />
                    </motion.div>
                    <motion.div
                      className={`px-2 py-1 text-xs rounded ${
                        zone.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        zone.status === 'LIVE' ? 'bg-purple-500/20 text-purple-400' :
                        zone.status === 'SECURE' ? 'bg-blue-500/20 text-blue-400' :
                        zone.status === 'ELITE' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}
                      animate={zone.status === 'ACTIVE' ? {
                        boxShadow: [
                          '0 0 5px rgba(34, 197, 94, 0.5)',
                          '0 0 15px rgba(34, 197, 94, 0.8)',
                          '0 0 5px rgba(34, 197, 94, 0.5)'
                        ]
                      } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {zone.status}
                    </motion.div>
                  </div>

                  <motion.h3
                    className="text-white font-bold text-lg mb-2"
                    whileHover={{
                      textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    {zone.name}
                  </motion.h3>
                  <p className="text-xs opacity-70 mb-3">{zone.description}</p>

                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-70">{zone.participants} USERS</span>
                    <span className="text-cyan-400 font-bold">OPEN ACCESS</span>
                  </div>
                </div>

                {/* Enhanced loading overlay */}
                <AnimatePresence>
                  {activeZone === zone.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                          scale: { duration: 0.5, repeat: Infinity }
                        }}
                        className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
                      />
                      <motion.div
                        className="absolute text-cyan-400 text-xs font-bold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        CONNECTING...
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Recent Activity */}
            <div className="bg-black/60 border border-green-400/30 rounded-lg p-4">
              <h3 className="text-green-400 font-bold text-sm mb-3 flex items-center">
                <FaBolt className="mr-2" />
                LIVE ACTIVITY
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { user: 'SHADOW_HUNTER_42', action: 'entered Arena', time: '2s ago', color: 'text-purple-400' },
                  { user: 'CIPHER_MASTER_X', action: 'solved puzzle #47', time: '15s ago', color: 'text-blue-400' },
                  { user: 'VOID_WALKER_99', action: 'joined squad ALPHA', time: '32s ago', color: 'text-yellow-400' },
                  { user: 'GHOST_PROTOCOL_7', action: 'sent encrypted message', time: '1m ago', color: 'text-green-400' },
                  { user: 'NEON_BLADE_13', action: 'completed infiltration', time: '2m ago', color: 'text-red-400' }
                ].map((activity, i) => (
                  <motion.div
                    key={i}
                    className="flex justify-between items-center p-2 bg-black/30 rounded"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <div>
                      <span className={activity.color}>{activity.user}</span>
                      <span className="text-gray-400 ml-1">{activity.action}</span>
                    </div>
                    <span className="text-gray-500">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Network Map Preview */}
            <div className="bg-black/60 border border-cyan-400/30 rounded-lg p-4">
              <h3 className="text-cyan-400 font-bold text-sm mb-3 flex items-center">
                <FaTerminal className="mr-2" />
                NETWORK NODES
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-full h-8 rounded border ${
                      Math.random() > 0.3 ? 'border-green-400/50 bg-green-400/10' : 'border-red-400/50 bg-red-400/10'
                    } flex items-center justify-center text-xs`}
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [0.95, 1, 0.95]
                    }}
                    transition={{
                      duration: Math.random() * 2 + 1,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  >
                    {Math.random() > 0.3 ? '●' : '○'}
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Active Nodes:</span>
                  <span className="text-green-400">7/9</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Health:</span>
                  <span className="text-yellow-400">78%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Secret ID Generator Modal */}
      <AnimatePresence>
        {showSecretIdGenerator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            {/* Cyber background effects for modal */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`modal-particle-${i}`}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 2, 0]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 90 }}
              className="bg-black border-2 border-cyan-400 rounded-lg p-8 max-w-md mx-4 relative overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-purple-900/20" />

              {/* Glowing border effect */}
              <motion.div
                className="absolute inset-0 border-2 border-cyan-400 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.5)',
                    '0 0 40px rgba(0, 255, 255, 0.8)',
                    '0 0 20px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <div className="relative z-10 text-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    textShadow: [
                      '0 0 20px rgba(0, 255, 255, 0.8)',
                      '0 0 40px rgba(0, 255, 255, 1)',
                      '0 0 20px rgba(0, 255, 255, 0.8)'
                    ]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 2, repeat: Infinity },
                    textShadow: { duration: 2, repeat: Infinity }
                  }}
                >
                  <FaSkull className="text-cyan-400 text-5xl mx-auto mb-4" />
                </motion.div>

                <motion.h2
                  className="text-cyan-400 text-2xl font-bold mb-4 font-mono"
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(0, 255, 255, 0.8)',
                      '2px 0 0 rgba(255, 0, 0, 0.8), -2px 0 0 rgba(0, 255, 255, 0.8)',
                      '0 0 10px rgba(0, 255, 255, 0.8)'
                    ]
                  }}
                  transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                >
                  GENERATE SHADOW ID
                </motion.h2>

                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  To access the underground network, you need a unique Shadow ID.
                  This will be your encrypted identity in Secret Alley.
                </p>

                <motion.div
                  className="bg-black/50 border border-cyan-400/30 rounded p-3 mb-6"
                  animate={{
                    borderColor: [
                      'rgba(0, 255, 255, 0.3)',
                      'rgba(0, 255, 255, 0.8)',
                      'rgba(0, 255, 255, 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-xs text-gray-400 mb-2">Your Shadow ID will be:</div>
                  <motion.div
                    className="text-cyan-400 font-mono font-bold"
                    animate={{
                      textShadow: [
                        '0 0 5px rgba(0, 255, 255, 0.8)',
                        '0 0 15px rgba(0, 255, 255, 1)',
                        '0 0 5px rgba(0, 255, 255, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {generateSecretId()}
                  </motion.div>
                </motion.div>

                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createSecretId}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-purple-600 transition-all font-mono"
                >
                  INITIALIZE SHADOW PROTOCOL
                </motion.button>

                <p className="text-gray-500 text-xs mt-4">
                  ⚠️ Your ID will be encrypted and stored locally
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full bg-gradient-to-b from-cyan-500/10 via-transparent to-purple-500/10" />
      </div>
    </div>
  );
};

export default ShadowDashboard;
