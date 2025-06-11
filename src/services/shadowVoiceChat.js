// Shadow Voice Chat Service
// Simulates voice chat functionality for deception protocol games

class ShadowVoiceChatService {
  constructor() {
    this.isConnected = false;
    this.isMuted = false;
    this.isDeafened = false;
    this.currentRoom = null;
    this.participants = new Map();
    this.audioContext = null;
    this.mediaStream = null;
    this.peerConnections = new Map();
    this.listeners = new Map();
    
    // Voice activity detection
    this.voiceActivityThreshold = 0.01;
    this.speakingParticipants = new Set();
    
    // Proximity chat settings
    this.proximityEnabled = false;
    this.maxProximityDistance = 100;
    this.playerPositions = new Map();
  }

  // Initialize voice chat system
  async initialize() {
    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });
      
      // Initialize Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      console.log('🎤 Shadow Voice Chat initialized');
      this.isConnected = true;
      this.notifyListeners('initialized', { status: 'ready' });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize voice chat:', error);
      this.notifyListeners('error', { error: 'Microphone access denied' });
      return false;
    }
  }

  // Join a voice chat room
  async joinRoom(roomId, shadowProfile) {
    if (!this.isConnected) {
      await this.initialize();
    }
    
    this.currentRoom = roomId;
    
    // Add self to participants
    this.participants.set(shadowProfile.shadowId, {
      shadowId: shadowProfile.shadowId,
      alias: shadowProfile.alias,
      isMuted: false,
      isDeafened: false,
      isSpeaking: false,
      volume: 1.0,
      position: { x: 0, y: 0 }, // For proximity chat
      joinedAt: Date.now()
    });
    
    // Simulate other participants joining
    this.simulateParticipants();
    
    console.log(`🔊 Joined voice room: ${roomId}`);
    this.notifyListeners('roomJoined', { roomId, participants: Array.from(this.participants.values()) });
    
    // Start voice activity detection
    this.startVoiceActivityDetection();
    
    return true;
  }

  // Leave current voice chat room
  leaveRoom() {
    if (this.currentRoom) {
      console.log(`🔇 Left voice room: ${this.currentRoom}`);
      
      // Clean up
      this.participants.clear();
      this.speakingParticipants.clear();
      this.currentRoom = null;
      
      this.notifyListeners('roomLeft', {});
    }
  }

  // Toggle mute status
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach(track => {
        track.enabled = !this.isMuted;
      });
    }
    
    console.log(`🎤 ${this.isMuted ? 'Muted' : 'Unmuted'}`);
    this.notifyListeners('muteToggled', { isMuted: this.isMuted });
    
    return this.isMuted;
  }

  // Toggle deafen status (can't hear others)
  toggleDeafen() {
    this.isDeafened = !this.isDeafened;
    
    console.log(`🔇 ${this.isDeafened ? 'Deafened' : 'Undeafened'}`);
    this.notifyListeners('deafenToggled', { isDeafened: this.isDeafened });
    
    return this.isDeafened;
  }

  // Set participant volume
  setParticipantVolume(shadowId, volume) {
    const participant = this.participants.get(shadowId);
    if (participant) {
      participant.volume = Math.max(0, Math.min(1, volume));
      this.notifyListeners('volumeChanged', { shadowId, volume: participant.volume });
    }
  }

  // Enable/disable proximity chat
  toggleProximityChat(enabled) {
    this.proximityEnabled = enabled;
    console.log(`📍 Proximity chat ${enabled ? 'enabled' : 'disabled'}`);
    this.notifyListeners('proximityToggled', { enabled });
    
    if (enabled) {
      this.updateProximityAudio();
    }
  }

  // Update player position for proximity chat
  updatePlayerPosition(shadowId, position) {
    this.playerPositions.set(shadowId, position);
    
    if (this.proximityEnabled) {
      this.updateProximityAudio();
    }
  }

  // Calculate proximity-based audio levels
  updateProximityAudio() {
    const myPosition = this.playerPositions.get(Array.from(this.participants.keys())[0]);
    if (!myPosition) return;
    
    this.participants.forEach((participant, shadowId) => {
      if (shadowId === Array.from(this.participants.keys())[0]) return; // Skip self
      
      const theirPosition = this.playerPositions.get(shadowId);
      if (!theirPosition) return;
      
      const distance = Math.sqrt(
        Math.pow(myPosition.x - theirPosition.x, 2) + 
        Math.pow(myPosition.y - theirPosition.y, 2)
      );
      
      // Calculate volume based on distance
      const volume = Math.max(0, 1 - (distance / this.maxProximityDistance));
      participant.proximityVolume = volume;
      
      this.notifyListeners('proximityVolumeChanged', { shadowId, volume });
    });
  }

  // Start voice activity detection
  startVoiceActivityDetection() {
    if (!this.mediaStream || !this.audioContext) return;
    
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const analyser = this.audioContext.createAnalyser();
    
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const detectVoiceActivity = () => {
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedVolume = average / 255;
      
      const isSpeaking = normalizedVolume > this.voiceActivityThreshold && !this.isMuted;
      
      // Update speaking status
      const myId = Array.from(this.participants.keys())[0];
      if (myId) {
        const participant = this.participants.get(myId);
        if (participant && participant.isSpeaking !== isSpeaking) {
          participant.isSpeaking = isSpeaking;
          this.notifyListeners('speakingChanged', { shadowId: myId, isSpeaking });
        }
      }
      
      // Continue monitoring
      if (this.currentRoom) {
        requestAnimationFrame(detectVoiceActivity);
      }
    };
    
    detectVoiceActivity();
  }

  // Simulate other participants for demo
  simulateParticipants() {
    const mockParticipants = [
      { shadowId: 'phantom_blade_777', alias: 'PHANTOM_BLADE_777' },
      { shadowId: 'void_hunter_123', alias: 'VOID_HUNTER_123' },
      { shadowId: 'cipher_master_x', alias: 'CIPHER_MASTER_X' },
      { shadowId: 'ghost_walker_456', alias: 'GHOST_WALKER_456' },
      { shadowId: 'neon_storm_666', alias: 'NEON_STORM_666' }
    ];
    
    mockParticipants.forEach(participant => {
      this.participants.set(participant.shadowId, {
        ...participant,
        isMuted: Math.random() > 0.7, // 30% chance of being muted
        isDeafened: false,
        isSpeaking: false,
        volume: 1.0,
        position: { 
          x: Math.random() * 200 - 100, 
          y: Math.random() * 200 - 100 
        },
        joinedAt: Date.now() - Math.random() * 60000 // Joined within last minute
      });
    });
    
    // Simulate speaking activity
    this.simulateSpeakingActivity();
  }

  // Simulate speaking activity for demo
  simulateSpeakingActivity() {
    if (!this.currentRoom) return;
    
    setInterval(() => {
      if (!this.currentRoom) return;
      
      // Randomly make participants speak
      this.participants.forEach((participant, shadowId) => {
        if (shadowId === Array.from(this.participants.keys())[0]) return; // Skip self
        
        if (Math.random() > 0.95) { // 5% chance per interval
          participant.isSpeaking = !participant.isSpeaking;
          this.notifyListeners('speakingChanged', { shadowId, isSpeaking: participant.isSpeaking });
          
          // Stop speaking after random duration
          if (participant.isSpeaking) {
            setTimeout(() => {
              participant.isSpeaking = false;
              this.notifyListeners('speakingChanged', { shadowId, isSpeaking: false });
            }, Math.random() * 3000 + 1000); // 1-4 seconds
          }
        }
      });
    }, 500); // Check every 500ms
  }

  // Get current participants
  getParticipants() {
    return Array.from(this.participants.values());
  }

  // Get speaking participants
  getSpeakingParticipants() {
    return Array.from(this.participants.values()).filter(p => p.isSpeaking);
  }

  // Push to talk functionality
  startPushToTalk() {
    if (this.isMuted) {
      this.toggleMute();
      this.notifyListeners('pushToTalkStart', {});
    }
  }

  stopPushToTalk() {
    if (!this.isMuted) {
      this.toggleMute();
      this.notifyListeners('pushToTalkEnd', {});
    }
  }

  // Emergency meeting - mute all except host
  triggerEmergencyMeeting(hostId) {
    this.participants.forEach((participant, shadowId) => {
      if (shadowId !== hostId) {
        participant.isMuted = true;
      }
    });
    
    this.notifyListeners('emergencyMeeting', { hostId });
    console.log('🚨 Emergency meeting called - all participants muted except host');
  }

  // End emergency meeting - unmute all
  endEmergencyMeeting() {
    this.participants.forEach(participant => {
      participant.isMuted = false;
    });
    
    this.notifyListeners('emergencyMeetingEnd', {});
    console.log('✅ Emergency meeting ended - all participants unmuted');
  }

  // Spatial audio for different game zones
  setAudioZone(zone) {
    const zoneSettings = {
      tasks: { reverb: 0.2, echo: 0.1 },
      meeting: { reverb: 0.8, echo: 0.3 },
      emergency: { reverb: 1.0, echo: 0.5, urgency: true }
    };
    
    const settings = zoneSettings[zone] || zoneSettings.tasks;
    this.notifyListeners('audioZoneChanged', { zone, settings });
  }

  // Subscribe to voice chat events
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
          console.error('Error in voice chat listener:', error);
        }
      });
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isMuted: this.isMuted,
      isDeafened: this.isDeafened,
      currentRoom: this.currentRoom,
      participantCount: this.participants.size,
      proximityEnabled: this.proximityEnabled
    };
  }

  // Cleanup
  disconnect() {
    this.leaveRoom();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.peerConnections.clear();
    this.listeners.clear();
    this.isConnected = false;
    
    console.log('🔇 Shadow Voice Chat disconnected');
  }
}

// Create singleton instance
const shadowVoiceChatService = new ShadowVoiceChatService();

export default shadowVoiceChatService;
