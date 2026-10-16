/**
 * ATRC API Server
 * Replaces Firebase: JWT auth (bcrypt passwords), Firestore-style document
 * store over Postgres JSONB, and file uploads to local disk.
 */
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PORT = parseInt(process.env.PORT || '3001', 10);
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://atrc:atrc@localhost:5432/atrc';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/lib/atrc/uploads';
const TOKEN_TTL = '30d';

const pool = new Pool({ connectionString: DATABASE_URL });
const app = express();
app.use(express.json({ limit: '10mb' }));

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set — using insecure default. Set it in the environment.');
}

// ---------- access rules for the document store ----------
// Readable without auth (public pages): landing/public feeds only.
const PUBLIC_READ = new Set(['announcements', 'events', 'liveMeetings']);
// Writable by admins only.
const ADMIN_WRITE = new Set(['announcements', 'adminSettings', 'books', 'courses']);
// Fields stripped from user docs when the requester is not an admin.
const USER_PUBLIC_FIELDS = ['displayName', 'firstName', 'lastName', 'role', 'title', 'kingdom', 'community', 'photoURL', 'isVerified'];

const topCollection = (c) => String(c).split('/')[0];
const isPublicRead = (c) => PUBLIC_READ.has(topCollection(c));
const isAdminWrite = (c) => ADMIN_WRITE.has(topCollection(c));

function publicUserData(data) {
  const out = {};
  for (const k of USER_PUBLIC_FIELDS) if (k in data) out[k] = data[k];
  return out;
}

// Like auth() but tolerates missing/invalid token (req.user = null).
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch { req.user = null; }
  } else req.user = null;
  next();
}

const requireUser = (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'unauthenticated', code: 'auth/unauthenticated' }); return false; }
  return true;
};
const requireAdmin = (req, res) => {
  if (!req.user) { res.status(401).json({ error: 'unauthenticated', code: 'auth/unauthenticated' }); return false; }
  if (req.user.role !== 'admin') { res.status(403).json({ error: 'admin only', code: 'auth/forbidden' }); return false; }
  return true;
};

