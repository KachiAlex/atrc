const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Admin SDK
initializeApp();

// Callable function to elevate a user to admin
exports.elevateToAdmin = onCall(async (request) => {
  // Require auth
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  const targetUid = request.data && request.data.targetUid ? String(request.data.targetUid) : request.auth.uid;
  const providedSecret = request.data && request.data.secret ? String(request.data.secret) : '';

  // For now, use a simple hardcoded secret - in production, use environment variables
  const expectedSecret = process.env.ADMIN_SECRET || 'admin123';

  if (providedSecret !== expectedSecret) {
    throw new HttpsError('permission-denied', 'Invalid admin code.');
  }

  try {
    // Set custom claims
    await getAuth().setCustomUserClaims(targetUid, { role: 'admin' });

    // Update Firestore user document
    const db = getFirestore();
    await db.collection('users').doc(targetUid).set({ role: 'admin' }, { merge: true });

    return { ok: true, uid: targetUid };
  } catch (err) {
    console.error('elevateToAdmin error:', err);
    throw new HttpsError('internal', 'Unable to elevate user.');
  }
});


