import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  programs: [],
  selectedProgram: null,
  loading: false,
  loadingDetails: false,
  error: null,
};

const PROGRAM_URL = "/programs";

const PROGRAM_ENDPOINT = {
  CREATE: "/create",
  TAGS: "/tags",
  DETAILS: (id) => `/${id}/details`,
};

export const useProgramStore = create((set) => ({
  ...initialState,
  tags: [],

  // fetch program details
  fetchProgramDetails: async (programId) => {
    set({ loadingDetails: true, error: null });
    try {
      const { data } = await api.get(
        `/programs/details?programId=${programId}`
      );
      set({ selectedProgram: data, loadingDetails: false });
      return data;
    } catch (error) {
      console.error("Error fetching program details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to fetch program details";
      set({ error: errorMessage, loadingDetails: false });
      throw new Error(errorMessage);
    }
  },

  // fetch tags for adding new program
  fetchTags: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(PROGRAM_URL + PROGRAM_ENDPOINT.TAGS);
      const formattedTags = data.map((tag) => ({
        label: tag.tagName,
        value: tag.tagID,
      }));
      set({ tags: formattedTags, loading: false });
      return formattedTags;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch tags";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
  // Fetch all programs
  fetchPrograms: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(PROGRAM_URL);
      set({ programs: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch programs";
      set({
        error: errorMessage,
        loading: false,
        programs: [],
      });
      throw new Error(errorMessage);
    }
  },

  // Create A New Program
  createProgram: async (programData) => {
    set({ loading: true, error: null });
    try {
      // await api.post(PROGRAM_URL + PROGRAM_ENDPOINT.CREATE, credentials);

      const { data } = await api.post(
        PROGRAM_URL + PROGRAM_ENDPOINT.CREATE,
        programData
      );

      // Update programs list with new program
      set((state) => ({
        programs: [...state.programs, data],
        loading: false,
      }));
      return data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create program";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  clearSelectedProgram: () => set({ selectedProgram: null }),

  // Register for a program
  registerProgram: async (programId, studentId) => {
    set({ loading: true, error: null });
    try {
      console.log("Registering for program:", { programId, studentId });

      // Updated endpoint to use query parameter instead of path parameter
      const { data } = await api.post(
        `/programs/register?programId=${programId}`,
        {
          studentID: studentId,
          programID: programId,
        }
      );

      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Registration error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to register for program";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Fetch enrolled programs for student
  fetchEnrolledPrograms: async (studentId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/programs/enrolled/${studentId}`);
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching enrolled programs:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to fetch enrolled programs";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Fetch facilitated programs
  fetchFacilitatedPrograms: async (facilitatorId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(
        `/programs/facilitator?facilitatorID=${facilitatorId}`
      );
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Error fetching facilitated programs:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to fetch facilitated programs";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Update an existing program
  updateProgram: async (programId, programData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(
        `/programs/edit?programId=${programId}`,
        programData
      );

      // Update the programs list with the updated program
      set((state) => ({
        programs: state.programs.map((program) =>
          program.programID === programId ? data : program
        ),
        loading: false,
        // If the updated program is currently selected, update it too
        selectedProgram:
          state.selectedProgram?.programID === programId
            ? data
            : state.selectedProgram,
      }));

      return data;
    } catch (error) {
      console.error("Error updating program:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        fullError: error,
      });

      const errorMessage =
        error.response?.data?.message || "Failed to update program";
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Cancel program participation
  cancelProgramParticipation: async (programId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(
        `/programs/cancel-request?programId=${programId}`
      );
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Error cancelling program participation:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      let errorMessage = "Failed to cancel program participation";
      if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to cancel this program registration";
      } else if (error.response?.status === 404) {
        errorMessage = "Program registration not found";
      }

      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },
}));
