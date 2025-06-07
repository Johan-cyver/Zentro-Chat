import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaUser, FaBriefcase, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import PersonalView from '../../components/SmartProfilePanel/PersonalView';
import ProfessionalView from '../../components/SmartProfilePanel/ProfessionalView';
import NotificationCenter from '../../components/Notifications/NotificationCenter';
import SettingsPanel from '../../components/Settings/SettingsPanel';
import ZentroSidebar from './ZentroSidebar';

// Neon theme utility
const neon = 'shadow-[0_0_16px_2px_rgba(139,92,246,0.7)] bg-gradient-to-br from-purple-900/80 to-blue-900/80';

// Export the ProfilePanel component that integrates our new Smart Profile Panel
export default function ProfilePanel({ user = null, onBack = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUser();

  // Check if we're viewing another user's profile from talent directory
  const viewUser = location.state?.viewUser;
  const initialViewMode = location.state?.viewMode || 'professional'; // Default to professional for others
  const isFromDirectory = location.state?.fromDirectory || viewUser?.fromDirectory || false;

  console.log('🔍 ProfilePanel Debug:', {
    viewUser: !!viewUser,
    fromDirectory: location.state?.fromDirectory,
    userFromDirectory: viewUser?.fromDirectory,
    isFromDirectory,
    locationState: location.state
  });

  const [mainTab, setMainTab] = useState(() => {
    // If viewing another user's profile from directory, force professional view
    if (viewUser && isFromDirectory) {
      return 'professional';
    }
    // If viewing another user's profile, use the specified view mode
    if (viewUser) {
      return initialViewMode;
    }
    // Otherwise, load saved view preference from localStorage
    return localStorage.getItem('zentro_profile_view') || 'personal';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentView, setCurrentView] = useState('profile');

  // Save view preference when it changes (only for own profile)
  useEffect(() => {
    if (!viewUser) {
      localStorage.setItem('zentro_profile_view', mainTab);
    }
  }, [mainTab, viewUser]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear all Zentro-related localStorage items
      localStorage.removeItem('zentro_user_displayName');
      localStorage.removeItem('zentro_user_email');
      localStorage.removeItem('zentro_user_age');
      localStorage.removeItem('zentro_remember_email');
      localStorage.removeItem('zentro_remember_me');
      localStorage.removeItem('zentro_profile_view');

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle view changes from sidebar
  const handleViewChange = (view) => {
    if (view === 'dm') {
      navigate('/chat');
    } else if (view === 'blog') {
      navigate('/blog');
    } else if (view === 'zentrium') {
      navigate('/zentrium');
    } else if (view === 'music') {
      navigate('/music');
    } else if (view === 'professional') {
      navigate('/directory');
    } else if (view === 'groups') {
      navigate('/groups');
    } else {
      setCurrentView(view);
    }
  };

  // Determine which user profile to display
  const displayUser = viewUser || user;
  const isViewingFromDirectory = displayUser?.fromDirectory || false;

  // Handle back navigation when viewing someone else's profile
  const handleBackToOwnProfile = () => {
    if (onBack) {
      onBack();
    } else {
      // Navigate back to own profile by clearing the state
      navigate('/profile', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 text-white font-sans">
      {/* Sidebar - Only show if not viewing from directory */}
      {!isViewingFromDirectory && (
        <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Header with back button and user profile picture */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            {(onBack || viewUser) && (
              <button
                onClick={handleBackToOwnProfile}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-300"
              >
                ← {viewUser ? 'Back to My Profile' : 'Back'}
              </button>
            )}
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              {viewUser ? `${viewUser.displayName}'s Profile` : 'Profile'}
            </h1>
            {viewUser && (
              <p className="text-gray-400 text-sm">
                Viewing profile
              </p>
            )}
          </div>

          {/* User Profile Picture and Actions */}
          {!viewUser && (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationCenter theme={{ colors: { text: '#FFFFFF' } }} />

              {/* Settings */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title="Settings"
              >
                <FaCog className="text-gray-400 hover:text-white text-lg" />
              </button>

              {/* User Profile Picture with Dropdown */}
              <div className="relative profile-menu-container">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-purple-500/50 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-purple-500/50 bg-gray-700 flex items-center justify-center">
                      <FaUser className="text-white text-lg" />
                    </div>
                  )}
                </button>

                {/* Profile Menu Dropdown */}
                {showProfileMenu && !isViewingFromDirectory && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setMainTab('personal');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                          mainTab === 'personal'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <FaUser className="text-xs" />
                        <span>Personal View</span>
                      </button>
                      <button
                        onClick={() => {
                          setMainTab('professional');
                          setShowProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                          mainTab === 'professional'
                            ? 'bg-purple-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <FaBriefcase className="text-xs" />
                        <span>Professional View</span>
                      </button>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <FaSignOutAlt className="text-xs" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Show view mode indicator when viewing from directory */}
                {isViewingFromDirectory && (
                  <div className="absolute right-0 top-full mt-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <FaBriefcase className="text-xs" />
                      <span>Professional View Only</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content with smooth transitions */}
        <AnimatePresence mode="wait">
          {mainTab === 'personal' ? (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <PersonalView user={displayUser} />
            </motion.div>
          ) : (
            <motion.div
              key="professional"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ProfessionalView user={displayUser} />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={{ colors: { text: '#FFFFFF' } }}
      />
    </div>
  );
}
