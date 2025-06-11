import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCrown,
  FaEye,
  FaUsers,
  FaCode,
  FaShieldAlt,
  FaRocket,
  FaSkull,
  FaBolt,
  FaFire,
  FaGem,
  FaTerminal,
  FaLock,
  FaUnlock,
  FaBan,
  FaPlay,
  FaPause,
  FaStop,
  FaTrash,
  FaEdit,
  FaPlus,
  FaMinus,
  FaArrowUp,
  FaArrowDown,
  FaGlobe,
  FaDatabase,
  FaServer,
  FaCog,
  FaWifi,
  FaSignal
} from 'react-icons/fa';

const UltimateAdminControl = ({ onExit }) => {
  const [currentView, setCurrentView] = useState('godmode');
  const [selectedUser, setSelectedUser] = useState(null);
  const [systemStats, setSystemStats] = useState({});
  const [liveUsers, setLiveUsers] = useState([]);
  const [adminCommands, setAdminCommands] = useState([]);
  const [ghostMode, setGhostMode] = useState(true); // Always start in ghost mode
  const [godPowers, setGodPowers] = useState({
    userControl: true,
    systemControl: true,
    dataControl: true,
    networkControl: true,
    timeControl: true
  });
  const canvasRef = useRef(null);

  // ADMIN MODULES WITH COMPLETE CONTROL
  const ADMIN_MODULES = {
    godmode: {
      name: 'GOD MODE',
      icon: FaCrown,
      color: 'text-yellow-400',
      description: 'Ultimate system control'
    },
    surveillance: {
      name: 'SURVEILLANCE',
      icon: FaEye,
      color: 'text-red-400',
      description: 'Monitor all user activity'
    },
    manipulation: {
      name: 'USER CONTROL',
      icon: FaUsers,
      color: 'text-purple-400',
      description: 'Complete user manipulation'
    },
    system: {
      name: 'SYSTEM CORE',
      icon: FaServer,
      color: 'text-blue-400',
      description: 'Core system operations'
    },
    network: {
      name: 'NETWORK GRID',
      icon: FaGlobe,
      color: 'text-green-400',
      description: 'Network infrastructure'
    },
    data: {
      name: 'DATA VAULT',
      icon: FaDatabase,
      color: 'text-cyan-400',
      description: 'All data access'
    }
  };

  useEffect(() => {
    initializeGodMode();
    startMatrixEffect();
    enableGhostMode();
  }, []);

  const initializeGodMode = () => {
    console.log('👑 GOD MODE ACTIVATED');
    console.log('🔒 GHOST MODE: ENABLED');
    console.log('⚡ UNLIMITED POWER: GRANTED');

    // Load mock data for complete control
    loadLiveUsers();
    loadSystemData();
    startRealTimeMonitoring();
  };

  const startMatrixEffect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px arial';
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  };

  const loadSystemData = () => {
    setSystemStats({
      totalUsers: 1247,
      activeUsers: 892,
      systemLoad: 23.5,
      memoryUsage: 67.2,
      networkTraffic: 1.2,
      securityLevel: 'MAXIMUM',
      uptime: '47 days, 12 hours',
      dataProcessed: '2.4 TB',
      threatsBlocked: 156,
      adminActions: 89
    });
  };

  const loadLiveUsers = () => {
    const mockUsers = [
      {
        id: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        status: 'online',
        location: 'Infiltration Zone',
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        level: 5,
        xp: 2450,
        lastAction: 'Solving cipher',
        threat: 'low',
        permissions: ['basic'],
        realName: '[CLASSIFIED]'
      },
      {
        id: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        status: 'online',
        location: 'Arena',
        ip: '203.0.113.45',
        device: 'Firefox/Linux',
        level: 4,
        xp: 1890,
        lastAction: 'PvP Battle',
        threat: 'medium',
        permissions: ['basic'],
        realName: '[CLASSIFIED]'
      },
      {
        id: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        status: 'away',
        location: 'Project Hub',
        ip: '172.16.0.100',
        device: 'Safari/macOS',
        level: 7,
        xp: 4200,
        lastAction: 'Code review',
        threat: 'low',
        permissions: ['advanced'],
        realName: '[CLASSIFIED]'
      }
    ];

    setLiveUsers(mockUsers);
  };

  const startRealTimeMonitoring = () => {
    setInterval(() => {
      // Simulate real-time updates
      setLiveUsers(prev => prev.map(user => ({
        ...user,
        lastAction: getRandomAction(),
        status: Math.random() > 0.1 ? user.status : (user.status === 'online' ? 'away' : 'online')
      })));
    }, 5000);
  };

  const getRandomAction = () => {
    const actions = [
      'Solving cipher', 'PvP Battle', 'Code review', 'Squad formation',
      'Network scanning', 'Data mining', 'Faction war', 'Project development',
      'Skill training', 'Message encryption', 'System infiltration'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const enableGhostMode = () => {
    setGhostMode(true);
    console.log('👻 GHOST MODE: ALL TRACES ERASED');
  };

  // GOD MODE ACTIONS
  const executeGodAction = (action, target = null, value = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const command = {
      id: Date.now(),
      timestamp,
      action,
      target,
      value,
      status: 'executed'
    };

    setAdminCommands(prev => [command, ...prev.slice(0, 49)]);

    switch (action) {
      case 'GRANT_UNLIMITED_XP':
        console.log(`⚡ GRANTED UNLIMITED XP TO: ${target}`);
        break;
      case 'UNLOCK_ALL_ZONES':
        console.log(`🔓 UNLOCKED ALL ZONES FOR: ${target}`);
        break;
      case 'GRANT_GOD_PERMISSIONS':
        console.log(`👑 GRANTED GOD PERMISSIONS TO: ${target}`);
        break;
      case 'SYSTEM_SHUTDOWN':
        console.log(`🚨 SYSTEM SHUTDOWN INITIATED`);
        break;
      case 'WIPE_USER_DATA':
        console.log(`💀 WIPED ALL DATA FOR: ${target}`);
        break;
      case 'CLONE_USER':
        console.log(`👥 CLONED USER: ${target}`);
        break;
      case 'TELEPORT_USER':
        console.log(`🌀 TELEPORTED ${target} TO: ${value}`);
        break;
      case 'MODIFY_REALITY':
        console.log(`🌌 REALITY MODIFIED: ${value}`);
        break;
      default:
        console.log(`🔧 UNKNOWN GOD ACTION: ${action}`);
        break;
    }
  };

  const renderGodModePanel = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 215, 0, 0.5)',
                '0 0 60px rgba(255, 215, 0, 1)',
                '0 0 20px rgba(255, 215, 0, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mb-4"
          >
            <FaCrown className="text-4xl text-black" />
          </motion.div>
          <h2 className="text-3xl font-bold text-yellow-400">GOD MODE ACTIVATED</h2>
          <p className="text-gray-400">Ultimate control over Secret Alley</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Object.entries(systemStats).slice(0, 8).map(([key, value]) => (
            <div key={key} className="bg-black/50 border border-yellow-400/30 rounded-lg p-3">
              <div className="text-yellow-400 font-bold text-lg">{value}</div>
              <div className="text-gray-400 text-xs uppercase">{key.replace(/([A-Z])/g, ' $1')}</div>
            </div>
          ))}
        </div>

        {/* God Powers */}
        <div className="bg-black/50 border border-yellow-400/30 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center">
            <FaBolt className="mr-2" />
            GOD POWERS
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('GRANT_UNLIMITED_XP', 'ALL_USERS')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg font-bold"
            >
              ⚡ GRANT UNLIMITED XP
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('UNLOCK_ALL_ZONES', 'ALL_USERS')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg font-bold"
            >
              🔓 UNLOCK ALL ZONES
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('GRANT_GOD_PERMISSIONS', 'SELECTED_USER')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-bold"
            >
              👑 GRANT GOD STATUS
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('MODIFY_REALITY', 'MATRIX_GLITCH')}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-bold"
            >
              🌌 MODIFY REALITY
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('TELEPORT_USER', 'ALL_USERS', 'VOID_DIMENSION')}
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white px-4 py-3 rounded-lg font-bold"
            >
              🌀 MASS TELEPORT
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => executeGodAction('SYSTEM_SHUTDOWN', 'ENTIRE_NETWORK')}
              className="bg-gradient-to-r from-red-800 to-black text-white px-4 py-3 rounded-lg font-bold"
            >
              💀 SYSTEM SHUTDOWN
            </motion.button>
          </div>
        </div>

        {/* Live User Control */}
        <div className="bg-black/50 border border-yellow-400/30 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center">
            <FaUsers className="mr-2" />
            LIVE USER CONTROL
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {liveUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <div className="text-white font-bold">{user.alias}</div>
                    <div className="text-gray-400 text-xs">{user.location} • {user.lastAction}</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('GRANT_UNLIMITED_XP', user.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >
                    ⚡ XP
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('TELEPORT_USER', user.id, 'ADMIN_ZONE')}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                  >
                    🌀 TP
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('WIPE_USER_DATA', user.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                  >
                    💀 WIPE
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Command History */}
        <div className="bg-black/50 border border-yellow-400/30 rounded-lg p-6">
          <h3 className="text-yellow-400 font-bold mb-4 flex items-center">
            <FaTerminal className="mr-2" />
            COMMAND HISTORY
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto font-mono text-sm">
            {adminCommands.map(cmd => (
              <div key={cmd.id} className="text-green-400">
                [{cmd.timestamp}] {cmd.action} {cmd.target && `→ ${cmd.target}`} {cmd.value && `(${cmd.value})`}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Matrix Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-20"
        style={{ zIndex: 1 }}
      />

      {/* Main Interface */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-yellow-400/30 bg-black/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                    '0 0 40px rgba(255, 215, 0, 0.8)',
                    '0 0 20px rgba(255, 215, 0, 0.5)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <FaCrown className="text-3xl text-black" />
              </motion.div>
              
              <div>
                <h1 className="text-3xl font-bold text-yellow-400">ULTIMATE ADMIN CONTROL</h1>
                <p className="text-gray-400">Architect • God Mode • Unlimited Power</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-green-400 font-bold">👻 GHOST MODE: ACTIVE</div>
                <div className="text-yellow-400 font-bold">⚡ UNLIMITED POWER</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold"
              >
                EXIT GOD MODE
              </motion.button>
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="p-6 border-b border-yellow-400/30 bg-black/80 backdrop-blur-sm">
          <div className="flex space-x-4 overflow-x-auto">
            {Object.entries(ADMIN_MODULES).map(([key, module]) => {
              const ModuleIcon = module.icon;
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentView(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                    currentView === key
                      ? 'bg-yellow-600 text-black'
                      : `bg-gray-800 ${module.color} hover:bg-gray-700`
                  }`}
                >
                  <ModuleIcon />
                  <span>{module.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentView === 'godmode' && renderGodModePanel()}
              {currentView !== 'godmode' && (
                <div className="text-center text-gray-400 py-20">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-bold mb-2">MODULE UNDER CONSTRUCTION</h3>
                  <p>This god-tier module is being crafted...</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default UltimateAdminControl;
