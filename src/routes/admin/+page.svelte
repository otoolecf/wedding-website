<script>
  import ThemeStatus from '$lib/components/ThemeStatus.svelte';
  import AdminNav from '$lib/components/AdminNav.svelte';
</script>

<AdminNav />

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Admin Dashboard</h1>
    <ThemeStatus />
  </div>

  <div class="space-y-4">
    <a href="/admin/rsvp" class="block p-4 bg-white rounded shadow hover:bg-gray-100 transition">
      <h2 class="text-xl font-medium">Manage RSVPs</h2>
      <p class="text-gray-600">View and manage RSVPs for the wedding.</p>
    </a>
    <a href="/admin/gallery" class="block p-4 bg-white rounded shadow hover:bg-gray-100 transition">
      <h2 class="text-xl font-medium">Manage Gallery</h2>
      <p class="text-gray-600">Upload, delete, and reorder images in the gallery.</p>
    </a>
    <a href="/admin/pages" class="block p-4 bg-white rounded shadow hover:bg-gray-100 transition">
      <h2 class="text-xl font-medium">Manage Pages</h2>
      <p class="text-gray-600">Create and edit website pages using the page builder.</p>
    </a>
    <a href="/admin/theme" class="block p-4 bg-white rounded shadow hover:bg-gray-100 transition">
      <h2 class="text-xl font-medium">Manage Theme</h2>
      <p class="text-gray-600">Customize site colors, fonts, and appearance.</p>
    </a>
  </div>
</div>
