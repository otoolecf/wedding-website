// src/routes/api/admin/gallery/upload/+server.js
import { v4 as uuidv4 } from 'uuid';

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
  console.log(`[${requestId}] New upload request received`);

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const fileBuffer = await file.arrayBuffer();
    const fileHashCrypto = await crypto.subtle.digest('MD5', fileBuffer);
    const hashArray = Array.from(new Uint8Array(fileHashCrypto));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const fileExtension = file.name.split('.').pop();
    const img_key = `${fileHash}`;

    console.log(`[${requestId}] File hashed: ${fileHash}, File extension: ${fileExtension}`);

    // Save the file to R2
    await platform.env.IMAGES_BUCKET.put(fileHash, file);
    console.log(`[${requestId}] File saved to R2 successfully`);

    const img_uuid = uuidv4(); // Use a UUID for the image identifier
    const img_metadata = { r2_key: img_key, version: Date.now() }; // Add a version timestamp
    await platform.env.IMAGES_KV.put(`image:${img_uuid}`, JSON.stringify(img_metadata));
    console.log(`[${requestId}] Image metadata saved to KV store`);

    // Receive the full state from the frontend via FormData
    const galleryState = formData.get('galleryState');
    let currentState = { images: [] };
    if (galleryState) {
      currentState = JSON.parse(galleryState);
    }

    // Ensure currentState.images is an array
    if (!Array.isArray(currentState.images)) {
      currentState.images = [];
    }

    const updatedImages = [
      ...currentState.images,
      {
        id: img_uuid,
        kv_id: `image:${img_uuid}`,
        src: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_key}`
      }
    ];

    // Update the gallery order in the KV store
    await platform.env.IMAGES_KV.put(
      'gallery_order',
      JSON.stringify(updatedImages.map((img) => img.id))
    );
    console.log(`[${requestId}] Gallery order updated in KV store`);

    return jsonResponse({
      message: 'upload successful',
      new_image_id: img_uuid,
      images: updatedImages
    });
  } catch (error) {
    console.error(`[${requestId}] Error processing upload:`, error);
    return jsonResponse({ error: 'Upload failed' }, 500);
  }
}
