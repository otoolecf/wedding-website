<!-- src/lib/components/page-builder/sections/TextImageSection.svelte -->
<script>
  import AssignedImage from '$lib/components/AssignedImage.svelte';

  // Props
  export let properties = {
    content: '<p>Text content goes here</p>',
    imageId: null,
    caption: '',
    imageWidth: '1/2',
    verticalAlignment: 'center'
  };

  // imagePosition will be 'left' or 'right'
  export let imagePosition = 'left';

  // Map imageWidth to actual CSS classes
  const imageWidthClasses = {
    '1/4': 'w-full md:w-1/4',
    '1/3': 'w-full md:w-1/3',
    '1/2': 'w-full md:w-1/2',
    '2/3': 'w-full md:w-2/3'
  };

  // Calculate text width based on image width
  const textWidthMap = {
    '1/4': 'w-full md:w-3/4',
    '1/3': 'w-full md:w-2/3',
    '1/2': 'w-full md:w-1/2',
    '2/3': 'w-full md:w-1/3'
  };

  // Map vertical alignment to CSS classes
  const verticalAlignmentClasses = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end'
  };

  // Compute classes based on properties
  $: imageClasses = imageWidthClasses[properties.imageWidth] || imageWidthClasses['1/2'];
  $: textClasses = textWidthMap[properties.imageWidth] || textWidthMap['1/2'];
  $: containerClasses =
    verticalAlignmentClasses[properties.verticalAlignment] || verticalAlignmentClasses.center;
</script>

<div class="text-image-section">
  <div class="flex flex-col md:flex-row {containerClasses} gap-6 md:gap-8">
    {#if imagePosition === 'left'}
      <!-- Image on the left -->
      <div
        class="image-container {imageClasses} {imagePosition === 'left'
          ? 'order-1'
          : 'order-1 md:order-2'}"
      >
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

      <!-- Text content -->
      <div
        class="content-container {textClasses} {imagePosition === 'left'
          ? 'order-2'
          : 'order-2 md:order-1'}"
      >
        {@html properties.content}
      </div>
    {:else}
      <!-- Text content -->
      <div class="content-container {textClasses} order-2 md:order-1">
        {@html properties.content}
      </div>

      <!-- Image on the right -->
      <div class="image-container {imageClasses} order-1 md:order-2">
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
    {/if}
  </div>
</div>
