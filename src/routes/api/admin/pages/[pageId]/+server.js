// src/routes/api/admin/pages/[pageId]/+server.js

// GET handler to fetch a single page by ID
export async function GET({ request, params, platform }) {
  const requestId = crypto.randomUUID();
  const { pageId } = params;
  console.log(`[${requestId}] Page request received for ID: ${pageId}`);

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
    // Fetch the page data
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);

    if (!pageData) {
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    const page = JSON.parse(pageData);

    console.log(`[${requestId}] Retrieved page: ${page.name}`);
    return jsonResponse({ page });
  } catch (error) {
    console.error(`[${requestId}] Error fetching page:`, error);
    return jsonResponse({ error: 'Failed to fetch page' }, 500);
  }
}

// PUT handler to update a page
export async function PUT({ request, params, platform }) {
  const requestId = crypto.randomUUID();
  const { pageId } = params;
  console.log(`[${requestId}] Page update request received for ID: ${pageId}`);

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

    if (!data.page) {
      return jsonResponse({ error: 'Page data is required' }, 400);
    }

    // Get the existing page to verify it exists
    const existingPageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);

    if (!existingPageData) {
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    const existingPage = JSON.parse(existingPageData);

    // If slug is changing, check for uniqueness
    if (data.page.slug !== existingPage.slug) {
      const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
      const pagesData = JSON.parse(pagesList || '[]');

      const conflictingPage = pagesData.find((p) => p.slug === data.page.slug && p.id !== pageId);
      if (conflictingPage) {
        return jsonResponse({ error: 'A page with this slug already exists' }, 409);
      }
    }

    // Update the page
    const updatedPage = {
      ...existingPage,
      name: data.page.name || existingPage.name,
      slug: data.page.slug || existingPage.slug,
      sections: data.page.sections || existingPage.sections,
      lastModified: new Date().toISOString()
    };

    // Save the updated page
    await platform.env.IMAGES_KV.put(`page_builder_page:${pageId}`, JSON.stringify(updatedPage));

    // Update the page list
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    let pagesData = JSON.parse(pagesList || '[]');

    pagesData = pagesData.map((p) => {
      if (p.id === pageId) {
        return {
          id: updatedPage.id,
          name: updatedPage.name,
          slug: updatedPage.slug,
          lastModified: updatedPage.lastModified
        };
      }
      return p;
    });

    await platform.env.IMAGES_KV.put('page_builder_pages_list', JSON.stringify(pagesData));

    console.log(`[${requestId}] Updated page: ${updatedPage.name}`);
    return jsonResponse({
      message: 'Page updated successfully',
      page: updatedPage
    });
  } catch (error) {
    console.error(`[${requestId}] Error updating page:`, error);
    return jsonResponse({ error: 'Failed to update page' }, 500);
  }
}

// DELETE handler to delete a page
export async function DELETE({ request, params, platform }) {
  const requestId = crypto.randomUUID();
  const { pageId } = params;
  console.log(`[${requestId}] Page deletion request received for ID: ${pageId}`);

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
    // Check if the page exists
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);

    if (!pageData) {
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    // Delete the page
    await platform.env.IMAGES_KV.delete(`page_builder_page:${pageId}`);

    // Update the pages list
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    let pagesData = JSON.parse(pagesList || '[]');

    pagesData = pagesData.filter((p) => p.id !== pageId);

    await platform.env.IMAGES_KV.put('page_builder_pages_list', JSON.stringify(pagesData));

    console.log(`[${requestId}] Deleted page with ID: ${pageId}`);
    return jsonResponse({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error(`[${requestId}] Error deleting page:`, error);
    return jsonResponse({ error: 'Failed to delete page' }, 500);
  }
}
