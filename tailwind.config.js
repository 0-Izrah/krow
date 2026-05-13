/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grind: {
          bg: '#0a0a0a',
          card: '#141414',
          border: '#1f1f1f',
          accent: '#c8ff00',      // Electric lime — your primary action color
          accentDim: '#9dbf00',
          text: '#f0f0f0',
          muted: '#6b6b6b',
        }
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

