export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON in request' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Validate required fields
    if (!data.name || !data.email || (!data.attending && data.attending !== false)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Insert into D1
    try {
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
    } catch (dbError) {
      console.error('Database Error:', dbError);
      return new Response(JSON.stringify({ error: 'Database error occurred' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('RSVP Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
