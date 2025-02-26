import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  pollingInterval: null,
  debounceTimer: null,
};

const NOTIFICATION_URL = (userId) => `/notifications/${userId}`;

const NOTIFICATION_ENDPOINT = {
  READ_NOTIFICATION: "/read",
  GET_UNREAD: "/unread",
};

export const useNotificationStore = create((set, get) => ({
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

  //Get all notifications
  getUnreadNotifications: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await api.get(
        NOTIFICATION_URL(userId) + NOTIFICATION_ENDPOINT.GET_UNREAD
      );
      set({ notifications: data });
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    } finally {
      set({ loading: false });
    }
  },

  //Mark notification as read
  markNotificationAsRead: async (userId) => {
    set({ loading: true });
    try {
      const { data } = await api.post(
        NOTIFICATION_URL(userId) + NOTIFICATION_ENDPOINT.READ_NOTIFICATION
      );
      set({ notifications: data });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Start polling notifications
  startPolling: (userId, interval = 60000) => {
    // Clear existing timers
    const { pollingInterval, debounceTimer } = get();
    if (pollingInterval) clearInterval(pollingInterval);
    if (debounceTimer) clearTimeout(debounceTimer);

    // Create new polling interval
    const newInterval = setInterval(async () => {
      await get().getNotifications(userId);
    }, interval);

    set({ pollingInterval: newInterval });
  },

  // Stop polling
  stopPolling: () => {
    const { pollingInterval, debounceTimer } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    set({
      pollingInterval: null,
      debounceTimer: null,
    });
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
