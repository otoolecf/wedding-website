// src/routes/pages/[slug]/+page.server.js

export async function load({ params, platform, error }) {
  const { slug } = params;

  try {
    // Get the list of pages
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list');
    let pagesData = pagesList ? JSON.parse(pagesList) : [];

    // Find the page with the matching slug
    const pageInfo = pagesData.find((page) => page.slug === slug);

    if (!pageInfo) {
      return error(404, {
        message: 'Page not found',
        code: 'PAGE_NOT_FOUND'
      });
    }

    // Get the full page data
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageInfo.id}`);

    if (!pageData) {
      return error(404, {
        message: 'Page content not found',
        code: 'PAGE_CONTENT_NOT_FOUND'
      });
    }

    const page = JSON.parse(pageData);

    return {
      page,
      slug
    };
  } catch (err) {
    console.error(`Error loading page [${slug}]:`, err);
    return error(500, {
      message: 'Error loading page',
      code: 'PAGE_LOAD_ERROR'
    });
  }
}
