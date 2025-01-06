export async function handle({ event, resolve }) {
  const isMainBranch = process.env.BRANCH === 'main' || process.env.BRANCH === 'master';

  if (isMainBranch && event.url.pathname !== '/') {
    return new Response('Redirect', {
      status: 302,
      headers: { Location: '/' }
    });
  }

  return resolve(event);
}
