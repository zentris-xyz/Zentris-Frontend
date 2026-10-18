/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0b',
        surface: '#111112',
        raised: '#17171a',
        hover: '#1c1c20',
        line: '#232326',
        'line-strong': '#2e2e33',
        text: {
          DEFAULT: '#e8e8ea',
          muted: '#8a8a90',
          faint: '#5a5a60',
        },
        accent: '#c6f24e',
        success: '#4ade80',
        danger: '#f87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        'xs': ['11px', '16px'],
        'sm': ['12px', '18px'],
        'base': ['13px', '20px'],
        'md': ['14px', '20px'],
        'lg': ['16px', '22px'],
        'xl': ['20px', '26px'],
        '2xl': ['24px', '30px'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
      },
    },
  },
  plugins: [],
}
