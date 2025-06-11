// Professional Boost Service
// Handles boosting professional profiles in the directory

import zennyCoinsService from './zennyCoinsService';

class ProfessionalBoostService {
  constructor() {
    this.storageKey = 'zentro_professional_boosts';
  }

  // Boost levels for professional profiles
  getBoostLevels() {
    return [
      {
        id: 'bronze',
        name: 'Bronze Boost',
        cost: 15,
        priority: 1,
        duration: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
        color: 'from-orange-600 to-yellow-600',
        benefits: ['Basic visibility boost', 'Appears in boosted section', '+10% discovery rate']
      },
      {
        id: 'silver',
        name: 'Silver Boost',
        cost: 35,
        priority: 2,
        duration: 3 * 24 * 60 * 60 * 1000, // 3 days
        color: 'from-gray-400 to-gray-600',
        benefits: ['Enhanced visibility', 'Priority in search results', '+25% discovery rate', 'Silver badge']
      },
      {
        id: 'gold',
        name: 'Gold Boost',
        cost: 75,
        priority: 3,
        duration: 4 * 24 * 60 * 60 * 1000, // 4 days
        color: 'from-yellow-400 to-yellow-600',
        benefits: ['High visibility boost', 'Featured in trending', '+50% discovery rate', 'Gold badge']
      },
      {
        id: 'platinum',
        name: 'Platinum Boost',
        cost: 150,
        priority: 4,
        duration: 5 * 24 * 60 * 60 * 1000, // 5 days
        color: 'from-purple-400 to-purple-600',
        benefits: ['Premium visibility', 'Top of directory', '+75% discovery rate', 'Platinum badge', 'Priority support']
      },
      {
        id: 'diamond',
        name: 'Diamond Boost',
        cost: 300,
        priority: 5,
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        color: 'from-cyan-400 to-blue-600',
        benefits: ['Maximum visibility', 'Homepage featured', '+100% discovery rate', 'Diamond badge', 'VIP support', 'Custom promotion']
      }
    ];
  }

  // Get all active boosts
  getAllBoosts() {
    try {
      const boosts = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return boosts.filter(boost => new Date(boost.endTime) > new Date());
    } catch (error) {
      console.error('Error loading professional boosts:', error);
      return [];
    }
  }

  // Get boost for specific professional
  getProfessionalBoost(userId) {
    const boosts = this.getAllBoosts();
    return boosts.find(boost => boost.userId === userId && new Date(boost.endTime) > new Date());
  }

  // Apply boost to professional profile
  async applyBoost(userId, boostLevel) {
    try {
      const boostLevels = this.getBoostLevels();
      const boost = boostLevels.find(b => b.id === boostLevel);
      
      if (!boost) {
        return { success: false, error: 'Invalid boost level' };
      }

      // Check if user has enough Zenny coins
      const userBalance = await zennyCoinsService.getBalance(userId);
      if (userBalance < boost.cost) {
        return { success: false, error: 'Insufficient Zenny coins' };
      }

      // Spend Zenny coins
      const spendResult = await zennyCoinsService.spendCoins(
        userId, 
        boost.cost, 
        'professional_boost', 
        `Applied ${boost.name} to professional profile`
      );

      if (!spendResult.success) {
        return { success: false, error: 'Failed to spend Zenny coins' };
      }

      // Create boost record
      const boostRecord = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId,
        level: boostLevel,
        priority: boost.priority,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + boost.duration).toISOString(),
        cost: boost.cost,
        transactionId: spendResult.transaction.id,
        createdAt: new Date().toISOString()
      };

      // Save boost record
      const existingBoosts = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      
      // Remove any existing boost for this user
      const filteredBoosts = existingBoosts.filter(b => b.userId !== userId);
      filteredBoosts.push(boostRecord);
      
      localStorage.setItem(this.storageKey, JSON.stringify(filteredBoosts));

      console.log(`✅ Applied ${boost.name} to professional profile for user ${userId}`);
      return { success: true, boost: boostRecord };

    } catch (error) {
      console.error('Error applying professional boost:', error);
      return { success: false, error: 'Failed to apply boost' };
    }
  }

  // Remove expired boosts
  cleanupExpiredBoosts() {
    try {
      const boosts = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      const activeBoosts = boosts.filter(boost => new Date(boost.endTime) > new Date());
      localStorage.setItem(this.storageKey, JSON.stringify(activeBoosts));
      return activeBoosts;
    } catch (error) {
      console.error('Error cleaning up expired boosts:', error);
      return [];
    }
  }

  // Get boost statistics
  getBoostStats() {
    const boosts = this.getAllBoosts();
    const stats = {
      total: boosts.length,
      byLevel: {},
      totalSpent: 0
    };

    boosts.forEach(boost => {
      stats.byLevel[boost.level] = (stats.byLevel[boost.level] || 0) + 1;
      stats.totalSpent += boost.cost || 0;
    });

    return stats;
  }

  // Check if user can apply boost (not already boosted)
  canApplyBoost(userId) {
    const existingBoost = this.getProfessionalBoost(userId);
    return !existingBoost;
  }

  // Get remaining boost time
  getRemainingTime(userId) {
    const boost = this.getProfessionalBoost(userId);
    if (!boost) return 0;
    
    const endTime = new Date(boost.endTime);
    const now = new Date();
    return Math.max(0, endTime - now);
  }

  // Format remaining time for display
  formatRemainingTime(userId) {
    const remaining = this.getRemainingTime(userId);
    if (remaining === 0) return 'Expired';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}

export default new ProfessionalBoostService();
