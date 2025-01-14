import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import account from "../data/account.json";

// Tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      // Action login
      login: async (credentials) => {
        try {
          // const { data } = await api.post("/api/login", credentials);
          const data = account.user.find(
            (user) => user.email === credentials.email
          );

          // const { user, token } = data;
          const user = data;
          const token = data.token;

          // Cập nhật state
          set({
            user,
            token,
            isAuthenticated: true,
          });

          // Set token cho axios
          // api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          return true;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || "Login failed");
          }
          throw error;
        }
      },

      // Action logout
      logout: () => {
        // Clear both storages to be safe
        // localStorage.removeItem("token");
        // localStorage.removeItem("user");
        // sessionStorage.removeItem("token");
        // sessionStorage.removeItem("user");

        // Clear axios default header
        // delete axios.defaults.headers.common["Authorization"];

        // Reset state
        set(initialState);
      },

      // Action refresh token
      refreshToken: async () => {
        try {
          const { data } = await api.post(
            "/api/refresh-token",
            {},
            {
              headers: {
                Authorization: `Bearer ${useAuthStore.getState().token}`,
              },
            }
          );

          const { token } = data;

          // Cập nhật token mới
          set({ token });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (error) {
          useAuthStore.getState().logout();
          throw error;
        }
      },

      // Thêm các actions khác nếu cần
      updateProfile: async (profileData) => {
        const { data } = await api.put("/api/profile", profileData);
        set({ user: data });
        return data;
      },

      // Lấy thông tin user
      fetchUserProfile: async () => {
        const { data } = await api.get("/api/profile");
        set({ user: data });
        return data;
      },
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

// Interceptor để handle refresh token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       try {
//         await useAuthStore.getState().refreshToken();
//         return api(originalRequest);
//       } catch (refreshError) {
//         useAuthStore.getState().logout();
//         throw refreshError;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

export { api };
