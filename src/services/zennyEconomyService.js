// Zenny Coin Economy Service - Core addiction mechanics and betting system
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
  increment,
  runTransaction
} from 'firebase/firestore';

class ZennyEconomyService {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
    
    // Economy constants
    this.DAILY_BONUS = 50;
    this.STREAK_MULTIPLIER = 1.2;
    this.MAX_STREAK_BONUS = 500;
    this.BATTLE_ENTRY_FEE = 25;
    this.BATTLE_WIN_MULTIPLIER = 2.5;
    this.SQUAD_WAR_ENTRY = 100;
    this.ACHIEVEMENT_REWARDS = {
      FIRST_BATTLE: 100,
      FIRST_WIN: 150,
      WIN_STREAK_5: 300,
      WIN_STREAK_10: 750,
      SQUAD_LEADER: 500,
      MENTOR_MASTER: 1000
    };
  }

  // Initialize user's Zenny wallet
  async initializeWallet(userId) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await getDoc(walletRef);
      
      if (!walletSnap.exists()) {
        const initialWallet = {
          userId: userId,
          balance: 1000, // Starting bonus
          totalEarned: 1000,
          totalSpent: 0,
          dailyStreak: 0,
          lastDailyBonus: null,
          transactions: [],
          bettingStats: {
            totalBets: 0,
            totalWon: 0,
            totalLost: 0,
            biggestWin: 0,
            currentStreak: 0,
            longestStreak: 0
          },
          achievements: [],
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        };
        
        await setDoc(walletRef, initialWallet);
        return initialWallet;
      }
      
      return walletSnap.data();
    } catch (error) {
      console.error('❌ Error initializing wallet:', error);
      throw error;
    }
  }

  // Get user's wallet with real-time updates
  async getWallet(userId) {
    try {
      if (this.cache.has(userId)) {
        return this.cache.get(userId);
      }

      const walletRef = doc(db, 'wallets', userId);
      const walletSnap = await getDoc(walletRef);
      
      if (walletSnap.exists()) {
        const wallet = walletSnap.data();
        this.cache.set(userId, wallet);
        return wallet;
      }
      
      return await this.initializeWallet(userId);
    } catch (error) {
      console.error('❌ Error getting wallet:', error);
      return null;
    }
  }

  // Subscribe to wallet updates
  subscribeToWallet(userId, callback) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      
      const unsubscribe = onSnapshot(walletRef, (doc) => {
        if (doc.exists()) {
          const wallet = doc.data();
          this.cache.set(userId, wallet);
          callback(wallet);
        }
      });

      this.listeners.set(userId, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error subscribing to wallet:', error);
      return null;
    }
  }

  // Daily bonus with streak mechanics (addiction hook)
  async claimDailyBonus(userId) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      
      return await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }
        
        const wallet = walletDoc.data();
        const now = new Date();
        const lastBonus = wallet.lastDailyBonus?.toDate();
        
        // Check if already claimed today
        if (lastBonus && this.isSameDay(lastBonus, now)) {
          throw new Error('Daily bonus already claimed today');
        }
        
        // Calculate streak
        let newStreak = 1;
        if (lastBonus && this.isConsecutiveDay(lastBonus, now)) {
          newStreak = (wallet.dailyStreak || 0) + 1;
        }
        
        // Calculate bonus with streak multiplier
        const baseBonus = this.DAILY_BONUS;
        const streakBonus = Math.min(
          baseBonus * Math.pow(this.STREAK_MULTIPLIER, newStreak - 1),
          this.MAX_STREAK_BONUS
        );
        const totalBonus = Math.floor(streakBonus);
        
        // Create transaction record with regular timestamp
        const currentTime = new Date();
        const transactionRecord = {
          id: `daily_${Date.now()}`,
          type: 'daily_bonus',
          amount: totalBonus,
          description: `Daily bonus (${newStreak} day streak)`,
          timestamp: currentTime.toISOString(),
          metadata: { streak: newStreak }
        };

        // Update wallet
        transaction.update(walletRef, {
          balance: increment(totalBonus),
          totalEarned: increment(totalBonus),
          dailyStreak: newStreak,
          lastDailyBonus: serverTimestamp(),
          transactions: arrayUnion(transactionRecord),
          lastUpdated: serverTimestamp()
        });
        
        return { bonus: totalBonus, streak: newStreak };
      });
    } catch (error) {
      console.error('❌ Error claiming daily bonus:', error);
      throw error;
    }
  }

  // Battle betting system
  async placeBattleBet(userId, battleId, betAmount, prediction = 'self') {
    try {
      const walletRef = doc(db, 'wallets', userId);
      
      return await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }
        
        const wallet = walletDoc.data();
        
        if (wallet.balance < betAmount) {
          throw new Error('Insufficient balance');
        }
        
        // Create bet record
        const betRecord = {
          id: `bet_${Date.now()}`,
          battleId: battleId,
          amount: betAmount,
          prediction: prediction,
          status: 'pending',
          placedAt: serverTimestamp()
        };
        
        // Create transaction record
        const transactionRecord = {
          id: `bet_${Date.now()}`,
          type: 'battle_bet',
          amount: -betAmount,
          description: `Battle bet: ${betAmount} coins`,
          timestamp: new Date().toISOString(),
          metadata: { battleId, prediction }
        };
        
        // Update wallet
        transaction.update(walletRef, {
          balance: increment(-betAmount),
          totalSpent: increment(betAmount),
          transactions: arrayUnion(transactionRecord),
          'bettingStats.totalBets': increment(1),
          lastUpdated: serverTimestamp()
        });
        
        // Store bet separately
        const betRef = doc(db, 'bets', betRecord.id);
        transaction.set(betRef, { ...betRecord, userId });
        
        return betRecord;
      });
    } catch (error) {
      console.error('❌ Error placing battle bet:', error);
      throw error;
    }
  }

  // Resolve battle bet
  async resolveBattleBet(battleId, winnerId) {
    try {
      const betsRef = collection(db, 'bets');
      const q = query(betsRef, where('battleId', '==', battleId), where('status', '==', 'pending'));
      const betsSnapshot = await getDocs(q);
      
      const batch = [];
      
      for (const betDoc of betsSnapshot.docs) {
        const bet = betDoc.data();
        const isWinner = (bet.prediction === 'self' && bet.userId === winnerId) ||
                        (bet.prediction === 'opponent' && bet.userId !== winnerId);
        
        if (isWinner) {
          const winAmount = Math.floor(bet.amount * this.BATTLE_WIN_MULTIPLIER);
          await this.addCoins(bet.userId, winAmount, 'battle_win', `Battle win: ${winAmount} coins`);
          
          // Update betting stats
          const walletRef = doc(db, 'wallets', bet.userId);
          await updateDoc(walletRef, {
            'bettingStats.totalWon': increment(winAmount),
            'bettingStats.currentStreak': increment(1),
            'bettingStats.biggestWin': winAmount > (bet.bettingStats?.biggestWin || 0) ? winAmount : increment(0)
          });
        } else {
          // Update losing stats
          const walletRef = doc(db, 'wallets', bet.userId);
          await updateDoc(walletRef, {
            'bettingStats.totalLost': increment(bet.amount),
            'bettingStats.currentStreak': 0
          });
        }
        
        // Update bet status
        await updateDoc(betDoc.ref, {
          status: isWinner ? 'won' : 'lost',
          resolvedAt: serverTimestamp(),
          winAmount: isWinner ? Math.floor(bet.amount * this.BATTLE_WIN_MULTIPLIER) : 0
        });
      }
      
      console.log(`✅ Resolved ${betsSnapshot.size} bets for battle ${battleId}`);
    } catch (error) {
      console.error('❌ Error resolving battle bets:', error);
    }
  }

  // Add coins (rewards, achievements, etc.)
  async addCoins(userId, amount, type, description, metadata = {}) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      
      const transactionRecord = {
        id: `${type}_${Date.now()}`,
        type: type,
        amount: amount,
        description: description,
        timestamp: new Date().toISOString(),
        metadata: metadata
      };
      
      await updateDoc(walletRef, {
        balance: increment(amount),
        totalEarned: increment(amount),
        transactions: arrayUnion(transactionRecord),
        lastUpdated: serverTimestamp()
      });
      
      console.log(`✅ Added ${amount} coins to ${userId} for ${type}`);
      return transactionRecord;
    } catch (error) {
      console.error('❌ Error adding coins:', error);
      throw error;
    }
  }

  // Spend coins
  async spendCoins(userId, amount, type, description, metadata = {}) {
    try {
      const walletRef = doc(db, 'wallets', userId);
      
      return await runTransaction(db, async (transaction) => {
        const walletDoc = await transaction.get(walletRef);
        
        if (!walletDoc.exists()) {
          throw new Error('Wallet not found');
        }
        
        const wallet = walletDoc.data();
        
        if (wallet.balance < amount) {
          throw new Error('Insufficient balance');
        }
        
        const transactionRecord = {
          id: `${type}_${Date.now()}`,
          type: type,
          amount: -amount,
          description: description,
          timestamp: new Date().toISOString(),
          metadata: metadata
        };
        
        transaction.update(walletRef, {
          balance: increment(-amount),
          totalSpent: increment(amount),
          transactions: arrayUnion(transactionRecord),
          lastUpdated: serverTimestamp()
        });
        
        return transactionRecord;
      });
    } catch (error) {
      console.error('❌ Error spending coins:', error);
      throw error;
    }
  }

  // Get leaderboard by coins
  async getCoinLeaderboard(limitCount = 10) {
    try {
      const walletsRef = collection(db, 'wallets');
      const q = query(walletsRef, orderBy('balance', 'desc'), limit(limitCount));
      
      const snapshot = await getDocs(q);
      const leaderboard = [];
      
      snapshot.forEach((doc) => {
        const wallet = doc.data();
        leaderboard.push({
          userId: wallet.userId,
          balance: wallet.balance,
          totalEarned: wallet.totalEarned,
          dailyStreak: wallet.dailyStreak
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('❌ Error getting coin leaderboard:', error);
      return [];
    }
  }

  // Helper methods
  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  isConsecutiveDay(lastDate, currentDate) {
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
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

export default new ZennyEconomyService();
