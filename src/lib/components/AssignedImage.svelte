<!-- src/lib/components/AssignedImage.svelte -->
<script>
  import { onMount } from 'svelte';
  import { openLightbox } from '$lib/stores/lightbox';

  // Props
  export let locationId;
  export let alt = '';
  export let className = '';
  export let fallbackSrc = '';
  export let enableLightbox = true; // Set to false to disable lightbox
  export let size = 'medium'; // 'thumbnail', 'medium', or 'original'

  // State
  let image = null;
  let loading = true;
  let error = false;

  // React to locationId changes
  $: if (locationId) {
    loadImage();
  }

  async function loadImage() {
    loading = true;
    error = false;
    try {
      // Check if this is a direct image ID (UUID format)
      const isImageId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        locationId
      );

      if (isImageId) {
        // If it's a direct image ID, fetch the image metadata directly
        console.log(`Fetching direct image metadata for ID: ${locationId}`);
        const response = await fetch(`/api/images/gallery`);
        if (!response.ok) {
          throw new Error(`Failed to fetch gallery: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const imageData = data.images.find((img) => img.id === locationId);

        if (!imageData) {
          console.warn(`No image found with ID: ${locationId}`);
          error = true;
        } else {
          console.log(`Successfully loaded direct image:`, imageData);
          image = imageData;
        }
      } else {
        // Handle other location types (if any)
        console.warn(`Unsupported location ID format: ${locationId}`);
        error = true;
      }
    } catch (err) {
      console.error('Error loading image:', err);
      error = true;
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    if (!locationId) {
      console.warn('No locationId provided to AssignedImage');
      loading = false;
      return;
    }
    await loadImage();
  });

  function handleClick() {
    if (enableLightbox && image) {
      openLightbox({
        src: image.variants.original,
        alt: image.alt || alt,
        caption: image.caption || ''
      });
    }
  }
</script>

<div class="relative">
  {#if loading}
    <div class="w-full h-full flex items-center justify-center bg-gray-100">
      <div class="animate-pulse">Loading...</div>
    </div>
  {:else if error}
    <div class="w-full h-full flex items-center justify-center bg-red-50 text-red-500">
      Failed to load image
    </div>
  {:else if image}
    <img
      src={image.variants[size] || image.variants.medium}
      alt={image.alt || alt}
      class={className}
      on:click={handleClick}
      on:keydown={(e) => e.key === 'Enter' && handleClick()}
      tabindex={enableLightbox ? '0' : undefined}
    />
  {:else if fallbackSrc}
    <img src={fallbackSrc} {alt} class={className} />
  {:else}
    <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
      No image
    </div>
  {/if}
</div>
