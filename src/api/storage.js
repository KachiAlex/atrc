// Firebase-Storage-compatible shim backed by the ATRC API + nginx /uploads.
import { api, getToken } from './client';

export const getStorage = () => storage;
export const storage = {}; // sentinel

export function ref(_storage, path) {
  return { fullPath: path, name: path.split('/').pop() };
}

export async function uploadBytes(refObj, file) {
  const fd = new FormData();
  fd.append('path', refObj.fullPath);
  fd.append('file', file, refObj.name || 'file');

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: fd
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new Error((payload && payload.error) || `Upload failed: ${res.status}`);
  return { ref: { fullPath: payload.path }, metadata: { fullPath: payload.path } };
}

export function getDownloadURL(refObj) {
  const p = refObj && refObj.fullPath ? refObj.fullPath : String(refObj);
  return Promise.resolve(`/uploads/${p.replace(/^\/+/, '')}`);
}

export async function deleteObject(refObj) {
  const p = refObj && refObj.fullPath ? refObj.fullPath : String(refObj);
  await api(`/upload?path=${encodeURIComponent(p)}`, { method: 'DELETE' });
}
