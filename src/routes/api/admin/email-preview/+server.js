import { buildRsvpEmailContent } from '$lib/services/email';

export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const { template } = await request.json();
    let rsvp = await platform.env.RSVPS.prepare(
      "SELECT * FROM rsvps WHERE email IS NOT NULL AND email <> '' ORDER BY created_at DESC LIMIT 1"
    ).first();

    if (!rsvp) {
      rsvp = {
        name: 'Test Guest',
        email: 'test@example.com',
        attending: 'yes'
      };
    }

    const html = await buildRsvpEmailContent(rsvp, platform, template);
    return jsonResponse({ html });
  } catch (error) {
    console.error('Error building email preview:', error);
    return jsonResponse({ error: 'Failed to build preview' }, 500);
  }
}
