// src/routes/api/admin/gallery/assignments/+server.js
import { fetchImageAssignments } from '$lib/imageAssignments';

export async function GET({ request, platform }) {
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
  console.log(`[${requestId}] Fetching all image assignments`);

  try {
    const assignments = await fetchImageAssignments(platform);
    return jsonResponse({ assignments });
  } catch (error) {
    console.error(`[${requestId}] Error fetching assignments:`, error);
    return jsonResponse({ error: 'Failed to fetch assignments' }, 500);
  }
}
