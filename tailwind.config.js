/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          primary: '#2E7D32',
          dark: '#1B5E20',
          light: '#E8F5E9',
          bg: '#F8FAF7',
          text: '#263238',
          accent: '#4CAF50',
          solar: '#F57C00',
          water: '#0288D1',
          waste: '#7B1FA2',
          energy: '#FBC02D',
          community: '#00897B',
          construction: '#558B2F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'eco-sm': '0 2px 8px rgba(46, 125, 50, 0.08)',
        'eco-md': '0 4px 16px rgba(46, 125, 50, 0.12)',
        'eco-lg': '0 8px 30px rgba(46, 125, 50, 0.16)',
      }
    },
  },
  plugins: [],
}
