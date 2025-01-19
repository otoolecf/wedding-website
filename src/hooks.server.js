export async function handle({ event, resolve }) {
  const isProduction = process.env.NODE_ENV === 'production';

  // Allow API routes and the root route to pass through
  if (isProduction && !event.url.pathname.startsWith('/api') && event.url.pathname !== '/') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
