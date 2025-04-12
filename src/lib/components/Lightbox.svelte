<!-- src/lib/components/Lightbox.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  // Props
  export let images = [];
  export let currentIndex = 0;
  export let show = false;

  // Event dispatcher for handling close events
  const dispatch = createEventDispatcher();

  // Active image
  $: activeImage = images[currentIndex] || null;

  // Navigate between images
  function nextImage() {
    if (currentIndex < images.length - 1) {
      currentIndex += 1;
    }
  }

  function prevImage() {
    if (currentIndex > 0) {
      currentIndex -= 1;
    }
  }

  // Close the lightbox
  function closeLightbox() {
    dispatch('close');
  }

  // Handle keyboard navigation
  function handleKeydown(event) {
    if (!show) return;

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
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show && activeImage}
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
    {#if images.length > 1}
      <button
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 focus:outline-none {currentIndex ===
        0
          ? 'opacity-30 cursor-not-allowed'
          : ''}"
        on:click|stopPropagation={prevImage}
        disabled={currentIndex === 0}
        aria-label="Previous image"
      >
        &lt;
      </button>

      <button
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl opacity-70 hover:opacity-100 focus:outline-none {currentIndex ===
        images.length - 1
          ? 'opacity-30 cursor-not-allowed'
          : ''}"
        on:click|stopPropagation={nextImage}
        disabled={currentIndex === images.length - 1}
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

        <div class="text-sm text-gray-400 mt-2">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  </div>
{/if}
