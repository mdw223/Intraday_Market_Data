const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// <T> is a cast, not validation
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Try to read the JSON error body from the backend (e.g. { error: "Invalid symbol..." })
    // Fall back to the HTTP status text if the body is not JSON or has no message
    try {
      const body = await res.json() as { error?: string; message?: string };
      const message = body.error ?? body.message ?? `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(message);
    } catch (parseErr) {
      if (parseErr instanceof Error && !parseErr.message.startsWith('HTTP')) throw parseErr;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  }
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string) =>
    // retruns a promise<MyType> (async) that resolves to the response body as MyType
    fetch(`${BASE_URL}${path}`, { credentials: 'include' }).then(r => handleResponse<T>(r)),

  post: <T>(path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),

    put: <T>(path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),
    
    delete: <T>(path: string) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(r => handleResponse<T>(r)),
    
    patch: <T>(path: string, body: unknown) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => handleResponse<T>(r)),
};