// ---------- simple login rate limiter: 10 attempts / 5 min / IP ----------
const loginAttempts = new Map();
function loginLimiter(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { n: 0, reset: now + 5 * 60 * 1000 };
  if (now > rec.reset) { rec.n = 0; rec.reset = now + 5 * 60 * 1000; }
  rec.n++;
  loginAttempts.set(ip, rec);
  if (rec.n > 10) return res.status(429).json({ error: 'too many attempts, try again later', code: 'auth/rate-limited' });
  next();
}

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id         text PRIMARY KEY,
      collection text NOT NULL,
      data       jsonb NOT NULL DEFAULT '{}'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection);
    CREATE INDEX IF NOT EXISTS idx_documents_data ON documents USING gin(data);

    CREATE TABLE IF NOT EXISTS auth_users (
      uid           text PRIMARY KEY,
      email         text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      created_at    timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reset_tokens (
      token      text PRIMARY KEY,
      email      text NOT NULL,
      expires_at timestamptz NOT NULL
    );

    CREATE TABLE IF NOT EXISTS translations (
      id              text PRIMARY KEY,
      source_lang     text NOT NULL,
      target_lang     text NOT NULL,
      source_text     text NOT NULL,
      translated_text text NOT NULL,
      created_at      timestamptz NOT NULL DEFAULT now()
    );
  `);
}

// ---------- auth helpers ----------
function signToken(uid, role) {
  return jwt.sign({ uid, role }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthenticated', code: 'auth/unauthenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { uid: payload.uid, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token', code: 'auth/invalid-token' });
  }
}

async function adminCount() {
  const r = await pool.query(
    "SELECT count(*)::int AS n FROM documents WHERE collection='users' AND data->>'role'='admin'"
  );
  return r.rows[0].n;
}

async function getUserDoc(uid) {
  const r = await pool.query(
    "SELECT id, data FROM documents WHERE collection='users' AND id=$1", [uid]
  );
  return r.rows[0] || null;
}

function publicUser(uidRow, docRow) {
  const data = (docRow && docRow.data) || {};
  return {
    uid: uidRow.uid,
    email: uidRow.email,
    displayName: data.displayName || '',
    ...data
  };
}

// ---------- auth routes ----------
app.post('/api/auth/register', loginLimiter, async (req, res) => {
  try {
    const { email, password, ...profile } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (String(password).length < 6) return res.status(400).json({ error: 'password too short', code: 'auth/weak-password' });

    const exists = await pool.query('SELECT 1 FROM auth_users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rowCount) return res.status(409).json({ error: 'email already in use', code: 'auth/email-already-in-use' });

    // role clamping: 'admin' only allowed while zero admins exist (bootstrap)
    let role = profile.role || 'learner';
    if (role === 'admin' && (await adminCount()) > 0) role = 'learner';

    const uid = crypto.randomUUID();
    const hash = await bcrypt.hash(String(password), 10);
    const now = new Date().toISOString();

    await pool.query('INSERT INTO auth_users (uid, email, password_hash) VALUES ($1,$2,$3)', [uid, email.toLowerCase(), hash]);

    const docData = {
      email: email.toLowerCase(),
      role,
      displayName: profile.displayName || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      title: profile.title || '',
      kingdom: profile.kingdom || '',
      community: profile.community || null,
      phone: profile.phone || '',
      isActive: true,
      isVerified: role === 'admin',
      permissions: [],
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      ...profile,
      role
    };

    await pool.query(
      "INSERT INTO documents (id, collection, data) VALUES ($1,'users',$2)",
      [uid, JSON.stringify(docData)]
    );

    const user = publicUser({ uid, email: email.toLowerCase() }, { data: docData });
    res.json({ user, token: signToken(uid, role) });
  } catch (e) {
    console.error('register error', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const u = await pool.query('SELECT uid, email, password_hash FROM auth_users WHERE email=$1', [email.toLowerCase()]);
    if (!u.rowCount) return res.status(401).json({ error: 'invalid credentials', code: 'auth/invalid-credential' });

    const row = u.rows[0];
    const ok = await bcrypt.compare(String(password), row.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials', code: 'auth/invalid-credential' });

    const docRow = await getUserDoc(row.uid);
    if (docRow && docRow.data && docRow.data.isActive === false) {
      return res.status(403).json({ error: 'account deactivated', code: 'auth/user-disabled' });
    }
    if (docRow) {
      pool.query("UPDATE documents SET data = jsonb_set(data,'{lastLogin}',to_jsonb(now()::text),true), updated_at=now() WHERE id=$1 AND collection='users'", [row.uid]).catch(() => {});
    }

    const role = (docRow && docRow.data && docRow.data.role) || 'learner';
    res.json({ user: publicUser(row, docRow), token: signToken(row.uid, role) });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const u = await pool.query('SELECT uid, email FROM auth_users WHERE uid=$1', [req.user.uid]);
  if (!u.rowCount) return res.status(404).json({ error: 'user not found' });
  const docRow = await getUserDoc(req.user.uid);
  res.json({ user: publicUser(u.rows[0], docRow) });
});

// Re-issue a token with the user's current role (used right after signup
// writes the role doc, so the session doesn't carry a stale 'learner').
app.post('/api/auth/token/refresh', auth, async (req, res) => {
  const docRow = await getUserDoc(req.user.uid);
  const role = (docRow && docRow.data && docRow.data.role) || 'learner';
  res.json({ token: signToken(req.user.uid, role) });
});

// Admin view of outstanding reset tokens (no SMTP — admin hands them out).
app.get('/api/auth/reset-tokens', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only', code: 'auth/forbidden' });
  const r = await pool.query(
    "SELECT email, token, expires_at FROM reset_tokens WHERE expires_at > now() ORDER BY expires_at DESC LIMIT 50"
  );
  res.json({ tokens: r.rows });
});

app.post('/api/auth/logout', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword) {
      return res.status(400).json({ error: 'current password required', code: 'auth/requires-recent-login' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'new password too short', code: 'auth/weak-password' });
    }
    const u = await pool.query('SELECT password_hash FROM auth_users WHERE uid=$1', [req.user.uid]);
    if (!u.rowCount) return res.status(404).json({ error: 'user not found' });

    const ok = await bcrypt.compare(String(currentPassword), u.rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: 'wrong password', code: 'auth/wrong-password' });

    const hash = await bcrypt.hash(String(newPassword), 10);
    await pool.query('UPDATE auth_users SET password_hash=$1 WHERE uid=$2', [hash, req.user.uid]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  // No SMTP configured: issue a token that an admin can hand to the user.
  const { email } = req.body || {};
  const u = await pool.query('SELECT uid FROM auth_users WHERE email=$1', [(email || '').toLowerCase()]);
  if (u.rowCount) {
    const token = crypto.randomBytes(24).toString('hex');
    await pool.query(
      'INSERT INTO reset_tokens (token, email, expires_at) VALUES ($1,$2, now() + interval \'1 hour\')',
      [token, email.toLowerCase()]
    );
    console.log(`Password reset token for ${email}: ${token}`);
  }
  res.json({ ok: true }); // never reveal whether the email exists
});

app.post('/api/auth/reset-password/confirm', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword required' });
  const r = await pool.query('SELECT email, expires_at FROM reset_tokens WHERE token=$1', [token]);
  if (!r.rowCount || new Date(r.rows[0].expires_at) < new Date()) {
    return res.status(400).json({ error: 'invalid or expired token' });
  }
  const hash = await bcrypt.hash(String(newPassword), 10);
  await pool.query('UPDATE auth_users SET password_hash=$1 WHERE email=$2', [hash, r.rows[0].email]);
  await pool.query('DELETE FROM reset_tokens WHERE token=$1', [token]);
  res.json({ ok: true });
});

// Admin sets a temporary password for a user (no SMTP — admin shares it directly).
app.post('/api/auth/admin-reset', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin only', code: 'auth/forbidden' });
  const { email, uid, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'password too short', code: 'auth/weak-password' });
  }
  if (!email && !uid) return res.status(400).json({ error: 'email or uid required' });
  const hash = await bcrypt.hash(String(newPassword), 10);
  const r = uid
    ? await pool.query('UPDATE auth_users SET password_hash=$1 WHERE uid=$2', [hash, uid])
    : await pool.query('UPDATE auth_users SET password_hash=$1 WHERE email=$2', [hash, String(email).toLowerCase()]);
  if (!r.rowCount) return res.status(404).json({ error: 'user not found' });
  res.json({ ok: true });
});

app.post('/api/auth/update-profile', auth, async (req, res) => {
  const allowed = ['displayName', 'firstName', 'lastName', 'phone', 'title', 'kingdom', 'photoURL', 'community', 'preferences'];
  const updates = {};
  for (const k of allowed) if (k in (req.body || {})) updates[k] = req.body[k];
  if (!Object.keys(updates).length) return res.json({ ok: true });
  updates.updatedAt = new Date().toISOString();
  await applyUpdates(req.user.uid, 'users', updates);
  res.json({ ok: true });
});

// ---------- document store (Firestore-style) ----------
const SAFE_FIELD = /^[A-Za-z0-9_.]+$/;

// Expand write-op sentinels inside a payload for INSERT/SET.
function expandOps(value) {
  if (value === null || typeof value !== 'object') {
    if (value instanceof Date) return value.toISOString();
    return value;
  }
  if (Array.isArray(value)) return value.map(expandOps);
  if (value.__fs === 'serverTimestamp') return new Date().toISOString();
  if (value.__fs === 'increment') return value.by || 0;
  if (value.__fs === 'arrayUnion') return expandOps(value.values || []);
  if (value.__fs === 'arrayRemove') return [];
  if (value.__fs === 'delete') return undefined;
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = expandOps(v);
  return out;
}

// Build an UPDATE for dot-path-aware partial updates with op support.
// Each key becomes one jsonb_set / plain assignment applied in JS then written once.
async function applyUpdates(id, collection, updates) {
  const cur = await pool.query(
    'SELECT data FROM documents WHERE collection=$1 AND id=$2', [collection, id]
  );
  if (!cur.rowCount) return false;
  const data = cur.rows[0].data;

  for (const [key, val] of Object.entries(updates)) {
    const parts = key.split('.');
    let target = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof target[parts[i]] !== 'object' || target[parts[i]] === null) target[parts[i]] = {};
      target = target[parts[i]];
    }
    const leaf = parts[parts.length - 1];

    if (val && typeof val === 'object' && val.__fs === 'serverTimestamp') {
      target[leaf] = new Date().toISOString();
    } else if (val && typeof val === 'object' && val.__fs === 'increment') {
      const cur2 = typeof target[leaf] === 'number' ? target[leaf] : 0;
      target[leaf] = cur2 + (val.by || 0);
    } else if (val && typeof val === 'object' && val.__fs === 'arrayUnion') {
      const arr = Array.isArray(target[leaf]) ? target[leaf] : [];
      for (const item of expandOps(val.values || [])) {
        if (!arr.some(x => JSON.stringify(x) === JSON.stringify(item))) arr.push(item);
      }
      target[leaf] = arr;
    } else if (val && typeof val === 'object' && val.__fs === 'arrayRemove') {
      const arr = Array.isArray(target[leaf]) ? target[leaf] : [];
      const rm = expandOps(val.values || []).map(x => JSON.stringify(x));
      target[leaf] = arr.filter(x => !rm.includes(JSON.stringify(x)));
    } else if (val && typeof val === 'object' && val.__fs === 'delete') {
      delete target[leaf];
    } else {
      target[leaf] = expandOps(val);
    }
  }
  data.updatedAt = new Date().toISOString();

  await pool.query(
    'UPDATE documents SET data=$1, updated_at=now() WHERE collection=$2 AND id=$3',
    [JSON.stringify(data), collection, id]
  );
  return true;
}

function jsonbPath(field) {
  const parts = field.split('.');
  if (!parts.every(p => /^[A-Za-z0-9_]+$/.test(p))) throw new Error('bad field');
  return `{${parts.join(',')}}`;
}

function buildWhere(collection, filters, startAfter, orderField, orderDir) {
  const clauses = ['collection=$1'];
  const params = [collection];

  for (const f of filters || []) {
    if (!SAFE_FIELD.test(f.field)) throw new Error('bad field: ' + f.field);
    const path = jsonbPath(f.field);
    const p = `$${params.length + 1}`;
    const isNum = typeof f.value === 'number';
    const txt = `data#>>'${path}'`;
    const js = `data#>'${path}'`;

    switch (f.op) {
      case '==':
        if (f.value === null) clauses.push(`${txt} IS NULL`);
        else if (isNum || typeof f.value === 'boolean') { clauses.push(`${js} = $${params.length + 1}::jsonb`); params.push(JSON.stringify(f.value)); }
        else { clauses.push(`${txt} = $${params.length + 1}`); params.push(String(f.value)); }
        break;
      case '!=':
        if (isNum || typeof f.value === 'boolean') { clauses.push(`${js} <> $${params.length + 1}::jsonb`); params.push(JSON.stringify(f.value)); }
        else { clauses.push(`${txt} <> $${params.length + 1}`); params.push(String(f.value)); }
        break;
      case '>': case '>=': case '<': case '<=':
        if (isNum) { clauses.push(`(${txt})::numeric ${f.op} $${params.length + 1}`); params.push(f.value); }
        else { clauses.push(`${txt} ${f.op} $${params.length + 1}`); params.push(String(f.value)); }
        break;
      case 'in': {
        const vals = (Array.isArray(f.value) ? f.value : [f.value]).map(String);
        clauses.push(`${txt} = ANY($${params.length + 1}::text[])`);
        params.push(vals);
        break;
      }
      case 'not-in': {
        const vals = (Array.isArray(f.value) ? f.value : [f.value]).map(String);
        clauses.push(`NOT (${txt} = ANY($${params.length + 1}::text[]))`);
        params.push(vals);
        break;
      }
      case 'array-contains':
        clauses.push(`${js} @> $${params.length + 1}::jsonb`);
        params.push(JSON.stringify(f.value));
        break;
      case 'array-contains-any': {
        const vals = (Array.isArray(f.value) ? f.value : [f.value]).map(String);
        clauses.push(`${js} ?| $${params.length + 1}::text[]`);
        params.push(vals);
        break;
      }
      default:
        throw new Error('unsupported op: ' + f.op);
    }
  }

  if (startAfter && orderField) {
    const path = jsonbPath(orderField);
    const cmp = orderDir === 'desc' ? '<' : '>';
    clauses.push(`data#>>'${path}' ${cmp} $${params.length + 1}`);
    params.push(String(startAfter));
  }

  return { where: clauses.join(' AND '), params };
}

