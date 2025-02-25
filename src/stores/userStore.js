import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  users: [],
  events: [],
  loading: false,
  error: null,
};

const USER_URL = "/users/";

const USER_ENDPOINT = {
  GET_DETAIL: (id) => id,
  UPDATE: (id) => id + "/update",
  GET_PROGRAMS: (id) => id + "/programs",
  GET_SURVEYS: (id) => id + "/surveys",
  GET_APPOINTMENTS: (id) => id + "/appointments",
  GET_EVENTS: (id) => id + "/events",
};

export const useUserStore = create((set, get) => ({
  ...initialState,

  // Get all users
  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(USER_URL);
      set({ users: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch users";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Get user detail
  getDetail: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(USER_URL + userId);
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch user detail";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update current user profile
  updateProfile: async (userId, profileData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(
        USER_URL + USER_ENDPOINT.UPDATE(userId),
        profileData
      );

      // Update the current user data in store
      const currentUser = get().user;
      set({
        user: { ...currentUser, ...data },
        loading: false,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update user in users list
  updateUserInList: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(
        USER_URL + USER_ENDPOINT.UPDATE(userId),
        userData
      );

      // Update the user in users list
      const users = get().users;
      const updatedUsers = users.map((user) =>
        user.userId === userId ? { ...user, ...data } : user
      );

      set({
        users: updatedUsers,
        loading: false,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update user";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  //Get events of a user
  getEvents: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(USER_URL + `${userId}/events`);

      set({ loading: false });

      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get events";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Reset store to initial state
  reset: () => {
    set(initialState);
  },
}));
