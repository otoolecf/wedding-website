// routes/+layout.server.js
import { env } from '$env/dynamic/private';

export async function load({ url, platform, fetch }) {
  // CF_PAGES_BRANCH is automatically set by Cloudflare Pages
  const branch = env.CF_PAGES_BRANCH || '';
  const isPreview = branch !== 'main' && branch !== 'master';

  // Load theme settings
  let theme = {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#f3f4f6',
      text: '#333333',
      background: '#ffffff'
    },
    fonts: {
      heading: 'sans-serif',
      body: 'sans-serif'
    }
  };

  try {
    // Only attempt to fetch theme if platform is available (in server environment)
    if (platform && platform.env) {
      const themeData = await platform.env.IMAGES_KV.get('site_theme');
      if (themeData) {
        theme = JSON.parse(themeData);
      }
    } else {
      // Fallback to fetch API when not in server context (e.g., in browser)
      const response = await fetch('/api/images/theme');
      if (response.ok) {
        const data = await response.json();
        theme = data.theme;
      }
    }
  } catch (error) {
    console.error('Failed to load theme settings:', error);
    // If there's an error, we'll use the default theme
  }

  return {
    isPreview,
    pathname: url.pathname,
    theme
  };
}
