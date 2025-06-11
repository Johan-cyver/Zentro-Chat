import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEye,
  FaGhost,
  FaCode,
  FaShieldAlt,
  FaMicrophone,
  FaMicrophoneSlash,
  FaUsers,
  FaClock,
  FaExclamationTriangle,
  FaSkull,
  FaVoteYea
} from 'react-icons/fa';

const DeceptionGameEngine = ({ shadowProfile, gameSession, onGameEnd }) => {
  const [gamePhase, setGamePhase] = useState('briefing'); // briefing, tasks, discussion, voting, results
  const [playerRole, setPlayerRole] = useState(null);
  const [activePlayers, setActivePlayers] = useState([]);
  const [gameTimer, setGameTimer] = useState(0);
  const [phaseTimer, setPhaseTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [votingResults, setVotingResults] = useState({});
  const [selectedVote, setSelectedVote] = useState(null);
  const [taskProgress, setTaskProgress] = useState({});
  const [sabotageEvents, setSabotageEvents] = useState([]);
  const [emergencyMeeting, setEmergencyMeeting] = useState(false);
  const [deadPlayers, setDeadPlayers] = useState([]);
  const [gameResults, setGameResults] = useState(null);

  // Game configuration
  const GAME_CONFIG = {
    taskPhaseTime: 180, // 3 minutes
    discussionTime: 120, // 2 minutes
    votingTime: 60, // 1 minute
    emergencyMeetings: 2,
    tasksToWin: 8,
    maxSabotages: 3
  };

  // Role definitions with enhanced abilities
  const ROLES = {
    ECHO: {
      name: 'Echo',
      color: 'text-green-400',
      icon: FaEye,
      description: 'Complete tasks and identify Ghosts',
      abilities: ['Complete Tasks', 'Call Emergency Meeting', 'Vote'],
      winCondition: 'Complete all tasks OR vote out all Ghosts'
    },
    GHOST: {
      name: 'Ghost',
      color: 'text-red-400',
      icon: FaGhost,
      description: 'Sabotage and eliminate Echoes',
      abilities: ['Sabotage Systems', 'Eliminate Players', 'Fake Tasks'],
      winCondition: 'Equal or outnumber Echoes OR critical sabotage'
    },
    CIPHER: {
      name: 'Cipher',
      color: 'text-purple-400',
      icon: FaCode,
      description: 'Decrypt logs and detect deception',
      abilities: ['Analyze Logs', 'Detect Lies', 'Verify Tasks'],
      winCondition: 'Help Echoes identify truth'
    },
    AGENT: {
      name: 'Agent',
      color: 'text-blue-400',
      icon: FaShieldAlt,
      description: 'Protect Echoes and gather intel',
      abilities: ['Shield Players', 'Scan Roles', 'Counter Sabotage'],
      winCondition: 'Protect team and eliminate threats'
    }
  };

  // Mock tasks for different zones
  const TASKS = {
    command_terminal: [
      { id: 'auth_sequence', name: 'Authentication Sequence', duration: 15 },
      { id: 'system_scan', name: 'System Diagnostic', duration: 20 },
      { id: 'log_analysis', name: 'Log Analysis', duration: 25 }
    ],
    data_vault: [
      { id: 'backup_data', name: 'Backup Critical Data', duration: 30 },
      { id: 'encrypt_files', name: 'Encrypt Sensitive Files', duration: 20 },
      { id: 'verify_integrity', name: 'Verify Data Integrity', duration: 15 }
    ],
    security_hub: [
      { id: 'update_firewall', name: 'Update Firewall Rules', duration: 25 },
      { id: 'patch_vulnerabilities', name: 'Patch Security Holes', duration: 35 },
      { id: 'monitor_intrusion', name: 'Monitor for Intrusions', duration: 20 }
    ]
  };

  useEffect(() => {
    initializeGame();
    startGameTimer();
  }, [gameSession]);

  useEffect(() => {
    // Phase timer countdown
    let timer;
    if (phaseTimer > 0) {
      timer = setInterval(() => {
        setPhaseTimer(prev => {
          if (prev <= 1) {
            handlePhaseTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phaseTimer, gamePhase]);

  const initializeGame = () => {
    // Assign roles randomly
    const roles = ['ECHO', 'ECHO', 'ECHO', 'ECHO', 'GHOST', 'GHOST', 'CIPHER', 'AGENT'];
    const shuffledRoles = roles.sort(() => Math.random() - 0.5);
    const assignedRole = shuffledRoles[0];
    
    setPlayerRole(ROLES[assignedRole]);
    
    // Initialize mock players
    const mockPlayers = [
      { id: shadowProfile?.shadowId, name: shadowProfile?.alias, role: assignedRole, alive: true, voted: false },
      { id: 'player_2', name: 'PHANTOM_BLADE', role: shuffledRoles[1], alive: true, voted: false },
      { id: 'player_3', name: 'VOID_HUNTER', role: shuffledRoles[2], alive: true, voted: false },
      { id: 'player_4', name: 'CIPHER_MASTER', role: shuffledRoles[3], alive: true, voted: false },
      { id: 'player_5', name: 'GHOST_WALKER', role: shuffledRoles[4], alive: true, voted: false },
      { id: 'player_6', name: 'NEON_STORM', role: shuffledRoles[5], alive: true, voted: false },
      { id: 'player_7', name: 'SHADOW_BLADE', role: shuffledRoles[6], alive: true, voted: false },
      { id: 'player_8', name: 'VOID_PHANTOM', role: shuffledRoles[7], alive: true, voted: false }
    ];
    
    setActivePlayers(mockPlayers);
    
    // Initialize task progress
    const initialProgress = {};
    Object.keys(TASKS).forEach(zone => {
      TASKS[zone].forEach(task => {
        initialProgress[task.id] = { completed: false, progress: 0 };
      });
    });
    setTaskProgress(initialProgress);
  };

  const startGameTimer = () => {
    setGameTimer(0);
    const timer = setInterval(() => {
      setGameTimer(prev => prev + 1);
    }, 1000);
    
    // Store timer reference for cleanup
    return () => clearInterval(timer);
  };

  const handlePhaseTimeout = () => {
    switch (gamePhase) {
      case 'tasks':
        startDiscussionPhase();
        break;
      case 'discussion':
        startVotingPhase();
        break;
      case 'voting':
        processVotingResults();
        break;
      default:
        break;
    }
  };

  const startTaskPhase = () => {
    setGamePhase('tasks');
    setPhaseTimer(GAME_CONFIG.taskPhaseTime);
    addSystemMessage('🎯 Task phase started. Complete your objectives!');
  };

  const startDiscussionPhase = () => {
    setGamePhase('discussion');
    setPhaseTimer(GAME_CONFIG.discussionTime);
    addSystemMessage('💬 Discussion phase. Share information and suspicions.');
  };

  const startVotingPhase = () => {
    setGamePhase('voting');
    setPhaseTimer(GAME_CONFIG.votingTime);
    setVotingResults({});
    setSelectedVote(null);
    addSystemMessage('🗳️ Voting phase. Choose who to eliminate.');
  };

  const processVotingResults = () => {
    // Simulate voting results
    const alivePlayers = activePlayers.filter(p => p.alive);
    const votes = {};
    
    alivePlayers.forEach(player => {
      const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      votes[target.id] = (votes[target.id] || 0) + 1;
    });
    
    // Find player with most votes
    const maxVotes = Math.max(...Object.values(votes));
    const eliminated = Object.keys(votes).find(id => votes[id] === maxVotes);
    
    if (eliminated) {
      const eliminatedPlayer = activePlayers.find(p => p.id === eliminated);
      setDeadPlayers(prev => [...prev, eliminatedPlayer]);
      setActivePlayers(prev => prev.map(p => 
        p.id === eliminated ? { ...p, alive: false } : p
      ));
      
      addSystemMessage(`💀 ${eliminatedPlayer.name} was eliminated. They were a ${ROLES[eliminatedPlayer.role].name}.`);
    }
    
    // Check win conditions
    checkWinConditions();
  };

  const checkWinConditions = () => {
    const alivePlayers = activePlayers.filter(p => p.alive);
    const aliveGhosts = alivePlayers.filter(p => p.role === 'GHOST');
    const aliveEchoes = alivePlayers.filter(p => p.role === 'ECHO' || p.role === 'CIPHER' || p.role === 'AGENT');
    
    const completedTasks = Object.values(taskProgress).filter(t => t.completed).length;
    
    if (aliveGhosts.length === 0) {
      endGame('ECHOES_WIN', 'All Ghosts eliminated!');
    } else if (aliveGhosts.length >= aliveEchoes.length) {
      endGame('GHOSTS_WIN', 'Ghosts equal or outnumber Echoes!');
    } else if (completedTasks >= GAME_CONFIG.tasksToWin) {
      endGame('ECHOES_WIN', 'All tasks completed!');
    } else {
      // Continue game
      setTimeout(() => startTaskPhase(), 3000);
    }
  };

  const endGame = (winner, reason) => {
    setGameResults({ winner, reason });
    setGamePhase('results');
    addSystemMessage(`🏆 Game Over: ${reason}`);
  };

  const addSystemMessage = (message) => {
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!currentMessage.trim()) return;
    
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      type: 'player',
      player: shadowProfile?.alias,
      message: currentMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);
    
    setCurrentMessage('');
  };

  const handleVote = (playerId) => {
    setSelectedVote(playerId);
    setVotingResults(prev => ({
      ...prev,
      [shadowProfile?.shadowId]: playerId
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Role briefing phase
  if (gamePhase === 'briefing') {
    return (
      <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900/90 border-2 border-cyan-400 rounded-lg p-8 max-w-2xl w-full mx-4"
          >
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <playerRole.icon className={`text-6xl mx-auto ${playerRole.color}`} />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-cyan-400 mb-2">ROLE ASSIGNMENT</h2>
              <h3 className={`text-2xl font-bold ${playerRole.color}`}>{playerRole.name}</h3>
              <p className="text-gray-300 mt-2">{playerRole.description}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-black/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-2">ABILITIES</h4>
                <ul className="space-y-1">
                  {playerRole.abilities.map((ability, index) => (
                    <li key={index} className="text-gray-300">• {ability}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-black/50 rounded-lg p-4">
                <h4 className="text-cyan-400 font-bold mb-2">WIN CONDITION</h4>
                <p className="text-gray-300">{playerRole.winCondition}</p>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3">
                <h4 className="text-yellow-400 font-bold mb-1">⚠️ REMEMBER</h4>
                <p className="text-yellow-300 text-sm">
                  Trust no one completely. Information is power. Deception is survival.
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startTaskPhase}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              🚀 BEGIN INFILTRATION
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Game header */}
      <div className="p-4 border-b border-cyan-400/30 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <playerRole.icon className={`text-xl ${playerRole.color}`} />
              <span className={`font-bold ${playerRole.color}`}>{playerRole.name}</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-cyan-400">
              Phase: <span className="font-bold uppercase">{gamePhase}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-cyan-400">
                <FaClock className="inline mr-1" />
                {formatTime(phaseTimer)}
              </div>
              <div className="text-xs text-gray-400">
                Game: {formatTime(gameTimer)}
              </div>
            </div>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded ${isMuted ? 'bg-red-600' : 'bg-green-600'} text-white`}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Main game area */}
        <div className="flex-1 p-4">
          {gamePhase === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-cyan-400">TASK PHASE</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(TASKS).map(([zone, tasks]) => (
                  <div key={zone} className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4">
                    <h4 className="text-cyan-400 font-bold mb-3 uppercase">{zone.replace('_', ' ')}</h4>
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className={`p-2 rounded border ${
                            taskProgress[task.id]?.completed
                              ? 'border-green-400 bg-green-900/20'
                              : 'border-gray-600 bg-gray-800/50 cursor-pointer hover:border-cyan-400'
                          }`}
                          onClick={() => {
                            if (!taskProgress[task.id]?.completed) {
                              // Simulate task completion
                              setTimeout(() => {
                                setTaskProgress(prev => ({
                                  ...prev,
                                  [task.id]: { completed: true, progress: 100 }
                                }));
                              }, task.duration * 100);
                            }
                          }}
                        >
                          <div className="text-sm font-bold">{task.name}</div>
                          <div className="text-xs text-gray-400">{task.duration}s</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gamePhase === 'voting' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-cyan-400">VOTING PHASE</h3>
              <div className="grid grid-cols-2 gap-4">
                {activePlayers.filter(p => p.alive).map(player => (
                  <motion.div
                    key={player.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleVote(player.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedVote === player.id
                        ? 'border-red-400 bg-red-900/20'
                        : 'border-gray-600 bg-gray-800/50 hover:border-cyan-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{player.name}</span>
                      {selectedVote === player.id && <FaVoteYea className="text-red-400" />}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {gamePhase === 'results' && gameResults && (
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">
                  {gameResults.winner === 'ECHOES_WIN' ? '🏆' : '💀'}
                </div>
                <h2 className="text-4xl font-bold text-cyan-400 mb-2">
                  {gameResults.winner === 'ECHOES_WIN' ? 'ECHOES WIN!' : 'GHOSTS WIN!'}
                </h2>
                <p className="text-xl text-gray-300 mb-8">{gameResults.reason}</p>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onGameEnd(gameResults)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
                >
                  RETURN TO ALLEY
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        <div className="w-80 border-l border-cyan-400/30 bg-black/50 flex flex-col">
          <div className="p-3 border-b border-cyan-400/30">
            <h4 className="font-bold text-cyan-400">SECURE COMMS</h4>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            {chatMessages.map(msg => (
              <div key={msg.id} className="text-sm">
                <div className="text-xs text-gray-500">[{msg.timestamp}]</div>
                <div className={msg.type === 'system' ? 'text-yellow-400' : 'text-white'}>
                  {msg.type === 'player' && <span className="text-cyan-400">{msg.player}: </span>}
                  {msg.message}
                </div>
              </div>
            ))}
          </div>
          
          {(gamePhase === 'discussion' || gamePhase === 'voting') && (
            <form onSubmit={sendChatMessage} className="p-3 border-t border-cyan-400/30">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Type message..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm"
                >
                  Send
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeceptionGameEngine;
