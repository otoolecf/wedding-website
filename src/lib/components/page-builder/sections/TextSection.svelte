<!-- src/lib/components/page-builder/sections/TextSection.svelte -->
<script>
  // Props
  export let properties = {
    content: '<p>Text content goes here</p>'
  };
</script>

<div class="text-section">
  {@html properties.content}
</div>
