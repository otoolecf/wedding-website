// src/routes/api/images/gallery/+server.js
export async function GET({ platform }) {
  const requestId = crypto.randomUUID();

  // Helper function to create JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  try {
    // Fetch the gallery order from the KV store
    const galleryOrder = await platform.env.IMAGES_KV.get('gallery_order');
    const orderList = galleryOrder ? JSON.parse(galleryOrder) : [];
    console.log(`[${requestId}] galleryOrder: `, orderList);

    // Fetch the image metadata for each image in the order
    const imagePromises = orderList.map(async (img_id) => {
      const img_data = await platform.env.IMAGES_KV.get(`image:${img_id}`);
      if (img_data) {
        const { r2_key, alt, caption, variants } = JSON.parse(img_data);
        const baseUrl = `${platform.env.IMAGES_BUCKET_SITE_URL}/${r2_key}`;

        // Handle both old and new image formats
        if (variants) {
          return {
            id: img_id,
            kv_id: `image:${img_id}`,
            src: baseUrl, // Keep original src for backwards compatibility
            variants: {
              original: baseUrl,
              medium: `${platform.env.IMAGES_BUCKET_SITE_URL}/${variants.medium}`,
              thumbnail: `${platform.env.IMAGES_BUCKET_SITE_URL}/${variants.thumbnail}`
            },
            alt: alt || '',
            caption: caption || ''
          };
        } else {
          // Old format - no variants
          return {
            id: img_id,
            kv_id: `image:${img_id}`,
            src: baseUrl,
            variants: {
              original: baseUrl,
              medium: baseUrl,
              thumbnail: baseUrl
            },
            alt: alt || '',
            caption: caption || ''
          };
        }
      }
      return null;
    });

    // Wait for all image data to be fetched
    const images = await Promise.all(imagePromises);
    // Filter out any null values (in case some images were not found)
    const frontend_format = images.filter((img) => img !== null);

    return jsonResponse({ images: frontend_format });
  } catch (error) {
    console.error(`[${requestId}] Error fetching gallery images:`, error);
    return jsonResponse({ error: 'Failed to fetch gallery images' }, 500);
  }
}
