<!-- src/routes/gallery/+page.svelte -->
<script>
  const photos = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    src: `https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/1200px-Placeholder_view_vector.svg.png`,
    alt: `Gallery image ${i + 1}`,
    caption: `Special moment ${i + 1}`
  }));
</script>

<svelte:head>
  <title>Gallery | Colette & Connor's Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Photo Gallery</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each photos as photo}
      <div class="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <img
          src={photo.src}
          alt={photo.alt}
          class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform">
          <p class="text-sm">{photo.caption}</p>
        </div>
      </div>
    {/each}
  </div>
</div>