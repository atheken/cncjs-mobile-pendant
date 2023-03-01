module.exports = {
  content: ['./src/**/*.{svelte,js,ts}'],
  plugins: [require('daisyui')],
  theme: {
    container: {
      center: true,
    },
  },
  daisyui: {
    themes: [
      {
        mytheme: {    
"primary": "#7cdb51",
"secondary": "#ea0743",
"accent": "#c40992",
"neutral": "#1B1B28",
"base-100": "#383A52",
"info": "#6EABED",
"success": "#52E08D",
"warning": "#F4CA25",
"error": "#F81225",
        },
      },
    ]
  }
};
