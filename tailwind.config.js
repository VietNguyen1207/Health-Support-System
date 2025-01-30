/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-green": "#4a7c59",
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(135deg, #4a7c59, #9ec5ab)",
      },
      backgroundColor: {
        primary: "#4a7c59",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
