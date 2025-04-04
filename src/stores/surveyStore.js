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
  surveyRecords: [],
  loadingRecords: false,

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

      const { data } = await api.get(
        `/surveys/results/student?surveyId=${surveyId}&studentId=${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Survey results data:", data);
      set({ selectedSurvey: data, loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching survey results:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch survey results";

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Submit survey answers
  submitSurveyAnswers: async (surveyId, studentId, answerIDs) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
        `/surveys/submit?surveyId=${surveyId}&studentId=${studentId}`,
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

  // Create new survey
  createSurvey: async (surveyData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(`/surveys/create`, surveyData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error("Error creating survey:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create survey. Please try again.";

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update survey
  updateSurvey: async (surveyId, surveyData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const response = await api.put(
        `/surveys/update?surveyId=${surveyId}`,
        surveyData,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // If successful, update the surveys list
      if (response.status === 200) {
        const surveys = get().surveys;
        const updatedSurveys = surveys.map((survey) =>
          survey.id === surveyId || survey.surveyId === surveyId
            ? { ...survey, ...surveyData }
            : survey
        );
        set({ surveys: updatedSurveys });
      }

      set({ loading: false });
      return response.data;
    } catch (error) {
      console.error("Error updating survey:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update survey. Please try again.";

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Fetch survey records 2.0
  fetchSurveyRecords: async () => {
    set({ loadingRecords: true, error: null });
    try {
      const token = localStorage.getItem("token");

      const { data } = await api.get(`${SURVEY_URL}/record`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      set({ surveyRecords: data, loadingRecords: false });
      return data;
    } catch (error) {
      console.error("Survey records fetch error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.status === 403
          ? "You don't have permission to access survey records. Please log in again."
          : error.response?.data?.message ||
            error.message ||
            "Failed to fetch survey records";

      set({
        error: errorMessage,
        loadingRecords: false,
        surveyRecords: [],
      });
      throw new Error(errorMessage);
    }
  },

  // Fetch survey result details by period
  fetchSurveyReportByPeriod: async (surveyId, periodId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const { data } = await api.get(
        `/surveys/results/report?surveyId=${surveyId}&periodID=${periodId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching survey period report:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch survey period report";

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
