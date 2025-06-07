/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // this line is critical
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9333EA', // optional
        'neon-purple': {
          400: '#b975f7',
          500: '#9333ea',
          600: '#7928ca',
        },
        'neon-blue': {
          400: '#7dd3fc',
          500: '#38bdf8',
          600: '#0284c7',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fadeIn': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(147, 51, 234, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.8), 0 0 30px rgba(56, 189, 248, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      boxShadow: {
        'neon': '0 0 10px rgba(147, 51, 234, 0.5), 0 0 20px rgba(56, 189, 248, 0.3)',
        'neon-hover': '0 0 15px rgba(147, 51, 234, 0.7), 0 0 30px rgba(56, 189, 248, 0.5)',
      },
    },
  },
  plugins: [],
};
