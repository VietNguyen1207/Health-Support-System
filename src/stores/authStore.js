import { create } from "zustand";
import { persist } from "zustand/middleware";
// import account from "../data/account.json";
import { api } from "./apiConfig";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
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
    (set, get) => ({
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

      // Login user
      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          // Clear any existing tokens first
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");

          const { data } = await api.post("/auth/login", credentials);

          // Validate the response data
          if (!data.accessToken || !data.refreshToken) {
            throw new Error("Invalid login response");
          }

          // Store tokens
          localStorage.setItem("token", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // Update API headers immediately
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${data.accessToken}`;

          const { accessToken, refreshToken, ...userData } = data;
          userData.role = data.role.toLowerCase().replace("role_", "");

          set({
            token: { accessToken, refreshToken },
            user: userData,
            isAuthenticated: true,
            loading: false,
          });

          return userData;
        } catch (error) {
          // Clear everything on error
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          set(initialState);

          console.error("Login error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          const errorMessage =
            error.response?.data?.message || "Failed to login";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Logout user
      logout: () => {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        // Clear API headers
        delete api.defaults.headers.common["Authorization"];

        // Clear persisted store data
        useAuthStore.persist.clearStorage();

        // Reset state
        set(initialState);
      },

      // Check if user is authenticated
      checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set(initialState);
          return false;
        }

        try {
          // You can add a token validation endpoint call here if needed
          return get().isAuthenticated;
        } catch (error) {
          console.log(error);

          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          set(initialState);
          return false;
        }
      },

      // Update user
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
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

      // Register student
      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", userData);

          // Return the response data
          set({ loading: false });
          return data;
        } catch (error) {
          console.error("Registration error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          const errorMessage =
            error.response?.data?.message || "Failed to register";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Register psychologist
      registerPsychologist: async (userData) => {
        set({ loading: true, error: null });
        try {
          // console.log(userData);
          
          await api.post("/auth/register-psychologist", userData);

          // Return the response data
          set({ loading: false });
        } catch (error) {
          console.error("Psychologist registration error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          const errorMessage =
            error.response?.data?.message ||
            "Failed to register psychologist account";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
        }
      },

      // Register parent
      registerParent: async (userData) => {
        set({ loading: true, error: null });
        try {
          const { data } = await api.post("/auth/register-parent", userData);

          // Return the response data
          set({ loading: false });
          return data;
        } catch (error) {
          console.error("Parent registration error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          const errorMessage =
            error.response?.data?.message ||
            "Failed to register parent account";
          set({ error: errorMessage, loading: false });
          throw new Error(errorMessage);
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

      // Add a new function to check and clear invalid auth state
      checkAndClearInvalidAuth: () => {
        const state = get();
        const accessToken = state.token?.accessToken;

        if (!accessToken || isTokenExpired(accessToken)) {
          // Clear everything if token is invalid or expired
          get().logout();
          return false;
        }
        return true;
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

// Add initialization of token from persisted state
const token = useAuthStore.getState().token?.accessToken;
if (token) {
  if (isTokenExpired(token)) {
    // If token is expired, reset the store to initial state
    useAuthStore.setState(initialState);
  }
}

// // Interceptor để handle refresh token
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Check if the error is due to an expired token or 401 unauthorized
//     if (
//       (error.response?.status === 401 ||
//         isTokenExpired(useAuthStore.getState().token?.accessToken)) &&
//       !originalRequest._retry
//     ) {
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
