<!-- src/lib/components/page-builder/sections/SpacerSection.svelte -->
<script>
  // Props
  export let properties = {
    height: 'medium'
  };

  // Map height to actual CSS classes
  const heightClasses = {
    small: 'h-6',
    medium: 'h-12',
    large: 'h-24',
    'extra-large': 'h-36'
  };

  // Compute class based on properties
  $: heightClass = heightClasses[properties.height] || heightClasses.medium;
</script>

<div class="spacer-section {heightClass}"></div>
