/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff0f6',
          100: '#ffe0ec',
          200: '#ffc2d9',
          300: '#ff85b8',
          400: '#ff4d94',
          500: '#ff006e',
          600: '#e6005f',
          700: '#cc0054',
          800: '#a30043',
          900: '#7a0033',
        },
        accent: {
          cyan: '#00fff0',
          orange: '#ff6b35',
          purple: '#9b5de5',
          lime: '#c6ff00',
          magenta: '#ff0080',
        },
        thermal: {
          hot: '#ff0040',
          warm: '#ff6b35',
          neutral: '#9b5de5',
          cool: '#00d4ff',
          cold: '#00fff0',
        },
        sidebar: {
          bg: '#0a0a0f',
          hover: 'rgba(255, 0, 110, 0.15)',
          active: 'rgba(255, 0, 110, 0.3)',
          border: 'rgba(255, 0, 110, 0.2)',
        },
        dark: {
          bg: '#0d0d12',
          card: '#13131a',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundImage: {
        'gradient-thermal': 'linear-gradient(135deg, #ff006e 0%, #ff6b35 25%, #9b5de5 50%, #00d4ff 75%, #00fff0 100%)',
        'gradient-hot': 'linear-gradient(180deg, #ff0040 0%, #ff6b35 50%, #ffb347 100%)',
        'gradient-cold': 'linear-gradient(180deg, #00fff0 0%, #00d4ff 50%, #9b5de5 100%)',
        'gradient-radial-thermal': 'radial-gradient(ellipse at center, #ff006e 0%, #ff6b35 30%, #9b5de5 60%, #00d4ff 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0a0a0f 0%, #1a0a1a 100%)',
      },
      boxShadow: {
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.4)',
        'glow-cyan': '0 0 20px rgba(0, 255, 240, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 107, 53, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 0, 110, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 0, 110, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
