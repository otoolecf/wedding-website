<!-- src/routes/admin/pages/[pageId]/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { pageBuilderStore } from '$lib/page-builder/store';
  import {
    SECTION_TYPES,
    getSectionTypeName,
    getSectionTypeIcon,
    getAvailableSectionTypes
  } from '$lib/page-builder/schema';
  import AdminNav from '$lib/components/AdminNav.svelte';
  import SectionEditor from '$lib/components/page-builder/SectionEditor.svelte';
  import PagePreview from '$lib/components/page-builder/PagePreview.svelte';
  import SaveFeedback from '$lib/components/page-builder/SaveFeedback.svelte';

  export let data = {};

  // Get page ID from route params, with fallback
  const pageId = data?.params?.pageId || '';

  // UI state
  let saving = false;
  let showAddSectionModal = false;
  let sectionTypes = getAvailableSectionTypes();
  let debugMode = false; // For development debugging

  // Subscribe to the page builder store
  $: sections = $pageBuilderStore.sections;
  $: selectedSectionId = $pageBuilderStore.selectedSectionId;
  $: previewMode = $pageBuilderStore.previewMode;
  $: isDirty = $pageBuilderStore.isDirty;
  $: error = $pageBuilderStore.error;
  $: isLoading = $pageBuilderStore.isLoading;
  $: isSaving = $pageBuilderStore.isSaving;

  onMount(async () => {
    // Toggle debug mode with keyboard shortcut (Ctrl+Shift+D)
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        debugMode = !debugMode;
        console.log('Debug mode:', debugMode);
        e.preventDefault();
      }
    });

    // Only load the page if we have a valid pageId
    if (pageId) {
      console.log('Loading page:', pageId);
      // Load the page data
      await pageBuilderStore.loadPage(pageId);
    } else {
      console.error('No pageId provided in route params');
      pageBuilderStore.update((state) => ({
        ...state,
        error: 'Missing page ID. Please return to the pages list and try again.'
      }));
    }
  });

  // Save the page
  async function savePage() {
    if (isSaving) return; // Prevent multiple saves

    try {
      saving = true;
      console.log('Saving page...');
      await pageBuilderStore.savePage();

      // Success feedback can come from the SaveFeedback component
    } catch (err) {
      console.error('Error during save:', err);
    } finally {
      saving = false;
    }
  }

  // Auto-save feature with debounce
  let autoSaveTimeout;
  $: if (isDirty && !isSaving) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      console.log('Auto-saving changes...');
      savePage();
    }, 3000); // Auto-save after 3 seconds of inactivity
  }

  // Open the add section modal
  function openAddSectionModal() {
    showAddSectionModal = true;
  }

  // Close the add section modal
  function closeAddSectionModal() {
    showAddSectionModal = false;
  }

  // Add a new section
  function addSection(sectionType) {
    pageBuilderStore.addSection(sectionType);
    closeAddSectionModal();
  }

  // Remove a section
  function removeSection(sectionId) {
    if (confirm('Are you sure you want to remove this section?')) {
      pageBuilderStore.removeSection(sectionId);
    }
  }

  // Move a section up
  function moveSectionUp(sectionId) {
    pageBuilderStore.moveSection(sectionId, 'up');
  }

  // Move a section down
  function moveSectionDown(sectionId) {
    pageBuilderStore.moveSection(sectionId, 'down');
  }

  // Select a section for editing
  function selectSection(sectionId) {
    pageBuilderStore.selectSection(sectionId);
  }

  // Toggle preview mode
  function togglePreview() {
    pageBuilderStore.togglePreview();
  }

  // Get currently selected section
  $: selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Navigation prompt for unsaved changes
  function handleBeforeUnload(event) {
    if (isDirty) {
      event.preventDefault();
      return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
    }
  }
</script>

<svelte:head>
  <title>{$pageBuilderStore.pageName || 'Page Editor'} | Wedding Admin</title>
</svelte:head>

<svelte:window on:beforeunload={handleBeforeUnload} />

<AdminNav />

