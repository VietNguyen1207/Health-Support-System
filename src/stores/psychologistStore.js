import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  psychologists: [],
  loading: false,
  error: null,
};

export const usePsychologistStore = create((set) => ({
  ...initialState,

  // Fetch all psychologists
  fetchPsychologists: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/psychologists");
      set({
        psychologists: data,
        loading: false,
      });
      return data;
    } catch (error) {
      console.error("Psychologist fetch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch psychologists";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
