// src/lib/theme/fonts.js
// A comprehensive collection of fonts for the wedding website

/**
 * Font categories with options for the theme management system
 * Each font includes name, fallbacks, and category information
 */
export const fontOptions = {
  // Classic serif fonts
  serifs: [
    { value: 'serif', label: 'System Serif' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Playfair Display, serif', label: 'Playfair Display' },
    { value: 'Cormorant Garamond, serif', label: 'Cormorant Garamond' },
    { value: 'Libre Baskerville, serif', label: 'Libre Baskerville' },
    { value: 'Lora, serif', label: 'Lora' },
    { value: 'Crimson Text, serif', label: 'Crimson Text' },
    { value: 'Baskerville, serif', label: 'Baskerville' },
    { value: 'Bodoni Moda, serif', label: 'Bodoni Moda' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Merriweather, serif', label: 'Merriweather' },
    { value: 'Cinzel, serif', label: 'Cinzel' }
  ],

  // Sans-serif fonts
  sanSerifs: [
    { value: 'sans-serif', label: 'System Sans-Serif' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Work Sans, sans-serif', label: 'Work Sans' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Raleway, sans-serif', label: 'Raleway' },
    { value: 'Nunito, sans-serif', label: 'Nunito' },
    { value: 'Quicksand, sans-serif', label: 'Quicksand' }
  ],

  // Display and decorative fonts
  display: [
    { value: 'Great Vibes, cursive', label: 'Great Vibes' },
    { value: 'Dancing Script, cursive', label: 'Dancing Script' },
    { value: 'Parisienne, cursive', label: 'Parisienne' },
    { value: 'Sacramento, cursive', label: 'Sacramento' },
    { value: 'Tangerine, cursive', label: 'Tangerine' },
    { value: 'Pinyon Script, cursive', label: 'Pinyon Script' },
    { value: 'Petit Formal Script, cursive', label: 'Petit Formal Script' },
    { value: 'Alex Brush, cursive', label: 'Alex Brush' },
    { value: 'Allura, cursive', label: 'Allura' }
  ],

  // Monospaced and special fonts
  other: [
    { value: 'monospace', label: 'System Monospace' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'IBM Plex Mono, monospace', label: 'IBM Plex Mono' }
  ]
};

// Flatten all fonts for simple usage in dropdowns
export const allFonts = [
  ...fontOptions.serifs,
  ...fontOptions.sanSerifs,
  ...fontOptions.display,
  ...fontOptions.other
];

// Get Google Fonts import URL for all used fonts
export function getGoogleFontsUrl() {
  // Create an array of font names that need to be imported from Google Fonts
  // Exclude system fonts and web-safe fonts
  const googleFonts = allFonts
    .filter((font) => {
      const value = font.value.split(',')[0].trim();
      // Exclude system and web-safe fonts
      return ![
        'serif',
        'sans-serif',
        'monospace',
        'Georgia',
        'Arial',
        'Helvetica',
        'Times New Roman',
        'Courier New'
      ].includes(value);
    })
    .map((font) => font.value.split(',')[0].trim().replace(/ /g, '+'));

  // Create the Google Fonts URL with all needed fonts
  return `https://fonts.googleapis.com/css2?${googleFonts.map((font) => `family=${font}`).join('&')}&display=swap`;
}
