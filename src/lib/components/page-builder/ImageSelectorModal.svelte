<!-- src/lib/components/page-builder/ImageSelectorModal.svelte -->
<script>
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  // Event dispatcher
  const dispatch = createEventDispatcher();

  // Props
  export let show = false;
  export let selectedImageId = null;

  // Local state
  let images = [];
  let loading = true;
  let error = null;
  let currentSelection = selectedImageId;

  // Fetch images when the modal is shown
  $: if (show) {
    fetchImages();
  }

  async function fetchImages() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/images/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      images = data.images || [];
    } catch (err) {
      console.error('Error fetching images:', err);
      error = 'Failed to load images. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Select an image
  function selectImage(imageId) {
    currentSelection = imageId;
  }

  // Confirm selection and close modal
  function confirmSelection() {
    dispatch('select', currentSelection);
    closeModal();
  }

  // Close modal without selection
  function closeModal() {
    dispatch('close');
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Select Image</h2>
        <button class="text-gray-500 hover:text-gray-700 text-2xl" on:click={closeModal}>×</button>
      </div>

      {#if error}
        <div class="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      {/if}

      <div class="flex-1 overflow-y-auto">
        {#if loading}
          <div class="py-12 text-center">
            <p>Loading images...</p>
          </div>
        {:else if images.length === 0}
          <div class="py-12 text-center">
            <p class="text-gray-500">No images available. Upload images in the Gallery section.</p>
          </div>
        {:else}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {#each images as image (image.id)}
              <div
                class="cursor-pointer p-2 rounded border {currentSelection === image.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'hover:border-gray-400'}"
                on:click={() => selectImage(image.id)}
                on:keydown={(e) => e.key === 'Enter' && selectImage(image.id)}
                tabindex="0"
                role="option"
                aria-selected={currentSelection === image.id}
              >
                <img
                  src={image.src}
                  alt={image.alt || ''}
                  class="w-full h-32 object-cover rounded"
                />
                <div class="mt-1 text-xs truncate">
                  {image.id}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button class="px-4 py-2 border rounded hover:bg-gray-50" on:click={closeModal}>
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          on:click={confirmSelection}
          disabled={!currentSelection}
        >
          Select Image
        </button>
      </div>
    </div>
  </div>
{/if}
