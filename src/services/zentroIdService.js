// Zentro ID Service - Dynamic Profile Engine with Firebase
// Tracks user activities, achievements, and generates dynamic bio/timeline

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

class ZentroIdService {
  constructor() {
    this.listeners = new Map(); // Store Firebase listeners
    this.cache = new Map(); // Cache user data locally
  }

  // Initialize user's Zentro ID in Firebase
  async initializeZentroId(userId, userProfile) {
    try {
      const zentroId = {
        userId: userId,
        displayName: userProfile.displayName || 'Anonymous',
        avatar: userProfile.photoURL || null,
        joinDate: serverTimestamp(),
        level: 1,
        xp: 0,
        stats: {
          collabsCompleted: 0,
          battlesWon: 0,
          battlesLost: 0,
          squadRank: 'Rookie',
          menteesCount: 0,
          mentorCount: 0,
          achievementsUnlocked: 0,
          totalXpEarned: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        currentSquad: null,
        specializations: [],
        recentActivities: [],
        achievements: [],
        badges: [],
        discoveryMode: true,
        status: 'active', // active, stealth, busy
        mood: 'focused', // focused, chill, grinding
        dynamicBio: '',
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      // Save to Firebase
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      await setDoc(userRef, zentroId);

      // Cache locally
      this.cache.set(userId, zentroId);

      console.log('✅ Zentro ID initialized for user:', userId);
      return zentroId;
    } catch (error) {
      console.error('❌ Error initializing Zentro ID:', error);
      throw error;
    }
  }

  // Get user's Zentro ID from Firebase
  async getZentroId(userId) {
    try {
      // Try to get from cache first
      if (this.cache.has(userId)) {
        return this.cache.get(userId);
      }

      // Load from Firebase
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const zentroId = docSnap.data();
        this.cache.set(userId, zentroId);
        return zentroId;
      }

      // Return null if not found (needs initialization)
      return null;
    } catch (error) {
      console.error('❌ Error getting Zentro ID:', error);
      return null;
    }
  }

  // Subscribe to real-time Zentro ID updates
  subscribeToZentroId(userId, callback) {
    try {
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');

      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          const zentroId = doc.data();
          this.cache.set(userId, zentroId);
          callback(zentroId);
        } else {
          callback(null);
        }
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to Zentro ID:', error);
      return null;
    }
  }

  // Update user statistics after activities in Firebase
  async updateStats(userId, activityType, data = {}) {
    try {
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      let xpGained = 0;
      let updateData = {};

      switch (activityType) {
        case 'battle_won':
          updateData = {
            'stats.battlesWon': increment(1),
            xp: increment(50),
            'stats.totalXpEarned': increment(50)
          };
          xpGained = 50;
          await this.addActivity(userId, 'Won a battle', data.battleType || 'Unknown', xpGained);
          break;

        case 'battle_lost':
          updateData = {
            'stats.battlesLost': increment(1),
            xp: increment(10),
            'stats.totalXpEarned': increment(10)
          };
          xpGained = 10;
          await this.addActivity(userId, 'Participated in battle', data.battleType || 'Unknown', xpGained);
          break;

        case 'collab_completed':
          updateData = {
            'stats.collabsCompleted': increment(1),
            xp: increment(30),
            'stats.totalXpEarned': increment(30)
          };
          xpGained = 30;
          await this.addActivity(userId, 'Completed collaboration', data.projectName || 'Project', xpGained);
          break;

        case 'mentee_added':
          updateData = {
            'stats.menteesCount': increment(1),
            xp: increment(25),
            'stats.totalXpEarned': increment(25)
          };
          xpGained = 25;
          await this.addActivity(userId, 'Started mentoring', data.menteeName || 'Someone', xpGained);
          break;

        case 'achievement_unlocked':
          xpGained = data.xpReward || 20;
          updateData = {
            'stats.achievementsUnlocked': increment(1),
            xp: increment(xpGained),
            'stats.totalXpEarned': increment(xpGained),
            achievements: arrayUnion(data.achievementId)
          };
          await this.addActivity(userId, 'Unlocked achievement', data.achievementName || 'Achievement', xpGained);
          break;

        case 'squad_joined':
          updateData = {
            currentSquad: data.squadId,
            'stats.squadRank': data.rank || 'Member',
            xp: increment(15),
            'stats.totalXpEarned': increment(15)
          };
          xpGained = 15;
          await this.addActivity(userId, 'Joined squad', data.squadName || 'Squad', xpGained);
          break;

        default:
          console.warn('Unknown activity type:', activityType);
          return false;
      }

      // Update level based on new XP
      const currentData = await this.getZentroId(userId);
      if (currentData) {
        const newXp = currentData.xp + xpGained;
        const newLevel = this.calculateLevel(newXp);
        if (newLevel > currentData.level) {
          updateData.level = newLevel;
        }
      }

      updateData.lastUpdated = serverTimestamp();

      // Update in Firebase
      await updateDoc(userRef, updateData);

      console.log(`✅ Zentro ID updated for ${userId}: +${xpGained} XP (${activityType})`);
      return true;
    } catch (error) {
      console.error('❌ Error updating Zentro ID stats:', error);
      return false;
    }
  }

