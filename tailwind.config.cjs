module.exports = {
  content: ['./src/**/*.{svelte,js,ts}'],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  theme: {
    container: {
      center: true
    },
    screens: {
      'mobile': '425px',
    },
  }
};
