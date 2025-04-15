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

    // Save original
    await platform.env.IMAGES_BUCKET.put(fileHash, file);
    console.log(`[${requestId}] Original image saved to R2 successfully`);

    // Generate thumbnail (200px width)
    const thumbnailUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${fileHash}?width=200&fit=inside`;
    const thumbnailResponse = await fetch(thumbnailUrl);
    if (!thumbnailResponse.ok) {
      throw new Error(`Failed to generate thumbnail: ${thumbnailResponse.statusText}`);
    }
    const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
    await platform.env.IMAGES_BUCKET.put(`${fileHash}_thumb`, thumbnailBuffer, {
      httpMetadata: { contentType: file.type || 'image/jpeg' }
    });

    // Generate medium size (800px width)
    const mediumUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${fileHash}?width=800&fit=inside`;
    const mediumResponse = await fetch(mediumUrl);
    if (!mediumResponse.ok) {
      throw new Error(`Failed to generate medium size: ${mediumResponse.statusText}`);
    }
    const mediumBuffer = await mediumResponse.arrayBuffer();
    await platform.env.IMAGES_BUCKET.put(`${fileHash}_medium`, mediumBuffer, {
      httpMetadata: { contentType: file.type || 'image/jpeg' }
    });

    console.log(`[${requestId}] Image variants saved to R2 successfully`);

    const img_uuid = uuidv4();
    const img_metadata = {
      r2_key: img_key,
      version: Date.now(),
      variants: {
        original: img_key,
        medium: `${img_key}_medium`,
        thumbnail: `${img_key}_thumb`
      }
    };
    await platform.env.IMAGES_KV.put(`image:${img_uuid}`, JSON.stringify(img_metadata));
    console.log(`[${requestId}] Image metadata saved to KV store`);

    // Receive the full state from the frontend via FormData
    const galleryState = formData.get('galleryState');
    let currentState = { images: [] };
    if (galleryState) {
      currentState = JSON.parse(galleryState);
    }
    console.log(`[${requestId}] currentState: `, currentState);
    // Ensure currentState.images is an array
    if (!Array.isArray(currentState.images)) {
      console.log(`[${requestId}] currentState.images not array, adjusting.`);
      currentState.images = [];
    }
    console.log(`[${requestId}] currentState.images: `, currentState.images);

    // Add the new image to the current state
    const baseUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_key}`;
    const newImage = {
      id: img_uuid,
      r2_key: img_key,
      kv_id: `image:${img_uuid}`,
      src: baseUrl,
      variants: {
        original: baseUrl,
        medium: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_key}_medium`,
        thumbnail: `${platform.env.IMAGES_BUCKET_SITE_URL}/${img_key}_thumb`
      }
    };

    const updatedImages = [...currentState.images, newImage];

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
