// World Quest System - Narrative-driven challenges and community events
import { db } from '../firebase';
import { 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where,
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import zennyEconomyService from './zennyEconomyService';
import zentroIdService from './zentroIdService';
import realAchievementService from './realAchievementService';

class WorldQuestService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    
    // Quest definitions with narrative progression
    this.WORLD_QUESTS = {
      // Beginner Arc - "The Awakening"
      FIRST_STEPS: {
        id: 'first_steps',
        title: 'First Steps into Zentro',
        description: 'Welcome to Zentro! Complete your first battle to prove your worth.',
        narrative: 'The digital realm of Zentro awaits. Ancient algorithms whisper of a chosen developer who will unite the scattered code fragments...',
        type: 'tutorial',
        difficulty: 'beginner',
        requirements: {
          battles_completed: 1
        },
        rewards: {
          coins: 500,
          xp: 200,
          title: 'Zentro Initiate'
        },
        timeLimit: null, // No time limit
        isActive: true,
        chapter: 1
      },

      SQUAD_ALLIANCE: {
        id: 'squad_alliance',
        title: 'Forge Your Alliance',
        description: 'Join or create a squad to begin your journey with allies.',
        narrative: 'Alone, a developer is strong. Together, they are unstoppable. The ancient guilds of Zentro call for new alliances...',
        type: 'social',
        difficulty: 'beginner',
        requirements: {
          squad_joined: 1
        },
        rewards: {
          coins: 750,
          xp: 300,
          title: 'Alliance Forger'
        },
        timeLimit: null,
        isActive: true,
        chapter: 1
      },

      // Intermediate Arc - "The Trials"
      BATTLE_MASTERY: {
        id: 'battle_mastery',
        title: 'Master of Combat',
        description: 'Win 10 battles to prove your combat prowess.',
        narrative: 'The Battle Arenas echo with the clash of code and creativity. Only those who master both logic and innovation can claim victory...',
        type: 'combat',
        difficulty: 'intermediate',
        requirements: {
          battles_won: 10
        },
        rewards: {
          coins: 2000,
          xp: 1000,
          title: 'Battle Master',
          special: 'unlock_advanced_battles'
        },
        timeLimit: null,
        isActive: true,
        chapter: 2,
        prerequisites: ['first_steps']
      },

      COIN_EMPIRE: {
        id: 'coin_empire',
        title: 'Build Your Empire',
        description: 'Accumulate 5,000 Zenny coins through various activities.',
        narrative: 'The economy of Zentro flows like digital rivers. Those who understand its currents can build vast empires...',
        type: 'economy',
        difficulty: 'intermediate',
        requirements: {
          total_coins_earned: 5000
        },
        rewards: {
          coins: 1500,
          xp: 800,
          title: 'Coin Baron',
          special: 'unlock_premium_features'
        },
        timeLimit: null,
        isActive: true,
        chapter: 2,
        prerequisites: ['first_steps']
      },

      // Advanced Arc - "The Legends"
      LEGENDARY_STATUS: {
        id: 'legendary_status',
        title: 'Ascend to Legend',
        description: 'Reach Level 25 and unlock legendary status.',
        narrative: 'Few have walked the path to legend. The ancient servers remember only the greatest developers who shaped Zentro itself...',
        type: 'progression',
        difficulty: 'advanced',
        requirements: {
          level_reached: 25
        },
        rewards: {
          coins: 10000,
          xp: 5000,
          title: 'Zentro Legend',
          special: 'legendary_badge'
        },
        timeLimit: null,
        isActive: true,
        chapter: 3,
        prerequisites: ['battle_mastery', 'coin_empire']
      },

      // Community Events - Time-limited
      WEEKLY_CHALLENGE: {
        id: 'weekly_challenge',
        title: 'Weekly Coding Gauntlet',
        description: 'Complete 5 coding challenges this week.',
        narrative: 'The Code Masters have issued a challenge to all developers. Will you rise to meet it?',
        type: 'event',
        difficulty: 'intermediate',
        requirements: {
          challenges_completed_this_week: 5
        },
        rewards: {
          coins: 1000,
          xp: 500,
          title: 'Weekly Champion'
        },
        timeLimit: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        isActive: true,
        chapter: 0, // Events don't belong to chapters
        isRepeatable: true
      },

      SQUAD_WAR_EVENT: {
        id: 'squad_war_event',
        title: 'The Great Squad War',
        description: 'Participate in squad battles during the monthly war event.',
        narrative: 'Once a month, the greatest squads clash in epic battles. Honor, glory, and massive rewards await the victors...',
        type: 'event',
        difficulty: 'hard',
        requirements: {
          squad_battles_participated: 3
        },
        rewards: {
          coins: 5000,
          xp: 2500,
          title: 'War Veteran',
          special: 'exclusive_squad_badge'
        },
        timeLimit: 30 * 24 * 60 * 60 * 1000, // 30 days
        isActive: false, // Activated monthly
        chapter: 0,
        isRepeatable: true
      }
    };
  }

  // Initialize user quest progress
  async initializeQuestProgress(userId) {
    try {
      const questRef = doc(db, 'questProgress', userId);
      const questSnap = await getDoc(questRef);
      
      if (!questSnap.exists()) {
        const initialProgress = {
          userId: userId,
          activeQuests: [],
          completedQuests: [],
          currentChapter: 1,
          questStats: {
            battles_completed: 0,
            battles_won: 0,
            squad_joined: 0,
            total_coins_earned: 0,
            level_reached: 1,
            challenges_completed_this_week: 0,
            squad_battles_participated: 0
          },
          titles: [],
          specialUnlocks: [],
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        };
        
        // Auto-assign beginner quests
        initialProgress.activeQuests = [
          { questId: 'first_steps', startedAt: new Date().toISOString(), progress: {} },
          { questId: 'squad_alliance', startedAt: new Date().toISOString(), progress: {} }
        ];
        
        await setDoc(questRef, initialProgress);
        return initialProgress;
      }
      
      return questSnap.data();
    } catch (error) {
      console.error('❌ Error initializing quest progress:', error);
      throw error;
    }
  }

  // Get user quest progress
  async getUserQuestProgress(userId) {
    try {
      if (this.cache.has(userId)) {
        return this.cache.get(userId);
      }

      const questRef = doc(db, 'questProgress', userId);
      const questSnap = await getDoc(questRef);
      
      if (questSnap.exists()) {
        const progress = questSnap.data();
        this.cache.set(userId, progress);
        return progress;
      }
      
      return await this.initializeQuestProgress(userId);
    } catch (error) {
      console.error('❌ Error getting quest progress:', error);
      return null;
    }
  }

  // Update quest progress
  async updateQuestProgress(userId, statType, value = 1) {
    try {
      const questRef = doc(db, 'questProgress', userId);
      const progress = await this.getUserQuestProgress(userId);
      
      if (!progress) return;

      const currentValue = progress.questStats[statType] || 0;
      const newValue = currentValue + value;
      
      // Update stats
      await updateDoc(questRef, {
        [`questStats.${statType}`]: newValue,
        lastUpdated: serverTimestamp()
      });

      // Check quest completion
      await this.checkQuestCompletion(userId, { ...progress.questStats, [statType]: newValue });
      
    } catch (error) {
      console.error('❌ Error updating quest progress:', error);
    }
  }

  // Check quest completion
  async checkQuestCompletion(userId, stats) {
    try {
      const progress = await this.getUserQuestProgress(userId);
      const completedQuestIds = progress.completedQuests.map(q => q.questId);
      const newCompletions = [];

      for (const activeQuest of progress.activeQuests) {
        const quest = this.WORLD_QUESTS[activeQuest.questId.toUpperCase()];
        if (!quest || completedQuestIds.includes(quest.id)) continue;

        // Check if quest requirements are met
        const isCompleted = this.checkQuestRequirements(quest.requirements, stats);
        
        if (isCompleted) {
          newCompletions.push({
            questId: quest.id,
            completedAt: new Date().toISOString(),
            rewards: quest.rewards
          });
        }
      }

      if (newCompletions.length > 0) {
        await this.completeQuests(userId, newCompletions);
      }

    } catch (error) {
      console.error('❌ Error checking quest completion:', error);
    }
  }

  // Complete quests and give rewards
  async completeQuests(userId, completedQuests) {
    try {
      const questRef = doc(db, 'questProgress', userId);
      const progress = await this.getUserQuestProgress(userId);
      
      for (const completion of completedQuests) {
        const quest = this.WORLD_QUESTS[completion.questId.toUpperCase()];
        
        // Add to completed quests
        await updateDoc(questRef, {
          completedQuests: arrayUnion(completion),
          lastUpdated: serverTimestamp()
        });

        // Remove from active quests
        const updatedActiveQuests = progress.activeQuests.filter(
          aq => aq.questId !== completion.questId
        );
        
        await updateDoc(questRef, {
          activeQuests: updatedActiveQuests
        });

        // Give rewards
        if (quest.rewards.coins > 0) {
          await zennyEconomyService.addCoins(
            userId, 
            quest.rewards.coins, 
            'quest_reward', 
            `Quest completed: ${quest.title}`,
            { questId: quest.id }
          );
        }

        if (quest.rewards.xp > 0) {
          await zentroIdService.addXP(userId, quest.rewards.xp, `Quest: ${quest.title}`);
        }

        if (quest.rewards.title) {
          await updateDoc(questRef, {
            titles: arrayUnion(quest.rewards.title)
          });
        }

        if (quest.rewards.special) {
          await updateDoc(questRef, {
            specialUnlocks: arrayUnion(quest.rewards.special)
          });
        }

        console.log(`🗡️ Quest completed for ${userId}: ${quest.title}`);
        
        // Update achievement progress
        await realAchievementService.updateProgress(userId, 'quests_completed', 1);
      }

      // Check for new quest unlocks
      await this.checkNewQuestUnlocks(userId);

    } catch (error) {
      console.error('❌ Error completing quests:', error);
    }
  }

  // Check quest requirements
  checkQuestRequirements(requirements, stats) {
    for (const [key, value] of Object.entries(requirements)) {
      if ((stats[key] || 0) < value) {
        return false;
      }
    }
    return true;
  }

  // Check for new quest unlocks
  async checkNewQuestUnlocks(userId) {
    try {
      const progress = await this.getUserQuestProgress(userId);
      const completedQuestIds = progress.completedQuests.map(q => q.questId);
      const activeQuestIds = progress.activeQuests.map(q => q.questId);
      const newUnlocks = [];

      for (const [key, quest] of Object.entries(this.WORLD_QUESTS)) {
        if (completedQuestIds.includes(quest.id) || activeQuestIds.includes(quest.id)) continue;
        if (!quest.isActive) continue;

        // Check prerequisites
        if (quest.prerequisites) {
          const prerequisitesMet = quest.prerequisites.every(prereq => 
            completedQuestIds.includes(prereq)
          );
          
          if (prerequisitesMet) {
            newUnlocks.push({
              questId: quest.id,
              startedAt: new Date().toISOString(),
              progress: {}
            });
          }
        }
      }

      if (newUnlocks.length > 0) {
        const questRef = doc(db, 'questProgress', userId);
        await updateDoc(questRef, {
          activeQuests: arrayUnion(...newUnlocks),
          lastUpdated: serverTimestamp()
        });

        console.log(`🆕 New quests unlocked for ${userId}:`, newUnlocks.map(q => q.questId));
      }

    } catch (error) {
      console.error('❌ Error checking new quest unlocks:', error);
    }
  }

  // Get available quests for user
  getAvailableQuests(userProgress) {
    const completedIds = userProgress.completedQuests.map(q => q.questId);
    const activeIds = userProgress.activeQuests.map(q => q.questId);
    
    return Object.values(this.WORLD_QUESTS).filter(quest => {
      if (!quest.isActive) return false;
      if (completedIds.includes(quest.id) || activeIds.includes(quest.id)) return false;
      
      // Check prerequisites
      if (quest.prerequisites) {
        return quest.prerequisites.every(prereq => completedIds.includes(prereq));
      }
      
      return true;
    });
  }

  // Get quest progress for display
  getQuestProgress(quest, stats) {
    const progress = {};
    let totalProgress = 0;
    let totalRequirements = 0;
    
    for (const [key, value] of Object.entries(quest.requirements)) {
      const current = Math.min(stats[key] || 0, value);
      progress[key] = {
        current,
        target: value,
        percentage: Math.round((current / value) * 100)
      };
      totalProgress += current;
      totalRequirements += value;
    }
    
    return {
      ...progress,
      overall: Math.round((totalProgress / totalRequirements) * 100)
    };
  }

  // Subscribe to quest updates
  subscribeToQuestProgress(userId, callback) {
    try {
      const questRef = doc(db, 'questProgress', userId);
      
      const unsubscribe = onSnapshot(questRef, (doc) => {
        if (doc.exists()) {
          const progress = doc.data();
          this.cache.set(userId, progress);
          callback(progress);
        }
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to quest progress:', error);
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

export default new WorldQuestService();
