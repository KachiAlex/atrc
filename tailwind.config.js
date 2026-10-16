/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ATRC Primary - Indigo (structure & primary actions)
        primary: {
          50: '#EEF1FA',
          100: '#E4E8F7',
          200: '#C9D0EE',
          300: '#AEB9E4',
          400: '#6B7FC4',
          500: '#22388A',
          600: '#17275F',
          700: '#111F52',
          800: '#0F1A44',
          900: '#0A1233',
        },
        // ATRC Secondary - Gold (accent; fills carry dark ink text)
        secondary: {
          50: '#FBF6E9',
          100: '#FBF0D5',
          200: '#F7E2A8',
          300: '#F0C968',
          400: '#E3B04B',
          500: '#E3B04B',
          600: '#C69433',
          700: '#8A6210',
          800: '#7A5410',
          900: '#5C3F0C',
        },
        gold: {
          50: '#FBF6E9',
          100: '#FBF0D5',
          200: '#F7E2A8',
          300: '#F0C968',
          400: '#E3B04B',
          500: '#E3B04B',
          600: '#C69433',
          700: '#8A6210',
          800: '#7A5410',
          900: '#5C3F0C',
        },
        // Parchment (surfaces) and ink (text)
        parchment: {
          50: '#FFFCF6',
          100: '#F6F1E7',
          200: '#EDE5D3',
          300: '#E2D9C6',
        },
        ink: {
          500: '#6E6A5E',
          600: '#4F566E',
          700: '#3A405A',
          900: '#14182B',
        },
        // Remap neutral gray scale into the warm/navy system so legacy
        // screens adopt the palette without per-file changes
        gray: {
          50: '#F6F1E7',
          100: '#EDE5D3',
          200: '#E2D9C6',
          300: '#D6CCBA',
          400: '#A9A08C',
          500: '#6E6A5E',
          600: '#4F566E',
          700: '#3A405A',
          800: '#1A2350',
          900: '#14182B',
        },
        // Legacy blue utilities mapped onto indigo so old screens stay on-brand
        blue: {
          50: '#EEF1FA',
          100: '#E4E8F7',
          200: '#C9D0EE',
          300: '#AEB9E4',
          400: '#6B7FC4',
          500: '#22388A',
          600: '#17275F',
          700: '#111F52',
          800: '#0F1A44',
          900: '#0A1233',
        },
        // ATRC Accent - Purple (crown, legacy, being retired)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21b8',
          900: '#581c87',
        },
      },
      fontFamily: {
        'sans': ['"Source Sans 3"', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      },
      borderRadius: {
        card: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}
