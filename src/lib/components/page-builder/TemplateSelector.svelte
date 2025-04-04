<!-- src/lib/components/page-builder/TemplateSelector.svelte -->
<script>
  import { pageBuilderStore } from '$lib/page-builder/store';
  import { templates } from '$lib/page-builder/templates';
  import { createSection } from '$lib/page-builder/schema';

  let showTemplateSelector = false;
  let selectedTemplate = null;
  let showConfirmDialog = false;
  let templateToApply = null;

  const templateNames = {
    story: 'Our Story',
    details: 'Wedding Details',
    lodging: 'Accommodations',
    faq: 'FAQ',
    registry: 'Registry'
  };

  function openTemplateConfirmation(templateName) {
    templateToApply = templateName;
    showConfirmDialog = true;
  }

  function applyTemplate(templateName, mode = 'replace') {
    const template = templates[templateName];
    if (!template) return;

    // Create new sections from template
    const newSections = template.sections.map((sectionData, index) => {
      const section = createSection(sectionData.type, index);
      // Update section data with template data
      Object.assign(section.properties, sectionData.data);
      return section;
    });

    if (mode === 'replace') {
      // Replace all sections
      $pageBuilderStore.sections = newSections;
    } else {
      // Append new sections
      $pageBuilderStore.sections = [...$pageBuilderStore.sections, ...newSections];
    }

    // Update page name if it's empty
    if (!$pageBuilderStore.pageName) {
      $pageBuilderStore.pageName = template.name;
    }

    showTemplateSelector = false;
    showConfirmDialog = false;
    templateToApply = null;
  }

  function cancelTemplateApplication() {
    showConfirmDialog = false;
    templateToApply = null;
  }
</script>

<div class="template-selector">
  <button
    class="btn btn-primary mb-4"
    on:click={() => (showTemplateSelector = !showTemplateSelector)}
  >
    {showTemplateSelector ? 'Cancel' : 'Apply Template'}
  </button>

  {#if showTemplateSelector}
    <div class="template-grid">
      {#each Object.entries(templates) as [key, template]}
        <div class="template-card">
          <h3>{templateNames[key]}</h3>
          <div class="template-preview">
            {#each template.sections as section}
              <div class="template-section">
                <span class="section-type">{section.type.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            {/each}
          </div>
          <button class="btn btn-secondary" on:click={() => openTemplateConfirmation(key)}>
            Apply Template
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if showConfirmDialog && templateToApply}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">Apply Template</h3>
        <p class="mb-4">
          How would you like to apply the {templateNames[templateToApply]} template?
        </p>
        <div class="space-y-2">
          <button
            class="w-full p-3 border rounded text-left hover:bg-gray-50"
            on:click={() => applyTemplate(templateToApply, 'append')}
          >
            <div class="font-medium">Add to existing content</div>
            <div class="text-sm text-gray-500">
              Template sections will be added after your current content
            </div>
          </button>
          <button
            class="w-full p-3 border rounded text-left hover:bg-gray-50"
            on:click={() => applyTemplate(templateToApply, 'replace')}
          >
            <div class="font-medium">Replace existing content</div>
            <div class="text-sm text-gray-500">
              This will remove all current sections and replace them with the template
            </div>
          </button>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
            on:click={cancelTemplateApplication}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .template-selector {
    margin-bottom: 1rem;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
  }

  .template-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: center;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .template-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .template-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    color: #1f2937;
  }

  .template-preview {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 120px;
  }

  .template-section {
    background: #f3f4f6;
    padding: 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    color: #4b5563;
  }

  .section-type {
    font-weight: 500;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
    border: none;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .btn-secondary {
    background-color: #e5e7eb;
    color: #1f2937;
    border: none;
  }

  .btn-secondary:hover {
    background-color: #d1d5db;
  }
</style>
