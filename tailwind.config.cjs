module.exports = {
  content: ['./src/**/*.{svelte,js,ts}'],
  plugins: [require('daisyui')],
  theme: {
    container: {
      center: true
    }
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=emerald]']
        }
      }
    ]
  }
};
