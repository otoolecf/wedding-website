import { navigating } from '$app/stores';

// This ensures we have client-side navigation hooks
export const handleNavigate = ({ from, to, type }) => {
  console.log(`[Navigate] ${from?.url.pathname || 'new'} -> ${to.url.pathname} (${type})`);

  // We can cancel slow navigations if needed
  /*
  if (duration > 5000) {
    return { cancel: true };
  }
  */

  return {};
};

// Add listeners to debug client-side navigation
if (typeof window !== 'undefined') {
  navigating.subscribe((nav) => {
    if (nav) {
      console.log('[Navigation in progress]', {
        from: nav.from?.url.pathname,
        to: nav.to?.url.pathname,
        type: nav.type
      });
    }
  });

  window.addEventListener('sveltekit:navigation-start', (event) => {
    console.log('[Navigation Start]', event.detail);
  });

  window.addEventListener('sveltekit:navigation-end', (event) => {
    console.log('[Navigation End]', event.detail);
  });
}
