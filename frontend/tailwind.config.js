/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': ['12px', { lineHeight: '16px' }],
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['15px', { lineHeight: '22px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '26px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
      },
      fontFamily: {
        sans: ['Prompt-Latin', 'TH Sarabun New', 'Sarabun', 'system-ui', 'sans-serif'],
        prompt: ['Prompt-Latin', 'Prompt', 'sans-serif'],
        sarabun: ['TH Sarabun New', 'Sarabun', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
