import React, { useState } from 'react';
import { FaPalette, FaTimes, FaCheck, FaMoon, FaSun } from 'react-icons/fa';
import { chatThemes, getThemesByCategory } from '../../styles/themes';

const DMThemeSelector = ({ currentTheme, onThemeChange, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('dark');
  const darkThemes = getThemesByCategory('dark');
  const lightThemes = getThemesByCategory('light');

  const ThemePreview = ({ theme, isSelected, onClick }) => (
    <div
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
        isSelected ? 'ring-4 ring-blue-500 scale-105' : 'hover:scale-102'
      }`}
      onClick={onClick}
    >
      {/* Theme Preview */}
      <div 
        className="h-24 p-3 flex flex-col justify-between"
        style={{ backgroundColor: theme.colors.background }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: theme.colors.primary }}
          />
          <div className="flex space-x-1">
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: theme.colors.textMuted }}
            />
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: theme.colors.textMuted }}
            />
            <div 
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: theme.colors.textMuted }}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-1">
          <div className="flex justify-end">
            <div 
              className="px-2 py-1 rounded-lg text-xs"
              style={{ 
                backgroundColor: theme.colors.userMessage,
                color: 'white'
              }}
            >
              Hello!
            </div>
          </div>
          <div className="flex justify-start">
            <div 
              className="px-2 py-1 rounded-lg text-xs"
              style={{ 
                backgroundColor: theme.colors.otherMessage,
                color: theme.colors.text
              }}
            >
              Hi there
            </div>
          </div>
        </div>
      </div>

      {/* Theme Name */}
      <div 
        className="px-3 py-2 text-center text-sm font-medium"
        style={{ 
          backgroundColor: theme.colors.surface,
          color: theme.colors.text
        }}
      >
        {theme.name}
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
          <FaCheck className="text-xs" />
        </div>
      )}

      {/* Effects Indicators */}
      {theme.effects.glow && (
        <div className="absolute top-2 left-2 text-yellow-400 text-xs">
          ✨
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FaPalette className="text-2xl text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose Theme
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Category Selector */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSelectedCategory('dark')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
              selectedCategory === 'dark'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FaMoon />
            <span>Dark Themes</span>
          </button>
          <button
            onClick={() => setSelectedCategory('light')}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
              selectedCategory === 'light'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <FaSun />
            <span>Light Themes</span>
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(selectedCategory === 'dark' ? darkThemes : lightThemes).map(theme => (
              <ThemePreview
                key={theme.id}
                theme={theme}
                isSelected={currentTheme?.id === theme.id}
                onClick={() => onThemeChange(theme)}
              />
            ))}
          </div>

          {/* Theme Features */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Theme Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">✨</span>
                  <span className="text-gray-700 dark:text-gray-300">Glow Effects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">🌊</span>
                  <span className="text-gray-700 dark:text-gray-300">Gradient Backgrounds</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-400">🎭</span>
                  <span className="text-gray-700 dark:text-gray-300">Smooth Animations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">🎨</span>
                  <span className="text-gray-700 dark:text-gray-300">Custom Color Schemes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Theme will be applied immediately and saved to your preferences
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DMThemeSelector;
