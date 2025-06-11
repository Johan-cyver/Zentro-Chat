import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  FaGamepad,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaRocket,
  FaBolt,
  FaGem,
  FaShieldAlt,
  FaBriefcase,
  FaEdit,
  FaNewspaper,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import zentroIdService from '../../services/zentroIdService';

const AppSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  const logout = userContext?.logout;
  const { currentTheme } = useTheme();
  const [zentroId, setZentroId] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to compact icon-only mode

  useEffect(() => {
    if (userProfile?.uid) {
      // Load user data
      loadUserData();
    }
  }, [userProfile]);

  const loadUserData = async () => {
    try {
      const zentroData = await zentroIdService.getZentroId(userProfile.uid);
      setZentroId(zentroData);

      // Subscribe to real-time updates
      zentroIdService.subscribeToZentroId(userProfile.uid, setZentroId);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const navigationItems = [
    {
      id: 'messages',
      icon: FaComments,
      path: '/messages',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'secret-alley',
      icon: FaGem,
      path: '/secret-alley',
      color: 'from-red-500 to-purple-500',
      special: true
    },
    {
      id: 'zentrium',
      icon: FaRocket,
      path: '/zentrium',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'directory',
      icon: FaBriefcase,
      path: '/directory',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'blog',
      icon: FaNewspaper,
      path: '/blog',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: -280,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className="fixed left-0 top-0 h-full w-20 z-50 backdrop-blur-xl shadow-2xl transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, var(--theme-surface)ee, var(--theme-background)dd)`,
          borderRight: `1px solid var(--theme-border)`,
          backdropFilter: 'blur(20px)'
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-center" style={{ borderColor: 'var(--theme-border)' }}>
          <motion.div
            variants={itemVariants}
            className="cursor-pointer"
            onClick={() => handleNavigation('/dashboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Zentro Dashboard"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, var(--theme-accent), var(--theme-primary))` }}
            >
              <FaRocket className="text-white text-xl" />
            </div>
          </motion.div>
        </div>

        {/* User Profile */}
        <motion.div
          variants={itemVariants}
          className="p-4 border-b flex items-center justify-center"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <motion.button
            onClick={() => handleNavigation('/profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
            title={`${userProfile?.displayName || 'Profile'} - Level ${zentroId?.level || 1}`}
          >
            <img
              src={userProfile?.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-12 h-12 rounded-xl border-2"
              style={{ borderColor: 'var(--theme-accent)80' }}
            />
            {/* Level indicator */}
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-background)'
              }}
            >
              {zentroId?.level || 1}
            </div>
          </motion.button>
        </motion.div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {navigationItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.button
                  key={item.id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: item.special ? '0 0 15px rgba(239, 68, 68, 0.4)' : '0 0 10px var(--theme-primary)30'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNavigation(item.path)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl transition-all relative group"
                  style={{
                    backgroundColor: isActive
                      ? 'var(--theme-primary)60'
                      : 'var(--theme-background)40',
                    border: item.special
                      ? '2px solid var(--theme-error)50'
                      : '1px solid var(--theme-border)30'
                  }}
                  title={`${item.id.charAt(0).toUpperCase() + item.id.slice(1).replace('-', ' ')}`}
                >
                  <item.icon
                    className="text-lg"
                    style={{
                      color: isActive ? 'var(--theme-text)' : 'var(--theme-textMuted)'
                    }}
                  />

                  {/* Special glow effect for Secret Alley */}
                  {item.special && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/20 to-purple-500/20 animate-pulse" />
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation('/settings')}
              className="w-12 h-12 flex items-center justify-center rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--theme-background)40',
                border: '1px solid var(--theme-border)30',
                color: 'var(--theme-textMuted)'
              }}
              title="Settings"
            >
              <FaCog className="text-lg" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="w-12 h-12 flex items-center justify-center rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--theme-background)40',
                border: '1px solid var(--theme-error)30',
                color: 'var(--theme-error, #ef4444)'
              }}
              title="Logout"
            >
              <FaSignOutAlt className="text-lg" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AppSidebar;
