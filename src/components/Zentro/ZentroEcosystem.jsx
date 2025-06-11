import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaBrain,
  FaComments,
  FaFlask,
  FaCompass,
  FaPuzzlePiece,
  FaCog,
  FaHome,
  FaBell,
  FaSearch,
  FaPlus,
  FaMoon,
  FaSun,
  FaUserSecret,
  FaRocket,
  FaNetworkWired,
  FaStore,
  FaBlog,
  FaUsers,
  FaCode,
  FaGraduationCap,
  FaTrophy,
  FaShieldAlt
} from 'react-icons/fa';

// Import components
import ZentroProfile from './components/ZentroProfile';
import ZentroNetwork from './components/ZentroNetwork';
import ZentroChat from './components/ZentroChat';
import SecretAlleyPortal from './components/SecretAlleyPortal';
import TalentDirectory from './components/TalentDirectory';
import Zentrium from './components/Zentrium';
import ZentroSettings from './components/ZentroSettings';
import ZentroBot from './components/ZentroBot';

// Import our existing Secret Alley
import SecretAlley from '../Community/SecretAlley';

const ZentroEcosystem = () => {
  const [currentModule, setCurrentModule] = useState('profile');
  const [theme, setTheme] = useState('dark'); // dark, light, corporate
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isSecretAlleyUnlocked, setIsSecretAlleyUnlocked] = useState(false);
  const [zentroScore, setZentroScore] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [influenceXP, setInfluenceXP] = useState(0);
  const [showSecretAlley, setShowSecretAlley] = useState(false);

  // Initialize Zentro ecosystem
  useEffect(() => {
    initializeZentroUser();
    loadNotifications();
    checkSecretAlleyAccess();
  }, []);

  const initializeZentroUser = () => {
    // Load user data from localStorage or API
    const userData = {
      id: 'zentro_user_001',
      username: 'ZentroArchitect',
      displayName: 'Zentro Architect',
      email: 'architect@zentro.app',
      avatar: '/api/placeholder/100/100',
      
      // Personal Profile
      personal: {
        bio: 'Building the future of digital ecosystems',
        birthday: '1995-06-15',
        location: 'Digital Realm',
        interests: ['AI', 'Blockchain', 'Design', 'Philosophy'],
        favoriteQuote: 'Code is poetry in motion',
        currentMood: 'Innovative'
      },
      
      // Professional Profile
      professional: {
        title: 'Full-Stack Architect',
        company: 'Zentro Labs',
        skills: ['React', 'Node.js', 'AI/ML', 'Blockchain', 'UI/UX'],
        experience: '5+ years',
        portfolio: ['zentro-chat', 'secret-alley', 'ai-copilot'],
        achievements: ['Secret Alley Creator', 'AI Integration Expert'],
        hiringStatus: 'Open to opportunities',
        resume: '/documents/resume.pdf'
      },
      
      // Zentro Stats
      zentroStats: {
        level: 7,
        xp: 4250,
        influenceXP: 1890,
        zentroScore: 8.7,
        secretAlleyRank: 'Shadow Architect',
        completedMissions: 23,
        publishedApps: 3,
        networkConnections: 156,
        blogPosts: 12
      },
      
      // Permissions & Access
      permissions: {
        secretAlley: true,
        zentrium: true,
        talentDirectory: true,
        adminPanel: true,
        aiAssistant: true
      }
    };

    setUser(userData);
    setUserLevel(userData.zentroStats.level);
    setZentroScore(userData.zentroStats.zentroScore);
    setInfluenceXP(userData.zentroStats.influenceXP);
    setIsSecretAlleyUnlocked(userData.permissions.secretAlley);
  };

  const loadNotifications = () => {
    const mockNotifications = [
      {
        id: 1,
        type: 'mission',
        title: 'New Secret Mission Available',
        message: 'Shadow Protocol: Data Infiltration',
        timestamp: '2 min ago',
        unread: true,
        icon: FaUserSecret,
        color: 'text-red-400'
      },
      {
        id: 2,
        type: 'network',
        title: 'Blog Post Trending',
        message: 'Your AI research post gained 50+ views',
        timestamp: '1 hour ago',
        unread: true,
        icon: FaBrain,
        color: 'text-blue-400'
      },
      {
        id: 3,
        type: 'talent',
        title: 'Profile View',
        message: 'TechCorp viewed your profile',
        timestamp: '3 hours ago',
        unread: false,
        icon: FaUsers,
        color: 'text-green-400'
      }
    ];
    setNotifications(mockNotifications);
  };

  const checkSecretAlleyAccess = () => {
    // Check if user has unlocked Secret Alley
    const hasAccess = userLevel >= 3; // Minimum level 3 required
    setIsSecretAlleyUnlocked(hasAccess);
  };

  // Navigation modules
  const ZENTRO_MODULES = {
    profile: {
      name: 'Profile',
      icon: FaUser,
      component: ZentroProfile,
      description: 'Personal & Professional Identity',
      unlocked: true
    },
    network: {
      name: 'Network',
      icon: FaBrain,
      component: ZentroNetwork,
      description: 'Blog, Research & Broadcasting',
      unlocked: true
    },
    chat: {
      name: 'Chat',
      icon: FaComments,
      component: ZentroChat,
      description: 'Communication & Collaboration',
      unlocked: true
    },
    secretAlley: {
      name: 'Secret Alley',
      icon: FaUserSecret,
      component: SecretAlleyPortal,
      description: 'Dark Training Ground',
      unlocked: isSecretAlleyUnlocked,
      special: true,
      onEnterSecretAlley: () => setShowSecretAlley(true)
    },
    talent: {
      name: 'Talent Hub',
      icon: FaCompass,
      component: TalentDirectory,
      description: 'Professional Directory',
      unlocked: userLevel >= 2
    },
    zentrium: {
      name: 'Zentrium',
      icon: FaStore,
      component: Zentrium,
      description: 'App Marketplace',
      unlocked: userLevel >= 5
    },
    settings: {
      name: 'Settings',
      icon: FaCog,
      component: ZentroSettings,
      description: 'Preferences & Configuration',
      unlocked: true
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-gray-100 text-gray-900';
      case 'corporate':
        return 'bg-blue-50 text-blue-900';
      default:
        return 'bg-gray-900 text-white';
    }
  };

  const getSidebarClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-white border-gray-200 text-gray-700';
      case 'corporate':
        return 'bg-blue-900 border-blue-700 text-blue-100';
      default:
        return 'bg-black border-gray-700 text-gray-300';
    }
  };

  const handleModuleChange = (moduleKey) => {
    const module = ZENTRO_MODULES[moduleKey];
    if (module && module.unlocked) {
      setCurrentModule(moduleKey);
    }
  };

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'corporate'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const CurrentComponent = ZENTRO_MODULES[currentModule]?.component || ZentroProfile;

  // Handle Secret Alley full-screen takeover
  if (showSecretAlley) {
    return (
      <SecretAlley
        onExit={() => setShowSecretAlley(false)}
        userProfile={user}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${getThemeClasses()}`}>
      {/* Global Navigation Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-20 hover:w-64 transition-all duration-300 z-40 ${getSidebarClasses()} border-r group`}>
        {/* Zentro Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center"
            >
              <FaRocket className="text-white text-xl" />
            </motion.div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <h1 className="text-xl font-bold">ZENTRO</h1>
              <p className="text-xs opacity-70">Ecosystem v2.0</p>
            </div>
          </div>
        </div>

        {/* User Quick Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.displayName?.charAt(0) || 'Z'}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-sm font-bold">{user?.displayName}</div>
              <div className="text-xs opacity-70">Level {userLevel} • Score {zentroScore}</div>
              <div className="text-xs text-purple-400">Influence: {influenceXP} XP</div>
            </div>
          </div>
        </div>

        {/* Navigation Modules */}
        <div className="flex-1 py-4">
          {Object.entries(ZENTRO_MODULES).map(([key, module]) => {
            const ModuleIcon = module.icon;
            const isActive = currentModule === key;
            const isUnlocked = module.unlocked;
            
            return (
              <motion.button
                key={key}
                whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                whileTap={{ scale: isUnlocked ? 0.95 : 1 }}
                onClick={() => handleModuleChange(key)}
                disabled={!isUnlocked}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600 text-white border-r-4 border-purple-400'
                    : isUnlocked
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'text-gray-600 cursor-not-allowed'
                } ${module.special ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="relative">
                  <ModuleIcon className={`text-xl ${!isUnlocked ? 'opacity-50' : ''}`} />
                  {!isUnlocked && (
                    <FaShieldAlt className="absolute -top-1 -right-1 text-xs text-red-500" />
                  )}
                  {notifications.some(n => n.type === key.replace('secretAlley', 'mission')) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="text-sm font-bold">{module.name}</div>
                  <div className="text-xs opacity-70">{module.description}</div>
                  {!isUnlocked && (
                    <div className="text-xs text-red-400">Level {key === 'talent' ? 2 : key === 'zentrium' ? 5 : 3} required</div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Theme Toggle & Settings */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center"
            >
              {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
            </motion.button>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="text-sm font-bold">Theme</div>
              <div className="text-xs opacity-70 capitalize">{theme} Mode</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-20 min-h-screen">
        {/* Top Header Bar */}
        <div className={`h-16 ${getSidebarClasses()} border-b flex items-center justify-between px-6`}>
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">{ZENTRO_MODULES[currentModule]?.name}</h2>
            <span className="text-sm opacity-70">{ZENTRO_MODULES[currentModule]?.description}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search Zentro..."
                className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center relative"
              >
                <FaBell />
                {notifications.filter(n => n.unread).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {notifications.filter(n => n.unread).length}
                  </div>
                )}
              </motion.button>
            </div>
            
            {/* Quick Actions */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
            >
              <FaPlus />
            </motion.button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentComponent
                user={user}
                theme={theme}
                zentroScore={zentroScore}
                userLevel={userLevel}
                influenceXP={influenceXP}
                notifications={notifications}
                onUserUpdate={setUser}
                onScoreUpdate={setZentroScore}
                onLevelUpdate={setUserLevel}
                onInfluenceUpdate={setInfluenceXP}
                onEnterSecretAlley={ZENTRO_MODULES[currentModule]?.onEnterSecretAlley}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Zentro Bot Assistant */}
      <ZentroBot user={user} theme={theme} />
    </div>
  );
};

export default ZentroEcosystem;
