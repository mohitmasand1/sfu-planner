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
        'selection-1': colors.red[100],
        'selection-2': colors.blue[100],
        'selection-3': colors.green[100],
        'selection-4': colors.yellow[100],
        'selection-5': colors.purple[100],
        'selection-6': colors.pink[100],
        'selection-7': colors.cyan[100],
        'selection-8': colors.orange[100],
      }
    },
  },
  plugins: [],
}