<div class="min-h-screen bg-gray-50">
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center">
        <a href="/admin/pages" class="text-gray-500 hover:text-gray-700 mr-3">
          <span>←</span>
        </a>
        <h1 class="text-xl font-semibold">{$pageBuilderStore.pageName || 'Loading...'}</h1>
        {#if $pageBuilderStore.pageSlug}
          <span class="ml-3 text-sm text-gray-500">
            /pages/<span class="font-mono">{$pageBuilderStore.pageSlug}</span>
          </span>
        {/if}
      </div>

      <div class="flex items-center gap-4">
        <SaveFeedback showDebug={debugMode} />

        <div class="space-x-2 flex items-center">
          <button
            class="px-3 py-1 border rounded bg-white hover:bg-gray-50 text-sm transition-colors"
            on:click={togglePreview}
          >
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>

          {#if $pageBuilderStore.pageSlug}
            <a
              href={`/pages/${$pageBuilderStore.pageSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              class="px-3 py-1 border bg-green-50 text-green-700 border-green-300 rounded text-sm hover:bg-green-100 transition-colors"
            >
              View Live
            </a>
          {/if}

          <button
            class="px-4 py-1 bg-primary text-white rounded hover:opacity-90 transition-colors text-sm"
            on:click={savePage}
            disabled={saving || !isDirty || isSaving}
          >
            {#if isSaving}
              Saving...
            {:else}
              Save
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if error}
    <div class="max-w-7xl mx-auto px-4 py-3 mt-3">
      <div class="bg-red-50 text-red-600 p-3 rounded">
        {error}
      </div>
    </div>
  {/if}

  {#if !pageId}
    <div class="max-w-7xl mx-auto px-4 py-12 text-center">
      <p class="text-red-600">
        Missing page ID. Please return to the <a href="/admin/pages" class="underline">pages list</a
        > and try again.
      </p>
    </div>
  {:else if isLoading}
    <div class="max-w-7xl mx-auto px-4 py-12 text-center">
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
      <span>Loading page...</span>
    </div>
  {:else if previewMode}
    <!-- Preview Mode -->
    <div class="max-w-5xl mx-auto px-4 py-4 bg-white mt-4 shadow-sm rounded mb-8">
      <PagePreview {sections} />
    </div>
  {:else}
    <!-- Editor Mode -->
    <div class="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
      <!-- Section List -->
      <div class="col-span-12 md:col-span-4 lg:col-span-3">
        <div class="bg-white p-4 rounded shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <h2 class="font-medium">Page Sections</h2>
            <button
              class="px-2 py-1 text-xs bg-primary text-white rounded hover:opacity-90"
              on:click={openAddSectionModal}
            >
              Add Section
            </button>
          </div>

          {#if sections.length === 0}
            <div class="py-8 text-center">
              <p class="text-gray-500 text-sm">No sections yet.</p>
              <button
                class="mt-3 px-3 py-1 bg-primary text-white rounded hover:opacity-90 text-sm"
                on:click={openAddSectionModal}
              >
                Add Your First Section
              </button>
            </div>
          {:else}
            <ul class="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {#each sections as section, index}
                {@const isSelected = section.id === selectedSectionId}
                <li
                  class="border rounded p-2 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between {isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : ''}"
                  on:click={() => selectSection(section.id)}
                >
                  <div class="flex items-center">
                    <span
                      class="text-xs bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center mr-2"
                    >
                      {index + 1}
                    </span>
                    <span>{getSectionTypeName(section.type)}</span>
                  </div>

                  <div class="flex space-x-1">
                    <button
                      class="text-gray-500 hover:text-gray-700"
                      disabled={index === 0}
                      on:click|stopPropagation={() => moveSectionUp(section.id)}
                    >
                      ↑
                    </button>
                    <button
                      class="text-gray-500 hover:text-gray-700"
                      disabled={index === sections.length - 1}
                      on:click|stopPropagation={() => moveSectionDown(section.id)}
                    >
                      ↓
                    </button>
                    <button
                      class="text-red-500 hover:text-red-700"
                      on:click|stopPropagation={() => removeSection(section.id)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <!-- Section Editor -->
      <div class="col-span-12 md:col-span-8 lg:col-span-9">
        {#if selectedSection}
          <SectionEditor section={selectedSection} />
        {:else if sections.length > 0}
          <div class="bg-white p-6 rounded shadow-sm text-center py-12">
            <p class="text-gray-500">Select a section to edit its content</p>
          </div>
        {:else}
          <div class="bg-white p-6 rounded shadow-sm text-center py-12">
            <p class="text-gray-500">Add your first section to get started</p>
            <button
              class="mt-4 px-4 py-2 bg-primary text-white rounded hover:opacity-90"
              on:click={openAddSectionModal}
            >
              Add Section
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<!-- Add Section Modal -->
{#if showAddSectionModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Add New Section</h2>
        <button class="text-gray-500 hover:text-gray-700 text-2xl" on:click={closeAddSectionModal}>
          ×
        </button>
      </div>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto p-2"
      >
        {#each sectionTypes as sectionType}
          <button
            class="border rounded p-4 text-left hover:bg-gray-50 hover:border-gray-400 transition-colors"
            on:click={() => addSection(sectionType.type)}
          >
            <div class="font-medium mb-1">{sectionType.name}</div>
            <p class="text-sm text-gray-600 mb-3">{sectionType.description}</p>
            <div class="text-xs bg-primary text-white px-2 py-1 rounded inline-block">
              Add {sectionType.name}
            </div>
          </button>
        {/each}
      </div>

      <div class="mt-6 text-right">
        <button class="px-4 py-2 border rounded hover:bg-gray-50" on:click={closeAddSectionModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Debug Panel (only shown in debug mode) -->
{#if debugMode}
  <div
    class="fixed bottom-0 right-0 bg-gray-800 text-white p-4 w-96 max-h-72 overflow-y-auto text-xs"
  >
    <h3 class="text-sm font-bold mb-2">Debug Info</h3>
    <div class="space-y-1">
      <p>Page ID: {pageId}</p>
      <p>Sections: {sections.length}</p>
      <p>isDirty: {isDirty}</p>
      <p>isLoading: {isLoading}</p>
      <p>isSaving: {isSaving}</p>
      <p>Selected: {selectedSectionId}</p>
      <button
        class="mt-2 px-2 py-1 bg-blue-500 text-xs text-white rounded"
        on:click={() => pageBuilderStore.diagnose()}
      >
        Diagnose Store
      </button>
    </div>
  </div>
{/if}
