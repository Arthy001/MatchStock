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
        '2xs': ['11px', { lineHeight: '16px' }],
        'xs': ['12px', { lineHeight: '18px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['15px', { lineHeight: '22px' }],
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
