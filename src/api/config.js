// Drop-in replacement for the old ../firebase/config module.
// Nothing here talks to Google — it just re-exports the API-backed shims.
import { auth } from './auth';
import { db } from './store';
import { storage } from './storage';

const functions = null; // Cloud Functions removed — use /api endpoints instead
const analytics = null;

export { auth, db, storage, functions, analytics };
export default {};
