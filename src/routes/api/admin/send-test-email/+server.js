import { sendRsvpConfirmationEmail } from '$lib/services/email';

export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const { email } = await request.json();
    if (!email) return jsonResponse({ error: 'Email is required' }, 400);

    let rsvp = await platform.env.RSVPS.prepare(
      "SELECT * FROM rsvps WHERE email IS NOT NULL AND email <> '' ORDER BY created_at DESC LIMIT 1"
    ).first();
    if (!rsvp) {
      rsvp = { name: 'Test Guest', email, attending: 'yes' };
    }

    await sendRsvpConfirmationEmail(rsvp, platform, email);
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error sending test email:', error);
    return jsonResponse({ error: 'Failed to send test email' }, 500);
  }
}
