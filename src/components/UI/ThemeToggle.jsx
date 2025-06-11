import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme, getThemesByCategory } from '../../styles/themes';
import {
  FaBriefcase,
  FaGamepad,
  FaPalette,
  FaMinus,
  FaMoon,
  FaSun,
  FaDesktop
} from 'react-icons/fa';

const ThemeToggle = ({ variant = 'full', className = '' }) => {
  const { currentTheme, changeTheme } = useTheme();

  // Get available themes from the existing theme system
  const availableThemes = [
    { id: 'corporate', name: 'Corporate', icon: FaBriefcase },
    { id: 'gaming', name: 'Gaming', icon: FaGamepad },
    { id: 'creative', name: 'Creative', icon: FaPalette },
    { id: 'minimal', name: 'Minimal', icon: FaMinus }
  ];

  // Simple theme selection for minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <select
          value={currentTheme?.id || 'gaming'}
          onChange={(e) => {
            const selectedTheme = getTheme(e.target.value);
            if (selectedTheme && changeTheme) {
              changeTheme(selectedTheme);
            }
          }}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {availableThemes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Gaming theme cards
  if (variant === 'gaming') {
    return (
      <div className={`grid grid-cols-2 gap-3 ${className}`}>
        {availableThemes.map((theme) => {
          const IconComponent = theme.icon;
          const isActive = currentTheme?.id === theme.id;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const selectedTheme = getTheme(theme.id);
                if (selectedTheme && changeTheme) {
                  changeTheme(selectedTheme);
                }
              }}
              className={`relative p-4 rounded-2xl border-2 transition-all ${
                isActive
                  ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/25'
                  : 'border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <IconComponent className={`text-2xl ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {theme.name}
                </span>
              </div>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  }

  // Default: simple button list
  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm text-gray-400 mb-3">Select Theme:</p>
      <div className="grid grid-cols-2 gap-2">
        {availableThemes.map((theme) => {
          const IconComponent = theme.icon;
          const isActive = currentTheme?.id === theme.id;

          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const selectedTheme = getTheme(theme.id);
                if (selectedTheme && changeTheme) {
                  changeTheme(selectedTheme);
                }
              }}
              className={`flex items-center space-x-2 p-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <IconComponent className="text-lg" />
              <span className="font-medium">{theme.name}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );


};

export default ThemeToggle;
