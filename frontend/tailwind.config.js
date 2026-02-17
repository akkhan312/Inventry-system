/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#5C8DBC',
          hover: '#4A7BA7',
          active: '#2E7D32',
        },
        primary: {
          DEFAULT: '#4A90E2',
          dark: '#3A7BC8',
        },
      },
    },
  },
  plugins: [],
}

