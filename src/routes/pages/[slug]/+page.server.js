// src/routes/pages/[slug]/+page.server.js

export async function load({ params, platform, setHeaders, depends }) {
  // Add a dependency on the slug parameter
  depends(`app:page:${params.slug}`);

  const { slug } = params;

  try {
    // Create a cache-busting timestamp for debugging
    const timestamp = Date.now();
    console.log(`Loading page [${slug}] at ${timestamp}`);

    // Get the list of pages with a fresh request - force cache bypass
    const pagesList = await platform.env.IMAGES_KV.get('page_builder_pages_list', {
      cacheTtl: 0 // Bypass cache
    });
    let pagesData = pagesList ? JSON.parse(pagesList) : [];

    // Find the page with the matching slug
    const pageInfo = pagesData.find((page) => page.slug === slug);

    if (!pageInfo) {
      console.error(`Page not found: ${slug}`);
      throw new Error('Page not found');
    }

    console.log(`Found page info for [${slug}]:`, pageInfo);

    // Get the full page data - force cache bypass
    const pageData = await platform.env.IMAGES_KV.get(`page_builder_page:${pageInfo.id}`, {
      cacheTtl: 0 // Bypass cache
    });

    if (!pageData) {
      console.error(`Page content not found for ID: ${pageInfo.id}`);
      throw new Error('Page content not found');
    }

    const page = JSON.parse(pageData);

    // Log the page ID for debugging
    console.log(`Successfully loaded page ID: ${page.id}, slug: ${page.slug}`);

    // Set cache control headers to avoid browser caching
    setHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    });

    return {
      page,
      slug,
      timestamp,
      id: page.id // Explicitly include ID for keying
    };
  } catch (err) {
    console.error(`Error loading page [${slug}]:`, err);
    throw new Error('Error loading page: ' + err.message);
  }
}
