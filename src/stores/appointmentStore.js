import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  appointments: [],
  departments: [],
  loading: false,
  error: null,
};

const APPOINTMENT_URL = "/appointments/";

const APPOINTMENT_ENDPOINT = {
  CREATE: "book",
  DEPARTMENTS: "departments",
  DETAILS: (id) => id,
};

export const useAppointmentStore = create((set) => ({
  ...initialState,

  // Fetch Departments
  fetchDepartments: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get("psychologists/departments");
      set({
        departments: data,
        loading: false,
      });
      return data;
    } catch (error) {
      console.error("Department fetch error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch departments";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  //Get TimeSlots
  GetTimeSlots: async (id, date) => {
    // set({ loading: true, error: null });
    try {
      if (date) {
        const response = await api.get(
          `/psychologists/${id}/timeslots?date=${date}`
        );

        set({ loading: false });

        return {
          timeSlots: response.data.timeSlots,
          message: response.data?.message || null,
        };
      }
      // Ensure we return an array, even if empty
      return [];
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch time slots";
      set({ error: errorMessage, loading: false });
      // Return empty array on error
      return [];
    }
  },

  //Create A New Booking
  CreateBooking: async (credentials) => {
    set({ loading: true, error: null });
    try {
      // console.log(credentials);

      const res = await api.post(
        APPOINTMENT_URL + APPOINTMENT_ENDPOINT.CREATE,
        credentials
      );

      // Update appointments list with new appointment
      set((state) => ({
        appointments: [...state.appointments, res],
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create appointment";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  //Get Department List
  // GetAllDepartments: async () => {
  //   set({ loading: true, error: null });
  //   try {
  //     const response = await api.get(
  //       APPOINTMENT_URL + APPOINTMENT_ENDPOINT.GET_ALL_DEPARTMENT
  //     );

  //     return Array.isArray(response.data) ? response.data : [];
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.message || "Failed to fetch department list";
  //     set({ error: errorMessage, loading: false });
  //     throw new Error(errorMessage);
  //   }
  // },

  //Get Detail Program
  GetDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(
        APPOINTMENT_URL + APPOINTMENT_ENDPOINT.DETAILS(id)
      );
      set({ loading: false });
      return response.data ? response.data : {};
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch detail";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
