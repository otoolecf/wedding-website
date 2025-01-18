// functions/api/admin/rsvps.js
export async function onRequest(context) {
  const { request, env } = context;

  // Debug logging
  console.log('Request headers:', Object.fromEntries(request.headers));

  // Verify Cloudflare Access JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    console.error('No JWT token found');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const results = await env.DB.prepare(`SELECT * FROM rsvps ORDER BY created_at DESC`).all();

    return new Response(JSON.stringify({ rsvps: results.results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Admin API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch RSVPs' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
