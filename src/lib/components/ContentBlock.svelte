<!-- src/lib/components/ContentBlock.svelte -->
<script>
  import { onMount } from 'svelte';
  import { contentStore } from '$lib/stores/content';

  // Props
  export let contentKey = '';
  export let fallback = '';
  export let className = '';

  // Local state
  let content = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    if (!contentKey) {
      content = fallback;
      loading = false;
      return;
    }

    try {
      const section = await contentStore.getSection(contentKey);

      if (section) {
        content = section.content;
      } else {
        content = fallback;
        error = `Content with key '${contentKey}' not found`;
      }
    } catch (err) {
      console.error('Error loading content block:', err);
      content = fallback;
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="animate-pulse bg-gray-100 h-8 w-full rounded {className}"></div>
{:else if error && !content}
  <div class="text-red-500 text-sm {className}">Error: {error}</div>
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class={className} {...$$restProps}>
    {@html content}
  </div>
{/if}
