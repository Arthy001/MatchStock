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
        '2xs': ['16px', { lineHeight: '22px' }],
        'xs': ['18px', { lineHeight: '26px' }],
        'sm': ['20px', { lineHeight: '28px' }],
        'base': ['24px', { lineHeight: '34px' }],   // ขนาดมาตรฐาน 24px ตามสั่ง
        'lg': ['26px', { lineHeight: '36px' }],
        'xl': ['28px', { lineHeight: '38px' }],
        '2xl': ['32px', { lineHeight: '42px' }],
        '3xl': ['38px', { lineHeight: '48px' }],
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
