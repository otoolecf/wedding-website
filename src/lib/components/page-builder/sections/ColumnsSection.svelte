<!-- src/lib/components/page-builder/sections/ColumnsSection.svelte -->
<script>
  // Props
  export let properties = {
    columns: [{ content: '<p>Column 1 content</p>' }, { content: '<p>Column 2 content</p>' }],
    count: '2',
    spacing: 'medium'
  };

  // Map count to actual CSS classes
  const columnClasses = {
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-3',
    '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
  };

  // Map spacing to actual CSS classes
  const spacingClasses = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-10'
  };

  // Compute classes based on properties
  $: gridClasses = [
    columnClasses[properties.count] || columnClasses['2'],
    spacingClasses[properties.spacing] || spacingClasses.medium
  ].join(' ');
</script>

<div class="columns-section">
  <div class="grid {gridClasses}">
    {#each properties.columns as column}
      <div class="column">
        {@html column.content}
      </div>
    {/each}
  </div>
</div>
