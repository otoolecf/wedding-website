// src/routes/api/admin/gallery/reorder/+server.js
export async function POST({ request, platform }) {
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
  console.log(`[${requestId}] New reorder request received`);

  try {
    const data = await request.json();

    // Validate that data.images is an array
    if (!Array.isArray(data.images)) {
      return jsonResponse({ error: 'Need an array of images' }, 400);
    }

    // Extract the new order of image IDs
    const order_list = data.images.map((image) => image.id);

    // Update the gallery order in the KV store
    await platform.env.IMAGES_KV.put('gallery_order', JSON.stringify(order_list));
    console.log(`[${requestId}] Gallery order updated in KV store`);

    return jsonResponse({
      message: 'reorder successful!',
      images: data.images // Return the updated list of images
    });
  } catch (error) {
    console.error(`[${requestId}] Error processing reorder:`, error);
    return jsonResponse({ error: 'Reorder failed' }, 500);
  }
}
