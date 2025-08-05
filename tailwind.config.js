// tailwind.config.js (Perbaikan untuk Tailwind CSS v4)
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Di Tailwind v4, theme bisa lebih minimalis karena banyak hal
  // didefinisikan langsung di file CSS dengan @theme.
  theme: {
    extend: {
      fontFamily: {
        // Kita tetap mendefinisikan ini agar bisa menggunakan font kustom
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};