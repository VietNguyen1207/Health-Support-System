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

  //Create A New Program
  createProgram: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(
        PROGRAM_URL + PROGRAM_ENDPOINT.CREATE,
        credentials
      );

      // Update programs list with new program
      set((state) => ({
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
}));
