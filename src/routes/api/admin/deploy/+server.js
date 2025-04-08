export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Deployment request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Check if we're in production - deployment should not be allowed in production
  if (platform.env.ENVIRONMENT === 'production') {
    console.error(`[${requestId}] Deployment attempted in production environment`);
    return jsonResponse({ error: 'Deployment is not allowed in production environment' }, 403);
  }

  // Check if we're in preview environment
  if (platform.env.ENVIRONMENT !== 'preview') {
    console.error(`[${requestId}] Deployment attempted in non-preview environment`);
    return jsonResponse({ error: 'Deployment is only allowed from preview environment' }, 403);
  }

  // Validate JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    console.error(`[${requestId}] Unauthorized access attempt`);
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Get all keys from preview KV store
    const previewKeys = await platform.env.IMAGES_KV.list();

    // Filter out RSVP-related keys
    const contentKeys = previewKeys.keys.filter(
      (key) =>
        !key.name.startsWith('rsvp:') &&
        !key.name.startsWith('guest:') &&
        !key.name.startsWith('RSVPS:')
    );

    // Copy each key to production KV store
    for (const key of contentKeys) {
      const value = await platform.env.IMAGES_KV.get(key.name);
      if (value) {
        await platform.env.PROD_IMAGES_KV.put(key.name, value);
        console.log(`[${requestId}] Copied KV key: ${key.name}`);
      }
    }

    // Copy R2 objects
    const previewObjects = await platform.env.IMAGES_BUCKET.list();
    for (const object of previewObjects.objects) {
      const objectData = await platform.env.IMAGES_BUCKET.get(object.key);
      if (objectData) {
        await platform.env.PROD_IMAGES_BUCKET.put(object.key, objectData);
        console.log(`[${requestId}] Copied R2 object: ${object.key}`);
      }
    }

    return jsonResponse({
      message: 'Deployment successful',
      kvKeysCopied: contentKeys.length,
      r2ObjectsCopied: previewObjects.objects.length
    });
  } catch (error) {
    console.error(`[${requestId}] Deployment failed:`, error);
    return jsonResponse({ error: 'Deployment failed' }, 500);
  }
}
