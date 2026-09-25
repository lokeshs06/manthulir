/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        earth: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ebdccb',
          300: '#dec2aa',
          400: '#cfa387',
          500: '#b88165',
          600: '#9d634d',
          700: '#7e4d3c',
          800: '#643d31',
          900: '#52332a',
        },
        agri: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        badge: {
          bronze: '#b45309',
          bronzeBg: '#fef3c7',
          silver: '#475569',
          silverBg: '#f1f5f9',
          gold: '#eab308',
          goldBg: '#fef9c3',
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Tamil"', 'Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
