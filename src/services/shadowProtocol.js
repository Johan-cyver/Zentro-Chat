import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import CryptoJS from 'crypto-js';

class ShadowProtocol {
  constructor() {
    this.shadowCollection = 'shadowProfiles';
    this.battleCollection = 'shadowBattles';
    this.whisperCollection = 'shadowWhispers';
    this.cipherCollection = 'shadowCiphers';
    this.encryptionKey = process.env.REACT_APP_SHADOW_KEY || 'ZENTRO_SHADOW_PROTOCOL_2024';
  }

  // Generate unique shadow identity
  generateShadowId(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const hash = CryptoJS.SHA256(userId + timestamp + random).toString();
    return `SHADOW_${hash.substring(0, 8).toUpperCase()}`;
  }

  // Generate shadow alias with mythical themes
  generateShadowAlias() {
    const prefixes = [
      'PHANTOM', 'CIPHER', 'GHOST', 'SHADOW', 'VOID', 'DARK', 'NEON', 'GLITCH',
      'RAVEN', 'VIPER', 'STORM', 'FROST', 'EMBER', 'STEEL', 'QUANTUM', 'NEXUS'
    ];
    
    const suffixes = [
      'WALKER', 'HUNTER', 'BLADE', 'MIND', 'CORE', 'PULSE', 'WAVE', 'STRIKE',
      'ECHO', 'SHARD', 'FLUX', 'DRIFT', 'BURN', 'CRASH', 'HACK', 'CODE'
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${prefix}_${suffix}_${number}`;
  }

  // Encrypt sensitive data
  encrypt(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
  }

  // Decrypt sensitive data
  decrypt(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Create shadow profile
  async createShadowProfile(userId, userProfile) {
    try {
      const shadowId = this.generateShadowId(userId);
      const alias = this.generateShadowAlias();
      
      // Encrypt real identity mapping
      const identityMap = this.encrypt({
        realUserId: userId,
        realDisplayName: userProfile.displayName,
        createdAt: Date.now()
      });

      const shadowProfile = {
        shadowId,
        alias,
        identityMap, // Encrypted real identity
        maskLevel: 1,
        shadowXP: 0,
        battlesWon: 0,
        ciphersSolved: 0,
        whispersSent: 0,
        reputation: 0,
        maskType: 'BASIC',
        isRevealed: false,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        stats: {
          totalBattles: 0,
          winRate: 0,
          favoriteZone: null,
          achievements: []
        }
      };

      const docRef = await addDoc(collection(db, this.shadowCollection), shadowProfile);
      return { id: docRef.id, ...shadowProfile };
    } catch (error) {
      console.error('Error creating shadow profile:', error);
      throw error;
    }
  }

  // Get shadow profile by user ID
  async getShadowProfile(userId) {
    try {
      const q = query(
        collection(db, this.shadowCollection),
        where('identityMap', '!=', null)
      );
      
      const querySnapshot = await getDocs(q);
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const decryptedIdentity = this.decrypt(data.identityMap);
        
        if (decryptedIdentity && decryptedIdentity.realUserId === userId) {
          return { id: doc.id, ...data };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting shadow profile:', error);
      throw error;
    }
  }

  // Enter shadow battle arena
  async enterBattleArena(shadowId, battleType = 'ANONYMOUS') {
    try {
      const battle = {
        shadowId,
        battleType,
        status: 'SEARCHING',
        opponent: null,
        startTime: null,
        endTime: null,
        winner: null,
        moves: [],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.battleCollection), battle);
      return { id: docRef.id, ...battle };
    } catch (error) {
      console.error('Error entering battle arena:', error);
      throw error;
    }
  }

  // Send encrypted whisper
  async sendWhisper(fromShadowId, toShadowId, message, expiryMinutes = 60) {
    try {
      const encryptedMessage = this.encrypt({
        content: message,
        timestamp: Date.now()
      });

      const whisper = {
        fromShadowId,
        toShadowId,
        encryptedMessage,
        isRead: false,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.whisperCollection), whisper);
      return { id: docRef.id, ...whisper };
    } catch (error) {
      console.error('Error sending whisper:', error);
      throw error;
    }
  }

  // Get whispers for shadow
  async getWhispers(shadowId) {
    try {
      const q = query(
        collection(db, this.whisperCollection),
        where('toShadowId', '==', shadowId),
        where('expiresAt', '>', new Date()),
        orderBy('expiresAt'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const whispers = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const decryptedMessage = this.decrypt(data.encryptedMessage);
        
        if (decryptedMessage) {
          whispers.push({
            id: doc.id,
            ...data,
            message: decryptedMessage.content,
            timestamp: decryptedMessage.timestamp
          });
        }
      });

      return whispers;
    } catch (error) {
      console.error('Error getting whispers:', error);
      throw error;
    }
  }

  // Submit cipher puzzle
  async submitCipher(shadowId, puzzle, solution, difficulty = 'MEDIUM') {
    try {
      const cipher = {
        creatorShadowId: shadowId,
        puzzle,
        encryptedSolution: this.encrypt(solution),
        difficulty,
        solvedBy: [],
        attempts: 0,
        reputation: 0,
        isActive: true,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.cipherCollection), cipher);
      return { id: docRef.id, ...cipher };
    } catch (error) {
      console.error('Error submitting cipher:', error);
      throw error;
    }
  }

  // Attempt to solve cipher
  async solveCipher(cipherId, shadowId, attemptedSolution) {
    try {
      const cipherDoc = await getDoc(doc(db, this.cipherCollection, cipherId));
      
      if (!cipherDoc.exists()) {
        throw new Error('Cipher not found');
      }

      const cipherData = cipherDoc.data();
      const correctSolution = this.decrypt(cipherData.encryptedSolution);

      const isCorrect = attemptedSolution.toLowerCase().trim() === correctSolution.toLowerCase().trim();

      // Update cipher with attempt
      await updateDoc(doc(db, this.cipherCollection, cipherId), {
        attempts: cipherData.attempts + 1,
        ...(isCorrect && {
          solvedBy: [...(cipherData.solvedBy || []), shadowId]
        })
      });

      if (isCorrect) {
        // Award XP to solver
        await this.awardShadowXP(shadowId, 50, 'CIPHER_SOLVED');
      }

      return { correct: isCorrect, solution: isCorrect ? correctSolution : null };
    } catch (error) {
      console.error('Error solving cipher:', error);
      throw error;
    }
  }

  // Award shadow XP
  async awardShadowXP(shadowId, xpAmount, reason) {
    try {
      const q = query(
        collection(db, this.shadowCollection),
        where('shadowId', '==', shadowId)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const shadowDoc = querySnapshot.docs[0];
        const currentData = shadowDoc.data();
        
        await updateDoc(shadowDoc.ref, {
          shadowXP: (currentData.shadowXP || 0) + xpAmount,
          lastActive: serverTimestamp()
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error awarding shadow XP:', error);
      throw error;
    }
  }

  // Get shadow leaderboard
  async getShadowLeaderboard(limit = 10) {
    try {
      const q = query(
        collection(db, this.shadowCollection),
        orderBy('shadowXP', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const leaderboard = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          id: doc.id,
          alias: data.alias,
          shadowXP: data.shadowXP,
          maskLevel: data.maskLevel,
          battlesWon: data.battlesWon,
          reputation: data.reputation
        });
      });

      return leaderboard;
    } catch (error) {
      console.error('Error getting shadow leaderboard:', error);
      throw error;
    }
  }

  // Subscribe to real-time shadow updates
  subscribeShadowUpdates(shadowId, callback) {
    const q = query(
      collection(db, this.shadowCollection),
      where('shadowId', '==', shadowId)
    );

    return onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        callback({ id: doc.id, ...doc.data() });
      }
    });
  }

  // Clean up expired whispers (should be run periodically)
  async cleanupExpiredWhispers() {
    try {
      const q = query(
        collection(db, this.whisperCollection),
        where('expiresAt', '<', new Date())
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = [];

      querySnapshot.forEach((doc) => {
        deletePromises.push(deleteDoc(doc.ref));
      });

      await Promise.all(deletePromises);
      return deletePromises.length;
    } catch (error) {
      console.error('Error cleaning up expired whispers:', error);
      throw error;
    }
  }
}

export default new ShadowProtocol();
