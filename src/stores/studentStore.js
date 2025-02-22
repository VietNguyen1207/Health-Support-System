import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  events: [],
  loading: false,
  error: null,
};

const STUDENT_URL = (id) => `/students/${id}/`;

const STUDENT_ENDPOINT = {
  GET_EVENTS: "events",
};

export const useStudentStore = create((set, get) => ({
  ...initialState,
}));
