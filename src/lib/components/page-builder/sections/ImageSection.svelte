<!-- src/lib/components/page-builder/sections/ImageSection.svelte -->
<script>
  import AssignedImage from '$lib/components/AssignedImage.svelte';

  // Props
  export let properties = {
    imageId: null,
    caption: '',
    alignment: 'center',
    maxWidth: 'medium'
  };

  // Map maxWidth to actual CSS classes
  const widthClasses = {
    small: 'max-w-lg',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    full: 'max-w-none'
  };

  // Map alignment to CSS classes
  const alignmentClasses = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  };

  // Compute classes based on properties
  $: containerClasses = [
    widthClasses[properties.maxWidth] || widthClasses.medium,
    alignmentClasses[properties.alignment] || alignmentClasses.center
  ].join(' ');
</script>

<div class="image-section {containerClasses}">
  {#if properties.imageId}
    <figure>
      <AssignedImage
        locationId={properties.imageId}
        className="w-full rounded shadow-sm"
        alt={properties.caption}
        enableLightbox={true}
      />
      {#if properties.caption}
        <figcaption class="text-center text-sm text-gray-600 mt-2">
          {properties.caption}
        </figcaption>
      {/if}
    </figure>
  {:else}
    <div class="border rounded p-12 bg-gray-50 text-center text-gray-400">
      <p>No image selected</p>
    </div>
  {/if}
</div>
