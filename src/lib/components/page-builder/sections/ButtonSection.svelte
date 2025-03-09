<!-- src/lib/components/page-builder/sections/ButtonSection.svelte -->
<script>
  // Props
  export let properties = {
    text: 'Click Here',
    link: '#',
    alignment: 'center',
    style: 'primary',
    size: 'medium'
  };

  // Map alignment to actual CSS classes
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  // Map style to actual CSS classes
  const styleClasses = {
    primary: 'bg-primary text-white hover:opacity-90',
    secondary: 'bg-secondary text-white hover:opacity-90',
    outline: 'border border-primary text-primary bg-transparent hover:bg-gray-50'
  };

  // Map size to actual CSS classes
  const sizeClasses = {
    small: 'text-sm px-4 py-1',
    medium: 'px-6 py-2',
    large: 'text-lg px-8 py-3'
  };

  // Compute classes based on properties
  $: containerClass = alignmentClasses[properties.alignment] || alignmentClasses.center;
  $: buttonClasses = [
    'inline-block rounded-full transition-colors',
    styleClasses[properties.style] || styleClasses.primary,
    sizeClasses[properties.size] || sizeClasses.medium
  ].join(' ');
</script>

<div class="button-section py-4 {containerClass}">
  <a href={properties.link} class={buttonClasses}>
    {properties.text}
  </a>
</div>
