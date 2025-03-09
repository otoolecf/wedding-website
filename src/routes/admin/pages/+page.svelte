<!-- src/routes/admin/pages/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import AdminNav from '$lib/components/AdminNav.svelte';

  // Page list state
  let pages = [];
  let loading = true;
  let error = null;

  // New page form state
  let showNewPageModal = false;
  let newPageName = '';
  let newPageSlug = '';
  let creatingPage = false;
  let createError = null;

  onMount(async () => {
    await fetchPages();
  });

  // Fetch all pages
  async function fetchPages() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/admin/pages');

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      pages = data.pages;
    } catch (err) {
      console.error('Error fetching pages:', err);
      error = 'Failed to load pages. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Generate a slug from the page name
  function generateSlug() {
    if (!newPageName) return '';

    newPageSlug = newPageName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // Open the new page modal
  function openNewPageModal() {
    newPageName = '';
    newPageSlug = '';
    createError = null;
    showNewPageModal = true;
  }

  // Close the new page modal
  function closeNewPageModal() {
    showNewPageModal = false;
  }

  // Create a new page
  async function createNewPage() {
    if (!newPageName) return;

    creatingPage = true;
    createError = null;

    try {
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newPageName,
          slug: newPageSlug
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create page');
      }

      const data = await response.json();

      // Close the modal and refresh the page list
      closeNewPageModal();
      await fetchPages();

      // Redirect to the new page editor
      window.location.href = `/admin/pages/${data.page.id}`;
    } catch (err) {
      console.error('Error creating page:', err);
      createError = err.message;
    } finally {
      creatingPage = false;
    }
  }

  // Delete a page
  async function deletePage(pageId, pageName) {
    if (
      !confirm(
        `Are you sure you want to delete the page "${pageName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      // Refresh the page list
      await fetchPages();
    } catch (err) {
      console.error('Error deleting page:', err);
      alert('Failed to delete page. Please try again.');
    }
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
</script>

<svelte:head>
  <title>Page Builder | Wedding Admin</title>
</svelte:head>

<AdminNav />

<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Page Builder</h1>
    <button
      class="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      on:click={openNewPageModal}
    >
      Create New Page
    </button>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-medium mb-4">Your Pages</h2>

    {#if loading}
      <div class="py-8 text-center">
        <p>Loading pages...</p>
      </div>
    {:else if pages.length === 0}
      <div class="py-8 text-center">
        <p class="text-gray-500">You haven't created any pages yet.</p>
        <button
          class="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          on:click={openNewPageModal}
        >
          Create Your First Page
        </button>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full table-auto">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-4 py-2 text-left">Page Name</th>
              <th class="px-4 py-2 text-left">Slug</th>
              <th class="px-4 py-2 text-left">Last Modified</th>
              <th class="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each pages as page}
              <tr class="border-t">
                <td class="px-4 py-3">{page.name}</td>
                <td class="px-4 py-3">
                  <span class="font-mono text-sm">{page.slug}</span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {formatDate(page.lastModified)}
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end space-x-2">
                    <a
                      href={`/admin/pages/${page.id}`}
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Edit
                    </a>
                    <a
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                    <button
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
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
      </div>
    {/if}
  </div>
</div>

<!-- New Page Modal -->
{#if showNewPageModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-xl font-semibold mb-4">Create New Page</h2>

      {#if createError}
        <div class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
          {createError}
        </div>
      {/if}

      <div class="mb-4">
        <label for="page-name" class="block text-sm font-medium text-gray-700 mb-1">
          Page Name
        </label>
        <input
          id="page-name"
          type="text"
          bind:value={newPageName}
          on:input={generateSlug}
          class="w-full p-2 border rounded"
          placeholder="My Custom Page"
        />
      </div>

      <div class="mb-4">
        <label for="page-slug" class="block text-sm font-medium text-gray-700 mb-1">
          Page Slug
        </label>
        <div class="flex">
          <span class="bg-gray-100 px-3 py-2 rounded-l border border-r-0 text-gray-500"
            >/pages/</span
          >
          <input
            id="page-slug"
            type="text"
            bind:value={newPageSlug}
            class="flex-1 p-2 border rounded-r"
            placeholder="my-custom-page"
          />
        </div>
        <p class="text-xs text-gray-500 mt-1">
          This will be the URL of your page. Use only lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
          on:click={closeNewPageModal}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
          on:click={createNewPage}
          disabled={!newPageName || !newPageSlug || creatingPage}
        >
          {#if creatingPage}
            Creating...
          {:else}
            Create Page
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
