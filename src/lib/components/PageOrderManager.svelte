<!-- src/lib/components/PageOrderManager.svelte -->
<script>
  import { onMount } from 'svelte';
  import { pageBuilderStore } from '$lib/page-builder/store';

  let pages = [];
  let loading = false;
  let error = null;

  onMount(async () => {
    await loadPages();
  });

  async function loadPages() {
    loading = true;
    try {
      const response = await fetch('/api/admin/pages');
      if (!response.ok) throw new Error('Failed to load pages');
      const data = await response.json();
      pages = data.pages.sort((a, b) => a.order - b.order);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function updatePageOrder(pageId, newOrder) {
    try {
      const response = await fetch(`/api/admin/pages/${pageId}/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order: newOrder })
      });
      if (!response.ok) throw new Error('Failed to update page order');
      await loadPages(); // Reload to get updated order
    } catch (e) {
      error = e.message;
    }
  }

  function movePageUp(index) {
    if (index <= 0) return;
    const page = pages[index];
    const prevPage = pages[index - 1];
    updatePageOrder(page.id, prevPage.order - 1);
  }

  function movePageDown(index) {
    if (index >= pages.length - 1) return;
    const page = pages[index];
    const nextPage = pages[index + 1];
    updatePageOrder(page.id, nextPage.order + 1);
  }
</script>

<div class="page-order-manager">
  <h2 class="text-xl font-semibold mb-4">Page Order</h2>

  {#if loading}
    <p>Loading pages...</p>
  {:else if error}
    <div class="text-red-600">{error}</div>
  {:else}
    <div class="space-y-2">
      {#each pages as page, index (page.id)}
        <div class="flex items-center justify-between p-3 bg-white rounded shadow-sm">
          <span class="font-medium">{page.name}</span>
          <div class="flex space-x-2">
            <button
              class="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              on:click={() => movePageUp(index)}
              disabled={index === 0}
            >
              ↑
            </button>
            <button
              class="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
              on:click={() => movePageDown(index)}
              disabled={index === pages.length - 1}
            >
              ↓
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
