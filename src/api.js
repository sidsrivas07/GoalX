/**
 * api.js
 * Central utility for executing authenticated requests against our backend.
 * Compatible with standard web browsers and capacitor-wrapped APKs.
 */
// 172.16.85.99 is the specific local IP address of your Windows computer.
// This allows the Android APK to access your local backend over Wi-Fi.
// Update this URL with your actual Render deployment link once the backend is live!
const API_URL = import.meta.env.VITE_API_URL || 'https://goalx-backend.onrender.com/api';

/**
 * Executes a fetch request with automatic authorization handling.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const userApiKey = localStorage.getItem('GEMINI_API_KEY');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(userApiKey ? { 'x-gemini-key': userApiKey } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Standardize error format parsing
    throw new Error(data.message || 'An error occurred during the request');
  }

  return data.data; // Specifically extract the 'data' payload from ApiResponse
};

// Convenience methods
export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};
