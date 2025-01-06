export function load({ url }) {
  // Log all environment variables that might be relevant
  console.log('CF_PAGES_BRANCH:', process.env.CF_PAGES_BRANCH);
  console.log('BRANCH:', process.env.BRANCH);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Current URL:', url.pathname);

  const branch = process.env.CF_PAGES_BRANCH || 'development';
  console.log('Determined branch:', branch);

  return {
    branch,
    pathname: url.pathname
  };
}
