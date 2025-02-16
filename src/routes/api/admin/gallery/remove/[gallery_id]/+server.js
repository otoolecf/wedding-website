// src/routes/api/admin/gallery/[gallery_id]/remove/+server.js
export async function DELETE({ request, params, platform }) {
  // Delete will give us the current key to remove. Then we also need to reorder everything after.
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

  console.log(`[${requestId}] New delete received, gallery_id: `, params.gallery_id);
  // get all, since we will have to reorder
  const gallery_imgs = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  const existing_img = gallery_imgs?.keys.find((img_data) => img_data.name === params.gallery_id);
  if (!existing_img) {
    return jsonResponse({ error: `gallery_id ${params.gallery_id} not found` }, 404);
  }
  // existing img will have r2_key as metadata
  const r2_to_remove = existing_img.metadata?.r2_key;
  let existing_idx = existing_img.name.split(':').pop();
  if (typeof existing_idx !== 'number') existing_idx = parseInt(existing_idx, 10);
  console.log(`[${requestId}] r2_to_remove: ${r2_to_remove}, existing_idx: ${existing_idx} `);

  // get the keys ready to update; everything after current image needs to move back
  const update_keys = gallery_imgs.keys?.slice(existing_idx + 1);
  const applied_updates = update_keys.map((img_info) => {
    let old_img_idx = img_info.name.split(':').pop();
    if (typeof old_img_idx !== 'number') old_img_idx = parseInt(old_img_idx, 10);
    const new_img_idx = old_img_idx - 1;
    const new_update_kv = {
      key: `gallery:${new_img_idx}`,
      value: img_info.metadata.r2_key,
      metadata: img_info.metadata
    };
    return new_update_kv;
  });

  // delete from r2; if failure, need to bail
  try {
    const r2_delete_res = platform.env.IMAGES_BUCKET.delete(r2_to_remove);
    console.log(`[${requestId}] r2_delete_res: `, r2_delete_res);
  } catch (delete_err) {
    console.error(`[${requestId}] error deleting r2_key ${r2_to_remove}, err: `, delete_err);
    return jsonResponse({ error: 'Error while deleting image' }, 500);
  }
  // now we update all the keys!
  for (const img_object of applied_updates) {
    await platform.env.IMAGES_KV.put(img_object.key, img_object.value, {
      metadata: img_object.metadata
    });
  }
  console.log(`[${requestId}] KV updated!`);

  return jsonResponse({
    message: 'delete successful!',
    removed_key: r2_to_remove,
    num_reordered: applied_updates.length
  });
}
