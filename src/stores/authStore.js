import { create } from "zustand";
import { persist } from "zustand/middleware";
// import account from "../data/account.json";
import axios from "axios";
import { api } from "./apiConfig";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
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

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,
      // Action login
      login: async (credentials) => {
        try {
          const { data } = await api.post(
            AUTH_URL + AUTH_ENDPOINT.LOGIN,
            credentials
          );

          const { userId, accessToken, refreshToken, role } = data;

          // Cập nhật state
          set({
            user: { userId, role: String(role).toLowerCase() },
            token: { accessToken, refreshToken },
            isAuthenticated: true,
          });

          // Set token cho axios - Fix header name to Authorization
          api.defaults.headers.common[
            "Authentication"
          ] = `Bearer ${accessToken}`;

          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Login failed");
          }
          throw error;
        }
      },

      // Action logout
      logout: async () => {
        try {
          await api.post(AUTH_URL + AUTH_ENDPOINT.LOGOUT);

          // Reset state
          set(initialState);

          // Clear axios default header - Fix header name
          delete api.defaults.headers.common["Authorization"];
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
          const { data } = await api.post(
            AUTH_URL + AUTH_ENDPOINT.REFRESH_TOKEN,
            {
              accessToken: useAuthStore.getState().token.accessToken,
              refreshToken: useAuthStore.getState().token.refreshToken,
              userId: useAuthStore.getState().user.userId,
              role: useAuthStore.getState().user.role,
            }
          );

          const { accessToken, refreshToken } = data;

          // Cập nhật token mới - Fix header name
          set({ token: { accessToken, refreshToken } });
          api.defaults.headers.common[
            "Authentication"
          ] = `Bearer ${accessToken}`;
        } catch (error) {
          useAuthStore.getState().logout();
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
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Interceptor để handle refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
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

// export { api };
