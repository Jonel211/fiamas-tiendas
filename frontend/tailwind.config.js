/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f9f4',
          100: '#dcf0e3',
          200: '#bbe1ca',
          300: '#8ecba8',
          400: '#5aae81',
          500: '#359163',
          600: '#1F8A4C', // Tu verde principal
          700: '#1a7040',
          800: '#165c35',
          900: '#0f3d24',
          950: '#082515',
        },
        ink: {
          50:  '#f5f6f8',
          100: '#e8eaee',
          200: '#d1d5dd',
          300: '#a8afbd',
          400: '#7a8295',
          500: '#5a6274',
          600: '#454b5c',
          700: '#373c4a',
          800: '#2B2D42', // Tu navy oscuro
          900: '#1a1c2e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}