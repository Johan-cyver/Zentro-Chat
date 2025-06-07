// Friends Service - Handle friend requests, friendships, and friend-related functionality
// Using localStorage for compatibility with current setup

import { db } from '../firebase'; // Assuming db is exported from src/firebase
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  Timestamp, // For type checking if needed
  writeBatch, 
  deleteDoc,
  orderBy,
  limit,
  updateDoc
} from 'firebase/firestore';

class FriendsService {
  constructor() {
    this.usersCollection = collection(db, 'users');
    this.friendRequestsCollection = collection(db, 'friendRequests');
    // Friendships will be subcollections, so no top-level collection variable here.
    console.log('[FriendsService-Firestore] Initialized');
  }

  // Register a new user or update existing one in Firestore
  async registerUser(userProfile) {
    if (!userProfile || !userProfile.uid) {
      console.error('[FriendsService-Firestore] registerUser: userProfile or userProfile.uid is missing.');
      return null;
    }
    const userDocRef = doc(this.usersCollection, userProfile.uid);
    
    try {
      const userDocSnap = await getDoc(userDocRef);
    const userData = {
      uid: userProfile.uid,
        displayName: userProfile.displayName || 'Anonymous User',
        email: userProfile.email || null, // Ensure email is stored
        photoURL: userProfile.photoURL || null,
      location: userProfile.location || '',
        bio: userProfile.bio || '',
        interests: userProfile.interests || [],
        lastActive: serverTimestamp(),
        // joinedAt should only be set if the user is new
      };

      if (!userDocSnap.exists()) {
        userData.joinedAt = serverTimestamp();
        console.log('[FriendsService-Firestore] Registering new user:', userProfile.uid);
    } else {
        console.log('[FriendsService-Firestore] Updating existing user:', userProfile.uid);
      }

      await setDoc(userDocRef, userData, { merge: true });
      
      // For immediate use, return userData with potentially client-approximated timestamps
      const returnData = {...userData};
      if (returnData.lastActive && typeof returnData.lastActive !== 'string') returnData.lastActive = new Date().toISOString();
      if (returnData.joinedAt && typeof returnData.joinedAt !== 'string') returnData.joinedAt = userDocSnap.exists() ? userDocSnap.data().joinedAt?.toDate().toISOString() : new Date().toISOString();
      
      return returnData;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error registering/updating user:', userProfile.uid, error);
      throw error;
    }
  }

  // Get all registered users from Firestore
  async getRegisteredUsers() {
    try {
      const querySnapshot = await getDocs(this.usersCollection);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      console.log(`[FriendsService-Firestore] Fetched ${users.length} registered users.`);
      return users;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error fetching registered users:', error);
      throw error;
    }
  }

  // Get a specific user profile from Firestore by UID
  async getUserProfile(userId) {
    if (!userId) {
      console.error('[FriendsService-Firestore] getUserProfile: userId is missing.');
      return null;
    }
    try {
      const userDocRef = doc(this.usersCollection, userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        console.log('[FriendsService-Firestore] Fetched user profile:', userId);
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.warn('[FriendsService-Firestore] No such user profile found for userId:', userId);
        return null;
      }
    } catch (error) {
      console.error('[FriendsService-Firestore] Error fetching user profile for userId:', userId, error);
      throw error;
    }
  }

  // Search for users by displayName in Firestore
  async searchUsers(searchQuery, currentUserId, searchLimit = 10) {
    const searchTerm = searchQuery.toLowerCase().trim();
    if (!searchTerm) return [];

    try {
      // Firestore queries are case-sensitive. For case-insensitive search,
      // you typically store a lowercased version of the field.
      // For simplicity here, we'll do a basic prefix match if possible or filter client-side for broader search.
      // A more robust solution would involve lowercased fields or a third-party search service.
      
      // Simple query: users whose displayName starts with the searchTerm.
      // Note: Firestore doesn't support case-insensitive 'contains' queries directly.
      // This query will find users where displayName starts with searchTerm (case-sensitive for subsequent characters).
      const usersQuery = query(
        this.usersCollection,
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'), // Matches strings starting with searchTerm
        orderBy('displayName'),
        limit(searchLimit * 2) // Fetch more to filter client-side for currentUserId
      );

      const querySnapshot = await getDocs(usersQuery);
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        // Additional client-side filtering for currentUserId and more precise matching
        if (userData.id !== currentUserId && userData.displayName?.toLowerCase().includes(searchTerm)) {
          users.push(userData);
        }
      });
      
