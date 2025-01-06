export function load({ url }) {
  // Check if we're in production build
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isProduction,
    pathname: url.pathname
  };
}
