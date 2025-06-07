// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD31k9ml-OF1SrVx2aYZEsDLDCQjWEI4ZE",
  authDomain: "zentro-chat.firebaseapp.com",
  projectId: "zentro-chat",
  storageBucket: "zentro-chat.firebasestorage.app",
  messagingSenderId: "373937217249",
  appId: "1:373937217249:web:a37c7ae4d01b2bdd4e61a0",
  measurementId: "G-F8TN75DJ7M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth, Firestore, and Provider
const auth = getAuth(app);
const db = getFirestore(app);

// Set auth persistence to session (clears when browser is closed)
// This helps prevent previous credentials from persisting unexpectedly
setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// Helper function to sign out and clear auth state
const clearAuthState = async () => {
  try {
    await auth.signOut();
    // Clear any local storage items related to auth
    localStorage.removeItem('googleAuthData');
  } catch (error) {
    console.error("Error clearing auth state:", error);
  }
};

// ✅ Export these correctly
export { auth, db, provider, clearAuthState };