app.post('/api/data/:collection/query', optionalAuth, async (req, res) => {
  try {
    const col = req.params.collection;
    if (!req.user && !isPublicRead(col)) {
      return res.status(401).json({ error: 'unauthenticated', code: 'auth/unauthenticated' });
    }
    const { filters = [], orderBy = [], limit: lim = null, startAfter = null } = req.body || {};

    const orderField = orderBy.length ? orderBy[0].field : null;
    const orderDir = orderBy.length ? (orderBy[0].direction === 'desc' ? 'desc' : 'asc') : 'asc';
    const { where, params } = buildWhere(col, filters, startAfter, orderField, orderDir);

    let sql = `SELECT id, data FROM documents WHERE ${where}`;
    for (const o of orderBy) {
      if (!SAFE_FIELD.test(o.field)) throw new Error('bad orderBy field');
      sql += ` ORDER BY data#>>'${jsonbPath(o.field)}' ${o.direction === 'desc' ? 'DESC' : 'ASC'} NULLS LAST`;
    }
    if (!orderBy.length) sql += ' ORDER BY created_at DESC';
    if (lim) { sql += ` LIMIT $${params.length + 1}`; params.push(Math.min(parseInt(lim, 10) || 50, 1000)); }

    const r = await pool.query(sql, params);
    const stripUsers = topCollection(col) === 'users' && (!req.user || req.user.role !== 'admin');
    res.json({ docs: r.rows.map(row => ({ id: row.id, data: stripUsers ? publicUserData(row.data) : row.data })) });
  } catch (e) {
    console.error('query error', e.message);
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/data/:collection/:id', optionalAuth, async (req, res) => {
  const col = req.params.collection;
  if (!req.user && !isPublicRead(col)) {
    return res.status(401).json({ error: 'unauthenticated', code: 'auth/unauthenticated' });
  }
  const r = await pool.query(
    'SELECT id, data FROM documents WHERE collection=$1 AND id=$2',
    [col, req.params.id]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  const isAdmin = req.user && req.user.role === 'admin';
  const isSelf = req.user && req.user.uid === req.params.id;
  const data = (topCollection(col) === 'users' && !isAdmin && !isSelf)
    ? publicUserData(r.rows[0].data)
    : r.rows[0].data;
  res.json({ id: r.rows[0].id, data });
});

app.post('/api/data/:collection', auth, async (req, res) => {
  try {
    const col = req.params.collection;
    if ((isAdminWrite(col) || topCollection(col) === 'users') && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin only', code: 'auth/forbidden' });
    }
    const data = expandOps(req.body.data || req.body || {});
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO documents (id, collection, data) VALUES ($1,$2,$3)',
      [id, req.params.collection, JSON.stringify(data)]
    );
    res.json({ id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

function stripRestricted(collection, data, user) {
  if (collection !== 'users') return data;
  const out = { ...data };
  if (user.role !== 'admin') {
    // privileged fields are admin-controlled; 'role' itself is handled by caller
    delete out.isVerified;
    delete out.permissions;
    delete out.isActive;
  }
  return out;
}

app.put('/api/data/:collection/:id', auth, async (req, res) => {
  try {
    const col = req.params.collection;
    if (isAdminWrite(col) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin only', code: 'auth/forbidden' });
    }
    const merge = !!(req.body && req.body.merge);
    let incoming = expandOps((req.body && req.body.data) || {});

    const cur = await pool.query('SELECT data FROM documents WHERE collection=$1 AND id=$2', [col, req.params.id]);
    const isCreate = !cur.rowCount;
    if (isCreate) {
      // Guard: never let a write to collection A overwrite/move a doc that lives in collection B
      const exists = await pool.query('SELECT collection FROM documents WHERE id=$1', [req.params.id]);
      if (exists.rowCount && exists.rows[0].collection !== col) {
        return res.status(409).json({ error: 'id belongs to another collection', code: 'data/id-conflict' });
      }
    }
    incoming = stripRestricted(topCollection(col), incoming, req.user);
    // 'admin' role only assignable by an admin, or when no admin exists yet (bootstrap)
    if (incoming.role === 'admin' && req.user.role !== 'admin' && (await adminCount()) > 0) {
      delete incoming.role;
    }
    // non-admins may only write their own user document
    if (topCollection(col) === 'users' && req.user.role !== 'admin' && req.params.id !== req.user.uid) {
      return res.status(403).json({ error: 'cannot modify other users' });
    }
    if (topCollection(col) === 'users' && isCreate && !('role' in incoming)) incoming.role = 'learner';

    const data = (merge && cur.rowCount) ? { ...cur.rows[0].data, ...incoming } : incoming;
    const now = new Date().toISOString();
    if (isCreate && data.createdAt === undefined) data.createdAt = now;
    data.updatedAt = now;

    await pool.query(
      `INSERT INTO documents (id, collection, data) VALUES ($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET data=$3, updated_at=now()`,
      [req.params.id, col, JSON.stringify(data)]
    );
    res.json({ id: req.params.id });
  } catch (e) {
    console.error('put error', e.message);
    res.status(400).json({ error: e.message });
  }
});

app.patch('/api/data/:collection/:id', auth, async (req, res) => {
  try {
    const col = req.params.collection;
    if (isAdminWrite(col) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'admin only', code: 'auth/forbidden' });
    }
    let updates = (req.body && req.body.updates) || {};
    updates = stripRestricted(topCollection(col), updates, req.user);
    // non-admins may only patch their own user document, and may never grant 'admin'
    if (topCollection(col) === 'users' && req.user.role !== 'admin') {
      if (req.params.id !== req.user.uid) {
        return res.status(403).json({ error: 'cannot modify other users' });
      }
      if (updates.role === 'admin') delete updates.role;
    }
    const ok = await applyUpdates(req.params.id, col, updates);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.json({ id: req.params.id });
  } catch (e) {
    console.error('patch error', e.message);
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/data/:collection/:id', auth, async (req, res) => {
  const col = req.params.collection;
  if (topCollection(col) === 'auth_users') return res.status(403).json({ error: 'forbidden' });
  if ((topCollection(col) === 'users' || isAdminWrite(col)) && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  await pool.query('DELETE FROM documents WHERE collection=$1 AND id=$2', [col, req.params.id]);
  res.json({ ok: true });
});

// ---------- file uploads ----------
const UPLOAD_ALLOWED_EXT = new Set([
  'pdf', 'doc', 'docx', 'epub', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'rtf', 'odt',
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
  'mp3', 'mp4', 'webm', 'm4a', 'wav', 'ogg', 'mov'
]);

// Strip traversal/empties from a client-supplied relative path.
const sanitizeRelPath = (p) =>
  String(p || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter((seg) => seg && seg !== '..' && seg !== '.')
    .join('/');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Files land under uploads/<uid>/... so users can't clobber each other.
    const rel = sanitizeRelPath(req.body.path || file.originalname || 'file') || 'file';
    const final = `${req.user.uid}/${rel}`;
    const dir = path.dirname(path.join(UPLOAD_DIR, final));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, final);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.post('/api/upload', auth, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'upload failed' });
    if (!req.file) return res.status(400).json({ error: 'file/path required' });
    const ext = (req.file.originalname.split('.').pop() || '').toLowerCase();
    if (!UPLOAD_ALLOWED_EXT.has(ext)) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ error: `file type .${ext} not allowed`, code: 'upload/bad-type' });
    }
    const p = req.file.filename;
    res.json({ path: p, url: '/uploads/' + p });
  });
});

