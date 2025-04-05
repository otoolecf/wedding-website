// src/routes/api/rsvp/+server.js
export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New RSVP submission received`);

  try {
    const data = await request.json();
    console.log(`[${requestId}] Received RSVP data:`, {
      name: data.name,
      email: data.email,
      attending: data.attending,
      guests: data.guests || 0,
      hasDietaryRequirements: !!data.dietaryRequirements,
      hasSongRequest: !!data.song,
      timestamp: new Date().toISOString()
    });

    // Validate required fields
    if (!data.name || !data.email || !data.attending) {
      const missingFields = [];
      if (!data.name) missingFields.push('name');
      if (!data.email) missingFields.push('email');
      if (!data.attending) missingFields.push('attending');

      console.error(`[${requestId}] Validation failed - Missing required fields:`, missingFields);
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: `Missing: ${missingFields.join(', ')}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if the guest exists in the guest list
    const guestCheck = await platform.env.RSVPS.prepare('SELECT * FROM guest_list WHERE name = ?')
      .bind(data.name)
      .first();

    if (!guestCheck) {
      console.error(`[${requestId}] Guest not found in guest list:`, data.name);
      return new Response(
        JSON.stringify({
          error: 'Guest not found',
          details:
            'Your name was not found in our guest list. Please contact the couple if you believe this is an error.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if plus one is allowed
    if (guestCheck.plus_one_allowed === false && data.guests > 0) {
      console.error(`[${requestId}] Plus one not allowed for guest:`, data.name);
      return new Response(
        JSON.stringify({
          error: 'Additional guests not allowed',
          details:
            'You are not allowed to bring additional guests. Please contact the couple if you believe this is an error.'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[${requestId}] Preparing SQL insert`);
    const stmt = platform.env.RSVPS.prepare(`
      INSERT INTO rsvps (name, email, attending, guests, dietary_requirements, song)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt
      .bind(
        data.name,
        data.email,
        data.attending,
        data.guests || 0,
        data.dietaryRequirements || '',
        data.song || ''
      )
      .run();

    console.log(`[${requestId}] RSVP raw result: `, result);
    console.log(`[${requestId}] RSVP successfully saved`, {
      success: true,
      meta: {
        email: data.email,
        attending: data.attending,
        guests: data.guests || 0,
        timestamp: new Date().toISOString()
      }
    });

    // Look up the inserted record to confirm and log details
    const inserted = await platform.env.RSVPS.prepare(
      'SELECT * FROM rsvps WHERE email = ? ORDER BY created_at DESC LIMIT 1'
    )
      .bind(data.email)
      .all();

    console.log(`[${requestId}] Database record verified:`, {
      found: inserted.results.length > 0,
      record: inserted.results[0]
    });

    return new Response(
      JSON.stringify({
        success: true,
        requestId // Include requestId in response for tracking
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error(`[${requestId}] RSVP Error:`, {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        error: 'Failed to save RSVP',
        requestId // Include requestId in error response too
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
