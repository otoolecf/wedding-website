// src/routes/api/admin/gallery/upload/+server.js

/**
 * Site Image uploads will always add to the gallery. There is KV store with
 * gallery:' prefix, and R2 object ID as value. Also in metadata for efficient lists.
 */
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
  console.log(`[${requestId}] New Upload submission received`);
  const formData = await request.formData();
  const file = formData.get('file');
  console.log(`[${requestId}] file.name: ${file.name}`);
  const fileBuffer = await file.arrayBuffer();
  const fileHashCrypto = await crypto.subtle.digest('MD5', fileBuffer);
  const hashArray = Array.from(new Uint8Array(fileHashCrypto));
  const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const fileExtension = file.name.split('.').pop();
  const img_key = `${fileHash}`;
  console.log(
    `[${requestId}] image hashed, filename: ${file.name}, fileHash: ${fileHash}, img_key: ${img_key}, fileExtension: ${fileExtension}`
  );

  // Save the file to R2
  // This will always update based on file hash
  const R2_set = await platform.env.IMAGES_BUCKET.put(fileHash, file);
  console.log(`[${requestId}] R2_set: `, R2_set);

  const all_imgs_list = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  // this list will have metadata objects that we can use to see if the img_key exists
  const num_images = all_imgs_list?.keys?.length || 0;
  console.log(`[${requestId}] KV num_images: ${num_images}`);

  const R2_exists = all_imgs_list.keys.find((img) => img.metadata?.r2_key === img_key);
  console.log(`[${requestId}] R2_exists? `, R2_exists);

  // If not in R2 already, we need to add a new KV gallery entry too
  if (!R2_exists) {
    // let's make the new entry!
    // we will just make this img_id + 1 for the site gallery_id.
    // list all objects in the images bucket to see

    const img_gallery_idx = num_images + 1;

    // we also want to add the r2_key to metadata for easy lookup per https://developers.cloudflare.com/kv/api/list-keys/
    const img_KV_put = await platform.env.IMAGES_KV.put(`gallery:${img_gallery_idx}`, img_key, {
      metadata: { r2_key: img_key, file_ext: fileExtension }
    });
    console.log(`[${requestId}] img_KV_put!`, img_KV_put);
  } else {
    console.log(`[${requestId}] image already exists, just an update!`);
  }
  return jsonResponse({ message: 'upload successful', image_id: img_key });
}
