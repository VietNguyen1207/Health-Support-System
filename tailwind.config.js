/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-green": "#4a7c59",
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(135deg, #4a7c59, #9ec5ab)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
