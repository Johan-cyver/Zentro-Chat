
 // firebase.js or firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD31k9ml-OF1SrVx2aYZEsDLDCQjWEI4ZE",
  authDomain: "zentro-chat.firebaseapp.com",
  projectId: "zentro-chat",
  storageBucket: "zentro-chat.firebasestorage.app",
  messagingSenderId: "373937217249",
  appId: "1:373937217249:web:a37c7ae4d01b2bdd4e61a0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
