<!-- src/lib/components/AdminNav.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<div class="bg-gray-800 text-white mb-6">
  <div class="max-w-7xl mx-auto">
    <nav class="flex items-center py-3 px-4">
      <div class="text-lg font-semibold mr-6">Wedding Admin</div>
      <div class="flex space-x-4">
        <a
          href="/admin"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors {$page.url.pathname ===
          '/admin'
            ? 'bg-gray-700'
            : ''}"
        >
          Dashboard
        </a>
        <a
          href="/admin/gallery"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors {$page.url.pathname ===
          '/admin/gallery'
            ? 'bg-gray-700'
            : ''}"
        >
          Gallery
        </a>
        <a
          href="/admin/pages"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors {$page.url.pathname.startsWith(
            '/admin/pages'
          )
            ? 'bg-gray-700'
            : ''}"
        >
          Pages
        </a>
        <a
          href="/admin/rsvp"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors {$page.url.pathname ===
          '/admin/rsvp'
            ? 'bg-gray-700'
            : ''}"
        >
          RSVPs
        </a>
        <a
          href="/admin/theme"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors {$page.url.pathname ===
          '/admin/theme'
            ? 'bg-gray-700'
            : ''}"
        >
          Theme
        </a>
      </div>
      <div class="ml-auto">
        <a
          href="/"
          class="px-3 py-2 rounded hover:bg-gray-700 transition-colors text-gray-300"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Site
        </a>
      </div>
    </nav>
  </div>
</div>
