module.exports = {
  content: ['./src/**/*.{svelte,js,ts}'],
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
  theme: {
    extend : {
      dropShadow: {
        'toolbar': '0 5px 5px rgba(0, 0, 0, 0.5)',
      }
    },
    container: {
      center: true
    },
    screens: {
      'mobile': '425px',
    },
  }
};
