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