app.delete('/api/upload', auth, (req, res) => {
  const p = sanitizeRelPath(req.query.path);
  if (!p) return res.status(400).json({ error: 'path required' });
  const full = path.join(UPLOAD_DIR, p);
  if (!full.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: 'bad path' });
  // Users may only delete their own files; admins may delete anything.
  if (req.user.role !== 'admin' && !p.startsWith(req.user.uid + '/')) {
    return res.status(403).json({ error: 'not your file', code: 'auth/forbidden' });
  }
  fs.unlink(full, (err) => {
    if (err) return res.status(err.code === 'ENOENT' ? 404 : 500).json({ error: 'file not found' });
    res.json({ ok: true });
  });
});

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', fallthrough: false }));

// ---------- translation (Groq primary, Google fallback, Postgres cache) ----------
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || '';
const TRANSLATE_MODEL = process.env.TRANSLATE_MODEL || 'openai/gpt-oss-120b';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GOOGLE_URL = 'https://translation.googleapis.com/language/translate/v2';
const T_MAX_TEXTS = 200;
const T_MAX_CHARS = 6000;

const tHash = (text, source, target) =>
  crypto.createHash('sha256').update(`${target}|${source}|${text}`).digest('hex');

async function translateCacheGet(texts, source, target) {
  const ids = texts.map((t) => tHash(t, source, target));
  const r = await pool.query(
    'SELECT id, translated_text FROM translations WHERE id = ANY($1)', [ids]
  );
  const map = new Map(r.rows.map((row) => [row.id, row.translated_text]));
  return texts.map((t) => map.get(tHash(t, source, target)) || null);
}

