import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
//import { exec } from 'child_process'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  base: '',
  plugins: [svelte()],
  server : {
    host : true
  },
  build: {
    sourcemap : true,
    minify : false
  }
});