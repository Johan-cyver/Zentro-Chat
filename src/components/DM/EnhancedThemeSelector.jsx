import React, { useState, useRef } from 'react';
import { FaPalette, FaTimes, FaCheck, FaMoon, FaSun, FaUpload, FaImage } from 'react-icons/fa';
import { getThemesByCategory } from '../../styles/themes';

const EnhancedThemeSelector = ({ currentTheme, onThemeChange, onClose, chatId }) => {
  const [selectedCategory, setSelectedCategory] = useState('dark');
  const [customBackground, setCustomBackground] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);
  const fileInputRef = useRef(null);

  const darkThemes = getThemesByCategory('dark');
  const lightThemes = getThemesByCategory('light');

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setCustomBackground(imageUrl);

        // Create custom theme based on uploaded background
        const customTheme = createCustomThemeFromBackground(imageUrl);
        setPreviewTheme(customTheme);
      };
      reader.readAsDataURL(file);
    }
  };

  const createCustomThemeFromBackground = (imageUrl) => {
    // Create a custom theme with the uploaded background
    return {
      id: 'custom_background',
      name: 'Custom Background',
      category: 'custom',
      customBackground: imageUrl,
      colors: {
        primary: '#8B5CF6',
        secondary: '#A855F7',
        accent: '#C084FC',
        background: 'transparent',
        surface: 'rgba(26, 26, 46, 0.85)',
        surfaceVariant: 'rgba(22, 33, 62, 0.85)',
        text: '#FFFFFF',
        textSecondary: '#B8B8D1',
        textMuted: '#9CA3AF',
        border: '#8B5CF6',
        borderMuted: '#374151',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        userMessage: 'rgba(139, 92, 246, 0.9)',
        otherMessage: 'rgba(55, 65, 81, 0.9)',
        inputBackground: 'rgba(31, 41, 55, 0.9)',
        scrollbar: '#8B5CF6'
      },
      effects: {
        glow: true,
        blur: true,
        gradient: true,
        animation: true
      }
    };
  };

  const handleThemeSelect = (theme) => {
    setPreviewTheme(theme);
    // Don't apply immediately for preview - just store selection
  };

  const handleConfirmTheme = () => {
    if (previewTheme) {
      // Save custom background if exists
      if (previewTheme.customBackground) {
        localStorage.setItem(`zentro_custom_bg_${chatId}`, previewTheme.customBackground);
      }
      onThemeChange(previewTheme);
    }
    onClose();
  };

  const ThemePreview = ({ theme, isSelected, onClick }) => (
    <div
      onClick={() => onClick(theme)}
      className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
        isSelected
          ? 'border-purple-500 shadow-lg shadow-purple-500/25'
          : 'border-gray-600 hover:border-gray-500'
      }`}
      style={{
        background: theme.customBackground
          ? `url(${theme.customBackground}) center/cover`
          : `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.surfaceVariant})`
      }}
    >
      {theme.customBackground && (
        <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white text-sm">{theme.name}</h3>
          {isSelected && (
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <FaCheck className="text-white text-xs" />
            </div>
          )}
        </div>

        {/* Theme Preview Elements */}
        <div className="space-y-2">
          <div
            className="h-6 rounded px-2 py-1 text-xs flex items-center justify-end"
            style={{ backgroundColor: theme.colors.userMessage }}
          >
            <span className="text-white">Your message</span>
          </div>
          <div
            className="h-6 rounded px-2 py-1 text-xs flex items-center"
            style={{ backgroundColor: theme.colors.otherMessage }}
          >
            <span style={{ color: theme.colors.text }}>Friend's message</span>
          </div>
        </div>

        {/* Effects Indicators */}
        <div className="flex space-x-1 mt-3">
          {theme.effects.glow && <span className="text-yellow-400 text-xs">✨</span>}
          {theme.effects.gradient && <span className="text-blue-400 text-xs">🌊</span>}
          {theme.effects.animation && <span className="text-purple-400 text-xs">🎭</span>}
          {theme.effects.blur && <span className="text-green-400 text-xs">🌫️</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaPalette className="text-purple-400 text-xl" />
            <h2 className="text-xl font-bold text-white">Enhanced Theme Selector</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setSelectedCategory('dark')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
              selectedCategory === 'dark'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaMoon />
            <span>Dark Themes</span>
          </button>
          <button
            onClick={() => setSelectedCategory('light')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
              selectedCategory === 'light'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaSun />
            <span>Light Themes</span>
          </button>
          <button
            onClick={() => setSelectedCategory('custom')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
              selectedCategory === 'custom'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaImage />
            <span>Custom Background</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {selectedCategory === 'custom' ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Upload Custom Background</h3>
                <p className="text-gray-400 mb-6">
                  Upload your favorite image as a chat background. The app will automatically adjust colors for optimal readability.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mx-auto"
                >
                  <FaUpload />
                  <span>Choose Background Image</span>
                </button>
              </div>

              {customBackground && previewTheme && (
                <div className="mt-6">
                  <h4 className="text-white font-medium mb-4">Preview:</h4>
                  <ThemePreview
                    theme={previewTheme}
                    isSelected={true}
                    onClick={() => {}}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedCategory === 'dark' ? darkThemes : lightThemes).map(theme => (
                <ThemePreview
                  key={theme.id}
                  theme={theme}
                  isSelected={previewTheme?.id === theme.id}
                  onClick={handleThemeSelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400">
            {previewTheme ? `Selected: ${previewTheme.name}` : 'Select a theme to preview'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmTheme}
              disabled={!previewTheme}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedThemeSelector;
