// Shadow User Control Service - Admin module for user management

class ShadowUserControlService {
  constructor() {
    this.maskedUsers = new Map();
    this.userActivities = new Map();
    this.frozenUsers = new Set();
    this.revealedUsers = new Map();
    this.silentDirectives = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  initializeMockData() {
    const mockUsers = [
      {
        shadowId: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        realName: 'Anonymous', // Hidden until revealed
        email: 'hidden@shadow.net',
        maskLevel: 5,
        shadowXP: 2450,
        reputation: 890,
        status: 'online',
        lastActive: Date.now() - 300000, // 5 minutes ago
        joinedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
        faction: 'CIPHER_COLLECTIVE',
        clearanceLevel: 3,
        suspicionLevel: 0,
        activities: {
          missionsCompleted: 23,
          ciphersSolved: 15,
          battlesWon: 8,
          projectsContributed: 3
        },
        deviceFingerprint: 'fp_phantom_001',
        ipHistory: ['192.168.1.100', '10.0.0.50'],
        behaviorPattern: 'normal'
      },
      {
        shadowId: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        realName: 'Anonymous',
        email: 'hidden@shadow.net',
        maskLevel: 4,
        shadowXP: 1890,
        reputation: 650,
        status: 'online',
        lastActive: Date.now() - 600000, // 10 minutes ago
        joinedAt: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
        faction: 'SHADOW_GUARD',
        clearanceLevel: 2,
        suspicionLevel: 15,
        activities: {
          missionsCompleted: 18,
          ciphersSolved: 12,
          battlesWon: 12,
          projectsContributed: 2
        },
        deviceFingerprint: 'fp_void_002',
        ipHistory: ['203.0.113.45', '198.51.100.23'],
        behaviorPattern: 'suspicious'
      },
      {
        shadowId: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        realName: 'Anonymous',
        email: 'hidden@shadow.net',
        maskLevel: 7,
        shadowXP: 4200,
        reputation: 1250,
        status: 'offline',
        lastActive: Date.now() - 3600000, // 1 hour ago
        joinedAt: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
        faction: 'VOID_WALKERS',
        clearanceLevel: 5,
        suspicionLevel: 0,
        activities: {
          missionsCompleted: 45,
          ciphersSolved: 38,
          battlesWon: 22,
          projectsContributed: 8
        },
        deviceFingerprint: 'fp_cipher_003',
        ipHistory: ['172.16.0.100', '10.1.1.50'],
        behaviorPattern: 'elite'
      }
    ];

    mockUsers.forEach(user => {
      this.maskedUsers.set(user.shadowId, user);
    });
  }

  // List all masked users with their current status
  async listMaskedUsers() {
    const users = Array.from(this.maskedUsers.values());
    
    // Update status based on last activity
    users.forEach(user => {
      const timeSinceActive = Date.now() - user.lastActive;
      if (timeSinceActive < 300000) { // 5 minutes
        user.status = 'online';
      } else if (timeSinceActive < 3600000) { // 1 hour
        user.status = 'away';
      } else {
        user.status = 'offline';
      }

      // Mark suspicious users
      if (user.suspicionLevel > 50) {
        user.status = 'suspicious';
      }
    });

    return users.sort((a, b) => b.lastActive - a.lastActive);
  }

  // Reveal a user's shadow identity (unmask)
  async revealUserShadow(shadowId) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    // Simulate revealing real identity
    const revealedData = {
      shadowId,
      realName: this.generateRealName(),
      email: this.generateEmail(),
      location: this.generateLocation(),
      deviceInfo: this.generateDeviceInfo(),
      revealedAt: Date.now(),
      revealedBy: 'ARCHITECT'
    };

    this.revealedUsers.set(shadowId, revealedData);
    
    // Log the reveal action
    console.log(`🔍 IDENTITY REVEALED: ${shadowId} -> ${revealedData.realName}`);
    
    return revealedData;
  }

  // Freeze a shadow account
  async freezeShadow(shadowId) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    this.frozenUsers.add(shadowId);
    user.status = 'frozen';
    user.frozenAt = Date.now();
    user.frozenBy = 'ARCHITECT';

    console.log(`🧊 SHADOW FROZEN: ${shadowId}`);
    
