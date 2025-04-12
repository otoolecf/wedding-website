<!-- src/lib/components/page-builder/sections/DividerSection.svelte -->
<script>
  // Props
  export let properties = {
    style: 'solid',
    width: 'wide',
    color: 'medium'
  };

  // Map style to actual CSS classes
  const styleClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted'
  };

  // Map width to actual CSS classes
  const widthClasses = {
    narrow: 'max-w-md',
    medium: 'max-w-2xl',
    wide: 'max-w-4xl',
    full: 'max-w-none'
  };

  // Map color to actual CSS classes
  const colorClasses = {
    light: 'border-gray-200',
    medium: 'border-gray-300',
    dark: 'border-gray-500',
    accent: 'border-accent',
    primary: 'border-primary'
  };

  // Compute classes based on properties
  $: dividerClasses = [
    styleClasses[properties.style] || styleClasses.solid,
    colorClasses[properties.color] || colorClasses.medium
  ].join(' ');

  $: containerClass = widthClasses[properties.width] || widthClasses.wide;
</script>

<div class="divider-section py-4 {containerClass} mx-auto">
  <hr class="border-t {dividerClasses}" />
</div>
