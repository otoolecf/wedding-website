<!-- src/routes/admin/theme/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { themePresets, presetList, getPreset } from '$lib/theme/presets';

  // Theme state
  let theme = {
    colors: {
      primary: '#000000', // Default black
      secondary: '#666666', // Default gray
      accent: '#f3f4f6', // Default light gray
      text: '#333333', // Default text color
      background: '#ffffff' // Default background
    },
    fonts: {
      heading: 'sans-serif',
      body: 'sans-serif'
    }
  };

  // Font options for dropdown
  const fontOptions = [
    'sans-serif',
    'serif',
    'monospace',
    'Playfair Display, serif',
    'Montserrat, sans-serif',
    'Lato, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Cinzel, serif',
    'Cormorant Garamond, serif'
  ];

  let status = '';
  let error = null;
  let saving = false;
  let preview = false;
  let selectedPresetId = '';
  let activeTab = 'presets'; // 'presets' or 'custom'

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/theme');
      if (response.ok) {
        const data = await response.json();
        theme = data.theme;
      }
    } catch (err) {
      error = "Couldn't load theme settings";
      console.error(err);
    }
  });

  async function saveTheme() {
    saving = true;
    error = null;
    status = '';

    try {
      const response = await fetch('/api/admin/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ theme })
      });

      if (response.ok) {
        status = 'Theme saved successfully!';
      } else {
        throw new Error('Failed to save theme settings');
      }
    } catch (err) {
      error = err.message;
      console.error(err);
    } finally {
      saving = false;

      // Reset status message after 3 seconds
      if (status) {
        setTimeout(() => {
          status = '';
        }, 3000);
      }
    }
  }

  function updateColorPreview() {
    preview = true;
    document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
    document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
    document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
    document.documentElement.style.setProperty('--color-text', theme.colors.text);
    document.documentElement.style.setProperty('--color-background', theme.colors.background);
    document.documentElement.style.setProperty('--font-heading', theme.fonts.heading);
    document.documentElement.style.setProperty('--font-body', theme.fonts.body);
  }

  function cancelPreview() {
    preview = false;
    // Reset to original styles from CSS variables
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--color-secondary');
    document.documentElement.style.removeProperty('--color-accent');
    document.documentElement.style.removeProperty('--color-text');
    document.documentElement.style.removeProperty('--color-background');
    document.documentElement.style.removeProperty('--font-heading');
    document.documentElement.style.removeProperty('--font-body');
  }

  function resetTheme() {
    theme = {
      colors: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#f3f4f6',
        text: '#333333',
        background: '#ffffff'
      },
      fonts: {
        heading: 'sans-serif',
        body: 'sans-serif'
      }
    };
    selectedPresetId = '';
    cancelPreview();
  }

  function applyPreset(presetId) {
    const preset = getPreset(presetId);
    if (preset) {
      selectedPresetId = presetId;
      theme = {
        colors: { ...preset.colors },
        fonts: { ...preset.fonts }
      };

      if (preview) {
        updateColorPreview();
      }
    }
  }

  function getPresetColorBoxes(presetId) {
    const preset = getPreset(presetId);
    return preset.colors;
  }
</script>

