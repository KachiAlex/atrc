import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

// User roles
export const USER_ROLES = {
  RULER: 'ruler',
  CHIEF: 'chief',
  ELDER: 'elder',
  SECRETARY: 'secretary',
  ADMIN: 'admin',
  CITIZEN: 'citizen'
};

// Register new user
export const registerUser = async (userData) => {
  try {
    const { email, password, firstName, lastName, role, title, kingdom, community } = userData;
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });

    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      firstName,
      lastName,
      email,
      role: role || USER_ROLES.CITIZEN,
      title: title || '',
      kingdom: kingdom || '',
      community: community || null,
      phone: userData.phone || '',
      profileImage: userData.profileImage || null,
      isActive: true,
      isVerified: false,
      preferences: {
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      },
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return {
      success: true,
      user: {
        ...userDoc,
        token: await user.getIdToken()
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();

    // Check if user is active
    if (!userData.isActive) {
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    // Update last login
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: new Date()
    });

    return {
      success: true,
      user: {
        ...userData,
        token: await user.getIdToken()
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'title', 'kingdom', 'preferences'
    ];

    const updates = {
      updatedAt: new Date()
    };

    Object.keys(profileData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = profileData[key];
      }
    });

    await updateDoc(doc(db, 'users', uid), updates);

    // Get updated user data
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();

    return {
      success: true,
      user: userData
    };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Change password
export const changeUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user logged in');
    }

    // Re-authenticate user
    const credential = await signInWithEmailAndPassword(auth, user.email, currentPassword);
    
    // Update password
    await updatePassword(credential.user, newPassword);

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User document not found' };
    }

    const userData = userDoc.data();

    return {
      success: true,
      user: {
        ...userData,
        token: await user.getIdToken()
      }
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          callback({
            ...userData,
            token: await user.getIdToken()
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Check if user has role
export const hasRole = (user, roles) => {
  if (!user) return false;
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  return user.role === roles;
};

// Check if user has permission
export const hasPermission = (user, resource, action) => {
  if (!user) return false;
  if (user.role === USER_ROLES.ADMIN) return true;
  
  const permission = user.permissions?.find(p => p.resource === resource);
  return permission?.actions?.includes(action) || false;
};