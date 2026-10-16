// Shared HTTP client + token store for the self-hosted ATRC API.

const TOKEN_KEY = 'atrc_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code || 'api/error';
    this.status = status;
  }
}

export async function api(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: formData || (body !== undefined ? JSON.stringify(body) : undefined)
  });

  let payload = null;
  try { payload = await res.json(); } catch { /* non-json */ }

  if (!res.ok) {
    const err = new ApiError(
      (payload && (payload.error || payload.message)) || `Request failed: ${res.status}`,
      payload && payload.code,
      res.status
    );
    throw err;
  }
  return payload;
}
