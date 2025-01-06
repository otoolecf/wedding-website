export async function handle({ event, resolve }) {
  const branch = process.env.BRANCH || 'development';
  const isMainBranch = branch === 'main' || branch === 'master';

  if (isMainBranch && event.url.pathname !== '/') {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
