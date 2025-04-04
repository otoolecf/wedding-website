// src/routes/api/admin/pages/+server.js

// GET handler to fetch all pages
export async function GET({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] Pages request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    // Fetch the list of all pages
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    let pagesData = pagesList ? JSON.parse(pagesList) : [];

    // For each page, fetch just the metadata (without full sections for performance)
    const pagesMetadata = pagesData.map((page) => ({
      id: page.id,
      name: page.name,
      slug: page.slug,
      order: page.order,
      lastModified: page.lastModified || null
    }));

    console.log(`[${requestId}] Retrieved ${pagesMetadata.length} pages`);
    return jsonResponse({ pages: pagesMetadata });
  } catch (error) {
    console.error(`[${requestId}] Error fetching pages:`, error);
    return jsonResponse({ error: 'Failed to fetch pages' }, 500);
  }
}

// POST handler to create a new page
export async function POST({ request, platform }) {
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] New page creation request received`);

  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

  // Validate JWT in production
  const isDevelopment =
    platform.env?.ENVIRONMENT !== 'production' && platform.env?.ENVIRONMENT !== 'preview';
  if (!isDevelopment) {
    const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!jwt) {
      console.error(`[${requestId}] Unauthorized access attempt`);
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return jsonResponse({ error: 'Page name is required' }, 400);
    }

    // Generate a slug if not provided
    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Create the page object
    const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const page = {
      id: pageId,
      name: data.name,
      slug,
      order: data.order,
      sections: data.sections || [],
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    // Get the current list of pages
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    let pagesData = pagesList ? JSON.parse(pagesList) : [];

    // Check if slug is unique
    const existingPage = pagesData.find((p) => p.slug === slug);
    if (existingPage) {
      return jsonResponse({ error: 'A page with this slug already exists' }, 409);
    }

    // Add the new page to the list
    pagesData.push({
      id: page.id,
      name: page.name,
      slug: page.slug,
      order: page.order,
      lastModified: page.lastModified
    });

    // Save the page data
    await platform.env.IMAGES_KV.put(`page_builder_page:${pageId}`, JSON.stringify(page));

    // Update the pages list
    await platform.env.IMAGES_KV.put('page_builder_pages_list', JSON.stringify(pagesData));

    console.log(`[${requestId}] Created new page: ${page.name} (${page.id})`);
    return jsonResponse(
      {
        message: 'Page created successfully',
        page
      },
      201
    );
  } catch (error) {
    console.error(`[${requestId}] Error creating page:`, error);
    return jsonResponse({ error: 'Failed to create page' }, 500);
  }
}
