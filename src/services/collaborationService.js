// Collaboration Service - Real-time collaboration features
// This simulates Firebase real-time functionality using localStorage and events

class CollaborationService {
  constructor() {
    this.listeners = new Map();
    this.collaborationRequests = this.getCollaborationRequests();
    this.collaborationInterests = this.getCollaborationInterests();
    
    // Listen for storage changes to simulate real-time updates
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  // Get all collaboration requests
  getCollaborationRequests() {
    try {
      return JSON.parse(localStorage.getItem('zentro_collaboration_requests') || '[]');
    } catch (error) {
      console.error('Error loading collaboration requests:', error);
      return [];
    }
  }

  // Save collaboration requests
  saveCollaborationRequests(requests) {
    try {
      localStorage.setItem('zentro_collaboration_requests', JSON.stringify(requests));
      this.collaborationRequests = requests;
      this.notifyListeners('requests', requests);
    } catch (error) {
      console.error('Error saving collaboration requests:', error);
    }
  }

  // Get collaboration interests/preferences
  getCollaborationInterests() {
    try {
      return JSON.parse(localStorage.getItem('zentro_collaboration_interests') || '{}');
    } catch (error) {
      console.error('Error loading collaboration interests:', error);
      return {};
    }
  }

  // Save collaboration interests
  saveCollaborationInterests(interests) {
    try {
      localStorage.setItem('zentro_collaboration_interests', JSON.stringify(interests));
      this.collaborationInterests = interests;
      this.notifyListeners('interests', interests);
    } catch (error) {
      console.error('Error saving collaboration interests:', error);
    }
  }

  // Send collaboration request
  async sendCollaborationRequest(fromUserId, toUserId, type, message, skills = []) {
    try {
      const request = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        fromUserId,
        toUserId,
        type, // 'project', 'mentor', 'network', 'skill-exchange'
        message,
        skills,
        status: 'pending',
        timestamp: new Date().toISOString(),
        responses: []
      };

      const requests = this.getCollaborationRequests();
      
      // Check for duplicate requests
      const existingRequest = requests.find(req => 
        req.fromUserId === fromUserId && 
        req.toUserId === toUserId && 
        req.type === type &&
        req.status === 'pending'
      );

      if (existingRequest) {
        throw new Error('Duplicate request already exists');
      }

      requests.push(request);
      this.saveCollaborationRequests(requests);

      // Simulate real-time notification
      this.simulateRealTimeNotification(toUserId, 'collaboration_request', request);

      return { success: true, request };
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      return { success: false, error: error.message };
    }
  }

