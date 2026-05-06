/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A017',
          light: '#F5C842',
          dark: '#B8860B',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display',
          'SF Pro Text', 'Helvetica Neue', 'system-ui', 'sans-serif'
        ],
      },
      animation: {
        'toast-in': 'toastIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        toastIn: {
          from: { opacity: '0', transform: 'translateY(-10px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
  safelist: [
    // Background opacity classes yang dipakai dinamis
    'bg-amber-500/8',
    'bg-amber-500/10',
    'bg-amber-500/15',
    'bg-amber-500/20',
    'bg-blue-500/8',
    'bg-blue-500/15',
    'bg-emerald-500/8',
    'bg-emerald-500/15',
    'bg-red-500/8',
    'bg-red-500/15',
    // Border opacity classes
    'border-amber-500/10',
    'border-amber-500/15',
    'border-amber-500/20',
    'border-amber-500/25',
    'border-amber-500/30',
    'border-amber-500/50',
    'border-blue-500/20',
    'border-blue-500/30',
    'border-emerald-500/20',
    'border-emerald-500/30',
    'border-red-500/20',
    // Text colors
    'text-amber-400',
    'text-amber-500',
    'text-amber-600',
    'text-blue-400',
    'text-blue-600',
    'text-emerald-400',
    'text-emerald-500',
    'text-emerald-700',
    'text-red-400',
    // Color scheme
    '[color-scheme:dark]',
    '[color-scheme:light]',
    // Gradient
    'bg-[radial-gradient(ellipse_at_top,_#1c1005_0%,_transparent_60%)]',
  ],
}
