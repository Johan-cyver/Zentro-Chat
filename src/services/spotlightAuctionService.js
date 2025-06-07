// Spotlight Auction Service - Weekly Saturday Auctions for Zentro Apps
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import zennyCoinsService from './zennyCoinsService';

class SpotlightAuctionService {
  constructor() {
    this.SPOTLIGHT_POSITIONS = 7;
    this.AUCTION_DURATION = 15 * 60 * 1000; // 15 minutes per position
    this.TOTAL_AUCTION_TIME = this.SPOTLIGHT_POSITIONS * this.AUCTION_DURATION; // 105 minutes total
    this.AUCTION_START_TIME = { hour: 19, minute: 0, timezone: 'Asia/Kolkata' }; // 7 PM IST
    this.MAX_BID_DELAY = 3 * 60 * 1000; // 3 minutes max delay between bids
    
    // Durations: bronze-2, silver-3, gold-4, platinum-5, diamond-7 days
    this.BOOST_LEVELS = {
      bronze:   { cost: 10,  priority: 1, duration: 2 * 24 * 60 * 60 * 1000 }, // 2 days
      silver:   { cost: 25,  priority: 2, duration: 3 * 24 * 60 * 60 * 1000 }, // 3 days
      gold:     { cost: 50,  priority: 3, duration: 4 * 24 * 60 * 60 * 1000 }, // 4 days
      platinum: { cost: 100, priority: 4, duration: 5 * 24 * 60 * 60 * 1000 }, // 5 days
      diamond:  { cost: 200, priority: 5, duration: 7 * 24 * 60 * 60 * 1000 }  // 7 days
    };
  }

  // Get next Saturday 7 PM IST
  getNextAuctionDate() {
    const now = new Date();
    const nextSaturday = new Date(now);
    
    // Find next Saturday
    const daysUntilSaturday = (6 - now.getDay()) % 7;
    if (daysUntilSaturday === 0 && now.getHours() >= 19) {
      // If it's Saturday after 7 PM, get next Saturday
      nextSaturday.setDate(now.getDate() + 7);
    } else {
      nextSaturday.setDate(now.getDate() + daysUntilSaturday);
    }
    
    // Set to 7 PM IST
    nextSaturday.setHours(19, 0, 0, 0);
    
    return nextSaturday;
  }

  // Helper to convert Firestore Timestamps to JS Dates in auction data
  _convertAuctionTimestamps(auctionData) {
    // Convert top-level startTime and endTime
    if (auctionData.startTime && typeof auctionData.startTime.toDate === 'function') {
      auctionData.startTime = auctionData.startTime.toDate();
    }
    if (auctionData.endTime && typeof auctionData.endTime.toDate === 'function') {
      auctionData.endTime = auctionData.endTime.toDate();
    }
    // Convert positions' startTime and endTime
    if (Array.isArray(auctionData.positions)) {
      auctionData.positions = auctionData.positions.map(pos => {
        const newPos = { ...pos };
        if (newPos.startTime && typeof newPos.startTime.toDate === 'function') {
          newPos.startTime = newPos.startTime.toDate();
        }
        if (newPos.endTime && typeof newPos.endTime.toDate === 'function') {
          newPos.endTime = newPos.endTime.toDate();
        }
        // Convert bids' timestamp
        if (Array.isArray(newPos.bids)) {
          newPos.bids = newPos.bids.map(bid => {
            const newBid = { ...bid };
            if (newBid.timestamp && typeof newBid.timestamp.toDate === 'function') {
              newBid.timestamp = newBid.timestamp.toDate();
            }
            return newBid;
          });
        }
        return newPos;
      });
    }
    return auctionData;
  }

