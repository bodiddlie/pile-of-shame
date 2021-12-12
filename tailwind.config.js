module.exports = {
  mode: 'jit',
  purge: ['./app/**/*.{ts,tsx}'],
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      gridTemplateColumns: {
        expando: 'repeat(auto-fill, minmax(400px, 1fr) )',
      },
    },
  },
  variants: {
    opacity: ['disabled'],
    backgroundColor: ['disabled'],
    borderColor: ['disabled'],
    textColor: ['disabled'],
  },
  plugins: [],
};
