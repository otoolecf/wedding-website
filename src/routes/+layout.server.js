export function load({ url }) {
  const branch = process.env.BRANCH || 'development';

  // If we're on main branch and not on home page, redirect immediately
  if ((branch === 'main' || branch === 'master') && url.pathname !== '/') {
    return {
      status: 302,
      redirect: '/'
    };
  }

  return {
    branch,
    pathname: url.pathname
  };
}
