import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTPXlKP6Se210YI3439Y8tZhOt7tv3PBI",
  authDomain: "atrc-3326f.firebaseapp.com",
  projectId: "atrc-3326f",
  storageBucket: "atrc-3326f.firebasestorage.app",
  messagingSenderId: "752973806771",
  appId: "1:752973806771:web:de2d848546e5cafdb144c6",
  measurementId: "G-TQ53JFVHCL"
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