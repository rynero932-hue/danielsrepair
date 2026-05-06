/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A017',
          light: '#F5C842',
          dark: '#B8860B',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display',
          'SF Pro Text', 'Helvetica Neue', 'system-ui', 'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}
