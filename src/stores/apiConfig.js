import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Create axios instance with optimized configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.cybriadev.com/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Skip token for login requests
    if (config.url?.includes("/auth/login")) {
      delete config.headers.Authorization;
      return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
      // Check if token is valid before using it
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiryTime = payload.exp * 1000;

        if (Date.now() >= expiryTime) {
          // Token is expired, remove it
          localStorage.removeItem("token");
          delete config.headers.Authorization;
          return config;
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (e) {
        // Invalid token format
        localStorage.removeItem("token");
        delete config.headers.Authorization;
      }
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized or 403 Forbidden errors
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("login")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Get user information from the store
        const { user } = useAuthStore.getState();

        // Attempt to refresh token
        const response = await api.post("/auth/refresh-token", {
          accessToken: localStorage.getItem("token"),
          refreshToken,
          userId: user?.userId,
          role: user?.role,
        });

        if (response.data?.accessToken) {
          // Update tokens in storage
          localStorage.setItem("token", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);

          // Update auth store
          useAuthStore.setState({
            token: {
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            },
          });

          // Update header for the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Clear auth state completely
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: "Network Error. Please check your internet connection.",
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);
