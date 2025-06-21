// src/routes/api/rsvp/+server.js
import { sendRsvpConfirmationEmail } from '$lib/services/email';

export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Received RSVP request`);

  try {
    // Ensure the rsvps table has the proper structure
    await platform.env.RSVPS.prepare(
      `
      CREATE TABLE IF NOT EXISTS rsvps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        attending TEXT NOT NULL,
        guests INTEGER DEFAULT 0,
        is_vegetarian TEXT DEFAULT 'no',
        food_allergies TEXT,
        lodging TEXT DEFAULT 'no',
        using_transport TEXT DEFAULT 'no',
        song TEXT,
        special_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name)
      )
    `
    ).run();

    // Drop and recreate the table to ensure proper structure
    try {
      await platform.env.RSVPS.prepare('DROP TABLE rsvps').run();
      await platform.env.RSVPS.prepare(
        `
        CREATE TABLE rsvps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          attending TEXT NOT NULL,
          guests INTEGER DEFAULT 0,
          is_vegetarian TEXT DEFAULT 'no',
          food_allergies TEXT,
          lodging TEXT DEFAULT 'no',
          using_transport TEXT DEFAULT 'no',
          song TEXT,
          special_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(name)
        )
      `
      ).run();
    } catch (error) {
      console.log('Error recreating table:', error.message);
    }

    const data = await request.json();
    console.log(`[${requestId}] RSVP data:`, data);

    // Validate primary guest data
    if (!data.primary) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Missing: primary guest data'
        }),
        { status: 400 }
      );
    }

    const { primary, partner } = data;

    // Validate required fields for primary guest
    const requiredFields = ['name', 'email', 'attending'];
    const missingFields = requiredFields.filter((field) => !primary[field]);
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: `Missing: ${missingFields.join(', ')}`
        }),
        { status: 400 }
      );
    }

    // Check if guest exists in guest list
    const guestCheck = await platform.env.RSVPS.prepare(
      'SELECT * FROM guest_list WHERE LOWER(name) = LOWER(?)'
    )
      .bind(primary.name)
      .first();

    if (!guestCheck) {
      return new Response(
        JSON.stringify({
          error: 'Guest not found',
          details:
            'Your name was not found in our guest list. Please contact us if you believe this is an error.'
        }),
        { status: 404 }
      );
    }

    // Update guest list email if it's different or empty
    if (primary.email && primary.email !== guestCheck.email) {
      try {
        await platform.env.RSVPS.prepare(
          'UPDATE guest_list SET email = ? WHERE id = ?'
        )
          .bind(primary.email, guestCheck.id)
          .run();
        console.log(`[${requestId}] Updated guest list email for ${primary.name}`);
      } catch (emailUpdateError) {
        console.warn(`[${requestId}] Failed to update guest list email:`, emailUpdateError);
        // Don't fail the request if guest list update fails
      }
    }

    // Check if this is an update
    const existingRsvp = await platform.env.RSVPS.prepare(
      'SELECT * FROM rsvps WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)'
    )
      .bind(primary.name, primary.email)
      .first();

    const isUpdate = !!existingRsvp;

    // Insert or update primary guest's RSVP
    if (isUpdate) {
      await platform.env.RSVPS.prepare(
        `UPDATE rsvps SET 
          name = ?,
          email = ?,
          attending = ?,
          guests = ?,
          is_vegetarian = ?,
          food_allergies = ?,
          lodging = ?,
          using_transport = ?,
          song = ?,
          special_notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(name) = LOWER(?) OR LOWER(email) = LOWER(?)`
      )
        .bind(
          primary.name,
          primary.email,
          primary.attending,
          primary.guests || 0,
          primary.is_vegetarian || 'no',
          primary.food_allergies || '',
          primary.lodging || 'no',
          primary.using_transport || 'no',
          primary.song || '',
          primary.special_notes || '',
          primary.name,
          primary.email
        )
        .run();
    } else {
      await platform.env.RSVPS.prepare(
        `INSERT INTO rsvps (
          name, email, attending, guests, is_vegetarian, 
          food_allergies, lodging, using_transport, song, special_notes,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
        .bind(
          primary.name,
          primary.email,
          primary.attending,
          primary.guests || 0,
          primary.is_vegetarian || 'no',
          primary.food_allergies || '',
          primary.lodging || 'no',
          primary.using_transport || 'no',
          primary.song || '',
          primary.special_notes || ''
        )
        .run();
    }

    // Handle partner RSVP if provided
    if (partner && partner.name) {
      const partnerCheck = await platform.env.RSVPS.prepare(
        'SELECT * FROM rsvps WHERE LOWER(name) = LOWER(?)'
      )
        .bind(partner.name)
        .first();

      if (partnerCheck) {
        // Update existing partner RSVP
        await platform.env.RSVPS.prepare(
          `UPDATE rsvps SET 
            attending = ?,
            is_vegetarian = ?,
            food_allergies = ?,
            lodging = ?,
            using_transport = ?,
            song = ?,
            special_notes = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE LOWER(name) = LOWER(?)`
        )
          .bind(
            partner.attending,
            partner.is_vegetarian || 'no',
            partner.food_allergies || '',
            partner.lodging || 'no',
            partner.using_transport || 'no',
            partner.song || '',
            partner.special_notes || '',
            partner.name
          )
          .run();
      } else {
        // Insert new partner RSVP
        await platform.env.RSVPS.prepare(
          `INSERT INTO rsvps (
            name, attending, is_vegetarian, food_allergies, 
            lodging, using_transport, song, special_notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        )
          .bind(
            partner.name,
            partner.attending,
            partner.is_vegetarian || 'no',
            partner.food_allergies || '',
            partner.lodging || 'no',
            partner.using_transport || 'no',
            partner.song || '',
            partner.special_notes || ''
          )
          .run();
      }
    }

    // Send confirmation email only for primary guest
    if (primary.attending === 'yes') {
      try {
        await sendRsvpConfirmationEmail(primary, platform);
        console.log(`[${requestId}] Confirmation email sent to ${primary.email}`);
      } catch (emailError) {
        console.error(`[${requestId}] Failed to send confirmation email:`, emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        isUpdate,
        message: isUpdate ? 'RSVP updated successfully' : 'RSVP submitted successfully'
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(`[${requestId}] RSVP Error:`, error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process RSVP',
        details: error.message
      }),
      { status: 500 }
    );
  }
}
