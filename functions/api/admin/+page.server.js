// src/routes/admin/+page.server.js
import { redirect } from '@sveltejs/kit';

export const load = async ({ request, locals }) => {
  // Check for Cloudflare Access JWT
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');

  if (!jwt) {
    throw redirect(302, '/');
  }

  // You can add additional JWT verification here if needed

  return {
    // any data you want to pass to the page
  };
};
