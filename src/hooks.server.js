export async function handle({ event, resolve }) {
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isApiRoute = event.url.pathname.startsWith('/api');
  const isHomePage = event.url.pathname === '/';

  // Always allow admin, API routes, and home page to pass through
  if (isAdminRoute || isApiRoute || isHomePage) {
    return resolve(event);
  }

  // Get settings from KV store
  const settings = await event.platform.env.IMAGES_KV.get('wedding_settings', 'json');

  // If showOnlyHomeInProduction is true, redirect to home page
  if (settings?.showOnlyHomeInProduction) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
