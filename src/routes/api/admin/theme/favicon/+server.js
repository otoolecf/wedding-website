export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Favicon upload request received`);

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
    const formData = await request.formData();
    const file = formData.get('favicon');

    if (!file || !(file instanceof File)) {
      return jsonResponse({ error: 'No file provided' }, 400);
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return jsonResponse({ error: 'Invalid file type. Please upload an image.' }, 400);
    }

    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `favicon-${Date.now()}.${fileExt}`;
    const r2Key = `favicons/${fileName}`;

    // Upload to R2
    await platform.env.IMAGES_BUCKET.put(r2Key, file);

    // Update theme settings with new favicon
    const themeData = await platform.env.IMAGES_KV.get('site_theme');
    const theme = themeData ? JSON.parse(themeData) : {};

    // Update favicon settings
    theme.favicon = {
      url: `${platform.env.IMAGES_BUCKET_SITE_URL}/${r2Key}`,
      uploaded: true
    };

    // Save updated theme
    await platform.env.IMAGES_KV.put('site_theme', JSON.stringify(theme));

    return jsonResponse({
      message: 'Favicon uploaded successfully',
      favicon: theme.favicon
    });
  } catch (error) {
    console.error(`[${requestId}] Error uploading favicon:`, error);
    return jsonResponse({ error: 'Failed to upload favicon' }, 500);
  }
}
