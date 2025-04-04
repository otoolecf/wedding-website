<!-- src/lib/components/AdminNav.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="bg-white text-text mb-6">
  <div class="max-w-7xl mx-auto">
    <nav class="flex items-center py-3 px-4">
      <div class="text-lg font-semibold mr-6">Wedding Admin</div>
      <div class="flex space-x-4">
        <a
          href="/admin"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin'
            ? 'bg-primary text-white'
            : ''}"
        >
          Dashboard
        </a>
        <a
          href="/admin/settings"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin/settings'
            ? 'bg-primary text-white'
            : ''}"
        >
          Settings
        </a>
        <a
          href="/admin/registry"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin/registry'
            ? 'bg-primary text-white'
            : ''}"
        >
          Registry
        </a>
        <a
          href="/admin/gallery"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin/gallery'
            ? 'bg-primary text-white'
            : ''}"
        >
          Gallery
        </a>
        <a
          href="/admin/pages"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url.pathname.startsWith(
            '/admin/pages'
          )
            ? 'bg-primary text-white'
            : ''}"
        >
          Pages
        </a>
        <a
          href="/admin/rsvp"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin/rsvp'
            ? 'bg-primary text-white'
            : ''}"
        >
          RSVPs
        </a>
        <a
          href="/admin/theme"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors {$page.url
            .pathname === '/admin/theme'
            ? 'bg-primary text-white'
            : ''}"
        >
          Theme
        </a>
      </div>
      <div class="ml-auto">
        <a
          href="/"
          class="px-3 py-2 rounded hover:bg-primary hover:text-white transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Site
        </a>
      </div>
    </nav>
  </div>
</div>
