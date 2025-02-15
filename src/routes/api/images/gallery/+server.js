// src/routes/api/images/gallery/+server.js
export async function GET({ platform }) {
  const requestId = crypto.randomUUID();
  // Helper function to create JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // List all the gallery R2 images in KV
  console.log('platform.env.IMAGES_KV: ', platform.env.IMAGES_KV);
  const gallery_imgs = await platform.env.IMAGES_KV.list({ prefix: `gallery:` });
  console.log(`[${requestId}] gallery_imgs: `, gallery_imgs);
  const frontend_format = gallery_imgs.keys?.length
    ? gallery_imgs.keys.map((img_data) => {
        return {
          id: img_data.metadata.r2_key,
          kv_id: img_data.name,
          src: `https://placeholder/${img_data.metadata.r2_key}`,
          alt: img_data.metadata.alt
        };
      })
    : [];

  return jsonResponse({ images: frontend_format });
}
