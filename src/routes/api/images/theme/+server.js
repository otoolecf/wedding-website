// src/routes/api/images/theme/+server.js
export async function GET({ platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Public theme request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  try {
    // Fetch the theme settings from KV
    const themeData = await platform.env.IMAGES_KV.get('site_theme');

    // Default theme settings
    const defaultTheme = {
      colors: {
        primary: '#000000', // Default black
        secondary: '#666666', // Default gray
        accent: '#f3f4f6', // Default light gray
        text: '#333333', // Default text color
        background: '#ffffff' // Default background
      },
      fonts: {
        heading: 'sans-serif',
        body: 'sans-serif'
      },
      favicon: {
        url: '/favicon.png',
        uploaded: false
      }
    };

    if (!themeData) {
      // If no theme is saved yet, return the default theme
      console.log(`[${requestId}] No theme found, returning default`);
      return jsonResponse({ theme: defaultTheme });
    }

    const theme = JSON.parse(themeData);
    console.log(`[${requestId}] Theme settings retrieved`);

    return jsonResponse({ theme });
  } catch (error) {
    console.error(`[${requestId}] Error fetching theme:`, error);
    return jsonResponse({ error: 'Failed to fetch theme settings' }, 500);
  }
}
