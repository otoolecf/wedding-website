export function load({ url }) {
  let debug = {};
  try {
    debug = {
      nodeEnv: process.env.NODE_ENV,
      cfBranch: process.env.CF_PAGES_BRANCH
    };
    console.log('Debug info:', debug);
  } catch (error) {
    console.error('Error accessing env vars:', error);
  }

  // Default to production if we can't determine environment
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isProduction,
    pathname: url.pathname,
    debug // including this temporarily for debugging
  };
}
