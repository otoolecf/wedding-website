import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      // Configure the adapter to handle all routes
      routes: {
        include: ['/*']
      }
    }),
    // This ensures proper path resolution
    paths: {
      base: ''
    }
  },
  preprocess: vitePreprocess()
};

export default config;
