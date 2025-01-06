<script>
  import '../app.css';
  import { page } from '$app/stores';
  export let data;
</script>

{#if !data.isProduction}
  <header class="fixed w-full top-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
    <!-- Your navigation -->
  </header>
{/if}

<main class="{!data.isProduction ? 'mt-16' : ''} min-h-screen">
  <slot />
</main>

{#if !data.isProduction}
  <footer class="bg-gray-50 mt-16">
    <!-- Your footer -->
  </footer>
{/if}