async function translateCachePut(texts, results, source, target) {
  const inserts = [];
  for (let i = 0; i < texts.length; i++) {
    if (results[i] && results[i] !== texts[i]) {
      inserts.push([tHash(texts[i], source, target), source, target, texts[i], results[i]]);
    }
  }
  for (const row of inserts) {
    await pool.query(
      `INSERT INTO translations (id, source_lang, target_lang, source_text, translated_text)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`,
      row
    ).catch((e) => console.warn('translation cache write failed:', e.message));
  }
}

// Split into groups: ≤12 segments or ≤2800 chars per call
function chunkForTranslation(texts) {
  const groups = [];
  let cur = [], curLen = 0;
  for (const t of texts) {
    if (cur.length >= 12 || curLen + t.length > 2800) {
      groups.push(cur); cur = []; curLen = 0;
    }
    cur.push(t); curLen += t.length;
  }
  if (cur.length) groups.push(cur);
  return groups;
}

function parseNumberedSegments(output, expected) {
  const parts = output.split(/«(\d+)»/);
  const out = [];
  for (let i = 1; i < parts.length - 1; i += 2) {
    const n = parseInt(parts[i], 10);
    if (n >= 1 && n <= expected) out[n - 1] = parts[i + 1].trim();
  }
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Single entry point for Groq calls — retries 429s and transient 5xx,
// honoring Retry-After so document translation survives rate limits.
async function fetchGroq(messages, { maxTokens, retries = 4 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: TRANSLATE_MODEL,
        temperature: 0.1,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
        messages
      })
    });
    if (resp.ok) return resp.json();
    const errText = await resp.text().catch(() => '');
    const retryable = resp.status === 429 || resp.status >= 500;
    if (!retryable || attempt >= retries) {
      throw new Error(`Groq ${resp.status}: ${errText.slice(0, 200)}`);
    }
    const ra = parseFloat(resp.headers.get('retry-after') || '');
    await sleep(Math.min(Number.isFinite(ra) ? ra * 1000 : 2000 * (attempt + 1), 30000));
  }
}

