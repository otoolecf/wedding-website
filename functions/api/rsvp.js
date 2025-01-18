// functions/api/rsvp.js - Handle RSVP submissions
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.attending) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert into D1
    await env.DB.prepare(
      `
      INSERT INTO rsvps (name, email, attending, guests, dietary_requirements, song)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    )
      .bind(
        data.name,
        data.email,
        data.attending,
        data.guests || 0,
        data.dietaryRequirements || '',
        data.song || ''
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save RSVP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
