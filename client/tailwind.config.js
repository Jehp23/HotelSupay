/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F1EB',
        'warm-cream': '#E8DDD4',
        cactus: '#3A4A3D',
        'deep-cactus': '#2C3A2F',
        terracotta: '#A0553C',
        stone: '#1A1A1A',
        'warm-stone': '#2A2A2A',
        pure: '#FFFFFF',
        'off-white': '#FEFEFE',
        gold: '#B8985A',
        copper: '#C49B61',
        sage: '#8B9A8C',
        mist: '#F8F6F3',
      },
      fontFamily: {
        display: ['\"Playfair Display\"', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      }
    },
  },
  plugins: [],
}
