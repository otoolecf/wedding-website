<!-- src/lib/components/AssignedImage.svelte -->
<script>
  import { onMount } from 'svelte';

  // Props
  export let locationId;
  export let alt = '';
  export let className = '';
  export let fallbackSrc = '';

  // State
  let image = null;
  let loading = true;
  let error = false;

  onMount(async () => {
    try {
      const response = await fetch(`/api/images/assigned/${locationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const data = await response.json();
      image = data.image;
    } catch (err) {
      console.error(`Error loading image for location ${locationId}:`, err);
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <!-- Loading state -->
  <div class="bg-gray-200 animate-pulse {className}" style="min-height: 100px"></div>
{:else if image}
  <!-- Image loaded successfully -->
  <img src={image.src} alt={alt || image.alt || `Image for ${locationId}`} class={className} />
{:else if fallbackSrc}
  <!-- No assigned image, but fallback available -->
  <img src={fallbackSrc} alt={alt || `Fallback image for ${locationId}`} class={className} />
{:else}
  <!-- Error or no image available -->
  <div class="bg-gray-100 flex items-center justify-center {className}" style="min-height: 100px">
    <span class="text-gray-500 text-sm">No image available</span>
  </div>
{/if}
