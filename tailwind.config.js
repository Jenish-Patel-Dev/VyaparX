/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sauda: {
          50: '#F0F8FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#1E74BD',
          600: '#1662A0',
          700: '#14538C',
          800: '#0F4170',
          900: '#272264',
          dark: '#0B132B',
          gray: '#64748B',
          bg: '#F4F8FC',
        }
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.06)',
        'card': '0 4px 16px -2px rgba(37, 99, 235, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft': '0 8px 24px -4px rgba(37, 99, 235, 0.10)',
        'glass': '0 8px 26px -4px rgba(37, 99, 235, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 1px 0 rgba(191, 219, 254, 0.35)',
        'glass-dark': '0 8px 26px -4px rgba(37, 99, 235, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 1px 0 rgba(191, 219, 254, 0.35)',
        'glass-card': '0 6px 22px -3px rgba(37, 99, 235, 0.10), 0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 1px 0 rgba(191, 219, 254, 0.35)',
        'glass-card-dark': '0 6px 22px -3px rgba(37, 99, 235, 0.10), 0 2px 6px -1px rgba(0, 0, 0, 0.04), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.98), inset 0 -1px 1px 0 rgba(191, 219, 254, 0.35)',
        'glass-hover': '0 14px 34px -4px rgba(37, 99, 235, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.05), inset 0 1px 2px 0 rgba(255, 255, 255, 1)',
      },
      backdropBlur: {
        'xs': '2px',
        '2xl': '24px',
        '3xl': '32px',
      }
    },
  },
  plugins: [],
}
