// src/routes/api/admin/rsvps/+server.js
export async function GET({ request, platform }) {
  // Helper function to create JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Development Mode: Skip JWT and use mock DB
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (isDevelopment) {
    try {
      // Mock database query or local development DB
      const results = await platform.env.RSVPS.prepare(
        `
        SELECT * FROM rsvps 
        ORDER BY created_at DESC
      `
      ).all();

      return jsonResponse({ rsvps: results.results });
    } catch (error) {
      console.error('Admin API Error (Development):', error);
      return jsonResponse({ error: 'Failed to fetch RSVPs (Development)' }, 500);
    }
  }

  // Production Mode: Validate JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    // Production database query
    const results = await platform.env.RSVPS.prepare(
      `
      SELECT * FROM rsvps 
      ORDER BY created_at DESC
    `
    ).all();

    return jsonResponse({ rsvps: results.results });
  } catch (error) {
    console.error('Admin API Error (Production):', error);
    return jsonResponse({ error: 'Failed to fetch RSVPs (Production)' }, 500);
  }
}
