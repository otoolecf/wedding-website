// src/routes/admin/pages/+page.server.js
export function load({ params }) {
  // Return empty props object since we're not loading any specific page data here
  console.log('admin/pages/+page.server.js: params: ', params);
  return {};
}
