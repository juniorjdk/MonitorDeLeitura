/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        paper2: '#F1ECE0',
        ink: '#232220',
        inksoft: '#5B5A54',
        forest: '#2E5D50',
        forestdeep: '#1F433A',
        gold: '#A9772F',
        goldsoft: '#F1E3C8',
        line: '#DCD4C0',
        todaybg: '#FFF4DD',
        todayborder: '#C99A3C'
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
