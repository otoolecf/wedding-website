<script>
  import { onMount } from 'svelte';

  // Props
  export let value = ''; // The current font value
  export let onChange = null; // Callback when the font changes
  export let label = 'Custom Font';
  export let id = 'custom-font';
  export let placeholder = 'E.g., Josefin Sans, sans-serif';

  // Local state
  let inputValue = '';
  let isCustomFont = false;
  let fontLoaded = false;
  let fontLoadError = false;

  // Set initial state based on passed value
  onMount(() => {
    // Check if current value is a custom font not in the dropdown
    if (value.includes(',')) {
      inputValue = value;
      isCustomFont = true;
    }
  });

  // Function to load a Google Font dynamically
  async function loadGoogleFont(fontName) {
    try {
      // Don't load system fonts or already loaded fonts
      if (
        ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(fontName) ||
        document.fonts.check(`1em "${fontName}"`)
      ) {
        fontLoaded = true;
        return true;
      }

      // Clean the font name for use in a Google Fonts URL
      const cleanFontName = fontName.trim().split(',')[0].trim().replace(/ /g, '+');

      // Create a link element for the Google Font
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${cleanFontName}&display=swap`;
      link.rel = 'stylesheet';

      // Create a promise that resolves when the font loads or rejects on error
      const loadPromise = new Promise((resolve, reject) => {
        link.onload = () => resolve(true);
        link.onerror = () => reject(new Error(`Failed to load font: ${fontName}`));

        // Set a timeout in case the font takes too long to load
        setTimeout(() => reject(new Error('Font loading timed out')), 5000);
      });

      // Add the link to the document head
      document.head.appendChild(link);

      // Wait for the font to load
      await loadPromise;
      fontLoaded = true;
      fontLoadError = false;
      return true;
    } catch (error) {
      console.error('Error loading font:', error);
      fontLoadError = true;
      fontLoaded = false;
      return false;
    }
  }

  // Function to handle applying the custom font
  async function applyCustomFont() {
    if (!inputValue) return;

    const fontName = inputValue.split(',')[0].trim();
    // Try to load the font
    const success = await loadGoogleFont(fontName);

    if (success || ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(fontName)) {
      // Update the parent component with the new font value
      if (onChange) onChange(inputValue);
      value = inputValue;
    }
  }

  // Function to toggle between custom and preset fonts
  function toggleCustomFont() {
    isCustomFont = !isCustomFont;
    if (!isCustomFont) {
      // Reset to the original value when going back to presets
      if (onChange) onChange(value);
    }
  }
</script>

<div>
  <div class="flex items-center justify-between mb-2">
    <label for={id} class="block text-gray-700">{label}</label>
    <button
      type="button"
      class="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
      on:click={toggleCustomFont}
    >
      {isCustomFont ? 'Use Presets' : 'Use Custom Font'}
    </button>
  </div>

  {#if isCustomFont}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <input
          type="text"
          {id}
          bind:value={inputValue}
          {placeholder}
          class="flex-1 p-2 border rounded"
        />
        <button
          type="button"
          class="px-3 py-2 bg-primary text-white rounded hover:opacity-90 transition-opacity"
          on:click={applyCustomFont}
        >
          Apply
        </button>
      </div>

      {#if fontLoadError}
        <p class="text-xs text-red-500">
          Could not load this font. Make sure it's a valid Google Font name or web safe font.
        </p>
      {/if}

      <div class="text-xs text-gray-500 mt-1">
        <p>Tips:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>
            Browse <a
              href="https://fonts.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="underline">Google Fonts</a
            > to find fonts
          </li>
          <li>Copy the font name exactly as shown (e.g., "Roboto Slab")</li>
          <li>Add fallbacks after a comma (e.g., "Roboto Slab, serif")</li>
        </ul>
      </div>
    </div>
  {/if}
</div>
