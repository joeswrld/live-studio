/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#07090c',
          900: '#0b0e13',
          850: '#10141b',
          800: '#151a23',
          700: '#1e2531',
          600: '#2a3342',
          500: '#3b465a',
        },
        accent: { DEFAULT: '#3b82f6', hover: '#2563eb' },
        live: '#ef4444',
        ok: '#22c55e',
        warn: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        pulseDot: { '0%,100%': { opacity: '1' }, '50%': { opacity: '.35' } },
        slideIn: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'none', opacity: '1' } },
      },
      animation: { pulseDot: 'pulseDot 1.4s ease-in-out infinite', slideIn: 'slideIn .2s ease-out' },
    },
  },
  plugins: [],
};
