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
  FaSignal,
  FaTimes,
  FaExpand,
  FaCompress
} from 'react-icons/fa';

const FullPageAdminControl = ({ onExit }) => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [liveUsers, setLiveUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [adminCommands, setAdminCommands] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const matrixCanvasRef = useRef(null);

  // Initialize admin system
  useEffect(() => {
    initializeAdminSystem();
    startMatrixBackground();
    startRealTimeUpdates();
  }, []);

  const initializeAdminSystem = () => {
    console.log('🚀 FULL-PAGE ADMIN SYSTEM INITIALIZED');
    console.log('👑 GOD MODE: UNLIMITED POWER GRANTED');
    console.log('👻 GHOST MODE: PERMANENTLY ACTIVE');

    // Load initial data
    loadLiveUsers();
    loadSystemStats();

    // Add welcome notification
    addNotification('👑 SUPREME ARCHITECT ACCESS GRANTED', 'success');
    addNotification('👻 GHOST MODE: ALL TRACES ERASED', 'info');
    addNotification('⚡ UNLIMITED POWER: ACTIVATED', 'warning');
  };

  const startMatrixBackground = () => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ADMIN CONTROL SYSTEM ARCHITECT GOD MODE UNLIMITED POWER 01234567890";
    const matrixArray = matrix.split("");
    const fontSize = 12;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#00ff41';
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  };

  const loadSystemStats = () => {
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
      adminActions: 89,
      cpuUsage: 45.3,
      diskSpace: 78.9,
      bandwidth: 95.2,
      connections: 2847
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
        realName: '[CLASSIFIED]',
        joinTime: '2 hours ago',
        sessionTime: '1h 45m'
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
        realName: '[CLASSIFIED]',
        joinTime: '45 minutes ago',
        sessionTime: '32m'
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
        realName: '[CLASSIFIED]',
        joinTime: '3 hours ago',
        sessionTime: '2h 15m'
      },
      {
        id: 'SHADOW_ARCHITECT',
        alias: 'SHADOW_ARCHITECT',
        status: 'online',
        location: 'Faction Wars',
        ip: '10.0.0.1',
        device: 'Edge/Windows',
        level: 9,
        xp: 8750,
        lastAction: 'Territory control',
        threat: 'high',
        permissions: ['admin'],
        realName: '[CLASSIFIED]',
        joinTime: '6 hours ago',
        sessionTime: '5h 30m'
      }
    ];

    setLiveUsers(mockUsers);
  };

  const startRealTimeUpdates = () => {
    setInterval(() => {
      // Update user activities
      setLiveUsers(prev => prev.map(user => ({
        ...user,
        lastAction: getRandomAction(),
        status: Math.random() > 0.1 ? user.status : (user.status === 'online' ? 'away' : 'online')
      })));

      // Update system stats
      setSystemStats(prev => ({
        ...prev,
        systemLoad: (Math.random() * 50 + 10).toFixed(1),
        memoryUsage: (Math.random() * 30 + 50).toFixed(1),
        networkTraffic: (Math.random() * 2 + 0.5).toFixed(1),
        cpuUsage: (Math.random() * 40 + 30).toFixed(1)
      }));
    }, 3000);
  };

  const getRandomAction = () => {
    const actions = [
      'Solving cipher', 'PvP Battle', 'Code review', 'Squad formation',
      'Network scanning', 'Data mining', 'Faction war', 'Project development',
      'Skill training', 'Message encryption', 'System infiltration', 'Territory capture'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
  };

  const executeGodAction = (action, target = null, value = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const command = {
      id: Date.now(),
      timestamp,
      action,
      target,
      value,
      status: 'executed',
      result: 'success'
    };

    setAdminCommands(prev => [command, ...prev.slice(0, 99)]);

    // Add notification
    addNotification(`⚡ ${action} executed on ${target || 'system'}`, 'success');

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
        addNotification('🚨 SYSTEM SHUTDOWN INITIATED', 'error');
        break;
      case 'WIPE_USER_DATA':
        console.log(`💀 WIPED ALL DATA FOR: ${target}`);
        addNotification(`💀 USER DATA WIPED: ${target}`, 'warning');
        break;
      case 'TELEPORT_USER':
        console.log(`🌀 TELEPORTED ${target} TO: ${value}`);
        break;
      case 'MODIFY_REALITY':
        console.log(`🌌 REALITY MODIFIED: ${value}`);
        addNotification('🌌 REALITY MATRIX ALTERED', 'warning');
        break;
      default:
        console.log(`🔧 UNKNOWN GOD ACTION: ${action}`);
        break;
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const executeOnSelected = (action) => {
    selectedUsers.forEach(userId => {
      executeGodAction(action, userId);
    });
    setSelectedUsers([]);
  };

  // Admin modules
  const ADMIN_MODULES = {
    dashboard: {
      name: 'COMMAND CENTER',
      icon: FaCrown,
      color: 'text-yellow-400'
    },
    surveillance: {
      name: 'LIVE SURVEILLANCE',
      icon: FaEye,
      color: 'text-red-400'
    },
    users: {
      name: 'USER CONTROL',
      icon: FaUsers,
      color: 'text-purple-400'
    },
    system: {
      name: 'SYSTEM CORE',
      icon: FaServer,
      color: 'text-blue-400'
    },
    network: {
      name: 'NETWORK GRID',
      icon: FaGlobe,
      color: 'text-green-400'
    },
    data: {
      name: 'DATA VAULT',
      icon: FaDatabase,
      color: 'text-cyan-400'
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden z-50">
      {/* Matrix Background */}
      <canvas
        ref={matrixCanvasRef}
        className="absolute inset-0 opacity-10"
        style={{ zIndex: 1 }}
      />

      {/* Main Interface */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top Header */}
        <div className="bg-black/90 border-b border-green-400/30 p-4 backdrop-blur-sm">
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
                transition={{ duration: 4, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <FaCrown className="text-2xl text-black" />
              </motion.div>
              
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">SUPREME ARCHITECT CONTROL</h1>
                <p className="text-gray-400">Full-Page Admin Interface • God Mode • Unlimited Authority</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="text-green-400 font-bold">👻 GHOST MODE: ACTIVE</div>
                <div className="text-yellow-400 font-bold">⚡ UNLIMITED POWER</div>
                <div className="text-purple-400 font-bold">🌌 REALITY CONTROL</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg"
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2"
              >
                <FaTimes />
                <span>EXIT GOD MODE</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="bg-black/80 border-b border-green-400/30 p-4 backdrop-blur-sm">
          <div className="flex space-x-2 overflow-x-auto">
            {Object.entries(ADMIN_MODULES).map(([key, module]) => {
              const ModuleIcon = module.icon;
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentModule(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                    currentModule === key
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

        {/* Content Area - Full Height */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentModule}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {/* Render Module Content */}
                {currentModule === 'dashboard' && <DashboardModule systemStats={systemStats} liveUsers={liveUsers} executeGodAction={executeGodAction} />}
                {currentModule === 'surveillance' && <SurveillanceModule liveUsers={liveUsers} executeGodAction={executeGodAction} />}
                {currentModule === 'users' && <UserControlModule liveUsers={liveUsers} executeGodAction={executeGodAction} selectedUsers={selectedUsers} toggleUserSelection={toggleUserSelection} executeOnSelected={executeOnSelected} />}
                {currentModule === 'system' && <SystemCoreModule systemStats={systemStats} executeGodAction={executeGodAction} />}
                {currentModule === 'network' && <NetworkGridModule systemStats={systemStats} executeGodAction={executeGodAction} />}
                {currentModule === 'data' && <DataVaultModule executeGodAction={executeGodAction} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Notifications & Quick Actions */}
          <div className="w-80 bg-black/80 border-l border-green-400/30 p-4 overflow-y-auto backdrop-blur-sm">
            {/* Live Notifications */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaBolt className="mr-2" />
                LIVE NOTIFICATIONS
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-2 rounded text-xs ${
                    notif.type === 'success' ? 'bg-green-900/50 text-green-400' :
                    notif.type === 'warning' ? 'bg-yellow-900/50 text-yellow-400' :
                    notif.type === 'error' ? 'bg-red-900/50 text-red-400' :
                    'bg-blue-900/50 text-blue-400'
                  }`}>
                    <div className="font-bold">{notif.message}</div>
                    <div className="text-gray-400">{notif.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick God Actions */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaCrown className="mr-2" />
                QUICK GOD ACTIONS
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeGodAction('GRANT_UNLIMITED_XP', 'ALL_USERS')}
                  className="bg-green-600 text-white px-2 py-2 rounded text-xs font-bold"
                >
                  ⚡ GRANT XP
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeGodAction('UNLOCK_ALL_ZONES', 'ALL_USERS')}
                  className="bg-blue-600 text-white px-2 py-2 rounded text-xs font-bold"
                >
                  🔓 UNLOCK ALL
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeGodAction('MODIFY_REALITY', 'MATRIX_GLITCH')}
                  className="bg-purple-600 text-white px-2 py-2 rounded text-xs font-bold"
                >
                  🌌 REALITY
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeGodAction('SYSTEM_SHUTDOWN', 'ENTIRE_NETWORK')}
                  className="bg-red-600 text-white px-2 py-2 rounded text-xs font-bold"
                >
                  💀 SHUTDOWN
                </motion.button>
              </div>
            </div>

            {/* System Stats */}
            <div>
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaServer className="mr-2" />
                SYSTEM STATUS
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Active Users:</span>
                  <span className="text-green-400 font-bold">{systemStats.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span>System Load:</span>
                  <span className="text-yellow-400 font-bold">{systemStats.systemLoad}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="text-blue-400 font-bold">{systemStats.memoryUsage}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="text-purple-400 font-bold">{systemStats.networkTraffic} GB/s</span>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <span className="text-red-400 font-bold">{systemStats.securityLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Module
const DashboardModule = ({ systemStats, liveUsers, executeGodAction }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="text-8xl mb-4"
      >
        👑
      </motion.div>
      <h2 className="text-4xl font-bold text-yellow-400 mb-2">SUPREME ARCHITECT COMMAND CENTER</h2>
      <p className="text-gray-400 text-lg">Complete System Overview & God-Tier Controls</p>
    </div>

    {/* System Overview Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-green-900/30 border border-green-400/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <FaUsers className="text-3xl text-green-400" />
          <span className="text-2xl font-bold text-green-400">{systemStats.activeUsers}</span>
        </div>
        <h3 className="text-green-400 font-bold">ACTIVE USERS</h3>
        <p className="text-gray-400 text-sm">Live monitoring enabled</p>
      </div>

      <div className="bg-blue-900/30 border border-blue-400/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <FaServer className="text-3xl text-blue-400" />
          <span className="text-2xl font-bold text-blue-400">{systemStats.systemLoad}%</span>
        </div>
        <h3 className="text-blue-400 font-bold">SYSTEM LOAD</h3>
        <p className="text-gray-400 text-sm">Optimal performance</p>
      </div>

      <div className="bg-purple-900/30 border border-purple-400/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <FaShieldAlt className="text-3xl text-purple-400" />
          <span className="text-2xl font-bold text-purple-400">{systemStats.threatsBlocked}</span>
        </div>
        <h3 className="text-purple-400 font-bold">THREATS BLOCKED</h3>
        <p className="text-gray-400 text-sm">Security maximum</p>
      </div>

      <div className="bg-yellow-900/30 border border-yellow-400/50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <FaBolt className="text-3xl text-yellow-400" />
          <span className="text-2xl font-bold text-yellow-400">{systemStats.adminActions}</span>
        </div>
        <h3 className="text-yellow-400 font-bold">GOD ACTIONS</h3>
        <p className="text-gray-400 text-sm">Unlimited power</p>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-black/50 border border-green-400/30 rounded-lg p-6">
      <h3 className="text-yellow-400 font-bold text-xl mb-4 flex items-center">
        <FaCrown className="mr-2" />
        SUPREME ARCHITECT CONTROLS
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('GRANT_UNLIMITED_XP', 'ALL_USERS')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold flex flex-col items-center space-y-2"
        >
          <FaBolt className="text-2xl" />
          <span>GRANT UNLIMITED XP</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('UNLOCK_ALL_ZONES', 'ALL_USERS')}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-bold flex flex-col items-center space-y-2"
        >
          <FaUnlock className="text-2xl" />
          <span>UNLOCK ALL ZONES</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('MODIFY_REALITY', 'MATRIX_OVERRIDE')}
          className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-bold flex flex-col items-center space-y-2"
        >
          <FaGem className="text-2xl" />
          <span>MODIFY REALITY</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('SYSTEM_SHUTDOWN', 'ENTIRE_NETWORK')}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg font-bold flex flex-col items-center space-y-2"
        >
          <FaSkull className="text-2xl" />
          <span>SYSTEM SHUTDOWN</span>
        </motion.button>
      </div>
    </div>

    {/* Live Activity Feed */}
    <div className="bg-black/50 border border-green-400/30 rounded-lg p-6">
      <h3 className="text-green-400 font-bold text-xl mb-4 flex items-center">
        <FaEye className="mr-2" />
        LIVE ACTIVITY SURVEILLANCE
      </h3>
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {liveUsers.slice(0, 5).map(user => (
          <div key={user.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="font-bold text-green-400">{user.alias}</span>
              <span className="text-gray-400">in {user.location}</span>
            </div>
            <div className="text-right text-sm">
              <div className="text-blue-400">{user.lastAction}</div>
              <div className="text-gray-400">{user.sessionTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Surveillance Module
const SurveillanceModule = ({ liveUsers, executeGodAction }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">👁️</div>
      <h2 className="text-3xl font-bold text-red-400 mb-2">LIVE SURVEILLANCE SYSTEM</h2>
      <p className="text-gray-400">Real-time monitoring of all user activities</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {liveUsers.map(user => (
        <div key={user.id} className="bg-black/50 border border-red-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="font-bold text-red-400 text-lg">{user.alias}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                user.threat === 'high' ? 'bg-red-600 text-white' :
                user.threat === 'medium' ? 'bg-yellow-600 text-white' :
                'bg-green-600 text-white'
              }`}>
                {user.threat.toUpperCase()} THREAT
              </span>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => executeGodAction('TELEPORT_USER', user.id, 'VOID_ZONE')}
                className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-bold"
              >
                TELEPORT
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => executeGodAction('WIPE_USER_DATA', user.id)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm font-bold"
              >
                WIPE
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Location:</div>
              <div className="text-green-400 font-bold">{user.location}</div>
            </div>
            <div>
              <div className="text-gray-400">Current Action:</div>
              <div className="text-blue-400 font-bold">{user.lastAction}</div>
            </div>
            <div>
              <div className="text-gray-400">IP Address:</div>
              <div className="text-yellow-400 font-bold">{user.ip}</div>
            </div>
            <div>
              <div className="text-gray-400">Device:</div>
              <div className="text-purple-400 font-bold">{user.device}</div>
            </div>
            <div>
              <div className="text-gray-400">Level/XP:</div>
              <div className="text-cyan-400 font-bold">L{user.level} ({user.xp} XP)</div>
            </div>
            <div>
              <div className="text-gray-400">Session Time:</div>
              <div className="text-orange-400 font-bold">{user.sessionTime}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// User Control Module
const UserControlModule = ({ liveUsers, executeGodAction, selectedUsers, toggleUserSelection, executeOnSelected }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">👥</div>
      <h2 className="text-3xl font-bold text-purple-400 mb-2">USER CONTROL CENTER</h2>
      <p className="text-gray-400">Complete authority over all users</p>
    </div>

    {/* Bulk Actions */}
    <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6">
      <h3 className="text-purple-400 font-bold text-xl mb-4">BULK USER ACTIONS</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeOnSelected('GRANT_UNLIMITED_XP')}
          disabled={selectedUsers.length === 0}
          className="bg-green-600 disabled:bg-gray-600 text-white px-4 py-2 rounded font-bold"
        >
          ⚡ GRANT XP TO SELECTED ({selectedUsers.length})
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeOnSelected('UNLOCK_ALL_ZONES')}
          disabled={selectedUsers.length === 0}
          className="bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded font-bold"
        >
          🔓 UNLOCK ALL FOR SELECTED
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeOnSelected('GRANT_GOD_PERMISSIONS')}
          disabled={selectedUsers.length === 0}
          className="bg-yellow-600 disabled:bg-gray-600 text-white px-4 py-2 rounded font-bold"
        >
          👑 GRANT GOD POWERS
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeOnSelected('WIPE_USER_DATA')}
          disabled={selectedUsers.length === 0}
          className="bg-red-600 disabled:bg-gray-600 text-white px-4 py-2 rounded font-bold"
        >
          💀 WIPE SELECTED
        </motion.button>
      </div>
    </div>

    {/* User List */}
    <div className="bg-black/50 border border-purple-400/30 rounded-lg p-6">
      <h3 className="text-purple-400 font-bold text-xl mb-4">ALL USERS</h3>
      <div className="space-y-3">
        {liveUsers.map(user => (
          <div key={user.id} className={`border rounded-lg p-4 transition-all ${
            selectedUsers.includes(user.id)
              ? 'border-purple-400 bg-purple-900/30'
              : 'border-gray-600 bg-gray-900/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => toggleUserSelection(user.id)}
                  className="w-4 h-4"
                />
                <div className={`w-3 h-3 rounded-full ${user.status === 'online' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                <div>
                  <div className="font-bold text-purple-400">{user.alias}</div>
                  <div className="text-sm text-gray-400">{user.location} • {user.lastAction}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right text-sm">
                  <div className="text-cyan-400 font-bold">L{user.level} ({user.xp} XP)</div>
                  <div className="text-gray-400">{user.sessionTime}</div>
                </div>

                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('GRANT_UNLIMITED_XP', user.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold"
                  >
                    ⚡ XP
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('TELEPORT_USER', user.id, 'ADMIN_ZONE')}
                    className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold"
                  >
                    🌀 TP
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => executeGodAction('WIPE_USER_DATA', user.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold"
                  >
                    💀 WIPE
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// System Core Module
const SystemCoreModule = ({ systemStats, executeGodAction }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">🖥️</div>
      <h2 className="text-3xl font-bold text-blue-400 mb-2">SYSTEM CORE CONTROL</h2>
      <p className="text-gray-400">Deep system access and control</p>
    </div>

    {/* System Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-blue-900/30 border border-blue-400/50 rounded-lg p-6">
        <h3 className="text-blue-400 font-bold mb-4">CPU & MEMORY</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>CPU Usage:</span>
            <span className="text-blue-400 font-bold">{systemStats.cpuUsage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Memory:</span>
            <span className="text-green-400 font-bold">{systemStats.memoryUsage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Disk Space:</span>
            <span className="text-yellow-400 font-bold">{systemStats.diskSpace}%</span>
          </div>
        </div>
      </div>

      <div className="bg-green-900/30 border border-green-400/50 rounded-lg p-6">
        <h3 className="text-green-400 font-bold mb-4">NETWORK</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Bandwidth:</span>
            <span className="text-green-400 font-bold">{systemStats.bandwidth}%</span>
          </div>
          <div className="flex justify-between">
            <span>Connections:</span>
            <span className="text-blue-400 font-bold">{systemStats.connections}</span>
          </div>
          <div className="flex justify-between">
            <span>Traffic:</span>
            <span className="text-purple-400 font-bold">{systemStats.networkTraffic} GB/s</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-900/30 border border-purple-400/50 rounded-lg p-6">
        <h3 className="text-purple-400 font-bold mb-4">SECURITY</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Threats Blocked:</span>
            <span className="text-red-400 font-bold">{systemStats.threatsBlocked}</span>
          </div>
          <div className="flex justify-between">
            <span>Security Level:</span>
            <span className="text-green-400 font-bold">{systemStats.securityLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Uptime:</span>
            <span className="text-blue-400 font-bold">{systemStats.uptime}</span>
          </div>
        </div>
      </div>
    </div>

    {/* System Controls */}
    <div className="bg-black/50 border border-blue-400/30 rounded-lg p-6">
      <h3 className="text-blue-400 font-bold text-xl mb-4">SYSTEM CONTROLS</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('SYSTEM_RESTART', 'CORE_SYSTEMS')}
          className="bg-yellow-600 text-white p-4 rounded font-bold flex flex-col items-center space-y-2"
        >
          <FaPlay />
          <span>RESTART</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('SYSTEM_MAINTENANCE', 'ALL_MODULES')}
          className="bg-blue-600 text-white p-4 rounded font-bold flex flex-col items-center space-y-2"
        >
          <FaCog />
          <span>MAINTENANCE</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('SECURITY_LOCKDOWN', 'MAXIMUM')}
          className="bg-red-600 text-white p-4 rounded font-bold flex flex-col items-center space-y-2"
        >
          <FaLock />
          <span>LOCKDOWN</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('SYSTEM_SHUTDOWN', 'ENTIRE_NETWORK')}
          className="bg-black border border-red-400 text-red-400 p-4 rounded font-bold flex flex-col items-center space-y-2"
        >
          <FaStop />
          <span>SHUTDOWN</span>
        </motion.button>
      </div>
    </div>
  </div>
);

// Network Grid Module
const NetworkGridModule = ({ systemStats, executeGodAction }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">🌐</div>
      <h2 className="text-3xl font-bold text-green-400 mb-2">NETWORK GRID CONTROL</h2>
      <p className="text-gray-400">Global network infrastructure management</p>
    </div>

    <div className="bg-black/50 border border-green-400/30 rounded-lg p-6">
      <h3 className="text-green-400 font-bold text-xl mb-4">NETWORK STATUS</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-green-400 mb-2">{systemStats.connections}</div>
          <div className="text-gray-400">Active Connections</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-400 mb-2">{systemStats.bandwidth}%</div>
          <div className="text-gray-400">Bandwidth Usage</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-400 mb-2">{systemStats.networkTraffic} GB/s</div>
          <div className="text-gray-400">Data Transfer</div>
        </div>
      </div>
    </div>

    <div className="bg-black/50 border border-green-400/30 rounded-lg p-6">
      <h3 className="text-green-400 font-bold text-xl mb-4">NETWORK CONTROLS</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('NETWORK_BOOST', 'MAXIMUM_SPEED')}
          className="bg-green-600 text-white p-4 rounded font-bold"
        >
          🚀 BOOST NETWORK
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('NETWORK_THROTTLE', 'SPECIFIC_USERS')}
          className="bg-yellow-600 text-white p-4 rounded font-bold"
        >
          🐌 THROTTLE USERS
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('NETWORK_BLACKOUT', 'SELECTED_REGIONS')}
          className="bg-red-600 text-white p-4 rounded font-bold"
        >
          💀 NETWORK BLACKOUT
        </motion.button>
      </div>
    </div>
  </div>
);

// Data Vault Module
const DataVaultModule = ({ executeGodAction }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">🗄️</div>
      <h2 className="text-3xl font-bold text-cyan-400 mb-2">DATA VAULT ACCESS</h2>
      <p className="text-gray-400">Complete database control and manipulation</p>
    </div>

    <div className="bg-black/50 border border-cyan-400/30 rounded-lg p-6">
      <h3 className="text-cyan-400 font-bold text-xl mb-4">DATABASE OPERATIONS</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('DATABASE_BACKUP', 'FULL_SYSTEM')}
          className="bg-blue-600 text-white p-4 rounded font-bold"
        >
          💾 FULL BACKUP
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('DATABASE_RESTORE', 'PREVIOUS_STATE')}
          className="bg-green-600 text-white p-4 rounded font-bold"
        >
          🔄 RESTORE DATA
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('DATABASE_WIPE', 'SELECTED_TABLES')}
          className="bg-red-600 text-white p-4 rounded font-bold"
        >
          💀 WIPE TABLES
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('DATABASE_CLONE', 'MIRROR_SYSTEM')}
          className="bg-purple-600 text-white p-4 rounded font-bold"
        >
          👥 CLONE DATABASE
        </motion.button>
      </div>
    </div>

    <div className="bg-black/50 border border-cyan-400/30 rounded-lg p-6">
      <h3 className="text-cyan-400 font-bold text-xl mb-4">DATA MANIPULATION</h3>
      <div className="text-center text-gray-400 py-8">
        <div className="text-4xl mb-4">🔐</div>
        <p>Direct database access requires additional authentication</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => executeGodAction('REQUEST_DB_ACCESS', 'SUPREME_ARCHITECT')}
          className="bg-cyan-600 text-white px-6 py-3 rounded font-bold mt-4"
        >
          REQUEST VAULT ACCESS
        </motion.button>
      </div>
    </div>
  </div>
);

export default FullPageAdminControl;
