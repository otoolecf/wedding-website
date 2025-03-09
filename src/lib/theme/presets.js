// src/lib/theme/presets.js

/**
 * Predefined theme presets for the wedding website
 * Each preset contains complete color and font configurations
 */
export const themePresets = {
  // Classic black and white
  classic: {
    name: 'Classic Elegance',
    description: 'Timeless black and white with elegant serif fonts',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#f3f4f6',
      text: '#333333',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Lato, sans-serif'
    }
  },

  // Modern minimalist
  modern: {
    name: 'Modern Minimalist',
    description: 'Clean and minimal with sans-serif typography',
    colors: {
      primary: '#212121',
      secondary: '#757575',
      accent: '#f5f5f5',
      text: '#424242',
      background: '#ffffff'
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif'
    }
  },

  // Romantic blush and gold
  romantic: {
    name: 'Romantic Blush',
    description: 'Soft blush pink with gold accents',
    colors: {
      primary: '#d4a373', // Gold
      secondary: '#e9c2c5', // Blush pink
      accent: '#f8edeb', // Light blush
      text: '#5c4742', // Warm brown
      background: '#fff8f6' // Cream
    },
    fonts: {
      heading: 'Cormorant Garamond, serif',
      body: 'Lato, sans-serif'
    }
  },

  // Garden party
  garden: {
    name: 'Garden Party',
    description: 'Fresh greens with botanical inspiration',
    colors: {
      primary: '#4f772d', // Green
      secondary: '#90a955', // Light green
      accent: '#ecf39e', // Pale yellow
      text: '#31572c', // Dark green
      background: '#fafdf6' // Pale cream
    },
    fonts: {
      heading: 'Cinzel, serif',
      body: 'Roboto, sans-serif'
    }
  },

  // Modern blue
  oceanic: {
    name: 'Oceanic Blue',
    description: 'Serene blues with calming presence',
    colors: {
      primary: '#1d3557', // Deep blue
      secondary: '#457b9d', // Medium blue
      accent: '#f1faee', // Off-white
      text: '#1d3557', // Deep blue
      background: '#ffffff' // White
    },
    fonts: {
      heading: 'Montserrat, sans-serif',
      body: 'Open Sans, sans-serif'
    }
  },

  // Autumn warmth
  autumn: {
    name: 'Autumn Warmth',
    description: 'Warm earthy tones with rustic charm',
    colors: {
      primary: '#9c6644', // Burnt sienna
      secondary: '#bc6c25', // Amber
      accent: '#dda15e', // Light amber
      text: '#606c38', // Olive
      background: '#fefae0' // Cream
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Roboto, sans-serif'
    }
  },

  // Midnight elegance
  midnight: {
    name: 'Midnight Elegance',
    description: 'Dark dramatic theme with gold accents',
    colors: {
      primary: '#d4af37', // Gold
      secondary: '#626262', // Dark gray
      accent: '#1c1c1c', // Very dark gray
      text: '#e6e6e6', // Light gray
      background: '#121212' // Almost black
    },
    fonts: {
      heading: 'Cinzel, serif',
      body: 'Lato, sans-serif'
    }
  }
};

// Export a list of preset names for easier selection
export const presetList = Object.keys(themePresets).map((key) => ({
  id: key,
  name: themePresets[key].name,
  description: themePresets[key].description
}));

// Function to get a preset by ID
export function getPreset(presetId) {
  return themePresets[presetId] || themePresets.classic;
}
