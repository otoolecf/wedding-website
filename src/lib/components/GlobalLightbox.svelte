<!-- src/lib/components/GlobalLightbox.svelte -->
<script>
  import { onMount } from 'svelte';
  import { lightboxStore, closeLightbox, nextImage, prevImage } from '$lib/stores/lightbox';

  // Handle keyboard navigation
  function handleKeydown(event) {
    if (!$lightboxStore.visible) return;

    switch (event.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
    }
  }

  // Set up keyboard event listener
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  // Get current image
  $: activeImage = $lightboxStore.images[$lightboxStore.currentIndex] || null;
</script>

{#if $lightboxStore.visible && activeImage}
  <!-- Lightbox overlay -->
  <div
    class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    on:click={closeLightbox}
  >
    <!-- Close button -->
    <button
      class="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 focus:outline-none"
      on:click|stopPropagation={closeLightbox}
      aria-label="Close"
    >
      &times;
    </button>

    <!-- Navigation buttons -->
    {#if $lightboxStore.images.length > 1}
      <button
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 focus:outline-none {$lightboxStore.currentIndex ===
        0
          ? 'opacity-30 cursor-not-allowed'
          : ''}"
        on:click|stopPropagation={prevImage}
        disabled={$lightboxStore.currentIndex === 0}
        aria-label="Previous image"
      >
        &lt;
      </button>

      <button
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 focus:outline-none {$lightboxStore.currentIndex ===
        $lightboxStore.images.length - 1
          ? 'opacity-30 cursor-not-allowed'
          : ''}"
        on:click|stopPropagation={nextImage}
        disabled={$lightboxStore.currentIndex === $lightboxStore.images.length - 1}
        aria-label="Next image"
      >
        &gt;
      </button>
    {/if}

    <!-- Image container -->
    <div class="max-w-7xl max-h-[90vh] px-4 flex flex-col items-center" on:click|stopPropagation>
      <!-- Image -->
      <img
        src={activeImage.src}
        alt={activeImage.alt || 'Gallery image'}
        class="max-h-[80vh] max-w-full object-contain"
      />

      <!-- Caption and controls -->
      <div class="mt-4 text-white text-center w-full">
        <p class="mb-2 text-lg font-light">{activeImage.caption || 'No caption'}</p>

        {#if $lightboxStore.images.length > 1}
          <div class="text-sm text-gray-400 mt-2">
            {$lightboxStore.currentIndex + 1} / {$lightboxStore.images.length}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
