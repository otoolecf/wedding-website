// routes/+layout.server.js
import { env } from '$env/dynamic/private';

export function load({ url }) {
  // CF_PAGES_BRANCH is automatically set by Cloudflare Pages
  const branch = env.CF_PAGES_BRANCH || '';
  const isPreview = branch !== 'main' && branch !== 'master';

  return {
    isPreview,
    pathname: url.pathname
  };
}
