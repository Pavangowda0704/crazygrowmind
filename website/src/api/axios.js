import axios from "axios";

// Base URL comes from Vite env — set VITE_API_URL in .env
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// withCredentials: true so the httpOnly refresh-token cookie is sent/received
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attaches the in-memory access token to every request.
// Call setAccessToken(token) from AuthContext whenever it changes.
let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Queues concurrent requests while a refresh is already in flight,
// so a burst of 401s doesn't fire multiple refresh calls at once.
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
};

// This gets wired up by AuthContext so this file doesn't need
// to import the context directly (avoids a circular import).
let onRefreshToken = null;
let onRefreshFailed = null;
export const registerRefreshHandlers = (refreshFn, failedFn) => {
  onRefreshToken = refreshFn;
  onRefreshFailed = failedFn;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      onRefreshToken
    ) {
      if (isRefreshing) {
        // Wait for the in-flight refresh, then retry with the new token
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await onRefreshToken();
        resolveQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        if (onRefreshFailed) onRefreshFailed();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
