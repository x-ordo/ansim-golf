
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'golfmon-gradient': 'linear-gradient(0deg, rgba(36, 64, 89, 0.1) 0%, rgba(36, 64, 89, 0.1) 100%), linear-gradient(90deg, #10b981 0%, #3b82f6 98%)',
      }
    },
  },
  plugins: [],
}
