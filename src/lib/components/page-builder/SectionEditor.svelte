<!-- src/lib/components/page-builder/SectionEditor.svelte -->
<script>
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { pageBuilderStore } from '$lib/page-builder/store';
  import { SECTION_SCHEMA } from '$lib/page-builder/schema';
  import AssignedImage from '$lib/components/AssignedImage.svelte';
  import ImageSelectorModal from './ImageSelectorModal.svelte';

  // Props
  export let section;

  // Local state
  let initialized = false;
  let editors = {}; // Store multiple editors
  let tinymceLoaded = false;
  let showImageSelector = false;
  let currentImageField = null;
  let editorStatus = { loading: false, error: null };

  // Add TinyMCE script if not already loaded
  onMount(() => {
    loadTinyMCE();
  });

  function loadTinyMCE() {
    if (typeof window === 'undefined') return;

    if (!window.tinymce) {
      editorStatus.loading = true;
      console.log('Loading TinyMCE script...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.6.0/tinymce.min.js';
      script.integrity =
        'sha512-UHqGV6cerl7/zfGW/h49OdCQZwxF2CTSTcgOviBfH7VygKLLpTguKKBK1tHIf6PZ+QbB6IQ+a4SSi2m2M4g1OA==';
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      script.onload = () => {
        console.log('TinyMCE script loaded successfully');
        tinymceLoaded = true;
        editorStatus.loading = false;
        initializeAllEditors();
      };
      script.onerror = (e) => {
        console.error('Error loading TinyMCE script:', e);
        editorStatus.loading = false;
        editorStatus.error = 'Failed to load editor';
      };
      document.head.appendChild(script);
    } else {
      console.log('TinyMCE already loaded');
      tinymceLoaded = true;
      initializeAllEditors();
    }
  }

  onDestroy(() => {
    // Remove all editors when component is destroyed
    if (window.tinymce) {
      try {
        Object.values(editors).forEach((editor) => {
          if (editor) {
            editor.remove();
          }
        });
      } catch (e) {
        console.error('Error removing editors:', e);
      }
    }
  });

  // Initialize all editors when section changes
  $: if (section && tinymceLoaded) {
    initializeAllEditors();
  }

  // Initialize all TinyMCE editors for rich text fields
  function initializeAllEditors() {
    if (!tinymceLoaded || !section) return;
    console.log('Initializing editors for section:', section.id);

    const schema = SECTION_SCHEMA[section.type];
    if (!schema) {
      console.warn('No schema found for section type:', section.type);
      return;
    }

    // First, remove existing editors
    Object.values(editors).forEach((editor) => {
      if (editor) {
        try {
          editor.remove();
        } catch (e) {
          console.error('Error removing editor:', e);
        }
      }
    });
    editors = {};

    // Initialize editors for all richtext fields
    Object.entries(schema.properties).forEach(([propName, config]) => {
      if (config.type === 'richtext') {
        initializeEditor(propName);
      }
    });

    initialized = true;
  }

  // Initialize TinyMCE for a specific field
  function initializeEditor(propName) {
    const selector = `#editor-${section.id}-${propName}`;
    const editorElement = document.querySelector(selector);

    if (!editorElement) {
      console.warn(`Editor element not found for selector: ${selector}`);
      return;
    }

    console.log(`Initializing editor for field: ${propName}`);

    window.tinymce
      .init({
        target: editorElement,
        height: 300,
        menubar: false,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount'
        ],
        toolbar:
          'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style:
          'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
        setup: (ed) => {
          // Store the editor instance
          editors[propName] = ed;

          ed.on('init', () => {
            console.log(`Editor initialized for ${propName}`);
            const content = section.properties[propName] || '';
            ed.setContent(content);

            // Add a visual cue that the editor is ready
            const editorWrapper = document.querySelector(
              `div[aria-label*="editor-${section.id}-${propName}"]`
            );
            if (editorWrapper) {
              editorWrapper.style.border = '1px solid #4f46e5';
            }
          });

          // Use multiple events to ensure changes are captured
          ed.on('change keyup blur', () => {
            const content = ed.getContent();
            console.log(`Content updated for ${propName}`, content.substring(0, 50) + '...');
            updateProperty(propName, content);
          });
        }
      })
      .then((editors) => {
        console.log(`TinyMCE editor successfully initialized for ${propName}`);
      })
      .catch((err) => {
        console.error(`Failed to initialize TinyMCE editor for ${propName}:`, err);
        editorStatus.error = `Failed to initialize editor for ${propName}`;
      });
  }

  // Update a property in the section
  function updateProperty(propName, value) {
    console.log(`Updating property ${propName} with value length: ${value.length}`);
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

    {#if editorStatus.loading}
      <div class="p-4 bg-blue-50 text-blue-700 rounded mb-4">Loading editor...</div>
    {/if}

    {#if editorStatus.error}
      <div class="p-4 bg-red-50 text-red-700 rounded mb-4">
        {editorStatus.error}
      </div>
    {/if}

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
              <div id="editor-{section.id}-{propName}" class="min-h-[100px]"></div>
              <div class="p-2 text-xs bg-gray-50 text-gray-500 border-t">
                Tip: Use the toolbar above for formatting options. Changes are saved automatically.
              </div>
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
                      currentImageField = propName;
                      showImageSelector = true;
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
                      value={item.content}
                      on:input={(e) => {
                        const newArray = [...section.properties[propName]];
                        newArray[index] = { ...newArray[index], content: e.target.value };
                        updateProperty(propName, newArray);
                      }}
                    ></textarea>
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

    <!-- Debug information -->
    <details class="mt-6 border-t pt-4">
      <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
      <div
        class="mt-2 p-2 bg-gray-50 rounded text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto"
      >
        Section ID: {section.id}
        Type: {section.type}
        TinyMCE Loaded: {tinymceLoaded ? 'Yes' : 'No'}
        Editor Status: {JSON.stringify(editorStatus)}
        Editors initialized: {Object.keys(editors).join(', ') || 'None'}
      </div>
    </details>
  {/if}

  <!-- Image Selector Modal -->
  {#if showImageSelector}
    <ImageSelectorModal
      show={true}
      selectedImageId={section.properties[currentImageField]}
      on:select={(e) => {
        updateProperty(currentImageField, e.detail);
        showImageSelector = false;
      }}
      on:close={() => {
        showImageSelector = false;
      }}
    />
  {/if}
</div>
