<!-- src/routes/+layout.svelte -->
<script>
  import '../app.css';
  import { page } from '$app/stores';

  // Change this line
  const isMainBranch = process.env.BRANCH === 'main' || process.env.BRANCH === 'master';
</script>

{#if !isMainBranch}
  <header class="fixed w-full top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
    <nav class="max-w-4xl mx-auto px-4 py-4">
      <ul class="flex gap-6 justify-center">
        <li><a href="/" class:active={$page.url.pathname === '/'}>Home</a></li>
        <li><a href="/story" class:active={$page.url.pathname === '/story'}>Our Story</a></li>
        <li><a href="/details" class:active={$page.url.pathname === '/details'}>Details</a></li>
        <li><a href="/gallery" class:active={$page.url.pathname === '/gallery'}>Gallery</a></li>
        <li><a href="/rsvp" class:active={$page.url.pathname === '/rsvp'}>RSVP</a></li>
        <li><a href="/registry" class:active={$page.url.pathname === '/registry'}>Registry</a></li>
      </ul>
    </nav>
  </header>
{/if}

<main class="{!isProd ? 'mt-16' : ''} min-h-screen">
  <slot />
</main>

{#if !isProd}
  <footer class="bg-gray-50 mt-16">
    <div class="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
      <p>© {new Date().getFullYear()} Connor & Colette's Wedding</p>
    </div>
  </footer>
{/if}

<style>
  a {
    text-decoration: none;
    color: #666;
    font-weight: 500;
    transition: color 0.2s;
  }

  a:hover {
    color: #333;
  }

  a.active {
    color: #000;
  }

  @media (max-width: 640px) {
    nav ul {
      gap: 1rem;
      font-size: 0.9rem;
    }
  }
</style>
