/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FFFCF5',
        champagne: '#F3E7D3',
        blush: '#F8E8EA',
        gold: '#B88A44',
        rosegold: '#B76E79',
        charcoal: '#1D1B18',
      },
      boxShadow: {
        luxury: '0 14px 35px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
