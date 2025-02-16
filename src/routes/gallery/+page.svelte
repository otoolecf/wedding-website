<!-- src/routes/gallery/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  let photos = [];
  let error = null;
  onMount(async () => {
    try {
      // Fetch the order of images from KV
      const orderResponse = await fetch('/api/images/gallery');
      if (!orderResponse.ok) {
        throw new Error(`Failed to fetch image order: ${orderResponse.statusText}`);
      }
      const result = await orderResponse.json();
      photos = result.images;
    } catch (err) {
      error = 'Failed to load gallery images';
      console.error(err);
    }
  });
</script>

<svelte:head>
  <title>Gallery | Colette & Connor's Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Photo Gallery</h1>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else if photos.length === 0}
    <div class="text-center text-gray-600 p-4 rounded">No images available in the gallery.</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each photos as photo}
        <div
          class="group relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={photo.src}
            alt={photo.id}
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div
            class="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform"
          >
            <p class="text-sm">R2 ID: {photo.id}, KV_ID: {photo.kv_id}</p>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
