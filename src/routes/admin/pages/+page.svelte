<!-- src/routes/admin/pages/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import AdminNav from '$lib/components/AdminNav.svelte';
  import PageOrderManager from '$lib/components/PageOrderManager.svelte';

  // State
  let pages = [];
  let loading = true;
  let error = null;
  let showNewPageModal = false;
  let newPage = {
    name: '',
    slug: ''
  };
  let slugManuallyEdited = false;

  onMount(async () => {
    await loadPages();
  });

  async function loadPages() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/admin/pages');
      if (!response.ok) {
        throw new Error('Failed to load pages');
      }

      const data = await response.json();
      pages = data.pages.sort((a, b) => a.order - b.order);
    } catch (err) {
      console.error('Error fetching pages:', err);
      error = 'Failed to load pages. Please try again.';
    } finally {
      loading = false;
    }
  }

  function generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  function handleNameInput() {
    // Only update slug if it hasn't been manually edited
    if (!slugManuallyEdited) {
      newPage.slug = newPage.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  }

  function handleSlugInput() {
    // Mark that the slug has been manually edited
    slugManuallyEdited = true;
    // Clean up slug
    newPage.slug = newPage.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async function createNewPage() {
    if (!newPage.name || !newPage.slug) return;

    try {
      // Get current pages to determine the next order value
      const pagesResponse = await fetch('/api/admin/pages');
      const pagesData = await pagesResponse.json();
      const maxOrder = Math.max(0, ...pagesData.pages.map((p) => p.order || 0));

      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPage,
          order: maxOrder + 1 // Place new page at the end
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create page');
      }

      showNewPageModal = false;
      newPage = { name: '', slug: '' };
      slugManuallyEdited = false;
      await loadPages();
    } catch (err) {
      console.error('Error creating page:', err);
      error = err.message;
    }
  }

  async function deletePage(pageId, pageName) {
    if (!confirm(`Are you sure you want to delete the page "${pageName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      // Refresh the list of pages
      await loadPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      error = err.message;
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'Never';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Invalid date';
    }
  }
</script>

<svelte:head>
  <title>Page Manager | Wedding Admin</title>
</svelte:head>

<AdminNav />

<div class="max-w-7xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Manage Pages</h1>
    <button
      class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
      on:click={() => (showNewPageModal = true)}
    >
      Create New Page
    </button>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  <div class="space-y-8">
    <PageOrderManager />

    {#if loading}
      <div class="text-center p-12">
        <div class="inline-block animate-spin mr-2">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <span>Loading pages...</span>
      </div>
    {:else}
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        {#if pages.length === 0}
          <div class="text-center py-12">
            <p class="text-gray-500 mb-4">No pages found. Create your first page to get started.</p>
            <button
              class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
              on:click={() => (showNewPageModal = true)}
            >
              Create New Page
            </button>
          </div>
        {:else}
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Page Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  URL Path
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Modified
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each pages as page (page.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{page.name}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      <span class="font-mono">/pages/{page.slug}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">
                      {formatDate(page.lastModified)}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end space-x-2">
                      <a
                        href={`/admin/pages/${page.id}`}
                        class="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        Edit
                      </a>
                      <a
                        href={`/pages/${page.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-gray-100"
                      >
                        View
                      </a>
                      <button
                        class="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-gray-100"
                        on:click={() => deletePage(page.id, page.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- New Page Modal -->
{#if showNewPageModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
      <h2 class="text-xl font-semibold mb-4">Create New Page</h2>

      <div class="space-y-4">
        <div>
          <label for="page-name" class="block text-sm font-medium text-gray-700 mb-1">
            Page Name
          </label>
          <input
            id="page-name"
            type="text"
            bind:value={newPage.name}
            on:input={handleNameInput}
            class="w-full p-2 border rounded"
            placeholder="About Us"
          />
        </div>

        <div>
          <label for="page-slug" class="block text-sm font-medium text-gray-700 mb-1">
            Page Slug
          </label>
          <div class="flex w-full">
            <span
              class="inline-flex items-center px-3 bg-gray-100 text-gray-500 border border-r-0 rounded-l whitespace-nowrap"
            >
              /pages/
            </span>
            <input
              id="page-slug"
              type="text"
              bind:value={newPage.slug}
              on:input={handleSlugInput}
              class="flex-1 p-2 border rounded-r min-w-0"
              placeholder="about-us"
            />
          </div>
          <p class="text-xs text-gray-500 mt-1">This will be the URL path for your page.</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2">
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
          on:click={() => {
            showNewPageModal = false;
            newPage = { name: '', slug: '' };
            slugManuallyEdited = false;
          }}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
          on:click={createNewPage}
          disabled={!newPage.name || !newPage.slug}
        >
          Create Page
        </button>
      </div>
    </div>
  </div>
{/if}
