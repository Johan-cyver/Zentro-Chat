/**
 * Professional Service - Manages professional profiles and directory
 */
import { db } from '../firebase'; // Assuming db is exported from a firebase.js or firebaseConfig.js at src/firebase
import { doc, getDoc, limit as firestoreLimit } from 'firebase/firestore'; // Aliased limit to avoid conflict if any
import { 
  collection, 
  setDoc, 
  addDoc, // For creating new documents with auto-generated IDs
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  writeBatch
  // limit is now imported above and aliased if needed, or directly used if no conflict
} from 'firebase/firestore';

// Helper function to convert Firestore timestamps to ISO strings if they exist
const convertTimestamps = (data) => {
  const a = { ...data };
  // Check if createdAt is a Firestore Timestamp object (has a toDate method)
  if (a.createdAt && typeof a.createdAt.toDate === 'function') {
    a.createdAt = a.createdAt.toDate().toISOString();
  }
  // Check if updatedAt is a Firestore Timestamp object
  if (a.updatedAt && typeof a.updatedAt.toDate === 'function') {
    a.updatedAt = a.updatedAt.toDate().toISOString();
  }
  return a;
};

class ProfessionalService {
  constructor() {
    this.storageKey = 'zentro_professionals';
    this.appsStorageKey = 'zentro_apps';
    this.appsCollection = collection(db, 'apps');
    this.professionalsCollection = collection(db, 'professionals'); // Assuming this might also be refactored later
    console.log('[ProfessionalService-Firestore] Initialized');
    // No need to load from localStorage anymore
  }

