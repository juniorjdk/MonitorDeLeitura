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
              todayborder: '#C99A3C',
              // Livros (prefixo bk-) — identidade visual própria, sem colidir com tokens da Bíblia
              'bk-paper': '#F5F7FA',
              'bk-paper2': '#E9EDF3',
              'bk-ink': '#0D0D0D',
              'bk-inksoft': '#566B73',
              'bk-ocean': '#465E8C',
              'bk-oceandeep': '#401D09',
              'bk-clay': '#A6826D',
              'bk-line': '#D6DEE7',
              'bk-todaybg': '#F6EDE7',
              'bk-todayborder': '#A6826D'
            },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
