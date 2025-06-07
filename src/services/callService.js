import notificationService from './notificationService';

class CallService {
  constructor() {
    this.activeCalls = new Map();
    this.callListeners = new Set();
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.isCallActive = false;
    this.callType = null; // 'voice', 'video', 'screen'
  }

  // Add call listener
  addCallListener(callback) {
    this.callListeners.add(callback);
    return () => this.callListeners.delete(callback);
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.callListeners.forEach(callback => callback(event, data));
  }

  // Start a voice call
  async startVoiceCall(targetUser, currentUser) {
    try {
      this.callType = 'voice';
      
      // Get user media (audio only)
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });

      // Create call record
      const callId = `call_${Date.now()}`;
      const callData = {
        id: callId,
        type: 'voice',
        caller: currentUser,
        callee: targetUser,
        status: 'calling',
        startTime: new Date().toISOString()
      };

      this.activeCalls.set(callId, callData);
      this.isCallActive = true;

      // Show notification to caller
      notificationService.showInfo(`Calling ${targetUser.name}...`, 0);

      // Simulate call notification to target user
      this.simulateIncomingCall(callData);

      this.notifyListeners('call_started', callData);
      return callId;
    } catch (error) {
      console.error('Error starting voice call:', error);
      notificationService.showError('Failed to start voice call. Please check your microphone permissions.');
      throw error;
    }
  }

  // Start a video call
  async startVideoCall(targetUser, currentUser) {
    try {
      this.callType = 'video';
      
      // Get user media (audio and video)
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });

      // Create call record
      const callId = `call_${Date.now()}`;
      const callData = {
        id: callId,
        type: 'video',
        caller: currentUser,
        callee: targetUser,
        status: 'calling',
        startTime: new Date().toISOString()
      };

      this.activeCalls.set(callId, callData);
      this.isCallActive = true;

      // Show notification to caller
      notificationService.showInfo(`Video calling ${targetUser.name}...`, 0);

      // Simulate call notification to target user
      this.simulateIncomingCall(callData);

      this.notifyListeners('call_started', callData);
      return callId;
    } catch (error) {
      console.error('Error starting video call:', error);
      notificationService.showError('Failed to start video call. Please check your camera and microphone permissions.');
      throw error;
    }
  }

  // Start screen sharing
  async startScreenShare(targetUser, currentUser) {
    try {
      this.callType = 'screen';
      
      // Get screen capture
      this.localStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });

      // Create call record
      const callId = `call_${Date.now()}`;
      const callData = {
        id: callId,
        type: 'screen',
        caller: currentUser,
        callee: targetUser,
        status: 'calling',
        startTime: new Date().toISOString()
      };

      this.activeCalls.set(callId, callData);
      this.isCallActive = true;

      // Show notification to caller
      notificationService.showInfo(`Sharing screen with ${targetUser.name}...`, 0);

      // Simulate call notification to target user
      this.simulateIncomingCall(callData);

      this.notifyListeners('call_started', callData);
      return callId;
    } catch (error) {
      console.error('Error starting screen share:', error);
      notificationService.showError('Failed to start screen sharing. Please check your permissions.');
      throw error;
    }
  }

  // Simulate incoming call notification
  simulateIncomingCall(callData) {
    setTimeout(() => {
      const callTypeText = callData.type === 'voice' ? 'Voice Call' : 
                          callData.type === 'video' ? 'Video Call' : 'Screen Share';
      
      notificationService.showNotification(
        `Incoming ${callTypeText}`,
        `${callData.caller.displayName || callData.caller.name} is calling you`,
        {
          duration: 0, // Don't auto-dismiss
          type: 'call',
          actions: [
            {
              label: 'Accept',
              primary: true,
              onClick: () => this.acceptCall(callData.id)
            },
            {
              label: 'Decline',
              primary: false,
              onClick: () => this.declineCall(callData.id)
            }
          ]
        }
      );
    }, 1000); // Simulate network delay
  }

  // Accept a call
  acceptCall(callId) {
    const callData = this.activeCalls.get(callId);
    if (callData) {
      callData.status = 'connected';
      callData.connectTime = new Date().toISOString();
      
      notificationService.showSuccess(`${callData.type} call connected!`);
      this.notifyListeners('call_accepted', callData);
      
      // Start call timer
      this.startCallTimer(callId);
    }
  }

  // Decline a call
  declineCall(callId) {
    const callData = this.activeCalls.get(callId);
    if (callData) {
      callData.status = 'declined';
      callData.endTime = new Date().toISOString();
      
      notificationService.showInfo('Call declined');
      this.notifyListeners('call_declined', callData);
      this.endCall(callId);
    }
  }

  // End a call
  endCall(callId) {
    const callData = this.activeCalls.get(callId);
    if (callData) {
      callData.status = 'ended';
      callData.endTime = new Date().toISOString();
      
      // Calculate call duration
      if (callData.connectTime) {
        const duration = new Date(callData.endTime) - new Date(callData.connectTime);
        callData.duration = Math.floor(duration / 1000); // in seconds
      }
      
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Clean up peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      this.isCallActive = false;
      this.callType = null;
      
      notificationService.showInfo('Call ended');
      this.notifyListeners('call_ended', callData);
      
      // Save call history
      this.saveCallHistory(callData);
      this.activeCalls.delete(callId);
    }
  }

  // Start call timer
  startCallTimer(callId) {
    const callData = this.activeCalls.get(callId);
    if (!callData) return;

    const startTime = new Date(callData.connectTime);
    
    const updateTimer = () => {
      if (callData.status === 'connected') {
        const now = new Date();
        const duration = Math.floor((now - startTime) / 1000);
        callData.currentDuration = duration;
        
        this.notifyListeners('call_timer_update', { callId, duration });
        setTimeout(updateTimer, 1000);
      }
    };
    
    updateTimer();
  }

  // Save call history
  saveCallHistory(callData) {
    try {
      const history = JSON.parse(localStorage.getItem('zentro_call_history') || '[]');
      history.unshift(callData);
      
      // Keep only last 100 calls
      if (history.length > 100) {
        history.splice(100);
      }
      
      localStorage.setItem('zentro_call_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving call history:', error);
    }
  }

  // Get call history
  getCallHistory() {
    try {
      return JSON.parse(localStorage.getItem('zentro_call_history') || '[]');
    } catch (error) {
      console.error('Error loading call history:', error);
      return [];
    }
  }

  // Get active calls
  getActiveCalls() {
    return Array.from(this.activeCalls.values());
  }

  // Check if user is in a call
  isInCall() {
    return this.isCallActive;
  }

  // Get current call type
  getCurrentCallType() {
    return this.callType;
  }

  // Mute/unmute audio
  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.notifyListeners('audio_toggled', { muted: !audioTrack.enabled });
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  // Turn video on/off
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.notifyListeners('video_toggled', { videoOff: !videoTrack.enabled });
        return !videoTrack.enabled;
      }
    }
    return false;
  }
}

// Create singleton instance
const callService = new CallService();

export default callService;
