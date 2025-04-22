/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        'primary-dark': '#7C3AED',
        secondary: '#F472B6',
        'secondary-teal': '#0D9488',

        'background-dark': '#111827',
        'background-gray': '#1F2937',

        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',

        'text-light': '#D1D5DB',
        'text-muted': '#9CA3AF',
        'text-dark': '#111827',

        'border-gray': '#374151',
      },
    },
  },
  plugins: [],
};
