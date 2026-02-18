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
          blush:        '#F9A8A8',
          'blush-light':'#FDE8E8',
          teal:         '#4DADA8',
          'teal-dark':  '#3A8A85',
          'teal-light': '#E6F5F4',
          white:        '#FFFFFF',
          offwhite:     '#F9FAFB',
          'soft-gray':  '#E5E7EB',
          'text-dark':  '#1F2937',
          'text-mid':   '#6B7280',
          'text-light': '#9CA3AF',
          success:      '#6EE7B7',
          warning:      '#FCD34D',
          error:        '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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