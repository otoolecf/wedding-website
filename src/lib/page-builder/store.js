// src/lib/page-builder/store.js
import { writable } from 'svelte/store';
import { createSection } from './schema';

// Store to manage the current page being edited
export const createPageBuilderStore = () => {
  // Initial state
  const initialState = {
    pageId: null,
    pageName: '',
    pageSlug: '',
    sections: [],
    isDirty: false,
    isLoading: false,
    isSaving: false,
    error: null,
    selectedSectionId: null,
    previewMode: false,
    lastSaved: null,
    debugInfo: {} // For debugging purposes
  };

  const { subscribe, set, update } = writable(initialState);

  // Clear the current page and reset to initial state
  const clearPage = () => {
    set(initialState);
  };

  // Load a page by ID
  const loadPage = async (pageId) => {
    if (!pageId) {
      console.error('Cannot load page: No pageId provided');
      update((state) => ({
        ...state,
        error: 'Cannot load page: Missing page ID'
      }));
      return null;
    }

    update((state) => ({
      ...state,
      isLoading: true,
      error: null,
      debugInfo: { ...state.debugInfo, loadStarted: new Date().toISOString(), pageId }
    }));

    try {
      console.log(`Loading page: ${pageId}`);
      const response = await fetch(`/api/admin/pages/${pageId}`);

      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Page loaded successfully:', data.page);

      update((state) => ({
        ...state,
        pageId: data.page.id,
        pageName: data.page.name,
        pageSlug: data.page.slug,
        sections: data.page.sections || [],
        isLoading: false,
        isDirty: false,
        lastSaved: data.page.lastModified || null,
        debugInfo: {
          ...state.debugInfo,
          loadCompleted: new Date().toISOString(),
          pageData: {
            id: data.page.id,
            name: data.page.name,
            slug: data.page.slug,
            sectionCount: (data.page.sections || []).length
          }
        }
      }));

      return data.page;
    } catch (error) {
      console.error('Error loading page:', error);

      update((state) => ({
        ...state,
        error: error.message,
        isLoading: false,
        debugInfo: {
          ...state.debugInfo,
          loadError: error.message,
          errorTimestamp: new Date().toISOString()
        }
      }));

      return null;
    }
  };

  // Save the current page
  const savePage = async () => {
    let state;
    subscribe((s) => {
      state = s;
    })();

    if (!state.pageId || !state.pageName) {
      console.error('Cannot save page: Missing required fields');
      update((s) => ({
        ...s,
        error: 'Cannot save page: Missing required fields',
        debugInfo: {
          ...s.debugInfo,
          saveError: 'Missing required fields',
          errorTimestamp: new Date().toISOString()
        }
      }));
      return null;
    }

    update((s) => ({
      ...s,
      isLoading: true,
      isSaving: true,
      error: null,
      debugInfo: {
        ...s.debugInfo,
        saveStarted: new Date().toISOString(),
        savingPageId: s.pageId
      }
    }));

    try {
      console.log(`Saving page: ${state.pageId}`);
      const pageData = {
        id: state.pageId,
        name: state.pageName,
        slug: state.pageSlug,
        sections: state.sections
      };

      console.log('Save payload:', JSON.stringify(pageData).substring(0, 200) + '...');

      const response = await fetch(`/api/admin/pages/${state.pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: pageData })
      });

      const responseText = await response.text();
      console.log(
        `Save response status: ${response.status}, text: ${responseText.substring(0, 200)}...`
      );

      if (!response.ok) {
        throw new Error(`Failed to save page: ${response.status} ${response.statusText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('ERROR: ', e);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }

      // To address potential read-after-write consistency issues with KV,
      // we'll update our local state with what we just saved
      update((s) => ({
        ...s,
        isDirty: false,
        isLoading: false,
        isSaving: false,
        lastSaved: new Date().toISOString(),
        debugInfo: {
          ...s.debugInfo,
          saveCompleted: new Date().toISOString(),
          saveResponseStatus: response.status,
          saveResponseData: data
            ? {
                message: data.message,
                hasPage: !!data.page
              }
            : null
        }
      }));

      console.log('Page saved successfully!');
      return data.page;
    } catch (error) {
      console.error('Error saving page:', error);

      update((s) => ({
        ...s,
        error: error.message,
        isLoading: false,
        isSaving: false,
        debugInfo: {
          ...s.debugInfo,
          saveError: error.message,
          errorTimestamp: new Date().toISOString()
        }
      }));

      return null;
    }
  };

  // Create a new page
  const createPage = async (name, slug) => {
    update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      console.log(`Creating new page: ${name}, slug: ${slug}`);
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          slug,
          sections: [],
          order: 999 // Default to end of list
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create page: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Page created successfully:', data.page);

      update((state) => ({
        ...state,
        pageId: data.page.id,
        pageName: data.page.name,
        pageSlug: data.page.slug,
        sections: data.page.sections || [],
        isLoading: false,
        isDirty: false,
        lastSaved: data.page.created || new Date().toISOString()
      }));

      return data.page;
    } catch (error) {
      console.error('Error creating page:', error);

      update((state) => ({
        ...state,
        error: error.message,
        isLoading: false
      }));

      return null;
    }
  };

  // Section management functions

  // Add a new section
  const addSection = (sectionType, index = -1) => {
    update((state) => {
      console.log(`Adding new section of type: ${sectionType} at index: ${index}`);
      const newSection = createSection(sectionType);
      const sections = [...state.sections];

      if (index === -1) {
        // Add to the end
        sections.push(newSection);
      } else {
        // Add at specified index
        sections.splice(index, 0, newSection);
      }

      return {
        ...state,
        sections,
        selectedSectionId: newSection.id,
        isDirty: true
      };
    });
  };

  // Remove a section
  const removeSection = (sectionId) => {
    update((state) => {
      console.log(`Removing section: ${sectionId}`);
      const sections = state.sections.filter((section) => section.id !== sectionId);
      return {
        ...state,
        sections,
        selectedSectionId: sections.length > 0 ? sections[0].id : null,
        isDirty: true
      };
    });
  };

  // Update a section with enhanced error handling and logging
  const updateSection = (sectionId, properties) => {
    if (!sectionId) {
      console.error('Cannot update section: Missing section ID');
      return;
    }

    update((state) => {
      console.log(`Updating section ${sectionId} with properties:`, Object.keys(properties));

      // Find the section first
      const sectionIndex = state.sections.findIndex((section) => section.id === sectionId);
      if (sectionIndex === -1) {
        console.error(`Section not found: ${sectionId}`);
        return {
          ...state,
          error: `Section not found: ${sectionId}`
        };
      }

      // Create updated sections array
      const sections = state.sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            properties: {
              ...section.properties,
              ...properties
            }
          };
        }
        return section;
      });

      return {
        ...state,
        sections,
        isDirty: true,
        debugInfo: {
          ...state.debugInfo,
          lastUpdatedSection: sectionId,
          lastUpdateTime: new Date().toISOString()
        }
      };
    });
  };

  // Move a section up or down
  const moveSection = (sectionId, direction) => {
    update((state) => {
      const index = state.sections.findIndex((section) => section.id === sectionId);
      if (index === -1) return state;

      const newIndex =
        direction === 'up'
          ? Math.max(0, index - 1)
          : Math.min(state.sections.length - 1, index + 1);
      if (newIndex === index) return state;

      console.log(`Moving section ${sectionId} ${direction} from index ${index} to ${newIndex}`);

      const sections = [...state.sections];
      const section = sections.splice(index, 1)[0];
      sections.splice(newIndex, 0, section);

      return {
        ...state,
        sections,
        isDirty: true
      };
    });
  };

  // Select a section for editing
  const selectSection = (sectionId) => {
    update((state) => ({
      ...state,
      selectedSectionId: sectionId
    }));
  };

  // Toggle preview mode
  const togglePreview = () => {
    update((state) => ({
      ...state,
      previewMode: !state.previewMode,
      selectedSectionId: state.previewMode ? state.selectedSectionId : null
    }));
  };

  // Debug function to diagnose issues
  const diagnose = () => {
    let state;
    subscribe((s) => {
      state = s;
    })();

    const diagnosis = {
      pageId: state.pageId,
      pageName: state.pageName,
      sectionCount: state.sections.length,
      isDirty: state.isDirty,
      isLoading: state.isLoading,
      selectedSectionId: state.selectedSectionId,
      lastSaved: state.lastSaved,
      debugInfo: state.debugInfo,
      timestamp: new Date().toISOString()
    };

    console.log('Page Builder Store Diagnosis:', diagnosis);
    return diagnosis;
  };

  return {
    subscribe,
    clearPage,
    loadPage,
    savePage,
    createPage,
    addSection,
    removeSection,
    updateSection,
    moveSection,
    selectSection,
    togglePreview,
    diagnose,
    // Allow direct state updates for advanced usage
    update
  };
};

export const pageBuilderStore = createPageBuilderStore();
