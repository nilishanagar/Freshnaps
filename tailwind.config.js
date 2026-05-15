/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf9f0',
          100: '#f9efd8',
          200: '#f2d9a6',
          300: '#e8c06e',
          400: '#dda83e',
          500: '#C9A96E',
          600: '#b8924a',
          700: '#9a7839',
          800: '#7d6133',
          900: '#654f2c',
        },
        navy: {
          50:  '#f0f0f8',
          100: '#d8d8ed',
          200: '#b0b0da',
          300: '#8585c2',
          400: '#5e5ea8',
          500: '#1A1A2E',
          600: '#151527',
          700: '#101020',
          800: '#0c0c18',
          900: '#080810',
        },
        cream: {
          50:  '#fefdfb',
          100: '#fdf9f2',
          200: '#F5F0E8',
          300: '#ede3d0',
          400: '#e0d3b4',
          500: '#d0bd97',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96E 0%, #e8c06e 50%, #b8924a 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-in':   'slideIn 0.4s ease-out',
        'float':      'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      height: {
        '18': '4.5rem',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { transform: 'translateY(30px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        slideIn: { '0%': { transform: 'translateX(-20px)', opacity: 0 }, '100%': { transform: 'translateX(0)', opacity: 1 } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      boxShadow: {
        'gold':       '0 4px 14px rgba(201, 169, 110, 0.30)',
        'gold-lg':    '0 8px 30px rgba(201, 169, 110, 0.45)',
        'gold-xl':    '0 16px 48px rgba(201, 169, 110, 0.55)',
        'card':       '0 2px 20px rgba(0, 0, 0, 0.07)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.14)',
        'inner-gold': 'inset 0 1px 0 rgba(255,255,255,0.15)',
      },
    },
  },
  plugins: [],
};
