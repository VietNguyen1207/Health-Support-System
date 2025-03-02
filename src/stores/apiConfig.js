import axios from "axios";

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
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Prevent infinite loops
//     if (originalRequest._retry) {
//       return Promise.reject(error);
//     }

//     // Handle 401 Unauthorized error
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         const refreshToken = localStorage.getItem("refreshToken");
//         if (!refreshToken) {
//           throw new Error("No refresh token available");
//         }

//         // Attempt to refresh token
//         const response = await api.post("/auth/refresh-token", {
//           refreshToken,
//         });

//         if (response.data?.accessToken) {
//           localStorage.setItem("token", response.data.accessToken);
//           originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         // Clear tokens and redirect to login
//         localStorage.removeItem("token");
//         localStorage.removeItem("refreshToken");
//         window.location.href = "/login";
//         return Promise.reject(refreshError);
//       }
//     }

//     // Handle network errors
//     if (!error.response) {
//       return Promise.reject({
//         message: "Network Error. Please check your internet connection.",
//       });
//     }

//     // Handle other errors
//     return Promise.reject(error);
//   }
// );
