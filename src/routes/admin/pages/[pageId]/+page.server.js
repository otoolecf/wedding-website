// src/routes/admin/pages/[pageId]/+page.server.js

export function load({ params }) {
  // Make sure we return the pageId in a format the component expects
  return {
    params: {
      pageId: params.pageId
    }
  };
}
