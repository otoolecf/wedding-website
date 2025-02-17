// src/routes/api/admin/gallery/upload/+server.js
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
  const R2_set = await platform.env.IMAGES_BUCKET.put(fileHash, file);
  console.log(`[${requestId}] R2_set: `, R2_set);

  const all_imgs_list = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  const num_images = all_imgs_list?.keys?.length || 0;
  console.log(`[${requestId}] KV num_images: ${num_images}`);

  const R2_exists = all_imgs_list.keys.find((img) => img.metadata?.r2_key === img_key);
  console.log(`[${requestId}] R2_exists? `, R2_exists);

  let updated_images = [];

  if (!R2_exists) {
    const img_gallery_idx = num_images + 1;
    const img_KV_put = await platform.env.IMAGES_KV.put(`gallery:${img_gallery_idx}`, img_key, {
      metadata: { r2_key: img_key }
    });
    console.log(`[${requestId}] img_KV_put!`, img_KV_put);

    // Construct the updated list directly
    updated_images = [
      ...all_imgs_list.keys,
      {
        name: `gallery:${img_gallery_idx}`,
        metadata: { r2_key: img_key }
      }
    ];
  } else {
    console.log(`[${requestId}] image already exists, just an update!`);
    updated_images = all_imgs_list.keys;
  }

  // Return the updated list directly
  const frontend_format = updated_images.map((img_data) => {
    return {
      id: img_data.metadata?.r2_key,
      kv_id: img_data.name,
      src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_data.metadata?.r2_key}`,
      alt: img_data.metadata?.alt
    };
  });

  return jsonResponse({
    message: 'upload successful',
    new_image_id: img_key,
    images: frontend_format
  });
}
