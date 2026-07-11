/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefdf6', 100: '#d5fbe9', 200: '#aef5d5', 300: '#76e9ba',
          400: '#37d499', 500: '#12b981', 600: '#059467', 700: '#047654',
          800: '#065e44', 900: '#064c39',
        },
      },
    },
  },
  plugins: [],
}
