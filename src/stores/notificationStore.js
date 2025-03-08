import { create } from "zustand";
import { api } from "./apiConfig";

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  pollingInterval: null,
  debounceTimer: null,
};

// Updated API endpoint
const NOTIFICATION_URL = "/notifications";

const NOTIFICATION_ENDPOINT = {
  READ_NOTIFICATION: "/read",
  GET_UNREAD: "/unread",
};

export const useNotificationStore = create((set, get) => ({
  ...initialState,

  // Get all notifications - updated to use query parameter
  getNotifications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`${NOTIFICATION_URL}?userId=${userId}`);
      set({ notifications: Array.isArray(data) ? data : [] });
      return data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({ error: error.message || "Failed to fetch notifications" });
      set({ notifications: [] });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // Get unread notifications - updated to use query parameter
  getUnreadNotifications: async (userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(
        `${NOTIFICATION_URL}${NOTIFICATION_ENDPOINT.GET_UNREAD}?userId=${userId}`
      );
      set({ notifications: Array.isArray(data) ? data : [] });
      return data;
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      set({ error: error.message || "Failed to fetch unread notifications" });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // Mark notification as read - updated to use query parameter
  markNotificationAsRead: async (notificationId, userId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post(
        `${NOTIFICATION_URL}${NOTIFICATION_ENDPOINT.READ_NOTIFICATION}?notificationId=${notificationId}&userId=${userId}`
      );

      // Update the notification in the local state
      const updatedNotifications = get().notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      );

      set({ notifications: updatedNotifications });
      return data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      set({ error: error.message || "Failed to mark notification as read" });
      return null;
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
