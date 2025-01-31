import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const USER_URL = "/users";

// const USER_ENDPOINT = {
//   GET_ALL_USERS: "all",
// }

export const useUserStore = create((set) => ({
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

  // Reset store to initial state
  reset: () => {
    set(initialState);
  },
}));
