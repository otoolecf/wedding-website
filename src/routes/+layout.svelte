<script>
  import '../app.css';
  import '$lib/styles/theme.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let data;

  // Apply theme when component mounts
  onMount(() => {
    applyTheme(data.theme);
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
</script>

<svelte:head>
  <!-- Add Google Fonts -->
  <link
    href="https://fonts.googleapis.com/css2?family=Cinzel&family=Cormorant+Garamond&family=Lato&family=Montserrat&family=Open+Sans&family=Playfair+Display&family=Roboto&display=swap"
    rel="stylesheet"
  />
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
        <li><a href="/registry" class:active={data.pathname === '/registry'}>Registry</a></li>
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
