export async function DELETE({ params, platform }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid guest ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Start a transaction to delete both guest and their RSVPs
    const result = await platform.env.RSVPS.prepare(
      `
      BEGIN TRANSACTION;
      DELETE FROM rsvps WHERE guest_id = ?;
      DELETE FROM guest_list WHERE id = ?;
      COMMIT;
    `
    )
      .bind(id, id)
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Guest not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error deleting guest:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete guest' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
