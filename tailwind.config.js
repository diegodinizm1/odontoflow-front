/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        paper: '#FBFAF7',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#17302E',
          soft: '#5C706D',
          faint: '#90A09D',
        },
        line: '#E8E4DC',
        brand: {
          50:  '#E8F2F0',
          100: '#C5DED9',
          200: '#9FC9C1',
          300: '#79B3A9',
          400: '#5CA297',
          500: '#3F9186',
          600: '#39817A',
          700: '#2F6E66',
          800: '#265B54',
          900: '#163E39',
        },
        alert: {
          bg: '#FBF1E0',
          fg: '#92591A',
          line: '#EFDCBB',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(23,48,46,.04), 0 12px 28px -16px rgba(23,48,46,.18)',
        soft: '0 1px 2px rgba(23,48,46,.05)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
