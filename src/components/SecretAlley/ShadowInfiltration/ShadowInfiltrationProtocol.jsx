import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiltrationLobby from './InfiltrationLobby';
import MissionMap from './MissionMap';
import CommandTerminal from './CommandTerminal';
import RevealSequence from './RevealSequence';

const ShadowInfiltrationProtocol = ({ shadowProfile, onBack, onUpdateProfile }) => {
  const [gamePhase, setGamePhase] = useState('lobby'); // lobby, mission, voting, reveal, complete
  const [playerRole, setPlayerRole] = useState(null);
  const [gameState, setGameState] = useState({
    connectedPlayers: [],
    actionLogs: [],
    completedTasks: [],
    sabotageEvents: [],
    votes: {},
    timeRemaining: 0,
    round: 1
  });
  const [sessionResults, setSessionResults] = useState(null);

  useEffect(() => {
    initializeGameState();
  }, []);

  const initializeGameState = () => {
    // Initialize with mock players for demo
    const mockPlayers = [
      {
        shadowId: shadowProfile?.shadowId || 'UNKNOWN',
        alias: shadowProfile?.alias || 'UNKNOWN_SHADOW',
        maskLevel: shadowProfile?.maskLevel || 1,
        reputation: shadowProfile?.reputation || 0,
        isReady: false,
        isHost: true,
        isAlive: true
      },
      {
        shadowId: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        maskLevel: 5,
        reputation: 1250,
        isReady: true,
        isHost: false,
        isAlive: true
      },
      {
        shadowId: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        maskLevel: 8,
        reputation: 2100,
        isReady: true,
        isHost: false,
        isAlive: true
      },
      {
        shadowId: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        maskLevel: 3,
        reputation: 750,
        isReady: false,
        isHost: false,
        isAlive: true
      },
      {
        shadowId: 'GHOST_PROTOCOL_7',
        alias: 'GHOST_PROTOCOL_7',
        maskLevel: 7,
        reputation: 1800,
        isReady: true,
        isHost: false,
        isAlive: true
      },
      {
        shadowId: 'NEON_STORM_666',
        alias: 'NEON_STORM_666',
        maskLevel: 4,
        reputation: 950,
        isReady: true,
        isHost: false,
        isAlive: true
      }
    ];

    setGameState(prev => ({
      ...prev,
      connectedPlayers: mockPlayers
    }));
  };

  const handleStartSession = (assignedRole) => {
    setPlayerRole(assignedRole);
    setGamePhase('mission');
    
    // Initialize mission timer (5 minutes for tasks)
    setGameState(prev => ({
      ...prev,
      timeRemaining: 300,
      actionLogs: [{
        id: Date.now(),
        playerId: 'SYSTEM',
        type: 'system',
        action: 'Mission started - Complete tasks and identify threats',
        timestamp: Date.now(),
        zone: 'SYSTEM'
      }]
    }));

    // Start game timer
    const timer = setInterval(() => {
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        
        // Auto-trigger voting phase when time runs low or emergency called
        if (newTime <= 120 && gamePhase === 'mission') {
          setGamePhase('voting');
          return { ...prev, timeRemaining: 60 }; // 1 minute for voting
        }
        
        // End voting phase
        if (newTime <= 0 && gamePhase === 'voting') {
          setGamePhase('reveal');
          clearInterval(timer);
          return { ...prev, timeRemaining: 0 };
        }
        
        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);
  };

  const handleTaskComplete = (taskId) => {
    const newLog = {
      id: Date.now(),
      playerId: shadowProfile?.shadowId,
      type: 'task_complete',
      action: `Completed task: ${taskId}`,
      timestamp: Date.now(),
      zone: 'current_zone'
    };

    setGameState(prev => ({
      ...prev,
      completedTasks: [...prev.completedTasks, taskId],
      actionLogs: [...prev.actionLogs, newLog]
    }));

    // Award XP for task completion
    updatePlayerStats('taskComplete');
  };

  const handleSabotage = (sabotageType, zone) => {
    const newLog = {
      id: Date.now(),
      playerId: 'UNKNOWN', // Sabotage is anonymous
      type: 'sabotage',
      action: `Sabotage detected: ${sabotageType}`,
      timestamp: Date.now(),
      zone: zone
    };

    setGameState(prev => ({
      ...prev,
      sabotageEvents: [...prev.sabotageEvents, { type: sabotageType, zone, timestamp: Date.now() }],
      actionLogs: [...prev.actionLogs, newLog]
    }));
  };

  const handleEmergencyMeeting = () => {
    if (gamePhase !== 'mission') return;
    
    setGamePhase('voting');
    setGameState(prev => ({
      ...prev,
      timeRemaining: 90, // 1.5 minutes for emergency voting
      actionLogs: [...prev.actionLogs, {
        id: Date.now(),
        playerId: shadowProfile?.shadowId,
        type: 'emergency',
        action: 'Called emergency meeting',
        timestamp: Date.now(),
        zone: 'SYSTEM'
      }]
    }));
  };

  const handleVote = (targetPlayerId) => {
    setGameState(prev => ({
      ...prev,
      votes: {
        ...prev.votes,
        [shadowProfile?.shadowId]: targetPlayerId
      }
    }));
  };

  const handleDiscussion = (message) => {
    const newLog = {
      id: Date.now(),
      playerId: 'ANONYMOUS', // Discussion is anonymous
      type: 'discussion',
      action: `Discussion: ${message}`,
      timestamp: Date.now(),
      zone: 'TERMINAL'
    };

    setGameState(prev => ({
      ...prev,
      actionLogs: [...prev.actionLogs, newLog]
    }));
  };

  const handleRevealComplete = (results) => {
    setSessionResults(results);
    setGamePhase('complete');
    
    // Update player profile based on results
    updatePlayerStats('sessionComplete', results);
  };

  const updatePlayerStats = (action, results = null) => {
    if (!onUpdateProfile) return;

    let updates = {};

    switch (action) {
      case 'taskComplete':
        updates = {
          shadowXP: (shadowProfile?.shadowXP || 0) + 10,
          reputation: (shadowProfile?.reputation || 0) + 5
        };
        break;
        
      case 'sessionComplete':
        if (results) {
          const baseXP = 50;
          const winBonus = results.playerWon ? 100 : 25;
          const roleBonus = playerRole === 'GHOST' ? 25 : 15;
          
          updates = {
            shadowXP: (shadowProfile?.shadowXP || 0) + baseXP + winBonus + roleBonus,
            reputation: (shadowProfile?.reputation || 0) + (results.playerWon ? 50 : 10),
            battlesWon: results.playerWon ? (shadowProfile?.battlesWon || 0) + 1 : shadowProfile?.battlesWon || 0
          };

          // Mask level progression
          const newXP = updates.shadowXP;
          const newMaskLevel = Math.floor(newXP / 500) + 1;
          if (newMaskLevel > (shadowProfile?.maskLevel || 1)) {
            updates.maskLevel = Math.min(newMaskLevel, 10);
          }
        }
        break;
    }

    onUpdateProfile(updates);
  };

  const handleBackToAlley = () => {
    setGamePhase('lobby');
    setPlayerRole(null);
    setSessionResults(null);
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black">
      <AnimatePresence mode="wait">
        
        {/* Lobby Phase */}
        {gamePhase === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InfiltrationLobby
              shadowProfile={shadowProfile}
              onStartSession={handleStartSession}
              onBack={handleBackToAlley}
            />
          </motion.div>
        )}

        {/* Mission Phase */}
        {gamePhase === 'mission' && (
          <motion.div
            key="mission"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <MissionMap
              shadowProfile={shadowProfile}
              playerRole={playerRole}
              onTaskComplete={handleTaskComplete}
              onSabotage={handleSabotage}
              onEmergencyMeeting={handleEmergencyMeeting}
              onBack={() => setGamePhase('voting')}
              gameState={gameState}
            />
          </motion.div>
        )}

        {/* Voting Phase */}
        {gamePhase === 'voting' && (
          <motion.div
            key="voting"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <CommandTerminal
              shadowProfile={shadowProfile}
              playerRole={playerRole}
              connectedPlayers={gameState.connectedPlayers}
              actionLogs={gameState.actionLogs}
              onVote={handleVote}
              onDiscussion={handleDiscussion}
              onBack={() => setGamePhase('mission')}
              votingPhase={true}
              timeRemaining={gameState.timeRemaining}
            />
          </motion.div>
        )}

        {/* Reveal Phase */}
        {gamePhase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RevealSequence
              shadowProfile={shadowProfile}
              playerRole={playerRole}
              gameState={gameState}
              onComplete={handleRevealComplete}
            />
          </motion.div>
        )}

        {/* Session Complete */}
        {gamePhase === 'complete' && sessionResults && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
          >
            <div className="bg-black border-2 border-cyan-400 rounded-lg p-8 max-w-2xl mx-4 text-center">
              <h2 className="text-3xl font-bold text-cyan-400 mb-6">
                SESSION COMPLETE
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-green-900/20 border border-green-400/30 rounded p-4">
                  <h3 className="text-green-400 font-bold mb-2">XP GAINED</h3>
                  <div className="text-2xl text-green-400">+{sessionResults.xpGained}</div>
                </div>
                
                <div className="bg-purple-900/20 border border-purple-400/30 rounded p-4">
                  <h3 className="text-purple-400 font-bold mb-2">REPUTATION</h3>
                  <div className="text-2xl text-purple-400">+{sessionResults.reputationGained}</div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-yellow-400 font-bold mb-4">SESSION SUMMARY</h3>
                <div className="text-gray-300 space-y-2">
                  <div>Role: <span className="text-cyan-400">{playerRole}</span></div>
                  <div>Result: <span className={sessionResults.playerWon ? 'text-green-400' : 'text-red-400'}>
                    {sessionResults.playerWon ? 'VICTORY' : 'DEFEAT'}
                  </span></div>
                  <div>Tasks Completed: <span className="text-blue-400">{gameState.completedTasks.length}</span></div>
                  <div>Sabotages Detected: <span className="text-red-400">{gameState.sabotageEvents.length}</span></div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setGamePhase('lobby')}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold"
                >
                  PLAY AGAIN
                </button>
                <button
                  onClick={handleBackToAlley}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-bold"
                >
                  RETURN TO ALLEY
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShadowInfiltrationProtocol;
