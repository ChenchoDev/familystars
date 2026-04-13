/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-dark': '#080C18',
        'constellation-purple': '#9B59B6',
        'constellation-blue': '#3498DB',
        'constellation-orange': '#F39C12',
        'constellation-green': '#27AE60',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  }
}