      console.log(`[FriendsService-Firestore] Searched users for query "${searchTerm}", found ${users.slice(0, searchLimit).length} after filtering.`);
      return users.slice(0, searchLimit);
    } catch (error) {
      console.error('[FriendsService-Firestore] Error searching users:', error);
      // Fallback: Get all users and filter client-side (less efficient for large datasets)
      // This is a simple fallback, consider implications for very large user bases.
      try {
        console.warn('[FriendsService-Firestore] Search query failed, falling back to client-side search.');
        const allUsers = await this.getRegisteredUsers();
        return allUsers
          .filter(user => 
            user.id !== currentUserId &&
            user.displayName?.toLowerCase().includes(searchTerm)
          )
          .slice(0, searchLimit);
      } catch (fallbackError) {
        console.error('[FriendsService-Firestore] Error in fallback searchUsers:', fallbackError);
        throw fallbackError; // Or return empty array
      }
    }
  }
  
  async sendFriendRequest(fromUserId, toUserId, fromUserData) {
    if (!fromUserId || !toUserId || !fromUserData) {
      console.error('[FriendsService-Firestore] sendFriendRequest: Missing required arguments.');
      throw new Error('Missing required arguments for sending friend request.');
    }
    if (fromUserId === toUserId) {
      throw new Error('You cannot send a friend request to yourself.');
    }

    try {
      // Check if the recipient user exists
      const toUserDoc = await this.getUserProfile(toUserId);
      if (!toUserDoc) {
        throw new Error('The user you are trying to send a request to does not exist.');
      }

      // Check if they're already friends
      const status = await this.checkFriendshipStatus(fromUserId, toUserId);
      if (status === 'friends') {
        throw new Error('You are already friends with this user.');
      }
      if (status === 'request_sent') {
        throw new Error('You have already sent a friend request to this user.');
      }
      if (status === 'request_received') {
        throw new Error('This user has already sent you a friend request.');
      }

      // Double-check if a request exists (belt and suspenders)
      const q = query(this.friendRequestsCollection, 
                     where('senderId', 'in', [fromUserId, toUserId]), 
                     where('receiverId', 'in', [fromUserId, toUserId]),
                     where('status', '==', 'pending'));
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('A friend request is already pending between you and this user.');
      }

      // Create and send the friend request
      const newRequestRef = doc(this.friendRequestsCollection);
      const newRequestData = {
        id: newRequestRef.id,
        senderId: fromUserId,
        receiverId: toUserId,
        senderData: {
          uid: fromUserData.uid,
          displayName: fromUserData.displayName || 'Unknown User',
          photoURL: fromUserData.photoURL || null,
        },
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(newRequestRef, newRequestData);
      console.log('[FriendsService-Firestore] Friend request sent from', fromUserId, 'to', toUserId, 'reqId:', newRequestRef.id);
      return { ...newRequestData, id: newRequestRef.id };
    } catch (error) {
      console.error('[FriendsService-Firestore] Error sending friend request:', error);
      throw error;
    }
  }

  // Get all friend requests for a user (both sent and received)
  async getFriendRequests(userId) {
    if (!userId) {
      console.error('[FriendsService-Firestore] getFriendRequests: userId is missing.');
      return [];
    }
    try {
      // Query for requests where user is either sender or receiver
      const sentQuery = query(
        this.friendRequestsCollection,
        where('senderId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const receivedQuery = query(
        this.friendRequestsCollection,
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);

      const requests = [];
      sentSnap.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));
      receivedSnap.forEach((doc) => requests.push({ id: doc.id, ...doc.data() }));

      console.log(`[FriendsService-Firestore] Fetched ${requests.length} friend requests for user ${userId}.`);
      return requests;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error fetching friend requests:', error);
      throw error;
    }
  }

  async getPendingRequests(userId) {
    if (!userId) {
      console.error('[FriendsService-Firestore] getPendingRequests: userId is missing.');
      return [];
    }
    try {
      const q = query(
        this.friendRequestsCollection,
        where('receiverId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('receiverId'), 
        orderBy('status'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const requests = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      console.log(`[FriendsService-Firestore] Fetched ${requests.length} pending friend requests for user ${userId}.`);
      return requests;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error fetching pending requests for user:', userId, error);
      throw error;
    }
  }

  async acceptFriendRequest(requestId, currentUserId) {
    if (!requestId || !currentUserId) {
      console.error('[FriendsService-Firestore] acceptFriendRequest: Missing requestId or currentUserId.');
      throw new Error('Missing required arguments for accepting friend request.');
    }

    const requestDocRef = doc(this.friendRequestsCollection, requestId);
    const batch = writeBatch(db);

    try {
      const requestSnap = await getDoc(requestDocRef);
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found.');
      }

      const requestData = requestSnap.data();
      if (requestData.receiverId !== currentUserId) {
        throw new Error('This friend request is not for you.');
      }
      if (requestData.status !== 'pending') {
        throw new Error(`Cannot accept a request that is already '${requestData.status}'.`);
      }

      // Update request status
      batch.update(requestDocRef, { 
        status: 'accepted', 
        updatedAt: serverTimestamp() 
      });

      // Create friendship: Add to each other's friends subcollection
      const senderId = requestData.senderId;
      const receiverId = requestData.receiverId; // currentUserId

      const friend1Ref = doc(this.usersCollection, senderId, 'friends', receiverId);
      const friend2Ref = doc(this.usersCollection, receiverId, 'friends', senderId);
      
      const friendshipData = { friendedAt: serverTimestamp() };

      batch.set(friend1Ref, friendshipData);
      batch.set(friend2Ref, friendshipData);

      await batch.commit();
      console.log('[FriendsService-Firestore] Friend request accepted and friendship created:', requestId);
      return { ...requestData, status: 'accepted' }; // Return updated request data

    } catch (error) {
      console.error('[FriendsService-Firestore] Error accepting friend request:', requestId, error);
      throw error;
    }
  }

  async rejectFriendRequest(requestId, currentUserId) {
    if (!requestId || !currentUserId) {
      console.error('[FriendsService-Firestore] rejectFriendRequest: Missing requestId or currentUserId.');
      throw new Error('Missing required arguments for rejecting friend request.');
    }
    const requestDocRef = doc(this.friendRequestsCollection, requestId);
    try {
      const requestSnap = await getDoc(requestDocRef);
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found.');
      }
      const requestData = requestSnap.data();
      if (requestData.receiverId !== currentUserId && requestData.senderId !== currentUserId) {
         // Allow sender to cancel their own pending request implicitly by rejecting/cancelling
         // Or receiver to reject.
        throw new Error('This friend request does not involve you.');
      }
      if (requestData.status !== 'pending') {
         throw new Error(`Cannot reject a request that is already '${requestData.status}'.`);
      }

      await updateDoc(requestDocRef, { 
        status: 'rejected', 
        updatedAt: serverTimestamp()
      });
      console.log('[FriendsService-Firestore] Friend request rejected:', requestId);
    return true;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error rejecting friend request:', requestId, error);
      throw error;
    }
  }
  
  async cancelFriendRequest(requestId, currentUserId) {
    if (!requestId || !currentUserId) {
      console.error('[FriendsService-Firestore] cancelFriendRequest: Missing requestId or currentUserId.');
      throw new Error('Missing required arguments for cancelling friend request.');
    }
    const requestDocRef = doc(this.friendRequestsCollection, requestId);
    try {
      const requestSnap = await getDoc(requestDocRef);
      if (!requestSnap.exists()) {
        throw new Error('Friend request not found.');
      }
      const requestData = requestSnap.data();
      if (requestData.senderId !== currentUserId) {
        throw new Error('You can only cancel friend requests you sent.');
      }
      if (requestData.status !== 'pending') {
         throw new Error(`Cannot cancel a request that is already '${requestData.status}'.`);
      }
      // Instead of updating status to 'cancelled', we can just delete the request.
      // Or, update status to 'cancelled' if you want to keep a record.
      // For simplicity, deleting it:
      await deleteDoc(requestDocRef);
      console.log('[FriendsService-Firestore] Friend request cancelled (deleted):', requestId);
      return true;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error cancelling friend request:', requestId, error);
      throw error;
    }
  }

  async getUserFriends(userId) {
    if (!userId) {
      console.error('[FriendsService-Firestore] getUserFriends: userId is missing.');
      return [];
    }
    try {
      const friendsCollectionRef = collection(this.usersCollection, userId, 'friends');
      const friendsSnap = await getDocs(friendsCollectionRef);
      
      if (friendsSnap.empty) {
        return [];
      }
      
      const friendPromises = friendsSnap.docs.map(friendDoc => this.getUserProfile(friendDoc.id));
      const friendsProfiles = await Promise.all(friendPromises);
      
      const friendsWithData = friendsProfiles.filter(Boolean).map(profile => ({
          ...profile,
          // friendedAt: friendsSnap.docs.find(d => d.id === profile.id).data().friendedAt // Requires mapping friendDoc.id to friendedAt
          // For simplicity, not adding friendedAt to the immediate return here, can be added if needed.
      }));
      console.log(`[FriendsService-Firestore] Fetched ${friendsWithData.length} friends for user ${userId}.`);
      return friendsWithData;

    } catch (error) {
      console.error('[FriendsService-Firestore] Error fetching user friends for userId:', userId, error);
      throw error;
    }
  }
  
  async getFriends(userId) { // Legacy compatibility
    return this.getUserFriends(userId);
  }

  async getPendingFriendRequests(userId) { // Legacy compatibility
    return this.getPendingRequests(userId);
  }

  async checkFriendshipStatus(userId1, userId2) {
    if (!userId1 || !userId2) return 'none';
    if (userId1 === userId2) return 'self'; // Or handle as needed

    try {
    // Check if they are friends
      const friendDocRef = doc(this.usersCollection, userId1, 'friends', userId2);
      const friendDocSnap = await getDoc(friendDocRef);
      if (friendDocSnap.exists()) {
      return 'friends';
    }

      // Check for pending request from userId1 to userId2
      let q = query(this.friendRequestsCollection, 
                      where('senderId', '==', userId1), 
                      where('receiverId', '==', userId2),
                      where('status', '==', 'pending'));
      let querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return 'request_sent'; // userId1 has sent a request to userId2
      }

      // Check for pending request from userId2 to userId1
      q = query(this.friendRequestsCollection, 
                where('senderId', '==', userId2), 
                where('receiverId', '==', userId1),
                where('status', '==', 'pending'));
      querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return 'request_received'; // userId1 has received a request from userId2
    }

    return 'none';
    } catch (error) {
      console.error('[FriendsService-Firestore] Error checking friendship status:', error);
      return 'none'; // Default to 'none' on error
    }
  }

  async removeFriend(currentUserId, friendToRemoveId) {
    if (!currentUserId || !friendToRemoveId) {
      console.error('[FriendsService-Firestore] removeFriend: Missing currentUserId or friendToRemoveId.');
      throw new Error('Missing required arguments for removing friend.');
    }

    const batch = writeBatch(db);
    try {
      const friend1Ref = doc(this.usersCollection, currentUserId, 'friends', friendToRemoveId);
      const friend2Ref = doc(this.usersCollection, friendToRemoveId, 'friends', currentUserId);

      batch.delete(friend1Ref);
      batch.delete(friend2Ref);

      await batch.commit();
      console.log(`[FriendsService-Firestore] Friendship removed between ${currentUserId} and ${friendToRemoveId}.`);
      return true;
    } catch (error) {
      console.error('[FriendsService-Firestore] Error removing friend:', error);
      throw error;
    }
  }

  getFriendCount(userId) {
    // This will become async if getUserFriends is fully async and not pre-loading friends
    // For now, if getUserFriends is already refactored for Firestore:
    // return this.getUserFriends(userId).then(friends => friends.length);
    // However, to keep it simple for now IF getUserFriends returns an array directly (even if async internally):
    console.warn('[FriendsService-Firestore] getFriendCount might need to be async if getUserFriends is fully async and data isnt pre-loaded.');
    // This is a placeholder until getUserFriends is confirmed. Assuming it returns a promise now:
    // This method should ideally be async to match getUserFriends
    return this.getUserFriends(userId).then(friends => friends.length).catch(() => 0);
  }

  async checkUserExists(userId) {
    const user = await this.getUserProfile(userId);
    return !!user;
  }
  
  // Placeholder for subscribeNotifications, might need significant rework for Firestore (e.g., using onSnapshot)
  subscribeNotifications(userId, callback) {
    console.warn('[FriendsService-Firestore] subscribeNotifications not yet refactored for Firestore. Returning no-op.');
    return () => {}; // Return an empty unsubscribe function
  }

  async markNotificationAsRead(notificationId) {
    console.warn('[FriendsService-Firestore] markNotificationAsRead not yet refactored for Firestore.');
    return true;
  }

  async getFriendSuggestions(currentUserId, maxSuggestions = 10) {
    if (!currentUserId) return [];

    try {
        const currentUserProfile = await this.getUserProfile(currentUserId);
        if (!currentUserProfile) return [];

        const friendsAndRequests = new Set([currentUserId]);
        const friends = await this.getUserFriends(currentUserId);
        friends.forEach(f => friendsAndRequests.add(f.id));

        // Fetch users with pending requests involving the current user
        const sentRequestsQuery = query(this.friendRequestsCollection, where('senderId', '==', currentUserId), where('status', '==', 'pending'));
        const receivedRequestsQuery = query(this.friendRequestsCollection, where('receiverId', '==', currentUserId), where('status', '==', 'pending'));
        
        const [sentSnaps, receivedSnaps] = await Promise.all([
            getDocs(sentRequestsQuery),
            getDocs(receivedRequestsQuery)
        ]);
        sentSnaps.forEach(doc => friendsAndRequests.add(doc.data().receiverId));
        receivedSnaps.forEach(doc => friendsAndRequests.add(doc.data().senderId));

        // Fetch all users and filter out excluded ones
        // For very large user bases, more targeted querying (e.g., by common interests, location, etc.) would be better.
        // This is a simplified approach for now.
        const allUsersQuery = query(this.usersCollection, orderBy('lastActive', 'desc'), limit(maxSuggestions * 5)); // Fetch more to filter
        const allUsersSnap = await getDocs(allUsersQuery);
        
        const suggestions = [];
        allUsersSnap.forEach(doc => {
            if (suggestions.length < maxSuggestions && !friendsAndRequests.has(doc.id)) {
                suggestions.push({ id: doc.id, ...doc.data() });
            }
        });

        console.log(`[FriendsService-Firestore] Generated ${suggestions.length} friend suggestions for user ${currentUserId}.`);
        return suggestions;

    } catch (error) {
        console.error('[FriendsService-Firestore] Error generating friend suggestions:', error);
        return [];
    }
  }
}

const friendsService = new FriendsService();
export default friendsService;
