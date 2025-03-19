/** @type {import('tailwindcss').Config} */
import scrollbar from "tailwind-scrollbar";
import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-green": "#4a7c59",
        "emerald-700": "#047857",
        "emerald-900": "#064e3b",
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(135deg, #4a7c59, #9ec5ab)",
        "emerald-gradient": "linear-gradient(135deg, #047857, #064e3b)",
      },
      backgroundColor: {
        primary: "#4a7c59",
        "custom-green": "#4a7c59",
        "hover-green": "#4A7C59",
      },
      borderColor: {
        "hover-green": "#4A7C59",
      },
    },
  },
  plugins: [scrollbar, forms],
  variants: {
    scrollbar: ["rounded"],
  },
};
