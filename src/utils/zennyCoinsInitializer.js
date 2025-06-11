// Zenny Coins System Initializer
import zennyCoinsService from '../services/zennyCoinsService';

class ZennyCoinsInitializer {
  constructor() {
    this.initialized = false;
  }

  // Initialize the Zenny coin system (DISABLED per user preference)
  async initialize() {
    if (this.initialized) {
      console.log('✅ Zenny Coins system disabled per user preference');
      return;
    }

    try {
      console.log('🚀 Zenny Coins system disabled per user preference');

      // Skip initialization - Zenny coins are disabled
      // await zennyCoinsService.initializeAdminAccount();

      // Mark as initialized (but actually disabled)
      this.initialized = true;

      console.log('✅ Zenny Coins system disabled successfully!');
      
      // Show disabled message for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`
🚫 ZENTRO ZENNY COIN SYSTEM DISABLED 🚫

The Zenny coin system has been disabled per user preference.
Focus is now on core Phase 1 features:
• Zentro ID (Dynamic user stats)
• Battle System (Code/design/logic duels)
• Squad System with Team Wars
• ZennyGPT Memory Layer
• Achievement System
• Leaderboards

All features will use Firebase for real-time functionality.
        `);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Zenny Coins system:', error);
      // Don't throw error to prevent app from breaking
    }
  }

  // Award coins for user activities (DISABLED)
  async awardActivityCoins(userId, activityType) {
    // Zenny coins system is disabled per user preference
    console.log(`🚫 Zenny coin reward skipped for ${activityType} (system disabled)`);
    return null;
  }

  // Check if system is ready
  isReady() {
    return this.initialized;
  }
}

// Create and export singleton instance
const zennyCoinsInitializer = new ZennyCoinsInitializer();
export default zennyCoinsInitializer;
