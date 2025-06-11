import React, { createContext, useState, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { calculateAge, isProfessionalEligible, getCurrentUserAge, isCurrentUserProfessionalEligible } from '../utils/ageUtils';
import friendsService from '../services/friendsService';
import firebaseChatService from '../services/firebaseChat';
import professionalService from '../services/professionalService';
import userDataSync from '../utils/userDataSync';
import adminService from '../services/adminService';
import zentroIdService from '../services/zentroIdService';

// Create the user context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Utility function to get age (now directly from user profile)
const getUserAge = (userProfile) => {
  return userProfile?.age || null;
};

// User provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // User profile data (additional to Firebase auth data)
  const [userProfile, setUserProfile] = useState({
    uid: '', // Add uid to initial state
    displayName: '',
    email: '',
    photoURL: '',
    bannerURL: '',
    bio: '',
    birthDate: '',
    age: null,
    location: '',
    relationshipStatus: '',
    music: '',
    // Personal view enhancements
    mood: '',
    favorites: {
      books: [],
      shows: [],
      music: [],
      anime: []
    },
    interests: [],
    professional: {
      role: '',
      industry: '',
      skills: [],
      bio: '',
      jobSkills: '',
      activities: '',
      links: {
        resume: '',
        github: '',
        portfolio: '',
        linkedin: ''
      },
      // Professional view enhancements (21+ only)
      tagline: '',
      experience: [],
      education: [],
      certifications: [],
      portfolio: [],
      endorsements: {},
      recommendations: [],
      availability: {
        openToWork: false,
        freelance: false,
        networking: true,
        calendar: null
      },
      analytics: {
        profileViews: 0,
        connectionRequests: 0,
        endorsementCount: 0
      }
    },
    visibility: 'public',
    // Friends system
    friends: [],
    friendRequests: [],
    notifications: [],
    // Zenny Coin System
    zennyCoins: {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastEarned: null,
      transactions: [],
      dailyEarningLimit: 50,
      dailyEarned: 0,
      lastDailyReset: null
    },
    // Spotlight & Boost System
    spotlight: {
      currentBoosts: [],
      auctionHistory: [],
      totalSpotlightWins: 0,
      currentSpotlightPosition: null,
      boostLevel: 'none' // none, bronze, silver, gold, platinum, diamond
    }
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Check if user is banned or kicked
        try {
          const banStatus = await adminService.isUserBanned(user.uid);
          const emailBanned = await adminService.isEmailBanned(user.email);

          if (banStatus.banned) {
            alert(`You are temporarily banned from Zentro Chat.\nReason: ${banStatus.reason}\nBan expires: ${new Date(banStatus.endTime).toLocaleString()}`);
            await auth.signOut();
            return;
          }

          if (emailBanned) {
            alert('This email address has been permanently banned from Zentro Chat.');
            await auth.signOut();
            return;
          }
        } catch (error) {
          console.error('Error checking ban status:', error);
        }

        // Update user profile with Firebase auth data and localStorage data
        const storedBirthDate = localStorage.getItem('zentro_user_birthDate');
        const storedAge = localStorage.getItem('zentro_user_age');
        const updatedProfile = {
          uid: user.uid, // Add the user ID
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          birthDate: storedBirthDate || '',
          age: storedBirthDate ? calculateAge(storedBirthDate) : (storedAge ? parseInt(storedAge) : null)
        };

        setUserProfile(prev => ({
          ...prev,
          ...updatedProfile
        }));

        // Register user in friends service for searchability
        try {
          friendsService.registerUser(updatedProfile);

          // Use the sync utility to ensure user is available in all storage locations
          userDataSync.syncUser(updatedProfile);

          // Run migration to ensure all existing users are synced
          userDataSync.migrateUsers();
        } catch (error) {
          console.error('Error registering user:', error);
        }

        // Sync user profile to Firebase for real-time messaging
        try {
          await firebaseChatService.syncUserProfile(updatedProfile);
        } catch (error) {
          console.error('Error syncing user to Firebase:', error);
        }

        // Initialize or get Zentro ID
        try {
          let zentroId = await zentroIdService.getZentroId(user.uid);
          if (!zentroId) {
            zentroId = await zentroIdService.initializeZentroId(user.uid, updatedProfile);
            console.log('✅ Zentro ID initialized for new user');
          }
        } catch (error) {
          console.error('❌ Error initializing Zentro ID:', error);
        }

        // Here you would typically fetch additional user data from your database
        // For now, we'll use minimal mock data if none exists (no birthday to test age restrictions)
        if (!userProfile.bio) {
          setUserProfile(prev => ({
            ...prev,
            bio: "Hi there! I'm using Zentro Chat.",
            // birthday: "", // Leave empty so users must set their birthday to access professional features
            location: "Earth",
            relationshipStatus: "Single",
            music: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
            professional: {
              ...prev.professional,
              role: "Developer",
              industry: "Technology",
              skills: ["JavaScript", "React", "Node.js"],
              bio: "Passionate developer with experience in web technologies.",
              links: {
                resume: "#",
                github: "https://github.com/",
                portfolio: "#",
                linkedin: "https://linkedin.com/in/"
              }
            }
          }));
        }
      } else {
        // User logged out, reset profile
        setUserProfile({
          uid: '',
          displayName: '',
          email: '',
          photoURL: '',
          bannerURL: '',
          bio: '',
          birthDate: '',
          age: null,
          location: '',
          relationshipStatus: '',
          music: '',
          // Personal view enhancements
          mood: '',
          favorites: {
            books: [],
            shows: [],
            music: [],
            anime: []
          },
          interests: [],
          professional: {
            role: '',
            industry: '',
            skills: [],
            bio: '',
            jobSkills: '',
            activities: '',
            links: {
              resume: '',
              github: '',
              portfolio: '',
              linkedin: ''
            },
            // Professional view enhancements (21+ only)
            tagline: '',
            experience: [],
            education: [],
            certifications: [],
            portfolio: [],
            endorsements: {},
            recommendations: [],
            availability: {
              openToWork: false,
              freelance: false,
              networking: true,
              calendar: null
            },
            analytics: {
              profileViews: 0,
              connectionRequests: 0,
              endorsementCount: 0
            }
          },
          visibility: 'public'
        });
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update user profile
  const updateProfile = async (newData) => {
    if (!currentUser) {
      console.error('[UserContext] No current user found');
      return;
    }

    const updatedProfileData = {
      ...userProfile,
      ...newData,
      uid: currentUser.uid
    };

    // Handle birthDate and age synchronization
    if (newData.birthDate !== undefined) {
      if (newData.birthDate) {
        updatedProfileData.age = calculateAge(newData.birthDate);
      } else {
        updatedProfileData.age = null;
        localStorage.removeItem('zentro_user_birthDate');
        localStorage.removeItem('zentro_user_age');
        console.log('[UserContext] BirthDate cleared.');
      }
    } else if (userProfile.birthDate && !updatedProfileData.birthDate) {
      console.warn('[UserContext] birthDate was present in userProfile but missing in updatedProfileData without explicit clear. Clearing age.');
      updatedProfileData.age = null;
      localStorage.removeItem('zentro_user_birthDate');
      localStorage.removeItem('zentro_user_age');
    }

    console.log('[UserContext] Attempting to save updatedProfileData:', updatedProfileData);
    setUserProfile(updatedProfileData); // Update context state immediately

    try {
      // Start all sync operations in parallel
      const syncOperations = [];

      // 1. Sync to userDataSync (handles localStorage)
      syncOperations.push(userDataSync.syncUser(updatedProfileData));

      // 2. Sync to Firebase Chat
      syncOperations.push(firebaseChatService.syncUserProfile(updatedProfileData));

      // 3. Sync to Friends Service
      syncOperations.push(friendsService.registerUser(updatedProfileData));

      // 4. If professional data exists, sync to professional service
      if (updatedProfileData.professional) {
        const professionalData = {
          userId: updatedProfileData.uid,
          name: updatedProfileData.displayName,
          email: updatedProfileData.email,
          avatar: updatedProfileData.photoURL,
          title: updatedProfileData.professional?.role,
          bio: updatedProfileData.professional?.bio,
          skills: updatedProfileData.professional?.skills || [],
          industry: updatedProfileData.professional?.industry,
          location: updatedProfileData.location,
          visibility: updatedProfileData.visibility,
          links: updatedProfileData.professional?.links,
          experience: updatedProfileData.professional?.experience,
          education: updatedProfileData.professional?.education,
          certifications: updatedProfileData.professional?.certifications
        };
        syncOperations.push(professionalService.saveProfessional(professionalData));
      }

      // Wait for all sync operations to complete
      await Promise.all(syncOperations);
      
      // Log successful sync
      console.log('[UserContext] Profile data synced successfully to all services');
      
      // Update sync timestamp
      localStorage.setItem(`zentro_last_sync_${currentUser.uid}`, Date.now().toString());
      
      // Store birthDate and age in localStorage for persistence
      if (updatedProfileData.birthDate) {
        localStorage.setItem('zentro_user_birthDate', updatedProfileData.birthDate);
        if (updatedProfileData.age) {
          localStorage.setItem('zentro_user_age', String(updatedProfileData.age));
        }
      }

      return true; // Indicate successful update
    } catch (error) {
      console.error("[UserContext] Error saving/syncing profile:", error);
      return false; // Indicate failed update
    }
  };

  // Update professional profile
  const updateProfessionalProfile = async (newData) => {
    const updatedProfile = {
      ...userProfile,
      professional: {
        ...userProfile.professional,
        ...newData
      }
    };

    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        ...newData
      }
    }));

    // Sync to Firebase, friends service, and professional service
    try {
      await firebaseChatService.syncUserProfile(updatedProfile);
      friendsService.registerUser(updatedProfile);

      // Save to professional service for directory visibility
      const professionalData = {
        userId: updatedProfile.uid,
        name: updatedProfile.displayName,
        email: updatedProfile.email,
        avatar: updatedProfile.photoURL,
        title: updatedProfile.professional.role,
        bio: updatedProfile.professional.bio,
        skills: updatedProfile.professional.skills || [],
        industry: updatedProfile.professional.industry,
        location: updatedProfile.location,
        visibility: updatedProfile.visibility,
        links: updatedProfile.professional.links,
        experience: updatedProfile.professional.experience,
        education: updatedProfile.professional.education,
        certifications: updatedProfile.professional.certifications
      };

      professionalService.saveProfessional(professionalData);
    } catch (error) {
      console.error('Error updating professional profile:', error);
    }
  };

  // Update visibility setting
  const updateVisibility = async (newVisibility) => {
    const updatedProfile = {
      ...userProfile,
      visibility: newVisibility
    };

    setUserProfile(prev => ({
      ...prev,
      visibility: newVisibility
    }));

    // Sync to Firebase, friends service, and professional service
    try {
      await firebaseChatService.syncUserProfile(updatedProfile);
      friendsService.registerUser(updatedProfile);

      // Update visibility in professional service
      const professionalData = {
        userId: updatedProfile.uid,
        name: updatedProfile.displayName,
        email: updatedProfile.email,
        avatar: updatedProfile.photoURL,
        title: updatedProfile.professional.role,
        bio: updatedProfile.professional.bio,
        skills: updatedProfile.professional.skills || [],
        industry: updatedProfile.professional.industry,
        location: updatedProfile.location,
        visibility: newVisibility,
        links: updatedProfile.professional.links,
        experience: updatedProfile.professional.experience,
        education: updatedProfile.professional.education,
        certifications: updatedProfile.professional.certifications
      };

      professionalService.saveProfessional(professionalData);
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  // Add a post (photo, video, or blog)
  const addPost = (post) => {
    // Here you would typically add the post to your database
    // For now, we'll just log it
    console.log('Adding post:', post);
  };

  // Age-related helper functions
  const getUserAgeFromProfile = () => {
    return userProfile.birthDate ? calculateAge(userProfile.birthDate) : userProfile.age;
  };

  const canAccessProfessionalView = () => {
    return userProfile.birthDate ? isProfessionalEligible(userProfile.birthDate) : false;
  };

  const isUnder21 = () => {
    const age = getUserAgeFromProfile();
    return age !== null && age < 21;
  };

  // Admin-related helper functions
  const isAdmin = () => {
    return currentUser?.uid === '2bDEJ7WRxuXxxco56let1xDl2Ks1';
  };

  const canAccessDataManager = () => {
    return isAdmin();
  };

  const canAccessAdminPanel = () => {
    return isAdmin();
  };

  // Update favorites
  const updateFavorites = (category, newFavorites) => {
    setUserProfile(prev => ({
      ...prev,
      favorites: {
        ...prev.favorites,
        [category]: newFavorites
      }
    }));
  };

  // Update interests
  const updateInterests = (newInterests) => {
    setUserProfile(prev => ({
      ...prev,
      interests: newInterests
    }));
  };

  // Update mood
  const updateMood = (newMood) => {
    setUserProfile(prev => ({
      ...prev,
      mood: newMood
    }));
  };

  // Professional enhancement functions
  const updateExperience = (newExperience) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        experience: newExperience
      }
    }));
  };

  const updateEducation = (newEducation) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        education: newEducation
      }
    }));
  };

  const updateCertifications = (newCertifications) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        certifications: newCertifications
      }
    }));
  };

  const updatePortfolio = (newPortfolio) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        portfolio: newPortfolio
      }
    }));
  };

  const updateAvailability = (newAvailability) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        availability: {
          ...(prev.professional?.availability || {}),
          ...newAvailability
        }
      }
    }));
  };

  const addEndorsement = (skill, endorser) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        endorsements: {
          ...(prev.professional?.endorsements || {}),
          [skill]: [...((prev.professional?.endorsements?.[skill]) || []), endorser]
        }
      }
    }));
  };

  const updateAnalytics = (analyticsUpdate) => {
    setUserProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        analytics: {
          ...(prev.professional?.analytics || {}),
          ...analyticsUpdate
        }
      }
    }));
  };

  // Friends system functions
  const updateFriends = (friends) => {
    setUserProfile(prev => ({
      ...prev,
      friends
    }));
  };

  const updateFriendRequests = (friendRequests) => {
    setUserProfile(prev => ({
      ...prev,
      friendRequests
    }));
  };

  const updateNotifications = (notifications) => {
    setUserProfile(prev => ({
      ...prev,
      notifications
    }));
  };

  // Value to be provided to consumers
  const value = {
    currentUser,
    userProfile,
    loading,
    updateProfile,
    updateProfessionalProfile,
    updateVisibility,
    addPost,
    // Age-related functions
    getUserAge: getUserAgeFromProfile,
    canAccessProfessionalView,
    isUnder21,
    // Admin functions
    isAdmin,
    canAccessDataManager,
    canAccessAdminPanel,
    // Personal view functions
    updateFavorites,
    updateInterests,
    updateMood,
    // Professional view functions
    updateExperience,
    updateEducation,
    updateCertifications,
    updatePortfolio,
    updateAvailability,
    addEndorsement,
    updateAnalytics,
    // Friends system functions
    updateFriends,
    updateFriendRequests,
    updateNotifications
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export default UserContext;
