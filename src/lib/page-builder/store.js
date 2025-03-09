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
    error: null,
    selectedSectionId: null,
    previewMode: false
  };

  const { subscribe, set, update } = writable(initialState);

  // Clear the current page and reset to initial state
  const clearPage = () => {
    set(initialState);
  };

  // Load a page by ID
  const loadPage = async (pageId) => {
    update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/admin/pages/${pageId}`);

      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.statusText}`);
      }

      const data = await response.json();

      update((state) => ({
        ...state,
        pageId: data.page.id,
        pageName: data.page.name,
        pageSlug: data.page.slug,
        sections: data.page.sections || [],
        isLoading: false,
        isDirty: false
      }));

      return data.page;
    } catch (error) {
      console.error('Error loading page:', error);

      update((state) => ({
        ...state,
        error: error.message,
        isLoading: false
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

    if (!state.pageId || !state.pageName) return null;

    update((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const pageData = {
        id: state.pageId,
        name: state.pageName,
        slug: state.pageSlug,
        sections: state.sections
      };

      const response = await fetch(`/api/admin/pages/${state.pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: pageData })
      });

      if (!response.ok) {
        throw new Error(`Failed to save page: ${response.statusText}`);
      }

      const data = await response.json();

      update((s) => ({
        ...s,
        isDirty: false,
        isLoading: false
      }));

      return data.page;
    } catch (error) {
      console.error('Error saving page:', error);

      update((s) => ({
        ...s,
        error: error.message,
        isLoading: false
      }));

      return null;
    }
  };

  // Create a new page
  const createPage = async (name, slug) => {
    update((state) => ({ ...state, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          slug,
          sections: []
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create page: ${response.statusText}`);
      }

      const data = await response.json();

      update((state) => ({
        ...state,
        pageId: data.page.id,
        pageName: data.page.name,
        pageSlug: data.page.slug,
        sections: data.page.sections || [],
        isLoading: false,
        isDirty: false
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
      const sections = state.sections.filter((section) => section.id !== sectionId);
      return {
        ...state,
        sections,
        selectedSectionId: sections.length > 0 ? sections[0].id : null,
        isDirty: true
      };
    });
  };

  // Update a section
  const updateSection = (sectionId, properties) => {
    update((state) => {
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
        isDirty: true
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
    togglePreview
  };
};

export const pageBuilderStore = createPageBuilderStore();
