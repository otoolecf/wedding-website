export function load({ url }) {
  console.log({
    NODE_ENV: process.env.NODE_ENV,
    CF_PAGES: process.env.CF_PAGES,
    CF_PAGES_BRANCH: process.env.CF_PAGES_BRANCH,
    CF_PAGES_URL: process.env.CF_PAGES_URL,
    pathname: url.pathname
  });

  // Check if we're on the production branch
  const isProduction = process.env.CF_PAGES_BRANCH === 'main';

  return {
    isProduction,
    pathname: url.pathname
  };
}
