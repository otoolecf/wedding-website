<!-- src/lib/components/page-builder/sections/HeroSection.svelte -->
<script>
  import AssignedImage from '$lib/components/AssignedImage.svelte';

  // Props
  export let properties = {
    heading: 'Hero Heading',
    subheading: 'Subheading text goes here',
    imageId: null,
    textColor: 'light',
    height: 'medium',
    textAlignment: 'center',
    buttonText: '',
    buttonLink: ''
  };

  // Map height to actual CSS classes
  const heightClasses = {
    small: 'h-64',
    medium: 'h-96',
    large: 'h-[32rem]',
    full: 'h-screen'
  };

  // Map text alignment to CSS classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Compute classes based on properties
  $: containerClasses = heightClasses[properties.height] || heightClasses.medium;
  $: textClasses = alignmentClasses[properties.textAlignment] || alignmentClasses.center;

  // Compute text color based on textColor property
  $: textColorStyle =
    properties.textColor === 'dark'
      ? 'color: var(--color-text);'
      : 'color: var(--color-background);';
</script>

<div class="hero-section relative w-full {containerClasses} overflow-hidden">
  <!-- Background image or color -->
  {#if properties.imageId}
    <div class="absolute inset-0 z-10">
      <AssignedImage
        locationId={properties.imageId}
        className="w-full h-full object-cover"
        enableLightbox={false}
      />
    </div>
    <div
      class="absolute inset-0 z-20"
      style="background-color: var(--color-primary); opacity: 0.4;"
    ></div>
  {:else}
    <div class="absolute inset-0 z-10" style="background-color: var(--color-primary);"></div>
  {/if}

  <!-- Content -->
  <div class="relative z-30 flex items-center justify-center h-full px-4">
    <div class="max-w-4xl mx-auto {textClasses}">
      <h2 class="text-3xl md:text-5xl font-bold mb-4" style={textColorStyle}>
        {properties.heading}
      </h2>

      {#if properties.subheading}
        <p class="text-lg md:text-xl mb-8 opacity-90" style={textColorStyle}>
          {properties.subheading}
        </p>
      {/if}

      {#if properties.buttonText && properties.buttonLink}
        <a
          href={properties.buttonLink}
          class="inline-block px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          style="background-color: var(--color-background); color: var(--color-primary);"
        >
          {properties.buttonText}
        </a>
      {/if}
    </div>
  </div>
</div>