  // Get all professionals
  getAllProfessionals() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading professionals:', error);
      return [];
    }
  }

  // Get professional by user ID
  getProfessionalByUserId(userId) {
    const professionals = this.getAllProfessionals();
    return professionals.find(prof => prof.userId === userId);
  }

  // Create or update professional profile
  saveProfessional(professionalData) {
    try {
      const professionals = this.getAllProfessionals();
      const existingIndex = professionals.findIndex(prof => prof.userId === professionalData.userId);

      const professional = {
        id: professionalData.id || Date.now().toString(),
        ...professionalData,
        endorsements: professionalData.endorsements || [],
        updatedAt: new Date().toISOString(),
        createdAt: professionalData.createdAt || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        professionals[existingIndex] = professional;
      } else {
        professionals.push(professional);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(professionals));
      return professional;
    } catch (error) {
      console.error('Error saving professional:', error);
      throw error;
    }
  }

  // Delete professional profile
  deleteProfessional(userId) {
    try {
      const professionals = this.getAllProfessionals();
      const filtered = professionals.filter(prof => prof.userId !== userId);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting professional:', error);
      return false;
    }
  }

  // Search professionals
  searchProfessionals(query, filters = {}) {
    const professionals = this.getAllProfessionals();
    let filtered = [...professionals];

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(prof =>
        prof.name?.toLowerCase().includes(searchTerm) ||
        prof.title?.toLowerCase().includes(searchTerm) ||
        prof.bio?.toLowerCase().includes(searchTerm) ||
        prof.skills?.some(skill => skill.toLowerCase().includes(searchTerm)) ||
        prof.location?.toLowerCase().includes(searchTerm)
      );
    }

    // Visibility filter
    if (filters.visibility && filters.visibility !== 'all') {
      filtered = filtered.filter(prof => prof.visibility === filters.visibility);
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(prof =>
        prof.skills?.some(skill =>
          filters.skills.some(filterSkill =>
            skill.toLowerCase().includes(filterSkill.toLowerCase())
          )
        )
      );
    }

    // Experience filter
    if (filters.minExperience) {
      filtered = filtered.filter(prof =>
        prof.experience && prof.experience >= filters.minExperience
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(prof =>
        prof.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    return filtered;
  }

  // Get professionals by visibility
  getProfessionalsByVisibility(visibility, currentUserId = null) {
    const professionals = this.getAllProfessionals();

    switch (visibility) {
      case 'public':
        return professionals.filter(prof => prof.visibility === 'public');

      case 'friends':
        if (!currentUserId) return [];
        const friends = this.getFriends(currentUserId);
        return professionals.filter(prof =>
          prof.visibility === 'friends' &&
          friends.some(friend => friend.id === prof.userId)
        );

      case 'recruiters':
        return professionals.filter(prof => prof.visibility === 'recruiters');

      default:
        return professionals;
    }
  }

  // Get user's friends (helper method)
  getFriends(userId) {
    try {
      const friends = localStorage.getItem('zentro_friends');
      return friends ? JSON.parse(friends) : [];
    } catch (error) {
      console.error('Error loading friends:', error);
      return [];
    }
  }

  // App management methods
  async getAllApps() {
    try {
      const q = query(this.appsCollection, orderBy('createdAt', 'desc')); 
      const querySnapshot = await getDocs(q);
      const apps = [];
      querySnapshot.forEach((doc) => {
        // Use the robust convertTimestamps for data read from Firestore
        apps.push(convertTimestamps({ ...doc.data(), id: doc.id }));
      });
      console.log(`[ProfessionalService-Firestore] Fetched ${apps.length} apps.`);
      return apps;
    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error fetching all apps:', error);
      throw error;
    }
  }

  // Get apps by user ID - THIS NEEDS TO BE ASYNC and use Firestore
  async getAppsByUserId(userId) {
    // const apps = await this.getAllApps(); // Less efficient
    // return apps.filter(app => app.developerId === userId || app.userId === userId); 
    // developerId might be old, userId is current standard
    if (!userId) return [];
    try {
        const q = query(this.appsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userApps = [];
        querySnapshot.forEach((doc) => {
            // Use the robust convertTimestamps for data read from Firestore
            userApps.push(convertTimestamps({ ...doc.data(), id: doc.id }));
        });
        console.log(`[ProfessionalService-Firestore] Fetched ${userApps.length} apps for user ${userId}.`);
        return userApps;
    } catch (error) {
        console.error(`[ProfessionalService-Firestore] Error fetching apps for user ${userId}:`, error);
        throw error;
    }
  }

  // Save app
  async saveApp(appData, userId) {
    if (!userId) {
      console.error('[ProfessionalService-Firestore] saveApp: userId is required to save an app.');
      throw new Error('User ID is required to save an app.');
    }
    if (!appData) {
        console.error('[ProfessionalService-Firestore] saveApp: appData is required.');
        throw new Error('App data is required.');
    }

    try {
      const baseDataForFirestore = { ...appData }; // Start with a copy of input appData
      baseDataForFirestore.userId = userId;       // Always set/update userId
      delete baseDataForFirestore.id; // ID is handled by doc path or auto-generation
      
      let clientReadyApp = {}; 
      let docIdToReturn = appData.id; // For existing apps

      if (appData.id) { // Existing app, update it
        const appDocRef = doc(this.appsCollection, appData.id);
        const existingAppSnap = await getDoc(appDocRef);

        const firestoreWriteData = { ...baseDataForFirestore }; 
        firestoreWriteData.updatedAt = serverTimestamp();
        firestoreWriteData.createdAt = (existingAppSnap.exists() && existingAppSnap.data().createdAt && typeof existingAppSnap.data().createdAt.toDate === 'function')
            ? existingAppSnap.data().createdAt 
            : serverTimestamp(); 

        await setDoc(appDocRef, firestoreWriteData, { merge: true });
        console.log('[ProfessionalService-Firestore] App updated:', appData.id);

        clientReadyApp = {
          ...appData, // Use original appData as base for client return
          id: appData.id,
          userId: userId,
          createdAt: (firestoreWriteData.createdAt && typeof firestoreWriteData.createdAt.toDate === 'function')
                       ? firestoreWriteData.createdAt.toDate().toISOString() 
                       : new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        };

      } else { // New app, add it
        const firestoreWriteData = { ...baseDataForFirestore }; 
        firestoreWriteData.createdAt = serverTimestamp();
        firestoreWriteData.updatedAt = serverTimestamp();
        firestoreWriteData.averageRating = appData.averageRating || 0;
        firestoreWriteData.totalRatings = appData.totalRatings || 0;
        firestoreWriteData.downloads = appData.downloads || 0;
        firestoreWriteData.isBoosted = appData.isBoosted || false;
        firestoreWriteData.isPublic = appData.isPublic === undefined ? true : appData.isPublic;

        const appDocRef = await addDoc(this.appsCollection, firestoreWriteData);
        docIdToReturn = appDocRef.id;
        console.log('[ProfessionalService-Firestore] New app saved with ID:', docIdToReturn);
        
        clientReadyApp = {
          ...appData, // Use original appData as base for client return
          id: docIdToReturn,
          userId: userId,
          createdAt: new Date().toISOString(), 
          updatedAt: new Date().toISOString(),
          averageRating: firestoreWriteData.averageRating,
          totalRatings: firestoreWriteData.totalRatings,
          downloads: firestoreWriteData.downloads,
          isBoosted: firestoreWriteData.isBoosted,
          isPublic: firestoreWriteData.isPublic,
        };
      }
      return clientReadyApp;

    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error saving app (full error object):', error);
      if (error.message && error.message.includes("Unsupported field value: undefined")) {
        console.error("[ProfessionalService-Firestore] Detail: Firestore reported an undefined field. This often happens if an explicit 'id: undefined' is passed to addDoc(), or other fields are unintentionally undefined.");
      }
      if (error.message && error.message.includes('.toDate is not a function')) {
          console.error("[ProfessionalService-Firestore] Detail: Attempted to call .toDate() on a non-Timestamp value. This usually means data being processed wasn't directly from a Firestore read or a serverTimestamp() sentinel wasn't handled before conversion.")
      }
      throw error;
    }
  }

  // Delete app
  async deleteApp(appId, userId) {
    if (!appId || !userId) {
      console.error('[ProfessionalService-Firestore] deleteApp: appId and userId are required.');
      throw new Error('App ID and User ID are required to delete an app.');
    }
    try {
      const appToDelete = await this.getAppById(appId);
      if (!appToDelete) {
        throw new Error('App not found.');
      }
      if (appToDelete.userId !== userId) {
        // Add admin check here if admins should be able to delete any app
        console.warn('[ProfessionalService-Firestore] deleteApp: User', userId, 'is not the owner of app', appId);
        throw new Error('You are not authorized to delete this app.');
      }
      const appDocRef = doc(this.appsCollection, appId);
      await deleteDoc(appDocRef);
      console.log('[ProfessionalService-Firestore] App deleted:', appId);
      return true;
    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error deleting app:', appId, error);
      throw error;
    }
  }

  // Get public apps only
  async getPublicApps() {
    try {
        const q = query(this.appsCollection, where('isPublic', '==', true), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const apps = [];
        querySnapshot.forEach((doc) => {
            apps.push(convertTimestamps({ ...doc.data(), id: doc.id }));
        });
        console.log(`[ProfessionalService-Firestore] Fetched ${apps.length} public apps.`);
        return apps;
    } catch (error) {
        console.error('[ProfessionalService-Firestore] Error fetching public apps:', error);
        throw error;
    }
  }

  // Get trending apps
  async getTrendingApps(minDownloads = 0, minRatings = 0, limitCount = 5) {
    try {
      let q = query(
        this.appsCollection, 
        where('isPublic', '==', true),
        orderBy('averageRating', 'desc'), 
        orderBy('totalRatings', 'desc'), 
        orderBy('downloads', 'desc'), 
        firestoreLimit(limitCount * 2) // Use the aliased or correctly imported limit
      );

      const querySnapshot = await getDocs(q);
      const apps = [];
      querySnapshot.forEach((doc) => {
        apps.push(convertTimestamps({ ...doc.data(), id: doc.id }));
      });
      
      const filteredApps = apps
        .filter(app => app.downloads >= minDownloads && app.totalRatings >= minRatings)
        .slice(0, limitCount);

      console.log(`[ProfessionalService-Firestore] Fetched ${filteredApps.length} trending apps.`);
      return filteredApps;
    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error fetching trending apps:', error);
      const publicApps = await this.getPublicApps(); // Fallback uses already correct getPublicApps
      return publicApps
        .filter(app => app.downloads >= minDownloads && app.totalRatings >= minRatings)
        .sort((a, b) => b.averageRating - a.averageRating || b.downloads - a.downloads)
        .slice(0, limitCount);
    }
  }

  // Method to get app details from Firebase
  async getAppDetailsFromFirebase(appId) {
    if (!appId) {
      console.error('getAppDetailsFromFirebase: appId is required');
      return null;
    }
    try {
      const appRef = doc(db, 'zentro_apps', appId);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        // Combine document ID with data, standard practice
        return { id: appSnap.id, ...appSnap.data() };
      } else {
        console.log('No such app document in Firebase for id:', appId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching app details from Firebase:', error);
      throw error; // Re-throw or handle as needed
    }
  }

  // Search apps
  searchApps(query, filters = {}) {
    const apps = this.getPublicApps();
    let filtered = [...apps];

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(app =>
        app.title?.toLowerCase().includes(searchTerm) ||
        app.description?.toLowerCase().includes(searchTerm) ||
        app.category?.toLowerCase().includes(searchTerm) ||
        app.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(app => app.category === filters.category);
    }

    // Sort by rating, downloads, or date
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'downloads':
            return (b.downloads || 0) - (a.downloads || 0);
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          default:
            return 0;
        }
      });
    }

    return filtered;
  }

  // Get app categories
  getAppCategories() {
    const apps = this.getAllApps();
    const categories = [...new Set(apps.map(app => app.category).filter(Boolean))];
    return categories.sort();
  }

  // Get popular skills
  getPopularSkills() {
    const professionals = this.getAllProfessionals();
    const skillCounts = {};

    professionals.forEach(prof => {
      if (prof.skills) {
        prof.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([skill]) => skill);
  }

  // Get statistics
  getStatistics() {
    const professionals = this.getAllProfessionals();
    const apps = this.getAllApps();

    return {
      totalProfessionals: professionals.length,
      publicProfessionals: professionals.filter(p => p.visibility === 'public').length,
      totalApps: apps.length,
      publicApps: apps.filter(a => a.visibility === 'public').length,
      categories: this.getAppCategories().length,
      popularSkills: this.getPopularSkills().slice(0, 5),
    };
  }

  // Clear all app showcase data
  clearAppShowcase() {
    try {
      localStorage.removeItem(this.appsStorageKey);
      console.log('✅ LocalStorage app showcase (zentro_apps) cleared');
      return true;
    } catch (error) {
      console.error('Error clearing localStorage app showcase:', error);
      return false;
    }
  }

  // Initialize with empty showcase (call this to clear database)
  initializeEmptyShowcase() {
    try {
      localStorage.setItem(this.appsStorageKey, JSON.stringify([]));
      console.log('✅ App showcase database initialized as empty');
      return true;
    } catch (error) {
      console.error('Error initializing empty showcase:', error);
      return false;
    }
  }

  async getAppById(appId) {
    if (!appId) {
      console.error('[ProfessionalService-Firestore] getAppById: appId is required.');
      return null;
    }
    try {
      const appDocRef = doc(this.appsCollection, appId);
      const docSnap = await getDoc(appDocRef);
      if (docSnap.exists()) {
        console.log('[ProfessionalService-Firestore] Fetched app by ID:', appId);
        return convertTimestamps({ ...docSnap.data(), id: docSnap.id });
      } else {
        console.warn('[ProfessionalService-Firestore] No app found with ID:', appId);
        return null;
      }
    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error fetching app by ID:', appId, error);
      throw error;
    }
  }

  async clearAllAppsFromFirestore(adminUserId) {
    // Basic admin check placeholder - in a real app, verify admin status securely.
    // For now, we'll proceed if adminUserId is provided, assuming it implies admin rights for this dev tool.
    if (!adminUserId) {
      console.warn('[ProfessionalService-Firestore] clearAllAppsFromFirestore: Admin User ID must be provided to clear all apps.');
      // throw new Error('Admin authorization required to clear all apps.');
      // For now, to make it usable in dev without full auth, let's allow if ANY id is passed.
      // Consider this a temporary measure for development convenience.
      // In production, a proper admin check against user roles/claims is essential.
      console.warn('[ProfessionalService-Firestore] Proceeding with clearAllAppsFromFirestore for development. Ensure this is secured in production!');
    }

    console.log(`[ProfessionalService-Firestore] clearAllAppsFromFirestore called by admin: ${adminUserId || 'unknown'}`);
    try {
      const querySnapshot = await getDocs(this.appsCollection);
      if (querySnapshot.empty) {
        console.log('[ProfessionalService-Firestore] No apps in Firestore to clear.');
        return 0;
      }
      const batch = writeBatch(db);
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`[ProfessionalService-Firestore] Cleared ${querySnapshot.size} apps from Firestore.`);
      return querySnapshot.size;
    } catch (error) {
      console.error('[ProfessionalService-Firestore] Error clearing all apps from Firestore:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const professionalService = new ProfessionalService();
export default professionalService;
