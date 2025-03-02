// src/lib/stores/lightbox.js
import { writable } from 'svelte/store';

// Create a store for the lightbox state
export const lightboxStore = writable({
  visible: false,
  images: [],
  currentIndex: 0
});

// Actions to control the lightbox
export function openLightbox(images, startIndex = 0) {
  // Prevent body scrolling when lightbox is open
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }

  lightboxStore.set({
    visible: true,
    images: Array.isArray(images) ? images : [images],
    currentIndex: startIndex
  });
}

export function closeLightbox() {
  // Restore body scrolling
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }

  lightboxStore.update((state) => ({
    ...state,
    visible: false
  }));
}

export function nextImage() {
  lightboxStore.update((state) => {
    if (state.currentIndex < state.images.length - 1) {
      return {
        ...state,
        currentIndex: state.currentIndex + 1
      };
    }
    return state;
  });
}

export function prevImage() {
  lightboxStore.update((state) => {
    if (state.currentIndex > 0) {
      return {
        ...state,
        currentIndex: state.currentIndex - 1
      };
    }
    return state;
  });
}