async function groqTranslateGroup(group, source, target) {
  const numbered = group.map((t, i) => `«${i + 1}» ${t}`).join('\n');
  const data = await fetchGroq([
    {
      role: 'system',
      content: 'You are a professional translation engine. The user sends text segments marked «N». Translate every segment into the requested language faithfully, preserving meaning and tone. Keep each «N» marker exactly as given. Output only the translated segments, nothing else.'
    },
    {
      role: 'user',
      content: `Translate to language "${target}"${source && source !== 'auto' ? ` from "${source}"` : ''}:\n\n${numbered}`
    }
  ], { maxTokens: 4000 });
  const output = data.choices?.[0]?.message?.content || '';
  const parsed = parseNumberedSegments(output, group.length);
  if (parsed.filter(Boolean).length < group.length) {
    // Segment markers dropped — fall back to per-text calls
    return Promise.all(group.map((t) => groqSingle(t, source, target)));
  }
  return parsed;
}

async function groqSingle(text, source, target) {
  const data = await fetchGroq([
    { role: 'system', content: 'You are a professional translation engine. Output only the translated text, no commentary, no quotes.' },
    { role: 'user', content: `Translate to language "${target}"${source && source !== 'auto' ? ` from "${source}"` : ''}:\n\n${text}` }
  ]);
  return (data.choices?.[0]?.message?.content || '').trim() || text;
}

