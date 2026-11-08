module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#0a0d14', bgalt: '#0e1220',
        surface: '#1a1d2b', surface2: '#232740',
        accent: '#0a6fd8', accenth: '#2b8cff',
        muted: '#8b93a7'
      },
      fontFamily: { sans: ['Montserrat', 'system-ui', 'sans-serif'] },
      maxWidth: { shell: '1100px' },
      borderRadius: { sharp: '2px' }
    }
  }
, content: [require('node:path').join(__dirname, 'index.html')]
}
