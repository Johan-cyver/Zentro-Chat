/**
 * Notification Service - Manages in-app notifications
 * Replaces browser notifications with branded custom notifications
 */

class NotificationService {
  constructor() {
    this.notificationHandler = null;
    this.isEnabled = true;
    this.soundEnabled = true;
  }

  // Initialize with notification handler from context
  initialize(notificationHandler) {
    this.notificationHandler = notificationHandler;
  }

  // Check if notifications are enabled
  isNotificationEnabled() {
    return this.isEnabled && this.notificationHandler;
  }

  // Enable/disable notifications
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('zentro_notifications_enabled', enabled.toString());
  }

  // Enable/disable notification sounds
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    localStorage.setItem('zentro_notification_sound', enabled.toString());
  }

  // Play notification sound
  playNotificationSound(type = 'default') {
    if (!this.soundEnabled) return;

    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Different sounds for different notification types
      const frequencies = {
        message: [800, 600],
        friend_request: [600, 800, 1000],
        achievement: [400, 600, 800, 1000],
        default: [800, 600]
      };

      const freq = frequencies[type] || frequencies.default;
      
      freq.forEach((frequency, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }, index * 100);
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }

  // Show friend request notification
  showFriendRequest(fromUser, onAccept, onDecline) {
    if (!this.isNotificationEnabled()) return;

    this.playNotificationSound('friend_request');
    
    return this.notificationHandler.addNotification({
      type: 'friend_request',
      title: 'ZentroChat',
      message: `${fromUser.displayName || fromUser.name} sent you a friend request`,
      color: '#3B82F6',
      duration: 0, // Don't auto-dismiss
      actions: [
        {
          label: 'Accept',
          primary: true,
          onClick: onAccept,
        },
        {
          label: 'Decline',
          primary: false,
          onClick: onDecline,
        },
      ],
    });
  }

  // Show new message notification
  showNewMessage(fromUser, message, onClick) {
    if (!this.isNotificationEnabled()) return;

    this.playNotificationSound('message');
    
    return this.notificationHandler.addNotification({
      type: 'message',
      title: 'ZentroChat',
      message: `${fromUser.displayName || fromUser.name}: ${
        message.length > 50 ? message.substring(0, 50) + '...' : message
      }`,
      color: '#10B981',
      duration: 4000,
      actions: onClick ? [
        {
          label: 'View',
          primary: true,
          onClick: onClick,
        },
      ] : undefined,
    });
  }

  // Show achievement notification
  showAchievement(achievement) {
    if (!this.isNotificationEnabled()) return;

    this.playNotificationSound('achievement');
    
    return this.notificationHandler.addNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.title,
      color: '#F59E0B',
      duration: 6000,
    });
  }

  // Show bot response notification
  showBotResponse(message, onClick) {
    if (!this.isNotificationEnabled()) return;

    return this.notificationHandler.addNotification({
      type: 'bot',
      title: 'Zentro Bot',
      message: message.length > 50 ? message.substring(0, 50) + '...' : message,
      color: '#8B5CF6',
      duration: 3000,
      actions: onClick ? [
        {
          label: 'View',
          primary: true,
          onClick: onClick,
        },
      ] : undefined,
    });
  }

  // Show general notification
  showNotification(title, message, options = {}) {
    if (!this.isNotificationEnabled()) return;

    if (options.playSound !== false) {
      this.playNotificationSound(options.type || 'default');
    }
    
    return this.notificationHandler.addNotification({
      title: title || 'ZentroChat',
      message,
      color: options.color || '#8B5CF6',
      duration: options.duration || 4000,
      type: options.type || 'default',
      actions: options.actions,
    });
  }

  // Show success notification
  showSuccess(message, duration = 3000) {
    return this.showNotification('Success', message, {
      color: '#10B981',
      duration,
      type: 'success',
    });
  }

  // Show error notification
  showError(message, duration = 5000) {
    return this.showNotification('Error', message, {
      color: '#EF4444',
      duration,
      type: 'error',
    });
  }

  // Show warning notification
  showWarning(message, duration = 4000) {
    return this.showNotification('Warning', message, {
      color: '#F59E0B',
      duration,
      type: 'warning',
    });
  }

  // Show info notification
  showInfo(message, duration = 4000) {
    return this.showNotification('Info', message, {
      color: '#3B82F6',
      duration,
      type: 'info',
    });
  }

  // Request browser notification permission (fallback)
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Show browser notification as fallback
  showBrowserNotification(title, message, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'zentro-chat',
        ...options,
      });
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService();

// Initialize from localStorage
const savedEnabled = localStorage.getItem('zentro_notifications_enabled');
const savedSound = localStorage.getItem('zentro_notification_sound');

if (savedEnabled !== null) {
  notificationService.setEnabled(savedEnabled === 'true');
}

if (savedSound !== null) {
  notificationService.setSoundEnabled(savedSound === 'true');
}

export default notificationService;
