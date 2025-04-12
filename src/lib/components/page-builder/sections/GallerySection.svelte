<!-- src/lib/components/page-builder/sections/GallerySection.svelte -->
<script>
  import { openLightbox } from '$lib/stores/lightbox';
  import AssignedImage from '$lib/components/AssignedImage.svelte';
  import { onMount } from 'svelte';

  // Props
  export let properties = {
    images: [],
    columns: '3',
    spacing: 'medium'
  };

  // Map columns to actual CSS classes
  const columnClasses = {
    '2': 'grid-cols-1 sm:grid-cols-2',
    '3': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  };

  // Map spacing to actual CSS classes
  const spacingClasses = {
    small: 'gap-2',
    medium: 'gap-4',
    large: 'gap-6'
  };

  // Compute classes based on properties
  $: gridClasses = [
    columnClasses[properties.columns] || columnClasses['3'],
    spacingClasses[properties.spacing] || spacingClasses.medium
  ].join(' ');

  // Function to open the lightbox for all gallery images
  function openGalleryLightbox(startIndex) {
    if (properties.images.length === 0) return;

    // Get all images from the gallery
    const galleryImages = properties.images
      .map((imageId) => {
        const imageElement = document.querySelector(`[data-image-id="${imageId}"]`);
        if (!imageElement) return null;

        const img = imageElement.querySelector('img');
        const caption = imageElement.querySelector('.gallery-caption')?.textContent || '';

        return {
          src: img?.src || '',
          alt: img?.alt || 'Gallery image',
          caption: caption
        };
      })
      .filter(Boolean);

    if (galleryImages.length > 0) {
      openLightbox(galleryImages, startIndex);
    }
  }

  // Update captions after images load
  onMount(() => {
    // Wait for images to load
    setTimeout(() => {
      document.querySelectorAll('.gallery-item').forEach((item) => {
        const img = item.querySelector('img');
        const captionText = item.querySelector('.caption-text');
        if (img && captionText) {
          const alt = img.getAttribute('alt') || '';
          const caption = alt.replace(/^Image for /, '');
          captionText.textContent = caption || 'No caption';
        }
      });
    }, 100);
  });
</script>

<div class="gallery-section">
  {#if properties.images.length === 0}
    <div class="text-center p-8 bg-gray-50 border rounded">
      <p class="text-gray-500">No images have been added to this gallery yet.</p>
    </div>
  {:else}
    <div class="grid {gridClasses}">
      {#each properties.images as imageId, index}
        <div
          class="gallery-item group relative cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          data-image-id={imageId}
          on:click={() => openGalleryLightbox(index)}
          on:keydown={(e) => e.key === 'Enter' && openGalleryLightbox(index)}
          tabindex="0"
          role="button"
          aria-label="View gallery image"
        >
          <AssignedImage
            locationId={imageId}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            enableLightbox={false}
          />
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end"
          >
            <div class="p-4 text-white">
              <p class="gallery-caption text-sm font-light line-clamp-2">
                <AssignedImage locationId={imageId} className="hidden" enableLightbox={false} />
                <span class="caption-text">Loading caption...</span>
              </p>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
