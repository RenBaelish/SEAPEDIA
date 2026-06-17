/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00AA5B", // SEAPEDIA Green
        secondary: "#31353B",
        tertiary: "#9FA6B0",
        error: "#E32636",
      }
    },
  },
  plugins: [],
}
