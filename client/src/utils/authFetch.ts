/**
 * Authenticated fetch wrapper that automatically handles token expiration
 *
 * Usage:
 *   import { authFetch } from '@/utils/authFetch';
 *   const response = await authFetch('/api/endpoint', { method: 'POST', ... });
 *
 * When the server returns 401 (token expired), this will:
 * 1. Trigger the global logout callback
 * 2. Clear user session
 * 3. Redirect to login
 */

// Global logout callback - will be set by AuthContext
let globalLogoutCallback: (() => void) | null = null;

export function setGlobalLogoutCallback(callback: () => void) {
  globalLogoutCallback = callback;
}

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  // Check for 401 Unauthorized (token expired)
  if (response.status === 401) {
    console.warn('Token expired - logging out user');

    // Trigger global logout
    if (globalLogoutCallback) {
      globalLogoutCallback();
    } else {
      // Fallback if callback not set yet
      console.error('Logout callback not set - clearing localStorage manually');
      localStorage.removeItem('user');
      window.location.href = '/';
    }

    // Return the 401 response so calling code can handle it if needed
    return response;
  }

  return response;
}
