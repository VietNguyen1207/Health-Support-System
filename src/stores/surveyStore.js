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
      const studentResponse = survey.statusStudentResponse?.find(
        (status) => status.studentId === studentId
      ) || { score: "0/0" };

      return {
        ...survey,
        studentStatus: studentResponse.lastCompleteDate
          ? "COMPLETED"
          : "NOT COMPLETED",
        studentScore: studentResponse.score,
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
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://api.cybriadev.com/api/surveys/results/student?surveyId=${surveyId}&studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("You don't have permission to view these results");
        }
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Survey results data:", data);
      set({ selectedSurvey: data, loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching survey results:", error);
      set({ error: error.message, loading: false });
      throw error;
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
