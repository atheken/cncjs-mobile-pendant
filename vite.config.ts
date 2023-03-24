import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
	base: '',
	plugins: [svelte()],
	server: {
		hmr: {
			host: 'localhost',
			clientPort: 5173
		},
		host: true,
		proxy: {
			//this will be useful to enable HMR at a later time.
		}
	},
	build: {
		manifest: true,
		minify: 'terser'
	}
});
