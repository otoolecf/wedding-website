<!-- src/lib/components/PageOrderManager.svelte -->
<script>
  import { onMount } from 'svelte';
  import { pageBuilderStore } from '$lib/page-builder/store';

  let pages = [];
  let defaultPages = [];
  let loading = false;
  let error = null;
  let reordering = false;
  let activeButton = null; // 'up-{index}' or 'down-{index}'

  onMount(async () => {
    await loadPages();
  });

  async function loadPages() {
    loading = true;
    try {
      // Load custom pages
      const pagesResponse = await fetch('/api/admin/pages');
      if (!pagesResponse.ok) throw new Error('Failed to load custom pages');
      const pagesData = await pagesResponse.json();
      const customPages = pagesData.pages.sort((a, b) => a.order - b.order);

      // Load default pages from settings
      const settingsResponse = await fetch('/api/admin/settings');
      if (!settingsResponse.ok) throw new Error('Failed to load settings');
      const settingsData = await settingsResponse.json();
      defaultPages = settingsData.settings.defaultPages.sort((a, b) => a.order - b.order);

      // Combine and sort all pages
      pages = [...defaultPages, ...customPages].sort((a, b) => a.order - b.order);
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function updatePageOrder(pageId, newOrder, skipReload = false) {
    try {
      // Check if it's a default page
      const isDefaultPage = defaultPages.some((page) => page.id === pageId);

      if (isDefaultPage) {
        // Update default page order in settings
        const settingsResponse = await fetch('/api/admin/settings');
        if (!settingsResponse.ok) throw new Error('Failed to load settings');
        const settingsData = await settingsResponse.json();

        // Create a new array with updated order while preserving all other properties
        const updatedDefaultPages = settingsData.settings.defaultPages.map((page) => {
          if (page.id === pageId) {
            return {
              id: page.id,
              name: page.name,
              slug: page.slug,
              order: newOrder
            };
          }
          return {
            id: page.id,
            name: page.name,
            slug: page.slug,
            order: page.order
          };
        });

        // Create the updated settings object with all required fields
        const updatedSettings = {
          weddingDate: settingsData.settings.weddingDate,
          weddingTime: settingsData.settings.weddingTime,
          venueName: settingsData.settings.venueName,
          venueAddress: settingsData.settings.venueAddress,
          groomName: settingsData.settings.groomName,
          brideName: settingsData.settings.brideName,
          showCountdown: settingsData.settings.showCountdown,
          nameOrder: settingsData.settings.nameOrder,
          rsvpButtonText: settingsData.settings.rsvpButtonText,
          rsvpButtonLink: settingsData.settings.rsvpButtonLink,
          defaultPages: updatedDefaultPages
        };

        const updateResponse = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedSettings)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update default page order');
        }
      } else {
        // Update custom page order
        const response = await fetch(`/api/admin/pages/${pageId}/order`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ order: newOrder })
        });
        if (!response.ok) throw new Error('Failed to update custom page order');
      }

      if (!skipReload) {
        await loadPages(); // Reload to get updated order
      }
    } catch (e) {
      error = e.message;
    }
  }

  async function reorderPages(newPageOrder) {
    try {
      reordering = true;
      // Separate default and custom pages
      const defaultPagesToUpdate = [];
      const customPagesToUpdate = [];

      newPageOrder.forEach((page, index) => {
        const isDefault = defaultPages.some((p) => p.id === page.id);
        const newOrder = index;

        if (isDefault) {
          defaultPagesToUpdate.push({ ...page, order: newOrder });
        } else {
          customPagesToUpdate.push({ ...page, order: newOrder });
        }
      });

      // Update default pages if any
      if (defaultPagesToUpdate.length > 0) {
        const settingsResponse = await fetch('/api/admin/settings');
        if (!settingsResponse.ok) throw new Error('Failed to load settings');
        const settingsData = await settingsResponse.json();

        const updatedDefaultPages = settingsData.settings.defaultPages.map((page) => {
          const updated = defaultPagesToUpdate.find((p) => p.id === page.id);
          return updated ? { ...page, order: updated.order } : page;
        });

        const updatedSettings = {
          ...settingsData.settings,
          defaultPages: updatedDefaultPages
        };

        const updateResponse = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Failed to update page order');
        }
      }

      // Update custom pages if any
      for (const page of customPagesToUpdate) {
        await updatePageOrder(page.id, page.order, true);
      }

      await loadPages();
    } catch (e) {
      error = e.message;
    } finally {
      reordering = false;
      activeButton = null;
    }
  }

  async function movePageUp(index) {
    if (index <= 0 || reordering) return;
    activeButton = `up-${index}`;

    // Create new order by moving the page up
    const newOrder = [...pages];
    const [movedPage] = newOrder.splice(index, 1);
    newOrder.splice(index - 1, 0, movedPage);

    await reorderPages(newOrder);
  }

  async function movePageDown(index) {
    if (index >= pages.length - 1 || reordering) return;
    activeButton = `down-${index}`;

    // Create new order by moving the page down
    const newOrder = [...pages];
    const [movedPage] = newOrder.splice(index, 1);
    newOrder.splice(index + 1, 0, movedPage);

    await reorderPages(newOrder);
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
          <div class="flex items-center">
            <span class="font-medium">{page.name}</span>
            {#if defaultPages.some((p) => p.id === page.id)}
              <span class="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Default</span>
            {/if}
          </div>
          <div class="flex space-x-2">
            <button
              class="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors min-w-[32px] inline-flex items-center justify-center"
              on:click={() => movePageUp(index)}
              disabled={index === 0 || reordering}
            >
              {#if activeButton === `up-${index}`}
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {:else}
                ↑
              {/if}
            </button>
            <button
              class="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors min-w-[32px] inline-flex items-center justify-center"
              on:click={() => movePageDown(index)}
              disabled={index === pages.length - 1 || reordering}
            >
              {#if activeButton === `down-${index}`}
                <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              {:else}
                ↓
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
