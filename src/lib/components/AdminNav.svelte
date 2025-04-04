<!-- src/lib/components/AdminNav.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="bg-secondary text-primary mb-6">
  <div class="max-w-7xl mx-auto">
    <nav class="flex items-center py-3 px-4">
      <div class="text-lg font-semibold mr-6">Wedding Admin</div>
      <div class="flex space-x-4">
        <a
          href="/admin"
          class="px-3 py-2 rounded hover:bg-accent transition-colors {$page.url.pathname ===
          '/admin'
            ? 'bg-accent'
            : ''}"
        >
          Dashboard
        </a>
        <a
          href="/admin/gallery"
          class="px-3 py-2 rounded hover:bg-accent transition-colors {$page.url.pathname ===
          '/admin/gallery'
            ? 'bg-accent'
            : ''}"
        >
          Gallery
        </a>
        <a
          href="/admin/pages"
          class="px-3 py-2 rounded hover:bg-accent transition-colors {$page.url.pathname.startsWith(
            '/admin/pages'
          )
            ? 'bg-accent'
            : ''}"
        >
          Pages
        </a>
        <a
          href="/admin/rsvp"
          class="px-3 py-2 rounded hover:bg-accent transition-colors {$page.url.pathname ===
          '/admin/rsvp'
            ? 'bg-accent'
            : ''}"
        >
          RSVPs
        </a>
        <a
          href="/admin/theme"
          class="px-3 py-2 rounded hover:bg-accent transition-colors {$page.url.pathname ===
          '/admin/theme'
            ? 'bg-accent'
            : ''}"
        >
          Theme
        </a>
      </div>
      <div class="ml-auto">
        <a
          href="/"
          class="px-3 py-2 rounded hover:bg-accent transition-colors text-primary/90"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Site
        </a>
      </div>
    </nav>
  </div>
</div>
