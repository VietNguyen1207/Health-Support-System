import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  programs: [],
  selectedProgram: null,
  loading: false,
  loadingDetails: false,
  error: null,
};

const PROGRAM_URL = "/programs";

const PROGRAM_ENDPOINT = {
  CREATE: "/create",
  TAGS: "/tags",
  DETAILS: (id) => `/${id}/details`,
};

export const useProgramStore = create((set) => ({
  ...initialState,
  tags: [],

  // fetch program details
  fetchProgramDetails: async (programId) => {
    set({ loadingDetails: true, error: null });
    try {
      const { data } = await api.get(`/programs/${programId}/details`);
      set({ selectedProgram: data, loadingDetails: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch program details";
      set({ error: errorMessage, loadingDetails: false });
      throw new Error(errorMessage);
    }
  },

  // fetch tags for adding new program
  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(PROGRAM_URL + PROGRAM_ENDPOINT.TAGS);
      const formattedTags = data.map((tag) => ({
        label: tag.tagName,
        value: tag.tagID,
      }));
      set({ tags: formattedTags, loading: false });
      return formattedTags;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch tags";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
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
  createProgram: async (programData) => {
    set({ loading: true, error: null });
    try {
      // await api.post(PROGRAM_URL + PROGRAM_ENDPOINT.CREATE, credentials);

      const { data } = await api.post(
        PROGRAM_URL + PROGRAM_ENDPOINT.CREATE,
        programData
      );

      // Update programs list with new program
      set((state) => ({
        // programs: [...state.programs, credentials],

        programs: [...state.programs, data],
        loading: false,
      }));
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create program";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearSelectedProgram: () => set({ selectedProgram: null }),
}));
