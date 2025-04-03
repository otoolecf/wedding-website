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

  // State
  let image = null;
  let loading = true;
  let error = false;

  onMount(async () => {
    if (!locationId) {
      console.warn('No locationId provided to AssignedImage');
      loading = false;
      return;
    }

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
        // If it's a location ID, fetch the assigned image
        console.log(`Fetching assigned image for location: ${locationId}`);
        const response = await fetch(`/api/images/assigned/${locationId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.image) {
          console.warn(`No image data returned for location: ${locationId}`);
          error = true;
        } else {
          console.log(`Successfully loaded image for location: ${locationId}`, data.image);
          image = data.image;
        }
      }
    } catch (err) {
      console.error(`Error loading image for ${locationId}:`, err);
      error = true;
    } finally {
      loading = false;
    }
  });

  // Open the image in a lightbox when clicked
  function handleClick() {
    if (!enableLightbox || !image) return;

    openLightbox([
      {
        src: image.src,
        alt: alt || image.alt || `Image for ${locationId}`,
        caption: image.caption || ''
      }
    ]);
  }
</script>

{#if loading}
  <!-- Loading state -->
  <div class="bg-gray-200 animate-pulse {className}" style="min-height: 100px"></div>
{:else if image}
  <!-- Image loaded successfully -->
  <div
    class="{enableLightbox ? 'cursor-pointer' : ''} w-full h-full"
    on:click={handleClick}
    on:keydown={(e) => enableLightbox && e.key === 'Enter' && handleClick()}
    tabindex={enableLightbox ? '0' : undefined}
    role={enableLightbox ? 'button' : undefined}
    aria-label={enableLightbox ? `View ${alt || image.alt || 'image'}` : undefined}
  >
    <img src={image.src} alt={alt || image.alt || `Image for ${locationId}`} class={className} />
  </div>
{:else if fallbackSrc}
  <!-- No assigned image, but fallback available -->
  <img src={fallbackSrc} alt={alt || `Fallback image for ${locationId}`} class={className} />
{:else}
  <!-- Error or no image available -->
  <div class="bg-gray-100 flex items-center justify-center {className}" style="min-height: 100px">
    <span class="text-gray-500 text-sm">No image available</span>
  </div>
{/if}
