/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
<<<<<<< HEAD
  plugins: [require("@tailwindcss/forms")],
=======
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light"],
  },
>>>>>>> 0d1fe5bf6cc4d61cb1b7e77cdf0adf4a62498863
};
