/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // adjust as needed
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media', // or 'class' if you want manual toggle
  theme: {
    extend: {
      colors: {
        light: '#ffffff',
        dark: '#1a202c',
        'link': '#3182ce',
        'link-hover': '#2b6cb0',
        'error-bg': '#fee2e2',
        'error-text': '#b91c1c',
        'success-bg': '#e6fffa',
        'success-text': '#2f855a',
        'input-border': '#e2e8f0',
        'input-focus': '#3182ce',
        'input-dark-bg': '#2d3748',
        'input-dark-border': '#4a5568',
        'button-dark': '#2b6cb0',
        'button-dark-hover': '#2c5282',
      },
      fontFamily: {
        sans: [
          'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"',
          'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
