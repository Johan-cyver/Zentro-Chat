// Admin Service for User Management
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

class AdminService {
  constructor() {
    this.ADMIN_ID = '2bDEJ7WRxuXxxco56let1xDl2Ks1';
  }

  // Check if user is admin
  isAdmin(userId) {
    return userId === this.ADMIN_ID;
  }

  // Get all registered users
  async getAllUsers() {
    try {
      // Get from Firebase
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const firebaseUsers = [];
      
      snapshot.forEach((doc) => {
        firebaseUsers.push({
          id: doc.id,
          ...doc.data(),
          source: 'firebase'
        });
      });

      // Get from localStorage as backup
      const localUsers = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
      const localUsersFormatted = localUsers.map(user => ({
        ...user,
        id: user.uid || user.id,
        source: 'localStorage'
      }));

      // Combine and deduplicate
      const allUsers = [...firebaseUsers];
      localUsersFormatted.forEach(localUser => {
        if (!firebaseUsers.find(fbUser => fbUser.id === localUser.id)) {
          allUsers.push(localUser);
        }
      });

      return allUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      // Fallback to localStorage only
      const localUsers = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
      return localUsers.map(user => ({
        ...user,
        id: user.uid || user.id,
        source: 'localStorage'
      }));
    }
  }

  // Ban user for a specific time period
  async banUser(adminId, targetUserId, banDuration, reason = '') {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can ban users');
    }

