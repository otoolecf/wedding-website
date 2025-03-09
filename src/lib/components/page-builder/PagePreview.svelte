<!-- src/lib/components/page-builder/PagePreview.svelte -->
<script>
  import { SECTION_TYPES } from '$lib/page-builder/schema';
  import TextSection from './sections/TextSection.svelte';
  import ImageSection from './sections/ImageSection.svelte';
  import TextImageSection from './sections/TextImageSection.svelte';
  import HeroSection from './sections/HeroSection.svelte';
  import GallerySection from './sections/GallerySection.svelte';
  import ColumnsSection from './sections/ColumnsSection.svelte';
  import SpacerSection from './sections/SpacerSection.svelte';
  import DividerSection from './sections/DividerSection.svelte';
  import ButtonSection from './sections/ButtonSection.svelte';

  // Props
  export let sections = [];
</script>

<div class="page-preview">
  {#if sections.length === 0}
    <div class="py-12 text-center text-gray-500">
      <p>This page has no content sections yet.</p>
    </div>
  {:else}
    {#each sections as section (section.id)}
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
