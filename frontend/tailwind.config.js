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
        background: '#F8F9FB',
        surface: '#FFFFFF',
        'surface-raised': '#F3F4F6',
        border: '#E4E7EC',
        'border-strong': '#D1D5DB',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        accent: '#4F46E5',
        'accent-hover': '#4338CA',
        'accent-light': '#EEF2FF',
        success: '#059669',
        warning: '#D97706',
        danger: '#DC2626',
        'success-light': '#ECFDF5',
        'warning-light': '#FFFBEB',
        'danger-light': '#FEF2F2',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px rgba(0,0,0,0.12), 0 8px 25px rgba(0,0,0,0.08)',
        dropdown: '0 4px 16px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
    },
  },
  plugins: [],
}