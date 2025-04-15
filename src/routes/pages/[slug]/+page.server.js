// src/routes/pages/[slug]/+page.server.js

export async function load({ params, platform }) {
  const { slug } = params;

  try {
    // Get the list of pages
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list', { type: 'json' });
    let pagesData = pagesList || [];

    // Find the page with the matching slug
    const pageInfo = pagesData.find((page) => page.slug === slug);

    if (!pageInfo) {
      throw new Error('Page not found');
    }

    // Get the full page data
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageInfo.id}`, {
      type: 'json'
    });

    if (!pageData) {
      throw new Error('Page content not found');
    }

    return {
      page: pageData,
      slug
    };
  } catch (err) {
    console.error(`Error loading page [${slug}]:`, err);
    throw new Error('Error loading page: ' + err.message);
  }
}
