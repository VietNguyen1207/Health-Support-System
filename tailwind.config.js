/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-green": "#4a7c59",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  daisyui: {
    themes: ["light"],
  },
};
