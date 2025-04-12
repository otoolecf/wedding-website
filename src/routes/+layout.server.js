// routes/+layout.server.js
import { env } from '$env/dynamic/private';

export async function load({ url, platform, fetch }) {
  // CF_PAGES_BRANCH is automatically set by Cloudflare Pages
  const branch = env.CF_PAGES_BRANCH || '';
  const isPreview = branch !== 'main' && branch !== 'master';

  // Default settings if none exist in KV
  const defaultSettings = {
    weddingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    weddingTime: '16:00',
    venueName: 'Wedding Venue',
    venueAddress: '123 Wedding Street, City, State ZIP',
    groomName: "Groom's Name",
    brideName: "Bride's Name",
    showCountdown: true,
    nameOrder: 'groom-first', // 'groom-first' or 'bride-first'
    rsvpButtonText: 'RSVP Now',
    rsvpButtonLink: '/rsvp',
    defaultPages: [
      { id: 'home', name: 'Home', slug: '', order: 0 },
      { id: 'gallery', name: 'Gallery', slug: 'gallery', order: 1 },
      { id: 'rsvp', name: 'RSVP', slug: 'rsvp', order: 2 },
      { id: 'registry', name: 'Registry', slug: 'registry', order: 3 }
    ]
  };

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

  try {
    // Try to get settings from KV
    const settings = await platform.env.IMAGES_KV.get('wedding_settings', 'json');

    // If no settings exist, return defaults
    if (!settings) {
      return {
        theme,
        settings: defaultSettings,
        isPreview,
        pathname: url.pathname
      };
    }

    // If settings exist but don't have defaultPages, add them
    if (!settings.defaultPages) {
      settings.defaultPages = defaultSettings.defaultPages;
      // Save the updated settings
      await platform.env.IMAGES_KV.put('wedding_settings', JSON.stringify(settings));
    }

    return {
      theme,
      settings,
      isPreview,
      pathname: url.pathname
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      theme,
      settings: defaultSettings,
      isPreview,
      pathname: url.pathname
    };
  }
}
