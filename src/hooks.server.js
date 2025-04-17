export async function handle({ event, resolve }) {
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isApiRoute = event.url.pathname.startsWith('/api');
  const isHomePage = event.url.pathname === '/';
  const isAboutPage = event.url.pathname === '/about';

  // Always allow admin, API routes, home page, and about page to pass through
  if (isAdminRoute || isApiRoute || isHomePage || isAboutPage) {
    return resolve(event);
  }

  // Get settings from KV store
  const settings = await event.platform.env.IMAGES_KV.get('wedding_settings', 'json');

  // If restrictToHomePage is true, redirect to home page
  if (settings?.restrictToHomePage) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
