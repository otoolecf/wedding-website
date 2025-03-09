// src/routes/api/admin/gallery/assign/+server.js
import { assignImage } from '$lib/imageAssignments';

export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt && platform.env?.ENVIRONMENT === 'production') {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New image assignment request received`);

  try {
    const { locationId, imageId } = await request.json();

    if (!locationId || !imageId) {
      return jsonResponse({ error: 'locationId and imageId are required' }, 400);
    }

    const result = await assignImage(platform, locationId, imageId);

    console.log(`[${requestId}] Image ${imageId} assigned to location ${locationId}`);
    return jsonResponse(result);
  } catch (error) {
    console.error(`[${requestId}] Error processing assignment:`, error);
    return jsonResponse({ error: error.message || 'Assignment failed' }, 500);
  }
}
