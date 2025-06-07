// Zenny Coins Service - Zentro App Marketplace Economy System
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

class ZennyCoinsService {
  constructor() {
    this.EXCHANGE_RATE = 0.5; // 1 USD = 0.5 Zenny Coins
    this.ADMIN_UID = '2bDEJ7WRxuXxxco56let1xDl2Ks1'; // Special admin user ID (updated)
    this.DAILY_EARNING_LIMIT = 50;
    this.BOOST_COSTS = {
      bronze: 10,
      silver: 25,
      gold: 50,
      platinum: 100,
      diamond: 200
    };
    this.SPOTLIGHT_AUCTION_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
    this.AUCTION_START_TIME = { hour: 19, minute: 0 }; // 7 PM IST
  }

  // Get user's Zenny coin balance
  async getBalance(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return 0; // Return 0 for non-existent users
      }

      const userData = userDoc.data();
      return userData.zennyCoins?.balance || 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  // Legacy alias for compatibility: getUserBalance (calls getBalance)
  async getUserBalance(userId) {
    return this.getBalance(userId);
  }

  // Initialize admin account with 1M Zenny coins
  async initializeAdminAccount() {
    try {
      const adminRef = doc(db, 'users', this.ADMIN_UID);
      const adminDoc = await getDoc(adminRef);

      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          displayName: 'Zentro Admin',
          email: 'admin@zentro.com',
          isAdmin: true,
          zennyCoins: {
            balance: 1000000, // 1 Million Zenny Coins
            totalEarned: 1000000,
            totalSpent: 0,
            lastEarned: serverTimestamp(),
            transactions: [{
              id: 'admin_init',
              type: 'admin_grant',
              amount: 1000000,
              description: 'Initial admin allocation',
              timestamp: serverTimestamp()
            }],
            dailyEarningLimit: 999999,
            dailyEarned: 0,
            lastDailyReset: serverTimestamp()
          },
          createdAt: serverTimestamp()
        });
        console.log('✅ Admin account initialized with 1M Zenny coins');
      }
    } catch (error) {
      console.error('❌ Error initializing admin account:', error);
    }
  }


  // PHASE 1: Secure Zenny Coin Engine



  // 6. assignAdminCoins(adminUserId)
  async assignAdminCoins(adminUserId) {
    // Only allow the hardcoded admin UID to receive this grant
    if (adminUserId !== this.ADMIN_UID) {
      throw new Error('Only the main admin can receive this grant.');
    }
    const userRef = doc(db, 'users', adminUserId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('Admin user not found');
    const coins = userDoc.data().zennyCoins || this.getDefaultCoinData();
    if ((coins.balance || 0) >= 1000000) return; // Only assign if below 1M
    await updateDoc(userRef, {
      'zennyCoins.balance': 1000000
    });
    await addDoc(collection(db, 'coin_transactions'), {
      userId: adminUserId,
      type: 'admin_grant',
      amount: 1000000,
      timestamp: Date.now(),
      context: 'admin_init'
    });
  }

  // Award Zenny coins for activities
  async awardCoins(userId, amount, activityType, description) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentCoins = userData.zennyCoins || this.getDefaultCoinData();
      
      // Check daily earning limit
      const today = new Date().toDateString();
      const lastReset = currentCoins.lastDailyReset?.toDate?.()?.toDateString();
      
      let dailyEarned = currentCoins.dailyEarned || 0;
      if (lastReset !== today) {
        dailyEarned = 0; // Reset daily counter
      }

      if (dailyEarned + amount > this.DAILY_EARNING_LIMIT) {
        throw new Error(`Daily earning limit exceeded. Remaining: ${this.DAILY_EARNING_LIMIT - dailyEarned} coins`);
      }

      // Create transaction record
      const transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        type: 'earn',
        activityType,
        amount,
        description,
        timestamp: serverTimestamp(),
        balanceAfter: currentCoins.balance + amount
      };

      // Update user's coin data
      const updatedCoins = {
        balance: currentCoins.balance + amount,
        totalEarned: currentCoins.totalEarned + amount,
        totalSpent: currentCoins.totalSpent,
        lastEarned: serverTimestamp(),
        transactions: [...(currentCoins.transactions || []), transaction],
        dailyEarningLimit: this.DAILY_EARNING_LIMIT,
        dailyEarned: dailyEarned + amount,
        lastDailyReset: lastReset !== today ? serverTimestamp() : currentCoins.lastDailyReset
      };

      await updateDoc(userRef, { zennyCoins: updatedCoins });

      // Log transaction to global transactions collection
      await addDoc(collection(db, 'zennyTransactions'), {
        userId,
        ...transaction,
        createdAt: serverTimestamp()
      });

      console.log(`✅ Awarded ${amount} Zenny coins to ${userId} for ${activityType}`);
      return { success: true, newBalance: updatedCoins.balance, transaction };
    } catch (error) {
      console.error('❌ Error awarding coins:', error);
      return { success: false, error: error.message };
    }
  }

  // Spend Zenny coins
  async spendCoins(userId, amount, purpose, description) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const userData = userDoc.data();
        const currentCoins = userData.zennyCoins || this.getDefaultCoinData();

        if (currentCoins.balance < amount) {
            throw new Error(`Insufficient balance. Current: ${currentCoins.balance}, Required: ${amount}`);
        }

        // Create transaction record
        const transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            type: 'spend',
            purpose,
            amount: -amount,
            description,
            timestamp: serverTimestamp(),
            balanceAfter: currentCoins.balance - amount
        };

        // Validate transaction data
        if (!transaction.id || !transaction.timestamp) {
            throw new Error('Invalid transaction data');
        }

        // Update user's coin data
        const updatedCoins = {
            balance: currentCoins.balance - amount,
            totalEarned: currentCoins.totalEarned,
            totalSpent: currentCoins.totalSpent + amount,
            lastEarned: currentCoins.lastEarned,
            transactions: [...(currentCoins.transactions || []), transaction],
            dailyEarningLimit: currentCoins.dailyEarningLimit,
            dailyEarned: currentCoins.dailyEarned,
            lastDailyReset: currentCoins.lastDailyReset
        };

        await updateDoc(userRef, { zennyCoins: updatedCoins });

        // Return success response
        return { success: true, updatedCoins };
    } catch (error) {
        console.error('Error in spendCoins:', error);
        return { success: false, error: error.message };
    }
  }

  // Purchase Zenny coins with real money
  async purchaseCoins(userId, usdAmount, paymentMethod = 'stripe') {
    try {
      const zennyAmount = Math.floor(usdAmount * this.EXCHANGE_RATE);
      
      // In a real implementation, you would integrate with payment processors here
      // For now, we'll simulate the purchase
      
      const result = await this.awardCoins(
        userId, 
        zennyAmount, 
        'purchase', 
        `Purchased ${zennyAmount} Zenny coins for $${usdAmount} USD`
      );

      if (result.success) {
        // Log purchase to separate collection for accounting
        await addDoc(collection(db, 'zennyPurchases'), {
          userId,
          usdAmount,
          zennyAmount,
          paymentMethod,
          exchangeRate: this.EXCHANGE_RATE,
          transactionId: result.transaction.id,
          createdAt: serverTimestamp()
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Error purchasing coins:', error);
      return { success: false, error: error.message };
    }
  }

  // Get default coin data structure
  getDefaultCoinData() {
    return {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastEarned: null,
      transactions: [],
      dailyEarningLimit: this.DAILY_EARNING_LIMIT,
      dailyEarned: 0,
      lastDailyReset: null
    };
  }

  // Get user's transaction history
  async getTransactionHistory(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'zennyTransactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Activity-based coin earning rates
  getActivityRewards() {
    return {
      'daily_login': 0.05,
      'send_message': 0.01,
      'create_post': 0.1,
      'receive_like': 0.2,
      'complete_profile': 0.4,
      'invite_friend': 1,
      'app_upload': 0.6,
      'app_featured': 2,
      'win_auction': 5
    };
  }
}

// Create and export singleton instance
const zennyCoinsService = new ZennyCoinsService();
export default zennyCoinsService;
