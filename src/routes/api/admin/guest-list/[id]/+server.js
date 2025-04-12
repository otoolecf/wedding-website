export async function DELETE({ params, platform }) {
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return new Response(JSON.stringify({ error: 'Valid guest ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // First check if the guest exists
    const guestCheck = await platform.env.RSVPS.prepare('SELECT * FROM guest_list WHERE id = ?')
      .bind(id)
      .first();

    if (!guestCheck) {
      return new Response(JSON.stringify({ error: 'Guest not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try to delete RSVPs first, but don't fail if the table doesn't exist
    try {
      await platform.env.RSVPS.prepare('DELETE FROM rsvps WHERE guest_id = ?').bind(id).run();
    } catch (rsvpError) {
      console.warn('Error deleting RSVPs:', rsvpError);
      // Continue with guest deletion even if RSVP deletion fails
    }

    // Delete the guest
    const result = await platform.env.RSVPS.prepare('DELETE FROM guest_list WHERE id = ?')
      .bind(id)
      .run();

    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to delete guest' }), {
        status: 500,
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
