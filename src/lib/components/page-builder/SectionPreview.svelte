<!-- src/lib/components/page-builder/SectionPreview.svelte -->
<script>
  import AssignedImage from '$lib/components/AssignedImage.svelte';

  // Props
  export let section;
  export let onRefresh = () => {}; // Callback function to refresh the preview
</script>

<!-- Section preview based on type -->
<div class="mt-4 p-2 border-t border-gray-200">
  <div class="flex justify-between items-center mb-2">
    <span class="text-sm font-medium text-gray-500">Section Preview</span>
    <button class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded" on:click={onRefresh}>
      Refresh Preview
    </button>
  </div>

  <div class="p-3 bg-white border rounded">
    <!-- Text Section Preview -->
    {#if section.type === 'text'}
      <div class="preview-content">
        {@html section.properties.content || '<p>No content added yet</p>'}
      </div>

      <!-- Image Section Preview -->
    {:else if section.type === 'image'}
      <div
        class="preview-content"
        class:text-left={section.properties.alignment === 'left'}
        class:text-center={section.properties.alignment === 'center'}
        class:text-right={section.properties.alignment === 'right'}
      >
        {#if section.properties.imageId}
          <figure class="inline-block" style="width: {section.properties.maxWidth || '100%'};">
            <AssignedImage
              locationId={section.properties.imageId}
              className="w-full h-auto rounded"
              alt={section.properties.caption || 'Image'}
            />
            {#if section.properties.caption}
              <figcaption class="text-sm text-gray-600 mt-1">
                {section.properties.caption}
              </figcaption>
            {/if}
          </figure>
        {:else}
          <div class="py-8 text-center text-gray-400 italic">
            No image selected. The preview will appear here once you select an image.
          </div>
        {/if}
      </div>

      <!-- Text+Image Preview -->
    {:else if section.type === 'text_image_left' || section.type === 'text_image_right'}
      <div class="flex flex-col md:flex-row gap-4 preview-content">
        <!-- Image side -->
        <div class="{section.type === 'text_image_left' ? 'md:order-1' : 'md:order-2'} md:w-1/2">
          {#if section.properties.imageId}
            <figure class="w-full" style="width: {section.properties.maxWidth || '100%'};">
              <AssignedImage
                locationId={section.properties.imageId}
                className="w-full rounded"
                alt={section.properties.caption || 'Image'}
              />
              {#if section.properties.caption}
                <figcaption class="text-sm text-gray-600 mt-1 text-center">
                  {section.properties.caption}
                </figcaption>
              {/if}
            </figure>
          {:else}
            <div class="border rounded p-12 bg-gray-50 text-center text-gray-400">
              <p>No image selected</p>
            </div>
          {/if}
        </div>

        <!-- Text side -->
        <div class="{section.type === 'text_image_left' ? 'md:order-2' : 'md:order-1'} md:w-1/2">
          {@html section.properties.content || '<p>No content added yet</p>'}
        </div>
      </div>

      <!-- Hero Section Preview -->
    {:else if section.type === 'hero'}
      <div class="preview-content">
        <div class="relative w-full h-48 overflow-hidden rounded bg-gray-800">
          {#if section.properties.imageId}
            <AssignedImage
              locationId={section.properties.imageId}
              className="w-full h-full object-cover opacity-75"
              alt=""
            />
          {/if}

          <div class="absolute inset-0 flex flex-col items-center justify-center p-4">
            <h2 class="text-xl font-bold text-white mb-2">
              {section.properties.heading || 'Hero Heading'}
            </h2>
            {#if section.properties.subheading}
              <p class="text-white text-sm">{section.properties.subheading}</p>
            {/if}

            {#if section.properties.buttonText}
              <button class="mt-2 px-4 py-1 text-sm bg-primary text-white rounded">
                {section.properties.buttonText}
              </button>
            {/if}
          </div>
        </div>
      </div>

      <!-- Other Section Types -->
    {:else}
      <div class="py-4 text-center text-gray-500">Preview not available for this section type</div>
    {/if}
  </div>
</div>
