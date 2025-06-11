// Shadow Network WebSocket Service
// Simulates real-time connections for Shadow Network features

class ShadowWebSocketService {
  constructor() {
    this.connections = new Map();
    this.listeners = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    // Simulate WebSocket connection
    this.simulateConnection();
  }

  // Simulate WebSocket connection since we don't have a real server
  simulateConnection() {
    console.log('🔗 Shadow Network: Establishing secure connection...');
    
    setTimeout(() => {
      this.isConnected = true;
      console.log('✅ Shadow Network: Connection established');
      this.notifyListeners('connected', { status: 'connected' });
      
      // Start heartbeat
      this.startHeartbeat();
      
      // Simulate some network activity
      this.simulateNetworkActivity();
    }, 2000);
  }

  // Simulate network activity
  simulateNetworkActivity() {
    setInterval(() => {
      if (this.isConnected) {
        // Simulate random shadow activities
        const activities = [
          { type: 'shadow_joined', shadowId: `SHADOW_${Math.random().toString(36).substr(2, 8).toUpperCase()}` },
          { type: 'cipher_solved', shadowId: 'CIPHER_MASTER_X', reward: 50 },
          { type: 'whisper_sent', from: 'PHANTOM_USER', to: 'GHOST_WALKER' },
          { type: 'battle_started', participants: 2 },
          { type: 'squad_formed', squadName: 'VOID_HUNTERS', members: 3 }
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        this.notifyListeners('activity', activity);
      }
    }, 10000); // Every 10 seconds
  }

  // Start heartbeat to maintain connection
  startHeartbeat() {
    setInterval(() => {
      if (this.isConnected) {
        this.notifyListeners('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Every 30 seconds
  }

  // Connect to Shadow Network
  connect(shadowProfile) {
    if (this.isConnected) {
      console.log('🔗 Already connected to Shadow Network');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      console.log('🔗 Connecting to Shadow Network...');
      
      // Simulate connection delay
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          this.isConnected = true;
          this.connections.set(shadowProfile.shadowId, {
            shadowId: shadowProfile.shadowId,
            alias: shadowProfile.alias,
            connectedAt: Date.now(),
            status: 'active'
          });
          
          console.log('✅ Connected to Shadow Network');
          this.notifyListeners('connected', { shadowProfile });
          resolve();
        } else {
          console.error('❌ Failed to connect to Shadow Network');
          reject(new Error('Connection failed'));
        }
      }, 1500);
    });
  }

  // Disconnect from Shadow Network
  disconnect(shadowId) {
    if (shadowId && this.connections.has(shadowId)) {
      this.connections.delete(shadowId);
    }
    
    this.isConnected = false;
    console.log('🔌 Disconnected from Shadow Network');
    this.notifyListeners('disconnected', {});
  }

  // Send message through Shadow Network
  sendMessage(type, data) {
    if (!this.isConnected) {
      console.warn('⚠️ Not connected to Shadow Network');
      return false;
    }

    const message = {
      type,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    console.log('📡 Shadow Network message sent:', message);
    
    // Simulate message delivery
    setTimeout(() => {
      this.notifyListeners('message', message);
    }, 100);

    return true;
  }

  // Join a specific shadow zone
  joinZone(zoneId, shadowProfile) {
    if (!this.isConnected) {
      return Promise.reject(new Error('Not connected'));
    }

    return new Promise((resolve) => {
      console.log(`🚪 Joining zone: ${zoneId}`);
      
      setTimeout(() => {
        const zoneData = {
          zoneId,
          shadowId: shadowProfile.shadowId,
          joinedAt: Date.now(),
          participants: Math.floor(Math.random() * 20) + 1
        };
        
        this.notifyListeners('zone_joined', zoneData);
        resolve(zoneData);
      }, 1000);
    });
  }

  // Leave a shadow zone
  leaveZone(zoneId, shadowId) {
    console.log(`🚪 Leaving zone: ${zoneId}`);
    this.notifyListeners('zone_left', { zoneId, shadowId });
  }

  // Get active shadows in network
  getActiveShadows() {
    const mockShadows = [
      { shadowId: 'PHANTOM_BLADE_777', alias: 'PHANTOM_BLADE_777', zone: 'CIPHER', status: 'active' },
      { shadowId: 'VOID_HUNTER_123', alias: 'VOID_HUNTER_123', zone: 'ARENA', status: 'active' },
      { shadowId: 'GHOST_WALKER_456', alias: 'GHOST_WALKER_456', zone: 'WHISPERS', status: 'active' },
      { shadowId: 'CIPHER_MASTER_X', alias: 'CIPHER_MASTER_X', zone: 'CIPHER', status: 'active' },
      { shadowId: 'NEON_STORM_666', alias: 'NEON_STORM_666', zone: 'INFILTRATION', status: 'active' }
    ];

    return Promise.resolve(mockShadows);
  }

  // Subscribe to Shadow Network events
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Notify all listeners of an event
  notifyListeners(eventType, data) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in Shadow Network listener:', error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      activeConnections: this.connections.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Simulate infiltration lobby
  createInfiltrationLobby(shadowProfile) {
    return new Promise((resolve) => {
      const lobbyCode = Math.random().toString(36).substr(2, 6).toUpperCase();
      
      setTimeout(() => {
        const lobby = {
          code: lobbyCode,
          host: shadowProfile.shadowId,
          participants: [shadowProfile],
          maxParticipants: 8,
          status: 'waiting',
          createdAt: Date.now()
        };
        
        console.log(`🎮 Infiltration lobby created: ${lobbyCode}`);
        this.notifyListeners('lobby_created', lobby);
        resolve(lobby);
      }, 1000);
    });
  }

  // Join infiltration lobby
  joinInfiltrationLobby(lobbyCode, shadowProfile) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.2) { // 80% success rate
          const lobby = {
            code: lobbyCode,
            participants: [shadowProfile],
            status: 'joined'
          };
          
          console.log(`🎮 Joined infiltration lobby: ${lobbyCode}`);
          this.notifyListeners('lobby_joined', lobby);
          resolve(lobby);
        } else {
          reject(new Error('Lobby not found or full'));
        }
      }, 1500);
    });
  }

  // Simulate squad operations
  createSquad(squadData, shadowProfile) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const squad = {
          id: `squad_${Date.now()}`,
          ...squadData,
          leader: shadowProfile.shadowId,
          members: [shadowProfile.shadowId],
          createdAt: Date.now(),
          status: 'active'
        };
        
        console.log(`⚔️ Squad created: ${squad.name}`);
        this.notifyListeners('squad_created', squad);
        resolve(squad);
      }, 1000);
    });
  }

  // Join squad
  joinSquad(squadId, shadowProfile) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% success rate
          console.log(`⚔️ Joined squad: ${squadId}`);
          this.notifyListeners('squad_joined', { squadId, shadowId: shadowProfile.shadowId });
          resolve({ squadId, status: 'joined' });
        } else {
          reject(new Error('Squad full or invitation required'));
        }
      }, 1000);
    });
  }
}

// Create singleton instance
const shadowWebSocketService = new ShadowWebSocketService();

export default shadowWebSocketService;
