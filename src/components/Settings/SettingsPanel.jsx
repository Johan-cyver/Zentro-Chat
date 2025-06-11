import React, { useState, useEffect } from 'react';
import { FaCog, FaTimes, FaBell, FaVolumeUp, FaVolumeOff, FaEye, FaEyeSlash, FaPalette, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../Notifications/CustomNotificationSystem';
import notificationService from '../../services/notificationService';
import { clearAuthState } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../UI/ThemeToggle';

const SettingsPanel = ({ isOpen, onClose, theme }) => {
  const userContext = useUser();
  const userProfile = userContext?.userProfile;
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    notificationSound: true,
    showOnlineStatus: true,
    autoReadMessages: false,
    compactMode: false,
    darkMode: true
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('zentro_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('zentro_settings', JSON.stringify(newSettings));

    // Apply notification settings
    notificationService.setEnabled(newSettings.notifications);
    notificationService.setSoundEnabled(newSettings.notificationSound);
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

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
      localStorage.removeItem('zentro_settings');
      localStorage.removeItem('dm_theme');

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const testNotification = () => {
    notificationService.showInfo('This is a test notification!', 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <FaCog className="text-purple-400" />
              <span>Settings</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* User Profile Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FaUser className="text-purple-400" />
              <span>Profile</span>
            </h3>

            <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <FaUser className="text-2xl" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h4 className="text-white font-medium">
                  {userProfile?.displayName || 'User'}
                </h4>
                <p className="text-gray-400 text-sm">
                  {userProfile?.email}
                </p>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FaBell className="text-purple-400" />
              <span>Notifications</span>
            </h3>

            <div className="space-y-4">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Enable Notifications</h4>
                  <p className="text-gray-400 text-sm">Receive in-app notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Notification Sound */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium flex items-center space-x-2">
                    {settings.notificationSound ? <FaVolumeUp /> : <FaVolumeOff />}
                    <span>Notification Sounds</span>
                  </h4>
                  <p className="text-gray-400 text-sm">Play sound for notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notificationSound}
                    onChange={(e) => handleSettingChange('notificationSound', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Test Notification */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <button
                  onClick={testNotification}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Test Notification
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FaEye className="text-purple-400" />
              <span>Privacy</span>
            </h3>

            <div className="space-y-4">
              {/* Show Online Status */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium flex items-center space-x-2">
                    {settings.showOnlineStatus ? <FaEye /> : <FaEyeSlash />}
                    <span>Show Online Status</span>
                  </h4>
                  <p className="text-gray-400 text-sm">Let others see when you're online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showOnlineStatus}
                    onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Auto Read Messages */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Auto-read Messages</h4>
                  <p className="text-gray-400 text-sm">Automatically mark messages as read</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoReadMessages}
                    onChange={(e) => handleSettingChange('autoReadMessages', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FaPalette className="text-purple-400" />
              <span>Appearance</span>
            </h3>

            <div className="space-y-4">
              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Compact Mode</h4>
                  <p className="text-gray-400 text-sm">Use smaller spacing and elements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Theme Selection */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">App Theme</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Choose your preferred visual style for the entire app
                </p>
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">Current: {currentTheme?.name || 'Default'}</p>
                  <ThemeToggle variant="minimal" />
                </div>
              </div>

              {/* Chat Themes */}
              <div className="p-4 bg-gray-800 rounded-lg">
                <h4 className="text-white font-medium mb-2">Chat Themes</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Change individual chat themes from within the DM interface
                </p>
                <button
                  onClick={() => navigate('/chat')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  Go to Chat
                </button>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <FaUser className="text-purple-400" />
              <span>Account</span>
            </h3>

            <div className="p-4 bg-gray-800 rounded-lg">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
