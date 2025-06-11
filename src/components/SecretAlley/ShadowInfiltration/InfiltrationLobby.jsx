import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSkull,
  FaEye,
  FaCode,
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaTerminal,
  FaGhost,
  FaCrown
} from 'react-icons/fa';

const InfiltrationLobby = ({ shadowProfile, onStartSession, onBack }) => {
  const [connectedShadows, setConnectedShadows] = useState([]);
  const [sessionStatus, setSessionStatus] = useState('waiting'); // waiting, ready, starting
  const [roleAssignment, setRoleAssignment] = useState(null);
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');
  const [timeToStart, setTimeToStart] = useState(null);

  // Role definitions with descriptions
  const roles = {
    ECHO: {
      name: 'Echo',
      icon: FaEye,
      color: 'text-green-400',
      description: 'Complete tasks and identify the Ghosts',
      objective: 'Survive and vote correctly',
      abilities: ['Task completion', 'Emergency meetings', 'Voting power']
    },
    GHOST: {
      name: 'Ghost',
      icon: FaGhost,
      color: 'text-red-400',
      description: 'Sabotage tasks and eliminate Echoes',
      objective: 'Outnumber Echoes or avoid detection',
      abilities: ['Sabotage systems', 'Forge logs', 'Silent elimination']
    },
    CIPHER: {
      name: 'Cipher',
      icon: FaCode,
      color: 'text-purple-400',
      description: 'Decrypt false logs and detect deception',
      objective: 'Help Echoes identify truth from lies',
      abilities: ['Log analysis', 'Encryption detection', 'Truth verification']
    },
    AGENT: {
      name: 'Agent',
      icon: FaShieldAlt,
      color: 'text-blue-400',
      description: 'Protect or expose other players',
      objective: 'Use protection/exposure strategically',
      abilities: ['Shield players', 'Expose identities', 'Information gathering']
    },
    GLITCH: {
      name: 'Glitch',
      icon: FaBolt,
      color: 'text-yellow-400',
      description: 'Chaos wildcard with unpredictable abilities',
      objective: 'Create chaos and survive',
      abilities: ['Random events', 'System disruption', 'Unpredictable actions']
    }
  };

  useEffect(() => {
    initializeLobby();
    const interval = setInterval(updateLobbyState, 2000);
    return () => clearInterval(interval);
  }, []);

  const initializeLobby = () => {
    // Generate lobby code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLobbyCode(code);

    // Mock connected shadows (in real implementation, this would be from Firebase)
    const mockShadows = [
      {
        shadowId: shadowProfile?.shadowId || 'UNKNOWN',
        alias: shadowProfile?.alias || 'UNKNOWN_SHADOW',
        maskLevel: shadowProfile?.maskLevel || 1,
        reputation: shadowProfile?.reputation || 0,
        isReady: false,
        isHost: true
      },
      {
        shadowId: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        maskLevel: 5,
        reputation: 1250,
        isReady: true,
        isHost: false
      },
      {
        shadowId: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        maskLevel: 8,
        reputation: 2100,
        isReady: true,
        isHost: false
      },
      {
        shadowId: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        maskLevel: 3,
        reputation: 750,
        isReady: false,
        isHost: false
      },
      {
        shadowId: 'GHOST_PROTOCOL_7',
        alias: 'GHOST_PROTOCOL_7',
        maskLevel: 7,
        reputation: 1800,
        isReady: true,
        isHost: false
      },
      {
        shadowId: 'NEON_STORM_666',
        alias: 'NEON_STORM_666',
        maskLevel: 4,
        reputation: 950,
        isReady: true,
        isHost: false
      }
    ];

    setConnectedShadows(mockShadows);
  };

  const updateLobbyState = () => {
    // Simulate dynamic lobby updates
    setConnectedShadows(prev => prev.map(shadow => ({
      ...shadow,
      isReady: shadow.isHost ? shadow.isReady : Math.random() > 0.3
    })));

    // Check if ready to start
    const readyCount = connectedShadows.filter(s => s.isReady).length;
    if (readyCount >= 6 && sessionStatus === 'waiting') {
      setSessionStatus('ready');
    }
  };

  const handleStartSession = () => {
    if (sessionStatus !== 'ready') return;
    
    setSessionStatus('starting');
    
    // Assign roles randomly
    const availableRoles = ['ECHO', 'ECHO', 'ECHO', 'ECHO', 'GHOST', 'GHOST', 'CIPHER', 'AGENT'];
    const shuffledRoles = availableRoles.sort(() => Math.random() - 0.5);
    const playerRole = shuffledRoles[0];
    
    setRoleAssignment(roles[playerRole]);
    setShowRoleReveal(true);
    
    // Start countdown
    setTimeToStart(5);
    const countdown = setInterval(() => {
      setTimeToStart(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          onStartSession(playerRole);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleReady = () => {
    setConnectedShadows(prev => prev.map(shadow => 
      shadow.shadowId === shadowProfile?.shadowId 
        ? { ...shadow, isReady: !shadow.isReady }
        : shadow
    ));
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background nodes */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-green-400/30 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-green-400 hover:text-cyan-400 transition-colors"
            >
              ← BACK TO ALLEY
            </button>
            <div>
              <h1 className="text-3xl font-bold text-red-400 flex items-center">
                <FaSkull className="mr-3" />
                SHADOW INFILTRATION
              </h1>
              <p className="text-sm opacity-70">Deception Protocol • Lobby Code: {lobbyCode}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-cyan-400 font-bold text-lg">
              {connectedShadows.length}/8 SHADOWS
            </div>
            <div className="text-xs opacity-70">
              Ready: {connectedShadows.filter(s => s.isReady).length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6 grid grid-cols-3 gap-6 h-full">
        
        {/* Connected Shadows */}
        <div className="col-span-2 bg-black/60 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold text-lg mb-4 flex items-center">
            <FaUsers className="mr-2" />
            CONNECTED SHADOWS
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {connectedShadows.map((shadow, index) => (
              <motion.div
                key={shadow.shadowId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-black/40 border rounded-lg p-3 ${
                  shadow.isReady ? 'border-green-400/50' : 'border-gray-600/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      shadow.isReady ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                    }`} />
                    <span className="text-sm font-bold text-cyan-400">
                      {shadow.alias}
                    </span>
                    {shadow.isHost && <FaCrown className="text-yellow-400 text-xs" />}
                  </div>
                </div>
                
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mask Level</span>
                    <span className="text-yellow-400">{shadow.maskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reputation</span>
                    <span className="text-purple-400">{shadow.reputation}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Session Controls */}
        <div className="bg-black/60 border border-red-400/30 rounded-lg p-4">
          <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center">
            <FaTerminal className="mr-2" />
            SESSION CONTROL
          </h3>
          
          <div className="space-y-4">
            <div className="bg-red-900/20 border border-red-400/30 rounded p-3">
              <div className="text-sm text-gray-300 mb-2">Status</div>
              <div className={`font-bold ${
                sessionStatus === 'waiting' ? 'text-yellow-400' :
                sessionStatus === 'ready' ? 'text-green-400' :
                'text-red-400'
              }`}>
                {sessionStatus === 'waiting' && 'WAITING FOR PLAYERS'}
                {sessionStatus === 'ready' && 'READY TO START'}
                {sessionStatus === 'starting' && 'INITIALIZING...'}
              </div>
            </div>

            <button
              onClick={toggleReady}
              className={`w-full py-3 rounded-lg font-bold transition-colors ${
                connectedShadows.find(s => s.shadowId === shadowProfile?.shadowId)?.isReady
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {connectedShadows.find(s => s.shadowId === shadowProfile?.shadowId)?.isReady 
                ? '✓ READY' : 'MARK READY'}
            </button>

            {sessionStatus === 'ready' && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartSession}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors"
              >
                🚀 START INFILTRATION
              </motion.button>
            )}
          </div>

          {/* Role Information */}
          <div className="mt-6 space-y-3">
            <h4 className="text-cyan-400 font-bold">POSSIBLE ROLES</h4>
            {Object.entries(roles).map(([key, role]) => (
              <div key={key} className="bg-black/40 border border-gray-600/30 rounded p-2">
                <div className="flex items-center space-x-2 mb-1">
                  {React.createElement(role.icon, { className: `${role.color} text-sm` })}
                  <span className={`${role.color} font-bold text-sm`}>{role.name}</span>
                </div>
                <p className="text-xs text-gray-400">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Reveal Modal */}
      <AnimatePresence>
        {showRoleReveal && roleAssignment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, rotateY: -180 }}
              animate={{ scale: 1, rotateY: 0 }}
              className="bg-black border-2 border-red-400 rounded-lg p-8 max-w-md mx-4 text-center"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {React.createElement(roleAssignment.icon, { className: `${roleAssignment.color} text-6xl mx-auto mb-4` })}
              </motion.div>
              
              <h2 className={`${roleAssignment.color} text-3xl font-bold mb-4`}>
                YOU ARE: {roleAssignment.name.toUpperCase()}
              </h2>
              
              <p className="text-gray-300 mb-4">{roleAssignment.description}</p>
              
              <div className="bg-black/50 border border-gray-600/30 rounded p-3 mb-4">
                <div className="text-sm text-gray-400 mb-2">OBJECTIVE:</div>
                <div className="text-green-400 font-bold">{roleAssignment.objective}</div>
              </div>

              <div className="text-xs text-gray-400 mb-4">
                ABILITIES: {roleAssignment.abilities.join(' • ')}
              </div>
              
              {timeToStart && (
                <div className="text-red-400 text-2xl font-bold">
                  STARTING IN {timeToStart}...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfiltrationLobby;
