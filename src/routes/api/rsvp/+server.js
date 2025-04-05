// src/routes/api/rsvp/+server.js
import { sendRsvpConfirmationEmail } from '$lib/services/email';

export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New RSVP submission received`);

  try {
    const data = await request.json();
    console.log(`[${requestId}] Received RSVP data:`, {
      name: data.name,
      email: data.email,
      attending: data.attending,
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
    const guestCheck = await platform.env.RSVPS.prepare(
      `
      SELECT * FROM guest_list 
      WHERE LOWER(name) = LOWER(?) 
      OR LOWER(partner_name) = LOWER(?)
    `
    )
      .bind(data.name, data.name)
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

    // Check if this is an update
    const existingRsvp = await platform.env.RSVPS.prepare('SELECT * FROM rsvps WHERE name = ?')
      .bind(data.name)
      .first();

    // Insert or update the RSVP
    const stmt = platform.env.RSVPS.prepare(`
      INSERT OR REPLACE INTO rsvps (
        name, 
        email, 
        attending, 
        guests,
        is_vegetarian,
        food_allergies,
        lodging,
        using_transport,
        song,
        special_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt
      .bind(
        data.name,
        data.email,
        data.attending,
        data.guests || 0,
        data.is_vegetarian || 'no',
        data.food_allergies || '',
        data.lodging || 'no',
        data.using_transport || 'no',
        data.song || '',
        data.special_notes || ''
      )
      .run();

    console.log(`[${requestId}] RSVP raw result: `, result);
    console.log(`[${requestId}] RSVP successfully ${existingRsvp ? 'updated' : 'saved'}`, {
      success: true,
      meta: {
        email: data.email,
        attending: data.attending,
        timestamp: new Date().toISOString(),
        isUpdate: !!existingRsvp
      }
    });

    // Look up the inserted record to confirm and log details
    const inserted = await platform.env.RSVPS.prepare(
      'SELECT * FROM rsvps WHERE name = ? ORDER BY created_at DESC LIMIT 1'
    )
      .bind(data.name)
      .all();

    console.log(`[${requestId}] Database record verified:`, {
      found: inserted.results.length > 0,
      record: inserted.results[0]
    });

    // Send confirmation email
    try {
      await sendRsvpConfirmationEmail(data, platform);
      console.log(`[${requestId}] Confirmation email sent successfully`);
    } catch (emailError) {
      console.error(`[${requestId}] Failed to send confirmation email:`, emailError);
      // Don't fail the RSVP submission if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        isUpdate: !!existingRsvp,
        requestId
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
        details: error.message,
        requestId
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
