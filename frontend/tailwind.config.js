/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#09090b',
          900: '#121215',
          850: '#141417',
          800: '#18181b',
          700: '#27272a'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255, 255, 255, 0.08), 0 18px 50px rgba(0, 0, 0, 0.35)'
      }
    }
  },
  plugins: []
};
