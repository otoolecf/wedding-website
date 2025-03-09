<!-- src/lib/components/page-builder/sections/TextSection.svelte -->
<script>
  // Props
  export let properties = {
    content: '<p>Text content goes here</p>',
    alignment: 'left',
    maxWidth: 'medium'
  };

  // Map maxWidth to actual CSS classes
  const widthClasses = {
    narrow: 'max-w-xl',
    medium: 'max-w-3xl',
    wide: 'max-w-5xl',
    full: 'max-w-none'
  };

  // Map alignment to CSS classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right ml-auto'
  };

  // Compute classes based on properties
  $: containerClasses = [
    widthClasses[properties.maxWidth] || widthClasses.medium,
    alignmentClasses[properties.alignment] || alignmentClasses.left
  ].join(' ');
</script>

<div class="text-section {containerClasses}">
  {@html properties.content}
</div>