    try {
      const banEndTime = new Date();
      banEndTime.setHours(banEndTime.getHours() + banDuration);

      const banData = {
        userId: targetUserId,
        bannedBy: adminId,
        banStartTime: serverTimestamp(),
        banEndTime: banEndTime.toISOString(),
        reason: reason,
        active: true,
        type: 'temporary'
      };

      // Save to Firebase
      try {
        const banRef = doc(db, 'bans', targetUserId);
        await setDoc(banRef, banData);

        // Update user document to mark as banned
        const userRef = doc(db, 'users', targetUserId);
        await updateDoc(userRef, {
          banned: true,
          banEndTime: banEndTime.toISOString(),
          banReason: reason
        });
      } catch (firebaseError) {
        console.warn('Firebase not available, using localStorage:', firebaseError);
      }

      // Save to localStorage as backup
      const bans = JSON.parse(localStorage.getItem('zentro_user_bans') || '[]');
      bans.push({
        ...banData,
        banStartTime: new Date().toISOString()
      });
      localStorage.setItem('zentro_user_bans', JSON.stringify(bans));

      console.log(`✅ User ${targetUserId} banned for ${banDuration} hours`);
      return true;
    } catch (error) {
      console.error('Error banning user:', error);
      throw error;
    }
  }

  // Kick user permanently (can never rejoin with same email)
  async kickUser(adminId, targetUserId, reason = '') {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can kick users');
    }

    try {
      const kickData = {
        userId: targetUserId,
        kickedBy: adminId,
        kickTime: new Date().toISOString(),
        reason: reason,
        type: 'permanent'
      };

      // Save to Firebase
      try {
        const kickRef = doc(db, 'kicks', targetUserId);
        await setDoc(kickRef, kickData);

        // Get user email before deletion
        const userRef = doc(db, 'users', targetUserId);
        const userDoc = await getDoc(userRef);
        const userEmail = userDoc.exists() ? userDoc.data().email : null;

        // Add email to permanent ban list
        if (userEmail) {
          const emailBanRef = doc(db, 'email_bans', userEmail);
          await setDoc(emailBanRef, {
            email: userEmail,
            userId: targetUserId,
            kickedBy: adminId,
            kickTime: serverTimestamp(),
            reason: reason
          });
        }

        // Delete user document
        await deleteDoc(userRef);
      } catch (firebaseError) {
        console.warn('Firebase not available, using localStorage:', firebaseError);
      }

      // Save to localStorage as backup
      const kicks = JSON.parse(localStorage.getItem('zentro_user_kicks') || '[]');
      kicks.push(kickData);
      localStorage.setItem('zentro_user_kicks', JSON.stringify(kicks));

      // Add to email ban list in localStorage
      const emailBans = JSON.parse(localStorage.getItem('zentro_email_bans') || '[]');
      const users = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
      const targetUser = users.find(u => u.uid === targetUserId);
      
      if (targetUser?.email) {
        emailBans.push({
          email: targetUser.email,
          userId: targetUserId,
          kickedBy: adminId,
          kickTime: new Date().toISOString(),
          reason: reason
        });
        localStorage.setItem('zentro_email_bans', JSON.stringify(emailBans));
      }

      // Remove from all local storage
      const updatedUsers = users.filter(u => u.uid !== targetUserId);
      localStorage.setItem('zentro_registered_users', JSON.stringify(updatedUsers));

      console.log(`✅ User ${targetUserId} permanently kicked`);
      return true;
    } catch (error) {
      console.error('Error kicking user:', error);
      throw error;
    }
  }

  // Toggle user visibility in friend suggestions
  async toggleFriendSuggestionVisibility(adminId, targetUserId, visible) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can modify friend suggestions');
    }

    try {
      // Save to Firebase
      try {
        const userRef = doc(db, 'users', targetUserId);
        await updateDoc(userRef, {
          hiddenFromSuggestions: !visible,
          lastModifiedBy: adminId,
          lastModified: serverTimestamp()
        });
      } catch (firebaseError) {
        console.warn('Firebase not available, using localStorage:', firebaseError);
      }

      // Save to localStorage
      const hiddenUsers = JSON.parse(localStorage.getItem('zentro_hidden_from_suggestions') || '[]');
      
      if (!visible && !hiddenUsers.includes(targetUserId)) {
        hiddenUsers.push(targetUserId);
      } else if (visible) {
        const index = hiddenUsers.indexOf(targetUserId);
        if (index > -1) {
          hiddenUsers.splice(index, 1);
        }
      }
      
      localStorage.setItem('zentro_hidden_from_suggestions', JSON.stringify(hiddenUsers));

      console.log(`✅ User ${targetUserId} ${visible ? 'shown in' : 'hidden from'} friend suggestions`);
      return true;
    } catch (error) {
      console.error('Error toggling friend suggestion visibility:', error);
      throw error;
    }
  }

  // Remove user from professional directory
  async removeFromProfessionalDirectory(adminId, targetUserId) {
    if (!this.isAdmin(adminId)) {
      throw new Error('Unauthorized: Only admins can modify professional directory');
    }

    try {
      // Remove from localStorage professional profiles
      const professionals = JSON.parse(localStorage.getItem('zentro_professional_profiles') || '[]');
      const updatedProfessionals = professionals.filter(prof => prof.userId !== targetUserId);
      localStorage.setItem('zentro_professional_profiles', JSON.stringify(updatedProfessionals));

      // Mark user as hidden from directory
      const hiddenFromDirectory = JSON.parse(localStorage.getItem('zentro_hidden_from_directory') || '[]');
      if (!hiddenFromDirectory.includes(targetUserId)) {
        hiddenFromDirectory.push(targetUserId);
        localStorage.setItem('zentro_hidden_from_directory', JSON.stringify(hiddenFromDirectory));
      }

      console.log(`✅ User ${targetUserId} removed from professional directory`);
      return true;
    } catch (error) {
      console.error('Error removing from professional directory:', error);
      throw error;
    }
  }

  // Check if user is banned
  async isUserBanned(userId) {
    try {
      // Check Firebase first
      try {
        const banRef = doc(db, 'bans', userId);
        const banDoc = await getDoc(banRef);
        
        if (banDoc.exists()) {
          const banData = banDoc.data();
          const banEndTime = new Date(banData.banEndTime);
          const now = new Date();
          
          if (banData.active && now < banEndTime) {
            return {
              banned: true,
              reason: banData.reason,
              endTime: banData.banEndTime
            };
          }
        }
      } catch (firebaseError) {
        console.warn('Firebase not available, checking localStorage:', firebaseError);
      }

      // Check localStorage
      const bans = JSON.parse(localStorage.getItem('zentro_user_bans') || '[]');
      const userBan = bans.find(ban => ban.userId === userId && ban.active);
      
      if (userBan) {
        const banEndTime = new Date(userBan.banEndTime);
        const now = new Date();
        
        if (now < banEndTime) {
          return {
            banned: true,
            reason: userBan.reason,
            endTime: userBan.banEndTime
          };
        }
      }

      return { banned: false };
    } catch (error) {
      console.error('Error checking ban status:', error);
      return { banned: false };
    }
  }

  // Check if email is permanently banned
  async isEmailBanned(email) {
    try {
      // Check Firebase first
      try {
        const emailBanRef = doc(db, 'email_bans', email);
        const emailBanDoc = await getDoc(emailBanRef);
        
        if (emailBanDoc.exists()) {
          return true;
        }
      } catch (firebaseError) {
        console.warn('Firebase not available, checking localStorage:', firebaseError);
      }

      // Check localStorage
      const emailBans = JSON.parse(localStorage.getItem('zentro_email_bans') || '[]');
      return emailBans.some(ban => ban.email === email);
    } catch (error) {
      console.error('Error checking email ban status:', error);
      return false;
    }
  }

  // Get admin statistics
  async getAdminStats() {
    try {
      const allUsers = await this.getAllUsers();
      const bans = JSON.parse(localStorage.getItem('zentro_user_bans') || '[]');
      const kicks = JSON.parse(localStorage.getItem('zentro_user_kicks') || '[]');
      const hiddenFromSuggestions = JSON.parse(localStorage.getItem('zentro_hidden_from_suggestions') || '[]');
      const hiddenFromDirectory = JSON.parse(localStorage.getItem('zentro_hidden_from_directory') || '[]');

      const activeBans = bans.filter(ban => {
        const banEndTime = new Date(ban.banEndTime);
        return ban.active && new Date() < banEndTime;
      });

      return {
        totalUsers: allUsers.length,
        activeBans: activeBans.length,
        totalKicks: kicks.length,
        hiddenFromSuggestions: hiddenFromSuggestions.length,
        hiddenFromDirectory: hiddenFromDirectory.length,
        recentActions: [...bans, ...kicks]
          .sort((a, b) => new Date(b.banStartTime || b.kickTime) - new Date(a.banStartTime || a.kickTime))
          .slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalUsers: 0,
        activeBans: 0,
        totalKicks: 0,
        hiddenFromSuggestions: 0,
        hiddenFromDirectory: 0,
        recentActions: []
      };
    }
  }
}

// Create singleton instance
const adminService = new AdminService();

export default adminService;
