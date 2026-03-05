/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        aria: {
          blush:        '#A8B8C0',
          'blush-light':'#EEF2F4',
          teal:         '#3A6070',
          'teal-dark':  '#2C4D5C',
          'teal-light': '#E2E8EC',
          white:        '#FFFFFF',
          offwhite:     '#F7F9FA',
          'soft-gray':  '#E2E8EC',
          'text-dark':  '#162028',
          'text-mid':   '#4A6070',
          'text-light': '#A8B8C0',
          success:      '#6EE7B7',
          warning:      '#FCD34D',
          error:        '#F87171',
        },
      },
      fontFamily: {
        sans: ['Raleway', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'aria-sm': '0 1px 4px rgba(0,0,0,0.06)',
        'aria-md': '0 4px 16px rgba(0,0,0,0.08)',
        'aria-lg': '0 8px 32px rgba(0,0,0,0.10)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}