<!-- src/routes/admin/content/+page.svelte -->
<script>
  import AdminNav from '$lib/components/AdminNav.svelte';
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  // Store for content sections
  const contentSections = writable([]);

  // UI state variables
  let loading = true;
  let saving = false;
  let error = null;
  let success = null;
  let editingSection = null;
  let showAddModal = false;
  let newSectionTitle = '';
  let newSectionKey = '';
  let deleteConfirmKey = '';
  let showDeleteModal = false;
  let sectionToDelete = null;

  // TinyMCE instance reference
  let editor = null;

  // Add TinyMCE script
  let tinymceLoaded = false;

  onMount(async () => {
    // Load TinyMCE script
    if (!window.tinymce) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.6.0/tinymce.min.js';
      script.onload = () => {
        tinymceLoaded = true;
        fetchContent();
      };
      document.head.appendChild(script);
    } else {
      tinymceLoaded = true;
      fetchContent();
    }
  });

  // Fetch content from API
  async function fetchContent() {
    loading = true;
    error = null;

    try {
      const response = await fetch('/api/admin/content');
      if (!response.ok) {
        throw new Error('Failed to fetch content sections');
      }

      const data = await response.json();
      contentSections.set(data.sections || []);
    } catch (err) {
      console.error('Error fetching content:', err);
      error = 'Failed to load content. Please try again.';
    } finally {
      loading = false;
    }
  }

  // Initialize TinyMCE
  function initEditor(element, initialContent) {
    if (!tinymceLoaded) return;

    window.tinymce.init({
      target: element,
      height: 400,
      menubar: false,
      plugins: 'lists link image table code help wordcount',
      toolbar:
        'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | removeformat',
      content_style:
        'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
      setup: (ed) => {
        editor = ed;
        editor.on('init', () => {
          editor.setContent(initialContent || '');
        });
      }
    });
  }

  // Edit a section
  function editSection(section) {
    editingSection = { ...section };

    // Initialize editor on next tick to ensure DOM is ready
    setTimeout(() => {
      initEditor(document.getElementById('content-editor'), section.content);
    }, 0);
  }

  // Save edited section
  async function saveSection() {
    if (!editingSection) return;

    saving = true;
    error = null;
    success = null;

    // Get content from editor
    const updatedContent = editor.getContent();

    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: editingSection.key,
          title: editingSection.title,
          content: updatedContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      // Update local state
      contentSections.update((sections) =>
        sections.map((s) =>
          s.key === editingSection.key
            ? { ...s, title: editingSection.title, content: updatedContent }
            : s
        )
      );

      success = 'Content saved successfully!';

      // Clear success message after 3 seconds
      setTimeout(() => {
        success = null;
      }, 3000);
    } catch (err) {
      console.error('Error saving content:', err);
      error = 'Failed to save content. Please try again.';
    } finally {
      saving = false;
    }
  }

  // Cancel editing
  function cancelEdit() {
    if (editor) {
      window.tinymce.remove('#content-editor');
    }
    editingSection = null;
  }

  // Show add section modal
  function showAddSectionModal() {
    newSectionTitle = '';
    newSectionKey = '';
    showAddModal = true;
  }

  // Generate a key from title
  function generateKey() {
    if (!newSectionTitle) return '';
    return newSectionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_');
  }

  // Add new section
  async function addSection() {
    if (!newSectionTitle || !newSectionKey) return;

    saving = true;
    error = null;
    success = null;

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: newSectionKey,
          title: newSectionTitle,
          content: '<p>Edit this content</p>'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add content section');
      }

      const data = await response.json();

      // Add to local state
      contentSections.update((sections) => [...sections, data.section]);

      success = 'Section added successfully!';
      showAddModal = false;

      // Edit the new section
      setTimeout(() => {
        editSection(data.section);
      }, 100);
    } catch (err) {
      console.error('Error adding section:', err);
      error = 'Failed to add section. Please try again.';
    } finally {
      saving = false;
    }
  }

  // Show delete confirmation
  function confirmDelete(section) {
    sectionToDelete = section;
    deleteConfirmKey = '';
    showDeleteModal = true;
  }

  // Delete section
  async function deleteSection() {
    if (!sectionToDelete || deleteConfirmKey !== sectionToDelete.key) return;

    saving = true;
    error = null;
    success = null;

    try {
      const response = await fetch(`/api/admin/content/${sectionToDelete.key}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      // Remove from local state
      contentSections.update((sections) => sections.filter((s) => s.key !== sectionToDelete.key));

      success = 'Section deleted successfully!';
      showDeleteModal = false;
      sectionToDelete = null;

      // If we were editing this section, stop editing
      if (editingSection && editingSection.key === sectionToDelete.key) {
        cancelEdit();
      }
    } catch (err) {
      console.error('Error deleting section:', err);
      error = 'Failed to delete section. Please try again.';
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Content Management | Wedding Admin</title>
</svelte:head>

<AdminNav />

<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Content Management</h1>
    <button
      class="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
      on:click={showAddSectionModal}
    >
      Add New Section
    </button>
  </div>

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  {#if success}
    <div class="bg-green-50 text-green-600 p-4 rounded mb-6">
      {success}
    </div>
  {/if}

  {#if loading}
    <div class="text-center py-8">
      <p>Loading content sections...</p>
    </div>
  {:else if !editingSection}
    <!-- Section List -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-medium mb-4">Website Content Sections</h2>

      {#if $contentSections.length === 0}
        <p class="text-gray-500 py-4">
          No content sections found. Add your first section to get started.
        </p>
      {:else}
        <div class="space-y-4">
          {#each $contentSections as section (section.key)}
            <div
              class="border rounded p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
            >
              <div>
                <h3 class="font-medium">{section.title}</h3>
                <p class="text-sm text-gray-500">Key: {section.key}</p>
              </div>
              <div class="flex gap-2">
                <button
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  on:click={() => editSection(section)}
                >
                  Edit
                </button>
                <button
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  on:click={() => confirmDelete(section)}
                >
                  Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Editor View -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium">Editing: {editingSection.title}</h2>
        <button
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          on:click={cancelEdit}
        >
          Back to Sections
        </button>
      </div>

      <div class="mb-4">
        <label for="section-title" class="block text-sm font-medium text-gray-700 mb-1">
          Section Title
        </label>
        <input
          id="section-title"
          type="text"
          bind:value={editingSection.title}
          class="w-full p-2 border rounded"
        />
      </div>

      <div class="mb-4">
        <label for="section-key" class="block text-sm font-medium text-gray-700 mb-1">
          Section Key
        </label>
        <input
          id="section-key"
          type="text"
          value={editingSection.key}
          disabled
          class="w-full p-2 border rounded bg-gray-50"
        />
        <p class="text-xs text-gray-500 mt-1">The section key cannot be changed after creation.</p>
      </div>

      <div class="mb-4">
        <label for="content-editor" class="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <div class="border rounded">
          <textarea id="content-editor" />
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
          on:click={cancelEdit}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
          on:click={saveSection}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  {/if}

  <!-- Add Section Modal -->
  {#if showAddModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Add New Content Section</h2>

        <div class="mb-4">
          <label for="new-section-title" class="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            id="new-section-title"
            type="text"
            bind:value={newSectionTitle}
            on:input={() => (newSectionKey = generateKey())}
            class="w-full p-2 border rounded"
            placeholder="About Us"
          />
        </div>

        <div class="mb-4">
          <label for="new-section-key" class="block text-sm font-medium text-gray-700 mb-1">
            Section Key
          </label>
          <input
            id="new-section-key"
            type="text"
            bind:value={newSectionKey}
            class="w-full p-2 border rounded"
            placeholder="about_us"
          />
          <p class="text-xs text-gray-500 mt-1">
            This key will be used to reference this content in your templates. Only use lowercase
            letters, numbers, and underscores.
          </p>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            on:click={() => (showAddModal = false)}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-primary text-white rounded hover:opacity-90 transition-colors"
            on:click={addSection}
            disabled={!newSectionTitle || !newSectionKey}
          >
            Add Section
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteModal && sectionToDelete}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4 text-red-600">Delete Section</h2>

        <p class="mb-4">
          Are you sure you want to delete the section "{sectionToDelete.title}"? This action cannot
          be undone.
        </p>

        <div class="mb-4">
          <label for="delete-confirm" class="block text-sm font-medium text-gray-700 mb-1">
            Type the section key to confirm: <span class="font-mono">{sectionToDelete.key}</span>
          </label>
          <input
            id="delete-confirm"
            type="text"
            bind:value={deleteConfirmKey}
            class="w-full p-2 border rounded"
            placeholder={sectionToDelete.key}
          />
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
            on:click={() => (showDeleteModal = false)}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            on:click={deleteSection}
            disabled={deleteConfirmKey !== sectionToDelete.key}
          >
            Delete Section
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
