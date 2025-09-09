const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Admin SDK once
try {
  admin.app();
} catch (e) {
  admin.initializeApp();
}

// Callable function to elevate a user to admin
exports.elevateToAdmin = functions.https.onCall(async (data, context) => {
  // Require auth
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const targetUid = data && data.targetUid ? String(data.targetUid) : context.auth.uid;
  const providedSecret = data && data.secret ? String(data.secret) : '';

  const config = functions.config() || {};
  const expectedSecret = config.app && config.app.admin_code ? String(config.app.admin_code) : '';

  if (!expectedSecret) {
    throw new functions.https.HttpsError('failed-precondition', 'Admin code is not configured.');
  }

  if (providedSecret !== expectedSecret) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid admin code.');
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });

    // Update Firestore user document
    const db = admin.firestore();
    await db.collection('users').doc(targetUid).set({ role: 'admin' }, { merge: true });

    return { ok: true, uid: targetUid };
  } catch (err) {
    console.error('elevateToAdmin error:', err);
    throw new functions.https.HttpsError('internal', 'Unable to elevate user.');
  }
});


