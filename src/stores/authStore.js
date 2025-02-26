import { create } from "zustand";
import { persist } from "zustand/middleware";
// import account from "../data/account.json";
import axios from "axios";
import { api } from "./apiConfig";
import { useUserStore } from "./userStore";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
};

const AUTH_URL = "/auth/";

const AUTH_ENDPOINT = {
  LOGIN: "login",
  LOGOUT: "logout",
  REGISTER: "register",
  FORGOT_PASS: "forgot-password",
  RESET_PASS: "reset-password",
  REFRESH_TOKEN: "refresh-token",
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
  } catch (error) {
    console.log(error);
    return true;
  }
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      checkAuthStatus: () => {
        const state = useAuthStore.getState();
        const accessToken = state.token?.accessToken;

        if (!accessToken || isTokenExpired(accessToken)) {
          // Token is expired or missing, logout user
          useAuthStore.getState().logout();
          return false;
        }
        return true;
      },

      // Action login
      login: async (credentials) => {
        set({ loading: true });
        try {
          const { data } = await api.post(
            AUTH_URL + AUTH_ENDPOINT.LOGIN,
            credentials
          );

          const {
            userId,
            studentId, // Basic ID from login
            fullName,
            accessToken,
            refreshToken,
            role,
          } = data;

          // Set authorization header for subsequent requests
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;

          // Get user details to fetch role-specific IDs
          const userStore = useUserStore.getState();
          const userDetails = await userStore.getDetail(userId);

          // Set user state with role-specific IDs
          set({
            user: {
              userId,
              studentId,
              fullName,
              role: String(role).toLowerCase(),
              psychologistId: userDetails?.psychologistInfo?.psychologistId,
              parentId: userDetails?.parentInfo?.parentId,
            },
            token: { accessToken, refreshToken },
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Login failed");
          }
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Action logout
      logout: async () => {
        try {
          delete api.defaults.headers.common["Authorization"];
          await api.post(AUTH_URL + AUTH_ENDPOINT.LOGOUT);

          // delete api.defaults.headers.common["Authentication"];
          // Reset state
          set(initialState);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Logout failed");
          }
          throw error;
        }
      },

      // Action refresh token
      refreshToken: async () => {
        try {
          const state = useAuthStore.getState();

          if (!state.token?.refreshToken) {
            throw new Error("No refresh token available");
          }

          // Check if access token is expired
          if (!isTokenExpired(state.token.accessToken)) {
            return {
              accessToken: state.token.accessToken,
              refreshToken: state.token.refreshToken,
            };
          }

          const { data } = await api.post(
            AUTH_URL + AUTH_ENDPOINT.REFRESH_TOKEN,
            {
              accessToken: state.token.accessToken,
              refreshToken: state.token.refreshToken,
              userId: state.user?.userId,
              role: state.user?.role,
            }
          );

          if (!data.accessToken || !data.refreshToken) {
            throw new Error("Invalid token response");
          }

          const { accessToken, refreshToken } = data;

          // Update tokens in state and headers
          set({ token: { accessToken, refreshToken } });
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          // api.defaults.headers.common[
          //   "Authentication"
          // ] = `Bearer ${accessToken}`;

          return data;
        } catch (error) {
          // Only logout if it's not already a logout attempt
          if (!error.config?.url?.includes(AUTH_ENDPOINT.LOGOUT)) {
            await useAuthStore.getState().logout();
          }
          throw error;
        }
      },

      // Thêm các actions khác nếu cần
      // updateProfile: async (profileData) => {
      //   const { data } = await api.put("/api/profile", profileData);
      //   set({ user: data });
      //   return data;
      // },

      // Lấy thông tin user
      // fetchUserProfile: async () => {
      //   const { data } = await api.get("/api/profile");
      //   set({ user: data });
      //   return data;
      // },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Add initialization of token from persisted state
const token = useAuthStore.getState().token?.accessToken;
if (token) {
  if (isTokenExpired(token)) {
    // If token is expired, reset the store to initial state
    useAuthStore.setState(initialState);
    delete api.defaults.headers.common["Authorization"];
  } else {
    // Only set the Authorization header if token is valid
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
}

// Interceptor để handle refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token or 401 unauthorized
    if (
      (error.response?.status === 401 ||
        isTokenExpired(useAuthStore.getState().token?.accessToken)) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshToken();
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);