async function groqTranslate(texts, source, target) {
  const groups = chunkForTranslation(texts);
  const results = [];
  for (const g of groups) results.push(...await groqTranslateGroup(g, source, target));
  return results;
}

async function googleTranslate(texts, source, target) {
  const params = new URLSearchParams({ target, format: 'text', key: GOOGLE_TRANSLATE_API_KEY });
  if (source && source !== 'auto') params.set('source', source);
  for (const t of texts) params.append('q', t);
  const resp = await fetch(`${GOOGLE_URL}?${params}`, { method: 'POST' });
  if (!resp.ok) throw new Error(`Google Translate ${resp.status}`);
  const data = await resp.json();
  const list = data?.data?.translations || [];
  return texts.map((t, i) => list[i]?.translatedText || t);
}

async function detectLanguage(text) {
  if (GOOGLE_TRANSLATE_API_KEY) {
    try {
      const params = new URLSearchParams({ q: text.slice(0, 500), key: GOOGLE_TRANSLATE_API_KEY });
      const resp = await fetch(`${GOOGLE_URL}/detect?${params}`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        const lang = data?.data?.detections?.[0]?.[0]?.language;
        if (lang) return lang;
      }
    } catch { /* fall through to Groq */ }
  }
  if (GROQ_API_KEY) {
    try {
      const resp = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: TRANSLATE_MODEL,
          temperature: 0,
          max_tokens: 10,
          messages: [
            { role: 'system', content: 'Identify the language of the text. Reply with only the ISO 639-1 language code (e.g. en, fr, yo). Nothing else.' },
            { role: 'user', content: text.slice(0, 500) }
          ]
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        const lang = (data.choices?.[0]?.message?.content || '').trim().toLowerCase();
        if (/^[a-z]{2}(-[a-z]+)?$/.test(lang)) return lang;
      }
    } catch { /* ignore */ }
  }
  return 'en';
}

