<!-- src/routes/gallery/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { openLightbox } from '$lib/stores/lightbox';

  let photos = [];
  let error = null;
  let loading = true;

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
    } finally {
      loading = false;
    }
  });

  function handleOpenGallery(index) {
    // Open the lightbox with all photos, starting at the selected index
    openLightbox(photos, index);
  }
</script>

<svelte:head>
  <title>Gallery | Connor & Colette Wedding</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Photo Gallery</h1>

  {#if loading}
    <div class="text-center text-gray-600 p-4 rounded">Loading images...</div>
  {:else if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else if photos.length === 0}
    <div class="text-center text-gray-600 p-4 rounded">No images available in the gallery.</div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each photos as photo, index}
        <div
          class="relative group rounded-lg shadow-sm overflow-hidden cursor-pointer"
          on:click={() => handleOpenGallery(index)}
          on:keydown={(e) => e.key === 'Enter' && handleOpenGallery(index)}
          tabindex="0"
          role="button"
          aria-label={`View ${photo.caption || 'image'}`}
        >
          <!-- Image container with consistent height but preserving aspect ratio -->
          <div class="h-64 overflow-hidden">
            <img
              src={photo.src}
              alt={photo.alt || photo.caption || 'Gallery image'}
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <!-- Caption overlay (only visible on hover) -->
          {#if photo.caption}
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end"
            >
              <p class="text-white p-4 text-center">{photo.caption}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
