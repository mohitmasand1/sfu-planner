import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': colors.blue[500],
        'secondary': colors.blue[400],
        'selection-1': colors.red[600],
        'selection-2': colors.blue[300],
        'selection-3': colors.green[300],
        'selection-4': colors.yellow[300],
        'selection-5': colors.purple[300],
        'selection-6': colors.pink[300],
        'selection-7': colors.cyan[300],
        'selection-8': colors.orange[300],
      }
    },
  },
  plugins: [],
}

