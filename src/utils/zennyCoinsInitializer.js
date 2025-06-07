// Zenny Coins System Initializer
import zennyCoinsService from '../services/zennyCoinsService';

class ZennyCoinsInitializer {
  constructor() {
    this.initialized = false;
  }

  // Initialize the Zenny coin system
  async initialize() {
    if (this.initialized) {
      console.log('✅ Zenny Coins system already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Zenny Coins system...');
      
      // Initialize admin account with 1M Zenny coins
      await zennyCoinsService.initializeAdminAccount();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log('✅ Zenny Coins system initialized successfully!');
      
      // Show welcome message for development
      if (process.env.NODE_ENV === 'development') {
        console.log(`
🎉 ZENTRO ZENNY COIN SYSTEM ACTIVATED! 🎉

💰 Features Available:
• Earn Zenny coins through activities
• Purchase coins with real money (1 USD = 0.5 Zenny)
• Apply boosts to apps (Bronze, Silver, Gold, Platinum, Diamond)
• Participate in weekly spotlight auctions
• Admin account initialized with 1,000,000 Zenny coins

🏆 Spotlight Auction System:
• Every Saturday at 7 PM IST
• 7 spotlight positions available
• 15 minutes per position auction
• Winners get 1 week of spotlight visibility

🚀 Boost System:
• Bronze: 10 Zenny (Basic visibility)
• Silver: 25 Zenny (Enhanced visibility + badge)
• Gold: 50 Zenny (High visibility + trending)
• Platinum: 100 Zenny (Premium visibility + analytics)
• Diamond: 200 Zenny (Maximum visibility + VIP support)

💡 Activity Rewards:
• Daily login: 5 Zenny
• Send message: 1 Zenny
• Create post: 10 Zenny
• App upload: 50 Zenny
• Win auction: 25 Zenny

🔒 Security Features:
• Server-side validation
• Daily earning limits
• Audit logs
• Anti-cheat protection
        `);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Zenny Coins system:', error);
      // Don't throw error to prevent app from breaking
    }
  }

  // Award coins for user activities
  async awardActivityCoins(userId, activityType) {
    if (!this.initialized) {
      console.warn('Zenny Coins system not initialized, skipping reward');
      return;
    }

    const rewards = zennyCoinsService.getActivityRewards();
    const amount = rewards[activityType];
    
    if (amount) {
      try {
        const result = await zennyCoinsService.awardCoins(
          userId, 
          amount, 
          activityType, 
          `Earned ${amount} Zenny coins for ${activityType.replace('_', ' ')}`
        );
        
        if (result.success) {
          console.log(`💰 Awarded ${amount} Zenny coins for ${activityType}`);
          return result;
        } else {
          console.warn(`Failed to award coins: ${result.error}`);
        }
      } catch (error) {
        console.error('Error awarding activity coins:', error);
      }
    }
    
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
