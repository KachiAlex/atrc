import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Creates a default admin user for the ATRC platform
 * This should be run once during initial setup
 */
export const createDefaultAdmin = async () => {
  const adminEmail = 'admin@atrc.org';
  const adminPassword = 'AdminATRC2024!';
  const adminData = {
    displayName: 'ATRC Super Admin',
    role: 'admin',
    email: adminEmail,
    isDefaultAdmin: true,
    permissions: [
      'manage_users',
      'manage_verifications',
      'manage_documents',
      'view_analytics',
      'manage_settings'
    ],
    createdAt: new Date(),
    lastLogin: null
  };

  try {
    console.log('Creating default admin user...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('Firebase Auth user created:', user.uid);
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, adminData);
    
    console.log('Admin user document created in Firestore');
    
    // Create admin settings document
    const adminSettingsRef = doc(db, 'adminSettings', 'default');
    await setDoc(adminSettingsRef, {
      platformName: 'Africa Traditional Rulers for Christ',
      version: '1.0.0',
      defaultAdminCreated: true,
      createdAt: new Date(),
      features: {
        userManagement: true,
        verificationSystem: true,
        documentManagement: true,
        analytics: true,
        notifications: true
      }
    });
    
    console.log('Admin settings document created');
    
    return {
      success: true,
      message: 'Default admin user created successfully',
      credentials: {
        email: adminEmail,
        password: adminPassword
      },
      userId: user.uid
    };
    
  } catch (error) {
    console.error('Error creating default admin:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: false,
        message: 'Admin user already exists',
        error: error.code
      };
    }
    
    return {
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    };
  }
};

/**
 * Checks if default admin exists
 */
export const checkDefaultAdmin = async () => {
  try {
    const adminSettingsRef = doc(db, 'adminSettings', 'default');
    const adminSettings = await getDoc(adminSettingsRef);
    
    return adminSettings.exists() && adminSettings.data().defaultAdminCreated;
  } catch (error) {
    console.error('Error checking default admin:', error);
    return false;
  }
};

/**
 * Creates admin user with custom credentials
 */
export const createCustomAdmin = async (email, password, displayName = 'Admin User') => {
  const adminData = {
    displayName,
    role: 'admin',
    email,
    isDefaultAdmin: false,
    permissions: [
      'manage_users',
      'manage_verifications',
      'manage_documents',
      'view_analytics'
    ],
    createdAt: new Date(),
    lastLogin: null
  };

  try {
    console.log('Creating custom admin user...');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, adminData);
    
    return {
      success: true,
      message: 'Custom admin user created successfully',
      userId: user.uid
    };
    
  } catch (error) {
    console.error('Error creating custom admin:', error);
    return {
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    };
  }
};
