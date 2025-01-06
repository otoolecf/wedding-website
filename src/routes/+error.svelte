<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center p-4">
  <div class="text-center max-w-xl">
    <h1 class="text-4xl mb-4">Oops!</h1>
    <div class="bg-gray-100 p-4 rounded text-left mb-4">
      <p>Status: {$page.status}</p>
      <p>Error: {$page.error?.message}</p>
      {#if $page.data?.debug}
        <pre class="overflow-auto">
          {JSON.stringify($page.data.debug, null, 2)}
        </pre>
      {/if}
    </div>
    <a href="/" class="text-blue-600 hover:underline">Return Home</a>
  </div>
</div>
