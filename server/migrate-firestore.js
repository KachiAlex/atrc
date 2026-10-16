// One-off Firestore -> Postgres migration.
// Usage: DATABASE_URL=... node migrate-firestore.js <serviceAccount.json> [--dry-run]
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { getFirestore, Timestamp, GeoPoint, DocumentReference } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const saPath = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');
if (!saPath || !fs.existsSync(saPath)) {
  console.error('usage: node migrate-firestore.js <serviceAccount.json> [--dry-run]');
  process.exit(1);
}

const sa = require(path.resolve(saPath));
const certFn = admin.cert || (admin.credential && admin.credential.cert);
admin.initializeApp({ credential: certFn(sa) });
const fsdb = getFirestore();
const authAdmin = getAuth();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---- Firestore value -> plain JSON ----
function toPlain(v) {
  if (v === null || v === undefined) return null;
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (v instanceof GeoPoint) return { lat: v.latitude, lng: v.longitude };
  if (v instanceof DocumentReference) return { __ref: v.path };
  if (Array.isArray(v)) return v.map(toPlain);
  if (typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v)) out[k] = toPlain(v[k]);
    return out;
  }
  return v;
}

const stats = { collections: {}, docs: 0, authUsers: 0, errors: [] };

async function migrateCollection(colRef, collPath) {
  const snap = await colRef.get();
  stats.collections[collPath] = (stats.collections[collPath] || 0) + snap.size;
  for (const docSnap of snap.docs) {
    try {
      const data = toPlain(docSnap.data());
      stats.docs++;
      if (!DRY_RUN) {
        await pool.query(
          `INSERT INTO documents (id, collection, data, created_at, updated_at)
           VALUES ($1, $2, $3::jsonb, now(), now())
           ON CONFLICT (id) DO UPDATE SET data = $3::jsonb, collection = $2, updated_at = now()`,
          [docSnap.id, collPath, JSON.stringify(data)]
        );
      }
    } catch (e) {
      stats.errors.push(`${collPath}/${docSnap.id}: ${e.message}`);
    }
    // subcollections
    const subs = await docSnap.ref.listCollections();
    for (const sub of subs) {
      await migrateCollection(sub, `${collPath}/${docSnap.id}/${sub.id}`);
    }
  }
}

async function migrateAuthUsers() {
  let pageToken;
  do {
    const res = await authAdmin.listUsers(1000, pageToken);
    for (const u of res.users) {
      if (!u.email) continue; // phone-only or anonymous users have no login path here
      stats.authUsers++;
      if (DRY_RUN) continue;
      // Passwords cannot be exported from Firebase Auth — assign a random
      // credential; members must use "forgot password" on first login.
      const randomHash = bcrypt.hashSync(crypto.randomBytes(24).toString('hex'), 10);
      await pool.query(
        `INSERT INTO auth_users (uid, email, password_hash, created_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (uid) DO NOTHING`,
        [u.uid, u.email, randomHash]
      ).catch(e => stats.errors.push(`auth ${u.email}: ${e.message}`));
      // Make sure a users profile doc exists (role defaults to member)
      const prof = {
        email: u.email,
        name: u.displayName || u.email,
        role: 'member',
        migratedFromFirebase: true,
      };
      await pool.query(
        `INSERT INTO documents (id, collection, data, created_at, updated_at)
         VALUES ($1, 'users', $2::jsonb, now(), now())
         ON CONFLICT (id) DO UPDATE SET data = documents.data || $2::jsonb, updated_at = now()`,
        [u.uid, JSON.stringify(prof)]
      ).catch(e => stats.errors.push(`profile ${u.email}: ${e.message}`));
    }
    pageToken = res.pageToken;
  } while (pageToken);
}

(async () => {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== MIGRATING ===');
  const roots = await fsdb.listCollections();
  console.log('root collections:', roots.map(c => c.id).join(', '));
  for (const col of roots) {
    await migrateCollection(col, col.id);
  }
  try {
    await migrateAuthUsers();
  } catch (e) {
    stats.errors.push(`auth listing: ${e.message}`);
  }
  console.log('\n--- RESULT ---');
  for (const [c, n] of Object.entries(stats.collections)) console.log(`${n}\t${c}`);
  console.log(`docs: ${stats.docs} | auth users: ${stats.authUsers} | errors: ${stats.errors.length}`);
  stats.errors.slice(0, 20).forEach(e => console.log('ERR', e));
  await pool.end();
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
