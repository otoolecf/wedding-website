export function load({ url }) {
  // Check if we're on main/master branch
  const isMainBranch = process.env.BRANCH === 'main' || process.env.BRANCH === 'master';

  if (isMainBranch && url.pathname !== '/') {
    return {
      status: 302,
      redirect: '/'
    };
  }

  return {};
}
