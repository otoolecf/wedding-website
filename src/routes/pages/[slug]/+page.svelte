<!-- src/routes/pages/[slug]/+page.svelte -->
<script>
  import { SECTION_TYPES } from '$lib/page-builder/schema';
  import TextSection from '$lib/components/page-builder/sections/TextSection.svelte';
  import ImageSection from '$lib/components/page-builder/sections/ImageSection.svelte';
  import TextImageSection from '$lib/components/page-builder/sections/TextImageSection.svelte';
  import HeroSection from '$lib/components/page-builder/sections/HeroSection.svelte';
  import GallerySection from '$lib/components/page-builder/sections/GallerySection.svelte';
  import ColumnsSection from '$lib/components/page-builder/sections/ColumnsSection.svelte';
  import SpacerSection from '$lib/components/page-builder/sections/SpacerSection.svelte';
  import DividerSection from '$lib/components/page-builder/sections/DividerSection.svelte';
  import ButtonSection from '$lib/components/page-builder/sections/ButtonSection.svelte';
  import GlobalLightbox from '$lib/components/GlobalLightbox.svelte';
  import { page } from '$app/stores';
  import { onMount, afterUpdate } from 'svelte';

  export let data;

  // Extract the page data reactively
  $: pageData = data.page;
  $: pageId = data.id;
  $: timestamp = data.timestamp;
  $: slug = data.slug;

  // Debug logs
  onMount(() => {
    console.log(`Page mounted: ${$page.url.pathname}`, {
      id: pageId,
      slug: slug,
      name: pageData.name,
      timestamp: timestamp
    });
  });

  afterUpdate(() => {
    console.log(`Page updated: ${$page.url.pathname}`, {
      id: pageId,
      slug: slug,
      name: pageData.name,
      timestamp: timestamp
    });
  });
</script>

<svelte:head>
  <title>{pageData.name} | Connor & Colette Wedding</title>
  <!-- Add meta refresh to ensure page refreshes if data is stale -->
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />
</svelte:head>

<GlobalLightbox />

<!-- Use pageId instead of pageData.id for more reliable keying -->
<div class="custom-page" id={pageId} data-timestamp={timestamp} data-slug={slug}>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-4 text-section text-center font-bold">
      <h1>
        {pageData.name}
      </h1>
    </div>

    {#if !pageData.sections || pageData.sections.length === 0}
      <div class="py-12 text-center text-gray-500">
        <p>This page has no content sections yet.</p>
      </div>
    {:else}
      {#each pageData.sections as section (section.id)}
        <div class="section-wrapper mb-8">
          {#if section.type === SECTION_TYPES.TEXT}
            <TextSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.IMAGE}
            <ImageSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.TEXT_IMAGE_LEFT}
            <TextImageSection properties={section.properties} imagePosition="left" />
          {:else if section.type === SECTION_TYPES.TEXT_IMAGE_RIGHT}
            <TextImageSection properties={section.properties} imagePosition="right" />
          {:else if section.type === SECTION_TYPES.HERO}
            <HeroSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.GALLERY}
            <GallerySection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.COLUMNS}
            <ColumnsSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.SPACER}
            <SpacerSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.DIVIDER}
            <DividerSection properties={section.properties} />
          {:else if section.type === SECTION_TYPES.BUTTON}
            <ButtonSection properties={section.properties} />
          {:else}
            <div class="p-4 bg-red-50 text-red-600 rounded">
              Unknown section type: {section.type}
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  :global(.text-section h1),
  :global(.content-container h1) {
    font-size: 2rem !important;
    font-weight: bold !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
    line-height: 1.2 !important;
  }

  :global(.text-section h2),
  :global(.content-container h2) {
    font-size: 1.5rem !important;
    font-weight: bold !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
    line-height: 1.3 !important;
  }

  :global(.text-section h3),
  :global(.content-container h3) {
    font-size: 1.25rem !important;
    font-weight: bold !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
    line-height: 1.4 !important;
  }

  :global(.text-section h4),
  :global(.content-container h4) {
    font-size: 1rem !important;
    font-weight: bold !important;
    margin-top: 1rem !important;
    margin-bottom: 0.5rem !important;
    line-height: 1.4 !important;
  }
</style>
