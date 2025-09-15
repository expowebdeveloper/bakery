/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        'xl-1400': '1399px', // Custom breakpoint at 1400px
      },
    },
  },
  plugins: [],
}