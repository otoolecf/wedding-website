import { goto } from '$app/navigation';
import { navigating } from '$app/stores';

// Subscribe to navigation events
let currentNavigation = null;

// Initialize the subscription in a client-only context
export function initRouterDebug() {
  if (typeof window !== 'undefined') {
    navigating.subscribe((nav) => {
      if (nav) {
        console.log('Navigation started:', {
          from: nav.from?.url.pathname,
          to: nav.to?.url.pathname,
          type: nav.type
        });
        currentNavigation = nav;
      } else if (currentNavigation) {
        console.log('Navigation completed:', {
          from: currentNavigation.from?.url.pathname,
          to: currentNavigation.to?.url.pathname
        });
        currentNavigation = null;
      }
    });
  }
}

// Explicit navigation helper
export function navigateTo(url, options = {}) {
  console.log(`Explicitly navigating to: ${url}`);
  return goto(url, options);
}
