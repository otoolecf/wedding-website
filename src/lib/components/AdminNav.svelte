<!-- src/lib/components/AdminNav.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="bg-primary text-background mb-6">
  <div class="max-w-7xl mx-auto">
    <nav class="flex items-center py-3 px-4">
      <div class="text-lg font-semibold mr-6">Wedding Admin</div>
      <div class="flex space-x-4">
        <a
          href="/admin"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors {$page.url.pathname ===
          '/admin'
            ? 'bg-secondary'
            : ''}"
        >
          Dashboard
        </a>
        <a
          href="/admin/gallery"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors {$page.url.pathname ===
          '/admin/gallery'
            ? 'bg-secondary'
            : ''}"
        >
          Gallery
        </a>
        <a
          href="/admin/pages"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors {$page.url.pathname.startsWith(
            '/admin/pages'
          )
            ? 'bg-secondary'
            : ''}"
        >
          Pages
        </a>
        <a
          href="/admin/rsvp"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors {$page.url.pathname ===
          '/admin/rsvp'
            ? 'bg-secondary'
            : ''}"
        >
          RSVPs
        </a>
        <a
          href="/admin/theme"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors {$page.url.pathname ===
          '/admin/theme'
            ? 'bg-secondary'
            : ''}"
        >
          Theme
        </a>
      </div>
      <div class="ml-auto">
        <a
          href="/"
          class="px-3 py-2 rounded hover:bg-secondary transition-colors text-accent"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Site
        </a>
      </div>
    </nav>
  </div>
</div>
