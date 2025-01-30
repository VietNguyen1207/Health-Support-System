import axios from "axios";

// Tạo axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.cybriadev.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});
