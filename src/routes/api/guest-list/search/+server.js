export async function GET({ url, platform }) {
  const name = url.searchParams.get('name');

  if (!name) {
    return new Response(JSON.stringify({ error: 'Name parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if table exists and create if it doesn't
    await platform.env.RSVPS.prepare(
      `
      CREATE TABLE IF NOT EXISTS guest_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        partner_name TEXT,
        partner_email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    ).run();

    // Search for both primary guests and their partners
    const results = await platform.env.RSVPS.prepare(
      `
      SELECT 
        g1.id,
        g1.name,
        g1.email,
        g1.partner_name,
        g1.partner_email,
        CASE 
          WHEN g1.partner_name IS NOT NULL THEN 1
          ELSE 0
        END as has_partner
      FROM guest_list g1
      LEFT JOIN guest_list g2 ON g1.partner_name = g2.name
      WHERE g1.name LIKE ? OR g1.partner_name LIKE ?
      ORDER BY has_partner DESC, g1.name ASC
      LIMIT 5
      `
    )
      .bind(`%${name}%`, `%${name}%`)
      .all();

    // Process results to combine couples
    const processedResults = results.results.map((guest) => ({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      partner: guest.partner_name
        ? {
            name: guest.partner_name,
            email: guest.partner_email
          }
        : null
    }));

    return new Response(JSON.stringify({ results: processedResults }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Guest list search error:', error);
    // Return empty results instead of an error if the table doesn't exist or is empty
    if (error.message.includes('no such table') || error.message.includes('empty')) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ error: 'Failed to search guest list' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
