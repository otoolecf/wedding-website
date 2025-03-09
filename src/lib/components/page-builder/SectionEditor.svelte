<!-- src/lib/components/page-builder/SectionEditor.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { pageBuilderStore } from '$lib/page-builder/store';
  import { SECTION_SCHEMA } from '$lib/page-builder/schema';
  import AssignedImage from '$lib/components/AssignedImage.svelte';
  import ImageSelectorModal from './ImageSelectorModal.svelte';

  // Props
  export let section;

  // Local state
  let initialized = false;
  let editor = null;
  let tinymceLoaded = false;
  let showImageSelector = false;
  let currentImageField = null;

  // Add TinyMCE script if not already loaded
  onMount(() => {
    if (!window.tinymce) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.6.0/tinymce.min.js';
      script.onload = () => {
        tinymceLoaded = true;
        initializeEditor();
      };
      document.head.appendChild(script);
    } else {
      tinymceLoaded = true;
      initializeEditor();
    }
  });

  onDestroy(() => {
    if (editor) {
      try {
        editor.remove();
      } catch (e) {
        console.error('Error removing editor:', e);
      }
    }
  });

  // Initialize or re-initialize the editor when the section changes
  $: if (initialized && section) {
    if (editor) {
      try {
        editor.remove();
      } catch (e) {
        console.error('Error removing editor:', e);
      }
    }

    if (tinymceLoaded) {
      setTimeout(initializeEditor, 0); // Initialize on next tick
    }
  }

  // Initialize TinyMCE for rich text editing
  function initializeEditor() {
    if (!tinymceLoaded || !section) return;

    const schema = SECTION_SCHEMA[section.type];
    if (!schema) return;

    // Find all richtext fields
    Object.entries(schema.properties).forEach(([propName, config]) => {
      if (config.type === 'richtext') {
        const selector = `#editor-${section.id}-${propName}`;
        const editorElement = document.querySelector(selector);

        if (editorElement) {
          window.tinymce.init({
            target: editorElement,
            height: 300,
            menubar: false,
            plugins: 'lists link image table code help wordcount',
            toolbar:
              'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | removeformat',
            content_style:
              'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
            setup: (ed) => {
              editor = ed;
              editor.on('init', () => {
                editor.setContent(section.properties[propName] || '');
              });
              editor.on('change', () => {
                updateProperty(propName, editor.getContent());
              });
            }
          });
        }
      }
    });

    initialized = true;
  }

  // Update a property in the section
  function updateProperty(propName, value) {
    const updates = {};
    updates[propName] = value;
    pageBuilderStore.updateSection(section.id, updates);
  }

  // Helper function to determine if a field should have an image selector
  function isImageField(fieldConfig) {
    return fieldConfig.type === 'image';
  }

  // Helper function to format field labels
  function formatFieldLabel(fieldName) {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .split(/[_\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Get the schema for the current section
  $: schema = SECTION_SCHEMA[section.type] || null;
</script>

<div class="bg-white p-6 rounded shadow-sm">
  {#if !section}
    <p class="text-center py-4 text-gray-500">No section selected</p>
  {:else if !schema}
    <p class="text-center py-4 text-red-500">Unknown section type: {section.type}</p>
  {:else}
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-xl font-medium">{schema.name}</h2>
      <span class="text-xs bg-gray-200 px-2 py-1 rounded">{section.id}</span>
    </div>

    <div class="space-y-6">
      {#each Object.entries(schema.properties) as [propName, config]}
        <div class="field">
          <label
            class="block text-sm font-medium text-gray-700 mb-1"
            for="editor-{section.id}-{propName}"
          >
            {formatFieldLabel(propName)}
          </label>

          {#if config.type === 'text'}
            <!-- Text input -->
            <input
              type="text"
              id="editor-{section.id}-{propName}"
              value={section.properties[propName]}
              class="w-full p-2 border rounded"
              on:input={(e) => updateProperty(propName, e.target.value)}
            />
          {:else if config.type === 'richtext'}
            <!-- Rich text editor -->
            <div class="border rounded">
              <textarea id="editor-{section.id}-{propName}"></textarea>
            </div>
          {:else if config.type === 'select'}
            <!-- Select dropdown -->
            <select
              id="editor-{section.id}-{propName}"
              class="w-full p-2 border rounded"
              value={section.properties[propName]}
              on:change={(e) => updateProperty(propName, e.target.value)}
            >
              {#each config.options as option}
                <option value={option}>{formatFieldLabel(option)}</option>
              {/each}
            </select>
          {:else if config.type === 'image'}
            <!-- Image selector -->
            <div class="border rounded p-3 bg-gray-50">
              {#if section.properties[propName]}
                <div class="mb-2">
                  <AssignedImage
                    locationId={section.properties[propName]}
                    className="w-full h-40 object-cover rounded"
                  />
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-500">Image ID: {section.properties[propName]}</span
                  >
                  <button
                    class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    on:click={() => updateProperty(propName, null)}
                  >
                    Remove
                  </button>
                </div>
              {:else}
                <div class="text-center py-4">
                  <p class="text-gray-500 mb-2">No image selected</p>
                  <button
                    class="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    on:click={() => {
                      alert(
                        'Image selector not implemented - you would select from your gallery here'
                      );
                      // You would implement an image selection modal here
                    }}
                  >
                    Select Image
                  </button>
                </div>
              {/if}
            </div>
          {:else if config.type === 'gallery'}
            <!-- Gallery selector -->
            <div class="border rounded p-3 bg-gray-50">
              <p class="text-center py-2 text-gray-500">Gallery selector - not implemented yet</p>
              <button
                class="w-full py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                on:click={() => {
                  alert('Gallery selector not implemented yet');
                }}
              >
                Manage Gallery Images
              </button>
            </div>
          {:else if config.type === 'array'}
            <!-- Array editor for columns -->
            <div class="border rounded p-3 bg-gray-50">
              <div class="space-y-3">
                {#each section.properties[propName] as item, index}
                  <div class="border p-3 rounded bg-white">
                    <div class="flex justify-between items-center mb-2">
                      <span class="font-medium">Column {index + 1}</span>
                      {#if section.properties[propName].length > 1}
                        <button
                          class="text-red-500"
                          on:click={() => {
                            const newArray = [...section.properties[propName]];
                            newArray.splice(index, 1);
                            updateProperty(propName, newArray);
                          }}
                        >
                          Remove
                        </button>
                      {/if}
                    </div>

                    <textarea
                      class="w-full p-2 border rounded"
                      rows="4"
                      on:input={(e) => {
                        const newArray = [...section.properties[propName]];
                        newArray[index] = { ...newArray[index], content: e.target.value };
                        updateProperty(propName, newArray);
                      }}>{item.content}</textarea
                    >
                  </div>
                {/each}

                <button
                  class="w-full py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  on:click={() => {
                    const newArray = [
                      ...section.properties[propName],
                      { content: '<p>New column content</p>' }
                    ];
                    updateProperty(propName, newArray);
                  }}
                >
                  Add Column
                </button>
              </div>
            </div>
          {/if}

          {#if config.helpText}
            <p class="text-xs text-gray-500 mt-1">{config.helpText}</p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
