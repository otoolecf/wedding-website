// src/routes/api/admin/gallery/reorder/+server.js
export async function POST({ request, platform }) {
  // Reorder will be a drag-drop probably and just bump down things in the gallery. So will need to update several keys.
  // KV will need to store bidirectional to make this easier
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
  if (!data.gallery_key && !data.new_idx) {
    return jsonResponse({ error: 'Need gallery_key and new_idx' }, 400);
  }

  let old_idx = data.gallery_key.split(':').pop();
  if (typeof old_idx !== 'number') old_idx = parseInt(old_idx, 10);
  console.log(`[${requestId}] old_idx: ${old_idx}, new_idx: ${data.new_idx} `);
  // assuming we have old location and new location and can just sort / reassign everything in between
  // probably easiest to get everything and bump
  // get every galleryID in the KV
  // keys already sorted according to https://developers.cloudflare.com/kv/api/list-keys/

  const gallery_imgs = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });

  let updates = [];
  const operator = old_idx < data.new_idx ? 'subtract' : 'add';
  console.log(`[${requestId}] operator: ${operator}`);
  // here we have all keys plus metadata, want to slice between this list to update all at once
  if (old_idx < data.new_idx) {
    // old key before new key, old key was move to later point in gallery
    // everything between old and new needs to change
    updates = gallery_imgs?.keys?.slice(old_idx - 1, data.new_idx); // don't need to subtract 1 because excluded
  } else {
    // old key after new key, meaning image moved towards front of gallery
    // everything after old_idx needs to move back
    updates = gallery_imgs?.keys?.slice(data.new_idx - 1, old_idx);
  }

  // now update updates according to operator;
  // we can reformat for easy write to the new stuff
  const applied_updates = updates?.length
    ? updates.map((img_info) => {
        let old_img_idx = img_info.name.split(':').pop();
        if (typeof old_img_idx !== 'number') old_img_idx = parseInt(old_img_idx, 10);
        const new_img_idx = operator === 'subtract' ? old_img_idx - 1 : old_img_idx + 1;
        const new_update_kv = {
          key: `gallery:${new_img_idx}`,
          value: img_info.metadata?.r2_key,
          metadata: img_info.metadata
        };
        return new_update_kv;
      })
    : [];

  console.log(`[${requestId}] applied_updates:`, applied_updates);
  console.log(`[${requestId}] updates length:`, applied_updates.length);
  for (const img_object of applied_updates) {
    await platform.env.IMAGES_KV.put(img_object.key, img_object.value, {
      metadata: img_object.metadata
    });
  }
  console.log(`[${requestId}] KV updated!`);
  // now need to return full KV list
  const all_imgs_list_updated = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  const frontend_format = all_imgs_list_updated.keys?.length
    ? all_imgs_list_updated.keys.map((img_data) => {
        return {
          id: img_data.metadata?.r2_key,
          kv_id: img_data.name,
          src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_data.metadata?.r2_key}`,
          alt: img_data.metadata?.alt
        };
      })
    : [];

  return jsonResponse({
    message: 'reorder successful!',
    num_reordered: applied_updates.length,
    images: frontend_format
  });
}
