/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        srca: {
          red: "#C0392B",
          "dark-red": "#922B21",
          gold: "#D4AC0D",
          dark: "#1C2833",
        },
      },
      fontFamily: {
        arabic: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
};
