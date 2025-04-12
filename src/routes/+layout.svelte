<script>
  import '../app.css';
  import '$lib/styles/theme.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getGoogleFontsUrl } from '$lib/theme/fonts';

  export let data;

  // Extract custom fonts from theme for loading
  let customFontsToLoad = [];
  let allPages = [];

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
      // Load custom pages
      const pagesResponse = await fetch('/api/admin/pages');
      if (!pagesResponse.ok) throw new Error('Failed to load custom pages');
      const pagesData = await pagesResponse.json();
      const customPages = pagesData.pages.sort((a, b) => a.order - b.order);

      // Get default pages from settings
      const defaultPages = data.settings.defaultPages.sort((a, b) => a.order - b.order);

      // Combine and sort all pages
      allPages = [...defaultPages, ...customPages].sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error loading pages:', error);
      // If there's an error, use the default pages from settings
      allPages = data.settings.defaultPages.sort((a, b) => a.order - b.order);
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

    // Update favicon if it exists in theme
    if (theme.favicon?.url) {
      const faviconElement = document.getElementById('dynamic-favicon');
      if (faviconElement) {
        faviconElement.href = theme.favicon.url;
      }
    }
  }

  // Create Google Fonts URL for custom fonts
  function getCustomFontsUrl(fontList) {
    if (!fontList || fontList.length === 0) return '';
    const encodedFonts = fontList.map((font) => encodeURIComponent(font).replace(/%20/g, '+'));
    return `https://fonts.googleapis.com/css2?${encodedFonts.map((font) => `family=${font}`).join('&')}&display=swap`;
  }

  // Compute couple names based on order preference
  $: coupleNames =
    data.settings.nameOrder === 'groom-first'
      ? `${data.settings.groomName} & ${data.settings.brideName}`
      : `${data.settings.brideName} & ${data.settings.groomName}`;

  // Check if site is restricted to home page only
  $: isRestricted = data.settings?.restrictToHomePage;
</script>

<svelte:head>
  <!-- Load built-in Google Fonts for presets -->
  <link href={getGoogleFontsUrl()} rel="stylesheet" />

  <!-- Load any custom fonts detected in the theme -->
  {#if customFontsToLoad.length > 0}
    <link href={getCustomFontsUrl(customFontsToLoad)} rel="stylesheet" />
  {/if}
</svelte:head>

<header class="fixed w-full top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
  {#if !isRestricted}
    <nav class="max-w-4xl mx-auto px-4 py-4">
      <ul class="flex gap-6 justify-center">
        {#each allPages as page}
          <li>
            <a
              href={page.slug
                ? page.id.startsWith('page_')
                  ? `/pages/${page.slug}`
                  : `/${page.slug}`
                : '/'}
              class:active={data.pathname ===
                (page.slug
                  ? page.id.startsWith('page_')
                    ? `/pages/${page.slug}`
                    : `/${page.slug}`
                  : '/')}
            >
              {page.name}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {:else}
    <div class="h-16"></div>
  {/if}
</header>

<main class="mt-16 min-h-screen">
  <slot />
</main>

{#if data.isPreview}
  <footer class="bg-accent mt-16">
    <div class="max-w-4xl mx-auto px-4 py-8 text-center">
      <p>© {new Date().getFullYear()} {coupleNames}'s Wedding</p>
      <div class="mt-2 text-xs text-gray-500 flex justify-center gap-4">
        <a href="/admin" class="hover:text-gray-700">Admin</a>
        <a href="/about" class="hover:text-gray-700">About</a>
        <a
          href="https://github.com/otoolecf/wedding-website"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:text-gray-700"
        >
          <svg
            class="w-4 h-4 inline-block mr-1"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            ></path>
          </svg>
          GitHub
        </a>
      </div>
    </div>
  </footer>
{/if}
