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
      const section = createSection(sectionData.type);
      // Update section data with template data
      Object.assign(section.properties, sectionData.data);
      return section;
    });

    pageBuilderStore.update((state) => {
      // Update sections based on mode
      const updatedSections =
        mode === 'replace' ? newSections : [...state.sections, ...newSections];

      // Update page name if it's empty
      const updatedName = !state.pageName ? template.name : state.pageName;

      return {
        ...state,
        sections: updatedSections,
        pageName: updatedName,
        isDirty: true
      };
    });

    showTemplateSelector = false;
    showConfirmDialog = false;
    templateToApply = null;
  }

  function cancelTemplateApplication() {
    showConfirmDialog = false;
    templateToApply = null;
  }
</script>

<div class="template-selector relative">
  <button
    class="px-3 py-1 border rounded bg-white hover:bg-gray-50 text-sm transition-colors"
    on:click={() => (showTemplateSelector = !showTemplateSelector)}
  >
    {showTemplateSelector ? 'Cancel' : 'Apply Template'}
  </button>

  {#if showTemplateSelector}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-4 w-[600px] max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-medium mb-4">Choose a Template</h3>
        <div class="grid grid-cols-2 gap-4">
          {#each Object.entries(templates) as [key, template]}
            <div class="border rounded-lg p-4 hover:border-primary cursor-pointer">
              <h4 class="font-medium mb-2">{templateNames[key]}</h4>
              <div class="text-sm text-gray-600 mb-4">
                {#each template.sections as section}
                  <div class="py-1">
                    {section.type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                {/each}
              </div>
              <button
                class="w-full px-3 py-2 bg-primary text-white rounded hover:opacity-90 text-sm"
                on:click={() => openTemplateConfirmation(key)}
              >
                Apply Template
              </button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

{#if showConfirmDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 class="text-lg font-medium mb-4">Apply Template</h3>
      <p class="text-gray-600 mb-6">
        This will replace all existing content with the template content. Are you sure you want to
        continue?
      </p>
      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 border rounded hover:bg-gray-50"
          on:click={cancelTemplateApplication}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
          on:click={() => applyTemplate(templateToApply)}
        >
          Apply Template
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .template-selector {
    position: relative;
    display: inline-block;
  }
</style>