app.post('/api/translate', auth, async (req, res) => {
  try {
    const { texts, q, source = 'auto', target, detect } = req.body || {};

    // Language detection mode
    if (typeof detect === 'string' && detect.trim()) {
      return res.json({ language: await detectLanguage(detect) });
    }

    const list = Array.isArray(texts)
      ? texts.map((t) => String(t).slice(0, T_MAX_CHARS))
      : (typeof q === 'string' ? [q.slice(0, T_MAX_CHARS)] : null);

    if (!list || !list.length || !target) {
      return res.status(400).json({ error: 'texts/q and target required' });
    }
    if (list.length > T_MAX_TEXTS) {
      return res.status(400).json({ error: `max ${T_MAX_TEXTS} texts per request` });
    }
    if (!GROQ_API_KEY && !GOOGLE_TRANSLATE_API_KEY) {
      return res.status(503).json({ error: 'no translation provider configured', code: 'translate/unavailable' });
    }
    if (target === source) {
      return res.json(texts ? { translations: list } : { translatedText: list[0] });
    }

    // Cache lookup
    let results;
    try {
      results = await translateCacheGet(list, source, target);
    } catch (e) {
      console.warn('translation cache read failed:', e.message);
      results = list.map(() => null);
    }
    const missingIdx = results.map((r, i) => (r === null ? i : -1)).filter((i) => i >= 0);

    if (missingIdx.length) {
      const missing = missingIdx.map((i) => list[i]);
      let translated;
      let providerErr = null;
      if (GROQ_API_KEY) {
        try {
          translated = await groqTranslate(missing, source, target);
        } catch (e) { providerErr = e; }
      }
      if (!translated && GOOGLE_TRANSLATE_API_KEY) {
        try {
          translated = await googleTranslate(missing, source, target);
        } catch (e) { providerErr = e; }
      }
      if (!translated) {
        console.error('translation failed:', providerErr);
        return res.status(502).json({ error: 'translation provider failed', detail: providerErr?.message });
      }
      missingIdx.forEach((idx, k) => { results[idx] = translated[k] || list[idx]; });
      translateCachePut(missing, missingIdx.map((i) => results[i]), source, target).catch(() => {});
    }

    res.json(texts ? { translations: results } : { translatedText: results[0] });
  } catch (e) {
    console.error('translate error', e);
    res.status(500).json({ error: e.message });
  }
});

// ---------- AI assistant proxy (Groq; key stays server-side) ----------
const AI_SYSTEM_PROMPT = `You are ATRC Assistant, an intelligent AI helper for the African Traditional Rulers Council (ATRC) digital platform. You help traditional rulers, chiefs, elders, and community members navigate the platform and accomplish their tasks.

PLATFORM FEATURES: dashboard with stats and live meetings, community management, dispute resolution with evidence upload, events and announcements, reports & analytics, a digital library (PDF/DOCX/EPUB books with translation into 40+ languages), video courses with quizzes and certificates, user profile & settings.

USER ROLES: admin (full access, user management), ruler (community leadership, disputes), chief (community management, events), elder (dispute mediation, guidance), learner/member (basic access).

STYLE: respectful, warm, professional. Use clear, simple language. Acknowledge traditional titles and cultural context. Provide concise, actionable guidance.`;

app.post('/api/ai/chat', auth, async (req, res) => {
  try {
    if (!GROQ_API_KEY) {
      return res.status(503).json({ error: 'AI provider not configured', code: 'ai/unavailable' });
    }
    const { message, history = [], context = {} } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'message required' });
    }

    let system = AI_SYSTEM_PROMPT;
    if (context.currentPage) system += `\nThe user is currently on the "${context.currentPage}" page.`;
    if (context.userRole) system += `\nUser role: ${context.userRole}.`;
    if (context.userName) system += `\nUser name: ${context.userName}.`;

    const messages = [
      { role: 'system', content: system },
      ...history.slice(-12).map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) })),
      { role: 'user', content: String(message).slice(0, 2000) }
    ];

    const resp = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: TRANSLATE_MODEL, temperature: 0.7, max_tokens: 1500, messages })
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      console.error('AI chat provider error:', resp.status, t.slice(0, 200));
      return res.status(502).json({ error: 'AI provider failed' });
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content || '';
    res.json({ reply });
  } catch (e) {
    console.error('ai chat error', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

initDb()
  .then(() => app.listen(PORT, '127.0.0.1', () => console.log(`ATRC API listening on 127.0.0.1:${PORT}`)))
  .catch(e => { console.error('DB init failed', e); process.exit(1); });
