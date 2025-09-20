import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, userData = {}) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore with default role
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDocData = {
        email: email,
        role: userData.role || 'ruler', // Default role is 'ruler'
        displayName: userData.displayName || '',
        createdAt: new Date(),
        isActive: true,
        isVerified: false, // New users are not verified by default
        ...userData
      };
      
      console.log('Creating user document with data:', userDocData);
      await setDoc(userDocRef, userDocData);
      console.log('User document created successfully');
      
      return result;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setCurrentUser(user);
      
      if (user) {
        // Fetch user role from Firestore
        try {
          console.log('Fetching user role for:', user.uid);
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User data from Firestore:', userData);
            setUserRole(userData.role || 'ruler');
          } else {
            console.log('User document does not exist, creating default role');
            // Try to create the user document if it doesn't exist
            try {
              const userDocRef = doc(db, 'users', user.uid);
              await setDoc(userDocRef, {
                email: user.email,
                role: 'ruler',
                displayName: user.displayName || '',
                createdAt: new Date(),
                isActive: true,
                isVerified: false // New users are not verified by default
              });
              console.log('Created missing user document');
              setUserRole('ruler');
            } catch (createError) {
              console.error('Error creating user document:', createError);
              setUserRole('ruler'); // Default role even if creation fails
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('ruler'); // Default role on error
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
