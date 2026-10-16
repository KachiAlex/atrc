// Firebase-Auth-compatible shim backed by the ATRC API (JWT + Postgres).
import { api, getToken, setToken } from './client';

const listeners = new Set();
let currentUser = null;
let loaded = false;
let loadingPromise = null;

function makeUser(u) {
  if (!u) return null;
  return {
    ...u,
    uid: u.uid,
    emailVerified: !!u.emailVerified,
    getIdToken: async () => getToken(),
    toJSON: () => u
  };
}

async function loadUser() {
  if (!getToken()) {
    currentUser = null;
    loaded = true;
    return;
  }
  try {
    const res = await api('/auth/me');
    currentUser = makeUser(res.user);
  } catch {
    setToken(null);
    currentUser = null;
  }
  loaded = true;
}

function notify() {
  for (const cb of listeners) {
    try { cb(currentUser); } catch (e) { console.error('auth listener error', e); }
  }
}

function ensureLoaded() {
  if (!loadingPromise) {
    loadingPromise = loadUser().finally(() => { loadingPromise = null; });
  }
  return loadingPromise.then(notify);
}

export const auth = {
  get currentUser() { return currentUser; }
};

export function getAuth() { return auth; }

export function onAuthStateChanged(_auth, cb) {
  listeners.add(cb);
  if (loaded) cb(currentUser);
  else ensureLoaded();
  return () => listeners.delete(cb);
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  const res = await api('/auth/login', { method: 'POST', body: { email, password } });
  setToken(res.token);
  currentUser = makeUser(res.user);
  notify();
  return { user: currentUser };
}

export async function createUserWithEmailAndPassword(_auth, email, password) {
  const res = await api('/auth/register', { method: 'POST', body: { email, password } });
  setToken(res.token);
  currentUser = makeUser(res.user);
  notify();
  return { user: currentUser };
}

export async function signOut(_auth) {
  try { await api('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  setToken(null);
  currentUser = null;
  notify();
}

export async function updateProfile(user, profile) {
  await api('/auth/update-profile', { method: 'POST', body: profile });
  if (currentUser) Object.assign(currentUser, profile);
}

export async function sendPasswordResetEmail(_auth, email) {
  await api('/auth/reset-password', { method: 'POST', body: { email } });
}

export async function updatePassword(_user, newPassword, currentPassword) {
  await api('/auth/change-password', { method: 'POST', body: { newPassword, currentPassword } });
}
