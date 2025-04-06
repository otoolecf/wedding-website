<script>
  import { onMount } from 'svelte';
  import { openLightbox } from '$lib/stores/lightbox';
  import GlobalLightbox from '$lib/components/GlobalLightbox.svelte';

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

  function openGalleryLightbox(startIndex) {
    if (photos.length === 0) return;

    const galleryImages = photos.map((photo) => ({
      src: photo.src,
      alt: photo.alt || photo.id,
      caption: photo.caption
    }));

    openLightbox(galleryImages, startIndex);
  }
</script>

<svelte:head>
  <title>Gallery | Connor & Colette Wedding</title>
</svelte:head>

<GlobalLightbox />

<div class="max-w-7xl mx-auto px-4 py-12">
  <h1 class="text-4xl text-center font-light mb-12">Photo Gallery</h1>

  {#if loading}
    <div class="text-center text-secondary p-4 rounded">Loading images...</div>
  {:else if error}
    <div class="bg-red-50 text-red-600 p-4 rounded">
      {error}
    </div>
  {:else if photos.length === 0}
    <div class="text-center text-secondary p-4 rounded">No images available in the gallery.</div>
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {#each photos as photo, index}
        <div
          class="group cursor-pointer"
          on:click={() => openGalleryLightbox(index)}
          on:keydown={(e) => e.key === 'Enter' && openGalleryLightbox(index)}
          tabindex="0"
          role="button"
          aria-label="View gallery image"
        >
          <div class="relative overflow-hidden transition-all duration-300">
            <img
              src={photo.src}
              alt={photo.alt || photo.id}
              class="w-full aspect-[4/3] object-contain bg-transparent transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          {#if photo.caption}
            <div class="mt-2">
              <p
                class="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors"
              >
                {photo.caption}
              </p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