  // Add activity to timeline in Firebase
  async addActivity(userId, action, details, xpGained = 0) {
    try {
      const activity = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: action,
        details: details,
        xpGained: xpGained,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString() // For sorting
      };

      // Add to user's activity collection
      const activityRef = doc(db, 'users', userId, 'activities', activity.id);
      await setDoc(activityRef, activity);

      console.log(`✅ Activity added for ${userId}: ${action}`);
      return activity;
    } catch (error) {
      console.error('❌ Error adding activity:', error);
      throw error;
    }
  }

  // Get user's activity timeline from Firebase
  async getActivityTimeline(userId, limitCount = 20) {
    try {
      const activitiesRef = collection(db, 'users', userId, 'activities');
      const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(limitCount));

      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const activities = [];
          snapshot.forEach((doc) => {
            activities.push({ id: doc.id, ...doc.data() });
          });
          resolve(activities);
        });

        // Store listener for cleanup
        this.listeners.set(`${userId}_activities`, unsubscribe);
      });
    } catch (error) {
      console.error('❌ Error getting activity timeline:', error);
      return [];
    }
  }

  // Generate dynamic bio based on user stats
  generateDynamicBio(zentroId) {
    if (!zentroId) return "New Zentro Explorer";

    const stats = zentroId.stats;
    let bio = [];

    // Squad info
    if (zentroId.currentSquad) {
      bio.push(`${zentroId.stats.squadRank} of Squad ${zentroId.currentSquad}`);
    }

    // Battle record
    if (stats.battlesWon > 0 || stats.battlesLost > 0) {
      const winRate = stats.battlesWon + stats.battlesLost > 0
        ? Math.round((stats.battlesWon / (stats.battlesWon + stats.battlesLost)) * 100)
        : 0;
      bio.push(`${stats.battlesWon}W-${stats.battlesLost}L (${winRate}% win rate)`);
    }

    // Collaboration count
    if (stats.collabsCompleted > 0) {
      bio.push(`${stats.collabsCompleted} collabs completed`);
    }

    // Mentorship
    if (stats.menteesCount > 0) {
      bio.push(`Mentoring ${stats.menteesCount} ${stats.menteesCount === 1 ? 'person' : 'people'}`);
    }

    // Level and XP
    bio.push(`Level ${zentroId.level} (${zentroId.xp} XP)`);

    return bio.length > 0 ? bio.join(' • ') : "Ready to explore Zentro!";
  }

  // Update dynamic bio in Firebase
  async updateDynamicBio(userId) {
    try {
      const zentroId = await this.getZentroId(userId);
      if (!zentroId) return;

      const newBio = this.generateDynamicBio(zentroId);
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');

      await updateDoc(userRef, {
        dynamicBio: newBio,
        lastUpdated: serverTimestamp()
      });

      console.log(`✅ Dynamic bio updated for ${userId}`);
    } catch (error) {
      console.error('❌ Error updating dynamic bio:', error);
    }
  }

  // Calculate level based on XP
  calculateLevel(xp) {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2100) return 6;
    if (xp < 2800) return 7;
    if (xp < 3600) return 8;
    if (xp < 4500) return 9;
    return Math.floor(10 + (xp - 4500) / 1000);
  }

  // Update user status (active, stealth, busy)
  async updateStatus(userId, status) {
    try {
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      await updateDoc(userRef, {
        status: status,
        lastUpdated: serverTimestamp()
      });
      console.log(`✅ Status updated for ${userId}: ${status}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  }

  // Update user mood (focused, chill, grinding)
  async updateMood(userId, mood) {
    try {
      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      await updateDoc(userRef, {
        mood: mood,
        lastUpdated: serverTimestamp()
      });
      console.log(`✅ Mood updated for ${userId}: ${mood}`);
    } catch (error) {
      console.error('❌ Error updating mood:', error);
    }
  }

  // Toggle discovery mode
  async toggleDiscoveryMode(userId) {
    try {
      const zentroId = await this.getZentroId(userId);
      if (!zentroId) return false;

      const userRef = doc(db, 'users', userId, 'profile', 'zentroId');
      await updateDoc(userRef, {
        discoveryMode: !zentroId.discoveryMode,
        lastUpdated: serverTimestamp()
      });

      console.log(`✅ Discovery mode toggled for ${userId}: ${!zentroId.discoveryMode}`);
      return !zentroId.discoveryMode;
    } catch (error) {
      console.error('❌ Error toggling discovery mode:', error);
      return false;
    }
  }

  // Get leaderboard data from Firebase
  async getLeaderboard(category = 'xp', limitCount = 10) {
    try {
      const usersRef = collection(db, 'users');
      let q;

      // Create query based on category
      switch (category) {
        case 'xp':
          q = query(
            usersRef,
            orderBy('profile.zentroId.xp', 'desc'),
            limit(limitCount)
          );
          break;
        case 'battles':
          q = query(
            usersRef,
            orderBy('profile.zentroId.stats.battlesWon', 'desc'),
            limit(limitCount)
          );
          break;
        case 'collabs':
          q = query(
            usersRef,
            orderBy('profile.zentroId.stats.collabsCompleted', 'desc'),
            limit(limitCount)
          );
          break;
        case 'level':
          q = query(
            usersRef,
            orderBy('profile.zentroId.level', 'desc'),
            limit(limitCount)
          );
          break;
        default:
          q = query(
            usersRef,
            orderBy('profile.zentroId.xp', 'desc'),
            limit(limitCount)
          );
      }

      const snapshot = await getDocs(q);
      const leaderboard = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.profile?.zentroId) {
          leaderboard.push({
            userId: doc.id,
            ...userData.profile.zentroId
          });
        }
      });

      return leaderboard;
    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      return [];
    }
  }

  // Get users in discovery mode
  async getDiscoverableUsers(limitCount = 20) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('profile.zentroId.discoveryMode', '==', true),
        orderBy('profile.zentroId.lastUpdated', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.profile?.zentroId) {
          users.push({
            userId: doc.id,
            ...userData.profile.zentroId
          });
        }
      });

      return users;
    } catch (error) {
      console.error('❌ Error getting discoverable users:', error);
      return [];
    }
  }

  // Cleanup listeners
  cleanup(userId) {
    const listener = this.listeners.get(userId);
    if (listener) {
      listener();
      this.listeners.delete(userId);
    }

    const activityListener = this.listeners.get(`${userId}_activities`);
    if (activityListener) {
      activityListener();
      this.listeners.delete(`${userId}_activities`);
    }

    this.cache.delete(userId);
  }
}

// Create and export singleton instance
const zentroIdService = new ZentroIdService();
export default zentroIdService;
