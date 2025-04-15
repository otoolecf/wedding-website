import { json } from '@sveltejs/kit';

export async function POST({ params, platform }) {
  const requestId = crypto.randomUUID();
  const { imageId } = params;

  // Helper function to create JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  try {
    console.log(`[${requestId}] Generate variants request received for image ${imageId}`);

    // Get the image metadata from KV
    const img_data = await platform.env.IMAGES_KV.get(`image:${imageId}`);
    if (!img_data) {
      return jsonResponse({ error: 'Image not found' }, 404);
    }

    const { r2_key } = JSON.parse(img_data);

    // Get the original image from R2
    const originalImage = await platform.env.IMAGES_BUCKET.get(r2_key);
    if (!originalImage) {
      return jsonResponse({ error: 'Original image not found in R2' }, 404);
    }

    const imageBuffer = await originalImage.arrayBuffer();
    const contentType = originalImage.httpMetadata?.contentType || 'image/jpeg';

    // Save the original image first
    await platform.env.IMAGES_BUCKET.put(r2_key, imageBuffer, {
      httpMetadata: { contentType }
    });

    // Generate thumbnail (200px width)
    const thumbnailUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${r2_key}?width=200&fit=inside`;
    const thumbnailResponse = await fetch(thumbnailUrl);
    if (!thumbnailResponse.ok) {
      throw new Error(`Failed to generate thumbnail: ${thumbnailResponse.statusText}`);
    }
    const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
    await platform.env.IMAGES_BUCKET.put(`${r2_key}_thumb`, thumbnailBuffer, {
      httpMetadata: { contentType }
    });

    // Generate medium size (800px width)
    const mediumUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${r2_key}?width=800&fit=inside`;
    const mediumResponse = await fetch(mediumUrl);
    if (!mediumResponse.ok) {
      throw new Error(`Failed to generate medium size: ${mediumResponse.statusText}`);
    }
    const mediumBuffer = await mediumResponse.arrayBuffer();
    await platform.env.IMAGES_BUCKET.put(`${r2_key}_medium`, mediumBuffer, {
      httpMetadata: { contentType }
    });

    // Update metadata with variants
    const metadata = JSON.parse(img_data);
    metadata.variants = {
      original: r2_key,
      medium: `${r2_key}_medium`,
      thumbnail: `${r2_key}_thumb`
    };
    await platform.env.IMAGES_KV.put(`image:${imageId}`, JSON.stringify(metadata));

    console.log(`[${requestId}] Generated variants for image ${imageId}`);
    return jsonResponse({ success: true, message: 'Variants generated successfully' });
  } catch (error) {
    console.error(`[${requestId}] Error processing image ${imageId}:`, error);
    return jsonResponse({ error: error.message }, 500);
  }
}
