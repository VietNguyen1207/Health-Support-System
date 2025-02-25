import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  psychologists: [],
  loading: false,
  error: null,
};

const PSYCHOLOGIST_URL = "/psychologists";

const PSYCHOLOGIST_PATH = {
  GET_LEAVE_REQUEST: (psychId) => `/${psychId}/leave-requests`,
  POST_LEAVE_REQUEST: (psychId) => `/${psychId}/leave-requests`,
  CANCEL_LEAVE_REQUEST: (psychId, leaveRequestId) =>
    `/${psychId}/leave-requests/${leaveRequestId}/cancel`,
};

export const usePsychologistStore = create((set) => ({
  ...initialState,

  // Fetch all psychologists
  fetchPsychologists: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(PSYCHOLOGIST_URL);
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

  // Fetch leave requests for a psychologist
  fetchLeaveRequests: async (psychId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(
        PSYCHOLOGIST_URL + PSYCHOLOGIST_PATH.GET_LEAVE_REQUEST(psychId)
      );
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Leave requests fetch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch leave requests";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Post a leave request for a psychologist
  postLeaveRequest: async (psychId, body) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(
        PSYCHOLOGIST_URL + PSYCHOLOGIST_PATH.POST_LEAVE_REQUEST(psychId),
        body
      );
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Leave request post error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to post leave request";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  cancelLeaveRequest: async (psychId, leaveRequestId) => {
    set({ loading: true, error: null });
    try {
      await api.put(
        PSYCHOLOGIST_URL +
          PSYCHOLOGIST_PATH.CANCEL_LEAVE_REQUEST(psychId, leaveRequestId)
      );
      set({ loading: false });
    } catch (error) {
      console.error("Leave request cancel error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel leave request";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
