import { create } from "zustand";
import { api } from "./apiConfig";
import { useAuthStore } from "./authStore";

const initialState = {
  psychologists: [],
  departments: [],
  psychologist: null,
  defaultTimeSlots: [],
  timeSlots: [],
  loading: false,
  error: null,
};

const PSYCHOLOGIST_URL = "/psychologists";

const PSYCHOLOGIST_PATH = {
  CREATE_TIME_SLOT: (id) =>
    `${PSYCHOLOGIST_URL}/timeslots/batch?psychologistId=${id}`,
  GET_TIME_SLOTS: (psychId, date) =>
    `${PSYCHOLOGIST_URL}/timeslots?psychologistId=${psychId}&date=${date}`,
  GET_PSYCHOLOGIST_BY_DEPARTMENT: (departmentId) =>
    `${PSYCHOLOGIST_URL}/specializationS?department=${departmentId}`,
  GET_DEPARTMENT: `${PSYCHOLOGIST_URL}/departments`,
  // GET_LEAVE_REQUEST: (psychId) => `/${psychId}/leave-requests`,
  // POST_LEAVE_REQUEST: (psychId) => `/${psychId}/leave-requests`,
  // CANCEL_LEAVE_REQUEST: (psychId, leaveRequestId) =>
  // `/${psychId}/leave-requests/${leaveRequestId}/cancel`,
};

export const usePsychologistStore = create((set, get) => {
  // Helper function to get current auth user
  const getAuthUser = () => useAuthStore.getState().user;

  // Helper function to handle API errors
  // const handleError = (error, defaultMessage) => {
  //   const errorMessage = error.response?.data?.message || defaultMessage;
  //   set({ error: errorMessage, loading: false });
  //   throw new Error(errorMessage);
  // };

  // Helper function to build endpoint based on user role
  const buildEndpoint = (baseEndpoint, userId) => {
    const authUser = getAuthUser();
    const isManager = authUser?.role === "manager";
    const targetUserId = isManager ? userId : authUser?.userId;

    return isManager && userId
      ? `${baseEndpoint}?userId=${targetUserId}`
      : baseEndpoint;
  };

  return {
    ...initialState,

    // Getters
    getPsychologist: (id) => get().psychologists.find((p) => p.id === id),
    getDefaultTimeSlots: () => get().defaultTimeSlots,
    getLoading: () => get().loading,
    getError: () => get().error,

    //Fetch Time Slots
    getTimeSlots: async (psychId, date = "") => {
      try {
        const endpoint = buildEndpoint(
          PSYCHOLOGIST_PATH.GET_TIME_SLOTS(psychId, date)
        );
        const { data } = await api.get(endpoint);
        set({ timeSlots: data });
        return data;
      } catch (error) {
        console.error("Time slots fetch error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch time slots";
        set({ error: errorMessage, loading: false });
      }
    },

    clearTimeSlots: () => {
      set({ timeSlots: [] });
    },

    // Default Time Slots Management
    fetchDefaultTimeSlots: async () => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(
          `${PSYCHOLOGIST_URL}/default-time-slots`
        );
        const { data } = await api.get(endpoint);
        set({ defaultTimeSlots: data, loading: false });
        return data;
      } catch (error) {
        console.error("Default time slots fetch error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch default time slots";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },

    createTimeSlot: async (psyId, { slotDate, defaultSlotIds }) => {
      set({ loading: true, error: null });
      try {
        await api.post(PSYCHOLOGIST_PATH.CREATE_TIME_SLOT(psyId), {
          slotDate,
          defaultSlotIds,
        });
        set({ loading: false });
      } catch (error) {
        console.error("Create time slots error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to create time slots";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },

    // Fetch all psychologists
    fetchPsychologists: async () => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(PSYCHOLOGIST_URL);
        const { data } = await api.get(endpoint);
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

    // Fetch psychologists by department
    fetchPsychologistsByDepartment: async (departmentId) => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(
          PSYCHOLOGIST_PATH.GET_PSYCHOLOGIST_BY_DEPARTMENT(departmentId)
        );
        const { data } = await api.get(endpoint);
        set({ psychologists: data, loading: false });
        return data;
      } catch (error) {
        console.error("Psychologist fetch error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch psychologists";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },

    // Fetch departments
    fetchDepartments: async () => {
      set({ loading: true, error: null });
      try {
        const endpoint = buildEndpoint(PSYCHOLOGIST_PATH.GET_DEPARTMENT);
        const { data } = await api.get(endpoint);
        set({ departments: data, loading: false });
        return data;
      } catch (error) {
        console.error("Department fetch error:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to fetch departments";
        set({ error: errorMessage, loading: false });
        throw new Error(errorMessage);
      }
    },

    // Fetch leave requests for a psychologist
    // fetchLeaveRequests: async (psychId, params = {}) => {
    //   set({ loading: true, error: null });
    //   try {
    //     const endpoint = buildEndpoint(
    //       `${PSYCHOLOGIST_URL}${PSYCHOLOGIST_PATH.GET_LEAVE_REQUEST(psychId)}`,
    //       params
    //     );
    //     const { data } = await api.get(endpoint);
    //     set({ loading: false });
    //     return data;
    //   } catch (error) {
    //     console.error("Leave requests fetch error:", error);
    //     const errorMessage =
    //       error.response?.data?.message || "Failed to fetch leave requests";
    //     set({ error: errorMessage, loading: false });
    //     throw new Error(errorMessage);
    //   }
    // },

    // // Post a leave request for a psychologist
    // postLeaveRequest: async (psychId, body) => {
    //   set({ loading: true, error: null });
    //   try {
    //     const { data } = await api.post(
    //       `${PSYCHOLOGIST_URL}${PSYCHOLOGIST_PATH.POST_LEAVE_REQUEST(psychId)}`,
    //       body
    //     );
    //     set({ loading: false });
    //     return data;
    //   } catch (error) {
    //     console.error("Leave request post error:", error);
    //     const errorMessage =
    //       error.response?.data?.message || "Failed to post leave request";
    //     set({ error: errorMessage, loading: false });
    //     throw new Error(errorMessage);
    //   }
    // },

    // cancelLeaveRequest: async (psychId, leaveRequestId) => {
    //   set({ loading: true, error: null });
    //   try {
    //     await api.put(
    //       `${PSYCHOLOGIST_URL}${PSYCHOLOGIST_PATH.CANCEL_LEAVE_REQUEST(
    //         psychId,
    //         leaveRequestId
    //       )}`
    //     );
    //     set({ loading: false });
    //   } catch (error) {
    //     console.error("Leave request cancel error:", error);
    //     const errorMessage =
    //       error.response?.data?.message || "Failed to cancel leave request";
    //     set({ error: errorMessage, loading: false });
    //     throw new Error(errorMessage);
    //   }
    // },

    // State management
    reset: () => set(initialState),
    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ loading }),
  };
});
