import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWzqn4dlfHbKCL2gIDHxOy2jxrFoBh_jY",
  authDomain: "traditional-rulers-app.firebaseapp.com",
  projectId: "traditional-rulers-app",
  storageBucket: "traditional-rulers-app.firebasestorage.app",
  messagingSenderId: "479592525040",
  appId: "1:479592525040:web:e13c68142e85ac0d23a635"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const analytics = getAnalytics(app);

export default app;