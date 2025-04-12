// src/lib/page-builder/schema.js

/**
 * Schema for the page builder
 * This defines all possible section types and their properties
 */

// Section types that can be added to a page
export const SECTION_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  TEXT_IMAGE_LEFT: 'text_image_left',
  TEXT_IMAGE_RIGHT: 'text_image_right',
  HERO: 'hero',
  GALLERY: 'gallery',
  COLUMNS: 'columns',
  SPACER: 'spacer',
  DIVIDER: 'divider',
  BUTTON: 'button'
};

// Schema for each section type
export const SECTION_SCHEMA = {
  [SECTION_TYPES.TEXT]: {
    name: 'Text Section',
    description: 'A simple text section with rich text formatting',
    icon: 'text',
    properties: {
      content: {
        type: 'richtext',
        default: '<p>Enter your text here...</p>'
      }
    }
  },

  [SECTION_TYPES.IMAGE]: {
    name: 'Image Section',
    description: 'A section with a single image',
    icon: 'image',
    properties: {
      imageId: {
        type: 'image',
        default: null
      },
      caption: {
        type: 'text',
        default: ''
      },
      alignment: {
        type: 'select',
        options: ['left', 'center', 'right'],
        default: 'center'
      },
      maxWidth: {
        type: 'select',
        options: ['small', 'medium', 'large', 'full'],
        default: 'medium'
      }
    }
  },

  [SECTION_TYPES.TEXT_IMAGE_LEFT]: {
    name: 'Text with Image (Left)',
    description: 'Text section with an image on the left',
    icon: 'layout-left',
    properties: {
      content: {
        type: 'richtext',
        default: '<p>Enter your text here...</p>'
      },
      imageId: {
        type: 'image',
        default: null
      },
      caption: {
        type: 'text',
        default: ''
      },
      imageWidth: {
        type: 'select',
        options: ['1/4', '1/3', '1/2', '2/3'],
        default: '1/2'
      },
      verticalAlignment: {
        type: 'select',
        options: ['top', 'center', 'bottom'],
        default: 'center'
      }
    }
  },

  [SECTION_TYPES.TEXT_IMAGE_RIGHT]: {
    name: 'Text with Image (Right)',
    description: 'Text section with an image on the right',
    icon: 'layout-right',
    properties: {
      content: {
        type: 'richtext',
        default: '<p>Enter your text here...</p>'
      },
      imageId: {
        type: 'image',
        default: null
      },
      caption: {
        type: 'text',
        default: ''
      },
      imageWidth: {
        type: 'select',
        options: ['1/4', '1/3', '1/2', '2/3'],
        default: '1/2'
      },
      verticalAlignment: {
        type: 'select',
        options: ['top', 'center', 'bottom'],
        default: 'center'
      }
    }
  },

  [SECTION_TYPES.HERO]: {
    name: 'Hero Section',
    description: 'Full-width banner with text overlay',
    icon: 'layout-hero',
    properties: {
      heading: {
        type: 'text',
        default: 'Hero Heading'
      },
      subheading: {
        type: 'text',
        default: 'Subheading text goes here'
      },
      imageId: {
        type: 'image',
        default: null
      },
      textColor: {
        type: 'select',
        options: ['light', 'dark'],
        default: 'light'
      },
      height: {
        type: 'select',
        options: ['small', 'medium', 'large', 'full'],
        default: 'medium'
      },
      textAlignment: {
        type: 'select',
        options: ['left', 'center', 'right'],
        default: 'center'
      },
      buttonText: {
        type: 'text',
        default: ''
      },
      buttonLink: {
        type: 'text',
        default: ''
      }
    }
  },

  [SECTION_TYPES.GALLERY]: {
    name: 'Image Gallery',
    description: 'Grid of images',
    icon: 'grid',
    properties: {
      images: {
        type: 'gallery',
        default: []
      },
      columns: {
        type: 'select',
        options: ['2', '3', '4'],
        default: '3'
      },
      spacing: {
        type: 'select',
        options: ['small', 'medium', 'large'],
        default: 'medium'
      }
    }
  },

  [SECTION_TYPES.COLUMNS]: {
    name: 'Text Columns',
    description: 'Multiple columns of text',
    icon: 'columns',
    properties: {
      columns: {
        type: 'array',
        default: [{ content: '<p>Column 1 content</p>' }, { content: '<p>Column 2 content</p>' }]
      },
      count: {
        type: 'select',
        options: ['2', '3', '4'],
        default: '2'
      },
      spacing: {
        type: 'select',
        options: ['small', 'medium', 'large'],
        default: 'medium'
      }
    }
  },

  [SECTION_TYPES.SPACER]: {
    name: 'Spacer',
    description: 'Add vertical space between sections',
    icon: 'spacer',
    properties: {
      height: {
        type: 'select',
        options: ['small', 'medium', 'large', 'extra-large'],
        default: 'medium'
      }
    }
  },

  [SECTION_TYPES.DIVIDER]: {
    name: 'Divider',
    description: 'Horizontal line divider',
    icon: 'divider',
    properties: {
      style: {
        type: 'select',
        options: ['solid', 'dashed', 'dotted'],
        default: 'solid'
      },
      width: {
        type: 'select',
        options: ['narrow', 'medium', 'wide', 'full'],
        default: 'wide'
      },
      color: {
        type: 'select',
        options: ['light', 'medium', 'dark', 'accent', 'primary'],
        default: 'medium'
      }
    }
  },

  [SECTION_TYPES.BUTTON]: {
    name: 'Button',
    description: 'Call-to-action button',
    icon: 'button',
    properties: {
      text: {
        type: 'text',
        default: 'Click Here'
      },
      link: {
        type: 'text',
        default: '#'
      },
      alignment: {
        type: 'select',
        options: ['left', 'center', 'right'],
        default: 'center'
      },
      style: {
        type: 'select',
        options: ['primary', 'secondary', 'outline'],
        default: 'primary'
      },
      size: {
        type: 'select',
        options: ['small', 'medium', 'large'],
        default: 'medium'
      }
    }
  }
};

// Helper functions for the page builder

// Create a new section with default values
export function createSection(type) {
  if (!SECTION_SCHEMA[type]) {
    throw new Error(`Unknown section type: ${type}`);
  }

  const schema = SECTION_SCHEMA[type];
  const section = {
    id: generateId(),
    type,
    properties: {}
  };

  // Set default values for all properties
  Object.entries(schema.properties).forEach(([key, config]) => {
    section.properties[key] = config.default;
  });

  return section;
}

// Generate a unique ID for a section
function generateId() {
  return 'section_' + Math.random().toString(36).substring(2, 15);
}

// Get a user-friendly name for a section type
export function getSectionTypeName(type) {
  return SECTION_SCHEMA[type]?.name || 'Unknown Section';
}

// Get icon name for a section type
export function getSectionTypeIcon(type) {
  return SECTION_SCHEMA[type]?.icon || 'square';
}

// Get a list of all available section types
export function getAvailableSectionTypes() {
  return Object.entries(SECTION_SCHEMA).map(([type, schema]) => ({
    type,
    name: schema.name,
    description: schema.description,
    icon: schema.icon
  }));
}
