// Chat themes configuration
export const chatThemes = {
  // Dark Themes
  neonPurple: {
    id: 'neonPurple',
    name: 'Neon Purple',
    category: 'dark',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#0F0F23',
      surface: '#1A1A2E',
      surfaceVariant: '#16213E',
      text: '#FFFFFF',
      textSecondary: '#B8B8D1',
      textMuted: '#6B7280',
      border: '#8B5CF6',
      borderMuted: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#8B5CF6',
      otherMessage: '#374151',
      inputBackground: '#1F2937',
      scrollbar: '#8B5CF6'
    },
    effects: {
      glow: true,
      blur: true,
      gradient: true,
      animation: true
    }
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    category: 'dark',
    colors: {
      primary: '#00FFFF',
      secondary: '#FF00FF',
      accent: '#FFFF00',
      background: '#0A0A0A',
      surface: '#1A0A1A',
      surfaceVariant: '#2A1A2A',
      text: '#00FFFF',
      textSecondary: '#FF00FF',
      textMuted: '#888888',
      border: '#00FFFF',
      borderMuted: '#333333',
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      userMessage: '#FF00FF',
      otherMessage: '#1A1A1A',
      inputBackground: '#0F0F0F',
      scrollbar: '#00FFFF'
    },
    effects: {
      glow: true,
      blur: false,
      gradient: true,
      animation: true
    }
  },

  matrix: {
    id: 'matrix',
    name: 'Matrix',
    category: 'dark',
    colors: {
      primary: '#00FF00',
      secondary: '#008000',
      accent: '#90EE90',
      background: '#000000',
      surface: '#001100',
      surfaceVariant: '#002200',
      text: '#00FF00',
      textSecondary: '#90EE90',
      textMuted: '#006600',
      border: '#00FF00',
      borderMuted: '#003300',
      success: '#00FF00',
      warning: '#FFFF00',
      error: '#FF0000',
      userMessage: '#008000',
      otherMessage: '#001100',
      inputBackground: '#000000',
      scrollbar: '#00FF00'
    },
    effects: {
      glow: true,
      blur: false,
      gradient: false,
      animation: true
    }
  },

  // Light Themes
  clean: {
    id: 'clean',
    name: 'Clean',
    category: 'light',
    colors: {
      primary: '#3B82F6',
      secondary: '#1D4ED8',
      accent: '#60A5FA',
      background: '#FFFFFF',
      surface: '#F8FAFC',
      surfaceVariant: '#F1F5F9',
      text: '#1F2937',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      border: '#E5E7EB',
      borderMuted: '#F3F4F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#3B82F6',
      otherMessage: '#F1F5F9',
      inputBackground: '#FFFFFF',
      scrollbar: '#D1D5DB'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: false,
      animation: false
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    category: 'light',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#666666',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      surfaceVariant: '#F5F5F5',
      text: '#000000',
      textSecondary: '#333333',
      textMuted: '#666666',
      border: '#E0E0E0',
      borderMuted: '#F0F0F0',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      userMessage: '#000000',
      otherMessage: '#F5F5F5',
      inputBackground: '#FFFFFF',
      scrollbar: '#CCCCCC'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: false,
      animation: false
    }
  },

  warm: {
    id: 'warm',
    name: 'Warm',
    category: 'light',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FB923C',
      background: '#FFF7ED',
      surface: '#FFEDD5',
      surfaceVariant: '#FED7AA',
      text: '#9A3412',
      textSecondary: '#C2410C',
      textMuted: '#EA580C',
      border: '#FDBA74',
      borderMuted: '#FED7AA',
      success: '#16A34A',
      warning: '#CA8A04',
      error: '#DC2626',
      userMessage: '#F97316',
      otherMessage: '#FFEDD5',
      inputBackground: '#FFFFFF',
      scrollbar: '#FB923C'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: true,
      animation: false
    }
  },

  // Advanced Dark Themes
  darkBlue: {
    id: 'darkBlue',
    name: 'Dark Blue',
    category: 'dark',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      accent: '#60A5FA',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceVariant: '#334155',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#64748B',
      border: '#3B82F6',
      borderMuted: '#475569',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#3B82F6',
      otherMessage: '#334155',
      inputBackground: '#1E293B',
      scrollbar: '#3B82F6'
    },
    effects: {
      glow: true,
      blur: true,
      gradient: true,
      animation: true
    }
  },

  neonGreen: {
    id: 'neonGreen',
    name: 'Neon Green',
    category: 'dark',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#0F1419',
      surface: '#1A2332',
      surfaceVariant: '#253344',
      text: '#ECFDF5',
      textSecondary: '#A7F3D0',
      textMuted: '#6B7280',
      border: '#10B981',
      borderMuted: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#10B981',
      otherMessage: '#253344',
      inputBackground: '#1A2332',
      scrollbar: '#10B981'
    },
    effects: {
      glow: true,
      blur: false,
      gradient: true,
      animation: true
    }
  },

  neonRed: {
    id: 'neonRed',
    name: 'Neon Red',
    category: 'dark',
    colors: {
      primary: '#EF4444',
      secondary: '#DC2626',
      accent: '#F87171',
      background: '#1A0A0A',
      surface: '#2A1A1A',
      surfaceVariant: '#3A2A2A',
      text: '#FEF2F2',
      textSecondary: '#FECACA',
      textMuted: '#6B7280',
      border: '#EF4444',
      borderMuted: '#374151',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#EF4444',
      otherMessage: '#3A2A2A',
      inputBackground: '#2A1A1A',
      scrollbar: '#EF4444'
    },
    effects: {
      glow: true,
      blur: false,
      gradient: true,
      animation: true
    }
  },

  // Minimal Theme (Default)
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    category: 'dark',
    colors: {
      primary: '#8B5CF6',
      secondary: '#A855F7',
      accent: '#C084FC',
      background: '#1F2937',
      surface: '#374151',
      surfaceVariant: '#4B5563',
      text: '#F9FAFB',
      textSecondary: '#E5E7EB',
      textMuted: '#9CA3AF',
      border: '#6B7280',
      borderMuted: '#4B5563',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      userMessage: '#8B5CF6',
      otherMessage: '#4B5563',
      inputBackground: '#374151',
      scrollbar: '#6B7280'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: false,
      animation: false
    }
  },

  // Professional Themes
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    category: 'light',
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#6B7280',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      surfaceVariant: '#F3F4F6',
      text: '#111827',
      textSecondary: '#374151',
      textMuted: '#6B7280',
      border: '#D1D5DB',
      borderMuted: '#E5E7EB',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      userMessage: '#1F2937',
      otherMessage: '#F3F4F6',
      inputBackground: '#FFFFFF',
      scrollbar: '#9CA3AF'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: false,
      animation: false
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    category: 'light',
    colors: {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent: '#38BDF8',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      surfaceVariant: '#BAE6FD',
      text: '#0C4A6E',
      textSecondary: '#075985',
      textMuted: '#0369A1',
      border: '#7DD3FC',
      borderMuted: '#BAE6FD',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
      userMessage: '#0EA5E9',
      otherMessage: '#E0F2FE',
      inputBackground: '#FFFFFF',
      scrollbar: '#38BDF8'
    },
    effects: {
      glow: false,
      blur: false,
      gradient: true,
      animation: false
    }
  }
};

// Helper function to get theme by ID
export const getTheme = (themeId) => {
  return chatThemes[themeId] || chatThemes.corporate;
};

// Helper function to get all themes by category
export const getThemesByCategory = (category) => {
  return Object.values(chatThemes).filter(theme => theme.category === category);
};

// Helper function to apply theme to CSS variables with immediate effect
export const applyTheme = (theme) => {
  const root = document.documentElement;

  // Apply theme colors immediately
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--chat-${key}`, value);
  });

  // Apply effects
  root.style.setProperty('--chat-glow', theme.effects.glow ? '1' : '0');
  root.style.setProperty('--chat-blur', theme.effects.blur ? '1' : '0');
  root.style.setProperty('--chat-gradient', theme.effects.gradient ? '1' : '0');
  root.style.setProperty('--chat-animation', theme.effects.animation ? '1' : '0');

  // Force immediate repaint
  root.style.display = 'none';
  // Trigger reflow
  const _ = root.offsetHeight;
  root.style.display = '';

  // Persist theme preference
  localStorage.setItem('zentro_theme', theme.id);

  console.log('✅ Theme applied:', theme.name);
};

// Default theme
export const defaultTheme = chatThemes.corporate;
