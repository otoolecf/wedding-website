<script>
  import '../app.css';
  import '$lib/styles/theme.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getGoogleFontsUrl } from '$lib/theme/fonts';

  export let data;

  // Extract custom fonts from theme for loading
  let customFontsToLoad = [];
  let customPages = [];

  // Process theme fonts to determine which custom fonts need to be loaded
  function processThemeFonts(theme) {
    if (!theme || !theme.fonts) return [];

    const customFonts = [];
    const systemFonts = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];

    // Helper to extract font family name from a font string with fallbacks
    const extractFontFamily = (fontString) => {
      if (!fontString) return null;
      // Get the primary font name (before any commas)
      const primaryFont = fontString.split(',')[0].trim();
      // If it's not a system font and not already in our list, add it
      if (!systemFonts.includes(primaryFont) && !customFonts.includes(primaryFont)) {
        return primaryFont;
      }
      return null;
    };

    // Check heading font
    const headingFont = extractFontFamily(theme.fonts.heading);
    if (headingFont) customFonts.push(headingFont);

    // Check body font
    const bodyFont = extractFontFamily(theme.fonts.body);
    if (bodyFont) customFonts.push(bodyFont);

    return customFonts;
  }

  // Load custom pages
  async function loadCustomPages() {
    try {
      const response = await fetch('/api/admin/pages');
      if (!response.ok) throw new Error('Failed to load pages');
      const data = await response.json();
      // Split pages into ordered and unordered
      const orderedPages = data.pages.filter((page) => page.order !== undefined);
      const unorderedPages = data.pages.filter((page) => page.order === undefined);

      // Sort ordered pages by order, then combine with unordered pages
      customPages = [...orderedPages.sort((a, b) => a.order - b.order), ...unorderedPages];
    } catch (error) {
      console.error('Error loading custom pages:', error);
    }
  }

  // Apply theme when component mounts
  onMount(async () => {
    if (data.theme) {
      applyTheme(data.theme);
      customFontsToLoad = processThemeFonts(data.theme);
    }
    await loadCustomPages();
  });

  // Function to apply theme to CSS variables
  function applyTheme(theme) {
    if (!theme) return;

    // Apply colors
    if (theme.colors) {
      document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
      document.documentElement.style.setProperty('--color-secondary', theme.colors.secondary);
      document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
      document.documentElement.style.setProperty('--color-text', theme.colors.text);
      document.documentElement.style.setProperty('--color-background', theme.colors.background);
    }

    // Apply fonts
    if (theme.fonts) {
      document.documentElement.style.setProperty('--font-heading', theme.fonts.heading);
      document.documentElement.style.setProperty('--font-body', theme.fonts.body);
    }
  }

  // Create Google Fonts URL for custom fonts
  function getCustomFontsUrl(fontList) {
    if (!fontList || fontList.length === 0) return '';
    const encodedFonts = fontList.map((font) => encodeURIComponent(font).replace(/%20/g, '+'));
    return `https://fonts.googleapis.com/css2?${encodedFonts.map((font) => `family=${font}`).join('&')}&display=swap`;
  }
</script>

<svelte:head>
  <!-- Load built-in Google Fonts for presets -->
  <link href={getGoogleFontsUrl()} rel="stylesheet" />

  <!-- Load any custom fonts detected in the theme -->
  {#if customFontsToLoad.length > 0}
    <link href={getCustomFontsUrl(customFontsToLoad)} rel="stylesheet" />
  {/if}
</svelte:head>

{#if data.isPreview}
  <header class="fixed w-full top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
    <nav class="max-w-4xl mx-auto px-4 py-4">
      <ul class="flex gap-6 justify-center">
        <li><a href="/" class:active={data.pathname === '/'}>Home</a></li>
        <li><a href="/story" class:active={data.pathname === '/story'}>Our Story</a></li>
        <li><a href="/details" class:active={data.pathname === '/details'}>Details</a></li>
        <li><a href="/gallery" class:active={data.pathname === '/gallery'}>Gallery</a></li>
        <li><a href="/rsvp" class:active={data.pathname === '/rsvp'}>RSVP</a></li>
        <li><a href="/lodging" class:active={data.pathname === '/lodging'}>Lodging</a></li>
        <li><a href="/faq" class:active={data.pathname === '/faq'}>FAQ</a></li>
        <li>
          <a href="/admin/pages" class:active={data.pathname.startsWith('/admin/pages')}
            >Page Builder</a
          >
        </li>
        <li><a href="/registry" class:active={data.pathname === '/registry'}>Registry</a></li>
        {#each customPages as page}
          <li>
            <a href="/pages/{page.slug}" class:active={data.pathname === `/pages/${page.slug}`}>
              {page.name}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </header>
{/if}

<main class="{data.isPreview ? 'mt-16' : ''} min-h-screen">
  <slot />
</main>

{#if data.isPreview}
  <footer class="bg-accent mt-16">
    <div class="max-w-4xl mx-auto px-4 py-8 text-center">
      <p>© {new Date().getFullYear()} Connor & Colette's Wedding</p>
    </div>
  </footer>
{/if}
