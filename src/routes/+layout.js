/** @type {import('./$types').LayoutLoad} */
export function load({ data }) {
  // If we're on main branch and not on the home page, redirect
  if ((data.branch === 'main' || data.branch === 'master') && data.pathname !== '/') {
    throw new Error('Access denied');
  }

  return data;
}
