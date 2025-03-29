import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  //   psychologists: [],
  loading: false,
  error: null,
};

const MANAGER_URL = "s/";

const MANAGER_PATH = {
  GET_LEAVE_REQUEST: "leave-requests/all",
  UPDATE_LEAVE_REQUEST: (leaveRequestId, approve) =>
    `leave-requests/${leaveRequestId}?approve=${approve}`,
};

export const useManagerStore = create((set) => ({
  ...initialState,

  // Fetch all psychologists
  fetchLeaveRequests: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(
        MANAGER_URL + MANAGER_PATH.GET_LEAVE_REQUEST
      );
      set({ loading: false });

      return data;
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateLeaveRequest: async (leaveRequestId, approve) => {
    set({ loading: true, error: null });
    try {
      await api.put(
        MANAGER_URL + MANAGER_PATH.UPDATE_LEAVE_REQUEST(leaveRequestId, approve)
      );
      set({ loading: false });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));
