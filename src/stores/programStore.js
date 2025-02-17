import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  programs: [],
  loading: false,
  error: null,
};

const PROGRAM_URL = "/programs";

const PROGRAM_ENDPOINT = {
  CREATE: "/create",
};

export const useProgramStore = create((set) => ({
  ...initialState,

  // Fetch all programs
  fetchPrograms: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(PROGRAM_URL);
      set({ programs: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch programs";
      set({
        error: errorMessage,
        loading: false,
        programs: [],
      });
      throw new Error(errorMessage);
    }
  },

  // Create A New Program
  createProgram: async (credentials) => {
    set({ loading: true, error: null });
    try {
      await api.post(PROGRAM_URL + PROGRAM_ENDPOINT.CREATE, credentials);

      // Update programs list with new program
      set((state) => ({
        programs: [...state.programs, credentials],
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create program";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
