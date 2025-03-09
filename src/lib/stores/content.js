// src/lib/stores/content.js
import { writable } from 'svelte/store';

// Create a content store to cache content sections
const createContentStore = () => {
  const { subscribe, update } = writable({
    sections: {},
    loading: false,
    error: null
  });

  // Fetch a single content section by key
  const fetchSection = async (key) => {
    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const response = await fetch(`/api/content?key=${key}`);

      if (!response.ok) {
        throw new Error(`Failed to load content section: ${key}`);
      }

      const data = await response.json();

      update((state) => ({
        ...state,
        sections: {
          ...state.sections,
          [key]: data.section
        },
        loading: false
      }));

      return data.section;
    } catch (error) {
      console.error(`Error fetching content section ${key}:`, error);

      update((state) => ({
        ...state,
        error: error.message,
        loading: false
      }));

      return null;
    }
  };

  // Fetch all content sections
  const fetchAllSections = async () => {
    update((state) => ({ ...state, loading: true, error: null }));

    try {
      const response = await fetch('/api/content');

      if (!response.ok) {
        throw new Error('Failed to load content sections');
      }

      const data = await response.json();

      // Convert array to object with keys
      const sectionsObj = {};
      data.sections.forEach((section) => {
        sectionsObj[section.key] = section;
      });

      update((state) => ({
        ...state,
        sections: sectionsObj,
        loading: false
      }));

      return sectionsObj;
    } catch (error) {
      console.error('Error fetching all content sections:', error);

      update((state) => ({
        ...state,
        error: error.message,
        loading: false
      }));

      return {};
    }
  };

  // Get a section from the store, fetching it if not already cached
  const getSection = async (key) => {
    let state;
    subscribe((s) => {
      state = s;
    })();

    // If already loaded and available, return it
    if (state.sections[key]) {
      return state.sections[key];
    }

    // Otherwise fetch it
    return await fetchSection(key);
  };

  return {
    subscribe,
    fetchSection,
    fetchAllSections,
    getSection
  };
};

export const contentStore = createContentStore();
