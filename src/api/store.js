// Firestore-compatible shim backed by the ATRC Postgres API.
// Replicates the firebase/firestore call signatures used across the app so
// existing code keeps working without the firebase dependency.
import { api } from './client';

export const getFirestore = () => db;
export const db = {}; // sentinel — the API server owns persistence

// ---- refs ----
function joinPath(parts) {
  return parts.filter(p => p !== undefined && p !== null && p !== '').join('/');
}

export function collection(_db, ...segments) {
  return { type: 'collection', path: joinPath(segments) };
}

export function doc(refOrDb, ...segments) {
  if (refOrDb && refOrDb.type === 'collection') {
    const parts = refOrDb.path.split('/').concat(segments);
    return { type: 'doc', collection: parts.slice(0, -1).join('/'), id: parts[parts.length - 1] };
  }
  // doc(db, 'collection', 'id' [, 'sub', 'subId'])
  const path = joinPath(segments);
  const parts = path.split('/');
  return { type: 'doc', collection: parts.slice(0, -1).join('/'), id: parts[parts.length - 1] };
}

// ---- query modifiers ----
export function where(field, op, value) { return { kind: 'where', field, op, value }; }
export function orderBy(field, direction = 'asc') { return { kind: 'orderBy', field, direction }; }
export function limit(n) { return { kind: 'limit', value: n }; }
export function limitToLast(n) { return { kind: 'limitToLast', value: n }; }
export function startAfter(v) { return { kind: 'startAfter', value: v }; }
export function startAt(v) { return { kind: 'startAt', value: v }; }
export function endBefore(v) { return { kind: 'endBefore', value: v }; }

export function query(ref, ...mods) {
  const q = { ...ref };
  for (const m of mods) {
    if (!m) continue;
    if (m.kind === 'where') (q.filters = q.filters || []).push({ field: m.field, op: m.op, value: m.value });
    else if (m.kind === 'orderBy') (q.orderBy = q.orderBy || []).push({ field: m.field, direction: m.direction });
    else if (m.kind === 'limit') q.limit = m.value;
    else if (m.kind === 'startAfter') q.startAfter = m.value;
    else if (m.kind === 'startAt') q.startAt = m.value;
  }
  return q;
}

// ---- snapshots ----
export class DocSnap {
  constructor(collection, id, data) {
    this.ref = { type: 'doc', collection, id };
    this.id = id;
    this._data = data;
  }
  exists() { return this._data != null; }
  data() { return this._data || undefined; }
}

export class QuerySnap {
  constructor(collection, rows) {
    this.docs = rows.map(r => new DocSnap(collection, r.id, r.data));
    this.empty = this.docs.length === 0;
    this.size = this.docs.length;
  }
  forEach(fn) { this.docs.forEach(fn); }
}

function resolveCursor(q) {
  if (!q.startAfter && !q.startAt) return null;
  const marker = q.startAfter || q.startAt;
  if (marker && marker instanceof DocSnap) {
    const field = q.orderBy && q.orderBy.length ? q.orderBy[0].field : 'createdAt';
    const d = marker.data();
    return d ? d[field] : null;
  }
  return marker;
}

// ---- reads ----
export async function getDocs(q) {
  const body = {
    filters: q.filters || [],
    orderBy: q.orderBy || [],
    limit: q.limit || null,
    startAfter: resolveCursor(q)
  };
  const res = await api(`/data/${encodeURIComponent(q.path)}/query`, { method: 'POST', body });
  return new QuerySnap(q.path, res.docs || []);
}

export async function getDoc(docRef) {
  try {
    const res = await api(`/data/${encodeURIComponent(docRef.collection)}/${encodeURIComponent(docRef.id)}`);
    return new DocSnap(docRef.collection, res.id, res.data);
  } catch (e) {
    if (e.status === 404) return new DocSnap(docRef.collection, docRef.id, null);
    throw e;
  }
}

// ---- writes ----
export async function addDoc(colRef, data) {
  const res = await api(`/data/${encodeURIComponent(colRef.path)}`, { method: 'POST', body: { data } });
  return { id: res.id, type: 'doc', collection: colRef.path };
}

export async function setDoc(docRef, data, options) {
  await api(`/data/${encodeURIComponent(docRef.collection)}/${encodeURIComponent(docRef.id)}`, {
    method: 'PUT',
    body: { data, merge: !!(options && options.merge) }
  });
}

export async function updateDoc(docRef, updates) {
  await api(`/data/${encodeURIComponent(docRef.collection)}/${encodeURIComponent(docRef.id)}`, {
    method: 'PATCH',
    body: { updates }
  });
}

export async function deleteDoc(docRef) {
  await api(`/data/${encodeURIComponent(docRef.collection)}/${encodeURIComponent(docRef.id)}`, { method: 'DELETE' });
}

// ---- realtime (polled) ----
const POLL_MS = 6000;

export function onSnapshot(ref, onNext, onError) {
  let stopped = false;
  const fire = async () => {
    try {
      const snap = ref.type === 'doc' ? await getDoc(ref) : await getDocs(ref);
      if (!stopped) onNext(snap);
    } catch (e) {
      if (!stopped && onError) onError(e);
    }
  };
  fire();
  const iv = setInterval(fire, POLL_MS);
  return () => { stopped = true; clearInterval(iv); };
}

// ---- field value sentinels (encoded for the API to expand) ----
export function serverTimestamp() { return { __fs: 'serverTimestamp' }; }
export function increment(n) { return { __fs: 'increment', by: n }; }
export function arrayUnion(...values) { return { __fs: 'arrayUnion', values }; }
export function arrayRemove(...values) { return { __fs: 'arrayRemove', values }; }
export function deleteField() { return { __fs: 'delete' }; }

// Minimal Timestamp for compatibility (dates are stored as ISO strings).
export class Timestamp {
  constructor(seconds, nanoseconds = 0) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }
  toDate() { return new Date(this.seconds * 1000 + this.nanoseconds / 1e6); }
  toMillis() { return this.seconds * 1000 + this.nanoseconds / 1e6; }
  static now() { return Timestamp.fromDate(new Date()); }
  static fromDate(d) { return new Timestamp(Math.floor(d.getTime() / 1000), (d.getTime() % 1000) * 1e6); }
  static fromMillis(ms) { return Timestamp.fromDate(new Date(ms)); }
}
