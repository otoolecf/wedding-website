<script>
  import '../app.css';
  import { page } from '$app/stores';
  export let data;
</script>

{#if data.isPreview}
  <header class="fixed w-full top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
    <nav class="max-w-4xl mx-auto px-4 py-4">
      <ul class="flex gap-6 justify-center">
        <li><a href="/" class:active={data.pathname === '/'}>Home</a></li>
        <li><a href="/story" class:active={data.pathname === '/story'}>Our Story</a></li>
        <li><a href="/details" class:active={data.pathname === '/details'}>Details</a></li>
        <li><a href="/gallery" class:active={data.pathname === '/gallery'}>Gallery</a></li>
        <li><a href="/rsvp" class:active={data.pathname === '/rsvp'}>RSVP</a></li>
        <li><a href="/registry" class:active={data.pathname === '/registry'}>Registry</a></li>
      </ul>
    </nav>
  </header>
{/if}

<main class="{data.isPreview ? 'mt-16' : ''} min-h-screen">
  <slot />
</main>

{#if data.isPreview}
  <footer class="bg-gray-50 mt-16">
    <div class="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
      <p>© {new Date().getFullYear()} Connor & Colette's Wedding</p>
    </div>
  </footer>
{/if}
