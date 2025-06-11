import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome,
  FaEnvelope,
  FaUsers,
  FaEdit,
  FaBriefcase,
  FaRocket,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaDatabase,
  FaGamepad,
  FaShieldAlt
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { clearAuthState } from '../../firebase';
import { useMobileBehavior } from '../../hooks/useResponsive';

const MobileNavigation = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, isAdmin, canAccessAdminPanel } = useUser();
  const { isMobile, shouldShowMobileLayout } = useMobileBehavior();
  const [showSidebar, setShowSidebar] = useState(false);

  // Main navigation items for bottom bar
  const mainNavItems = [
    { 
      icon: <FaEnvelope />, 
      label: "Messages", 
      view: "dm",
      path: "/chat"
    },
    { 
      icon: <FaUsers />, 
      label: "Groups", 
      view: "groups",
      path: "/groups"
    },
    { 
      icon: <FaEdit />, 
      label: "Network", 
      view: "blog",
      path: "/chat"
    },
    { 
      icon: <FaBriefcase />, 
      label: "ZentroNet", 
      view: "professional",
      path: "/directory"
    },
    { 
      icon: <FaBars />, 
      label: "More", 
      action: () => setShowSidebar(true)
    }
  ];

  // Additional items for sidebar
  const sidebarItems = [
    {
      icon: <FaRocket />,
      label: "Zentrium",
      path: "/zentrium"
    },
    {
      icon: <FaUser />,
      label: "Profile",
      path: "/profile"
    }
  ];

  const handleLogout = async () => {
    try {
      await clearAuthState();
      // Clear all Zentro-related localStorage items
      localStorage.removeItem('zentro_user_displayName');
      localStorage.removeItem('zentro_user_email');
      localStorage.removeItem('zentro_user_age');
      localStorage.removeItem('zentro_remember_email');
      localStorage.removeItem('zentro_remember_me');
      localStorage.removeItem('zentro_profile_view');

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (item) => {
    if (item.action) {
      item.action();
      return;
    }

    if (item.path) {
      if (item.view === 'professional') {
        navigate(item.path);
      } else if (item.view === 'blog') {
        navigate('/chat', { state: { view: 'blog' } });
      } else {
        navigate(item.path);
      }
    } else if (item.view) {
      setCurrentView(item.view);
    }
  };

  const isActive = (item) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    return currentView === item.view;
  };

  if (!shouldShowMobileLayout) {
    return null;
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-800 border-t border-purple-500/30 z-40 md:hidden backdrop-blur-sm">
        <div className="flex items-center justify-around py-3 px-2">
          {mainNavItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center p-3 min-w-0 flex-1 rounded-xl transition-all duration-300 ${
                isActive(item)
                  ? 'text-white bg-gradient-to-t from-purple-600 to-purple-500 shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className={`text-xl mb-1 ${isActive(item) ? 'scale-110' : ''} transition-transform`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
              onClick={() => setShowSidebar(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <img
                    src={userProfile?.photoURL || '/default-avatar.png'}
                    alt={userProfile?.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-white font-medium">
                      {userProfile?.displayName || 'User'}
                    </div>
                    <div className="text-gray-400 text-sm">
                      {userProfile?.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleNavigation(item);
                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive(item)
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="text-lg">{item.icon}</div>
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Admin Section */}
                {(isAdmin() || canAccessAdminPanel()) && (
                  <div className="pt-4 border-t border-gray-700">
                    <div className="text-gray-500 text-sm font-medium mb-2 px-3">
                      Admin
                    </div>
                    
                    {canAccessAdminPanel() && (
                      <button
                        onClick={() => {
                          // This would open admin panel - implement as needed
                          setShowSidebar(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <FaCog className="text-lg" />
                        <span>Admin Panel</span>
                      </button>
                    )}

                    {isAdmin() && (
                      <button
                        onClick={() => {
                          // This would open data manager - implement as needed
                          setShowSidebar(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <FaDatabase className="text-lg" />
                        <span>Data Manager</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setShowSidebar(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Status Bar for Mobile */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-gray-800 border-b border-purple-500/30 z-30 md:hidden backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="text-white font-bold text-xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Zentro Chat
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={userProfile?.photoURL || '/default-avatar.png'}
                alt={userProfile?.displayName}
                className="w-10 h-10 rounded-full cursor-pointer border-2 border-purple-500/50 hover:border-purple-400 transition-colors shadow-lg"
                onClick={() => setShowSidebar(true)}
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
