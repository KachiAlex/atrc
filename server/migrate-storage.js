// One-off: download Firebase Storage files referenced in migrated documents
// and rewrite their URLs to /uploads/migrated/<name> served by the app.
// Usage: DATABASE_URL=... node migrate-storage.js <serviceAccount.json>
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { Pool } = require('pg');

const saPath = process.argv[2];
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/lib/atrc/uploads';
const OUT_DIR = path.join(UPLOAD_DIR, 'migrated');
fs.mkdirSync(OUT_DIR, { recursive: true });

const sa = require(path.resolve(saPath));
const certFn = admin.cert || (admin.credential && admin.credential.cert);
admin.initializeApp({ credential: certFn(sa), storageBucket: sa.project_id + '.firebasestorage.app' });
const bucket = getStorage().bucket();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FS_URL = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/([^?]+)\?[^"'\s]*/g;

function findUrls(v, out = []) {
  if (typeof v === 'string') {
    FS_URL.lastIndex = 0;
    let m; while ((m = FS_URL.exec(v))) out.push({ full: m[0], objPath: decodeURIComponent(m[1]) });
  } else if (Array.isArray(v)) v.forEach(x => findUrls(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => findUrls(x, out));
  return out;
}

(async () => {
  const { rows } = await pool.query('SELECT id, collection, data FROM documents');
  let files = 0, urls = 0, errors = 0;
  for (const row of rows) {
    const found = findUrls(row.data);
    if (!found.length) continue;
    let dataStr = JSON.stringify(row.data);
    for (const f of found) {
      try {
        const fname = f.objPath.split('/').pop() || 'file';
        const dest = path.join(OUT_DIR, fname);
        if (!fs.existsSync(dest)) {
          await bucket.file(f.objPath).download({ destination: dest });
          files++;
        }
        const newUrl = `/uploads/migrated/${encodeURIComponent(fname)}`;
        dataStr = dataStr.split(f.full).join(newUrl);
        urls++;
        console.log(`OK  ${f.objPath} -> ${newUrl}`);
      } catch (e) {
        errors++;
        console.log(`ERR ${f.objPath}: ${e.message}`);
      }
    }
    await pool.query('UPDATE documents SET data=$1::jsonb, updated_at=now() WHERE id=$2', [dataStr, row.id]);
  }
  console.log(`\nfiles downloaded: ${files} | urls rewritten: ${urls} | errors: ${errors}`);
  await pool.end();
  process.exit(0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