  // Respond to collaboration request
  async respondToRequest(requestId, response, message = '') {
    try {
      const requests = this.getCollaborationRequests();
      const requestIndex = requests.findIndex(req => req.id === requestId);
      
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }

      const request = requests[requestIndex];
      request.status = response; // 'accepted', 'declined', 'pending'
      request.responseMessage = message;
      request.responseTimestamp = new Date().toISOString();

      requests[requestIndex] = request;
      this.saveCollaborationRequests(requests);

      // Notify the original sender
      this.simulateRealTimeNotification(request.fromUserId, 'collaboration_response', {
        ...request,
        response,
        responseMessage: message
      });

      return { success: true, request };
    } catch (error) {
      console.error('Error responding to collaboration request:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user's collaboration interests
  async updateCollaborationInterests(userId, interests) {
    try {
      const allInterests = this.getCollaborationInterests();
      allInterests[userId] = {
        ...interests,
        lastUpdated: new Date().toISOString()
      };

      this.saveCollaborationInterests(allInterests);
      return { success: true, interests: allInterests[userId] };
    } catch (error) {
      console.error('Error updating collaboration interests:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's collaboration interests
  getUserInterests(userId) {
    const interests = this.getCollaborationInterests();
    return interests[userId] || {
      openToProjects: false,
      openToMentoring: false,
      openToBeingMentored: false,
      openToNetworking: false,
      preferredCollaborationTypes: [],
      skillsToOffer: [],
      skillsToLearn: [],
      availability: 'not-set'
    };
  }

  // Get requests for a user
  getRequestsForUser(userId) {
    const requests = this.getCollaborationRequests();
    return {
      received: requests.filter(req => req.toUserId === userId),
      sent: requests.filter(req => req.fromUserId === userId)
    };
  }

  // Find potential collaborators based on interests and skills
  findPotentialCollaborators(userId, userSkills = [], userInterests = {}) {
    const allInterests = this.getCollaborationInterests();
    const potentialCollaborators = [];

    Object.entries(allInterests).forEach(([otherUserId, interests]) => {
      if (otherUserId === userId) return;

      const compatibility = this.calculateCompatibility(userSkills, userInterests, interests);
      if (compatibility.score > 0.3) { // 30% compatibility threshold
        potentialCollaborators.push({
          userId: otherUserId,
          interests,
          compatibility
        });
      }
    });

    return potentialCollaborators.sort((a, b) => b.compatibility.score - a.compatibility.score);
  }

  // Calculate collaboration compatibility
  calculateCompatibility(userSkills, userInterests, otherInterests) {
    let score = 0;
    const reasons = [];

    // Check skill complementarity
    const skillOverlap = userSkills.filter(skill => 
      otherInterests.skillsToLearn?.includes(skill)
    ).length;
    
    const skillNeed = userSkills.filter(skill => 
      otherInterests.skillsToOffer?.includes(skill)
    ).length;

    if (skillOverlap > 0) {
      score += 0.3;
      reasons.push(`Can teach ${skillOverlap} skills they want to learn`);
    }

    if (skillNeed > 0) {
      score += 0.3;
      reasons.push(`Can learn ${skillNeed} skills from them`);
    }

    // Check collaboration type compatibility
    if (userInterests.openToProjects && otherInterests.openToProjects) {
      score += 0.2;
      reasons.push('Both open to project collaboration');
    }

    if (userInterests.openToMentoring && otherInterests.openToBeingMentored) {
      score += 0.2;
      reasons.push('Mentoring opportunity available');
    }

    if (userInterests.openToBeingMentored && otherInterests.openToMentoring) {
      score += 0.2;
      reasons.push('Learning opportunity available');
    }

    return { score: Math.min(1, score), reasons };
  }

  // Simulate real-time notifications
  simulateRealTimeNotification(userId, type, data) {
    // In a real Firebase implementation, this would be a push notification
    const notification = {
      id: Date.now().toString(),
      userId,
      type,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store notification
    const notifications = JSON.parse(localStorage.getItem('zentro_collaboration_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('zentro_collaboration_notifications', JSON.stringify(notifications));

    // Trigger custom event for real-time updates
    window.dispatchEvent(new CustomEvent('zentro_collaboration_update', {
      detail: { type, userId, data }
    }));
  }

  // Listen for real-time updates
  onCollaborationUpdate(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener('zentro_collaboration_update', handler);
    return () => window.removeEventListener('zentro_collaboration_update', handler);
  }

  // Handle storage changes for cross-tab synchronization
  handleStorageChange(event) {
    if (event.key === 'zentro_collaboration_requests') {
      this.collaborationRequests = JSON.parse(event.newValue || '[]');
      this.notifyListeners('requests', this.collaborationRequests);
    } else if (event.key === 'zentro_collaboration_interests') {
      this.collaborationInterests = JSON.parse(event.newValue || '{}');
      this.notifyListeners('interests', this.collaborationInterests);
    }
  }

  // Add listener for data changes
  addListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  // Remove listener
  removeListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  // Notify all listeners
  notifyListeners(type, data) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in collaboration listener:', error);
        }
      });
    }
  }

  // Get collaboration statistics
  getCollaborationStats(userId) {
    const requests = this.getCollaborationRequests();
    const userRequests = requests.filter(req => 
      req.fromUserId === userId || req.toUserId === userId
    );

    return {
      totalRequests: userRequests.length,
      sentRequests: requests.filter(req => req.fromUserId === userId).length,
      receivedRequests: requests.filter(req => req.toUserId === userId).length,
      acceptedRequests: userRequests.filter(req => req.status === 'accepted').length,
      pendingRequests: userRequests.filter(req => req.status === 'pending').length,
      collaborationScore: this.calculateCollaborationScore(userId)
    };
  }

  // Calculate collaboration score
  calculateCollaborationScore(userId) {
    const stats = this.getCollaborationStats(userId);
    const interests = this.getUserInterests(userId);
    
    let score = 0;
    score += stats.acceptedRequests * 10; // 10 points per accepted collaboration
    score += stats.sentRequests * 2; // 2 points per sent request (networking effort)
    score += Object.values(interests).filter(Boolean).length * 5; // 5 points per interest set

    return Math.min(100, score);
  }
}

// Create and export singleton instance
const collaborationService = new CollaborationService();
export default collaborationService;
