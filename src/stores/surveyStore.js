import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  surveys: [],
  selectedSurvey: null,
  loading: false,
  loadingDetails: false,
  error: null,
};

const SURVEY_URL = "/surveys";

export const useSurveyStore = create((set) => ({
  ...initialState,

  // Fetch all surveys
  fetchSurveys: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(SURVEY_URL);
      set({ surveys: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch surveys";
      set({
        error: errorMessage,
        loading: false,
        surveys: [],
      });
      throw new Error(errorMessage);
    }
  },

  // Clear selected survey
  clearSelectedSurvey: () => set({ selectedSurvey: null }),
}));
