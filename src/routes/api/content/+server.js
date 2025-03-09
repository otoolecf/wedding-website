// src/routes/api/content/+server.js

export async function GET({ url, platform }) {
  const requestId = crypto.randomUUID();

  // Get the requested section key from the query string
  const sectionKey = url.searchParams.get('key');

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  console.log(`[${requestId}] Content request received for section: ${sectionKey || 'all'}`);

  try {
    // If a specific section is requested
    if (sectionKey) {
      const sectionData = await platform.env.IMAGES_KV.get(`content:${sectionKey}`);

      if (!sectionData) {
        return jsonResponse({ error: 'Content section not found' }, 404);
      }

      const section = JSON.parse(sectionData);
      return jsonResponse({ section });
    }
    // Otherwise, return all sections
    else {
      const contentList = await platform.env.IMAGES_KV.get('content_sections_list');
      let sectionKeys = contentList ? JSON.parse(contentList) : [];

      // Fetch each section's data
      const fetchPromises = sectionKeys.map(async (key) => {
        const sectionData = await platform.env.IMAGES_KV.get(`content:${key}`);
        return sectionData ? JSON.parse(sectionData) : null;
      });

      const sections = (await Promise.all(fetchPromises)).filter((section) => section !== null);

      return jsonResponse({ sections });
    }
  } catch (error) {
    console.error(`[${requestId}] Error fetching content:`, error);
    return jsonResponse({ error: 'Failed to fetch content' }, 500);
  }
}
