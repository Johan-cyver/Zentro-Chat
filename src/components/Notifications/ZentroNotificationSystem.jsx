import React, { useState, useEffect, createContext, useContext } from 'react';
import { FaCoins, FaTrophy, FaRocket, FaGift, FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useUser } from '../../contexts/UserContext';

// Notification Context
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Notification Provider Component
export const ZentroNotificationProvider = ({ children }) => {
  const { userProfile } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [persistentNotifications, setPersistentNotifications] = useState([]);

  // Load persistent notifications from Firebase
  useEffect(() => {
    if (userProfile?.uid) {
      loadPersistentNotifications();
    }
  }, [userProfile?.uid]);

  const loadPersistentNotifications = async () => {
    try {
      const notifRef = doc(db, 'userNotifications', userProfile.uid);
      const notifDoc = await getDoc(notifRef);
      
      if (notifDoc.exists()) {
        const data = notifDoc.data();
        setPersistentNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const savePersistentNotification = async (notification) => {
    if (!userProfile?.uid) return;

    try {
      const notifRef = doc(db, 'userNotifications', userProfile.uid);
      const persistentNotif = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: serverTimestamp(),
        read: false
      };

      await setDoc(notifRef, {
        notifications: arrayUnion(persistentNotif)
      }, { merge: true });

      setPersistentNotifications(prev => [persistentNotif, ...prev]);
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const showNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);

    // Save to persistent storage if specified
    if (notification.persistent !== false) {
      savePersistentNotification(newNotification);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAsRead = async (notificationId) => {
    try {
      setPersistentNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );

      // Update in Firebase
      const notifRef = doc(db, 'userNotifications', userProfile.uid);
      const notifDoc = await getDoc(notifRef);
      
      if (notifDoc.exists()) {
        const data = notifDoc.data();
        const updatedNotifications = data.notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        );
        
        await updateDoc(notifRef, { notifications: updatedNotifications });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Predefined notification types
  const showSuccess = (message, options = {}) => {
    showNotification({
      type: 'success',
      title: options.title || 'Success!',
      message,
      icon: FaCheck,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    showNotification({
      type: 'error',
      title: options.title || 'Error',
      message,
      icon: FaExclamationTriangle,
      duration: 7000,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    showNotification({
      type: 'info',
      title: options.title || 'Info',
      message,
      icon: FaInfo,
      ...options
    });
  };

  const showZennyReward = (amount, activity, options = {}) => {
    showNotification({
      type: 'zenny',
      title: '💰 Zenny Coins Earned!',
      message: `You earned ${amount} Zenny coins for ${activity}`,
      icon: FaCoins,
      amount,
      activity,
      ...options
    });
  };

  const showAuctionWin = (position, amount, options = {}) => {
    showNotification({
      type: 'auction',
      title: '🏆 Auction Won!',
      message: `Congratulations! You won spotlight position #${position} with a bid of ${amount} Zenny coins`,
      icon: FaTrophy,
      duration: 10000,
      ...options
    });
  };

  const showBoostApplied = (level, appName, options = {}) => {
    showNotification({
      type: 'boost',
      title: '🚀 Boost Applied!',
      message: `${level} boost has been applied to ${appName}`,
      icon: FaRocket,
      ...options
    });
  };

  const value = {
    notifications,
    persistentNotifications,
    showNotification,
    removeNotification,
    markAsRead,
    showSuccess,
    showError,
    showInfo,
    showZennyReward,
    showAuctionWin,
    showBoostApplied
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      case 'zenny':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400';
      case 'auction':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500';
      case 'boost':
        return 'bg-gradient-to-r from-green-600 to-teal-600 border-green-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => {
          const IconComponent = notification.icon || FaInfo;
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              className={`${getNotificationStyles(notification.type)} text-white p-4 rounded-lg shadow-2xl border backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <IconComponent className="text-xl mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{notification.title}</h4>
                    <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                    {notification.type === 'zenny' && notification.amount && (
                      <div className="mt-2 text-xs opacity-75">
                        Balance updated • {new Date().toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-white/70 hover:text-white transition-colors ml-2"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ZentroNotificationProvider;
