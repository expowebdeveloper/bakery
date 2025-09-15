/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customRed: "#FF6363",
        customOrange: '#FF7723',
        customBlack: "#434343",
        btnBackground : '#FF7723',
        greyText : '#515151',
        eyebrowColor: '#813D33',
        redPrimary: '#FF2F2F',
        greenBg: '#5F6F52'
      },
    },
  },
  plugins: [],
};
