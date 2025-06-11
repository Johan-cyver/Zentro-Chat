// Utility to sync user data between different storage layers
// This ensures compatibility between different parts of the app

class UserDataSync {
  constructor() {
    this.KEYS = {
      ALL_USERS: 'zentro_all_users',
      REGISTERED_USERS: 'zentro_registered_users',
      PROFILE_PREFIX: 'zentro_user_profile_',
      SYNC_STATUS_PREFIX: 'zentro_sync_status_'
    };

    // Set up periodic sync check
    this.setupPeriodicSync();
  }

  // Set up periodic sync to check for unsynchronized changes
  setupPeriodicSync() {
    setInterval(() => {
      this.checkForUnsyncedChanges();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // Check for unsynced changes and retry sync
  async checkForUnsyncedChanges() {
    const users = this.getAllUsers();
    for (const user of users) {
      if (user.uid) {
        const syncStatus = this.getSyncStatus(user.uid);
        if (syncStatus && !syncStatus.results.firebase) {
          console.log(`[UserDataSync] Found unsynced changes for user ${user.uid}, retrying sync...`);
          this.syncUser(user);
        }
      }
    }
  }

  // Get sync status for a user
  getSyncStatus(userId) {
    try {
      const status = localStorage.getItem(`${this.KEYS.SYNC_STATUS_PREFIX}${userId}`);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('[UserDataSync] Error reading sync status:', error);
      return null;
    }
  }

  // Get all users from any available source
  getAllUsers() {
    let users = [];
    
    try {
      // Try zentro_all_users first
      const allUsers = JSON.parse(localStorage.getItem(this.KEYS.ALL_USERS) || '[]');
      if (allUsers.length > 0) {
        users = allUsers;
      }

      // Merge with registered users
      const registeredUsers = JSON.parse(localStorage.getItem(this.KEYS.REGISTERED_USERS) || '[]');
      if (registeredUsers.length > 0) {
        // Merge avoiding duplicates
        registeredUsers.forEach(regUser => {
          if (!users.find(u => u.uid === regUser.uid)) {
            users.push(regUser);
          }
        });
      }

      // Look for individual profile records
      const profileKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.KEYS.PROFILE_PREFIX) && 
        key !== this.KEYS.ALL_USERS && 
        key !== this.KEYS.REGISTERED_USERS
      );

      profileKeys.forEach(key => {
        try {
          const profile = JSON.parse(localStorage.getItem(key));
          if (profile && profile.uid && !users.find(u => u.uid === profile.uid)) {
            users.push(profile);
          }
        } catch (error) {
          console.warn(`[UserDataSync] Error parsing profile from ${key}:`, error);
        }
      });

    } catch (error) {
      console.error('[UserDataSync] Error reading user data:', error);
    }

    return users;
  }

  // Add or update a user in both storage locations
  syncUser(userProfile) {
    if (!userProfile || !userProfile.uid) {
      console.warn('[UserDataSync] Invalid user profile provided to syncUser');
      return;
    }

    try {
      // Create a normalized profile object to ensure consistency
      const normalizedProfile = {
        uid: userProfile.uid,
        displayName: userProfile.displayName || 'Unknown User',
        email: userProfile.email || '',
        photoURL: userProfile.photoURL || null,
        location: userProfile.location || '',
        bio: userProfile.bio || '',
        professional: userProfile.professional || {},
        visibility: userProfile.visibility || 'public',
        lastSeen: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store individual profile
      const profileKey = `${this.KEYS.PROFILE_PREFIX}${userProfile.uid}`;
      localStorage.setItem(profileKey, JSON.stringify({
        ...normalizedProfile,
        ...userProfile // Keep any additional fields from the original profile
      }));

      // Update zentro_all_users
      const allUsers = JSON.parse(localStorage.getItem(this.KEYS.ALL_USERS) || '[]');
      const existingIndex = allUsers.findIndex(u => u.uid === userProfile.uid);
      
      if (existingIndex >= 0) {
        allUsers[existingIndex] = { 
          ...allUsers[existingIndex], 
          ...normalizedProfile,
          lastUpdated: new Date().toISOString()
        };
      } else {
        allUsers.push({
          ...normalizedProfile,
          joinedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.KEYS.ALL_USERS, JSON.stringify(allUsers));

      // Update zentro_registered_users
      const registeredUsers = JSON.parse(localStorage.getItem(this.KEYS.REGISTERED_USERS) || '[]');
      const existingRegIndex = registeredUsers.findIndex(u => u.uid === userProfile.uid);
      
      if (existingRegIndex >= 0) {
        registeredUsers[existingRegIndex] = { 
          ...registeredUsers[existingRegIndex], 
          ...normalizedProfile,
          lastUpdated: new Date().toISOString()
        };
      } else {
        registeredUsers.push({
          ...normalizedProfile,
          joinedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));

      console.log('[UserDataSync] Profile synced successfully:', userProfile.displayName || userProfile.email);
      return true;
    } catch (error) {
      console.error('[UserDataSync] Error syncing user data:', error);
      return false;
    }
  }

  // Find a user by ID with improved search
  findUserById(userId) {
    if (!userId) return null;

    // First check individual profile storage
    try {
      const profileData = localStorage.getItem(`${this.KEYS.PROFILE_PREFIX}${userId}`);
      if (profileData) {
        return JSON.parse(profileData);
      }
    } catch (error) {
      console.warn('[UserDataSync] Error reading individual profile:', error);
    }

    // Fall back to searching in all users
    return this.getAllUsers().find(user => user.uid === userId);
  }

  // Get user's display name from their profile
  getUserDisplayName(userId) {
    try {
      // First try to get from individual profile
      const profileKey = `${this.KEYS.PROFILE_PREFIX}${userId}`;
      const userProfile = localStorage.getItem(profileKey);
      if (userProfile) {
        const parsed = JSON.parse(userProfile);
        if (parsed.displayName) {
          return parsed.displayName;
        }
      }

      // If not found, try all users
      const allUsers = this.getAllUsers();
      const user = allUsers.find(u => u.uid === userId);
      if (user?.displayName) {
        return user.displayName;
      }

      // If still not found, return a default
      return `User ${userId.slice(0, 6)}`;
    } catch (error) {
      console.error('[UserDataSync] Error getting display name:', error);
      return `User ${userId?.slice(0, 6) || 'Unknown'}`;
    }
  }

  // Clear sync status
  clearSyncStatus(userId) {
    if (userId) {
      localStorage.removeItem(`${this.KEYS.SYNC_STATUS_PREFIX}${userId}`);
    }
  }

  // Migrate existing users to ensure compatibility
  migrateUsers() {
    try {
      console.log('[UserDataSync] Starting user migration...');

      // Get all existing users from different storage locations
      const allUsers = this.getAllUsers();

      if (allUsers.length === 0) {
        console.log('[UserDataSync] No users found to migrate');
        return;
      }

      // Re-sync all users to ensure consistency
      let migratedCount = 0;
      allUsers.forEach(user => {
        if (user.uid) {
          this.syncUser(user);
          migratedCount++;
        }
      });

      console.log(`[UserDataSync] Successfully migrated ${migratedCount} users`);
    } catch (error) {
      console.error('[UserDataSync] Error during user migration:', error);
    }
  }

  // Debug function to show current state
  debugUserData() {
    console.log('🔍 User Data Debug:');
    console.log('All Users:', JSON.parse(localStorage.getItem(this.KEYS.ALL_USERS) || '[]'));
    console.log('Registered Users:', JSON.parse(localStorage.getItem(this.KEYS.REGISTERED_USERS) || '[]'));

    const profileKeys = Object.keys(localStorage).filter(key =>
      key.startsWith(this.KEYS.PROFILE_PREFIX)
    );
    console.log('Individual Profiles:', profileKeys.map(key => {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (error) {
        return { key, error: 'Failed to parse' };
      }
    }));
  }
}

// Create singleton instance
const userDataSync = new UserDataSync();
export default userDataSync;
