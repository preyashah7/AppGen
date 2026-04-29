/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#6366F1',
        background: '#FAFAFA',
        card: '#FFFFFF',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textSecondary: '#6B7280',
      },
    },
  },
  plugins: [],
}