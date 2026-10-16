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
app.post('/api/auth/register', async (req, res) => {
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

app.post('/api/auth/login', async (req, res) => {
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

app.post('/api/auth/logout', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ error: 'new password too short', code: 'auth/weak-password' });
    }
    const u = await pool.query('SELECT password_hash FROM auth_users WHERE uid=$1', [req.user.uid]);
    if (!u.rowCount) return res.status(404).json({ error: 'user not found' });

    if (currentPassword) {
      const ok = await bcrypt.compare(String(currentPassword), u.rows[0].password_hash);
      if (!ok) return res.status(401).json({ error: 'wrong password', code: 'auth/wrong-password' });
    }
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

app.post('/api/data/:collection/query', auth, async (req, res) => {
  try {
    const col = req.params.collection;
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
    res.json({ docs: r.rows.map(row => ({ id: row.id, data: row.data })) });
  } catch (e) {
    console.error('query error', e.message);
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/data/:collection/:id', auth, async (req, res) => {
  const r = await pool.query(
    'SELECT id, data FROM documents WHERE collection=$1 AND id=$2',
    [req.params.collection, req.params.id]
  );
  if (!r.rowCount) return res.status(404).json({ error: 'not found' });
  res.json({ id: r.rows[0].id, data: r.rows[0].data });
});

app.post('/api/data/:collection', auth, async (req, res) => {
  try {
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
    const merge = !!(req.body && req.body.merge);
    let incoming = expandOps((req.body && req.body.data) || {});

    const cur = await pool.query('SELECT data FROM documents WHERE collection=$1 AND id=$2', [col, req.params.id]);
    const isCreate = !cur.rowCount;
    incoming = stripRestricted(col, incoming, req.user);
    // 'admin' role only assignable by an admin, or when no admin exists yet (bootstrap)
    if (incoming.role === 'admin' && req.user.role !== 'admin' && (await adminCount()) > 0) {
      delete incoming.role;
    }
    // non-admins may only write their own user document
    if (col === 'users' && req.user.role !== 'admin' && req.params.id !== req.user.uid) {
      return res.status(403).json({ error: 'cannot modify other users' });
    }
    if (col === 'users' && isCreate && !('role' in incoming)) incoming.role = 'learner';

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
    let updates = (req.body && req.body.updates) || {};
    updates = stripRestricted(col, updates, req.user, false);
    const ok = await applyUpdates(req.params.id, col, updates);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.json({ id: req.params.id });
  } catch (e) {
    console.error('patch error', e.message);
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/data/:collection/:id', auth, async (req, res) => {
  if (req.params.collection === 'users' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  if (req.params.collection === 'auth_users') return res.status(403).json({ error: 'forbidden' });
  await pool.query('DELETE FROM documents WHERE collection=$1 AND id=$2', [req.params.collection, req.params.id]);
  res.json({ ok: true });
});

// ---------- file uploads ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const reqPath = String(req.body.path || file.originalname || 'file').replace(/\.\./g, '').replace(/^\/+/, '');
    const dir = path.dirname(path.join(UPLOAD_DIR, reqPath));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, reqPath);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

app.post('/api/upload', auth, upload.single('file'), (req, res) => {
  const p = String((req.body && req.body.path) || (req.file && req.file.filename) || '').replace(/\.\./g, '').replace(/^\/+/, '');
  if (!p || !req.file) return res.status(400).json({ error: 'file/path required' });
  res.json({ path: p, url: '/uploads/' + p });
});

app.delete('/api/upload', auth, (req, res) => {
  const p = String(req.query.path || '').replace(/\.\./g, '').replace(/^\/+/, '');
  if (!p) return res.status(400).json({ error: 'path required' });
  const full = path.join(UPLOAD_DIR, p);
  if (!full.startsWith(UPLOAD_DIR)) return res.status(400).json({ error: 'bad path' });
  fs.unlink(full, () => res.json({ ok: true }));
});

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', fallthrough: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

initDb()
  .then(() => app.listen(PORT, '127.0.0.1', () => console.log(`ATRC API listening on 127.0.0.1:${PORT}`)))
  .catch(e => { console.error('DB init failed', e); process.exit(1); });
