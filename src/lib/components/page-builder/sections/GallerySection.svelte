<!-- src/lib/components/page-builder/sections/GallerySection.svelte -->
<script>
  import { openLightbox } from '$lib/stores/lightbox';
  import AssignedImage from '$lib/components/AssignedImage.svelte';

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
    // Since we don't have actual images in the properties yet, we'll need
    // to replace this with actual gallery items from your implementation
    if (properties.images.length === 0) return;

    const galleryImages = properties.images.map((imageId) => ({
      src: '', // This would need to be fetched in a real implementation
      alt: 'Gallery image',
      caption: ''
    }));

    openLightbox(galleryImages, startIndex);
  }
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
          class="gallery-item cursor-pointer overflow-hidden rounded"
          on:click={() => openGalleryLightbox(index)}
          on:keydown={(e) => e.key === 'Enter' && openGalleryLightbox(index)}
          tabindex="0"
          role="button"
          aria-label="View gallery image"
        >
          <AssignedImage
            locationId={imageId}
            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
            enableLightbox={false}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>