  // Initialize weekly auction
  async initializeWeeklyAuction() {
    try {
      const auctionDate = this.getNextAuctionDate();
      const auctionId = `auction_${auctionDate.getTime()}`;
      
      const auctionRef = doc(db, 'spotlightAuctions', auctionId);
      const auctionDoc = await getDoc(auctionRef);
      
      if (!auctionDoc.exists()) {
        const auctionData = {
          id: auctionId,
          startTime: auctionDate,
          endTime: new Date(auctionDate.getTime() + this.TOTAL_AUCTION_TIME),
          status: 'scheduled', // scheduled, active, completed
          currentPosition: 0,
          positions: Array.from({ length: this.SPOTLIGHT_POSITIONS }, (_, index) => ({
            position: index + 1,
            startTime: new Date(auctionDate.getTime() + (index * this.AUCTION_DURATION)),
            endTime: new Date(auctionDate.getTime() + ((index + 1) * this.AUCTION_DURATION)),
            bids: [],
            winner: null,
            finalBid: 0,
            status: 'pending' // pending, active, completed
          })),
          totalParticipants: 0,
          totalBidsAmount: 0,
          createdAt: serverTimestamp()
        };
        
        await setDoc(auctionRef, auctionData);
        console.log(`✅ Initialized auction for ${auctionDate.toISOString()}`);
        // Convert timestamps before returning
        return this._convertAuctionTimestamps({ ...auctionData });
      }
      // Convert timestamps before returning
      return this._convertAuctionTimestamps(auctionDoc.data());
    } catch (error) {
      console.error('❌ Error initializing auction:', error);
      throw error;
    }
  }

