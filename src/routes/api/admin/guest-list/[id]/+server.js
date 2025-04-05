export async function DELETE({ params, platform }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid guest ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First delete the RSVPs
    const rsvpResult = await platform.env.RSVPS.prepare('DELETE FROM rsvps WHERE guest_id = ?')
      .bind(id)
      .run();

    // Then delete the guest
    const guestResult = await platform.env.RSVPS.prepare('DELETE FROM guest_list WHERE id = ?')
      .bind(id)
      .run();

    if (guestResult.success) {
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
    return new Response(
      JSON.stringify({
        error: 'Failed to delete guest',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
