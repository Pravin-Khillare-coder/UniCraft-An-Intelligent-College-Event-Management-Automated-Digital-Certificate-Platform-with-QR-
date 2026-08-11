/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0F1016',
          light: '#1C1D26',
          dark: '#08090D',
          border: '#2A2C3E',
        },
        primary: {
          DEFAULT: '#5A52E5',
          hover: '#4942C5',
          light: '#EEEDFD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
