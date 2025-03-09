// src/routes/api/admin/gallery/metadata/+server.js
// import { v4 as uuidv4 } from 'uuid';
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
  console.log(`[${requestId}] Update image metadata request received`);

  try {
    const { imageId, caption, alt } = await request.json();

    if (!imageId) {
      return jsonResponse({ error: 'imageId is required' }, 400);
    }

    // Get existing metadata
    const imageData = await platform.env.IMAGES_KV.get(`image:${imageId}`);
    if (!imageData) {
      return jsonResponse({ error: 'Image not found' }, 404);
    }

    // Parse and update metadata
    const metadata = JSON.parse(imageData);

    // Update fields if provided
    if (caption !== undefined) metadata.caption = caption;
    if (alt !== undefined) metadata.alt = alt;

    // Add timestamp for tracking changes
    metadata.updated_at = Date.now();

    // Save updated metadata
    await platform.env.IMAGES_KV.put(`image:${imageId}`, JSON.stringify(metadata));

    console.log(`[${requestId}] Updated metadata for image ${imageId}`);

    return jsonResponse({
      success: true,
      imageId,
      metadata
    });
  } catch (error) {
    console.error(`[${requestId}] Error updating metadata:`, error);
    return jsonResponse({ error: error.message || 'Update failed' }, 500);
  }
}
