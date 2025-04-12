export async function PUT({ params, request, platform }) {
  const { pageId } = params;
  const requestId = crypto.randomUUID();

  try {
    // Get the request body
    const { order } = await request.json();

    if (typeof order !== 'number') {
      return jsonResponse({ error: 'Invalid order value' }, 400);
    }

    // Get the current page data
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageId}`);
    if (!pageData) {
      return jsonResponse({ error: 'Page not found' }, 404);
    }

    const page = JSON.parse(pageData);

    // Update the page order
    page.order = order;

    // Save the updated page
    await platform.env.IMAGES_KV.put(`page_builder_page:${pageId}`, JSON.stringify(page));

    // Get all pages to update their order
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    const pages = pagesList ? JSON.parse(pagesList) : [];

    // Update the page in the list
    const pageIndex = pages.findIndex((p) => p.id === pageId);
    if (pageIndex !== -1) {
      pages[pageIndex] = page;
      await platform.env.IMAGES_KV.put('page_builder_pages_list', JSON.stringify(pages));
    }

    return jsonResponse({ message: 'Page order updated successfully', page });
  } catch (error) {
    console.error(`[${requestId}] Error updating page order:`, error);
    return jsonResponse({ error: 'Failed to update page order' }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
