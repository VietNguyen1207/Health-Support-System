import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  timeSlots: [],
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
  appointmentStatus: null,

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
      const response = await api.get(
        `/psychologists/${id}/timeslots?date=${date}`
      );
      console.log(response.data);

      set({ timeSlots: response.data.timeSlots, loading: false });

      return {
        timeSlots: response.data.timeSlots,
        message: response.data?.message || null,
      };
      // Ensure we return an array, even if empty
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

  // Check-in appointment
  checkInAppointment: async (appointmentId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(
        `/appointments/${appointmentId}/check-in`
      );
      set({
        loading: false,
        appointmentStatus: data.status,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to check-in appointment";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  checkOutAppointment: async (appointmentId, notes = "") => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(
        `/appointments/${appointmentId}/check-out`,
        {
          psychologistNotes: notes,
        }
      );
      set({
        loading: false,
        appointmentStatus: data.status,
      });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to check-out appointment";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Clear status when modal closes
  clearAppointmentStatus: () => set({ appointmentStatus: null }),

  //Cancel Appointment
  cancelAppointment: async (appointmentId, reason) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/appointments/${appointmentId}/cancel`, {
        reason,
      });
      set({
        loading: false,
        appointmentStatus: data.status,
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to cancel appointment";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Fetch appointment records for student and psychologist
  fetchAppointmentRecords: async (id, userType = "student") => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Use studentId or psychologistId based on user type
      if (userType === "student") {
        queryParams.append("studentId", id);
      } else if (userType === "psychologist") {
        queryParams.append("psychologistId", id);
      }

      // Add status parameters for completed appointment - fetch into Appointment record
      queryParams.append("status", "COMPLETED");
      queryParams.append("status", "CANCELLED");

      const url = `/appointments/filter?${queryParams.toString()}`;
      console.log("Fetching appointment records from:", url);

      const response = await api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      set({ appointments: response.data || [], loading: false });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching appointment records:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      let errorMessage = "Failed to fetch appointment records";

      if (error.response?.status === 500) {
        errorMessage =
          "The server encountered an error. Please try again later or contact support.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to access these appointments.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false, appointments: [] });
      return []; // Return empty array instead of throwing
    }
  },

  // Fetch upcoming appointments for student and psychologist
  fetchUpcomingAppointments: async (id, userType = "student") => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");

      // Build query parameters
      const queryParams = new URLSearchParams();

      // Use studentId or psychologistId based on user type
      if (userType === "student") {
        queryParams.append("studentId", id);
      } else if (userType === "psychologist") {
        queryParams.append("psychologistId", id);
      }

      queryParams.append("status", "SCHEDULED");
      queryParams.append("status", "IN_PROGRESS");

      const url = `/appointments/filter?${queryParams.toString()}`;
      console.log("Fetching upcoming appointments from:", url);

      const response = await api.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const upcomingAppointments = response.data || [];
      return upcomingAppointments;
    } catch (error) {
      console.error("Error fetching upcoming appointments:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      let errorMessage = "Failed to fetch upcoming appointments";

      if (error.response?.status === 500) {
        errorMessage =
          "The server encountered an error. Please try again later or contact support.";
      } else if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to access these appointments.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
      return []; // Return empty array instead of throwing
    } finally {
      set({ loading: false });
    }
  },
}));
