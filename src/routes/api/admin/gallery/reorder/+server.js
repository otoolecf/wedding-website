// src/routes/api/admin/gallery/reorder/+server.js
export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Production Mode: Validate JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestId = crypto.randomUUID();
  const data = await request.json();
  console.log(`[${requestId}] New reorder submission received, data: `, data);

  if (!Array.isArray(data.images)) {
    return jsonResponse({ error: 'Need an array of images' }, 400);
  }

  // Update KV store with new order
  const updates = data.images.map((image, index) => {
    const key = `gallery:${index + 1}`;
    return {
      key,
      value: image.id,
      metadata: {
        r2_key: image.id
        // alt: image.alt || ''
      }
    };
  });

  for (const img_object of updates) {
    await platform.env.IMAGES_KV.put(img_object.key, img_object.value, {
      metadata: img_object.metadata
    });
  }
  console.log(`[${requestId}] KV updated with new order!`);

  // Return the updated list directly
  const frontend_format = updates.map((img_object) => {
    return {
      id: img_object.metadata.r2_key,
      kv_id: img_object.key,
      src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_object.metadata.r2_key}`
      // alt: img_object.metadata.alt
    };
  });

  return jsonResponse({
    message: 'reorder successful!',
    num_reordered: updates.length,
    images: frontend_format
  });
}
