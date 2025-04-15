<!-- src/lib/components/page-builder/SectionEditor.svelte -->
<script>
  import SectionPreview from './SectionPreview.svelte';
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
  let selectedSection = null;
  let editorStatus = { loading: false, error: null };
  let previousSectionId = null;
  let editorInitialized = {};

  // Add TinyMCE script if not already loaded
  onMount(() => {
    loadTinyMCE();

    // Keep track of the currently selected section
    previousSectionId = section?.id;

    // Handle refresh/navigation back to an already initialized page
    window.addEventListener('pageshow', (event) => {
      // If the page is being restored from the bfcache
      if (event.persisted) {
        console.log('Page restored from back/forward cache, reinitializing editors');
        // Reset initialized flag to allow reinitialization
        initialized = false;
        // Clean up any existing editors
        cleanupEditors();
        // Try to reload TinyMCE and reinitialize
        if (window.tinymce) {
          tinymceLoaded = true;
          initializeAllEditors();
        } else {
          loadTinyMCE();
        }
      }
    });
  });

  function loadTinyMCE() {
    if (typeof window === 'undefined') return;

    if (!window.tinymce) {
      editorStatus.loading = true;
      console.log('Loading TinyMCE script...');

      // Try multiple CDN sources in case one fails
      const cdnUrls = [
        'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.6.0/tinymce.min.js',
        'https://cdn.jsdelivr.net/npm/tinymce@6.6.0/tinymce.min.js',
        'https://cdn.tiny.cloud/1/no-api-key/tinymce/6.6.0/tinymce.min.js'
      ];

      // Try to load TinyMCE from one of the CDNs
      const loadScript = (index) => {
        if (index >= cdnUrls.length) {
          console.error('All TinyMCE CDN attempts failed');
          editorStatus.loading = false;
          editorStatus.error = 'Failed to load editor. Please try refreshing the page.';
          return;
        }

        const script = document.createElement('script');
        script.src = cdnUrls[index];
        script.onload = () => {
          console.log('TinyMCE script loaded successfully');
          tinymceLoaded = true;
          editorStatus.loading = false;
          initializeAllEditors();
        };
        script.onerror = () => {
          console.error('Error loading TinyMCE from:', cdnUrls[index]);
          // Try the next CDN
          loadScript(index + 1);
        };
        document.head.appendChild(script);
      };

      // Start with the first CDN
      loadScript(0);
    } else {
      console.log('TinyMCE already loaded');
      tinymceLoaded = true;
      initializeAllEditors();
    }
  }

  function cleanupEditors() {
    if (window.tinymce) {
      try {
        Object.values(editors).forEach((editor) => {
          if (editor) {
            editor.remove();
          }
        });
        editors = {};
        editorInitialized = {};
      } catch (e) {
        console.error('Error removing editors:', e);
      }
    }
  }

  onDestroy(() => {
    cleanupEditors();
  });

  // Watch for section changes to reinitialize editors when needed
  $: if (section && tinymceLoaded && initialized) {
    // This will run when section changes but we only want to reinitialize
    // if the section ID changes, not on every content edit

    // Check if there's a section ID change
    if (previousSectionId !== section.id) {
      console.log(
        `Section changed from ${previousSectionId} to ${section.id}, reinitializing editors`
      );
      // Clean up existing editors
      cleanupEditors();
      // Wait for next tick to ensure DOM is updated
      setTimeout(() => {
        if (tinymceLoaded) {
          initializeAllEditors();
        }
      }, 0);
      // Update previous section ID
      previousSectionId = section.id;
    }
  }

  $: if (section && selectedSection && section.id !== selectedSection.id) {
    console.log(`Switching from section ${selectedSection?.id} to ${section.id}`);
    // We need to schedule this to run after the DOM updates
    setTimeout(() => {
      if (tinymceLoaded) {
        initializeAllEditors();
      }
    }, 0);
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

    // Force cleanup of old editors
    cleanupEditors();

    // Initialize editors for all richtext fields
    Object.entries(schema.properties).forEach(([propName, config]) => {
      if (config.type === 'richtext') {
        // Add a small delay between initializations to prevent race conditions
        setTimeout(() => {
          initializeEditor(propName);
        }, 50);
      }
    });

    initialized = true;
    previousSectionId = section.id;
  }

  // Initialize TinyMCE for a specific field
  function initializeEditor(propName) {
    // Create a unique ID for the editor
    const editorId = `editor-${section.id}-${propName}`;
    const containerId = `editor-container-${section.id}-${propName}`;

    // Wait for the container to be available in the DOM
    const waitForContainer = (retries = 5) => {
      const containerElement = document.getElementById(containerId);
      if (containerElement) {
        setupEditor(containerElement, editorId, propName);
      } else if (retries > 0) {
        setTimeout(() => waitForContainer(retries - 1), 100);
      } else {
        console.warn(
          `Editor container not found for selector: #${containerId} after multiple attempts`
        );
      }
    };

    waitForContainer();
  }

  function setupEditor(containerElement, editorId, propName) {
    // Check if the editor is already initialized
    if (editors[propName]) {
      console.log(`Editor for ${propName} already exists, skipping initialization`);
      return;
    }

    console.log(`Setting up editor for field: ${propName}`);

    // First, create the editor DIV that TinyMCE will use
    const editorDiv = document.createElement('div');
    editorDiv.id = editorId;
    containerElement.innerHTML = ''; // Clear the container
    containerElement.appendChild(editorDiv);

    try {
      const editorConfig = {
        selector: `#${editorId}`,
        height: 300,
        menubar: false,
        plugins: 'lists link code table',
        toolbar: [
          'undo redo | blocks | bold italic underline | forecolor backcolor | removeformat',
          'alignleft aligncenter alignright | bullist numlist | link | code'
        ],
        block_formats:
          'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Quote=blockquote',
        content_style: `
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 14px; }
    .mce-content-body p { margin: 0; }
    h1 { font-size: 2rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.5rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
    h3 { font-size: 1.25rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
    h4 { font-size: 1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
    blockquote { border-left: 4px solid #ccc; padding-left: 1rem; font-style: italic; }
  `,
        formats: {
          alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes: 'text-left' },
          aligncenter: {
            selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li',
            classes: 'text-center'
          },
          alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', classes: 'text-right' }
        },
        setup: (ed) => {
          // Store the editor instance
          editors[propName] = ed;

          ed.on('init', () => {
            console.log(`Editor initialized for ${propName}`);
            try {
              const content = section.properties[propName] || '';
              ed.setContent(content);
            } catch (err) {
              console.error(`Error setting content for ${propName}:`, err);
            }
          });

          // Use throttled update to avoid excessive updates
          let updateTimeout;
          const updateWithThrottle = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
              const content = ed.getContent();
              // Only update if content has actually changed
              if (content !== section.properties[propName]) {
                console.log(`Content changed for ${propName}, updating`);
                updateProperty(propName, content);
              }
            }, 300);
          };

          ed.on('change', updateWithThrottle);
          ed.on('keyup', updateWithThrottle);
          ed.on('blur', updateWithThrottle);
        }
      };

      console.log(`Initializing TinyMCE with config for ${propName}`);
      window.tinymce
        .init(editorConfig)
        .then((editorInstances) => {
          console.log(`TinyMCE editor successfully initialized for ${propName}`);
        })
        .catch((err) => {
          console.error(`Failed to initialize TinyMCE editor for ${propName}:`, err);
          fallbackToTextarea(propName, containerElement);
        });
    } catch (error) {
      console.error(`Error during editor initialization for ${propName}:`, error);
      fallbackToTextarea(propName, containerElement);
    }
  }

  // Fallback to a simple textarea if TinyMCE fails
  function fallbackToTextarea(propName, containerElement) {
    editorStatus.error = `Editor initialization failed. Using basic textarea instead.`;

    // Fallback to a basic textarea if TinyMCE fails
    const textarea = document.createElement('textarea');
    textarea.value = section.properties[propName] || '';
    textarea.rows = 10;
    textarea.className = 'w-full p-2 border rounded';
    textarea.addEventListener('input', (e) => {
      updateProperty(propName, e.target.value);
    });

    // Replace the editor container with the textarea
    containerElement.innerHTML = '';
    containerElement.appendChild(textarea);
  }

  // Update a property in the section
  function updateProperty(propName, value) {
    console.log(`Updating property ${propName} with value:`, value);

    // Update the current selected section
    selectedSection = { ...section };

    // Check if the value is actually different before updating
    // Handle null values properly
    if (
      section.properties[propName] === value ||
      (section.properties[propName] === null && value === null)
    ) {
      console.log(`Property ${propName} unchanged, skipping update`);
      return;
    }

    const updates = {};
    updates[propName] = value;

    // Log the full update for debugging
    console.log(`Updating section ${section.id} with:`, updates);

    // Update the store
    pageBuilderStore.updateSection(section.id, updates);

    // Force a re-render of the preview when image is updated
    if (propName === 'imageId') {
      // Create a new section object to force reactivity
      section = { ...section, properties: { ...section.properties, imageId: value } };
    }
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

<div class="section-editor">
  <div class="sections-container">
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
                  <!-- This key element will prevent the div from being recreated during re-renders -->
                  <div id="editor-container-{section.id}-{propName}" class="editor-container"></div>
                  <div class="p-2 text-xs bg-gray-50 text-gray-500 border-t">
                    Tip: Use the toolbar above for formatting options. Changes are saved
                    automatically.
                  </div>
                </div>
              {:else if config.type === 'select'}
                <!-- Select dropdown - only show alignment and maxWidth for image sections when image is present -->
                {#if (propName === 'alignment' || propName === 'maxWidth') && section.type === 'image' && !section.properties.imageId}
                  <div class="text-sm text-gray-500 italic">
                    Select an image first to adjust these settings
                  </div>
                {:else}
                  <select
                    id="editor-{section.id}-{propName}"
                    class="w-full p-2 border rounded"
                    value={section.properties[propName]}
                    on:change={(e) => updateProperty(propName, e.target.value)}
                    disabled={(propName === 'alignment' || propName === 'maxWidth') &&
                      section.type === 'image' &&
                      !section.properties.imageId}
                  >
                    {#each config.options as option}
                      <option value={option}>{formatFieldLabel(option)}</option>
                    {/each}
                  </select>
                {/if}
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
                      <span class="text-sm text-gray-500"
                        >Image ID: {section.properties[propName]}</span
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
                  <p class="text-center py-2 text-gray-500">
                    Gallery selector - not implemented yet
                  </p>
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
          <SectionPreview
            {section}
            onRefresh={() => {
              // Refresh rich text content if needed
              if (
                section.type === 'text' ||
                section.type === 'text_image_left' ||
                section.type === 'text_image_right'
              ) {
                const editor = editors['content'];
                if (editor) {
                  const content = editor.getContent();
                  updateProperty('content', content);
                }
              }
            }}
          />
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
  </div>
</div>

<style>
  .section-editor {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .sections-container {
    flex: 1;
    overflow-y: auto;
  }

  /* Make sure the preview properly displays formatted content */
  :global(.preview-content h1) {
    font-size: 2rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.preview-content h2) {
    font-size: 1.5rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.preview-content h3) {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.preview-content h4) {
    font-size: 1rem;
    font-weight: bold;
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  :global(.preview-content blockquote) {
    border-left: 4px solid #ccc;
    padding-left: 1rem;
    font-style: italic;
    margin: 1rem 0;
  }

  :global(.preview-content ul),
  :global(.preview-content ol) {
    padding-left: 2rem;
    margin: 1rem 0;
  }

  :global(.preview-content ul) {
    list-style-type: disc;
  }

  :global(.preview-content ol) {
    list-style-type: decimal;
  }

  :global(.preview-content strong, .preview-content b) {
    font-weight: bold;
  }

  :global(.preview-content em, .preview-content i) {
    font-style: italic;
  }

  :global(.preview-content u) {
    text-decoration: underline;
  }

  :global(.preview-content .text-left) {
    text-align: left;
  }

  :global(.preview-content .text-center) {
    text-align: center;
  }

  :global(.preview-content .text-right) {
    text-align: right;
  }

  :global(.preview-content a) {
    color: #0000ee;
    text-decoration: underline;
  }

  :global(.preview-content p) {
    margin-bottom: 0.5rem;
  }
</style>
