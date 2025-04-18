export async function handle({ event, resolve }) {
  const isAdminRoute = event.url.pathname.startsWith('/admin');
  const isApiRoute = event.url.pathname.startsWith('/api');
  const isHomePage = event.url.pathname === '/';
  const isAboutPage = event.url.pathname === '/about';

  // For admin routes, let Cloudflare Zero Trust handle the authentication
  if (isAdminRoute || isApiRoute) {
    return resolve(event);
  }

  // Get settings from KV store
  const settings = await event.platform.env.IMAGES_KV.get('wedding_settings', 'json');

  // If restrictToHomePage is true and it's not the home page or about page, redirect to home page
  if (settings?.restrictToHomePage && !isHomePage && !isAboutPage) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
