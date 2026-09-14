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
        vyapar: {
          primary: '#2563EB',
          deep: '#1D4ED8',
          dark: '#1E3A8A',
          sky: '#0EA5E9',
          light: '#DBEAFE',
          veryLight: '#EFF6FF',
          bg: '#F8FAFC',
          white: '#FFFFFF',
          text: '#0F172A',
          textSecondary: '#64748B',
          border: '#DCE6F2',
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#0EA5E9',
          // Dark mode tokens
          darkBg: '#0B1220',
          darkSurface: '#111827',
          darkSurfaceSec: '#172033',
          darkPrimary: '#3B82F6',
          darkSky: '#38BDF8',
          darkText: '#F8FAFC',
          darkTextSec: '#94A3B8',
        },
        sauda: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E3A8A',
          800: '#172554',
          900: '#0F172A',
          dark: '#0B1220',
          gray: '#64748B',
          bg: '#F8FAFC',
        }
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 4px 16px -2px rgba(37, 99, 235, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'soft': '0 6px 20px -3px rgba(37, 99, 235, 0.08)',
        'glass': '0 6px 20px -3px rgba(37, 99, 235, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.02), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
        'glass-dark': '0 6px 20px -3px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-card': '0 4px 18px -2px rgba(37, 99, 235, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        'glass-card-dark': '0 4px 18px -2px rgba(0, 0, 0, 0.3), inset 0 1px 1px 0 rgba(255, 255, 255, 0.06)',
        'glass-hover': '0 10px 28px -4px rgba(37, 99, 235, 0.12), 0 3px 8px -1px rgba(0, 0, 0, 0.03), inset 0 1px 1.5px 0 rgba(255, 255, 255, 1)',
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
