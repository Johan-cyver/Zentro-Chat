import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDatabase,
  FaCode,
  FaWifi,
  FaTerminal,
  FaShieldAlt,
  FaBolt,
  FaEye,
  FaSkull,
  FaExclamationTriangle,
  FaLock
} from 'react-icons/fa';

const MissionMap = ({ 
  shadowProfile, 
  playerRole, 
  onTaskComplete, 
  onSabotage, 
  onEmergencyMeeting, 
  onBack,
  gameState 
}) => {
  const [currentZone, setCurrentZone] = useState('command_terminal');
  const [playerPositions, setPlayerPositions] = useState({});
  const [activeTasks, setActiveTasks] = useState([]);
  const [sabotageEvents, setSabotageEvents] = useState([]);
  const [movementCooldown, setMovementCooldown] = useState(false);
  const [showTaskInterface, setShowTaskInterface] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Zone definitions with tasks and sabotage points
  const zones = {
    command_terminal: {
      name: 'Command Terminal',
      icon: FaTerminal,
      color: 'text-green-400',
      position: { x: 50, y: 20 },
      tasks: [
        { id: 'cmd_auth', name: 'Authenticate Access', type: 'sequence', difficulty: 'easy' },
        { id: 'cmd_scan', name: 'System Scan', type: 'timer', difficulty: 'medium' }
      ],
      sabotagePoints: ['disable_auth', 'corrupt_logs'],
      connections: ['data_vault', 'whisper_node']
    },
    data_vault: {
      name: 'Data Vault',
      icon: FaDatabase,
      color: 'text-blue-400',
      position: { x: 20, y: 50 },
      tasks: [
        { id: 'vault_backup', name: 'Backup Critical Data', type: 'puzzle', difficulty: 'hard' },
        { id: 'vault_verify', name: 'Verify Integrity', type: 'sequence', difficulty: 'medium' }
      ],
      sabotagePoints: ['corrupt_data', 'lock_vault'],
      connections: ['command_terminal', 'cipher_room']
    },
    cipher_room: {
      name: 'Cipher Room',
      icon: FaCode,
      color: 'text-purple-400',
      position: { x: 20, y: 80 },
      tasks: [
        { id: 'cipher_decode', name: 'Decode Messages', type: 'cipher', difficulty: 'hard' },
        { id: 'cipher_encrypt', name: 'Encrypt Logs', type: 'puzzle', difficulty: 'medium' }
      ],
      sabotagePoints: ['scramble_cipher', 'false_decode'],
      connections: ['data_vault', 'whisper_node']
    },
    whisper_node: {
      name: 'Whisper Node',
      icon: FaWifi,
      color: 'text-cyan-400',
      position: { x: 80, y: 50 },
      tasks: [
        { id: 'whisper_relay', name: 'Relay Messages', type: 'timer', difficulty: 'easy' },
        { id: 'whisper_secure', name: 'Secure Channel', type: 'sequence', difficulty: 'medium' }
      ],
      sabotagePoints: ['jam_signals', 'intercept_whispers'],
      connections: ['command_terminal', 'cipher_room']
    }
  };

  useEffect(() => {
    initializeGame();
    const interval = setInterval(updateGameState, 2000);
    return () => clearInterval(interval);
  }, []);

  const initializeGame = () => {
    // Initialize player positions
    const positions = {};
    const playerIds = ['PHANTOM_BLADE_777', 'CIPHER_MASTER_X', 'VOID_HUNTER_123', 'GHOST_PROTOCOL_7', 'NEON_STORM_666'];
    
    playerIds.forEach(id => {
      const zoneKeys = Object.keys(zones);
      positions[id] = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
    });
    
    positions[shadowProfile?.shadowId] = currentZone;
    setPlayerPositions(positions);

    // Initialize tasks
    const allTasks = [];
    Object.entries(zones).forEach(([zoneId, zone]) => {
      zone.tasks.forEach(task => {
        allTasks.push({
          ...task,
          zoneId,
          completed: false,
          assignedTo: null
        });
      });
    });
    setActiveTasks(allTasks);
  };

  const updateGameState = () => {
    // Simulate other players moving
    setPlayerPositions(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(playerId => {
        if (playerId !== shadowProfile?.shadowId && Math.random() < 0.3) {
          const zoneKeys = Object.keys(zones);
          updated[playerId] = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
        }
      });
      return updated;
    });

    // Simulate sabotage events for Ghost players
    if (Math.random() < 0.1) {
      const sabotageZones = Object.keys(zones);
      const randomZone = sabotageZones[Math.floor(Math.random() * sabotageZones.length)];
      const zone = zones[randomZone];
      const randomSabotage = zone.sabotagePoints[Math.floor(Math.random() * zone.sabotagePoints.length)];
      
      setSabotageEvents(prev => [...prev, {
        id: Date.now(),
        zone: randomZone,
        type: randomSabotage,
        timestamp: Date.now()
      }]);
    }
  };

  const handleZoneMove = (targetZone) => {
    if (movementCooldown) return;
    if (!zones[currentZone].connections.includes(targetZone)) return;

    setMovementCooldown(true);
    setCurrentZone(targetZone);
    
    setPlayerPositions(prev => ({
      ...prev,
      [shadowProfile?.shadowId]: targetZone
    }));

    setTimeout(() => setMovementCooldown(false), 2000);
  };

  const handleTaskClick = (task) => {
    if (task.zoneId !== currentZone) return;
    if (task.completed) return;
    
    setSelectedTask(task);
    setShowTaskInterface(true);
  };

  const handleTaskComplete = (taskId) => {
    setActiveTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ));
    setShowTaskInterface(false);
    setSelectedTask(null);
    onTaskComplete(taskId);
  };

  const handleSabotage = (sabotageType) => {
    if (playerRole !== 'GHOST') return;
    
    const zone = zones[currentZone];
    if (!zone.sabotagePoints.includes(sabotageType)) return;

    setSabotageEvents(prev => [...prev, {
      id: Date.now(),
      zone: currentZone,
      type: sabotageType,
      timestamp: Date.now(),
      causedBy: shadowProfile?.shadowId
    }]);

    onSabotage(sabotageType, currentZone);
  };

  const getPlayersInZone = (zoneId) => {
    return Object.entries(playerPositions)
      .filter(([playerId, zone]) => zone === zoneId)
      .map(([playerId]) => playerId);
  };

  const getZoneTaskCount = (zoneId) => {
    const zoneTasks = activeTasks.filter(task => task.zoneId === zoneId);
    const completed = zoneTasks.filter(task => task.completed).length;
    return { total: zoneTasks.length, completed };
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-green-400/30 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onEmergencyMeeting}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors"
            >
              🚨 EMERGENCY
            </button>
            <div>
              <h1 className="text-xl font-bold text-cyan-400">MISSION MAP</h1>
              <p className="text-xs opacity-70">
                Role: <span className="text-yellow-400">{playerRole}</span> | 
                Zone: <span className="text-green-400">{zones[currentZone].name}</span>
              </p>
            </div>
          </div>
          
          <div className="text-right text-sm">
            <div className="text-green-400">
              Tasks: {activeTasks.filter(t => t.completed).length}/{activeTasks.length}
            </div>
            <div className="text-red-400">
              Sabotages: {sabotageEvents.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative z-10 flex-1 p-6">
        <div className="relative w-full h-full bg-black/30 rounded-lg border border-green-400/30 overflow-hidden">
          
          {/* Zone Connections */}
          <svg className="absolute inset-0 w-full h-full">
            {Object.entries(zones).map(([zoneId, zone]) => 
              zone.connections.map(connectedZoneId => {
                const connectedZone = zones[connectedZoneId];
                return (
                  <motion.line
                    key={`${zoneId}-${connectedZoneId}`}
                    x1={`${zone.position.x}%`}
                    y1={`${zone.position.y}%`}
                    x2={`${connectedZone.position.x}%`}
                    y2={`${connectedZone.position.y}%`}
                    stroke="#10B981"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                );
              })
            )}
          </svg>

          {/* Zones */}
          {Object.entries(zones).map(([zoneId, zone]) => {
            const playersHere = getPlayersInZone(zoneId);
            const taskCount = getZoneTaskCount(zoneId);
            const isCurrentZone = zoneId === currentZone;
            const canMoveTo = zones[currentZone].connections.includes(zoneId);
            const hasSabotage = sabotageEvents.some(s => s.zone === zoneId);

            return (
              <motion.div
                key={zoneId}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                  isCurrentZone ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${zone.position.x}%`,
                  top: `${zone.position.y}%`
                }}
                whileHover={{ scale: 1.1 }}
                onClick={() => canMoveTo && handleZoneMove(zoneId)}
              >
                <div className={`relative w-20 h-20 rounded-full border-2 ${
                  isCurrentZone 
                    ? 'border-cyan-400 bg-cyan-400/20' 
                    : canMoveTo 
                      ? 'border-green-400 bg-green-400/10 hover:bg-green-400/20' 
                      : 'border-gray-600 bg-gray-600/10'
                } flex items-center justify-center transition-all`}>

                  {React.createElement(zone.icon, { className: `text-2xl ${zone.color}` })}

                  {/* Sabotage indicator */}
                  {hasSabotage && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <FaExclamationTriangle className="text-white text-xs" />
                    </div>
                  )}
                  
                  {/* Player count */}
                  {playersHere.length > 0 && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {playersHere.length}
                    </div>
                  )}
                  
                  {/* Task progress */}
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    {taskCount.completed}/{taskCount.total}
                  </div>
                </div>
                
                <div className="text-xs text-center mt-2 max-w-20">
                  {zone.name}
                </div>
              </motion.div>
            );
          })}

          {/* Player indicators */}
          {Object.entries(playerPositions).map(([playerId, zoneId]) => {
            if (playerId === shadowProfile?.shadowId) return null;
            
            const zone = zones[zoneId];
            const playersInSameZone = getPlayersInZone(zoneId);
            const playerIndex = playersInSameZone.indexOf(playerId);
            
            return (
              <motion.div
                key={playerId}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full"
                style={{
                  left: `calc(${zone.position.x}% + ${(playerIndex - 1) * 15}px)`,
                  top: `calc(${zone.position.y}% + 30px)`
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              />
            );
          })}
        </div>

        {/* Current Zone Info Panel */}
        <div className="absolute bottom-4 left-4 w-80 bg-black/80 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-green-400 font-bold mb-3 flex items-center">
            {React.createElement(zones[currentZone].icon, { className: "mr-2" })}
            {zones[currentZone].name}
          </h3>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Players here:</span>
              <span className="text-cyan-400 ml-2">{getPlayersInZone(currentZone).length}</span>
            </div>
            
            <div>
              <span className="text-gray-400">Available tasks:</span>
              <div className="mt-1 space-y-1">
                {zones[currentZone].tasks.map(task => {
                  const taskData = activeTasks.find(t => t.id === task.id);
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(taskData)}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${
                        taskData?.completed 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                      }`}
                    >
                      {taskData?.completed ? '✓' : '○'} {task.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {playerRole === 'GHOST' && (
              <div>
                <span className="text-red-400">Sabotage options:</span>
                <div className="mt-1 space-y-1">
                  {zones[currentZone].sabotagePoints.map(sabotage => (
                    <button
                      key={sabotage}
                      onClick={() => handleSabotage(sabotage)}
                      className="block w-full text-left px-2 py-1 rounded text-xs bg-red-900/30 text-red-400 hover:bg-red-900/50"
                    >
                      💀 {sabotage.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Interface Modal */}
      <AnimatePresence>
        {showTaskInterface && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black border-2 border-green-400 rounded-lg p-6 max-w-md mx-4"
            >
              <h3 className="text-green-400 font-bold text-lg mb-4">
                {selectedTask.name}
              </h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Task Type: {selectedTask.type}</div>
                <div className="text-sm text-gray-400 mb-4">Difficulty: {selectedTask.difficulty}</div>
                
                {/* Simple task simulation */}
                <div className="bg-green-900/20 border border-green-400/30 rounded p-3 text-center">
                  <div className="text-green-400 mb-2">Simulating task...</div>
                  <motion.div
                    className="w-full bg-gray-700 rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                  >
                    <div className="bg-green-400 h-2 rounded-full" />
                  </motion.div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleTaskComplete(selectedTask.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold"
                >
                  COMPLETE TASK
                </button>
                <button
                  onClick={() => setShowTaskInterface(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded font-bold"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionMap;
