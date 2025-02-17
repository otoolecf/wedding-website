// src/routes/api/admin/gallery/[gallery_id]/remove/+server.js
export async function DELETE({ request, params, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    console.error(`[${requestId}] Unauthorized access attempt`);
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New delete request received for gallery ID: ${params.gallery_id}`);

  try {
    const currentState = await request.json();
    const remainingImages = currentState.images.filter((img) => img.kv_id !== params.gallery_id);

    // Update the gallery order in the KV store
    await platform.env.IMAGES_KV.put(
      'gallery_order',
      JSON.stringify(remainingImages.map((img) => img.id))
    );
    console.log(`[${requestId}] Gallery order updated in KV store after deletion`);

    // Remove the image from R2
    const r2_to_remove = currentState.images.find((img) => img.kv_id === params.gallery_id)?.id;
    if (r2_to_remove) {
      await platform.env.IMAGES_BUCKET.delete(r2_to_remove);
      console.log(`[${requestId}] Image deleted from R2: ${r2_to_remove}`);
    }

    return jsonResponse({
      message: 'delete successful!',
      images: remainingImages
    });
  } catch (error) {
    console.error(`[${requestId}] Error processing delete:`, error);
    return jsonResponse({ error: 'Delete failed' }, 500);
  }
}
