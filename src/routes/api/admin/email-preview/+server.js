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
    const { template, templateType } = await request.json();
    
    let html;
    if (templateType === 'blast') {
      // For blast emails, just return the template as-is (no form data)
      html = template || '<p>No template content</p>';
    } else {
      // For confirmation emails, build with form data
      let rsvp = await platform.env.RSVPS.prepare(
        "SELECT * FROM rsvps WHERE email IS NOT NULL AND email <> '' ORDER BY created_at DESC LIMIT 1"
      ).first();

      if (!rsvp) {
        rsvp = {
          name: 'Test Guest',
          email: 'test@example.com',
          attending: 'yes',
          is_vegetarian: 'no',
          food_allergies: 'None',
          lodging: 'yes',
          using_transport: 'yes',
          song: 'Your Song by Elton John',
          special_notes: 'Looking forward to celebrating with you!'
        };
      }

      html = await buildRsvpEmailContent(rsvp, platform, template, 'confirmation');
    }
    
    return jsonResponse({ html });
  } catch (error) {
    console.error('Error building email preview:', error);
    return jsonResponse({ error: 'Failed to build preview' }, 500);
  }
}
