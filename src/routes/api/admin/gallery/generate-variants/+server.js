export async function POST({ request, platform }) {
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!jwt) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Generate variants request received`);

  try {
    // Get all images from the gallery
    const galleryOrder = await platform.env.IMAGES_KV.get('gallery_order');
    const orderList = galleryOrder ? JSON.parse(galleryOrder) : [];

    const results = {
      processed: 0,
      skipped: 0,
      errors: []
    };

    // Process each image
    for (const img_id of orderList) {
      try {
        // Get image metadata
        const img_data = await platform.env.IMAGES_KV.get(`image:${img_id}`);
        if (!img_data) {
          console.log(`[${requestId}] No metadata found for image ${img_id}`);
          results.skipped++;
          continue;
        }

        const metadata = JSON.parse(img_data);
        const r2_key = metadata.r2_key;

        // Check if variants already exist
        if (metadata.variants) {
          console.log(`[${requestId}] Variants already exist for image ${img_id}`);
          results.skipped++;
          continue;
        }

        // Get the original image from R2
        const originalImage = await platform.env.IMAGES_BUCKET.get(r2_key);
        if (!originalImage) {
          console.log(`[${requestId}] Original image not found in R2: ${r2_key}`);
          results.skipped++;
          continue;
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
        metadata.variants = {
          original: r2_key,
          medium: `${r2_key}_medium`,
          thumbnail: `${r2_key}_thumb`
        };

        // Save updated metadata
        await platform.env.IMAGES_KV.put(`image:${img_id}`, JSON.stringify(metadata));

        console.log(`[${requestId}] Generated variants for image ${img_id}`);
        results.processed++;
      } catch (error) {
        console.error(`[${requestId}] Error processing image ${img_id}:`, error);
        results.errors.push({
          imageId: img_id,
          error: error.message
        });
      }
    }

    return jsonResponse({
      message: 'Variant generation complete',
      results
    });
  } catch (error) {
    console.error(`[${requestId}] Error generating variants:`, error);
    return jsonResponse({ error: 'Failed to generate variants' }, 500);
  }
}
