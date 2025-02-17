// src/routes/api/admin/gallery/[gallery_id]/remove/+server.js
export async function DELETE({ request, params, platform }) {
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
  console.log(`[${requestId}] request: `, request);
  console.log(`[${requestId}] params: `, params);

  console.log(`[${requestId}] New delete received, gallery_id: `, params.gallery_id);

  const gallery_imgs = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  const existing_img = gallery_imgs?.keys.find((img_data) => img_data.name === params.gallery_id);
  console.log(`[${requestId}] existing_img: `, existing_img);
  if (!existing_img) {
    return jsonResponse({ error: `gallery_id ${params.gallery_id} not found` }, 404);
  }

  const r2_to_remove = existing_img.metadata?.r2_key;
  console.log(`[${requestId}] r2_to_remove: ${r2_to_remove}`);

  // Filter out the image to be deleted
  const remaining_images = gallery_imgs.keys.filter(
    (img_data) => img_data.name !== params.gallery_id
  );

  // Sort the remaining images by their current index
  remaining_images.sort((a, b) => {
    const aIndex = parseInt(a.name.split(':').pop(), 10);
    const bIndex = parseInt(b.name.split(':').pop(), 10);
    return aIndex - bIndex;
  });

  // Reassign indices
  const applied_updates = remaining_images.map((img_info, index) => {
    const new_img_idx = index + 1;
    const new_update_kv = {
      key: `gallery:${new_img_idx}`,
      value: img_info.metadata.r2_key,
      metadata: img_info.metadata
    };
    return new_update_kv;
  });

  try {
    const r2_delete_res = await platform.env.IMAGES_BUCKET.delete(r2_to_remove);
    console.log(`[${requestId}] r2_delete_res: `, r2_delete_res);
  } catch (delete_err) {
    console.error(`[${requestId}] error deleting r2_key ${r2_to_remove}, err: `, delete_err);
    return jsonResponse({ error: 'Error while deleting image' }, 500);
  }

  for (const img_object of applied_updates) {
    await platform.env.IMAGES_KV.put(img_object.key, img_object.value, {
      metadata: img_object.metadata
    });
  }
  console.log(`[${requestId}] KV updated!`);

  // Return the updated list directly
  const updated_images = applied_updates.map((img_object) => {
    return {
      id: img_object.metadata.r2_key,
      kv_id: img_object.key,
      src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_object.metadata.r2_key}`,
      alt: img_object.metadata.alt
    };
  });

  return jsonResponse({
    message: 'delete successful!',
    removed_key: r2_to_remove,
    num_reordered: applied_updates.length,
    images: updated_images
  });
}
