import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

const NOTIFICATION_URL = (userId) => `/notifications/${userId}`;

const NOTIFICATION_ENDPOINT = {
  READ_NOTIFICATION: "/read",
};

export const useNotificationStore = create((set) => ({
  ...initialState,

  //Get all notifications
  getNotifications: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(NOTIFICATION_URL(userId));
      set({ notifications: data });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      set({ loading: false });
    }
  },

  //Mark notification as read
  markNotificationAsRead: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await api.put(
        NOTIFICATION_URL(userId) + NOTIFICATION_ENDPOINT.READ_NOTIFICATION
      );
      set({ notifications: data });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
