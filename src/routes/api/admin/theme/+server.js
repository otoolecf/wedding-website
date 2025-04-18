// src/routes/api/admin/theme/+server.js
export async function GET({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Theme settings request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

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
        url: '/favicon.png', // Default favicon path
        uploaded: false // Flag to indicate if favicon has been uploaded
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

export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Theme settings update received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const data = await request.json();

    if (!data.theme) {
      return jsonResponse({ error: 'No theme settings provided' }, 400);
    }

    // Validate theme structure
    const { theme } = data;

    if (!theme.colors || !theme.fonts) {
      return jsonResponse({ error: 'Invalid theme format' }, 400);
    }

    // Save the theme settings to KV
    await platform.env.IMAGES_KV.put('site_theme', JSON.stringify(theme));
    console.log(`[${requestId}] Theme settings saved successfully`);

    return jsonResponse({
      message: 'Theme settings saved successfully',
      theme
    });
  } catch (error) {
    console.error(`[${requestId}] Error saving theme:`, error);
    return jsonResponse({ error: 'Failed to save theme settings' }, 500);
  }
}
