// src/routes/api/images/assigned/[locationId]/+server.js
import { getAssignedImage } from '$lib/imageAssignments';

export async function GET({ params, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  const requestId = crypto.randomUUID();
  const { locationId } = params;

  try {
    console.log(`[${requestId}] Fetching assigned image for location: ${locationId}`);

    const image = await getAssignedImage(platform, locationId);

    if (!image) {
      return jsonResponse({
        image: null,
        message: 'No image assigned to this location'
      });
    }

    return jsonResponse({ image });
  } catch (error) {
    console.error(`[${requestId}] Error fetching assigned image:`, error);
    return jsonResponse({ error: 'Failed to fetch assigned image' }, 500);
  }
}
