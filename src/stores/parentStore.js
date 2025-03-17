import { create } from "zustand";
import { api } from "./apiConfig";

export const useParentStore = create((set, get) => ({
  parentData: null,
  loading: false,
  error: null,

  // Fetch parent details including children information
  fetchParentDetails: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/parents/details");

      console.log("Parent data fetched:", response.data);
      set({ parentData: response.data, loading: false });
      return response.data;
    } catch (error) {
      console.error("Error fetching parent details:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch parent details";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Reset store state
  resetParentStore: () => {
    set({ parentData: null, loading: false, error: null });
  },
}));