    return {
      shadowId,
      status: 'frozen',
      frozenAt: user.frozenAt,
      reason: 'Administrative action'
    };
  }

  // Unfreeze a shadow account
  async unfreezeShadow(shadowId) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    this.frozenUsers.delete(shadowId);
    user.status = 'online';
    delete user.frozenAt;
    delete user.frozenBy;

    console.log(`🔥 SHADOW UNFROZEN: ${shadowId}`);
    
    return {
      shadowId,
      status: 'active',
      unfrozenAt: Date.now()
    };
  }

  // Upgrade shadow level
  async upgradeShadowLevel(shadowId, newLevel) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.maskLevel;
    user.maskLevel = Math.max(1, Math.min(10, newLevel));
    user.lastUpgrade = Date.now();
    user.upgradedBy = 'ARCHITECT';

    console.log(`⬆️ SHADOW UPGRADED: ${shadowId} (${oldLevel} -> ${user.maskLevel})`);
    
    return {
      shadowId,
      oldLevel,
      newLevel: user.maskLevel,
      upgradedAt: user.lastUpgrade
    };
  }

  // View detailed activity log for a user
  async viewActivityLog(shadowId) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate mock activity log
    const activities = [
      {
        timestamp: Date.now() - 300000,
        action: 'mission_completed',
        details: 'Completed Code Ops mission: API Debug Challenge',
        xpGained: 50,
        location: 'Shadow Terminal'
      },
      {
        timestamp: Date.now() - 600000,
        action: 'cipher_solved',
        details: 'Solved cipher: Binary Sequence Puzzle',
        xpGained: 30,
        location: 'Cipher Board'
      },
      {
        timestamp: Date.now() - 900000,
        action: 'squad_joined',
        details: 'Joined squad: Elite Hackers',
        xpGained: 0,
        location: 'Squad Forge'
      },
      {
        timestamp: Date.now() - 1200000,
        action: 'battle_won',
        details: 'Won arena battle against SHADOW_WARRIOR',
        xpGained: 75,
        location: 'Masked Arena'
      }
    ];

    return {
      shadowId,
      totalActivities: activities.length,
      recentActivities: activities,
      behaviorPattern: user.behaviorPattern,
      suspicionLevel: user.suspicionLevel
    };
  }

  // Send silent directive to user
  async sendSilentDirective(shadowId, directive) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    const directiveData = {
      id: `dir_${Date.now()}`,
      shadowId,
      message: directive,
      sentAt: Date.now(),
      sentBy: 'ARCHITECT',
      status: 'sent',
      priority: 'high'
    };

    if (!this.silentDirectives.has(shadowId)) {
      this.silentDirectives.set(shadowId, []);
    }
    
    this.silentDirectives.get(shadowId).push(directiveData);

    console.log(`📡 DIRECTIVE SENT: ${shadowId} -> "${directive}"`);
    
    return directiveData;
  }

  // Ban shadow (permanent freeze)
  async banShadow(shadowId, reason) {
    const user = this.maskedUsers.get(shadowId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = 'banned';
    user.bannedAt = Date.now();
    user.bannedBy = 'ARCHITECT';
    user.banReason = reason;

    console.log(`🚫 SHADOW BANNED: ${shadowId} - Reason: ${reason}`);
    
    return {
      shadowId,
      status: 'banned',
      bannedAt: user.bannedAt,
      reason
    };
  }

  // Monitor user behavior patterns
  async monitorBehaviorPatterns() {
    const users = Array.from(this.maskedUsers.values());
    const patterns = {
      normal: users.filter(u => u.behaviorPattern === 'normal').length,
      suspicious: users.filter(u => u.behaviorPattern === 'suspicious').length,
      elite: users.filter(u => u.behaviorPattern === 'elite').length,
      bot: users.filter(u => u.behaviorPattern === 'bot').length
    };

    return {
      totalUsers: users.length,
      patterns,
      alerts: users.filter(u => u.suspicionLevel > 70).map(u => ({
        shadowId: u.shadowId,
        suspicionLevel: u.suspicionLevel,
        reason: 'High suspicion level detected'
      }))
    };
  }

  // Helper methods for generating mock data
  generateRealName() {
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateEmail() {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'protonmail.com'];
    const username = Math.random().toString(36).substring(2, 10);
    return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  generateLocation() {
    const locations = ['New York, USA', 'London, UK', 'Tokyo, Japan', 'Berlin, Germany', 'Toronto, Canada', 'Sydney, Australia'];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  generateDeviceInfo() {
    const devices = [
      'Windows 11 - Chrome 120.0',
      'macOS Sonoma - Safari 17.0',
      'Ubuntu 22.04 - Firefox 121.0',
      'Android 14 - Chrome Mobile',
      'iOS 17 - Safari Mobile'
    ];
    return devices[Math.floor(Math.random() * devices.length)];
  }

  // Get user statistics
  async getUserStats() {
    const users = Array.from(this.maskedUsers.values());
    
    return {
      totalUsers: users.length,
      onlineUsers: users.filter(u => u.status === 'online').length,
      frozenUsers: this.frozenUsers.size,
      revealedUsers: this.revealedUsers.size,
      averageLevel: users.reduce((sum, u) => sum + u.maskLevel, 0) / users.length,
      averageXP: users.reduce((sum, u) => sum + u.shadowXP, 0) / users.length,
      topPerformers: users.filter(u => u.shadowXP > 2000).length
    };
  }
}

// Create singleton instance
const shadowUserControl = new ShadowUserControlService();

export default shadowUserControl;
