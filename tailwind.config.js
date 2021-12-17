module.exports = {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        expando: 'repeat(auto-fill, minmax(400px, 1fr) )',
      },
    },
  },
  plugins: [],
};