<svelte:head>
  {#if preview}
    <!-- Add Google Fonts needed for preview -->
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cormorant+Garamond&family=Lato&family=Montserrat&family=Open+Sans&family=Playfair+Display&family=Roboto&display=swap"
      rel="stylesheet"
    />
  {/if}
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-light">Theme Settings</h1>
    <div class="space-x-2">
      <button
        on:click={resetTheme}
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
      >
        Reset
      </button>
      {#if preview}
        <button
          on:click={cancelPreview}
          class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel Preview
        </button>
      {:else}
        <button
          on:click={updateColorPreview}
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Preview
        </button>
      {/if}
      <button
        on:click={saveTheme}
        class="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
        disabled={saving}
      >
        {#if saving}
          Saving...
        {:else}
          Save Theme
        {/if}
      </button>
    </div>
  </div>

  {#if status}
    <div class="bg-green-50 text-green-600 p-4 rounded mb-6">
      {status}
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 text-red-600 p-4 rounded mb-6">
      {error}
    </div>
  {/if}

  <!-- Tab Navigation -->
  <div class="mb-6 border-b">
    <div class="flex">
      <button
        class="py-2 px-4 border-b-2 {activeTab === 'presets'
          ? 'border-primary font-medium'
          : 'border-transparent'}"
        on:click={() => (activeTab = 'presets')}
      >
        Theme Presets
      </button>
      <button
        class="py-2 px-4 border-b-2 {activeTab === 'custom'
          ? 'border-primary font-medium'
          : 'border-transparent'}"
        on:click={() => (activeTab = 'custom')}
      >
        Custom Theme
      </button>
    </div>
  </div>

  {#if activeTab === 'presets'}
    <!-- Preset Themes Section -->
    <div class="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h2 class="text-xl font-medium mb-4">Choose a Preset Theme</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each presetList as preset}
          <div
            class="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow {selectedPresetId ===
            preset.id
              ? 'ring-2 ring-primary'
              : ''}"
            on:click={() => applyPreset(preset.id)}
            on:keydown={(e) => e.key === 'Enter' && applyPreset(preset.id)}
            tabindex="0"
            role="button"
            aria-pressed={selectedPresetId === preset.id}
          >
            <div class="flex justify-between items-center mb-3">
              <h3 class="font-medium">{preset.name}</h3>
              {#if selectedPresetId === preset.id}
                <span class="text-xs bg-primary text-white px-2 py-1 rounded">Selected</span>
              {/if}
            </div>
            <p class="text-sm text-gray-600 mb-3">{preset.description}</p>

            <!-- Color Preview -->
            <div class="flex space-x-2 mb-2">
              {#each Object.entries(getPresetColorBoxes(preset.id)) as [key, color]}
                <div
                  class="w-6 h-6 rounded-full border"
                  style="background-color: {color};"
                  title="{key}: {color}"
                ></div>
              {/each}
            </div>

            <!-- Font Preview -->
            <div class="mt-2 text-sm flex flex-col gap-1">
              <div style="font-family: {getPreset(preset.id).fonts.heading}">Heading Font</div>
              <div style="font-family: {getPreset(preset.id).fonts.body}">Body text sample</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Color Settings -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-medium mb-4">Colors</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 mb-2" for="primary">Primary Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                id="primary"
                bind:value={theme.colors.primary}
                class="p-0 h-8 w-16 border rounded"
              />
              <input
                type="text"
                bind:value={theme.colors.primary}
                class="flex-1 p-2 border rounded"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Used for buttons, accents, and important elements
            </p>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" for="secondary">Secondary Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                id="secondary"
                bind:value={theme.colors.secondary}
                class="p-0 h-8 w-16 border rounded"
              />
              <input
                type="text"
                bind:value={theme.colors.secondary}
                class="flex-1 p-2 border rounded"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Used for secondary elements and highlights</p>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" for="accent">Accent Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                id="accent"
                bind:value={theme.colors.accent}
                class="p-0 h-8 w-16 border rounded"
              />
              <input
                type="text"
                bind:value={theme.colors.accent}
                class="flex-1 p-2 border rounded"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Used for subtle backgrounds and decorative elements
            </p>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" for="text">Text Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                id="text"
                bind:value={theme.colors.text}
                class="p-0 h-8 w-16 border rounded"
              />
              <input type="text" bind:value={theme.colors.text} class="flex-1 p-2 border rounded" />
            </div>
            <p class="text-xs text-gray-500 mt-1">Used for main text content</p>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" for="background">Background Color</label>
            <div class="flex items-center space-x-2">
              <input
                type="color"
                id="background"
                bind:value={theme.colors.background}
                class="p-0 h-8 w-16 border rounded"
              />
              <input
                type="text"
                bind:value={theme.colors.background}
                class="flex-1 p-2 border rounded"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Main background color of the site</p>
          </div>
        </div>
      </div>

      <!-- Typography Settings -->
      <div class="bg-white p-6 rounded-lg shadow-sm">
        <h2 class="text-xl font-medium mb-4">Typography</h2>

        <div class="space-y-6">
          <div>
            <label class="block text-gray-700 mb-2" for="heading-font">Heading Font</label>
            <select
              id="heading-font"
              bind:value={theme.fonts.heading}
              class="w-full p-2 border rounded"
            >
              {#each fontOptions as font}
                <option value={font} style="font-family: {font}">
                  {font}
                </option>
              {/each}
            </select>
            <div class="mt-3 p-3 border rounded bg-gray-50">
              <p class="text-xl" style="font-family: {theme.fonts.heading}">
                This is a heading preview
              </p>
            </div>
          </div>

          <div>
            <label class="block text-gray-700 mb-2" for="body-font">Body Font</label>
            <select id="body-font" bind:value={theme.fonts.body} class="w-full p-2 border rounded">
              {#each fontOptions as font}
                <option value={font} style="font-family: {font}">
                  {font}
                </option>
              {/each}
            </select>
            <div class="mt-3 p-3 border rounded bg-gray-50">
              <p style="font-family: {theme.fonts.body}">
                This is a body text preview. The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Preview Section -->
  <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
    <h2 class="text-xl font-medium mb-4">Live Preview</h2>

    <div
      class="border rounded p-6"
      style="font-family: {theme.fonts.body}; color: {theme.colors.text}; background-color: {theme
        .colors.background};"
    >
      <h1
        style="font-family: {theme.fonts.heading}; color: {theme.colors
          .primary}; font-size: 2rem; margin-bottom: 1rem;"
      >
        Connor & Colette
      </h1>

      <p style="margin-bottom: 1.5rem;">
        Join us for our special day on April 18, 2026. We can't wait to celebrate with you!
      </p>

      <div class="flex space-x-4">
        <button
          style="background-color: {theme.colors
            .primary}; color: white; padding: 0.5rem 1rem; border-radius: 9999px;"
        >
          RSVP Now
        </button>
        <button
          style="background-color: {theme.colors.background}; color: {theme.colors
            .primary}; border: 1px solid {theme.colors
            .primary}; padding: 0.5rem 1rem; border-radius: 9999px;"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
</div>
