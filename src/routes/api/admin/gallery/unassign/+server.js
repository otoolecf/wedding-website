// src/routes/api/admin/gallery/unassign/+server.js
import { removeAssignment } from '$lib/imageAssignments';

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
  console.log(`[${requestId}] New image unassignment request received`);

  try {
    const { locationId } = await request.json();

    if (!locationId) {
      return jsonResponse({ error: 'locationId is required' }, 400);
    }

    const result = await removeAssignment(platform, locationId);

    console.log(`[${requestId}] Image unassigned from location ${locationId}`);
    return jsonResponse(result);
  } catch (error) {
    console.error(`[${requestId}] Error processing unassignment:`, error);
    return jsonResponse({ error: error.message || 'Unassignment failed' }, 500);
  }
}
