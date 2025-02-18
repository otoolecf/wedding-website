// src/routes/api/admin/gallery/[gallery_id]/remove/+server.js
export async function POST({ request, params, platform }) {
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
    // Parse the current state of the gallery from the request body
    const currentState = await request.json();
    console.log(`[${requestId}] currentState: `, currentState);
    // Ensure currentState.images is an array
    if (!Array.isArray(currentState.images)) {
      return jsonResponse({ error: 'Invalid gallery state' }, 400);
    }

    // Filter out the image to be deleted
    const remainingImages = currentState.images.filter((img) => img.kv_id !== params.gallery_id);
    console.log(`[${requestId}] remainingImages: `, remainingImages);
    // Extract the new order of image IDs
    const order_list = remainingImages.map((image) => image.id);

    console.log(`[${requestId}] New order before updating: `, JSON.stringify(order_list));

    // Update the gallery order in the KV store
    await platform.env.IMAGES_KV.put('gallery_order', JSON.stringify(order_list));

    const image_to_remove = currentState.images.find((img) => img.kv_id === params.gallery_id);

    console.log(`[${requestId}] image_to_remove: `, image_to_remove);
    // Remove the image from R2
    const r2_to_remove = image_to_remove?.r2_key;
    console.log(`[${requestId}] r2_to_remove: `, r2_to_remove);
    if (r2_to_remove) {
      await platform.env.IMAGES_BUCKET.delete(r2_to_remove);
      console.log(`[${requestId}] Image deleted from R2: ${r2_to_remove}`);
    }

    // remove it from KV too
    await platform.env.IMAGES_KV.delete(params.gallery_id);
    console.log(`[${requestId}] removed id from KV: ${params.gallery_id}`);

    return jsonResponse({
      message: 'delete successful!',
      images: remainingImages
    });
  } catch (error) {
    console.error(`[${requestId}] Error processing delete:`, error);
    return jsonResponse({ error: 'Delete failed' }, 500);
  }
}