  // Get current active auction
  async getCurrentAuction() {
    try {
      const now = new Date();
      const q = query(
        collection(db, 'spotlightAuctions'),
        where('status', 'in', ['scheduled', 'active']),
        orderBy('startTime', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const auctionDoc = querySnapshot.docs[0];
        // Convert timestamps before returning
        return { id: auctionDoc.id, ...this._convertAuctionTimestamps(auctionDoc.data()) };
      }
      
      // No active auction, create next one
      return await this.initializeWeeklyAuction();
    } catch (error) {
      console.error('Error fetching current auction:', error);
      return null;
    }
  }

  // Place bid in auction
  async placeBid(auctionId, position, userId, appId, bidAmount) {
    try {
      // Verify user has enough coins
      const userBalance = await zennyCoinsService.getUserBalance(userId);
      if (userBalance < bidAmount) {
        throw new Error('Insufficient Zenny coins for this bid');
      }

      const auctionRef = doc(db, 'spotlightAuctions', auctionId);
      const auctionDoc = await getDoc(auctionRef);
      
      if (!auctionDoc.exists()) {
        throw new Error('Auction not found');
      }

      const auctionData = auctionDoc.data();
      const positionData = auctionData.positions[position - 1];
      
      // Check if position is currently active
      const now = new Date();
      const positionStartTime = positionData.startTime.toDate();
      const positionEndTime = positionData.endTime.toDate();
      
      if (now < positionStartTime) {
        throw new Error('This position auction has not started yet');
      }
      
      if (now > positionEndTime) {
        throw new Error('This position auction has ended');
      }

      // Check if bid is higher than current highest
      const currentHighestBid = positionData.bids.length > 0 
        ? Math.max(...positionData.bids.map(bid => bid.amount))
        : 0;
      
      if (bidAmount <= currentHighestBid) {
        throw new Error(`Bid must be higher than current highest bid of ${currentHighestBid} Zenny coins`);
      }

      // Create bid record
      const bid = {
        id: `bid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId,
        appId,
        amount: bidAmount,
        timestamp: serverTimestamp(),
        isWinning: true // Will be updated when new bids come in
      };

      // Update previous bids to not winning
      const updatedBids = positionData.bids.map(existingBid => ({
        ...existingBid,
        isWinning: false
      }));
      updatedBids.push(bid);

      // Update auction data
      const updatedPositions = [...auctionData.positions];
      updatedPositions[position - 1] = {
        ...positionData,
        bids: updatedBids,
        lastBidTime: serverTimestamp()
      };

      await updateDoc(auctionRef, {
        positions: updatedPositions,
        totalBidsAmount: auctionData.totalBidsAmount + bidAmount,
        updatedAt: serverTimestamp()
      });

      // Deduct coins from user (held in escrow until auction ends)
      await zennyCoinsService.spendCoins(
        userId, 
        bidAmount, 
        'auction_bid', 
        `Bid ${bidAmount} Zenny coins for spotlight position ${position}`
      );

      console.log(`✅ Bid placed: ${bidAmount} coins for position ${position}`);
      return { success: true, bid };
    } catch (error) {
      console.error('❌ Error placing bid:', error);
      return { success: false, error: error.message };
    }
  }

  // Finalize auction position
  async finalizePosition(auctionId, position) {
    try {
      const auctionRef = doc(db, 'spotlightAuctions', auctionId);
      const auctionDoc = await getDoc(auctionRef);
      
      if (!auctionDoc.exists()) {
        throw new Error('Auction not found');
      }

      const auctionData = auctionDoc.data();
      const positionData = auctionData.positions[position - 1];
      
      if (positionData.bids.length === 0) {
        // No bids for this position
        const updatedPositions = [...auctionData.positions];
        updatedPositions[position - 1] = {
          ...positionData,
          status: 'completed',
          winner: null,
          finalBid: 0
        };
        
        await updateDoc(auctionRef, { positions: updatedPositions });
        return { success: true, winner: null };
      }

      // Find winning bid (highest amount)
      const winningBid = positionData.bids.reduce((highest, current) => 
        current.amount > highest.amount ? current : highest
      );

      // Refund losing bidders
      for (const bid of positionData.bids) {
        if (bid.id !== winningBid.id) {
          await zennyCoinsService.awardCoins(
            bid.userId,
            bid.amount,
            'auction_refund',
            `Refund for unsuccessful bid on spotlight position ${position}`
          );
        }
      }

      // Award winner achievement
      await zennyCoinsService.awardCoins(
        winningBid.userId,
        25,
        'win_auction',
        `Won spotlight position ${position} auction`
      );

      // Update position with winner
      const updatedPositions = [...auctionData.positions];
      updatedPositions[position - 1] = {
        ...positionData,
        status: 'completed',
        winner: winningBid,
        finalBid: winningBid.amount
      };

      await updateDoc(auctionRef, { positions: updatedPositions });

      console.log(`✅ Position ${position} won by user ${winningBid.userId} with ${winningBid.amount} coins`);
      return { success: true, winner: winningBid };
    } catch (error) {
      console.error('❌ Error finalizing position:', error);
      return { success: false, error: error.message };
    }
  }

  // Apply boost to app
  async applyBoost(userId, appId, boostLevel) {
    try {
      const boost = this.BOOST_LEVELS[boostLevel];
      if (!boost) {
        throw new Error('Invalid boost level');
      }

      // Check user balance
      const userBalance = await zennyCoinsService.getUserBalance(userId);
      if (userBalance < boost.cost) {
        throw new Error(`Insufficient Zenny coins. Required: ${boost.cost}, Available: ${userBalance}`);
      }

      // Deduct coins
      const spendResult = await zennyCoinsService.spendCoins(
        userId,
        boost.cost,
        'app_boost',
        `Applied ${boostLevel} boost to app ${appId}`
      );

      if (!spendResult.success) {
        throw new Error(spendResult.error);
      }

      // Apply boost to app (this would integrate with your app service)
      const boostData = {
        level: boostLevel,
        priority: boost.priority,
        startTime: new Date(),
        endTime: new Date(Date.now() + boost.duration),
        cost: boost.cost,
        transactionId: spendResult.transaction.id
      };

      // Store boost record
      await addDoc(collection(db, 'appBoosts'), {
        userId,
        appId,
        ...boostData,
        createdAt: serverTimestamp()
      });

      console.log(`✅ Applied ${boostLevel} boost to app ${appId}`);
      return { success: true, boost: boostData };
    } catch (error) {
      console.error('❌ Error applying boost:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current spotlight winners
  async getCurrentSpotlightWinners() {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
      
      const q = query(
        collection(db, 'spotlightAuctions'),
        where('status', '==', 'completed'),
        where('startTime', '>=', startOfWeek),
        orderBy('startTime', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const auctionDoc = querySnapshot.docs[0];
        const auctionData = this._convertAuctionTimestamps(auctionDoc.data());
        
        return auctionData.positions
          .filter(pos => pos.winner)
          .map(pos => ({
            position: pos.position,
            appId: pos.winner.appId,
            userId: pos.winner.userId,
            bidAmount: pos.winner.amount,
            startTime: auctionData.startTime,
            endTime: new Date(auctionData.startTime.getTime() + (7 * 24 * 60 * 60 * 1000)) // 1 week
          }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching spotlight winners:', error);
      return [];
    }
  }

  // Listen to auction updates
  subscribeToAuction(auctionId, callback) {
    const auctionRef = doc(db, 'spotlightAuctions', auctionId);
    return onSnapshot(auctionRef, (doc) => {
      if (doc.exists()) {
        // Convert timestamps before passing to callback
        callback({ id: doc.id, ...this._convertAuctionTimestamps(doc.data()) });
      }
    });
  }
}

// Create and export singleton instance
const spotlightAuctionService = new SpotlightAuctionService();
export default spotlightAuctionService;
