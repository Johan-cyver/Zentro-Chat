import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, applyTheme } from '../styles/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Try to load theme from localStorage
    const savedThemeId = localStorage.getItem('zentro_theme') ||
                        localStorage.getItem('dm_theme') ||
                        'corporate';
    return getTheme(savedThemeId);
  });

  const [dmThemes, setDmThemes] = useState({}); // Store per-DM themes
  const [groupThemes, setGroupThemes] = useState({}); // Store per-group themes
  const [isLoading, setIsLoading] = useState(true);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const applyThemeWithDelay = async () => {
      try {
        console.log('🎨 Applying theme:', currentTheme.name);

        // Apply theme immediately
        applyTheme(currentTheme);

        // Also apply to document body for global styling
        document.body.style.backgroundColor = currentTheme.colors.background;
        document.body.style.color = currentTheme.colors.text;

        // Add theme class to body for CSS targeting
        document.body.className = `theme-${currentTheme.id}`;

        // Apply all theme colors as CSS variables for consistent usage
        const root = document.documentElement;
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--theme-${key}`, value);
          root.style.setProperty(`--chat-${key}`, value); // For backward compatibility
        });

        // Apply effects
        root.style.setProperty('--theme-glow', currentTheme.effects.glow ? '1' : '0');
        root.style.setProperty('--theme-blur', currentTheme.effects.blur ? '1' : '0');
        root.style.setProperty('--theme-gradient', currentTheme.effects.gradient ? '1' : '0');
        root.style.setProperty('--theme-animation', currentTheme.effects.animation ? '1' : '0');

        // Small delay to ensure everything is applied
        await new Promise(resolve => setTimeout(resolve, 50));

        setIsLoading(false);
        console.log('✅ Theme applied successfully');
      } catch (error) {
        console.error('❌ Error applying theme:', error);
        setIsLoading(false);
      }
    };

    applyThemeWithDelay();
  }, [currentTheme]);

  const changeTheme = (newTheme) => {
    console.log('🔄 Changing theme to:', newTheme.name);
    setCurrentTheme(newTheme);

    // Persist to localStorage
    localStorage.setItem('zentro_theme', newTheme.id);
    localStorage.setItem('dm_theme', newTheme.id); // For backward compatibility

    // Apply immediately with full CSS variable update
    applyTheme(newTheme);

    // Update body styling
    document.body.style.backgroundColor = newTheme.colors.background;
    document.body.style.color = newTheme.colors.text;
    document.body.className = `theme-${newTheme.id}`;

    // Apply all theme colors as CSS variables immediately
    const root = document.documentElement;
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
      root.style.setProperty(`--chat-${key}`, value); // For backward compatibility
    });

    // Apply effects
    root.style.setProperty('--theme-glow', newTheme.effects.glow ? '1' : '0');
    root.style.setProperty('--theme-blur', newTheme.effects.blur ? '1' : '0');
    root.style.setProperty('--theme-gradient', newTheme.effects.gradient ? '1' : '0');
    root.style.setProperty('--theme-animation', newTheme.effects.animation ? '1' : '0');

    // Apply custom background if exists
    if (newTheme.customBackground) {
      document.body.style.backgroundImage = `url(${newTheme.customBackground})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
    }
  };

  // Get theme for specific DM
  const getDMTheme = (chatId) => {
    if (dmThemes[chatId]) {
      return dmThemes[chatId];
    }

    // Try to load from localStorage
    const savedTheme = localStorage.getItem(`zentro_dm_theme_${chatId}`);
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setDmThemes(prev => ({ ...prev, [chatId]: parsedTheme }));
        return parsedTheme;
      } catch (e) {
        console.error('Error parsing saved DM theme:', e);
      }
    }

    return currentTheme; // Fallback to global theme
  };

  // Set theme for specific DM
  const setDMTheme = (chatId, theme) => {
    setDmThemes(prev => ({ ...prev, [chatId]: theme }));
    localStorage.setItem(`zentro_dm_theme_${chatId}`, JSON.stringify(theme));
  };

  // Get theme for specific Group
  const getGroupTheme = (groupId) => {
    if (groupThemes[groupId]) {
      return groupThemes[groupId];
    }

    // Try to load from localStorage
    const savedTheme = localStorage.getItem(`zentro_group_theme_${groupId}`);
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setGroupThemes(prev => ({ ...prev, [groupId]: parsedTheme }));
        return parsedTheme;
      } catch (e) {
        console.error('Error parsing saved group theme:', e);
      }
    }

    return currentTheme; // Fallback to global theme
  };

  // Set theme for specific Group
  const setGroupTheme = (groupId, theme) => {
    setGroupThemes(prev => ({ ...prev, [groupId]: theme }));
    localStorage.setItem(`zentro_group_theme_${groupId}`, JSON.stringify(theme));
  };

  const value = {
    currentTheme,
    changeTheme,
    getDMTheme,
    setDMTheme,
    getGroupTheme,
    setGroupTheme,
    isLoading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
