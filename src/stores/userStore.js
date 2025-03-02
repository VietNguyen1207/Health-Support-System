import { create } from "zustand";
import { api } from "./apiConfig";
import { useAuthStore } from "./authStore";

const initialState = {
  users: [],
  user: null,
  events: [],
  loading: false,
  error: null,
};

const USER_URL = "/users/";

export const useUserStore = create((set, get) => {
  // Helper function to get current auth user
  const getAuthUser = () => useAuthStore.getState().user;

  // Helper function to handle API errors
  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.data?.message || defaultMessage;
    set({ error: errorMessage, loading: false });
    throw new Error(errorMessage);
  };

  // Helper function to build endpoint based on user role
  const buildEndpoint = (baseEndpoint, userId) => {
    const authUser = getAuthUser();
    const isManager = authUser?.role === "manager";
    const targetUserId = isManager ? userId : authUser?.userId;

    return isManager && userId
      ? `${baseEndpoint}?userId=${targetUserId}`
      : baseEndpoint;
  };

  return {
    ...initialState,

    // Get current user from auth state
    getCurrentUser: () => {
      const authUser = getAuthUser();
      if (authUser) {
        set({ user: authUser });
      }
      return authUser;
    },

    // Get all users
    getAllUsers: async () => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.get(USER_URL + "all");
        set({ users: data, loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to fetch users");
      }
    },

    // Get user by ID
    getUserById: async (userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL, userId);
        const { data } = await api.get(endpoint);
        set({ user: data, loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to fetch user detail");
      }
    },

    // Get user details
    getUserDetails: async (userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "details", userId);
        const { data } = await api.get(endpoint);
        set({ user: data, loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to fetch user details");
      }
    },

    // Search users by name
    searchUsers: async (name, userId) => {
      set({ loading: true, error: null });
      try {
        const authUser = getAuthUser();
        const isManager = authUser?.role === "manager";
        const targetUserId = userId || authUser?.userId;

        const endpoint = isManager
          ? `${USER_URL}search?name=${name}&userId=${targetUserId}`
          : `${USER_URL}search?name=${name}`;

        const { data } = await api.get(endpoint);
        set({ users: data, loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to search users");
      }
    },

    // Update user profile
    updateProfile: async (profileData, userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "update", userId);
        const { data } = await api.put(endpoint, profileData);

        // Update the current user data in store
        const currentUser = get().user;
        set({
          user: { ...currentUser, ...data },
          loading: false,
        });

        // Also update the auth store if this is the current user
        const authUser = getAuthUser();
        if (authUser && (!userId || authUser.userId === userId)) {
          useAuthStore.getState().updateUser(data);
        }

        return data;
      } catch (error) {
        return handleError(error, "Failed to update profile");
      }
    },

    // Update user role (only for Manager role)
    updateUserRole: async (userId, roleData) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.put(
          `${USER_URL}role?userId=${userId}`,
          roleData
        );

        // Update the user in users list if present
        const users = get().users;
        if (users.length > 0) {
          const updatedUsers = users.map((user) =>
            user.userId === userId ? { ...user, ...data } : user
          );
          set({ users: updatedUsers });
        }

        // Update auth store if this is the current user
        const authUser = getAuthUser();
        if (authUser && authUser.userId === userId) {
          useAuthStore.getState().updateUser(data);
        }

        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to update user role");
      }
    },

    // Get user's appointments
    getUserAppointments: async (userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "appointments", userId);
        const { data } = await api.get(endpoint);
        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to fetch user appointments");
      }
    },

    // Get user's events
    getUserEvents: async (userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "events", userId);
        const { data } = await api.get(endpoint);
        set({ events: data, loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to fetch user events");
      }
    },

    // Export user data
    exportUserData: async (userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "export", userId);
        const { data } = await api.get(endpoint);
        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to export user data");
      }
    },

    // Reactivate user account (only for Manager role)
    reactivateUser: async (userId, reactivateData) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.post(
          `${USER_URL}reactivate?userId=${userId}`,
          reactivateData
        );
        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to reactivate user account");
      }
    },

    // Deactivate user account
    deactivateUser: async (userId, deactivateData) => {
      set({ loading: true, error: null });
      try {
        const { data } = await api.post(
          `${USER_URL}deactivate?userId=${userId}`,
          deactivateData
        );
        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to deactivate user account");
      }
    },

    // Submit feedback for user
    submitUserFeedback: async (feedbackData, userId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(USER_URL + "feedback", userId);
        const { data } = await api.post(endpoint, feedbackData);
        set({ loading: false });
        return data;
      } catch (error) {
        return handleError(error, "Failed to submit feedback");
      }
    },

    // Delete user account (only for Manager role)
    deleteUser: async (userId) => {
      set({ loading: true, error: null });
      try {
        await api.delete(`${USER_URL}delete?userId=${userId}`);

        // Remove user from users list if present
        const users = get().users;
        if (users.length > 0) {
          const updatedUsers = users.filter((user) => user.userId !== userId);
          set({ users: updatedUsers });
        }

        set({ loading: false });
        return true;
      } catch (error) {
        return handleError(error, "Failed to delete user account");
      }
    },

    // Reset store to initial state
    reset: () => {
      set(initialState);
    },
  };
});
