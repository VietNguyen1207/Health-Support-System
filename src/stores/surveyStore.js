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

export const useSurveyStore = create((set, get) => ({
  ...initialState,
  questions: [],
  loadingQuestions: false,

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

  // Fetch survey questions
  fetchSurveyQuestions: async (surveyId) => {
    set({ loadingQuestions: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const { data } = await api.get(
        `/surveys/questions?surveyId=${surveyId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      set({
        questions: data.questionList,
        selectedSurvey: {
          ...get().selectedSurvey,
          id: data.surveyId,
          title: data.title,
          questions: data.questionList,
        },
        loadingQuestions: false,
      });

      return data;
    } catch (error) {
      console.error("Survey questions fetch error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.status === 403
          ? "You don't have permission to access this survey. Please log in again."
          : error.response?.data?.message ||
            error.message ||
            "Failed to fetch survey questions";

      set({
        error: errorMessage,
        loadingQuestions: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Clear questions
  clearQuestions: () => set({ questions: [] }),

  // Fetch survey results for a specific student
  fetchSurveyResults: async (surveyId, studentId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      // Use the new endpoint structure with query parameters
      const { data } = await api.get(
        `/surveys/results?surveyId=${surveyId}&studentId=${studentId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      set({
        selectedSurvey: data,
        loading: false,
      });

      return data;
    } catch (error) {
      console.error("Survey results fetch error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.status === 403
          ? "You don't have permission to access these results. Please log in again."
          : error.response?.data?.message ||
            error.message ||
            "Failed to fetch survey results";

      set({
        error: errorMessage,
        loading: false,
      });
      throw new Error(errorMessage);
    }
  },

  // Submit survey answers
  submitSurveyAnswers: async (surveyId, studentId, answerIDs) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/surveys/options/scoreResult?surveyId=${surveyId}&studentId=${studentId}`,
        answerIDs, // Send the array of answer IDs directly as the request body
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      set({ loading: false });
      return response.data; // This will contain studentId and score
    } catch (error) {
      console.error("Error submitting survey answers:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit survey answers. Please try again.";

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
