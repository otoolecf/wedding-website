export async function DELETE({ params, platform }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid RSVP ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the RSVP
    const result = await platform.env.RSVPS.prepare('DELETE FROM rsvps WHERE id = ?')
      .bind(id)
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'RSVP not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete RSVP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request, params, platform }) {
  try {
    const { id } = params;
    const rsvp = await request.json();

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid RSVP ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update the RSVP
    const result = await platform.env.RSVPS.prepare(
      `
      UPDATE rsvps 
      SET name = ?,
          email = ?,
          attending = ?,
          guests = ?,
          is_vegetarian = ?,
          food_allergies = ?,
          lodging = ?,
          using_transport = ?,
          song = ?,
          special_notes = ?
      WHERE id = ?
    `
    )
      .bind(
        rsvp.name,
        rsvp.email,
        rsvp.attending,
        rsvp.guests,
        rsvp.is_vegetarian,
        rsvp.food_allergies,
        rsvp.lodging,
        rsvp.using_transport,
        rsvp.song,
        rsvp.special_notes,
        id
      )
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'RSVP not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return new Response(JSON.stringify({ error: 'Failed to update RSVP' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
