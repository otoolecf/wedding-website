export async function GET({ platform }) {
  try {
    // Check if table exists and create if it doesn't
    await platform.env.RSVPS.prepare(
      `
      CREATE TABLE IF NOT EXISTS guest_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        partner_name TEXT,
        plus_one_allowed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    ).run();

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
    // Check if table exists and create if it doesn't
    await platform.env.RSVPS.prepare(
      `
      CREATE TABLE IF NOT EXISTS guest_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        partner_name TEXT,
        plus_one_allowed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    ).run();

    const guest = await request.json();

    if (!guest.name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if guest already exists
    const existingGuest = await platform.env.RSVPS.prepare(
      'SELECT * FROM guest_list WHERE name = ?'
    )
      .bind(guest.name)
      .first();

    if (existingGuest) {
      return new Response(JSON.stringify({ error: 'Guest already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await platform.env.RSVPS.prepare(
      `
      INSERT INTO guest_list (
        name,
        partner_name,
        plus_one_allowed
      ) VALUES (?, ?, ?)
      `
    )
      .bind(guest.name, guest.partner_name || null, guest.plus_one_allowed ? 1 : 0)
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

export async function DELETE({ request, platform }) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Guest ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Delete the guest
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
