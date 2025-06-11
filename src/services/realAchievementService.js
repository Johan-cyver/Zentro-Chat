// Achievement System - Real progression tracking and rewards
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import zennyEconomyService from './zennyEconomyService';
import zentroIdService from './zentroIdService';

class RealAchievementService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    
    // Achievement definitions with real progression
    this.ACHIEVEMENTS = {
      // Battle Achievements
      FIRST_BLOOD: {
        id: 'first_blood',
        name: 'First Blood',
        description: 'Win your first battle',
        icon: '⚔️',
        category: 'battle',
        rarity: 'common',
        reward: { coins: 100, xp: 50 },
        condition: { type: 'battle_wins', value: 1 }
      },
      BATTLE_VETERAN: {
        id: 'battle_veteran',
        name: 'Battle Veteran',
        description: 'Win 10 battles',
        icon: '🛡️',
        category: 'battle',
        rarity: 'uncommon',
        reward: { coins: 500, xp: 200 },
        condition: { type: 'battle_wins', value: 10 }
      },
      UNSTOPPABLE: {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Win 5 battles in a row',
        icon: '🔥',
        category: 'battle',
        rarity: 'rare',
        reward: { coins: 1000, xp: 500 },
        condition: { type: 'win_streak', value: 5 }
      },
      LEGENDARY_WARRIOR: {
        id: 'legendary_warrior',
        name: 'Legendary Warrior',
        description: 'Win 100 battles',
        icon: '👑',
        category: 'battle',
        rarity: 'legendary',
        reward: { coins: 5000, xp: 2000 },
        condition: { type: 'battle_wins', value: 100 }
      },

      // Squad Achievements
      SQUAD_FOUNDER: {
        id: 'squad_founder',
        name: 'Squad Founder',
        description: 'Create your first squad',
        icon: '🏗️',
        category: 'squad',
        rarity: 'common',
        reward: { coins: 200, xp: 100 },
        condition: { type: 'squads_created', value: 1 }
      },

      // Economy Achievements
      COIN_COLLECTOR: {
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Earn 10,000 Zenny coins',
        icon: '💰',
        category: 'economy',
        rarity: 'rare',
        reward: { coins: 2500, xp: 1000 },
        condition: { type: 'total_coins_earned', value: 10000 }
      },
      HIGH_ROLLER: {
        id: 'high_roller',
        name: 'High Roller',
        description: 'Win a bet worth 1000+ coins',
        icon: '🎰',
        category: 'economy',
        rarity: 'epic',
        reward: { coins: 3000, xp: 1200 },
        condition: { type: 'biggest_bet_win', value: 1000 }
      },
      STREAK_MASTER: {
        id: 'streak_master',
        name: 'Streak Master',
        description: 'Maintain a 30-day login streak',
        icon: '📅',
        category: 'economy',
        rarity: 'legendary',
        reward: { coins: 10000, xp: 5000 },
        condition: { type: 'daily_streak', value: 30 }
      }
    };
  }

  // Initialize user achievements
  async initializeAchievements(userId) {
    try {
      const achievementsRef = doc(db, 'achievements', userId);
      const achievementsSnap = await getDoc(achievementsRef);
      
      if (!achievementsSnap.exists()) {
        const initialAchievements = {
          userId: userId,
          unlockedAchievements: [],
          progress: {},
          stats: {
            battle_wins: 0,
            win_streak: 0,
            longest_win_streak: 0,
            squads_created: 0,
            squads_joined: 0,
            squad_wins_as_leader: 0,
            mentees_helped: 0,
            friends_count: 0,
            total_coins_earned: 0,
            biggest_bet_win: 0,
            daily_streak: 0,
            challenges_completed: 0,
            design_wins: 0
          },
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        };
        
        await setDoc(achievementsRef, initialAchievements);
        return initialAchievements;
      }
      
      return achievementsSnap.data();
    } catch (error) {
      console.error('❌ Error initializing achievements:', error);
      throw error;
    }
  }

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      if (this.cache.has(userId)) {
        return this.cache.get(userId);
      }

      const achievementsRef = doc(db, 'achievements', userId);
      const achievementsSnap = await getDoc(achievementsRef);
      
      if (achievementsSnap.exists()) {
        const achievements = achievementsSnap.data();
        this.cache.set(userId, achievements);
        return achievements;
      }
      
      return await this.initializeAchievements(userId);
    } catch (error) {
      console.error('❌ Error getting achievements:', error);
      return null;
    }
  }

  // Update achievement progress
  async updateProgress(userId, statType, value = 1) {
    try {
      const achievementsRef = doc(db, 'achievements', userId);
      const achievements = await this.getUserAchievements(userId);
      
      if (!achievements) return;

      const currentValue = achievements.stats[statType] || 0;
      const newValue = statType === 'win_streak' ? value : currentValue + value;
      
      // Update stats
      const updateData = {
        [`stats.${statType}`]: newValue,
        lastUpdated: serverTimestamp()
      };

      // Special handling for streaks
      if (statType === 'win_streak' && newValue > (achievements.stats.longest_win_streak || 0)) {
        updateData['stats.longest_win_streak'] = newValue;
      }

      await updateDoc(achievementsRef, updateData);

      // Check for new achievements
      await this.checkAchievements(userId, { ...achievements.stats, [statType]: newValue });
      
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  }

  // Check and unlock achievements
  async checkAchievements(userId, stats) {
    try {
      const achievements = await this.getUserAchievements(userId);
      const unlockedIds = achievements.unlockedAchievements.map(a => a.id);
      const newUnlocks = [];

      for (const [key, achievement] of Object.entries(this.ACHIEVEMENTS)) {
        if (unlockedIds.includes(achievement.id)) continue;

        const { type, value } = achievement.condition;
        const currentValue = stats[type] || 0;

        if (currentValue >= value) {
          newUnlocks.push({
            ...achievement,
            unlockedAt: new Date().toISOString(),
            progress: currentValue
          });
        }
      }

      if (newUnlocks.length > 0) {
        await this.unlockAchievements(userId, newUnlocks);
      }

    } catch (error) {
      console.error('❌ Error checking achievements:', error);
    }
  }

  // Unlock achievements and give rewards
  async unlockAchievements(userId, newAchievements) {
    try {
      const achievementsRef = doc(db, 'achievements', userId);
      
      for (const achievement of newAchievements) {
        // Add achievement to user's collection
        await updateDoc(achievementsRef, {
          unlockedAchievements: arrayUnion(achievement),
          lastUpdated: serverTimestamp()
        });

        // Give rewards
        if (achievement.reward.coins > 0) {
          await zennyEconomyService.addCoins(
            userId, 
            achievement.reward.coins, 
            'achievement', 
            `Achievement unlocked: ${achievement.name}`,
            { achievementId: achievement.id }
          );
        }

        if (achievement.reward.xp > 0) {
          await zentroIdService.addXP(userId, achievement.reward.xp, `Achievement: ${achievement.name}`);
        }

        console.log(`🏆 Achievement unlocked for ${userId}: ${achievement.name}`);
      }

    } catch (error) {
      console.error('❌ Error unlocking achievements:', error);
    }
  }

  // Get achievement progress for display
  getAchievementProgress(stats, achievement) {
    const { type, value } = achievement.condition;
    const current = stats[type] || 0;
    const progress = Math.min(current / value, 1);
    
    return {
      current,
      target: value,
      progress: Math.round(progress * 100),
      completed: current >= value
    };
  }

  // Get achievements by category
  getAchievementsByCategory(category) {
    return Object.values(this.ACHIEVEMENTS).filter(a => a.category === category);
  }

  // Subscribe to achievement updates
  subscribeToAchievements(userId, callback) {
    try {
      const achievementsRef = doc(db, 'achievements', userId);
      
      const unsubscribe = onSnapshot(achievementsRef, (doc) => {
        if (doc.exists()) {
          const achievements = doc.data();
          this.cache.set(userId, achievements);
          callback(achievements);
        }
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to achievements:', error);
      return null;
    }
  }

  // Cleanup listeners
  cleanup(userId) {
    const listener = this.listeners.get(userId);
    if (listener) {
      listener();
      this.listeners.delete(userId);
    }
    this.cache.delete(userId);
  }
}

export default new RealAchievementService();
