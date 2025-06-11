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
  FaStop
} from 'react-icons/fa';
import shadowUserControl from '../../../services/admin/shadowUserControl';
import missionEngineControl from '../../../services/admin/missionEngineControl';
import skillMatrixEditor from '../../../services/admin/skillMatrixEditor';
import projectTerminalOps from '../../../services/admin/projectTerminalOps';
import rootLogsAndSecurity from '../../../services/admin/rootLogsAndSecurity';

const ThroneRoom = ({ onExit }) => {
  const [currentModule, setCurrentModule] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [maskedUsers, setMaskedUsers] = useState([]);
  const [activeMissions, setActiveMissions] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [ghostMode, setGhostMode] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [nodePositions, setNodePositions] = useState(new Map());
  const canvasRef = useRef(null);
  const [particles, setParticles] = useState([]);

  // Admin modules configuration
  const ADMIN_MODULES = {
    overview: {
      name: 'SYSTEM OVERVIEW',
      icon: FaEye,
      color: 'text-cyan-400',
      description: 'Global Shadow Network status'
    },
    users: {
      name: 'SHADOW CONTROL',
      icon: FaUsers,
      color: 'text-purple-400',
      description: 'User management and surveillance'
    },
    missions: {
      name: 'MISSION ENGINE',
      icon: FaRocket,
      color: 'text-green-400',
      description: 'Quest injection and arena control'
    },
    skills: {
      name: 'SKILL MATRIX',
      icon: FaBolt,
      color: 'text-yellow-400',
      description: 'XP rules and talent assessment'
    },
    projects: {
      name: 'PROJECT OPS',
      icon: FaCode,
      color: 'text-blue-400',
      description: 'Live project management'
    },
    security: {
      name: 'ROOT SECURITY',
      icon: FaShieldAlt,
      color: 'text-red-400',
      description: 'System logs and breach detection'
    }
  };

  useEffect(() => {
    initializeThroneRoom();
    startParticleSystem();
    loadSystemData();
  }, []);

  const initializeThroneRoom = () => {
    // Initialize breach tunnel animation
    console.log('🕳️ THRONE ROOM BREACH INITIATED');
    console.log('👑 ARCHITECT ACCESS GRANTED');
    console.log('🔒 GHOST MODE: STANDBY');
    
    // Load initial data
    loadMaskedUsers();
    loadActiveMissions();
    loadSystemLogs();
    monitorSecurityAlerts();
  };

  const startParticleSystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particleArray = [];
    for (let i = 0; i < 100; i++) {
      particleArray.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw particles
      particleArray.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity})`;
        ctx.fill();
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();
  };

  const loadSystemData = async () => {
    try {
      // Load all system data
      const users = await shadowUserControl.listMaskedUsers();
      const missions = await missionEngineControl.getActiveMissions();
      const logs = await rootLogsAndSecurity.getSystemLogs();
      
      setMaskedUsers(users);
      setActiveMissions(missions);
      setSystemLogs(logs);
    } catch (error) {
      console.error('Failed to load system data:', error);
    }
  };

  const loadMaskedUsers = async () => {
    const users = await shadowUserControl.listMaskedUsers();
    setMaskedUsers(users);
  };

  const loadActiveMissions = async () => {
    const missions = await missionEngineControl.getActiveMissions();
    setActiveMissions(missions);
  };

  const loadSystemLogs = async () => {
    const logs = await rootLogsAndSecurity.getSystemLogs();
    setSystemLogs(logs);
  };

  const monitorSecurityAlerts = () => {
    // Simulate security monitoring
    setInterval(() => {
      const alerts = [
        'Suspicious login attempt detected',
        'Unusual XP farming pattern identified',
        'Multiple failed admin access attempts',
        'Anomalous mission completion rate',
        'Potential bot activity detected'
      ];
      
      if (Math.random() > 0.95) { // 5% chance per check
        const alert = {
          id: Date.now(),
          message: alerts[Math.floor(Math.random() * alerts.length)],
          severity: Math.random() > 0.7 ? 'high' : 'medium',
          timestamp: Date.now()
        };
        
        setSecurityAlerts(prev => [alert, ...prev.slice(0, 9)]);
      }
    }, 5000);
  };

  const handleUserAction = async (action, userId, data = {}) => {
    try {
      switch (action) {
        case 'reveal':
          const revealed = await shadowUserControl.revealUserShadow(userId);
          console.log('👁️ User shadow revealed:', revealed);
          break;
        case 'freeze':
          await shadowUserControl.freezeShadow(userId);
          console.log('🧊 User frozen:', userId);
          break;
        case 'upgrade':
          await shadowUserControl.upgradeShadowLevel(userId, data.level);
          console.log('⬆️ User upgraded:', userId, 'to level', data.level);
          break;
        case 'directive':
          await shadowUserControl.sendSilentDirective(userId, data.message);
          console.log('📡 Silent directive sent:', userId);
          break;
      }
      
      // Reload user data
      loadMaskedUsers();
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const handleMissionAction = async (action, data = {}) => {
    try {
      switch (action) {
        case 'inject':
          await missionEngineControl.injectMission(data.type, data.details);
          console.log('💉 Mission injected:', data);
          break;
        case 'assign_roles':
          await missionEngineControl.assignSecretRoles(data.users, data.role);
          console.log('🎭 Secret roles assigned:', data);
          break;
        case 'launch_arena':
          await missionEngineControl.launchMaskedArena(data.mode);
          console.log('⚔️ Arena launched:', data.mode);
          break;
        case 'hide_mission':
          await missionEngineControl.hideMissionFromPublic(data.id);
          console.log('🙈 Mission hidden:', data.id);
          break;
      }
      
      loadActiveMissions();
    } catch (error) {
      console.error('Mission action failed:', error);
    }
  };

  const toggleGhostMode = async () => {
    const newGhostMode = !ghostMode;
    setGhostMode(newGhostMode);
    
    if (newGhostMode) {
      await rootLogsAndSecurity.enableGhostMode();
      console.log('👻 GHOST MODE ACTIVATED - ALL TRACES DISABLED');
    } else {
      await rootLogsAndSecurity.disableGhostMode();
      console.log('👁️ GHOST MODE DEACTIVATED - LOGGING RESUMED');
    }
  };

  const emergencyShutdown = async () => {
    if (window.confirm('⚠️ EMERGENCY SHUTDOWN\nThis will immediately terminate all Shadow Network operations.\nConfirm?')) {
      await rootLogsAndSecurity.emergencyShutdown();
      console.log('🚨 EMERGENCY SHUTDOWN INITIATED');
      onExit();
    }
  };

  const renderUserNode = (user) => {
    return (
      <motion.div
        key={user.shadowId}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        className={`relative w-16 h-16 rounded-full border-2 cursor-pointer transition-all ${
          user.status === 'online' ? 'border-green-400 bg-green-900/20' :
          user.status === 'suspicious' ? 'border-red-400 bg-red-900/20' :
          'border-gray-400 bg-gray-900/20'
        }`}
        style={{
          position: 'absolute',
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`
        }}
        onClick={() => setSelectedUser(user)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-white">{user.alias.substring(0, 2)}</span>
        </div>
        
        {user.status === 'online' && (
          <motion.div
            className="absolute -inset-1 rounded-full border border-green-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
          {user.alias}
        </div>
      </motion.div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{maskedUsers.length}</div>
                <div className="text-gray-400 text-sm">Active Shadows</div>
              </div>
              <FaUsers className="text-cyan-400 text-2xl" />
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{activeMissions.length}</div>
                <div className="text-gray-400 text-sm">Live Missions</div>
              </div>
              <FaRocket className="text-green-400 text-2xl" />
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{securityAlerts.length}</div>
                <div className="text-gray-400 text-sm">Security Alerts</div>
              </div>
              <FaShieldAlt className="text-yellow-400 text-2xl" />
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">98.7%</div>
                <div className="text-gray-400 text-sm">System Health</div>
              </div>
              <FaBolt className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        {/* Network Visualization */}
        <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6 h-96 relative overflow-hidden">
          <h3 className="text-cyan-400 font-bold mb-4">SHADOW NETWORK MAP</h3>
          <div className="relative w-full h-full">
            {maskedUsers.slice(0, 20).map(renderUserNode)}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6">
          <h3 className="text-cyan-400 font-bold mb-4">RECENT SYSTEM ACTIVITY</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {systemLogs.slice(0, 10).map((log, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{log.message}</span>
                <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUserControl = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-purple-400">SHADOW CONTROL</h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadMaskedUsers}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              🔄 REFRESH
            </motion.button>
          </div>
        </div>

        <div className="grid gap-4">
          {maskedUsers.map(user => (
            <motion.div
              key={user.shadowId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    user.status === 'online' ? 'border-green-400 bg-green-900/20' :
                    user.status === 'suspicious' ? 'border-red-400 bg-red-900/20' :
                    'border-gray-400 bg-gray-900/20'
                  }`}>
                    <span className="text-white font-bold">{user.alias.substring(0, 2)}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold">{user.alias}</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">Level: {user.maskLevel}</span>
                      <span className="text-gray-400">XP: {user.shadowXP}</span>
                      <span className={`font-bold ${
                        user.status === 'online' ? 'text-green-400' :
                        user.status === 'suspicious' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserAction('reveal', user.shadowId)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                  >
                    <FaEye className="inline mr-1" />
                    REVEAL
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserAction('freeze', user.shadowId)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                  >
                    <FaLock className="inline mr-1" />
                    FREEZE
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleUserAction('upgrade', user.shadowId, { level: user.maskLevel + 1 })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                  >
                    <FaBolt className="inline mr-1" />
                    UPGRADE
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedUser(user)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                  >
                    <FaTerminal className="inline mr-1" />
                    CONTROL
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Particle Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />

      {/* Main Interface */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Throne Room Header */}
        <div className="p-6 border-b border-cyan-400/30 bg-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 215, 0, 0.5)',
                    '0 0 40px rgba(255, 215, 0, 0.8)',
                    '0 0 20px rgba(255, 215, 0, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
              >
                <FaCrown className="text-3xl text-black" />
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold text-yellow-400">THRONE ROOM</h1>
                <p className="text-gray-400">Architect • Root Access • Level 0x0</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleGhostMode}
                className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                  ghostMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                👻 GHOST MODE {ghostMode ? 'ON' : 'OFF'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={emergencyShutdown}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                🚨 EMERGENCY
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onExit}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← EXIT
              </motion.button>
            </div>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="p-6 border-b border-cyan-400/30 bg-black/60 backdrop-blur-sm">
          <div className="flex space-x-4 overflow-x-auto">
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
                      ? 'bg-cyan-600 text-white'
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

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-black/40 backdrop-blur-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentModule === 'overview' && renderOverview()}
              {currentModule === 'users' && renderUserControl()}
              {currentModule === 'missions' && (
                <div className="text-center text-gray-400 py-20">
                  <FaRocket className="text-6xl mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-bold mb-2">MISSION ENGINE</h3>
                  <p>Mission injection and arena control systems</p>
                </div>
              )}
              {currentModule === 'skills' && (
                <div className="text-center text-gray-400 py-20">
                  <FaBolt className="text-6xl mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-2">SKILL MATRIX</h3>
                  <p>XP rules and talent assessment controls</p>
                </div>
              )}
              {currentModule === 'projects' && (
                <div className="text-center text-gray-400 py-20">
                  <FaCode className="text-6xl mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold mb-2">PROJECT OPS</h3>
                  <p>Live project management and deployment</p>
                </div>
              )}
              {currentModule === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-red-400">ROOT SECURITY</h2>

                  <div className="bg-gray-900/50 border border-red-400/30 rounded-lg p-6">
                    <h3 className="text-red-400 font-bold mb-4">SECURITY ALERTS</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {securityAlerts.map(alert => (
                        <div key={alert.id} className={`p-3 rounded border ${
                          alert.severity === 'high' ? 'border-red-400 bg-red-900/20' : 'border-yellow-400 bg-yellow-900/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-sm ${alert.severity === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {alert.message}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ThroneRoom;
