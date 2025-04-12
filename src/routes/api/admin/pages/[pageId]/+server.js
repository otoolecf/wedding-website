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
    console.log(`[${requestId}] Fetching page_builder_page:${pageId} from KV`);
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);

    if (!pageData) {
      console.error(`[${requestId}] Page not found with ID ${pageId}`);
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    const page = JSON.parse(pageData);
    console.log(
      `[${requestId}] Retrieved page: ${page.name}, ${page.sections?.length || 0} sections`
    );

    return jsonResponse({ page });
  } catch (error) {
    console.error(`[${requestId}] Error fetching page:`, error);
    return jsonResponse({ error: `Failed to fetch page: ${error.message}` }, 500);
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
    // Log request info
    console.log(`[${requestId}] Processing page update for: ${pageId}`);

    // Get request body
    let requestBody;
    try {
      const requestText = await request.text();
      console.log(`[${requestId}] Request body length: ${requestText.length} bytes`);
      requestBody = JSON.parse(requestText);
    } catch (e) {
      console.error(`[${requestId}] Error parsing request body:`, e);
      return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
    }

    if (!requestBody.page) {
      console.error(`[${requestId}] No page data in request`);
      return jsonResponse({ error: 'Page data is required' }, 400);
    }

    // Get the existing page to verify it exists
    console.log(`[${requestId}] Fetching existing page from KV`);
    const existingPageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);

    if (!existingPageData) {
      console.error(`[${requestId}] Page not found with ID ${pageId}`);
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    let existingPage;
    try {
      existingPage = JSON.parse(existingPageData);
      console.log(`[${requestId}] Found existing page: ${existingPage.name}`);
    } catch (e) {
      console.error(`[${requestId}] Error parsing existing page data:`, e);
      return jsonResponse({ error: 'Error reading existing page data' }, 500);
    }

    // If slug is changing, check for uniqueness
    if (requestBody.page.slug !== existingPage.slug) {
      console.log(
        `[${requestId}] Slug changing from ${existingPage.slug} to ${requestBody.page.slug}`
      );

      const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
      const pagesData = JSON.parse(pagesList || '[]');

      const conflictingPage = pagesData.find(
        (p) => p.slug === requestBody.page.slug && p.id !== pageId
      );
      if (conflictingPage) {
        console.error(`[${requestId}] Slug conflict with page ID: ${conflictingPage.id}`);
        return jsonResponse({ error: 'A page with this slug already exists' }, 409);
      }
    }

    // Update the page with thorough validation
    const pageSections = Array.isArray(requestBody.page.sections) ? requestBody.page.sections : [];
    const sectionsCount = pageSections.length;

    console.log(`[${requestId}] Updating page with ${sectionsCount} sections`);

    const updatedPage = {
      ...existingPage,
      name: requestBody.page.name || existingPage.name,
      slug: requestBody.page.slug || existingPage.slug,
      sections: pageSections,
      lastModified: new Date().toISOString()
    };

    // Save the updated page with enhanced error handling
    try {
      console.log(`[${requestId}] Writing updated page to KV`);
      await platform.env.IMAGES_KV.put(`page_builder_page:${pageId}`, JSON.stringify(updatedPage));
      console.log(`[${requestId}] Page data saved successfully`);
    } catch (kvError) {
      console.error(`[${requestId}] Error writing to KV:`, kvError);
      return jsonResponse({ error: 'Failed to save page to database' }, 500);
    }

    // Update the page list
    try {
      console.log(`[${requestId}] Updating pages list`);
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
      console.log(`[${requestId}] Pages list updated successfully`);
    } catch (listError) {
      console.error(`[${requestId}] Error updating pages list:`, listError);
      // We don't return an error here since the main page data was already saved
      // Just log the error and continue
    }

    console.log(`[${requestId}] Page update complete: ${updatedPage.name}`);
    return jsonResponse({
      message: 'Page updated successfully',
      page: updatedPage,
      diagnostics: {
        requestId,
        timestamp: new Date().toISOString(),
        sectionsCount
      }
    });
  } catch (error) {
    console.error(`[${requestId}] Error updating page:`, error);
    return jsonResponse(
      {
        error: 'Failed to update page',
        message: error.message,
        diagnostics: {
          requestId,
          errorType: error.name,
          timestamp: new Date().toISOString()
        }
      },
      500
    );
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
