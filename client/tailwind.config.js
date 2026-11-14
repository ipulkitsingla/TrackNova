/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        rail: {
          dark: '#0a0f1d',
          card: '#131b2e',
          border: '#1e293b',
          accent: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'train-chug': 'trainChug 0.8s ease-in-out infinite alternate',
        'smoke-drift': 'smokeDrift 2s ease-out infinite',
        'track-move': 'trackMove 1s linear infinite',
        'radar-ping': 'radarPing 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        trainChug: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(-2px)' }
        },
        smokeDrift: {
          '0%': { transform: 'translate(0, 0) scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'translate(-25px, -20px) scale(1.6)', opacity: '0' }
        },
        trackMove: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-40px)' }
        },
        radarPing: {
          '75%, 100%': {
            transform: 'scale(2.5)',
            opacity: '0'
          }
        }
      }
    },
  },
  plugins: [],
}

