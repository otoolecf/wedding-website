export async function GET({ platform }) {
  try {
    const results = await platform.env.RSVPS.prepare(
      `
      SELECT * FROM guest_list 
      ORDER BY name ASC
      `
    ).all();

    return new Response(JSON.stringify({ guests: results.results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching guest list:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch guest list' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request, platform }) {
  try {
    const guest = await request.json();

    if (!guest.name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await platform.env.RSVPS.prepare(
      `
      INSERT INTO guest_list (
        name,
        email,
        partner_name,
        partner_email,
        plus_one_allowed
      ) VALUES (?, ?, ?, ?, ?)
      `
    )
      .bind(
        guest.name,
        guest.email || null,
        guest.partner_name || null,
        guest.partner_email || null,
        guest.plus_one_allowed ? 1 : 0
      )
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error adding guest:', error);
    return new Response(JSON.stringify({ error: 'Failed to add guest' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ params, platform }) {
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Guest ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    await platform.env.RSVPS.prepare('DELETE FROM guest_list WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete guest' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
