export async function handle({ event, resolve }) {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && event.url.pathname !== '/') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
