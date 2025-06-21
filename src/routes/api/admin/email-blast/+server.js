import { sendEmailBlast } from '$lib/services/email';

export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) return jsonResponse({ error: 'Unauthorized' }, 401);

  try {
    const { template, subject } = await request.json();
    const result = await sendEmailBlast(platform, template, subject);
    return jsonResponse({ success: true, ...result });
  } catch (error) {
    console.error('Error sending email blast:', error);
    return jsonResponse({ error: 'Failed to send emails' }, 500);
  }
}
