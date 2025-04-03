<!-- src/lib/components/page-builder/TemplateSelector.svelte -->
<script>
  import { pageBuilderStore } from '$lib/page-builder/store';
  import { templates } from '$lib/page-builder/templates';
  import { createSection } from '$lib/page-builder/schema';

  let showTemplateSelector = false;
  let selectedTemplate = null;

  function applyTemplate(templateName) {
    const template = templates[templateName];
    if (!template) return;

    // Clear existing sections
    $pageBuilderStore.sections = [];

    // Add sections from template
    template.sections.forEach((sectionData, index) => {
      const section = createSection(sectionData.type, index);
      // Update section data with template data
      Object.assign(section.data, sectionData.data);
      $pageBuilderStore.sections.push(section);
    });

    // Update page name if it's empty
    if (!$pageBuilderStore.pageName) {
      $pageBuilderStore.pageName = template.name;
    }

    showTemplateSelector = false;
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
      {#each Object.entries(templates) as [key, templateName]}
        <div class="template-card">
          <h3>{templateName}</h3>
          <div class="template-preview">
            {#each templates[key].sections as section}
              <div class="template-section">
                <span class="section-type">{section.type}</span>
              </div>
            {/each}
          </div>
          <button class="btn btn-secondary" on:click={() => applyTemplate(key)}>
            Apply Template
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .template-selector {
    margin-bottom: 1rem;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .template-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
  }

  .template-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }

  .template-preview {
    margin: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
</style>
