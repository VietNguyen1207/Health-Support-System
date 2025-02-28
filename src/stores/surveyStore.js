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
      // Check if we have a token in localStorage
      const token = localStorage.getItem("token");

      // Make the API call with authorization header if token exists
      const { data } = await api.get(SURVEY_URL, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

      set({ surveys: data, loading: false });
      return data;
    } catch (error) {
      console.error("Survey fetch error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.status === 403
          ? "You don't have permission to access surveys. Please log in again."
          : error.response?.data?.message ||
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

  // Get survey status for a specific student
  getStudentSurveyStatus: (surveys, studentId) => {
    if (!surveys || !studentId) return [];

    return surveys.map((survey) => {
      const studentStatus = survey.statusStudent?.find(
        (status) => status.studentId === studentId
      ) || { status: "Not Started", score: "0" };

      return {
        ...survey,
        studentStatus: studentStatus.status,
        studentScore: studentStatus.score,
      };
    });
  },

  // Clear selected survey
  clearSelectedSurvey: () => set({ selectedSurvey: null }),
}));
