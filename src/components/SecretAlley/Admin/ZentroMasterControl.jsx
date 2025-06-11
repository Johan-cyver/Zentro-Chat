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
  FaCompress,
  FaHome,
  FaBlog,
  FaNetworkWired,
  FaUserSecret,
  FaProjectDiagram,
  FaComments,
  FaStore
} from 'react-icons/fa';

const ZentroMasterControl = ({ onExit }) => {
  const [currentModule, setCurrentModule] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [liveUsers, setLiveUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [zentroComponents, setZentroComponents] = useState({});
  const matrixCanvasRef = useRef(null);

  // Initialize master control system
  useEffect(() => {
    initializeMasterControl();
    startMatrixBackground();
    // loadZentroData(); // Will be implemented later
    startRealTimeUpdates();
  }, []);

  const initializeMasterControl = () => {
    console.log('👑 ZENTRO MASTER CONTROL INITIALIZED');
    console.log('🌌 COMPLETE ECOSYSTEM AUTHORITY GRANTED');
    console.log('⚡ UNLIMITED POWER ACROSS ALL COMPONENTS');
    
    // Load all Zentro components data
    loadZentroComponents();
    loadLiveUsers();
    loadSystemStats();
    
    // Add welcome notification
    addNotification('👑 ZENTRO MASTER CONTROL ACTIVATED', 'success');
    addNotification('🌌 COMPLETE ECOSYSTEM AUTHORITY', 'info');
    addNotification('⚡ ALL COMPONENTS UNDER CONTROL', 'warning');
  };

  const startMatrixBackground = () => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ZENTRO MASTER CONTROL ECOSYSTEM ADMIN SUPREME AUTHORITY 01234567890";
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

  const loadZentroComponents = () => {
    setZentroComponents({
      mainApp: {
        name: 'Zentro Main App',
        status: 'active',
        users: 1247,
        features: ['Dashboard', 'Profile', 'Connect', 'Chat'],
        health: 98.5
      },
      secretAlley: {
        name: 'Secret Alley',
        status: 'active',
        users: 342,
        features: ['Terminal', 'Missions', 'Factions', 'Projects'],
        health: 97.2
      },
      zentroNetwork: {
        name: 'Zentro Network (Blog)',
        status: 'active',
        users: 892,
        features: ['Blogging', 'Research', 'Collaboration'],
        health: 99.1
      },
      talentHub: {
        name: 'Talent Hub',
        status: 'active',
        users: 567,
        features: ['Profiles', 'Recruitment', 'Skills'],
        health: 96.8
      },
      zentrium: {
        name: 'Zentrium (Marketplace)',
        status: 'development',
        users: 89,
        features: ['App Store', 'Revenue Share', 'Deployment'],
        health: 85.3
      },
      aiEcosystem: {
        name: 'AI Ecosystem',
        status: 'active',
        users: 1247,
        features: ['Zentro Bot', 'Shadow Copilot', 'Project Agents'],
        health: 94.7
      }
    });
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
      connections: 2847,
      revenue: '$47,892',
      activeProjects: 234,
      completedMissions: 1456
    });
  };

  const loadLiveUsers = () => {
    const mockUsers = [
      {
        id: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        status: 'online',
        location: 'Zentro Network',
        component: 'Blog',
        activity: 'Writing research post',
        ip: '192.168.1.100',
        device: 'Chrome/Windows',
        level: 5,
        xp: 2450,
        threat: 'low',
        permissions: ['basic'],
        sessionTime: '1h 45m'
      },
      {
        id: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        status: 'online',
        location: 'Secret Alley',
        component: 'Arena',
        activity: 'PvP Battle',
        ip: '203.0.113.45',
        device: 'Firefox/Linux',
        level: 4,
        xp: 1890,
        threat: 'medium',
        permissions: ['basic'],
        sessionTime: '32m'
      },
      {
        id: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        status: 'away',
        location: 'Talent Hub',
        component: 'Profile',
        activity: 'Updating portfolio',
        ip: '172.16.0.100',
        device: 'Safari/macOS',
        level: 7,
        xp: 4200,
        threat: 'low',
        permissions: ['advanced'],
        sessionTime: '2h 15m'
      }
    ];

    setLiveUsers(mockUsers);
  };

  const startRealTimeUpdates = () => {
    setInterval(() => {
      // Update user activities
      setLiveUsers(prev => prev.map(user => ({
        ...user,
        activity: getRandomActivity(),
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

  const getRandomActivity = () => {
    const activities = [
      'Writing blog post', 'Updating profile', 'Solving cipher', 'PvP Battle',
      'Code review', 'Squad formation', 'Network scanning', 'Data mining',
      'Faction war', 'Project development', 'Skill training', 'Message encryption',
      'Browsing talent hub', 'Reading research', 'Collaborating on project'
    ];
    return activities[Math.floor(Math.random() * activities.length)];
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

  const executeZentroAction = (action, target = null, value = null) => {
    const timestamp = new Date().toLocaleTimeString();
    
    // Add notification
    addNotification(`⚡ ${action} executed on ${target || 'system'}`, 'success');

    switch (action) {
      case 'MODIFY_MAIN_APP':
        console.log(`🏠 MODIFIED MAIN APP: ${target}`);
        addNotification(`🏠 Main App Modified: ${target}`, 'info');
        break;
      case 'CONTROL_SECRET_ALLEY':
        console.log(`🕳️ SECRET ALLEY CONTROLLED: ${target}`);
        addNotification(`🕳️ Secret Alley: ${target}`, 'warning');
        break;
      case 'MANAGE_BLOG_NETWORK':
        console.log(`📝 BLOG NETWORK MANAGED: ${target}`);
        addNotification(`📝 Blog Network: ${target}`, 'info');
        break;
      case 'CONTROL_TALENT_HUB':
        console.log(`👥 TALENT HUB CONTROLLED: ${target}`);
        addNotification(`👥 Talent Hub: ${target}`, 'success');
        break;
      case 'DEPLOY_TO_ZENTRIUM':
        console.log(`🚀 DEPLOYED TO ZENTRIUM: ${target}`);
        addNotification(`🚀 Zentrium Deployment: ${target}`, 'success');
        break;
      case 'CONTROL_AI_ECOSYSTEM':
        console.log(`🤖 AI ECOSYSTEM CONTROLLED: ${target}`);
        addNotification(`🤖 AI System: ${target}`, 'warning');
        break;
      case 'SYSTEM_WIDE_SHUTDOWN':
        console.log(`🚨 SYSTEM-WIDE SHUTDOWN INITIATED`);
        addNotification('🚨 COMPLETE ZENTRO SHUTDOWN', 'error');
        break;
      case 'REALITY_OVERRIDE':
        console.log(`🌌 REALITY OVERRIDE: ${value}`);
        addNotification('🌌 REALITY MATRIX ALTERED', 'warning');
        break;
      default:
        console.log(`🔧 ZENTRO ACTION: ${action}`);
        break;
    }
  };

  // Master control modules
  const MASTER_MODULES = {
    overview: {
      name: 'ECOSYSTEM OVERVIEW',
      icon: FaCrown,
      color: 'text-yellow-400'
    },
    mainApp: {
      name: 'MAIN APP CONTROL',
      icon: FaHome,
      color: 'text-blue-400'
    },
    secretAlley: {
      name: 'SECRET ALLEY',
      icon: FaUserSecret,
      color: 'text-red-400'
    },
    blogNetwork: {
      name: 'BLOG NETWORK',
      icon: FaBlog,
      color: 'text-green-400'
    },
    talentHub: {
      name: 'TALENT HUB',
      icon: FaUsers,
      color: 'text-purple-400'
    },
    zentrium: {
      name: 'ZENTRIUM',
      icon: FaStore,
      color: 'text-cyan-400'
    },
    aiEcosystem: {
      name: 'AI ECOSYSTEM',
      icon: FaRocket,
      color: 'text-orange-400'
    },
    systemCore: {
      name: 'SYSTEM CORE',
      icon: FaServer,
      color: 'text-pink-400'
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
                <h1 className="text-2xl font-bold text-yellow-400">ZENTRO MASTER CONTROL</h1>
                <p className="text-gray-400">Complete Ecosystem Authority • All Components • Unlimited Power</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="text-green-400 font-bold">🌌 ECOSYSTEM: ACTIVE</div>
                <div className="text-yellow-400 font-bold">⚡ MASTER CONTROL</div>
                <div className="text-purple-400 font-bold">👑 SUPREME AUTHORITY</div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center space-x-2"
              >
                <FaTimes />
                <span>EXIT MASTER CONTROL</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="bg-black/80 border-b border-green-400/30 p-4 backdrop-blur-sm">
          <div className="flex space-x-2 overflow-x-auto">
            {Object.entries(MASTER_MODULES).map(([key, module]) => {
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
                {/* Content will be rendered based on currentModule */}
                <div className="text-center text-gray-400 py-20">
                  <div className="text-6xl mb-4">👑</div>
                  <h3 className="text-2xl font-bold mb-2">MODULE: {MASTER_MODULES[currentModule]?.name}</h3>
                  <p>Master control interface loading...</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Notifications & Quick Actions */}
          <div className="w-80 bg-black/80 border-l border-green-400/30 p-4 overflow-y-auto backdrop-blur-sm">
            {/* Live Notifications */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaBolt className="mr-2" />
                MASTER NOTIFICATIONS
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

            {/* Quick Master Actions */}
            <div className="mb-6">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaCrown className="mr-2" />
                MASTER ACTIONS
              </h3>
              <div className="grid grid-cols-1 gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('MODIFY_MAIN_APP', 'ALL_FEATURES')}
                  className="bg-blue-600 text-white px-3 py-2 rounded text-xs font-bold"
                >
                  🏠 CONTROL MAIN APP
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('CONTROL_SECRET_ALLEY', 'ALL_ZONES')}
                  className="bg-red-600 text-white px-3 py-2 rounded text-xs font-bold"
                >
                  🕳️ CONTROL SECRET ALLEY
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('MANAGE_BLOG_NETWORK', 'ALL_POSTS')}
                  className="bg-green-600 text-white px-3 py-2 rounded text-xs font-bold"
                >
                  📝 MANAGE BLOG NETWORK
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('CONTROL_TALENT_HUB', 'ALL_PROFILES')}
                  className="bg-purple-600 text-white px-3 py-2 rounded text-xs font-bold"
                >
                  👥 CONTROL TALENT HUB
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('REALITY_OVERRIDE', 'ZENTRO_MATRIX')}
                  className="bg-yellow-600 text-white px-3 py-2 rounded text-xs font-bold"
                >
                  🌌 REALITY OVERRIDE
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => executeZentroAction('SYSTEM_WIDE_SHUTDOWN', 'ENTIRE_ECOSYSTEM')}
                  className="bg-black border border-red-400 text-red-400 px-3 py-2 rounded text-xs font-bold"
                >
                  💀 ECOSYSTEM SHUTDOWN
                </motion.button>
              </div>
            </div>

            {/* Zentro Components Status */}
            <div>
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
                <FaServer className="mr-2" />
                COMPONENT STATUS
              </h3>
              <div className="space-y-2 text-xs">
                {Object.entries(zentroComponents).map(([key, component]) => (
                  <div key={key} className="flex justify-between">
                    <span>{component.name}:</span>
                    <span className={`font-bold ${
                      component.status === 'active' ? 'text-green-400' :
                      component.status === 'development' ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {component.health}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZentroMasterControl;
