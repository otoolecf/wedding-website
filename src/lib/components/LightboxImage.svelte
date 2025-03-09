<!-- src/lib/components/LightboxImage.svelte -->
<script>
  import { openLightbox } from '$lib/stores/lightbox';

  // Props
  export let src = '';
  export let alt = '';
  export let caption = '';
  export let className = '';

  // When clicked, open this image in the lightbox
  function handleClick() {
    openLightbox([
      {
        src,
        alt,
        caption
      }
    ]);
  }
</script>

<!-- Image with click handler -->
<div
  class="lightbox-image-container cursor-pointer {className}"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  tabindex="0"
  role="button"
  aria-label={`View ${alt || caption || 'image'}`}
>
  <slot>
    <img {src} {alt} class="w-full h-full object-cover" />
  </slot>
</div>
