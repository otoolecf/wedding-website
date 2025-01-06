<script>
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Redirecting...</title>
</svelte:head>

{#if $page.error?.message === 'Access denied'}
  <script>
    window.location.href = '/';
  </script>
{:else}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl mb-4">Oops!</h1>
      <p class="text-gray-600">Something went wrong. Please try again.</p>
    </div>
  </div>
{/if}
